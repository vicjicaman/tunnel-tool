import React, { useState } from "react";
import _ from "lodash";
import { Route, NavLink, Switch, Link } from "react-router-dom";

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
  Alert,
  Badge,
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";
import * as LabelUI from "UI/label";
import Field from "UI/utils/field";
import * as Outlet from "./outlet";
import * as Inlet from "./inlet";

import * as InfoUtils from "UI/utils/info";

import DeviceServiceUpdate from "Actions/device/service/update";
import DeviceOutletAdd from "Actions/device/outlet/add";

export const IconInfo = () => <i className="fa fa-info-circle"></i>;
export const IconWarning = () => <i className="fa fa-exclamation-triangle"></i>;


const DeviceWarning = ({ device }) => {
  const {
    deviceid,
    service: { needRestart, upgradable }
  } = device;

  return (
    <InfoUtils.Modal
      title={"Warnings for the device " + deviceid}
      icon={<i className="fa fa-exclamation-triangle text-warning"></i>}
    >
      {needRestart && (
        <Alert color="warning" fade={false}>
          <IconWarning /> You need to restart the device's local side service.
        </Alert>
      )}

      {upgradable && (
        <Alert color="warning" fade={false}>
          <IconInfo /> There is an update to the device's local side service.{" "}
          <DeviceServiceUpdate device={device} />
        </Alert>
      )}
    </InfoUtils.Modal>
  );
};

export const Icon = () => <i className="fa fa-cogs"></i>;

export const OnlineLabel = () => (
  <small>
    <Badge color={"success"} pill>
      online
    </Badge>
  </small>
);

export const OfflineLabel = () => (
  <small>
    <Badge color={"secondary"} pill>
      offline
    </Badge>
  </small>
);

//  {device.state.online ? <OnlineLabel /> : <OfflineLabel />}
export const Head = ({ history, device, title = true }) => {
  const lbl = (
    <span className="d-block">
      {device.state.online ? (
        <b className="text-success">{device.deviceid}</b>
      ) : (
        <span className="text-secondary">{device.deviceid}</span>
      )}
      {device.service &&
        device.state.online &&
        (device.service.upgradable || device.service.needRestart) && (
          <DeviceWarning device={device} />
        )}
    </span>
  );
  return <div>{title ? <h4>{lbl}</h4> : lbl}</div>;
};

export const OutletInfo = ({ history, device }) => {
  return (
    <React.Fragment>
      {device.state.online && (
        <Row className="no-gutters">
          <Col>
            <Outlet.List
              history={history}
              device={device}
              list={device.outlets.list}
            />
          </Col>
        </Row>
      )}
    </React.Fragment>
  );
};

export const InletInfo = ({ history, device }) => {
  return (
    <React.Fragment>
      {device.state.online && (
        <Row className="no-gutters">
          <Col>
            <Inlet.List
              history={history}
              device={device}
              list={device.inlets.list}
            />
          </Col>
        </Row>
      )}
    </React.Fragment>
  );
};

export const OutletControl = ({ history, device }) => {
  const initial = { outletid: "", host: "localhost", port: "" };

  return (
    <div>
      {device.state.online && (
        <DeviceOutletAdd history={history} device={device} initial={initial} />
      )}
    </div>
  );
};
