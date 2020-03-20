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

const LOCAL_WORKER_ID = process.env["LOCAL_WORKER_ID"];
const LOCAL_WORKSPACE = process.env["LOCAL_WORKSPACE"];
const LOCAL_WORKER_GRAPH_PORT = process.env["LOCAL_WORKER_GRAPH_PORT"];
const LOCAL_WORKER_SSHD_PORT = process.env["LOCAL_WORKER_SSHD_PORT"];

const cxt = {
  workspace: LOCAL_WORKSPACE,
  services: {
    sshd: {
      process: null,
      port: LOCAL_WORKER_SSHD_PORT
    }
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
  await Service.start(cxt);

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
  });
})().catch(e => cxt.logger.error("service.error", { error: e.toString() }));

Utils.Process.shutdown(async signal =>
  cxt.logger.info("service.shutdown", { signal })
);
