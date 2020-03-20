import React, { useState } from "react";
import Query from "UI/utils/query";

export default ({ query, variables, list: getList, children, noitems }) => (
  <Query query={query} variables={variables}>
    {props => {
      const { data } = props;

      const list = getList(data);
      return list.length === 0 ? (
        noitems ? (
          noitems
        ) : (
          <div className="p-2 text-center">No items found... </div>
        )
      ) : (
        children({ ...props, list })
      );
    }}
  </Query>
);
