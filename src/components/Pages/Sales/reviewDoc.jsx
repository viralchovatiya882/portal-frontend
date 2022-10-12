import { ArrowDownOutlined, InfoCircleOutlined } from "@ant-design/icons";
import ErrorBoundary from "@components/UIComponents/ErrorBoundary";
import { CustomInputText as InputChange } from "@components/UIComponents/Input/customInput";
import CustomModal from "@components/UIComponents/Modal";
import { openNotificationWithIcon } from "@components/UIComponents/Toast/notification";
import { getRequestHeader } from "@helpers/service";
import { defaultRequestOptions } from "@settings";
import { Spin, Button, Col, Divider, Row, Tabs, Typography } from "antd";
import axios from "axios";
import { get } from "lodash";
import React, { lazy } from "react";
import { connect } from "react-redux";
import validator from "validator";
import { base64toBlob } from "../../../helpers/utility";
import { getAosSopHtml, getProductDesc, getRetriggerRequest } from "../../../store/SalesOrder/sale.actions";
const AmazonFrame = lazy(() => import("./trackOrder/iframeComponent"));
const { TabPane } = Tabs;
const { Text } = Typography;

/**
 * Renders Review & Re-trigger AOS & SOP Document component
 */
const ReviewDocument = props => {
  const [currentTab, setCurrentTab] = React.useState("aos");

  const [currentDocumentURL, setCurrentDocumentURL] = React.useState("");
  const [documentLoader, setDocumentLoader] = React.useState(true);

  const [requestSignatureModal, setRequestSignatureModal] = React.useState(false);
  const [email, setEmail] = React.useState(get(props, "finalResp.data.customer_details.email", ""));
  const [emailError, setEmailError] = React.useState(false);

  React.useEffect(() => {
    setEmail(get(props, "finalResp.data.customer_details.email", ""));
  }, []);

  const handleRequestSignatureSubmit = async () => {
    if (!email) {
      setEmailError(true);
      return false;
    }

    if (email && !validator.isEmail(email)) {
      setEmailError(true);
      return false;
    }

    if (get(props, "finalResp.sales_order_id")) {
      let requestPayloadOptions = {
        ...defaultRequestOptions,
        sales_order_id: get(props, "finalResp.sales_order_id"),
      };

      if (email) {
        requestPayloadOptions = { ...requestPayloadOptions, email };
      }

      const requestRetriggerEmail = await props.getRetriggerRequest(requestPayloadOptions);

      if (get(requestRetriggerEmail, "error", false)) {
        openNotificationWithIcon("error", "Create New Order", `${get(requestRetriggerEmail, "error.message", "Something Went Wrong")} `);
      }

      if (get(requestRetriggerEmail, "response.status")) {
        openNotificationWithIcon("success", "Create New Order", `${get(requestRetriggerEmail, "response.message", "Email Sent Successfully")} `);
        props.handleRetriggerEmail(get(requestRetriggerEmail, "response.data", { email }));
        setRequestSignatureModal(false);
      }
    }
  };

  const handleRequestSignatureToggle = () => {
    setRequestSignatureModal(val => !val);
  };

  const handleChange = (key, value) => {
    setEmail(value);
    setEmailError(false);
  };

  const callback = key => {
    setCurrentTab(key);
    setDocumentLoader(true);
    if (key !== currentTab) {
      handleDocumentDownload(key);
    }
  };

  React.useEffect(() => {
    handleDocumentDownload("aos");
  }, []);

  const handleDocumentDownload = async (tab, type) => {
    const rest = await axios({
      method: "GET",
      url: `${process.env.REACT_APP_API_ENDPOINT}/api/aos_sop_pdf/${get(props, "finalResp.sales_order_id")}/${tab}`,
      headers: { ...getRequestHeader() },
    }).catch(err => {
      openNotificationWithIcon("error", "Document View", `${get(err, "response.data.message", "Something Went Wrong")} `);
    });

    if (get(rest, "status") === 200 && get(rest, "data.pdf")) {
      const blob = base64toBlob(get(rest, "data.pdf"), "application/pdf");
      const createdURL = URL.createObjectURL(blob);
      setDocumentLoader(false);
      if (type === "download") {
        window.open(createdURL, "_new");
      } else {
        setCurrentDocumentURL(createdURL);
      }
    } else {
      openNotificationWithIcon("error", "Document View", `${get(rest, "data.message", "Something Went Wrong")} `);
    }
  };

  return (
    <>
      <div className="bg-white">
        <ErrorBoundary>
          {requestSignatureModal && (
            <CustomModal
              isOpen={requestSignatureModal}
              title="Send E-mail"
              okText="Submit"
              handleClose={handleRequestSignatureToggle}
              handleOk={handleRequestSignatureSubmit}
            >
              <>
                <Text type="danger">
                  <InfoCircleOutlined className="pr-2" /> On Submit, an automated email will be triggered to the customer for electronic signature.
                  Please confirm the contact details before Submitting.
                </Text>
                <InputChange
                  validateStatus={emailError && "error"}
                  helpText={emailError && "Enter Valid Email Address"}
                  handleChange={handleChange}
                  value={email}
                  type="email"
                  className="mt-2 mb-0 w-100"
                  label="Email Address"
                />
              </>
            </CustomModal>
          )}
          <div className="view-document">
            <div className="track_order__summary__details mb-4">
              <Divider orientation="left">ORDER SUMMARY</Divider>
              <Row className="mt-4" style={{ fontSize: "0.9rem" }}>
                <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 8 }} lg={{ span: 4 }}>
                  <Text type="secondary">Order Id:</Text>
                  <p> {get(props, "finalResp.sales_order_id", "NA")} </p>
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 8 }} lg={{ span: 4 }}>
                  <Text type="secondary">Customer Name:</Text>
                  <p> {get(props, "finalResp.data.customer_details.customer_name", "NA")} </p>
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 8 }} lg={{ span: 5 }}>
                  <Text type="secondary">Order Placed:</Text>
                  <p> {get(props, "finalResp.order_created_at", "NA")} </p>
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 8 }} lg={{ span: 4 }}>
                  <Text type="secondary">Total Case:</Text>
                  <p> {get(props, "finalResp.data.total_case", "NA")} </p>
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 8 }} lg={{ span: 4 }}>
                  <Text type="secondary">Total Order Value:</Text>
                  <p> {get(props, "finalResp.data.total_order_value") ? `£ ${get(props, "finalResp.data.total_order_value")}` : "NA"} </p>
                </Col>
              </Row>
            </div>
            <div className="track_order__summary__documents">
              <Divider orientation="left">AOS & SOP DOCUMENTS</Divider>
              {/* <Button
                type="primary"
                className="float-right"
                style={{ position: "relative", zIndex: 1 }}
                icon={<ArrowDownOutlined />}
                onClick={() => handleDocumentDownload(currentTab, "download")}
              >
                Download {currentTab.toUpperCase()} Document
              </Button> */}
              <Spin spinning={documentLoader}>
                <Tabs defaultActiveKey="1" className="w-100" onChange={callback}>
                  <TabPane tab="AOS Document" key="aos">
                    <AmazonFrame src={currentDocumentURL} width="100%" height="600px" />
                  </TabPane>
                  <TabPane tab="SOP Document" key="sop">
                    <AmazonFrame src={currentDocumentURL} width="100%" height="600px" />
                  </TabPane>
                </Tabs>
              </Spin>
            </div>
          </div>
          {/* <Button
            type="primary"
            disabled={get(props, "disableEmailTriggerButton", false)}
            onClick={() => {
              handleRequestSignatureToggle();
            }}
            className="float-right"
          >
            Send E-mail
          </Button> */}
        </ErrorBoundary>
      </div>
    </>
  );
};

export default connect(null, { getRetriggerRequest, getProductDesc, getAosSopHtml })(ReviewDocument);
