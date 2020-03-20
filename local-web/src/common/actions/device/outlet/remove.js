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
  mutation DeviceOutletRemove($deviceid: String!, $outletid: String!) {
    viewer {
      devices {
        device(deviceid: $deviceid) {
          outlets {
            outlet(outletid: $outletid) {
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

export default ({ device, outlet: { outletid } }) => {
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
              variables: { deviceid: device.deviceid, outletid }
            });
            close();
          }}
        >
          <i className="fa fa-trash"> Remove</i>
        </Button>
      )}
      body={
        <span>
          Remove the oulet and the associated inlets from all the devices?!
        </span>
      }
    />
  );
};
