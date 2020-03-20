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

import * as ServerApi from "Api/server";
import * as Service from "Model/service";

const LOCAL_DEVICE_ID = process.env["LOCAL_DEVICE_ID"];
const LOCAL_TARGET_SERVER_HOST = process.env["LOCAL_TARGET_SERVER_HOST"];
const LOCAL_TARGET_SERVER_PORT = parseInt(
  process.env["LOCAL_TARGET_SERVER_PORT"]
);

const ENV_MODE = process.env["ENV_MODE"] || "production";

const INNER_WORKSPACE = "/workspace";
const LOCAL_WORKSPACE = path.join(
  FolderUtils.resolveCurrent(
    FolderUtils.resolveTilde(process.env["LOCAL_WORKSPACE"])
  ),
  "workspace"
);
const LOCAL_GRAPH_BOOTSTRAP_SERVICE_PORT = parseInt(
  process.env["LOCAL_GRAPH_BOOTSTRAP_SERVICE_PORT"] || "52552"
);

const LOCAL_GRAPH_SERVICE_PORT = parseInt(
  process.env["LOCAL_GRAPH_SERVICE_PORT"] || "17007"
);
const LOCAL_WEB_SERVICE_PORT = parseInt(
  process.env["LOCAL_WEB_SERVICE_PORT"] || "17006"
);

const LOCAL_VERSION_BOOTSTRAP = process.env["LOCAL_VERSION_BOOTSTRAP"];
const LOCAL_VERSION_GRAPH = process.env["LOCAL_VERSION_GRAPH"];
const LOCAL_VERSION_WEB = process.env["LOCAL_VERSION_WEB"];
const LOCAL_VERSION_WORKER = process.env["LOCAL_VERSION_WORKER"];
const DEV_FOLDER = process.env["DEV_FOLDER"];

const cxt = {
  workspace: LOCAL_WORKSPACE,
  mode: ENV_MODE,
  paths: {
    inner: {
      workspace: INNER_WORKSPACE
    },
    workers: {
      folder: path.join(LOCAL_WORKSPACE, "workers")
    },
    proxy: {
      folder: path.join(LOCAL_WORKSPACE, "proxy")
    }
  },
  services: {
    bootstrap: { port: LOCAL_GRAPH_BOOTSTRAP_SERVICE_PORT },
    web: { port: LOCAL_WEB_SERVICE_PORT, version: LOCAL_VERSION_WEB },
    graph: { port: LOCAL_GRAPH_SERVICE_PORT, version: LOCAL_VERSION_GRAPH },
    worker: {
      version: LOCAL_VERSION_WORKER
    },
    config: {
      deviceid: LOCAL_DEVICE_ID
    },
    server: {
      host: LOCAL_TARGET_SERVER_HOST,
      port: LOCAL_TARGET_SERVER_PORT
    }
  },
  state: {
    mode: "key"
  },
  dev: null,
  logger: null,
  instance: null,
  versions: {
    boot: LOCAL_VERSION_BOOTSTRAP,
    graph: LOCAL_VERSION_GRAPH,
    web: LOCAL_VERSION_WEB,
    worker: LOCAL_VERSION_WORKER
  }
};

const valid = Service.validate(cxt);

if (!valid) {
  process.exit(1);
}

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
  cxt.instance = await Service.start(cxt);

  console.log("-----------------------------------------------------------");
  console.log(`DEVICEID: ${cxt.services.config.deviceid}`);
  console.log(`WORKSPACE: ${cxt.workspace}`);
  if (cxt.state.mode === "key") {
    console.log(
      `KEY FILE: ${cxt.workspace}/keys/${cxt.services.config.deviceid}/${cxt.services.config.deviceid}.json`
    );
    console.log("-----------------------------------------------------------");
    console.log(
      "- Copy the device's key file to the server key's folder to enable the  device."
    );
    console.log("-----------------------------------------------------------");
  }

  if (cxt.state.mode === "worker") {
    cxt.logger.debug("local.graph", {
      ip: cxt.instance.network.graph.ip
    });

    await Utils.Process.wait(1000);
    try {
      const info = await ServerApi.info(cxt);
    } catch (e) {
      console.log(
        "-----------------------------------------------------------"
      );
      console.log("Can't connect with the server...");
      console.log(
        "-----------------------------------------------------------"
      );
      console.log(
        `- Make sure that the device key file is present on the server.`
      );
      console.log(
        `- Check that the host ${cxt.services.server.host} is up and running and reachable.`
      );
      console.log(
        `- The port ${LOCAL_TARGET_SERVER_PORT} must be allowed on ${cxt.services.server.host}.`
      );

      cxt.logger.error("server.error", { error: e.toString() });
      process.exit(2);
    }

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

    console.log("-----------------------------------------------------------");
    console.log("Open the dashboard on:");
    console.log("-----------------------------------------------------------");
    console.log(
      `http://${cxt.instance.network.web.ip}:${cxt.services.web.port}`
    );
    console.log("-----------------------------------------------------------");

    app.listen(LOCAL_GRAPH_BOOTSTRAP_SERVICE_PORT, () => {
      cxt.logger.debug("service.bootstrap.running", {
        port: LOCAL_GRAPH_BOOTSTRAP_SERVICE_PORT
      });
    });
  }
})().catch(e => cxt.logger.error("service.error", { error: e.toString() }));

Utils.Process.shutdown(async signal => {
  await Service.stop(signal, cxt);
});
