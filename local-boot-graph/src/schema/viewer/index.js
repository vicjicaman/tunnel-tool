import * as HostsSchema from "Schema/viewer/hosts";
import * as ProxySchema from "Schema/viewer/proxy";
import * as WorkersSchema from "Schema/viewer/workers";
import * as ServiceSchema from "Schema/viewer/service";

const schema = [
  ...HostsSchema.schema,
  ...WorkersSchema.schema,
  ...ProxySchema.schema,
  ...ServiceSchema.schema,
  `
  type Viewer {
    id: ID
    hosts: LocalHostsQueries
    workers: LocalWorkerQueries
  }

  type ViewerMutations {
    id: ID
    hosts: LocalHostsMutations
    workers: LocalWorkerMutations
    proxy: LocalProxyMutations
    service: ServiceMutations
  }

`
];

const resolvers = {
  ...HostsSchema.resolvers,
  ...WorkersSchema.resolvers,
  ...ProxySchema.resolvers,
  ...ServiceSchema.resolvers,
  Viewer: {
    hosts: viewer => viewer,
    workers: viewer => viewer
  },
  ViewerMutations: {
    hosts: viewer => viewer,
    workers: viewer => viewer,
    proxy: viewer => viewer,
    service: viewer => viewer
  }
};

export { schema, resolvers };
