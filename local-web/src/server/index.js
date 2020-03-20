require("dotenv").config();
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

import React from "react";
import express from "express";
import { render } from "./render";
import App from "../common/App.js";
import { reducers, watchers } from "../common/state";
import * as Logger from "@nebulario/tunnel-logger";
import * as Utils from "@nebulario/tunnel-utils";

import * as NetworkUtils from "PKG/linker-network";

const ENV_MODE = process.env["ENV_MODE"];
const LOCAL_WORKSPACE = process.env["LOCAL_WORKSPACE"];
const LOCAL_HANDLER_WEB_PORT = process.env["LOCAL_HANDLER_WEB_PORT"];
const LOCAL_HANDLER_GRAPH_PORT = process.env["LOCAL_HANDLER_GRAPH_PORT"];
const LOCAL_BASE_ROUTE_APP = "";
const LOCAL_RESOURCE_BASE_ROUTE = "/resources";

const cxt = {
  workspace: LOCAL_WORKSPACE,
  services: {},
  logger: null,
  env: {
    mode: ENV_MODE,
    logs: {
      folder: path.join(LOCAL_WORKSPACE, "logs", "web")
    }
  }
};

cxt.logger = Logger.create(
  {
    path: cxt.env.logs.folder,
    env: ENV_MODE
  },
  cxt
);

const nameserver = NetworkUtils.getNameserver(cxt);
const LOCAL_GRAPH_IP = NetworkUtils.getHostname("graph", nameserver, cxt);
const LOCAL_WEB_IP = NetworkUtils.getHostname("web", nameserver, cxt);

cxt.services.graph = {
  host: LOCAL_GRAPH_IP,
  port: LOCAL_HANDLER_GRAPH_PORT
};
cxt.services.web = {
  host: LOCAL_WEB_IP,
  port: LOCAL_HANDLER_WEB_PORT
};

(async () => {
  //const LOCAL_HANDLER_GRAPH_URL = `http://localhost:7000/graphql`;
  //cxt.logger.debug("graph.url", { url: LOCAL_HANDLER_GRAPH_URL });

  const app = express();
  Logger.Service.use(app, cxt);

  app.use(
    LOCAL_RESOURCE_BASE_ROUTE + "/jquery",
    express.static("node_modules/jquery/dist")
  );
  app.use(
    LOCAL_RESOURCE_BASE_ROUTE + "/bootstrap",
    express.static("node_modules/bootstrap/dist")
  );
  app.use(
    LOCAL_RESOURCE_BASE_ROUTE + "/font-awesome",
    express.static("node_modules/font-awesome")
  );

  app.use(
    LOCAL_RESOURCE_BASE_ROUTE + "/react-toastify",
    express.static("node_modules/react-toastify")
  );

  app.use(LOCAL_BASE_ROUTE_APP + "/app", express.static("dist/web"));

  app.get("/*", (req, res) => {
    render(
      {
        App,
        req,
        res,
        watchers,
        reducers,
        paths: {
          base: LOCAL_BASE_ROUTE_APP,
          resources: LOCAL_RESOURCE_BASE_ROUTE
        },
        urls: {
          external: {
            graphql: `http://${cxt.services.graph.host}:9000/graphql`,
            events: `http://${cxt.services.graph.host}:9000`
          },
          internal: {
            graphql: `http://${cxt.services.graph.host}:9000/graphql`,
            events: `http://${cxt.services.graph.host}:9000`
          }
        }
      },
      cxt
    );
  });

  app.listen(LOCAL_HANDLER_WEB_PORT, () => {
    cxt.logger.info("service.running", { port: LOCAL_HANDLER_WEB_PORT });
  });
})().catch(e => cxt.logger.error("service.error", { error: e.toString() }));

Utils.Process.shutdown(async signal =>
  cxt.logger.info("service.shutdown", { signal })
);
