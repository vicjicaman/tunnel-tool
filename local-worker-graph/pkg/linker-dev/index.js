import _ from "lodash";

const config = () => {
  const configEnv = process.env["DEV_CONFIG"];

  let config = {};
  try {
    config = JSON.parse(configEnv);
    console.log("DEV_CONFIG");
    console.log(JSON.stringify(config, null, 2));
  } catch (e) {}
  return config;
};

export const init = cxt => {
  cxt.dev = config();
};

export const get = (ptk, cxt) => {
  return _.get(cxt.dev, ptk);
};
