import uuidv4 from "uuid/v4";
import fs from "fs";
import path from "path";
import * as JsonUtils from "PKG/linker-json";

import * as Handler from "./handler";

export const start = async cxt => {
  const { workspace } = cxt;

  const instanceFile = path.join(workspace, "instance.json");

  if (!fs.existsSync(instanceFile)) {
    JsonUtils.save(instanceFile, { id: uuidv4() });
  }
  const { id } = JsonUtils.load(instanceFile);
  cxt.logger.debug("instance.current", { id });
  const instance = {
    id,
    instanceid: `repoflow-tunnel-server-${id}`,
    network: {
      networkid: `repoflow-tunnel-server-network-${id}`
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

export const update = async ({ boot, graph, worker }, cxt) => {
  cxt.logger.debug("service.update", { boot, graph, worker, mode: cxt.mode });

  let content = fs.readFileSync("start.sh").toString();

  content = sync(content, "@nebulario/tunnel-server-boot-graph", boot);
  content = sync(content, "repoflow/tunnel-server-graph-container", graph);
  content = sync(
    content,
    "repoflow/tunnel-server-worker-graph-container",
    worker
  );

  cxt.logger.debug("service.updated", { content });

  if (cxt.mode === "production") {
    cxt.logger.debug("service.production.rewrite");
    fs.writeFileSync("start.sh", content);
    return true;
  }

  return false;
};

const sync = (content, fullname, version) => {
  const depPath = "=(.+)\\s+#module\\s+" + fullname;
  const versionRegex = new RegExp(depPath, "g");

  return content.replace(versionRegex, `=${version} #module ${fullname}`);
};
