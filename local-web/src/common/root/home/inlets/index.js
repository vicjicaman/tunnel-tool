import React, { useState } from "react";
import _ from "lodash";
import { Route, Switch, Link } from "react-router-dom";
import { Row, Col } from "reactstrap";
import Query from "UI/utils/query";
import List from "UI/utils/list";
import {
  Card,
  ButtonGroup,
  Button,
  CardHeader,
  CardFooter,
  CardBody,
  CardTitle,
  CardText
} from "reactstrap";

import * as LabelUI from "UI/label";
import Field from "UI/utils/field";

import * as DeviceQueries from "Queries/device";
import * as DeviceComp from "Comps/device";
import * as DeviceInletComp from "Comps/device/inlet";

export default ({ history, viewer }) => {
  return (
    <div className="mt-4">
    <h3>
      <DeviceInletComp.Icon /> Inlets
    </h3>
    <hr />
    <p>
      An inlet is a local endpoint on the target device that exposes a server outlet locally.
    </p>
      <List
        query={DeviceQueries.List}
        list={({
          viewer: {
            devices: { list }
          }
        }) => list}
      >
        {({ list: devicesList }) => {
          return (
            <React.Fragment>
              <Row>
                {devicesList.map((device, k) => {
                  const { deviceid } = device;

                  const deviceProps = {
                    history,
                    viewer,
                    device
                  };

                  return (
                    <Col className="mt-4" sm="6" md="4" key={k}>
                      <Card>
                        <CardHeader>
                          <DeviceComp.Head {...deviceProps} link={true} />
                        </CardHeader>
                        <CardBody>
                          <DeviceComp.InletInfo {...deviceProps} />
                        </CardBody>
                        <CardFooter></CardFooter>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </React.Fragment>
          );
        }}
      </List>
    </div>
  );
};
