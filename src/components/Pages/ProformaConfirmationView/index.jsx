import { DownloadOutlined } from "@ant-design/icons";
import ErrorBoundary from "@components/UIComponents/ErrorBoundary";
import { getFileType } from "@helpers/utility";
import { CustomInputTextArea as InputTextArea } from "@ui-components/Input/customInput";
import { Button, Col, Radio, Row, Tooltip } from "antd";
import axios from "axios";
import { get, has } from "lodash";
import React from "react";
import validator from "validator";
import { openNotificationWithIcon } from "../../UIComponents/Toast/notification";
import DocumentViewer from "../Sales/viewDocuments/documentViewer";
import "./index.scss";

/**
 * Renders Proforma Confirmation View, public URL
 */
const ProformaConfirmationView = props => {
  const [htmlTemplate, setHTMLTemplate] = React.useState([]);
  const [htmlTopTemplate, setHTMLTopTemplate] = React.useState([]);
  const [remarks, setRemarks] = React.useState("");
  const [isEditable, setIsEditable] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [remarksError, setRemarksError] = React.useState(false);
  const [documentClassName, setDocumentClassName] = React.useState("view_document");
  const [permissionData, setPermissionData] = React.useState(null);
  const messagesEndRef = React.useRef(null);

  const onChange = e => {
    setValue(e.target.value);
    scrollToBottom();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleChange = (key, text) => {
    if (key === "remarks") {
      if (validator.isEmpty(text)) {
        setRemarksError(true);
      } else {
        setRemarksError(false);
      }
      setRemarks(text);
    }
  };

  const getProformaData = async () => {
    const resp = await axios({
      method: "GET",
      url: `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/proforma_data${get(props, "location.search", "")}`
    }).catch(err => {
      openNotificationWithIcon("error", "Proforma Details", `${get(err, "message", "Something went wrong")}`);
    });

    if (get(resp, "status") === 200) {
      updateCurrentState(resp);
    }

    if (!get(resp, "data.status", true) && has(resp, "data.message")) {
      openNotificationWithIcon("error", "Proforma Details", `${get(resp, "data.message", "Something went wrong")}`);
    }
  };

  const downloadProformaDoc = async () => {
    const rest = await axios({
      method: "GET",
      url: `${process.env.REACT_APP_API_ENDPOINT}/api/getCustomerProformaDocPdf${get(props, "location.search", "")}`
    }).catch(err => {
      openNotificationWithIcon("error", "Proforma Doc", `${get(err, "response.data.message", "Something Went Wrong")} `);
    });

    if (get(rest, "status") === 200) {
      var link = document.createElement("a");
      link.setAttribute("href", `${getFileType("pdf")};base64,${get(rest, "data.pdf")}`);
      link.setAttribute("download", `proforma_doc_${new Date().toLocaleString().replace(/[/, ]/g, "_")}.pdf`);
      document.body.appendChild(link); // Required for FF
      link.click();
      openNotificationWithIcon("success", "Proforma Doc", "Download Successful");
    } else {
      openNotificationWithIcon("warning", "Proforma Doc", get(rest, "statusText", "Something went wrong"));
    }
  };

  const updateCurrentState = (resp, type = "") => {
    if (type === "sendConfirmation" || !get(resp, "data.status", true)) {
      setDocumentClassName("view__proforma");
    }

    const permissionResp = {
      customer_response_display: get(resp, "data.customer_response_display", false),
      html_display: get(resp, "data.html_display", false),
      show_print_button: get(resp, "data.show_print_button", false),
      top_section_display: get(resp, "data.top_section_display", false)
    };

    setPermissionData(permissionResp);

    setHTMLTemplate(get(resp, "data.html"));
    setHTMLTopTemplate(get(resp, "data.top_section_content"));
    if (get(resp, "data.customer_action_taken", "yes").toLowerCase() === "no") {
      setIsEditable(true);
    } else {
      setIsEditable(false);
    }
    setRemarks(get(resp, "data.customer_remarks", ""));
    setValue(get(resp, "data.customer_response", ""));
  };

  const sendProformaConfirmation = async () => {
    if (validator.isEmpty(value) && validator.isEmpty(remarks)) {
      openNotificationWithIcon("info", "Proforma Details", "Nothing to update");
      return false;
    }

    if (value.toLowerCase() === "no" && validator.isEmpty(remarks)) {
      setRemarksError(true);
      return false;
    }

    const resp = await axios({
      method: "POST",
      data: {
        customer_response: value,
        customer_remarks: remarks,
        link_url: location.href
      },
      url: `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/proforma_confirmation`
    }).catch(err => {
      openNotificationWithIcon("error", "Proforma Details", `${get(err, "message", "Something went wrong")}`);
    });

    if (get(resp, "status") === 200) {
      updateCurrentState(resp, "sendConfirmation");
      openNotificationWithIcon("success", "Proforma Details", `${get(resp, "data.message", "Submitted Successfully")}`);
    }

    if (!get(resp, "data.status", true) && has(resp, "data.message")) {
      openNotificationWithIcon("error", "Proforma Details", `${get(resp, "data.message", "Something went wrong")}`);
    }
  };

  const scrollTimeOut = () => {
    setDocumentClassName("view__proforma");
    setTimeout(() => {
      setDocumentClassName("view_document");
    }, 1000);
  };

  const keydownHandler = e => {
    if (e.keyCode === 80) {
      scrollTimeOut();
    }
  };

  React.useEffect(() => {
    document.addEventListener("keydown", keydownHandler);
    getProformaData();
  }, []);

  return (
    <div className="p-4">
      <div className="bg-white p-4" style={{ minHeight: "50vh" }}>
        <ErrorBoundary>
          {get(permissionData, "show_print_button", false) && (
            <div className="float-right mb-3">
              <Tooltip placement="topLeft" title="Download Proforma Doc">
                <Button type="primary" className="ml-sm-3" icon={<DownloadOutlined />} size="small" onClick={() => downloadProformaDoc()}>
                  Download Proforma Doc
                </Button>
              </Tooltip>
            </div>
          )}
          {get(permissionData, "top_section_display", false) && (
            <div className="float-left w-100 mb-3">
              <b dangerouslySetInnerHTML={{ __html: htmlTopTemplate }} />
            </div>
          )}
          {get(permissionData, "html_display", false) && (
            <div className={documentClassName} id="proforma-view">
              <DocumentViewer htmlString={htmlTemplate} />
            </div>
          )}
          {get(permissionData, "customer_response_display", false) && (
            <Row>
              <Col span={24}>
                <Radio.Group onChange={onChange} value={value.toUpperCase()}>
                  <Radio value="YES" disabled={!isEditable} className="w-100 mb-2">
                    <b> Yes, I confirm the order details are correct </b>
                  </Radio>
                  <Radio value="NO" disabled={!isEditable}>
                    <b> No, I need changes to the order </b>
                  </Radio>
                </Radio.Group>
                <InputTextArea
                  className="mt-2 mb-0 w-100"
                  required={value === "NO" && true}
                  disabled={!isEditable}
                  validateStatus={remarksError && "error"}
                  helpText={remarksError && "Enter valid remarks"}
                  handleChange={handleChange}
                  type="remarks"
                  value={remarks}
                  label="Remarks"
                />
                {isEditable && (
                  <div className="float-left w-100 mt-3" ref={messagesEndRef}>
                    <Button type="primary" htmlType="submit" className="float-right" onClick={() => sendProformaConfirmation()}>
                      Submit
                    </Button>
                  </div>
                )}
              </Col>
            </Row>
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default ProformaConfirmationView;
