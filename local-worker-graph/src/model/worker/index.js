import { spawn } from "child-process-promise";
import { execSync } from "child_process";
import fs from "fs";
import _ from "lodash";

import * as WorkerApi from "Api/worker";

export const get = async cxt => {
  const worker = await WorkerApi.get(cxt);
  return worker;
};

export const set = async (worker, { inlets, outlets }, cxt) => {
  cxt.logger.debug("worker.set", { inlets, outlets });
  await WorkerApi.set(inlets, outlets, cxt);
  await WorkerApi.update(cxt);
  return await WorkerApi.get(cxt);
};
