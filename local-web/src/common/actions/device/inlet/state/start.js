import React, { useState } from "react";
import _ from "lodash";
import { Button } from "reactstrap";
import { useMutation } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import Loading from "UI/utils/loading";
import { DeviceFragment } from "Fragments/device";
import * as Mutation from "UI/utils/mutation";

const mutation = gql`
  mutation DeviceOutletStart($deviceid: String!, $inletid: String!) {
    viewer {
      devices {
        device(deviceid: $deviceid) {
          inlets {
            inlet(inletid: $inletid) {
              state {
                start {
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

export default ({ device, inlet }) => {
  const [
    start,
    { loading: mutationLoading, error: mutationError }
  ] = useMutation(mutation, {
    refetchQueries: () => [],
    onCompleted: ({}) => {},
    onError: Mutation.onError
  });

  const busy = mutationLoading || inlet.state.status !== "inactive";

  return (
    <Button
      color="secondary"
      size="sm"
      disabled={busy}
      onClick={e => {
        e.preventDefault();
        start({
          variables: { deviceid: device.deviceid, inletid: inlet.inletid }
        });
      }}
    >
      {busy ? (
        <Loading />
      ) : (
        <small>
          <i className="fa fa-play"></i>
        </small>
      )}
    </Button>
  );
};
