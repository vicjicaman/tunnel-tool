import { gql } from "apollo-boost";
import { DeviceOutletFragment } from "./outlet";
import { DeviceInletFragment } from "./inlet";

export const DeviceFragment = gql`
  fragment DeviceFragment on Device {
    id
    deviceid
    service {
      upgradable
      needRestart
    }
    state {
      online
    }
    outlets {
      list {
        ...DeviceOutletFragment
      }
    }
    inlets {
      list {
        ...DeviceInletFragment
      }
    }
  }
  ${DeviceOutletFragment}
  ${DeviceInletFragment}
`;
