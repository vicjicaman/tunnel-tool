import React, { useState } from "react";
import { Query } from "react-apollo";
import LoadingIcon from "UI/utils/loading";
import { Alert } from "reactstrap";

export default ({ query, variables, children }) => (
  <Query query={query} variables={variables}>
    {props => {
      const { loading, error, data } = props;

      if (loading)
        return (
          <div className="p-2 text-center">
            <LoadingIcon />
          </div>
        );
      if (error) {
        const errors = error.graphQLErrors
          ? error.graphQLErrors.map(error => {
              return error.message;
            })
          : [error.toString()];

        return (
          <div>
            <p>
              <b className="text-danger">Query error:</b> {errors.join(",")}
            </p>
            <Alert color="warning" fade={false}>
              Please check the pivot and cluster handler troubleshooting section
            </Alert>
          </div>
        );
      }

      return children(props);
    }}
  </Query>
);
