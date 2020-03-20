import React, { useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

export default ({ trigger: TriggerButton, confirm: ConfirmButton, body }) => {
  const [isOpen, setModalState] = useState(false);
  const close = () => setModalState(false);
  const open = () => setModalState(true);

  return (
    <React.Fragment>
      <TriggerButton open={open} />
      <Modal fade={false}  isOpen={isOpen} toggle={close}>
        <ModalHeader toggle={close}>Confirmation...</ModalHeader>
        <ModalBody>{body}</ModalBody>
        <ModalFooter>
          <ConfirmButton close={close} />{" "}
          <Button color="secondary" onClick={close}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};
