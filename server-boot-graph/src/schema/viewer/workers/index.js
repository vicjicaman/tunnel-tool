import * as WorkerModel from "Model/viewer/workers";

const schema = [
  `
  type LocalWorker {
    id: ID!
    workerid: String!
    ip: String!
  }

  type LocalWorkerQueries {
    worker(workerid: ID!): LocalWorker
  }

  type LocalWorkerMutations {
    worker(workerid: ID!): LocalWorkerEntityMutations!
  }

  type LocalWorkerEntityMutations {
    start: LocalWorker!
    restart: LocalWorker!
    stop: LocalWorker!
  }

`
];

const resolvers = {
  LocalWorker: {},
  LocalWorkerQueries: {
    worker: async (viewer, { workerid }, cxt) =>
      await WorkerModel.get(workerid, cxt)
  },
  LocalWorkerMutations: {
    worker: async (viewer, { workerid }, cxt) =>
      await WorkerModel.get(workerid, cxt)
  },
  LocalWorkerEntityMutations: {
    start: async (worker, args, cxt) => await WorkerModel.start(worker, cxt),
    restart: async (worker, args, cxt) =>
      await WorkerModel.restart(worker, cxt),
    stop: async (worker, args, cxt) => await WorkerModel.stop(worker, cxt)
  }
};

export { schema, resolvers };
