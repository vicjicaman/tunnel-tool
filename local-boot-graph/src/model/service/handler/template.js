import * as DevConfig from "PKG/linker-dev";

export const compose = ({ network: { networkid, localhost } }, cxt) => {
  const {
    workspace,
    services: {
      bootstrap: { port: localBootstrapPort },
      web: { port: localWebPort, version: webVersion },
      graph: { port: localGraphPort, version: graphVersion },
      worker: { version: workerVersion },
      config: { deviceid },
      server: { host: targetServerHost, port: targetServerPort }
    },
    state,
    dev,
    versions
  } = cxt;
  const localWorkspace = cxt.paths.inner.workspace;
  const linkWeb = DevConfig.get("web.link", cxt);
  const linkGraph = DevConfig.get("graph.link", cxt);
  const devConfigEnv = `- DEV_CONFIG=${DevConfig.serialize(cxt)}`;

  const webService = `web:
    image: repoflow/tunnel-local-web-container:${DevConfig.get(
    "web.version",
    cxt
  ) || webVersion}
    environment:
      - NODE_ENV=${DevConfig.get("web.mode", cxt) || cxt.mode}
      - ENV_MODE=${DevConfig.get("web.mode", cxt) || cxt.mode}
      - LOCAL_HANDLER_WEB_PORT=${localWebPort}
      - LOCAL_HANDLER_GRAPH_PORT=${localGraphPort}
      - LOCAL_WORKSPACE=${localWorkspace}
      ${linkWeb ? devConfigEnv : ""}
    volumes:
      - ${workspace}:${localWorkspace}
      ${linkWeb ? `- ${DevConfig.get("web.folder", cxt)}/modules:/env` : ""}

    ${
    linkWeb ? 'command: "node_modules/nodemon/bin/nodemon ./dist/index.js"' : ""
  }
    networks:
      - ${networkid}
    logging:
      driver: "json-file"
      options:
        max-file: "5"
        max-size: "10m"
    depends_on:
      - graph
`;

  return `version: '3'

services:
  ${state.mode !== "key" ? webService : ""}
  graph:
    image: repoflow/tunnel-local-graph-container:${DevConfig.get(
      "graph.version",
      cxt
    ) || graphVersion}
    environment:
      - LOCAL_EXEC_MODE=${state.mode}
      - LOCAL_VERSIONS=${JSON.stringify(versions)}
      - LOCALHOST=${localhost}
      - NODE_ENV=${DevConfig.get("graph.mode", cxt) || cxt.mode}
      - ENV_MODE=${DevConfig.get("graph.mode", cxt) || cxt.mode}
      - LOCAL_HANDLER_GRAPH_PORT=${localGraphPort}
      - LOCAL_WORKSPACE=${localWorkspace}
      - LOCAL_NETWORK=${networkid}
      - LOCAL_WORKER_VERSION=${workerVersion}
      - LOCAL_DEVICE_ID=${deviceid}
      - LOCAL_TARGET_SERVER_HOST=${targetServerHost}
      - LOCAL_TARGET_SERVER_PORT=${targetServerPort}
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
