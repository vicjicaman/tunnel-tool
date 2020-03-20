import { gql } from "apollo-boost";
import { DeviceFragment } from "Fragments/device";

export const List = gql`
  query Devices {
    viewer {
      id
      devices {
        list {
          ...DeviceFragment
        }
      }
    }
  }
  ${DeviceFragment}
`;

export const Get = gql`
  query Device($deviceid: String!) {
    viewer {
      id
      devices {
        device(deviceid: $deviceid) {
          ...DeviceFragment
        }
      }
    }
  }
  ${DeviceFragment}
`;
