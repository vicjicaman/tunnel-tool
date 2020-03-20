import validator from "validator";

export const isEntityName = name => {
  const rx = new RegExp(/[a-z0-9](?:[-a-z0-9]*[a-z0-9])/g);
  const match = rx.exec(name);
  return match !== null && match[0] === name;
};

export const isPort = value =>
  value
    ? validator.isInt(value.toString(), {
        min: 1,
        max: 65535
      })
    : false;
