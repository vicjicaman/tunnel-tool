import * as PortSchema from "Schema/viewer/ports";

const schema = [
  ...PortSchema.schema,
  `
  type Viewer {
    id: ID
  }

  type ViewerMutations {
    id: ID
    ports: PortMutations
  }

`
];

const resolvers = {
  ...PortSchema.resolvers,
  Viewer: {},
  ViewerMutations: {
    ports: viewer => viewer
  }
};

export { schema, resolvers };
