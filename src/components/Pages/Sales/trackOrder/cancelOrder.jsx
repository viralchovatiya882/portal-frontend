import { isBlank } from "@helpers/utility";
import { CustomInputTextArea as InputTextArea } from "@ui-components/Input/customInput";
import { Col, Divider, Modal, Row, Spin, Typography } from "antd";
import { get } from "lodash";
import React from "react";
const { Text } = Typography;
export const CancelOrderUI = props => {
  const [comments, setComments] = React.useState("");
  const [commentsError, setCommentsError] = React.useState(false);

  const handleOk = () => {
    if (isBlank(comments)) {
      setCommentsError(true);
      return false;
    }
    props.handleSubmit(comments, get(props, "record.sales_order_id", "NA"));
  };

  return (
    <Modal
      title={`${get(props, "title", "")} : # ${get(props, "record.sales_order_id", "NA")}`}
      visible={get(props, "isModalVisible", false)}
      onOk={handleOk}
      className="cancel_order"
      okText="Yes"
      cancelText="No"
      centered
      width={1000}
      onCancel={() => props.handleCancel()}
    >
      <Spin spinning={get(props, "loading", false)}>
        <Row style={{ fontSize: "0.9rem" }}>
          <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 6 }} lg={{ span: 6 }}>
            <Text type="secondary">Customer Name:</Text>
            <p> {get(props, "record.customer_name", "NA")} </p>
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 6 }} lg={{ span: 6 }}>
            <Text type="secondary">Order Placed:</Text>
            <p> {get(props, "record.created_at")} </p>
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 6 }} lg={{ span: 6 }}>
            <Text type="secondary">Total Case:</Text>
            <p> {get(props, "record.total_order_items", "NA")} </p>
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 6 }} lg={{ span: 6 }}>
            <Text type="secondary">Total Order Value:</Text>
            <p> {get(props, "record.total_order_value") ? `£ ${get(props, "record.total_order_value")}` : "NA"} </p>
          </Col>
        </Row>
        <Divider />
        <p>Are you sure you want to cancel this order? The allocated quantities will be reversed.</p>
        {/* {get(props, "record.signer_email") && (
          <Text type="secondary">{`Re-triggered Document email has been sent to ${get(props, "record.signer_email", "")} dated ${get(props, "record.email_sent_at", "")}`}</Text>
        )} */}
        <InputTextArea
          handleChange={(key, value) => {
            setCommentsError(false);
            setComments(value);
          }}
          className="mt-3 mb-0 w-100"
          type="reason"
          value={comments}
          label="Reason"
          required
          placeholder="Why do you want to Cancel the Order?"
          validateStatus={commentsError && "error"}
          helpText={commentsError && "Reason cannot be empty"}
        />
      </Spin>
    </Modal>
  );
};
