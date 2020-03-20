import * as ServiceModel from "Model/service";

const schema = [
  `
  type ServiceMutations {
    update(boot: String!, graph: String!, web: String!, worker: String!): Boolean!
  }

`
];

const resolvers = {
  ServiceMutations: {
    update: async (viewer, input, cxt) => await ServiceModel.update(input, cxt)
  }
};

export { schema, resolvers };
