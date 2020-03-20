import React, { useState } from "react";

export default ({ label, children }) => (
  <div className="pr-4">
    <span className="d-block text-muted">
      <small>{label}</small>
    </span>
    <span className="d-block">{children}</span>
  </div>
);
