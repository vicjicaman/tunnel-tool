import React, { useState } from "react";
import _ from "lodash";
import { Button } from "reactstrap";
import { useMutation } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import Loading from "UI/utils/loading";
import { DeviceFragment } from "Fragments/device";
import * as Mutation from "UI/utils/mutation";
import ConfirmModal from "UI/utils/confirm";

const mutation = gql`
  mutation DeviceOutletRemove($deviceid: String!, $inletid: String!) {
    viewer {
      devices {
        device (deviceid: $deviceid) {
          inlets {
            inlet(inletid: $inletid) {
              remove {
                ...DeviceFragment
              }
            }
          }
        }
      }
    }
  }
  ${DeviceFragment}
`;

export default ({
  device,
  inlet: {
    inletid
  }
}) => {
  const [
    remove,
    { loading: mutationLoading, error: mutationError }
  ] = useMutation(mutation, {
    refetchQueries: () => [],
    onCompleted: ({}) => {},
    onError: Mutation.onError
  });


  return (
    <ConfirmModal
      trigger={({ open }) => (
        <Button
          size="sm"
          color="danger"
          disabled={mutationLoading}
          onClick={e => {
            e.preventDefault();
            open();
          }}
        >
          {mutationLoading ? <Loading /> : <i className="fa fa-trash"></i>}
        </Button>
      )}
      confirm={({ close }) => (
        <Button
          className="btn btn-danger"
          onClick={e => {
            e.preventDefault();
            remove({
              variables: { deviceid: device.deviceid, inletid }
            });
            close();
          }}
        >
          <i className="fa fa-trash"> Remove</i>
        </Button>
      )}
      body={
        <span>
          Remove the inlet from the device?
        </span>
      }
    />
  );

  return (
    <Button
      color="danger"
      size="sm"
      disabled={mutationLoading}
      onClick={e => {
        e.preventDefault();
        remove({ variables: { deviceid: device.deviceid, inletid } });
      }}
    >
      {mutationLoading ? (
        <Loading />
      ) : (
        <small>
          <i className="fa fa-trash"></i>
        </small>
      )}
    </Button>
  );
};
