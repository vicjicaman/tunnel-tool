import * as HostsModel from "Model/viewer/hosts";

const schema = [
  `

  type LocalHostsEntry {
    id: ID!
    host: String!
    ip: String!
    managed: Boolean!
  }

  type LocalHostsStatus {
    readable: Boolean
    writable: Boolean
  }


  type LocalHostsQueries {
    status: LocalHostsStatus!
    entry(host: String!): LocalHostsEntry
    list: [LocalHostsEntry]
  }

  type LocalHostsMutations {
    add(host: String!, ip: String!): LocalHostsEntry
    entry(host: String!): LocalHostsEntryMutations
  }

  type LocalHostsEntryMutations {
    remove: Boolean!
  }

`
];

const resolvers = {
  LocalHostsQueries: {
    status: async (viewer, args, cxt) => await HostsModel.status(cxt),
    entry: async (viewer, { host }, cxt) => await HostsModel.get(host, cxt),
    list: async (viewer, args, cxt) => await HostsModel.list(args, cxt)
  },
  LocalHostsMutations: {
    add: async (viewer, args, cxt) => await HostsModel.add(args, cxt),
    entry: async (viewer, { host }, cxt) => await HostsModel.get(host, cxt)
  },
  LocalHostsEntryMutations: {
    remove: async (entry, args, cxt) => await HostsModel.remove(entry, cxt)
  }
};

export { schema, resolvers };
