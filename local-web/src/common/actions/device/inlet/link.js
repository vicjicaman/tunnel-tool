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
import * as DeviceQueries from "Queries/device";
import Query from "UI/utils/query";
import { DeviceFragment } from "Fragments/device";
import * as Mutation from "UI/utils/mutation";

import * as InfoUtils from "UI/utils/info";

const mutation = gql`
  mutation DeviceInletCreate(
    $deviceid: String!
    $target: DeviceOutletTargetInput!
    $dest: EndpointInput!
  ) {
    viewer {
      devices {
        device(deviceid: $deviceid) {
          inlets {
            create(target: $target, dest: $dest) {
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
  const targetid = !validator.isEmpty(values.targetid);

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
      targetid,
      host,
      port
    },
    valid: targetid && host && port
  };
};

export default ({ device, outlet, history, initial }) => {
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
            <i className="fa fa-share-alt"></i>
          </span>
        )}
      </Button>
      <Modal fade={false} isOpen={isOpen} toggle={toggle} size="lg">
        <Form className="form">
          <ModalHeader toggle={toggle}>
            <span>Create private inlet</span>
          </ModalHeader>
          <ModalBody>
            <InfoUtils.Alert>
              An inlet will forward a service port from the server to the target
              device with a ssh -L port forward connection.
              <p>
                Once the inlet is created you can access the outlet service on
                the device.{" "}
              </p>
              <p>
                You can have the same port for different hostnames on the same
                device. For example you can have an inlet for localhost:4000 and
                dev.example.com:4000 for the same device.
              </p>
              <p>
                For easier access there should be an entry with the inlet
                hostname on the file /etc/hosts on the target device.
              </p>
            </InfoUtils.Alert>
            <Query query={DeviceQueries.List}>
              {({ data }) => {
                const {
                  viewer: {
                    id,
                    devices: { list }
                  }
                } = data;

                return (
                  <FormGroup>
                    <Label for="name">Target device</Label>

                    <Input
                      invalid={
                        form.validation.fields.targetid === false &&
                        form.touched.targetid
                      }
                      type="select"
                      name="targetid"
                      value={form.fields.targetid}
                      onChange={handleFieldChange}
                    >
                      <option value={""}>Select a device...</option>
                      {list.map(({ deviceid }, k) => (
                        <option key={k} value={deviceid}>
                          {deviceid}
                        </option>
                      ))}
                    </Input>
                    <FormFeedback>
                      Please enter a valid device reference.
                    </FormFeedback>
                  </FormGroup>
                );
              }}
            </Query>

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
                This is a reference hostname for the forwarded service.
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
                This is the destiny port on the target device.
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
                    deviceid: form.fields.targetid,
                    target: {
                      deviceid: device.deviceid,
                      outletid: outlet.outletid
                    },
                    dest: {
                      host: form.fields.host,
                      port: parseInt(form.fields.port)
                    }
                  }
                });
              }}
            >
              {mutationLoading ? <Loading /> : "Link"}
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
