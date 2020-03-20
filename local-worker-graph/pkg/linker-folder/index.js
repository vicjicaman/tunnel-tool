import _ from "lodash";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";

export const isDirectory = source => fs.lstatSync(source).isDirectory();
export const isFile = source => fs.lstatSync(source).isFile();
export const getDirectories = source =>
  fs
    .readdirSync(source)
    .map(name => path.join(source, name))
    .filter(isDirectory);
export const getFiles = (source, ext) => {
  if (!fs.existsSync(source)) {
    return [];
  }

  return fs
    .readdirSync(source)
    .map(name => path.join(source, name))
    .filter(isFile)
    .filter(source => source.endsWith(ext));
};

export const makePath = (pathid, cxt) => {
  if (fs.existsSync(pathid)) {
    return;
  }

  execSync(`mkdir -p ${pathid}`);
};
