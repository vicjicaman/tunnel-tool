import { execSync } from "child_process";
import fs from "fs";
import _ from "lodash";
import path from "path";
import * as Template from "./template";
import * as Utils from "@nebulario/tunnel-utils";
import * as ComposeApi from "PKG/linker-compose";


export const start = async (instance, cxt) => {
  const {
    instanceid,
    network: { networkid }
  } = instance;
  const networksList = execSync(`docker network ls`).toString();

  if (networksList.indexOf(networkid) === -1) {
    cxt.logger.debug("network.create", { networkid });
    execSync(`docker network create ${networkid}`);
  }

  const inspect = await ComposeApi.networkInspect(networkid, cxt);
  const localhost = inspect[0].IPAM.Config[0].Gateway;
  instance.network.localhost = localhost;

  cxt.logger.debug("instance.network", { networkid, localhost });

  const folder = path.join(cxt.workspace, "handler");
  const composeFile = path.join(folder, "docker-compose.yml");
  const handler = {
    paths: {
      folder,
      composeFile
    }
  };

  if (!fs.existsSync(handler.paths.folder)) {
    fs.mkdirSync(handler.paths.folder);
  }

  const content = Template.compose(
    instance,
    cxt
  );
  fs.writeFileSync(handler.paths.composeFile, content);

  await ComposeApi.start({ instanceid, folder: handler.paths.folder }, cxt);

  instance.network.graph = await ComposeApi.getServiceNetwork(networkid, "graph", cxt);

  return handler;
};

export const stop = async (instance, cxt) => {
  const { instanceid, handler } = instance;

  await ComposeApi.stop({ instanceid, folder: handler.paths.folder }, cxt);

  return {};
};
