import { gql } from "apollo-boost";

export const Get = gql`
  query {
    viewer {
      id
    }
  }
`;
