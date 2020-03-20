import { execSync } from "child_process";
import path from "path";
import _ from "lodash";
import fs from "fs";
import * as ComposeApi from "PKG/linker-compose";

export const start = async cxt => {
  const {
    instance: { instanceid },
    paths: { proxy }
  } = cxt;

  await ComposeApi.start(
    { instanceid: `${instanceid}-proxy`, folder: proxy.folder },
    cxt
  );
};

export const stop = async cxt => {
  const {
    instance: { instanceid },
    paths: { proxy }
  } = cxt;

  await ComposeApi.stop(
    { instanceid: `${instanceid}-proxy`, folder: proxy.folder },
    cxt
  );
};
