import { getRequestHeader } from "@helpers/service";
import { openNotificationWithIcon } from "@ui-components/Toast/notification";
import { Col, Row } from "antd";
import axios from "axios";
import { get } from "lodash";
import React from "react";
import validator from "validator";
import { CustomInputText as InputChange } from "../../../UIComponents/Input/customInput";
import DocumentViewer from "./documentViewer";
import "./index.scss";

const ViewDocument = props => {
  const [email, setEmail] = React.useState(get(props, "record.customerDetails.email", ""));
  const [emailError, setEmailError] = React.useState(false);
  const [htmlTemplate, setHtmlTemplate] = React.useState(null);

  const fetchTemplate = async () => {
    const totalSpirits = [...get(props, "record.spiritAdded", []), ...get(props, "record.new_sales_order_items", [])];

    const expectedObj = {
      customer_details: get(props, "record.customerDetails", {}),
      shipping_details: get(props, "record.shippingDetails", {}),
      items: totalSpirits,
      additional_charges: get(props, "record.additionalCharges", {}),
      supporting_documents: get(props, "record.supporting_documents", {}),
      notes: get(props, "record.notes", ""),
      special_conditions: get(props, "record.special_conditions", ""),
      sales_order_type: get(props, "record.sales_order_type", "sales_order"),
      sales_associate: get(props, "record.customerDetails.sales_associate", "")
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
    fetchTemplate();
  }, []);

  const handleChange = (key, value) => {
    if (key === "email") {
      setEmail(value);
      if (validator.isEmail(value)) {
        setEmailError(false);
        props.handleCustomerPostingDetails({ [key]: value });
      } else {
        setEmailError(true);
      }
    }
  };

  return (
    <div className="review-document bg-white">
      <div className="view-document" style={{ minHeight: "600px" }}>
        <DocumentViewer htmlString={htmlTemplate} style={{paddingRight: 20}} />
      </div>
      <div>
        <p style={{ color: "#007bff", fontSize: 13.5, margin: "10px 0px" }}>
          <span style={{ color: "red", marginRight: 3 }}>*</span>On Submit, an automated email will be triggered to the customer to view this document. Please confirm the contact details before submitting.
        </p>
      </div>
      <div className="customer-detail">
        <Row>
          <Col xs={{ span: 24 }} sm={{ span: 8 }}>
            <InputChange
              handleChange={handleChange}
              value={get(props, "record.customerDetails.contact_name", "")}
              type="contact_name"
              className="mt-0 mb-0 w-100"
              label="Contact Name"
              disabled
            />
          </Col>
          <Col className="pl-sm-3" xs={{ span: 24 }} sm={{ span: 8 }}>
            <InputChange
              handleChange={handleChange}
              value={get(props, "record.customerDetails.phone_no", "")}
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
  );
};

export default ViewDocument;
