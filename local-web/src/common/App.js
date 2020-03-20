import React from "react";
import Root from "Root";
import { NavItem, NavLink } from "reactstrap";
import { Query } from "react-apollo";
import * as Viewer from "Queries/viewer";
import { Link } from "react-router-dom";

import { Layout } from "@nebulario/tunnel-layout";

export const HomeLink = ({ viewer }) => (
  <NavItem>
    <Link className="nav-link" to="/">
      <i className="fa fa-home" /> Home
    </Link>
  </NavItem>
);

const App = () => {
  return (
    <Query query={Viewer.Get}>
      {({ loading, error, data }) => {
        if (loading) return <p>Loading...</p>;
        if (error) return <p>Error: {error}</p>;

        const { viewer } = data;

        return (
          <Layout
            brand={
              <span>
                <i className="fa fa-compress" /> Tunnels
              </span>
            }
            viewer={viewer}
            left={[<HomeLink key={"home"} viewer={viewer} />]}
            right={[]}
          >
            <Root viewer={viewer} />
          </Layout>
        );
      }}
    </Query>
  );
};

export default App;
