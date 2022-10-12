import { Button, Modal } from "antd";
import React from "react";

const OrderConfirmation = props => {
  return (
    <>
      <Modal
        title="Order Confirmation"
        visible={props.isOpen}
        centered
        footer={[
          <Button key="OK" type="secondary" onClick={() => props.handleOrderConfirmationModal()}>
            Cancel
          </Button>,
          <Button key="OK" type="primary" onClick={() => props.handleConfirmationSubmit()}>
            Place Order
          </Button>,
        ]}
      >
        <>
          <span className="mb-2">
            Are you sure you want to submit the order ?<br /> Please review before placing the order.
          </span>
        </>
      </Modal>
    </>
  );
};

export default OrderConfirmation;
