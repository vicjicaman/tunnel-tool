import * as WorkerModel from "Model/worker";

const schema = [
  `

  input EndpointInput {
    host: String!
    port: Int!
  }

  input TunnelInput {
    tunnelid: String!
    src: EndpointInput!
    dest: EndpointInput!
  }

  type Endpoint {
    host: String!
    port: Int!
  }

  type TunnelState {
    status: String!
  }

  type Tunnel {
    tunnelid: String!
    src: Endpoint!
    dest: Endpoint!
    state: TunnelState!
  }

  type Worker {
    id: ID
    workerid: String!
    ip: String!
    inlets: [Tunnel]!
    outlets: [Tunnel]!
  }

  type WorkerMutations {
    id: ID
    set (inlets: [TunnelInput], outlets: [TunnelInput]): Worker
  }

`
];

const resolvers = {
  Worker: {},
  WorkerMutations: {
    set: async (worker, input, cxt) => await WorkerModel.set(worker, input, cxt)
  }
};

export { schema, resolvers };
