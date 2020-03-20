import { execSync } from "child_process";
import path from "path";
import fs from "fs";

import * as WorkerApi from "Api/workers";

export const list = async ({}, cxt) => {
  return await WorkerApi.list({}, cxt);
};

export const get = async (workerid, cxt) => {
  return await WorkerApi.get(workerid, cxt);
};

export const start = async (worker, cxt) => {
  const { workerid } = worker;
  cxt.logger.debug("worker.start", { workerid });
  await WorkerApi.start(worker, cxt);
  return worker;
};

export const restart = async (worker, cxt) => {
  const { workerid } = worker;
  cxt.logger.debug("worker.restart", { workerid });
  await WorkerApi.restart(worker, cxt);
  return worker;
};

export const stop = async (worker, cxt) => {
  const { workerid } = worker;
  cxt.logger.debug("worker.stop", { workerid });
  await WorkerApi.stop(worker, cxt);
  return worker;
};
