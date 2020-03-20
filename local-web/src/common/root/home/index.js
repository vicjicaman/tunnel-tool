import React from "react";
import _ from "lodash";
import {
  Route,
  NavLink as NavLinkRoute,
  Switch,
  Link,
  Redirect
} from "react-router-dom";
import { TabContent, TabPane, Nav, NavItem, NavLink } from "reactstrap";
import { Row, Col } from "reactstrap";
import { Query } from "react-apollo";
import OutletsSection from "./outlets";
import InletsSection from "./inlets";

import ServiceUpdate from "Actions/service/update";

import * as ServiceQueries from "Queries/service";

import {
  Alert,
  Card,
  ButtonGroup,
  Button,
  CardHeader,
  CardFooter,
  CardBody,
  CardTitle,
  CardText
} from "reactstrap";

import * as OutletComps from "Comps/device/outlet";
import * as InletComps from "Comps/device/inlet";

export const IconInfo = () => <i className="fa fa-info-circle"></i>;
export const IconWarning = () => <i className="fa fa-exclamation-triangle"></i>;

export default ({ history, viewer }) => {
  const sectionProps = {
    history,
    viewer
  };

  return (
    <div>
      <Row>
        <Col sm="12" md="6">
          <Query query={ServiceQueries.Get}>
            {({ loading, error, data }) => {
              if (loading) return <p>Loading...</p>;
              if (error) return <p>Error: {error}</p>;

              const {
                viewer: {
                  service: { messages, upgradable, needRestart }
                }
              } = data;

              return (
                <div>
                  {needRestart && (
                    <Alert color="warning" fade={false}>
                      <IconWarning /> You need to restart the server side
                      service.
                    </Alert>
                  )}

                  {upgradable && !needRestart && (
                    <Alert color="warning" fade={false}>
                      <IconInfo /> There is an update to the server side
                      service. <ServiceUpdate />
                    </Alert>
                  )}

                  {_.map(messages, ({ type, message }, i) => (
                    <Alert key={i} color={type} fade={false}>
                      <IconInfo /> {message}
                    </Alert>
                  ))}
                </div>
              );
            }}
          </Query>
        </Col>

        <Col sm="12" md="6">
          <ul className="nav nav-pills mt-2">
            <li className="nav-item">
              <NavLinkRoute exact={true} className={"nav-link"} to={"/outlets"}>
                <OutletComps.Icon /> Outlets
              </NavLinkRoute>
            </li>

            <li className="nav-item">
              <NavLinkRoute exact={true} className={"nav-link"} to={"/inlets"}>
                <InletComps.Icon /> Inlets
              </NavLinkRoute>
            </li>
          </ul>
        </Col>
      </Row>

      <Row>
        <Col>
          <Switch>
            <Route
              path={"/"}
              exact={true}
              component={props => (
                <div>
                  <p>
                    Go to the outlets and inlets sections to manage the active
                    tunnels.
                  </p>

                  <Alert color={"info"} fade={false}>
                    <IconInfo /> If you have any question or feedback don't
                    hesitate to open an issue or reach out to vic@repoflow.com
                  </Alert>
                </div>
              )}
            />
            <Route
              path={"/outlets"}
              component={props => (
                <OutletsSection {...props} {...sectionProps} />
              )}
            />
            <Route
              path={"/inlets"}
              component={props => (
                <InletsSection {...props} {...sectionProps} />
              )}
            />
          </Switch>
        </Col>
      </Row>
    </div>
  );
};
