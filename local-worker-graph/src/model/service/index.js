import { spawn } from "child-process-promise";
import { execSync } from "child_process";
import fs from "fs";
import _ from "lodash";
import * as WorkerApi from "Api/worker";
import * as Utils from "@nebulario/tunnel-utils";

export const start = async cxt => {
  const {
    services: {
      config: { workerid }
    }
  } = cxt;

  const ip = execSync("hostname -i")
    .toString()
    .trim();

  cxt.logger.debug("worker.started", { workerid, ip });
  await WorkerApi.init({ workerid, ip }, cxt);

  //await WorkerApi.update(cxt);
  /*(async () => {
    while (true) {
      await WorkerApi.update(cxt);
      await Utils.Process.wait(500);
    }
  })().catch(e =>
    cxt.logger.error("service.loop.fatal", { error: e.toString() })
  );*/
};
