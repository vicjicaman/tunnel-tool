import React, { useState } from "react";
import _ from "lodash";
import { Button } from "reactstrap";
import { useMutation } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import Loading from "UI/utils/loading";
import { ServiceFragment } from "Fragments/service";
import * as Mutation from "UI/utils/mutation";

const mutation = gql`
  mutation ServiceUpdate {
    viewer {
      service {
        update {
          id
          service {
            ...ServiceFragment
          }
        }
      }
    }
  }
  ${ServiceFragment}
`;

export default () => {
  const [
    upgrade,
    { loading: mutationLoading, error: mutationError }
  ] = useMutation(mutation, {
    refetchQueries: () => [],
    onCompleted: ({}) => {},
    onError: Mutation.onError
  });

  const busy = mutationLoading;

  return (
    <Button
      color="link"
      size="sm"
      disabled={busy}
      onClick={e => {
        e.preventDefault();
        upgrade();
      }}
    >
      {busy ? (
        <Loading />
      ) : (
        <small>
          <i className="fa fa-cogs"></i> Update
        </small>
      )}
    </Button>
  );
};
