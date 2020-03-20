import { execSync } from "child_process";
import path from "path";
import _ from "lodash";
import fs from "fs";
import * as FolderUtils from "PKG/linker-folder";
import * as ComposeApi from "PKG/linker-compose";

export const list = async ({}, cxt) => {
  const {
    paths: {
      workers: { folder }
    }
  } = cxt;

  const workersList = FolderUtils.getDirectories(folder);

  return _.map(workersList, folder => {
    const workerid = path.basename(folder);
    return {
      id: workerid,
      workerid,
      folder
    };
  });
};

export const get = async (workerid, cxt) => {
  const workers = await list({}, cxt);
  const worker = _.find(workers, { workerid }) || null;
  return worker;
};

export const start = async ({ workerid, folder }, cxt) => {
  const {
    instance: { instanceid }
  } = cxt;

  await ComposeApi.start(
    { instanceid: `${instanceid}-${workerid}`, folder },
    cxt
  );
};

export const restart = async ({ workerid, folder }, cxt) => {
  const {
    instance: { instanceid }
  } = cxt;

  await ComposeApi.restart(
    { instanceid: `${instanceid}-${workerid}`, folder },
    cxt
  );
};

export const stop = async ({ workerid, folder }, cxt) => {
  const {
    instance: { instanceid }
  } = cxt;

  await ComposeApi.stop(
    { instanceid: `${instanceid}-${workerid}`, folder },
    cxt
  );
};

export const info = async ({ workerid, folder }, cxt) => {
  const {
    instance: {
      instanceid,
      network: { networkid }
    }
  } = cxt;

  return await ComposeApi.getServiceNetwork(networkid, workerid, cxt);
};
