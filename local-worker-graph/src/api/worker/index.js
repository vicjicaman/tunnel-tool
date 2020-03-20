import { spawn } from "child-process-promise";
import fs from "fs";
import path from "path";
import _ from "lodash";
import * as TunnelApi from "PKG/linker-tunnel";
import * as OperationUtils from "PKG/linker-operation";
import * as ServerApi from "Api/server";

const WORKER_DATA = {
  workerid: null,
  ip: null,
  inlets: [],
  outlets: [],
  active: {}
};

export const get = async cxt => {
  const { workerid, ip, inlets, outlets } = WORKER_DATA;

  for (const inlet of inlets) {
    const { src, dest } = inlet;
    inlet.state = { status: "working" };
    const inletid = `inlet-${dest.port}`;
    const op = OperationUtils.get(inletid + "_op", cxt);

    if (op) {
      if (!op.retry && op.status === "running") {
        inlet.state.status = "active";
      }

      if (op.status === "error") {
        inlet.state.status = "error";
      }
    }
  }

  for (const outlet of outlets) {
    const { src, dest } = outlet;
    outlet.state = { status: "working" };
    const outletid = `outlet-${dest.port}`;
    const op = OperationUtils.get(outletid + "_op", cxt);

    if (op) {
      if (!op.retry && op.status === "running") {
        outlet.state.status = "active";
      }

      if (op.status === "error") {
        outlet.state.status = "error";
      }
    }
  }

  return WORKER_DATA;
};

export const init = async ({ workerid, ip }, cxt) => {
  WORKER_DATA.workerid = workerid;
  WORKER_DATA.ip = ip;
};

export const set = async (inlets, outlets, cxt) => {
  const { workerid, ip } = WORKER_DATA;

  WORKER_DATA.inlets = inlets;
  WORKER_DATA.outlets = outlets;
};

export const update = async cxt => {
  const {
    paths: { keys },
    services: {
      server,
      config: { deviceid }
    }
  } = cxt;

  const { inlets, outlets } = WORKER_DATA;

  const keepids = {};
  for (const inlet of inlets) {
    const { src, dest } = inlet;
    const inletid = `inlet-${dest.port}`;
    keepids[inletid] = true;

    const op = OperationUtils.get(inletid + "_op", cxt);
    if (op === null) {
      cxt.logger.debug("inlet.assign.info", { src, dest });
      try {
        await TunnelApi.listen(
          inletid,
          [
            {
              source: {
                host: src.host,
                port: src.port
              },
              dest: {
                host: "0.0.0.0",
                port: dest.port
              }
            }
          ],
          {
            key: path.join(keys.folder, deviceid, "key"),
            user: "node",
            host: server.host,
            port: server.port
          },
          cxt
        );
      } catch (e) {
        cxt.logger.error("inlet.assign.error", {
          inletid,
          error: e.toString()
        });
      }
    }
  }

  for (const outlet of outlets) {
    const { src, dest } = outlet;
    const outletid = `outlet-${dest.port}`;
    keepids[outletid] = true;

    const op = OperationUtils.get(outletid + "_op", cxt);
    if (op === null) {
      cxt.logger.debug("outlet.assign.info", { src, dest });
      const { src, dest } = outlet;

      try {
        await TunnelApi.remote(
          outletid,
          [
            {
              source: {
                host: src.host === "localhost" ? "boot.graph" : src.host,
                port: src.port
              },
              dest: {
                host: "0.0.0.0",
                port: dest.port
              }
            }
          ],
          {
            key: path.join(keys.folder, deviceid, "key"),
            user: "node",
            host: server.host,
            port: server.port,
            onError: async (operation, error, cxt) => {
              try {
                cxt.logger.debug("device.outlet.reset", {
                  deviceid,
                  tunnelid: outlet.tunnelid
                });
                const res = await ServerApi.reset(
                  { deviceid, outletid: outlet.tunnelid },
                  cxt
                );
              } catch (e) {
                cxt.logger.debug("device.outlet.reset.error", {
                  deviceid,
                  tunnelid: outlet.tunnelid,
                  error: e.toString()
                });
              }
            }
          },
          cxt
        );
      } catch (e) {
        cxt.logger.error("outlet.assign.error", {
          outletid,
          error: e.toString()
        });
      }
    }
  }

  for (const id in WORKER_DATA.active) {
    if (!keepids[id]) {
      const op = OperationUtils.get(id + "_op", cxt);
      if (op) {
        op.data.command = "stop";
        await OperationUtils.stop(op, {}, cxt);
      }
    }
  }

  WORKER_DATA.active = keepids;
};
