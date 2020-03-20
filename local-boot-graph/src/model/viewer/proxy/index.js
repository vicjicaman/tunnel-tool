import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import * as ProxyApi from "Api/proxy";

export const start = async cxt => {
  cxt.logger.debug("proxy.start", {});
  await ProxyApi.start(cxt);
};

export const stop = async cxt => {
  cxt.logger.debug("proxy.stop", {});
  await ProxyApi.stop(cxt);
};
