
import { request } from "PKG/linker-request";

const DEVICE_OUTLET_RESET = `mutation ServerOutletReset ($deviceid: String!, $outletid: String! ) {
  viewer {
    devices {
      device(deviceid: $deviceid) {
        outlets {
          outlet(outletid: $outletid) {
            state {
              reset {
                id
                deviceid
              }
            }
          }
        }
      }
    }
  }
}
`;

export const reset = async ({ deviceid, outletid }, cxt) => {
  const port = 9000;

  const url = `http://graph:${port}/graphql`;
  cxt.logger.debug("graph.device.reset", {
    url,
    deviceid,
    outletid
  });
  const res = await request(
    url,
    DEVICE_OUTLET_RESET,
    {
      deviceid,
      outletid
    },
    {},
    cxt
  );

  const {
    viewer: {
      devices: {
        device: {
          outlets: {
            outlet: {
              state: { reset }
            }
          }
        }
      }
    }
  } = res;

  cxt.logger.debug("graph.device.reset", {
    deviceid: reset.deviceid,
    outletid
  });

  return reset;
};
