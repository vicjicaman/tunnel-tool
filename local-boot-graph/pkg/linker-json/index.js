import _ from "lodash";
import path from "path";
import fs from "fs";
import YAML from "yamljs";

export const load = (filename, isYaml = false) => {
  const content = fs.readFileSync(filename, "utf8");
  return isYaml ? YAML.parse(content) : JSON.parse(content);
};

export const save = (filename, content, isYaml = false) => {
  fs.writeFileSync(
    filename,
    isYaml ? YAML.stringify(content, 10, 2) : JSON.stringify(content, null, 2),
    "utf8"
  );
};
