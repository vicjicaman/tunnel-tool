import React, { useState } from "react";
import _ from "lodash";
import { Button } from "reactstrap";
import { useMutation } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import Loading from "UI/utils/loading";
import { DeviceFragment } from "Fragments/device";
import * as Mutation from "UI/utils/mutation";

const mutation = gql`
  mutation DeviceOutletStop($deviceid: String!, $outletid: String!) {
    viewer {
      devices {
        device(deviceid: $deviceid) {
          outlets {
            outlet(outletid: $outletid) {
              state {
                stop {
                  ...DeviceFragment
                }
              }
            }
          }
        }
      }
    }
  }
  ${DeviceFragment}
`;

export default ({ device, outlet }) => {
  const [
    stop,
    { loading: mutationLoading, error: mutationError }
  ] = useMutation(mutation, {
    refetchQueries: () => [],
    onCompleted: ({}) => {},
    onError: Mutation.onError
  });

  const busy = mutationLoading || outlet.state.status !== "active";
  return (
    <Button
      color="danger"
      size="sm"
      disabled={busy}
      onClick={e => {
        e.preventDefault();
        stop({
          variables: { deviceid: device.deviceid, outletid: outlet.outletid }
        });
      }}
    >
      {busy ? (
        <Loading />
      ) : (
        <small>
          <i className="fa fa-stop"></i>
        </small>
      )}
    </Button>
  );
};
