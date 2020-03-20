import path from "path";
import { execSync } from "child_process";
import { spawn } from "child-process-promise";
const express = require("express");
const graphqlHTTP = require("express-graphql");
const { makeExecutableSchema } = require("graphql-tools");
const { schema: rootSchema, resolvers: rootResolvers } = require("./schema");

import * as DevConfig from "PKG/linker-dev";

import * as Utils from "@nebulario/tunnel-utils";
import * as Logger from "@nebulario/tunnel-logger";
import * as Service from "Model/service";

const ENV_MODE = process.env["ENV_MODE"];

const LOCAL_DEVICE_ID = process.env["LOCAL_DEVICE_ID"];
const LOCAL_WORKER_ID = process.env["LOCAL_WORKER_ID"];
const LOCAL_WORKSPACE = process.env["LOCAL_WORKSPACE"];
const LOCAL_WORKER_GRAPH_PORT = process.env["LOCAL_WORKER_GRAPH_PORT"];
const LOCAL_HANDLER_GRAPH_PORT = process.env["LOCAL_HANDLER_GRAPH_PORT"];

const LOCAL_TARGET_SERVER_HOST = process.env["LOCAL_TARGET_SERVER_HOST"];
const LOCAL_TARGET_SERVER_PORT = parseInt(
  process.env["LOCAL_TARGET_SERVER_PORT"]
);

const cxt = {
  workspace: LOCAL_WORKSPACE,
  services: {
    server: {
      host: LOCAL_TARGET_SERVER_HOST,
      port: LOCAL_TARGET_SERVER_PORT
    },
    config: {
      workerid: LOCAL_WORKER_ID,
      deviceid: LOCAL_DEVICE_ID
    },
    graph: {
      port: LOCAL_HANDLER_GRAPH_PORT
    }
  },
  paths: {
    keys: {
      folder: path.join(LOCAL_WORKSPACE, "keys")
    }
  },
  state: {
    ip: null,
    inlets: [],
    outlets: []
  },
  logger: null,
  dev: null,
  env: {
    mode: ENV_MODE,
    logs: {
      folder: path.join(LOCAL_WORKSPACE, "logs", "graph")
    }
  }
};

DevConfig.init(cxt);
cxt.logger = Logger.create({ path: cxt.env.logs.folder, env: ENV_MODE }, cxt);

(async () => {
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
        parents: {},
        ...cxt
      }
    }))
  );
  app.listen(LOCAL_WORKER_GRAPH_PORT, () => {
    cxt.logger.info("service.running....", {
      port: LOCAL_WORKER_GRAPH_PORT
    });

    Service.start(cxt);
  });
})().catch(e => cxt.logger.error("service.error", { error: e.toString() }));

Utils.Process.shutdown(async signal =>
  cxt.logger.info("service.shutdown", { signal })
);
