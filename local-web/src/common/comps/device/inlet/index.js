import React, { useState } from "react";
import _ from "lodash";
import { Route, NavLink, Switch, Link } from "react-router-dom";

import * as InfoUtils from "UI/utils/info";

import InletStart from "Actions/device/inlet/state/start";
import InletStop from "Actions/device/inlet/state/stop";

import InletRemove from "Actions/device/inlet/remove";

import { Row, Col } from "reactstrap";
import {
  Card as ReactCard,
  ButtonGroup,
  Button,
  CardHeader,
  CardFooter,
  CardBody,
  CardTitle,
  CardText
} from "reactstrap";
import {
  Badge,
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";
import * as LabelUI from "UI/label";
import Field from "UI/utils/field";

export const Icon = () => <i className="fa fa-download"></i>;

export const List = ({
  history,
  device,
  list,
  layout = { entity: true, size: "small", cols: 12 }
}) => {
  return (
    <div>
      {list.length === 0 ? (
        <div className="text-center">No inlets found...</div>
      ) : (
        <Row>
          {list.map((inlet, k) => {
            const { inletid } = inlet;

            const inletProps = { device, inlet, history };

            return (
              <Col
                md={layout.cols}
                lg={layout.size === "small" ? 12 : layout.cols}
                key={k}
              >
                <Row className="ml-1 no-gutters">
                  <Col md={layout.size === "small" ? "12" : "8"}>
                    <Head {...inletProps} />
                  </Col>

                  <Col md="4">
                    <Row className="ml-0">
                      {layout.size !== "small" && <Info {...inletProps} />}
                    </Row>
                  </Col>

                  <Col xs="12 pl-2 pr-2">
                    <Control {...inletProps} />
                  </Col>

                  <Col xs="12">
                    <hr />
                  </Col>
                </Row>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};

const HostsInfo = ({ device, inlet }) => {
  const {
    state: { active, worker, hosts, target }
  } = inlet;

  const { deviceid } = device;

  return (
    <InfoUtils.Modal
      title={"The local hosts file needs to be updated"}
      icon={<i className="fa fa-exclamation-triangle text-warning"></i>}
    >
      {worker && (
        <p>
          You need to add the next entry to the <b>/etc/hosts</b> file on the
          device <b>{deviceid}</b> :
          <span className="d-block">
            <b>
              {worker.ip} {inlet.dest.host}
            </b>
          </span>
        </p>
      )}

      <InfoUtils.Alert>
        If the file /etc/hosts is writable by the user/group that is running the
        local service the entry will be sync automatically.
      </InfoUtils.Alert>

      {hosts === null && (
        <p className="text-warning">
          There's no entry for the host {inlet.dest.host}
        </p>
      )}

      {hosts && worker && (
        <p>
          There entry for the host {inlet.dest.host} is using the incorrect IP
          address
        </p>
      )}

      {worker && (
        <p>
          You can also access the service using the IP and target port on the
          device <b>{deviceid}</b>:
          <span className="d-block">
            <b>
              {worker.ip}:{inlet.dest.port}
            </b>
          </span>
        </p>
      )}
    </InfoUtils.Modal>
  );
};

export const Head = ({ history, device, inlet, title = false }) => {
  const {
    state: { active, worker, hosts, target }
  } = inlet;

  const targetActive = target && target.state.active;
  const valid = hosts && worker && hosts.ip === worker.ip;

  const hostsInfo = valid ? (
    <i className="fa fa-check-circle text-success"></i>
  ) : (
    <HostsInfo device={device} inlet={inlet} />
  );

  const lbl = (
    <span className="d-block">
      <Icon /> {inlet.inletid}{" "}
      {active && targetActive && inlet.dest.host !== "localhost" && hostsInfo}
    </span>
  );
  return (
    <div>
      {title ? <h4>{lbl}</h4> : lbl}

      <small className={!targetActive ? "text-muted" : ""}>
        {inlet.target.deviceid}:{inlet.target.outletid}
      </small>
    </div>
  );
};

export const Info = ({ history, device, inlet }) => {
  return (
    <Row className="no-gutters">
      <Col></Col>
    </Row>
  );
};

export const Control = ({ history, device, inlet }) => {
  const {
    state: { active, target }
  } = inlet;

  return (
    <div>
      <div className="float-right">
        {target && target.state.active && (
          <span>
            {!active ? (
              <InletStart device={device} inlet={inlet} />
            ) : (
              <InletStop device={device} inlet={inlet} />
            )}
          </span>
        )}{" "}
        <InletRemove device={device} inlet={inlet} />
      </div>
    </div>
  );
};
