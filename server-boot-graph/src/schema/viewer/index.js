import * as WorkersSchema from "Schema/viewer/workers";
import * as ServiceSchema from "Schema/viewer/service";

const schema = [
  ...WorkersSchema.schema,
  ...ServiceSchema.schema,
  `
  type Viewer {
    id: ID
    workers: LocalWorkerQueries
  }

  type ViewerMutations {
    id: ID
    workers: LocalWorkerMutations
    service: ServiceMutations
  }

`
];

const resolvers = {
  ...WorkersSchema.resolvers,
  ...ServiceSchema.resolvers,
  Viewer: {
    workers: viewer => viewer
  },
  ViewerMutations: {
    workers: viewer => viewer,
    service: viewer => viewer
  }
};

export { schema, resolvers };
