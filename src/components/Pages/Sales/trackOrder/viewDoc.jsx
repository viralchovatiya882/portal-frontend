import { ArrowLeftOutlined } from "@ant-design/icons";
import ErrorBoundary from "@components/UIComponents/ErrorBoundary";
import Heading from "@components/UIComponents/Heading";
import { CustomInputText as InputChange } from "@components/UIComponents/Input/customInput";
import CustomModal from "@components/UIComponents/Modal";
import { openNotificationWithIcon } from "@components/UIComponents/Toast/notification";
import { getRequestHeader } from "@helpers/service";
import { defaultRequestOptions } from "@settings";
import { getAosSopHtml, getRetriggerRequest } from "@store/SalesOrder/sale.actions";
import { Spin, Button, Col, Divider, Row, Tabs, Typography } from "antd";
import axios from "axios";
import { find, get } from "lodash";
import React, { lazy, Suspense } from "react";
import { connect } from "react-redux";
import validator from "validator";
import { isMobileOrTab } from "../../../../constants";
import { base64toBlob, getScreenSize, numberWithCommas } from "../../../../helpers/utility";
const { TabPane } = Tabs;
const { Text } = Typography;

const AmazonFrame = lazy(() => import("./iframeComponent"));

/**
 * Renders View AOS & SOP Document component
 */
