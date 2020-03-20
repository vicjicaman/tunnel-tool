import uuidv4 from "uuid/v4";
import fs from "fs";
import path from "path";
import * as JsonUtils from "PKG/linker-json";
import * as ValidationUtils from "PKG/linker-validation";
import validator from "validator";
import * as Handler from "./handler";

export const validate = cxt => {
  const {
    services: {
      config: { deviceid },
      server: { host }
    }
  } = cxt;

  if (validator.isEmpty(deviceid) || !ValidationUtils.isEntityName(deviceid)) {
    console.log("Please provide a valid device name.");
    console.log("./start.sh <<deviceid>>");
    return false;
  }

  return true;
};

export const start = async cxt => {
  const {
    workspace,
    services: {
      config: { deviceid },
      server: { host }
    }, state
  } = cxt;

  if(!host){
    state.mode = "key";
  }else{
    state.mode = "worker";
  }

  const instanceFile = path.join(workspace, "instance.json");

  if (!fs.existsSync(instanceFile)) {
    JsonUtils.save(instanceFile, { id: uuidv4() });
  }
  const { id } = JsonUtils.load(instanceFile);
  cxt.logger.debug("instance.current", { id });
  const instance = {
    id,
    instanceid: `repoflow-tunnel-local-${id}`,
    network: {
      networkid: `repoflow-tunnel-local-network-${id}`
    }
  };

  instance.handler = await Handler.start(instance, cxt);

  return instance;
};

export const stop = async (signal, cxt) => {
  if (!cxt.services.stopping) {
    cxt.services.stopping = true;
    cxt.logger.info("service.stopping...", { signal });

    await Handler.stop(cxt.instance, cxt);

    cxt.logger.debug("service.stopped");
  }
};

export const update = async ({ boot, graph, web, worker }, cxt) => {
  cxt.logger.debug("service.update", {
    boot,
    graph,
    worker,
    web,
    mode: cxt.mode
  });

  let content = fs.readFileSync("start.sh").toString();

  content = sync(content, "@nebulario/tunnel-local-boot-graph", boot);
  content = sync(content, "repoflow/tunnel-local-web-container", web);
  content = sync(content, "repoflow/tunnel-local-graph-container", graph);
  content = sync(
    content,
    "repoflow/tunnel-local-worker-graph-container",
    worker
  );

  cxt.logger.debug("service.updated", { content });

  if (cxt.mode === "production") {
    cxt.logger.debug("service.production.rewrite");
    fs.writeFileSync("start.sh", content);
    return true;
  }

  cxt.logger.debug("service.non-production");
  return false;
};

const sync = (content, fullname, version) => {
  const depPath = "=(.+)\\s+#module\\s+" + fullname;
  const versionRegex = new RegExp(depPath, "g");

  return content.replace(versionRegex, `=${version} #module ${fullname}`);
};
