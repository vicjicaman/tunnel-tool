import * as WorkerSchema from "Schema/viewer/worker";
import * as WorkerModel from "Model/worker";

const schema = [
  ...WorkerSchema.schema,
  `
  type Viewer {
    id: ID
    worker: Worker
  }

  type ViewerMutations {
    id: ID
    worker: WorkerMutations
  }

`
];

const resolvers = {
  ...WorkerSchema.resolvers,
  Viewer: {
    worker: async (viewer, params, cxt) => await WorkerModel.get(cxt)
  },
  ViewerMutations: {
    worker: async (viewer, params, cxt) => await WorkerModel.get(cxt)
  }
};

export { schema, resolvers };
