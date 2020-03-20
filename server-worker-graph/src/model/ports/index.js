import * as PortApi from "Api/port";
import kill from "tree-kill";

export const stop = async (port, cxt) => {
  const pid = await PortApi.getProcId(port, cxt);

  if (pid) {
    cxt.logger.debug("port.id", { port, pid });

    kill(pid, err => {
      if (err) {
        cxt.logger.error("port.stop.error", {
          error: err.toString(),
          pid
        });
      }

      cxt.logger.debug("port.stopped", {
        port,
        pid
      });
    });
    return true;
  }

  return false;
};
