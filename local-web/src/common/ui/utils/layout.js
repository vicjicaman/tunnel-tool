import React from "react";

export const Title = ({ icon, children }) => (
  <div>
    <h5>
      {icon} {children}
    </h5>
    <hr />
  </div>
);

export const Field = ({ label, control, children }) => (
  <div className="pr-4">
    <span className="d-block text-muted">
      <small>{label}</small> {control}
    </span>
    <span className="d-block">{children}</span>
  </div>
);
