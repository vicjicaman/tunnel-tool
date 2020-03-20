import { request } from "PKG/linker-request";

const WORKER_UPDATE = `mutation GraphWorkerUpdate ($workerid: String!) {
  viewer {
    workers {
      worker (workerid: $workerid) {
        update
      }
    }
  }
}`;

export const update = async (workerid, cxt) => {
  const {
    services: {
      graph: { port }
    }
  } = cxt;

  const url = `http://graph:${port}/graphql`;
  cxt.logger.debug("graph.worker.update", {
    url,
    workerid
  });
  const res = await request(
    url,
    WORKER_UPDATE,
    {
      workerid
    },
    {},
    cxt
  );

  const {
    viewer: {
      workers: { worker }
    }
  } = res;

  if (!worker) {
    return;
  }

  cxt.logger.debug("graph.worker.update.response", { result: worker.update });

  return worker.update;
};
