import { Button, Modal, Radio } from "antd";
import React from "react";

const Confirmation = (props) => {
  const [value, setValue] = React.useState("reservation");
  const onStatusChange = (e) => {
    setValue(e.target.value);
  };

  const getText = () => {
    if (value === "sales_order") {
      return <div style={{ fontSize: 12, fontStyle: "italic" }}>A firm order, can not be edited later. An automated Confirmation of Sale document gets triggered to the customer.</div>;
    }

    if (value === "consignment") {
      return (
        <div style={{ fontSize: 12, fontStyle: "italic" }}>
          Order details (spirits/ additional charges/ notes etc.) can be edited later. Multiple proforma confirmation of sale documents can be sent to customer for approval. Can be converted to a
          Sales Order at any time.(Content to be changed later)
        </div>
      );
    }

    return (
      <div style={{ fontSize: 12, fontStyle: "italic" }}>
        Order details (spirits/ additional charges/ notes etc.) can be edited later. Multiple proforma confirmation of sale documents can be sent to customer for approval. Can be converted to a Sales
        Order at any time.
      </div>
    );
  };
  return (
    <>
      <Modal
        title="Select Order Type"
        visible={props.showModal}
        onOk={props.handleRender}
        onCancel={props.handleRender}
        closable={false}
        centered
        width={500}
        maskClosable={false}
        keyboard={false}
        footer={[
          <Button key="OK" type="primary" onClick={() => props.handleRender(false, value)}>
            OK
          </Button>,
        ]}
      >
        <>
          <Radio.Group onChange={onStatusChange} value={value}>
            <Radio value="reservation">Reservation</Radio>
            <Radio value="sales_order" className="pl-sm-3">
              Sales Order
            </Radio>
            {/* <Radio value="consignment" className="pl-sm-3">
              Consignment
            </Radio> */}
          </Radio.Group>
          <div className="mt-3">{getText()}</div>
        </>
      </Modal>
    </>
  );
};

export default Confirmation;
