import _ from "lodash";
import fs from "fs";
import * as JsonUtils from "PKG/linker-json";

const DEV_CONFIG_FILE = "dev.config.json";

const config = cxt => {
  let config = null;

  if (fs.existsSync(DEV_CONFIG_FILE)) {
    config = JsonUtils.load(DEV_CONFIG_FILE);
  } else {
    try {
      const configEnv = process.env["DEV_CONFIG"];
      if (configEnv) {
        config = JSON.parse(configEnv);
      }
    } catch (e) {
      console.log("dev.config.error:" + e.toString());
    }
  }

  if (config) {
    console.log("DEV_CONFIG");
    console.log(JSON.stringify(config, null, 2));
  }

  return config;
};

export const init = cxt => {
  cxt.dev = config(cxt);
};

export const get = (ptk, cxt) => {
  return _.get(cxt.dev, ptk, null);
};

export const serialize = cxt => {
  if (cxt.dev) {
    return JSON.stringify(cxt.dev);
  } else {
    return null;
  }
};
