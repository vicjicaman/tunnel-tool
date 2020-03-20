import * as ProxyModel from "Model/viewer/proxy";

const schema = [
  `
  type LocalProxyMutations {
    start: String
    stop: String
  }


`
];

const resolvers = {
  LocalProxyMutations: {
    start: async (viewer, {}, cxt) => await ProxyModel.start(cxt),
    stop: async (viewer, {}, cxt) => await ProxyModel.stop(cxt)
  }
};

export { schema, resolvers };
