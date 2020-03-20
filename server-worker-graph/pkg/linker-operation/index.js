import _ from "lodash";
const uuidv4 = require("uuid/v4");
import * as Utils from "@nebulario/tunnel-utils";
export const OPERATION_TABLE = [];
export const OPERATION_INDEX = {};

export const keepWhile = async (tag, fn, cxt) => {
  let i = 0;
  while (fn()) {
    await Utils.Process.wait(10);
    if (i++ > 10000) {
      i = 0;
      cxt.logger.debug(tag, {});
    }
  }
};

export const Status = {
  init: "init",
  running: "running",
  stopping: "stopping",
  stopped: "stopped"
};

function change(status) {
  this.cxt.logger.debug("operation.status", {
    operationid: this.operationid,
    from: this.status,
    to: status
  });
  this.status = status;
}

export const start = async (opid, handler, opts, cxt) => {
  const id = uuidv4();
  const operationid = opid ? opid : id;

  if (OPERATION_INDEX[operationid]) {
    throw new Error("operation.exists", { operationid });
  }
  const op = {
    id,
    operationid,
    handler,
    status: Status.init,
    data: {},
    cxt,
    error: null,
    attempt: 0,
    stopped: false,
    retry: true
  };
  op.change = change.bind(op);

  OPERATION_TABLE.push(op);
  OPERATION_INDEX[operationid] = op;

  (async () => {
    while (op.retry) {
      cxt.logger.debug("operation.start", {
        operationid,
        attempt: op.attempt
      });

      op.retry = false;
      op.attempt = 0;
      op.change(Status.running);

      op.handler
        .start(op, cxt)
        .then(() => {})
        .catch(e => {
          op.error = e;
          cxt.logger.error("operation.start.error", {
            operationid,
            error: e.toString()
          });
        })
        .finally(() => {
          op.change(Status.stopped);
        });

      await keepWhile(
        `operation.wait.${op.operationid}`,
        () => op.status !== Status.stopped,
        cxt
      );

      if (op.handler.stop) {
        try {
          await op.handler.stop(op, cxt);
        } catch (e) {
          cxt.logger.error("operation.stopping.error", {
            operationid,
            error: e.toString()
          });
        }
      }

      if (op.stopped === false && op.handler.retry) {
        cxt.logger.debug("operation.retry.handler", {
          operationid
        });

        const res = await op.handler.retry(op, op.error, op.attempt, cxt);
        if (res === true) {
          op.attempt++;
          op.retry = true;
          op.error = null;
        }
      }
    }
  })()
    .catch(function(e) {
      op.error = e;
      cxt.logger.error("operation.loop.error", {
        operationid,
        error: e.toString()
      });
    })
    .finally(function() {
      cxt.logger.debug("operation.finished", {
        operationid
      });
      OPERATION_INDEX[op.operationid + ":" + op.id + ":archive"] = op;
      delete OPERATION_INDEX[op.operationid];
    });

  return op;
};

export const stop = async (op, { wait = true }, cxt) => {
  op.stopped = true;
  if (!op || op.status === Status.stopped || op.status === Status.stopping) {
    return op;
  }

  cxt.logger.debug("operation.stop", {
    operationid: op.operationid
  });

  if (!op.handler.stop) {
    op.change(Status.stopped);
  } else {
    op.change(Status.stopping);
    const stopPms = op.handler
      .stop(op, cxt)
      .catch(function(e) {
        op.error = e;
        cxt.logger.error("operation.stop.error", {
          operationid: op.operationid,
          error: e.toString()
        });
      })
      .finally(() => {
        op.change(Status.stopped);
      });

    const outStopPms = (async () => {
      await stopPms;
    })();

    if (wait) {
      await outStopPms;
    }
  }

  return op;
};

export const get = (operationid, cxt) => OPERATION_INDEX[operationid] || null;

export const list = ({ status }, cxt) => {
  return _.filter(OPERATION_TABLE, op => {
    if (status) {
      if (status === op.status) {
        return true;
      } else {
        return false;
      }
    }

    return true;
  });
};
