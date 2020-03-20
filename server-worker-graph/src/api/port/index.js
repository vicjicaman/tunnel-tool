import { execSync } from "child_process";

export const getProcId = async (port, cxt) => {
  const infoLines = execSync(`netstat -tuplen`)
    .toString()
    .trim();

  const info = infoLines.match(/[^\r\n]+/g);

  for (const ln of info) {
    const portExp = /0\.0\.0\.0:(\d+)/;
    const procIdExp = /(\d+)\/sshd/;

    const resPort = ln.match(portExp);
    const resId = ln.match(procIdExp);

    if (resPort && resId) {
      if (parseInt(resPort[1]) === port) {
        return parseInt(resId[1]);
        break;
      }
    }
  }

  return null;
};
