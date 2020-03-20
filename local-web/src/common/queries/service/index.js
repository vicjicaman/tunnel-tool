import { gql } from "apollo-boost";
import { ServiceFragment } from "Fragments/service";

export const Get = gql`
  query Service {
    viewer {
      id
      service {
        ...ServiceFragment
      }
    }
  }
  ${ServiceFragment}
`;
