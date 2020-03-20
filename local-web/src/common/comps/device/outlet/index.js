import React, { useState } from "react";
import _ from "lodash";
import { Route, NavLink, Switch, Link } from "react-router-dom";

import InletLink from "Actions/device/inlet/link";

import OutletStart from "Actions/device/outlet/state/start";
import OutletStop from "Actions/device/outlet/state/stop";

import OutletRemove from "Actions/device/outlet/remove";

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
import * as InfoUtils from "UI/utils/info";

const OutletPublicInfo = ({ device, outlet }) => {
  const { deviceid } = device;
  const {
    outletid,
    state: {
      worker: { ip, port }
    }
  } = outlet;

  const proxySnip = `
upstream ${deviceid}-${outletid}-upstream {
  server ${ip}:${port};
}

server {
    listen 443 ssl;
    server_name dev.example.com;

    ssl_certificate /etc/letsencrypt/live/dev.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dev.example.com/privkey.pem;

    location / {
          proxy_redirect off;
          proxy_set_header   X-Real-IP         $remote_addr;
          proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
          proxy_set_header   X-Forwarded-Proto $scheme;
          proxy_set_header   Host              $http_host;
          proxy_set_header   X-NginX-Proxy    true;
          proxy_set_header   Connection "";
          proxy_http_version 1.1;
          proxy_pass         http://${deviceid}-${outletid}-upstream;
     }
  }
`;

  return (
    <InfoUtils.Modal
      title={"Expose outlet to the public"}
      icon={<i className="fa fa-cloud"></i>}
      iconColor="secondary"
    >
      <InfoUtils.Alert color="warning">
        {" "}
        There are two ways to access a device's outlet, create a private inlet
        or <b>expose it to the public</b>. The outlets and inlets are{" "}
        <b>private</b>, if you want to expose an outlet you need to proxy it out
        of the server with the next details.
      </InfoUtils.Alert>

      <p>
        Expose the outlet{" "}
        <b>
          {outletid}@{deviceid}
        </b>{" "}
        on the server.
      </p>

      <p>
        You can use the next IP and port to upstream with a proxy to expose the
        outlet:{" "}
        <b>
          {ip}:{port}
        </b>
      </p>

      <p>
        This is an example of how a proxy like nginx might be configured to
        expose the outlet to <b>https://dev.example.com</b>
      </p>
      <pre>{proxySnip}</pre>
    </InfoUtils.Modal>
  );
};

export const Icon = () => <i className="fa fa-upload"></i>;

export const List = ({
  history,
  device,
  list,
  layout = { entity: true, size: "small", cols: 12 }
}) => {
  return (
    <div>
      {list.length === 0 ? (
        <div className="text-center">No outlets found...</div>
      ) : (
        <Row>
          {list.map((outlet, k) => {
            const {
              outletid,
              src: { host, port }
            } = outlet;

            const outletProps = { device, outlet, history };

            return (
              <Col
                md={layout.cols}
                lg={layout.size === "small" ? 12 : layout.cols}
                key={k}
              >
                <Row className="ml-1 no-gutters">
                  <Col md={layout.size === "small" ? "12" : "8"}>
                    <Head {...outletProps} />
                  </Col>

                  <Col md="4">
                    <Row className="ml-0">
                      {layout.size !== "small" && <Info {...outletProps} />}
                    </Row>
                  </Col>

                  <Col xs="12 pl-2 pr-2">
                    <Control {...outletProps} />
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

export const Head = ({ history, device, outlet, title = false }) => {
  const lbl = (
    <span className="d-block">
      <Icon /> {outlet.outletid}{" "}
    </span>
  );
  return (
    <div>
      {title ? <h4>{lbl}</h4> : lbl}
      <small>
        {outlet.src.host}:{outlet.src.port}
      </small>
    </div>
  );
};

export const Info = ({ history, device }) => {
  return (
    <Row className="no-gutters">
      <Col></Col>
    </Row>
  );
};

export const Control = ({ history, device, outlet }) => {
  const {
    outletid,
    state: { active }
  } = outlet;

  const initial = {
    targetid: "",
    host: device.deviceid + ".local",
    port: ""
  };

  return (
    <div>
      <InletLink device={device} outlet={outlet} initial={initial} />{" "}
      <OutletPublicInfo device={device} outlet={outlet} />
      <div className="float-right">
        {!active ? (
          <OutletStart device={device} outlet={outlet} />
        ) : (
          <OutletStop device={device} outlet={outlet} />
        )}{" "}
        <OutletRemove device={device} outlet={outlet} />
      </div>
    </div>
  );
};
