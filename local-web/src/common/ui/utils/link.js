import React, { useState } from "react";
import _ from "lodash";
import { Link } from "react-router-dom";

export default ({ to, children }) => (
  <Link to={to}>
    <i className="fa fa-arrow-circle-right"></i>
  </Link>
);