const ViewDocument = props => {
  const { history, location } = props;

  const [requestSignatureModal, setRequestSignatureModal] = React.useState(false);
  const [email, setEmail] = React.useState(get(location, "state.record.email", ""));
  const [emailError, setEmailError] = React.useState(false);
  const [isDocumentAvailable, setIsDocumentAvailable] = React.useState(false);
  const [AOSDoc, setAOSDoc] = React.useState("");
  const [currentTab, setCurrentTab] = React.useState("aos");
  const [SOPDoc, setSOPDoc] = React.useState("");
  const [documentLoader, setDocumentLoader] = React.useState(true);

  const [currentDocumentURL, setCurrentDocumentURL] = React.useState("");

  const callback = key => {
    setCurrentTab(key);
    setDocumentLoader(true);
    if (isDocumentAvailable) {
      fetchPDF(key);
    } else {
      handleDocumentDownload(key);
    }
  };

  const fetchPDF = async type => {
    let documentList = get(location, "state.record.docusign_documents.sent_documents", []);

    if (get(location, "state.type") === "view") {
      documentList = get(location, "state.record.docusign_documents.signed_documents", []);
    }

    const info = find(documentList, ["document_type", type]);
    if (get(info, "s3_url")) {
      const rest = await axios({
        method: "GET",
        url: `${process.env.REACT_APP_API_ENDPOINT}/api/get_s3_file_by_url?url=${get(info, "s3_url").trim()}`,
        headers: { ...getRequestHeader() }
      });
      if (type === "AOS") {
        setAOSDoc(`data:application/pdf;base64,${get(rest, "data.file")}#view=fitH`);
      }
      if (type === "SOP") {
        setSOPDoc(`data:application/pdf;base64,${get(rest, "data.file")}#view=fitH`);
      }
    } else {
      openNotificationWithIcon("error", "Track Order", "Document not found");
    }
  };

  const handleDocumentDownload = async (tab, type = "") => {
    const rest = await axios({
      method: "GET",
      url: `${process.env.REACT_APP_API_ENDPOINT}/api/aos_sop_pdf/${get(location, "state.record.sales_order_id")}/${tab}`,
      headers: { ...getRequestHeader() }
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

  React.useEffect(() => {
    setEmail(get(location, "state.record.email", ""));
    let documentList = get(location, "state.record.docusign_documents.sent_documents", null);

    if (get(location, "state.type") === "view") {
      documentList = get(location, "state.record.docusign_documents.signed_documents", null);
    }
    const info = find(documentList, ["document_type", currentTab]);

    if (get(info, "s3_url")) {
      setIsDocumentAvailable(true);
      fetchPDF(currentTab);
    } else {
      setIsDocumentAvailable(false);
      handleDocumentDownload("aos");
    }
  }, []);

  const handleRequestSignatureSubmit = async () => {
    if (email && !validator.isEmail(email)) {
      setEmailError(true);
      return false;
    }

    if (get(location, "state.record")) {
      let requestPayloadOptions = {
        ...defaultRequestOptions,
        sales_order_id: get(location, "state.record.sales_order_id"),
        retriggerEmail: get(location, "state.record.signer_email") ? true : false
      };

      if (email) {
        requestPayloadOptions = { ...requestPayloadOptions, email };
      }

      const requestRetriggerEmail = await props.getRetriggerRequest(requestPayloadOptions);

      if (get(requestRetriggerEmail, "error", false)) {
        openNotificationWithIcon("error", "Track Order", `${get(requestRetriggerEmail, "error.message", "Something Went Wrong")} `);
      }

      if (get(requestRetriggerEmail, "response.status")) {
        openNotificationWithIcon("success", "Track Order", `${get(requestRetriggerEmail, "response.message", "Email Sent Successfully")} `);
        setRequestSignatureModal(false);
        history.push("/track-order");
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

  if (!get(location, "state.record")) {
    history.push("/track-order");
  }
  return (
    <>
      {requestSignatureModal && (
        <CustomModal
          isOpen={requestSignatureModal}
          title={get(location, "state.record.signer_email") ? "Re-Trigger Email" : "Send E-mail"}
          okText="Send"
          handleClose={handleRequestSignatureToggle}
          handleOk={handleRequestSignatureSubmit}
        >
          <>
            {get(location, "state.record.signer_email") && (
              <Text type="danger">
                Note: An earlier e-mail sent to {get(location, "state.record.signer_email")} on {get(location, "state.record.email_sent_at")} will
                become invalid after this action.
              </Text>
            )}
            <InputChange
              validateStatus={emailError && "error"}
              helpText={emailError && "Enter Valid Email Address"}
              handleChange={handleChange}
              value={email}
              type="email"
              className="mt-0 mb-0 w-100"
              label="Email Address"
            />
          </>
        </CustomModal>
      )}
      <div className="d-flex justify-content-between">
        <Heading text={get(location, "state.title")} variant="h4" className="mt-2" />
        <Button className="float-right" type="primary" onClick={() => history.push("/track-order")} icon={<ArrowLeftOutlined />}>
          {getScreenSize() > isMobileOrTab && "Back"}
        </Button>
      </div>

      <div className="bg-white p-4" style={{ minHeight: "950px" }}>
        <ErrorBoundary>
          <div className="track_order__summary">
            <div className="track_order__summary__details mb-4">
              <Divider orientation="left">ORDER SUMMARY</Divider>
              <Row className="mt-4" style={{ fontSize: "0.9rem" }}>
                <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 8 }} lg={{ span: 4 }}>
                  <Text type="secondary">Order Id:</Text>
                  <p> {get(location, "state.record.sales_order_id", "NA")} </p>
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 8 }} lg={{ span: 4 }}>
                  <Text type="secondary">Customer Name:</Text>
                  <p> {get(location, "state.record.customer_name", "NA")} </p>
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 8 }} lg={{ span: 5 }}>
                  <Text type="secondary">Order Placed:</Text>
                  <p> {get(location, "state.record.created_at")} </p>
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 8 }} lg={{ span: 4 }}>
                  <Text type="secondary">Total Case:</Text>
                  <p> {get(location, "state.record.total_order_items", "NA")} </p>
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 8 }} lg={{ span: 4 }}>
                  <Text type="secondary">Total Order Value:</Text>
                  <p>
                    {" "}
                    {get(location, "state.record.total_order_value")
                      ? `£ ${numberWithCommas(get(location, "state.record.total_order_value", 0))}`
                      : "NA"}{" "}
                  </p>
                </Col>
              </Row>
            </div>
            <div className="track_order__summary__documents">
              <Divider orientation="left">AOS & SOP DOCUMENTS</Divider>
              <Spin spinning={documentLoader}>
                <Tabs defaultActiveKey="1" onChange={callback}>
                  <TabPane tab="AOS Document" key="aos">
                    <Suspense fallback={<div>Loading...</div>}>
                      {isDocumentAvailable ? (
                        <AmazonFrame src={AOSDoc} width="100%" height="600px" />
                      ) : (
                        <AmazonFrame src={currentDocumentURL} width="100%" height="600px" />
                      )}
                    </Suspense>
                  </TabPane>
                  <TabPane tab="SOP Document" key="sop">
                    <Suspense fallback={<div>Loading...</div>}>
                      {isDocumentAvailable ? (
                        <AmazonFrame src={SOPDoc} width="100%" height="600px" />
                      ) : (
                        <AmazonFrame src={currentDocumentURL} width="100%" height="600px" />
                      )}
                    </Suspense>
                  </TabPane>
                </Tabs>
              </Spin>
            </div>
            {/* {get(location, "state.type") !== "view" && get(location, "state.record.confirmation_status", "").toLowerCase() !== "confirmed" && (
              <div className="track_order__summary__signature">
                <Button className="float-right mt-3" type="primary" onClick={handleRequestSignatureToggle}>
                  {getScreenSize() > isMobileOrTab && "Send E-mail"}
                </Button>
              </div>
            )} */}
          </div>
        </ErrorBoundary>
      </div>
    </>
  );
};
export default connect(
  state => ({
    loading: state.salesOrder.loading,
    error: state.salesOrder.failure
  }),
  { getRetriggerRequest, getAosSopHtml }
)(ViewDocument);
