import React, { useState } from "react";
import * as Notify from "PKG/linker-notify";

export const onError = error => {

  const errors = error.graphQLErrors
    ? error.graphQLErrors.map(error => {
        return error.message;
      })
    : [error.toString()];

  Notify.error({ message: errors.join(",") });
};
