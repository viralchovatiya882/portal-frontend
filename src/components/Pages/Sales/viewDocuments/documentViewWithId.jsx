import { ArrowLeftOutlined, DownloadOutlined } from "@ant-design/icons";
import ErrorBoundary from "@components/UIComponents/ErrorBoundary";
// import Heading from "@components/UIComponents/Heading";
import { CustomInputText as InputChange } from "@components/UIComponents/Input/customInput";
import CustomModal from "@components/UIComponents/Modal";
import { openNotificationWithIcon } from "@components/UIComponents/Toast/notification";
import { getRequestHeader } from "@helpers/service";
import { defaultRequestOptions } from "@settings";
import { getFileType } from "@helpers/utility";
import { getRetriggerEmailRequest, getProformaRequest } from "@store/SalesOrder/sale.actions";
import { Button, Col, Divider, Row, Spin, Tooltip, Typography } from "antd";
import axios from "axios";
import { get } from "lodash";
import React from "react";
import { connect } from "react-redux";
import validator from "validator";
import { isMobileOrTab } from "../../../../constants";
import { getScreenSize, numberWithCommas } from "../../../../helpers/utility";
import DocumentViewer from "./documentViewer";

const { Text } = Typography;

/**
 * Renders View Document component
 */
const ViewDocumentWithId = props => {
  const { history, location } = props;

  const [requestSignatureModal, setRequestSignatureModal] = React.useState(false);
  const [email, setEmail] = React.useState(get(location, "state.record.email", ""));
  const [emailError, setEmailError] = React.useState(false);

  const [documentLoader, setDocumentLoader] = React.useState(true);
  const [htmlTemplate, setHtmlTemplate] = React.useState(null);

  const fetchTemplate = async () => {
    const expectedObj = { sales_order_id: get(location, "state.record.sales_order_id", "") };

    const rest = await axios({
      method: "POST",
      data: expectedObj,
      url: `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/customer_mail_template`,
      headers: { ...getRequestHeader() }
    }).catch(err => {
      setDocumentLoader(false);
      openNotificationWithIcon("error", `${get(err, "response.data.message", "Something Went Wrong")} `);
    });

    if (get(rest, "data.status")) {
      setDocumentLoader(false);
      setHtmlTemplate(get(rest, "data.htmlTemplate"));
    }

    if (!get(rest, "data.status", true)) {
      setDocumentLoader(false);
      openNotificationWithIcon("error", `${get(err, "data.message", "Something Went Wrong")} `);
    }
  };

  React.useEffect(() => {
    fetchTemplate();
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
        customer_email_for_sending: email
      };
      let requestRetriggerEmail;

      if (get(location, "state.record.sales_order_type", "sales_order") === "sales_order") {
        requestRetriggerEmail = await props.getRetriggerEmailRequest(requestPayloadOptions);
      } else {
        requestRetriggerEmail = await props.getProformaRequest(requestPayloadOptions);
      }

      if (get(requestRetriggerEmail, "error", false)) {
        openNotificationWithIcon("error", "Order Details", `${get(requestRetriggerEmail, "error.message", "Something Went Wrong")} `);
      }

      if (get(requestRetriggerEmail, "response.status")) {
        openNotificationWithIcon("success", "Order Details", `${get(requestRetriggerEmail, "response.message", "Email Sent Successfully")} `);
        setRequestSignatureModal(false);
        history.goBack();
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

  const downloadConfirmationDoc = async () => {
    const rest = await axios({
      method: "GET",
      url: `${process.env.REACT_APP_API_ENDPOINT}/api/getProformaOrConfirmationDocPdf/${get(location, "state.record.sales_order_id")}`,
      headers: { ...getRequestHeader() }
    }).catch(err => {
      openNotificationWithIcon("error", "Order Details", `${get(err, "response.data.message", "Something Went Wrong")} `);
    });

    if (get(rest, "status") === 200) {
      var link = document.createElement("a");
      link.setAttribute("href", `${getFileType("pdf")};base64,${get(rest, "data.pdf")}`);
      link.setAttribute("download", `confirmation_of_sale_doc_${get(location, "state.record.sales_order_id")}_${new Date().toLocaleString().replace(/[/, ]/g, "_")}.pdf`);
      document.body.appendChild(link); // Required for FF
      link.click();
      openNotificationWithIcon("success", "Order Details", "Download Successful");
    } else {
      openNotificationWithIcon("warning", "Order Details", get(rest, "statusText", "Something went wrong"));
    }
  };

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
      {/* <div className="d-flex justify-content-between">
        <Heading text={get(location, "state.title")} variant="h4" className="mt-2" />
        <Button className="float-right" type="primary" onClick={() => history.push("/track-order")} icon={<ArrowLeftOutlined />}>
          {getScreenSize() > isMobileOrTab && "Back"}
        </Button>
      </div> */}
      <div className="mb-3 float-right">
        <Button type="primary" onClick={() => history.goBack()} icon={<ArrowLeftOutlined />}>
          {getScreenSize() > isMobileOrTab && "Back"}
        </Button>
      </div>
      <div className="bg-white p-4 float-left w-100" style={{ minHeight: "900px" }}>
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
                    {get(location, "state.record.total_order_value")
                      ? `£ ${numberWithCommas(get(location, "state.record.total_order_value", 0))}`
                      : "NA"}
                  </p>
                </Col>
              </Row>
            </div>
            <div className="track_order__summary__documents">
              <Divider orientation="left">REVIEW DOCUMENT</Divider>
              <Spin spinning={documentLoader}>
                <Tooltip placement="topLeft" title="Download Confirmation of Sale Doc">
                  <Button
                    type="primary"
                    className="ml-sm-3 float-right"
                    icon={<DownloadOutlined />}
                    size="small"
                    onClick={() => downloadConfirmationDoc()}
                  >
                    Download Doc
                  </Button>
                </Tooltip>
                <div className="view-document float-left mt-3 w-100" style={{ minHeight: "600px" }}>
                  <DocumentViewer htmlString={htmlTemplate} />
                </div>
              </Spin>
            </div>
            {get(location, "state.type") !== "view" && (
              <div className="track_order__summary__signature">
                <Button className="float-right mt-3" type="primary" onClick={handleRequestSignatureToggle}>
                  Send E-mail
                </Button>
              </div>
            )}
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
    loading: get(state, "salesOrder.loading", false),
    error: get(state, "salesOrder.failure")
  }),
  { getRetriggerEmailRequest, getProformaRequest }
)(ViewDocumentWithId);
