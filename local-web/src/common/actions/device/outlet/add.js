import React, { useState, useEffect } from "react";
import _ from "lodash";
import validator from "validator";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import {
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  FormText,
  FormFeedback
} from "reactstrap";
import { Button, DropdownItem } from "reactstrap";
import { useMutation } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import Loading from "UI/utils/loading";
import * as ValidationUtils from "PKG/linker-validation";
import { DeviceFragment } from "Fragments/device";
import * as Mutation from "UI/utils/mutation";

import * as InfoUtils from "UI/utils/info";

const mutation = gql`
  mutation DeviceOutletCreate(
    $deviceid: String!
    $outletid: String!
    $src: EndpointInput!
  ) {
    viewer {
      devices {
        device(deviceid: $deviceid) {
          outlets {
            create(outletid: $outletid, src: $src) {
              ...DeviceFragment
            }
          }
        }
      }
    }
  }
  ${DeviceFragment}
`;
const validate = values => {
  const outletid =
    !validator.isEmpty(values.outletid) &&
    ValidationUtils.isEntityName(values.outletid);

  const host =
    !validator.isEmpty(values.host) &&
    validator.isURL(values.host, {
      require_protocol: false,
      require_tld: false
    });
  const port = validator.isInt(values.port.toString(), {
    min: 1,
    max: 65535
  });

  return {
    fields: {
      outletid,
      host,
      port
    },
    valid: outletid && host && port
  };
};

export default ({ device, history, initial }) => {
  const [isOpen, setOpen] = useState(false);
  const close = () => setOpen(false);
  const open = () => setOpen(true);
  const toggle = () => {
    if (!isOpen === false) {
      reset();
    }
    setOpen(!isOpen);
  };

  const [form, updateForm] = useState({
    fields: initial,
    validation: validate(initial),
    touched: {}
  });

  const field = (fieldName, fieldValue) =>
    updateForm(form => {
      const modFields = {
        ...form.fields,
        [fieldName]: fieldValue
      };

      const modTouch = {
        ...form.touched,
        [fieldName]: true
      };

      return {
        ...form,
        fields: modFields,
        validation: validate(modFields),
        touched: modTouch
      };
    });

  const reset = (fields = initial) => {
    updateForm(form => ({
      ...form,
      fields,
      validation: validate(fields),
      touched: {}
    }));
  };

  const [
    link,
    { loading: mutationLoading, error: mutationError }
  ] = useMutation(mutation, {
    refetchQueries: () => [],
    onCompleted: ({ viewer }) => {
      reset();
      close();
    },
    onError: Mutation.onError
  });

  const handleFieldChange = event => {
    event.persist();
    const fieldName = event.target.name;
    const fieldValue = event.target.value;

    field(fieldName, fieldValue);
  };

  return (
    <React.Fragment>
      <Button
        size="sm"
        color="secondary"
        disabled={mutationLoading}
        onClick={e => {
          e.preventDefault();
          open();
        }}
      >
        {mutationLoading ? (
          <Loading />
        ) : (
          <span>
            <i className="fa fa-plus"></i>
          </span>
        )}
      </Button>
      <Modal fade={false} isOpen={isOpen} toggle={toggle} size="lg">
        <Form className="form">
          <ModalHeader toggle={toggle}>
            <span>Add service outlet...</span>
          </ModalHeader>
          <ModalBody>
            <InfoUtils.Alert>
              An outlet will forward a service port from a device to the server
              with a ssh -R port forward connection.
            </InfoUtils.Alert>
            <FormGroup>
              <Label for="outletid">Outlet name</Label>
              <Input
                invalid={
                  form.validation.fields.outletid === false &&
                  form.touched.outletid
                }
                type="text"
                name="outletid"
                value={form.fields.outletid}
                onChange={handleFieldChange}
              />

              <FormFeedback>Please enter a valid outletid name.</FormFeedback>
            </FormGroup>

            <FormGroup>
              <Label for="host">Hostname</Label>
              <Input
                invalid={
                  form.validation.fields.host === false && form.touched.host
                }
                type="text"
                name="host"
                value={form.fields.host}
                onChange={handleFieldChange}
              />

              <FormFeedback>
                Please enter a valid host reference name.
              </FormFeedback>
              <FormText color="muted">
                This host is relative to the device {device.deviceid}, hence
                localhost will the the device itself. You can use an IP or
                hostname that is reachable by the {device.deviceid} device.
              </FormText>
            </FormGroup>

            <FormGroup>
              <Label for="port">Port</Label>
              <Input
                invalid={
                  form.validation.fields.port === false && form.touched.port
                }
                type="text"
                name="port"
                value={form.fields.port}
                onChange={handleFieldChange}
              />
              <FormFeedback>Please enter a valid port number.</FormFeedback>
              <FormText color="muted">
                This is the port on the specified hostname.
              </FormText>
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              disabled={mutationLoading || !form.validation.valid}
              onClick={e => {
                e.preventDefault();
                link({
                  variables: {
                    deviceid: device.deviceid,
                    outletid: form.fields.outletid,
                    src: {
                      host: form.fields.host,
                      port: parseInt(form.fields.port)
                    }
                  }
                });
              }}
            >
              {mutationLoading ? <Loading /> : "Add"}
            </Button>

            <Button
              color="secondary"
              disabled={mutationLoading}
              onClick={e => {
                toggle();
                reset();
              }}
            >
              Cancel
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </React.Fragment>
  );
};
