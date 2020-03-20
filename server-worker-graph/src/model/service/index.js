import { spawn } from "child-process-promise";
import fs from "fs";

export const start = async cxt => {
  cxt.services.sshd.process = spawn("/usr/sbin/sshd", [
    "-p",
    "2200",
    "-D"
  ]).catch(e => cxt.logger.error("sshd.error", { error: e.toString() }));
  cxt.logger.debug("sshd.started", { port: 2200 });
};
