import _ from "lodash";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";
import os from "os";

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

export function resolveTilde(filePath) {
  if (!filePath || typeof filePath !== "string") {
    return "";
  }
  // '~/folder/path' or '~'
  if (filePath[0] === "~" && (filePath[1] === "/" || filePath.length === 1)) {
    return filePath.replace("~", os.homedir());
  }
  return filePath;
}

export function resolveCurrent(filePath) {
  if (!filePath || typeof filePath !== "string") {
    return "";
  }
  // '~/folder/path' or '~'
  if (filePath[0] === "." && (filePath[1] === "/" || filePath.length === 1)) {
    return filePath.replace(".", process.cwd());
  }
  return filePath;
}
