import * as DevConfig from "PKG/linker-dev";

export const compose = ({ network: { networkid, localhost } }, cxt) => {
  const {
    workspace,
    mode,
    services: {
      bootstrap: { port: localBootstrapPort },
      graph: { port: localGraphPort, version: graphVersion },
      worker: { version: workerVersion },
      server: { port: sshdPort }
    },
    dev,
    versions
  } = cxt;
  const localWorkspace = cxt.paths.inner.workspace;

  const linkGraph = DevConfig.get("graph.link", cxt);
  const devConfigEnv = `- DEV_CONFIG=${DevConfig.serialize(cxt)}`;

  return `version: '3'
services:
  graph:
    image: repoflow/tunnel-server-graph-container:${DevConfig.get(
      "graph.version",
      cxt
    ) || graphVersion}
    environment:
      - LOCAL_WORKER_EXTERNAL_BASE_SSHD_PORT=${sshdPort}
      - LOCAL_VERSIONS=${JSON.stringify(versions)}
      - LOCALHOST=${localhost}
      - NODE_ENV=${DevConfig.get("graph.mode", cxt) || cxt.mode}
      - ENV_MODE=${DevConfig.get("graph.mode", cxt) || cxt.mode}
      - LOCAL_HANDLER_GRAPH_PORT=${localGraphPort}
      - LOCAL_WORKSPACE=${localWorkspace}
      - LOCAL_NETWORK=${networkid}
      - LOCAL_WORKER_VERSION=${workerVersion}
      - BOOTSTRAP_WORKSPACE=${cxt.workspace}
      - BOOTSTRAP_GRAPH_URL=http://boot.graph:${localBootstrapPort}/graphql
      ${linkGraph ? devConfigEnv : ""}
    volumes:
      - ${workspace}:${localWorkspace}
      ${linkGraph ? `- ${DevConfig.get("graph.folder", cxt)}/modules:/env` : ""}
    ${
      linkGraph
        ? 'command: "node_modules/nodemon/bin/nodemon ./dist/index.js"'
        : ""
    }
    networks:
      - ${networkid}
    extra_hosts:
      - "boot.graph:${localhost}"
    logging:
      driver: "json-file"
      options:
        max-file: "5"
        max-size: "10m"
networks:
  ${networkid}:
    external: true

`;
};
