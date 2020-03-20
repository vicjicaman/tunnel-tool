import { gql } from "apollo-boost";

export const DeviceOutletFragment = gql`
  fragment DeviceOutletFragment on DeviceOutlet {
    id
    outletid
    src {
      host
      port
    }
    state {
      active
      status
      worker {
        workerid
        ip
        port
      }
    }
  }
`;
