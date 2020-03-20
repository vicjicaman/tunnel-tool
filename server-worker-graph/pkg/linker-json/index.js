import _ from "lodash";
import path from "path";
import fs from "fs";
import YAML from "yamljs";

export const load = (filename, isYaml = false) => {
  const content = fs.readFileSync(filename, "utf8");
  return parse(content, isYaml);
};

export const save = (filename, content, isYaml = false) => {
  fs.writeFileSync(
    filename,
    isYaml ? YAML.stringify(content, 10, 2) : JSON.stringify(content, null, 2),
    "utf8"
  );
};

export const parse = (content, isYaml = false) =>
  isYaml ? YAML.parse(content) : JSON.parse(content);
