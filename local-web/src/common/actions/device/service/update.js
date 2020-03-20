import React, { useState } from "react";
import _ from "lodash";
import { Button } from "reactstrap";
import { useMutation } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import Loading from "UI/utils/loading";
import { ServiceFragment } from "Fragments/service";
import * as Mutation from "UI/utils/mutation";
import { DeviceFragment } from "Fragments/device";

const mutation = gql`
  mutation DeviceServiceUpdate($deviceid: String!) {
    viewer {
      devices {
        device(deviceid: $deviceid) {
          service {
            update {
              ...DeviceFragment
            }
          }
        }
      }
    }
  }
  ${DeviceFragment}
`;

export default ({ device: { deviceid } }) => {
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
        upgrade({ variables: { deviceid } });
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
