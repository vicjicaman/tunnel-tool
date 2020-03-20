import React, { useState } from "react";
import { Route, NavLink, Switch, Link } from "react-router-dom";
import {
  Alert as ReactAlert,
  Card as ReactCard,
  ButtonGroup,
  Button,
  CardHeader,
  CardFooter,
  CardBody,
  CardTitle,
  CardText
} from "reactstrap";
import {
  Modal as ReactModal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "reactstrap";

export const Icon = () => <i className="fa fa-info-circle"></i>;

export const Modal = ({ text, title, children, icon, iconColor="link" }) => {
  const [isOpen, setModalState] = useState(false);
  const close = () => setModalState(false);
  const open = () => setModalState(true);

  return (
    <React.Fragment>
      {text}

      <Button
        size="sm"
        color={iconColor}
        onClick={e => {
          open();
        }}
      >
        {icon ? icon : <Icon />}
      </Button>

      <ReactModal fade={false} isOpen={isOpen} toggle={close} size="lg">
        <ModalHeader toggle={close}>{title}</ModalHeader>
        <ModalBody>{children}</ModalBody>
        <ModalFooter>
          <Button
            color="secondary"
            onClick={e => {
              close();
            }}
          >
            Close
          </Button>
        </ModalFooter>
      </ReactModal>
    </React.Fragment>
  );
};

export const Alert = ({ children, color="info" }) => (
  <ReactAlert color={color} fade={false}>
    <Icon /> {children}
  </ReactAlert>
);
