import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import _ from "lodash";
import * as Utils from "@nebulario/tunnel-utils";

export const networkInspect = async (networkid, cxt) =>
  JSON.parse(execSync(`docker network inspect ${networkid}`));

export const start = ({ instanceid, folder }, cxt) => {
  const stdout = execSync(
    `docker-compose -p ${instanceid} up --remove-orphans --detach`,
    {
      cwd: folder
    }
  );
  cxt.logger.debug("compose.start", {
    instanceid,
    folder,
    stdout: stdout.toString()
  });
};

export const restart = ({ instanceid, folder }, cxt) => {
  const stdout = execSync(`docker-compose -p ${instanceid} restart`, {
    cwd: folder
  });

  cxt.logger.debug("compose.restart", {
    instanceid,
    folder,
    stdout: stdout.toString()
  });
};

export const stop = async ({ instanceid, folder }, cxt) => {
  /*let retry = 0;

  while (retry++ < 5) {
    cxt.logger.debug("instance.stop", { retry, instanceid });
    try {
      const out = execSync(`docker-compose -p ${instanceid} stop`, {
        cwd: folder
      }).toString();
      cxt.logger.debug("instance.compose.stop", { out });
      break;
    } catch (e) {
      cxt.logger.debug("instance.stop.warning", { warning: e.toString() });
      await Utils.Process.wait(2000);
    }
  }*/

  let containers = await getContainersState({ instanceid, folder }, cxt);

  let working = true;
  while (working) {
    cxt.logger.debug("service.worker.stopping", {
      instanceid
    });
    working = false;
    for (const container of containers) {
      cxt.logger.info("service.worker.stopping");
      cxt.logger.debug("service.worker.stopping.info", {
        containerid: container.Id,
        State: container.State
      });
      const out = execSync(`docker stop ${container.Id}`, {
        cwd: folder
      }).toString();

      cxt.logger.debug("compose.stopped", {
        containerid: container.Id
      });
    }
    containers = await getContainersState({ instanceid, folder }, cxt);
    for (const container of containers) {
      if (container.State.Running === true) {
        working = true;
      }
    }
    await Utils.Process.wait(1000);
  }
  cxt.logger.debug("compose.stopped", {
    instanceid
  });
};

export const getServiceNetwork = async (networkid, service, cxt) => {
  let networkInfo = null;

  const inspect = await networkInspect(networkid, cxt);

  while (networkInfo === null) {
    const inspectInitial = await networkInspect(networkid, cxt);

    networkInfo =
      _.find(inspect[0].Containers, c => c.Name.indexOf(service) !== -1) ||
      null;

    cxt.logger.debug("instance.network.service.raw", {
      container: networkInfo
    });

    await Utils.Process.wait(500);
  }

  const info = {
    ip: networkInfo.IPv4Address.split("/")[0]
  };

  cxt.logger.debug("instance.network.service", {
    service,
    info
  });
  return info;
};

export const getContainersState = async ({ instanceid, folder }, cxt) => {
  try {
    const res = [];
    const idsStr = execSync(`docker-compose -p ${instanceid} ps -q`, {
      cwd: folder
    })
      .toString()
      .trim();

    const ids = idsStr.match(/[^\r\n]+/g);

    for (const id of ids) {
      const jsonInfoStr = execSync(
        `docker inspect --format='{{json .}}' ${id}`,
        {
          cwd: folder
        }
      ).toString();

      const jsonInfo = JSON.parse(jsonInfoStr);
      res.push(jsonInfo);
    }

    cxt.logger.debug("compose.instance", { res: res.map(({ Id: id }) => id) });
    return res;
  } catch (e) {
    cxt.logger.debug("compose.container.error", { error: e.toString() });
    throw e;
  }
};
