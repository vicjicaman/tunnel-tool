import { gql } from "apollo-boost";

export const DeviceInletFragment = gql`
  fragment DeviceInletFragment on DeviceInlet {
    id
    inletid
    target {
      deviceid
      outletid
    }
    dest {
      host
      port
    }
    state {
      active
      status
      target {
        id
        state {
          active
        }
      }
      worker {
        ip
      }
      hosts {
        ip
      }
    }
  }
`;
