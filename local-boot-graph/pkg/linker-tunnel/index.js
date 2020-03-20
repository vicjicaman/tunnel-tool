const uuidv4 = require("uuid/v4");
import _ from "lodash";
import kill from "tree-kill";
import * as OperationUtils from "PKG/linker-operation";

import { spawn } from "child-process-promise";
import * as Utils from "@nebulario/tunnel-utils";

export const listen = async (tunnelid, fwds, opts, cxt) => {
  const { key, user, host, port } = opts;

  return await frame(
    tunnelid,
    "listen",
    [
      "-4",
      "-N",
      "-p",
      port,
      "-oStrictHostKeyChecking=no",
      "-oExitOnForwardFailure=yes",
      ..._.reduce(
        fwds,
        (res, { dest, source }) => {
          res.push(
            "-L",
            `${dest.host}:${dest.port}:${source.host}:${source.port}`
          );
          return res;
        },
        []
      ),
      "-i",
      key,
      `${user}@${host}`
    ],
    cxt
  );
};

export const remote = async (tunnelid, fwds, opts, cxt) => {
  const { key, user, host, port } = opts;

  return await frame(
    tunnelid,
    "remote",
    [
      "-N",
      "-p",
      port,
      "-oStrictHostKeyChecking=no",
      "-oExitOnForwardFailure=yes",
      ..._.reduce(
        fwds,
        (res, { dest, source }) => {
          res.push(
            "-R",
            `${dest.host}:${dest.port}:${source.host}:${source.port}`
          );
          return res;
        },
        []
      ),
      "-i",
      key,
      `${user}@${host}`
    ],
    cxt
  );
};

const frame = async (tunnelid, mode, args, cxt) => {
  const op = await OperationUtils.start(
    tunnelid + "_op",
    {
      start: async (operation, cxt) => {
        cxt.logger.debug("tunnel.start", {
          tunnelid,
          mode,
          args
        });

        operation.data.promise = spawn("ssh", args);

        cxt.logger.debug("tunnel.start.pid", {
          pid: operation.data.promise.childProcess.pid
        });

        await operation.data.promise;
      },
      stop: async (operation, cxt) => {
        const {
          data: {
            promise: {
              childProcess: { pid }
            }
          }
        } = operation;

        cxt.logger.debug("tunnel.stopping", {
          tunnelid,
          pid
        });

        const pkill = new Promise(function(resolve, reject) {
          kill(pid, err => {
            if (err) {
              cxt.logger.error("tunnel.stop.error", {
                error: err.toString(),
                pid
              });
            }

            cxt.logger.debug("tunnel.stopped", {
              tunnelid,
              pid
            });
            operation.change(OperationUtils.Status.stopped);
            resolve(operation);
          });
        });

        await pkill;
        await Utils.Process.wait(500);
      },
      retry: async (operation, error, i, cxt) => {
        cxt.logger.debug("tunnel.retry", {
          error: error ? error.toString() : "NO_ERROR",
          tunnelid,
          attempt: i,
          command: operation.data.command
        });

        if (operation.data.command !== "stop" && i < 5) {
          await Utils.Process.wait(2500);
          cxt.logger.debug("tunnel.recover");
          return true;
        } else {
          cxt.logger.debug("tunnel.giveup");
          return false;
        }
      }
    },
    {},
    cxt
  );

  return { id: tunnelid, tunnelid, operation: op };
};

export const stop = async (tunnel, cxt) => {
  tunnel.operation.data.command = "stop";
  return await OperationUtils.stop(tunnel.operation, {}, cxt);
};

export const forceStop = async (tunnelid, cxt) => {
  const op = await OperationUtils.get(tunnelid + "_op", cxt);
  if (op) {
    cxt.logger.debug("tunnel.force.stop", { tunnelid });
    await OperationUtils.stop(op, {}, cxt);
    await Utils.Process.wait(1000);
  }
  cxt.logger.debug("tunnel.force.none", { tunnelid });
  return null;
};
