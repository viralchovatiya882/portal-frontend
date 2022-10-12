import { DownloadOutlined } from "@ant-design/icons";
import { getRequestHeader } from "@helpers/service";
import { getFileType } from "@helpers/utility";
import { openNotificationWithIcon } from "@ui-components/Toast/notification";
import { Button, Checkbox, Col, Modal, Row, Tooltip } from "antd";
import axios from "axios";
import { find, get } from "lodash";
import React from "react";
import validator from "validator";
import { CustomInputText as InputChange, CustomInputTextArea as InputTextArea } from "../../../UIComponents/Input/customInput";
import DocumentViewer from "../viewDocuments/documentViewer";

const ProformaSaleConfirmationModal = props => {
  const [email, setEmail] = React.useState(get(props, "record.email", ""));
  const [emailError, setEmailError] = React.useState(false);
  const [selectedDocuments, setSelectedDocuments] = React.useState([]);
  const [htmlTemplate, setHtmlTemplate] = React.useState(null);
  const [htmlEmailTemplate, setHtmlEmailTemplate] = React.useState(null);
  const [message, setMessage] = React.useState("");
  const [messageError, setMessageError] = React.useState(false);

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
      setHtmlEmailTemplate({
        proforma_mailContent_top: get(rest, "data.proforma_mailContent_top"),
        proforma_mailContent_bottom: get(rest, "data.proforma_mailContent_bottom")
      });
    }
  };

  const downloadProformaDoc = async () => {
    const rest = await axios({
      method: "GET",
      url: `${process.env.REACT_APP_API_ENDPOINT}/api/getProformaOrConfirmationDocPdf/${get(props, "record.sales_order_id")}`,
      headers: { ...getRequestHeader() }
    }).catch(err => {
      openNotificationWithIcon("error", "Order Details", `${get(err, "response.data.message", "Something Went Wrong")} `);
    });

    if (get(rest, "status") === 200) {
      var link = document.createElement("a");
      link.setAttribute("href", `${getFileType("pdf")};base64,${get(rest, "data.pdf")}`);
      link.setAttribute("download", `proforma_doc_${get(props, "record.sales_order_id")}_${new Date().toLocaleString().replace(/[/, ]/g, "_")}.pdf`);
      document.body.appendChild(link); // Required for FF
      link.click();
      openNotificationWithIcon("success", "Order Details", "Download Successful");
      props.refetchSalesOrderData();
    } else {
      openNotificationWithIcon("warning", "Order Details", get(rest, "statusText", "Something went wrong"));
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

    if (key === "message") {
      setMessage(value);
    }
  };

  const handleSave = () => {
    let requestPayload = {
      sales_order_id: get(props, "record.sales_order_id"),
      customer_email_for_sending: email,
      custom_message: message,
      mail_attachments: []
    };

    if (selectedDocuments.length > 0) {
      const attachments = selectedDocuments.map(list => {
        const computedObj = find(get(props, "record.documents", []), function (o) {
          return get(o, "s3_url") === list;
        });
        return {
          document_name: get(computedObj, "document_name"),
          document_url: get(computedObj, "s3_url")
        };
      });
      requestPayload["mail_attachments"] = attachments;
    }

    if (!emailError) {
      props.handleSubmit(requestPayload);
      closeModal();
    }
  };

  const closeModal = () => {
    props.handleClose();
  };

  const onDocumentSelectionChange = checkedValues => {
    setSelectedDocuments(checkedValues);
  };

  return (
    <>
      <Modal
        title={get(props, "title", "Proforma Confirmation of Sale")}
        centered
        width={1000}
        visible={get(props, "isOpen", false)}
        onOk={() => handleSave()}
        okText={get(props, "okText", "Add")}
        onCancel={() => closeModal()}
        className="proforma_view__order_details"
      >
        <>
          <Tooltip placement="topLeft" title="Download Proforma Doc">
            <Button type="primary" className="ml-sm-3 float-right" icon={<DownloadOutlined />} size="small" onClick={() => downloadProformaDoc()}>
              Download Proforma Doc
            </Button>
          </Tooltip>
          <div className="review-document">
            <div className="view-document">
              <DocumentViewer htmlString={htmlTemplate} style={{ height: "460px" }} />
            </div>
            <div>
              <p style={{ color: "#007bff", fontSize: 13.5, margin: "10px 0px" }}>
                <span style={{ color: "red", marginRight: 3 }}>*</span>On Submit, an automated email will be triggered to the customer to view this
                document. Please confirm the contact details before submitting.
              </p>
            </div>
            <div className="customer-detail">
              <Row>
                <Col sm={{ span: 24 }}>
                  <div className="common_card_section">
                    <Row>
                      <Col sm={{ span: 8 }}>
                        <InputChange
                          handleChange={handleChange}
                          value={get(props, "record.contact_name", "")}
                          type="contact_name"
                          className="mt-0 mb-0 w-100"
                          label="Contact Name"
                          disabled
                        />
                      </Col>
                      <Col className="pl-sm-3" sm={{ span: 8 }}>
                        <InputChange
                          handleChange={handleChange}
                          value={get(props, "record.phone_no", "")}
                          type="phone_no"
                          className="mt-0 mb-0 w-100"
                          label="Phone No"
                          disabled
                        />
                      </Col>
                      <Col className="pl-sm-3" sm={{ span: 8 }}>
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
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <div className="common_card_section">
                    <p style={{ fontWeight: 700, fontSize: 16 }} className="mb-2">
                      Documents{" "}
                      <span className="pl-1" style={{ fontSize: 11, color: "#ccc", textTransform: "none" }}>
                        (Selected documents will go as an attachment)
                      </span>
                    </p>

                    <hr style={{ backgroundColor: "#ccd5df", margin: "5px 0 10px" }} />
                    <Checkbox.Group style={{ width: "100%", overflow: "auto", maxHeight: 200 }} onChange={onDocumentSelectionChange}>
                      <Row>
                        {get(props, "record.documents", []).map((list, index) => {
                          return (
                            <Col xs={{ span: 24 }} sm={{ span: 6 }} key={index} className="mb-2">
                              <Checkbox value={get(list, "s3_url")} className="proforma_view__document__name w-100">
                                <Tooltip placement="topLeft" title={get(list, "document_name")}>
                                  <span>{get(list, "document_name")}</span>
                                </Tooltip>
                              </Checkbox>
                            </Col>
                          );
                        })}
                        {get(props, "record.documents", []).length === 0 && <Col className="mb-2"> No Document Available </Col>}
                      </Row>
                    </Checkbox.Group>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col sm={{ span: 24 }}>
                  <div className="common_card_section">
                    <p style={{ fontWeight: 700, fontSize: 16 }} className="mb-2">
                      Email Body
                    </p>

                    <hr style={{ backgroundColor: "#ccd5df", margin: "5px 0 10px" }} />
                    {/* <p>
                      Dear Customer, <br /> <br /> Your sales order <b> {get(props, "record.sales_order_id")} </b> with Duncan Taylor Scotch Whisky
                      Ltd. is submitted successfully. <br /> Please verify the details of the order by clicking
                      <a href="#" className="pl-1" onClick={e => e.preventDefault()}>
                        here
                      </a>
                      , and reach out to your sales contact in case of any clarifications.
                    </p> */}
                    <div dangerouslySetInnerHTML={{ __html: get(htmlEmailTemplate, "proforma_mailContent_top") }} />
                    <InputTextArea
                      className="mt-2 mb-3 w-100"
                      validateStatus={messageError && "error"}
                      helpText={messageError && "Enter valid remarks"}
                      handleChange={handleChange}
                      type="message"
                      value={message}
                      label="Custom Message"
                    />
                    <div dangerouslySetInnerHTML={{ __html: get(htmlEmailTemplate, "proforma_mailContent_bottom") }} />
                    {/* <p>
                      This is a system generated email. Please do not reply to this address. <br />
                    </p>
                    <p>
                      Regards, <br />
                      <b> Duncan Taylor Team </b>
                    </p> */}
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </>
      </Modal>
    </>
  );
};

export default ProformaSaleConfirmationModal;
