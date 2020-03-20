import * as PortModel from 'Model/ports'

const schema = [
  `

  type PortMutations {
    stop(port: Int!): Boolean
  }

`
];

const resolvers = {
  PortMutations: {
    stop: async (viewer, { port }, cxt) => await PortModel.stop(port, cxt)
  }
};

export { schema, resolvers };
