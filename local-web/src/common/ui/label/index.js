import React from "react";
import { Badge } from "reactstrap";

export const Icon = () => <i className="fa fa-tag"></i>;

export const Label = ({ color = "info", label: { name, value } }) => (
  <Badge color={color} pill>
    <small>
      <Icon /> {name}:<b>{value}</b>
    </small>
  </Badge>
);
