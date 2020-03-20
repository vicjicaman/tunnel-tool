import { gql } from "apollo-boost";


export const ServiceFragment = gql`
  fragment ServiceFragment on Service {
    upgradable
    needRestart
    messages {
      type
      message
    }
  }
`;
