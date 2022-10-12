import { getRequestHeader } from "@helpers/service";
import { openNotificationWithIcon } from "@ui-components/Toast/notification";
import { CustomInputText as InputChange } from "../../../UIComponents/Input/customInput";
import DocumentViewer from "../viewDocuments/documentViewer";
import { Modal, Col, Row } from "antd";
import axios from "axios";
import { get } from "lodash";
import React from "react";
import validator from "validator";

const ConvertOrderTypeModal = props => {
  const [email, setEmail] = React.useState(get(props, "record.email", ""));
  const [emailError, setEmailError] = React.useState(false);
  const [htmlTemplate, setHtmlTemplate] = React.useState(null);

  const fetchTemplate = async () => {
    const expectedObj = {
      sales_order_id: get(props, "record.sales_order_id")
    };

    const rest = await axios({
      method: "POST",
      data: expectedObj,
      url: `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/customer_mail_template`,
      headers: { ...getRequestHeader() }
    }).catch(err => {
      openNotificationWithIcon("error", `${get(err, "response.data.message", "Something Went Wrong")} `);
    });

    if (get(rest, "data.status")) {
      setHtmlTemplate(get(rest, "data.htmlTemplate"));
    }
  };

  React.useEffect(() => {
    if (get(props, "record.email")) {
      fetchTemplate();
      setEmail(get(props, "record.email", ""));
    }
  }, []);

  const handleChange = (key, value) => {
    if (key === "email") {
      setEmail(value);
      if (validator.isEmail(value)) {
        setEmailError(false);
      } else {
        setEmailError(true);
      }
    }
  };

  const handleSave = () => {
    if (!emailError) {
      props.handleSubmit(email);
      closeModal();
    }
  };

  const closeModal = () => {
    props.handleClose();
  };

  return (
    <>
      <Modal
        title={get(props, "title", "Convert Order Type")}
        centered
        width={1000}
        visible={get(props, "isOpen", false)}
        onOk={() => handleSave()}
        okText={get(props, "okText", "Add")}
        onCancel={() => closeModal()}
        className="convert_customer__order_details"
      >
        <>
          <span>
            Are you sure you want to convert this Reservation to a <b>Sales Order</b>? <br /> Addition of more spirits to the order will <b>NOT</b> be
            allowed, but you will now be able to proceed with the fulfillment steps (print packing list, upload documents, do status updates etc.)
          </span>
          {get(props, "record.customer_response", "").toLowerCase() === "cust_resp_yes" ? (
            <div style={{ color: "#52c41a", margin: "10px 0px" }}>The proforma sale document is already confirmed by the customer.</div>
          ) : (
            <div style={{ color: "#ff603b", margin: "10px 0px" }}>The proforma sale document is not yet confirmed by the customer.</div>
          )}
          <div className="review-document">
            <div className="view-document" style={{ minHeight: "600px" }}>
              <DocumentViewer htmlString={htmlTemplate} />
            </div>
            <div>
              <p style={{ color: "#007bff", fontSize: 13.5, margin: "10px 0px" }}>
                <span style={{ color: "red", marginRight: 3 }}>*</span>On Submit, an automated email will be triggered to the customer to view this
                document. Please confirm the contact details before submitting.
              </p>
            </div>
            <div className="customer-detail">
              <Row>
                <Col xs={{ span: 24 }} sm={{ span: 8 }}>
                  <InputChange
                    handleChange={handleChange}
                    value={get(props, "record.contact_name", "")}
                    type="contact_name"
                    className="mt-0 mb-0 w-100"
                    label="Contact Name"
                    disabled
                  />
                </Col>
                <Col className="pl-sm-3" xs={{ span: 24 }} sm={{ span: 8 }}>
                  <InputChange
                    handleChange={handleChange}
                    value={get(props, "record.phone_no", "")}
                    type="phone_no"
                    className="mt-0 mb-0 w-100"
                    label="Phone No"
                    disabled
                  />
                </Col>
                <Col className="pl-sm-3" xs={{ span: 24 }} sm={{ span: 8 }}>
                  <InputChange
                    validateStatus={emailError && "error"}
                    helpText={emailError && "Enter valid email address"}
                    handleChange={handleChange}
                    value={email}
                    type="email"
                    className="mt-0 mb-0 w-100"
                    label="Email"
                  />
                </Col>
              </Row>
            </div>
          </div>
        </>
      </Modal>
    </>
  );
};

export default ConvertOrderTypeModal;
