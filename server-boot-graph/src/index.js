require("dotenv").config();
const path = require("path");
const fs = require("fs");
const express = require("express");
const graphqlHTTP = require("express-graphql");
const { makeExecutableSchema } = require("graphql-tools");
const { schema: rootSchema, resolvers: rootResolvers } = require("./schema");

import * as FolderUtils from "PKG/linker-folder";
import * as DevConfig from "PKG/linker-dev";

import * as Utils from "@nebulario/tunnel-utils";
import * as Logger from "@nebulario/tunnel-logger";

import * as ServiceModel from "Model/service";

const ENV_MODE = process.env["ENV_MODE"] || "production";
const INNER_WORKSPACE = "/workspace";
const LOCAL_WORKSPACE = path.join(
  FolderUtils.resolveCurrent(
    FolderUtils.resolveTilde(process.env["LOCAL_WORKSPACE"])
  ),
  "workspace"
);
const LOCAL_TARGET_SERVER_PORT = parseInt(
  process.env["LOCAL_TARGET_SERVER_PORT"]
);

const LOCAL_GRAPH_BOOTSTRAP_SERVICE_PORT = parseInt(
  process.env["LOCAL_GRAPH_BOOTSTRAP_SERVICE_PORT"] || "52551"
);
const LOCAL_GRAPH_SERVICE_PORT = parseInt(
  process.env["LOCAL_GRAPH_SERVICE_PORT"] || "17007"
);

const LOCAL_VERSION_BOOTSTRAP = process.env["LOCAL_VERSION_BOOTSTRAP"];
const LOCAL_VERSION_GRAPH = process.env["LOCAL_VERSION_GRAPH"];
const LOCAL_VERSION_WORKER = process.env["LOCAL_VERSION_WORKER"];

const cxt = {
  workspace: LOCAL_WORKSPACE,
  mode: ENV_MODE,
  paths: {
    inner: {
      workspace: INNER_WORKSPACE
    },
    workers: {
      folder: path.join(LOCAL_WORKSPACE, "workers")
    }
  },
  services: {
    bootstrap: { port: LOCAL_GRAPH_BOOTSTRAP_SERVICE_PORT },
    graph: { port: LOCAL_GRAPH_SERVICE_PORT, version: LOCAL_VERSION_GRAPH },
    worker: {
      version: LOCAL_VERSION_WORKER
    },
    server: {
      port: LOCAL_TARGET_SERVER_PORT
    }
  },
  dev: null,
  logger: null,
  instance: null,
  versions: {
    boot: LOCAL_VERSION_BOOTSTRAP,
    graph: LOCAL_VERSION_GRAPH,
    worker: LOCAL_VERSION_WORKER
  }
};

DevConfig.init(cxt);

if (DevConfig.get("mode", cxt)) {
  cxt.mode = DevConfig.get("mode", cxt);
}
if (DevConfig.get("workspace", cxt)) {
  cxt.workspace = DevConfig.get("workspace", cxt);
  cxt.workspace = FolderUtils.resolveCurrent(
    FolderUtils.resolveTilde(cxt.workspace)
  );
}

if (!fs.existsSync(cxt.workspace)) {
  FolderUtils.makePath(cxt.workspace);
}
cxt.logger = Logger.create({
  path: path.join(cxt.workspace, "logs", "bootstrap"),
  env: cxt.mode
});

cxt.logger.debug("context", {
  workspace: cxt.workspace
});

(async () => {
  console.log("-----------------------------------------------------------");
  console.log(`WORKSPACE: ${cxt.workspace}`);
  console.log(`KEYS FOLDER: ${cxt.workspace}/keys`);
  console.log("-----------------------------------------------------------");

  cxt.instance = await ServiceModel.start(cxt);

  console.log("-----------------------------------------------------------");
  console.log(`- The server side is ready to handle device connections`);
  console.log(
    `- Initialize a device by coping its key file to the keys folder.`
  );
  console.log("-----------------------------------------------------------");

  var app = express();
  Logger.Service.use(app, cxt);

  const schema = makeExecutableSchema({
    typeDefs: rootSchema,
    resolvers: rootResolvers
  });

  app.use(
    "/graphql",
    graphqlHTTP(request => ({
      schema: schema,
      graphiql: true,
      context: {
        request,
        ...cxt
      }
    }))
  );

  app.listen(LOCAL_GRAPH_BOOTSTRAP_SERVICE_PORT, () => {
    cxt.logger.debug("service.bootstrap.running", {
      port: LOCAL_GRAPH_BOOTSTRAP_SERVICE_PORT
    });
  });
})().catch(e => cxt.logger.error("service.error", { error: e.toString() }));

Utils.Process.shutdown(async signal => {
  await ServiceModel.stop(signal, cxt);
});
