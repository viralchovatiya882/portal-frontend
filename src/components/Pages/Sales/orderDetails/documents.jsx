import { EditOutlined, FilePdfOutlined, FolderAddOutlined } from "@ant-design/icons";
import ErrorBoundary from "@components/UIComponents/ErrorBoundary";
import { openNotificationWithIcon } from "@components/UIComponents/Toast/notification";
import { isMobileOrTab } from "@constants";
import { getRequestHeader } from "@helpers/service";
import { getFileType, getScreenSize } from "@helpers/utility";
import { Button, Col, Modal, Progress, Row, Spin, Tooltip, Typography, Upload } from "antd";
import axios from "axios";
import { get } from "lodash";
import moment from "moment";
import React from "react";
import EditableDocument from "../createOrder/editableDocument";
import "./index.scss";
import UpdateDocumentsModal from "./updateDocumentsModal";

const { Dragger } = Upload;
const { Text } = Typography;

let uploadedDocList = [];
let uploadedOrderDocList = [];
/**
 * Renders Order Details Component
 */
const OrderDocuments = (props) => {
  const {
    metaColumnInfo: { permissions },
  } = props;

  const [updateDocumentsIsOpen, setUpdateDocumentsIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [percent, setUploadPercent] = React.useState(0);
  const [orderUploadPercent, setOrderUploadPercent] = React.useState(0);
  const [supportingDocumentsLoader, setSupportingDocumentsLoader] = React.useState(false);
  const [customerSignedSupportingDocumentsLoader, setCustomerSignedSupportingDocumentsLoader] = React.useState(false);
  const [customer_signed_supporting_documents, setCustomerSignedSupportingDocuments] = React.useState([]);
  const [supporting_documents, setSupportingDocuments] = React.useState([]);
  const [customerSignedDocumentCategoryList, setCustomerSignedDocumentCategoryList] = React.useState([]);
  const [documentCategoryList, setDocumentCategoryList] = React.useState([]);

  const downloadDocument = async (doc) => {
    const rest = await axios({
      method: "GET",
      url: `${process.env.REACT_APP_API_ENDPOINT}/api/get_s3_file_by_url?url=${get(doc, "s3_url").trim()}`,
      headers: { ...getRequestHeader() },
    });
    const fileExt = get(doc, "s3_url", "").split(".").pop();
    var link = document.createElement("a");
    link.setAttribute("href", `${getFileType(fileExt)};base64,${get(rest, "data.file")}`);
    link.setAttribute("download", `${get(doc, "document_category")}-${get(doc, "document_name")}-${new Date().getTime()}.${fileExt}`);
    document.body.appendChild(link); // Required for FF
    link.click();
    openNotificationWithIcon("success", "Document", `${get(doc, "document_category")}: ${get(doc, "document_name")} Download Successful`);
  };

  const handleDocumentUpdateSubmit = async (payload) => {
    setIsLoading(true);

    const rest = await axios({
      method: "POST",
      data: {
        sales_order_id: get(props, "sales_order_id"),
        ...payload,
      },
      url: `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/update_documents`,
      headers: { ...getRequestHeader() },
    }).catch((err) => {
      setIsLoading(false);
      openNotificationWithIcon("error", "Order Details", `${get(err, "response.data.message", "Something Went Wrong")} `);
    });

    if (get(rest, "data.status")) {
      setIsLoading(false);
      setUpdateDocumentsIsOpen(false);
      openNotificationWithIcon("success", "Order Details", get(rest, "data.message", "Document updated successfully"));
      props.refetchSalesOrderData();
    } else {
      setIsLoading(false);
      openNotificationWithIcon("error", "Order Details", get(rest, "data.message", "Something Went Wrong"));
    }
  };

  const uploadData = async (options, from) => {
    const { onSuccess, onError, file, onProgress } = options;

    const format = "YYYY/MM/DD";
    const datePath = moment(new Date()).format(format);
    const file_path = `supporting_documents/${datePath}/`;

    let uploadDocumentRequestPayload = new FormData();
    uploadDocumentRequestPayload.append("file_name", get(file, "name"));
    uploadDocumentRequestPayload.append("file_path", file_path);
    uploadDocumentRequestPayload.append("file_binary", file);

    try {
      const resp = await axios({
        method: "POST",
        url: `${process.env.REACT_APP_API_ENDPOINT}/api/uploadFile`,
        data: uploadDocumentRequestPayload,
        headers: {
          "Content-Type": "multipart/form-data",
          ...getRequestHeader(),
        },
        onUploadProgress: (event) => {
          const percent = Math.floor((event.loaded / event.total) * 100);
          if (from === "order_processing_document") {
            setOrderUploadPercent(percent);
          } else {
            setUploadPercent(percent);
          }

          if (percent === 100) {
            setTimeout(() => {
              if (from === "order_processing_document") {
                setOrderUploadPercent(0);
              } else {
                setUploadPercent(0);
              }
            }, 1000);
          }
          onProgress({ percent: (event.loaded / event.total) * 100 });
        },
      }).catch((err) => {
        openNotificationWithIcon("error", "Documents", `${get(err, "response.data.message", "Something Went Wrong")} `);
      });

      onSuccess("OK");

      if (get(resp, "data.status", false)) {
        const requestObj = {
          document_name: get(file, "name"),
          file_name: get(file, "name"),
          document_url: get(resp, "data.file_url"),
          document_type: "document",
          document_category: "Other",
        };
        if (from === "order_processing_document") {
          uploadedOrderDocList = [...uploadedOrderDocList, requestObj];
          setSupportingDocuments(uploadedOrderDocList);
        } else {
          uploadedDocList = [...uploadedDocList, requestObj];
          setCustomerSignedSupportingDocuments(uploadedDocList);
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log("Error: ", err);
      onError({ err });
    }
  };

  const documentProps = {
    multiple: true,
    listType: "picture",
    showUploadList: false,
    customRequest(options) {
      uploadData(options, "document");
    },
  };

  const documentOrderProps = {
    multiple: true,
    listType: "picture",
    showUploadList: false,
    customRequest(options) {
      uploadData(options, "order_processing_document");
    },
  };

  const fetchDocumentCategoryList = async (requestData, type = "customer") => {
    let url = `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/customer_doc_categories`;

    if (type === "supporting_document") {
      url = `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/order_processing_doc_categories`;
    }

    const rest = await axios({
      method: "GET",
      requestData,
      url,
      headers: { ...getRequestHeader() },
    }).catch((err) => {
      openNotificationWithIcon("error", "Customer Document Category", `${get(err, "response.data.message", "Something Went Wrong")} `);
    });

    if (get(rest, "data.status")) {
      const dataList = get(rest, "data.data", []).map((list, index) => {
        return { label: get(list, "key"), value: get(list, "value") };
      });
      if (type === "supporting_document") {
        setDocumentCategoryList(dataList);
      } else {
        setCustomerSignedDocumentCategoryList(dataList);
      }
    }
  };

  const init = async () => {
    if (customerSignedDocumentCategoryList.length === 0) {
      const reqBody = {
        page: "all",
      };
      await fetchDocumentCategoryList(reqBody);
    }
    if (documentCategoryList.length === 0) {
      const reqBody = {
        page: "all",
      };
      await fetchDocumentCategoryList(reqBody, "supporting_document");
    }
  };

  const handleCustomerSignedSupportingDocumentsSubmit = async () => {
    if (customer_signed_supporting_documents.length > 0) {
      const rest = await axios({
        method: "POST",
        data: {
          sales_order_id: get(props, "sales_order_id"),
          signed_documents: customer_signed_supporting_documents,
        },
        url: `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/add_signed_documents`,
        headers: { ...getRequestHeader() },
      }).catch((err) => {
        openNotificationWithIcon("error", "Customer Documents", `${get(err, "response.data.message", "Something Went Wrong")} `);
      });

      if (get(rest, "data.status")) {
        uploadedDocList = [];
        setCustomerSignedSupportingDocuments([]);
        setCustomerSignedSupportingDocumentsLoader(false);
        props.refetchSalesOrderData();
        openNotificationWithIcon("success", "Customer Documents", get(rest, "data.message", "Supporting Documents uploaded successfully"));
      }
    } else {
      setCustomerSignedSupportingDocumentsLoader(false);
      openNotificationWithIcon("info", "Customer Documents", "Nothing to update");
    }
  };

  const handleCustomerSignedView = () => {
    const default_text = <span>Thank you for uploading the documents.</span>;

    Modal.info({
      afterClose() {
        setCustomerSignedSupportingDocumentsLoader(false);
      },
      className: "customer_documents_upload_confirmation",
      closable: get(props, "confirmation_status", "") !== "NA",
      keyboard: get(props, "confirmation_status", "") !== "NA",
      centered: true,
      width: 500,
      icon: <></>,
      content: (
        <div>
          <p>{default_text}</p>
        </div>
      ),
      onOk() {
        handleCustomerSignedSupportingDocumentsSubmit();
      },
    });
  };

  const handleSupportingDocumentsSubmit = async () => {
    if (supporting_documents.length > 0) {
      const rest = await axios({
        method: "POST",
        data: {
          sales_order_id: get(props, "sales_order_id"),
          supporting_documents,
        },
        url: `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/add_supporting_documents`,
        headers: { ...getRequestHeader() },
      }).catch((err) => {
        openNotificationWithIcon("error", "Supporting Documents", `${get(err, "response.data.message", "Something Went Wrong")} `);
      });

      if (get(rest, "data.status")) {
        uploadedOrderDocList = [];
        setSupportingDocuments([]);
        setSupportingDocumentsLoader(false);
        props.refetchSalesOrderData();
        openNotificationWithIcon("success", "Supporting Documents", get(rest, "data.message", "Supporting Documents uploaded successfully"));
      }
    } else {
      openNotificationWithIcon("info", "Supporting Documents", "Nothing to update");
      setSupportingDocumentsLoader(false);
    }
  };

  React.useEffect(() => {
    init();
    return () => {
      uploadedDocList = [];
      uploadedOrderDocList = [];
    };
  }, []);

  return (
    <>
      <ErrorBoundary>
        <Spin spinning={get(props, "loading", false)}>
          {updateDocumentsIsOpen && (
            <UpdateDocumentsModal
              isOpen={updateDocumentsIsOpen}
              isLoading={isLoading}
              record={get(props, "documents", [])}
              handleSubmit={(payload) => handleDocumentUpdateSubmit(payload)}
              handleClose={() => setUpdateDocumentsIsOpen(false)}
              okText="Update"
            />
          )}
          <div className="common_card_section">
            <div className="d-flex justify-content-between">
              <span style={{ fontWeight: 500, fontSize: 16 }} className="mb-2">
                Upload Documents
              </span>
            </div>
            <hr style={{ backgroundColor: "#ccd5df", margin: "5px 0 20px" }} />
            <Row style={{ fontSize: "0.9rem" }} gutter={[16, 16]}>
              {get(permissions, "upload_customer_documents") && (
                <Col xs={{ span: 24 }} md={{ span: 12 }}>
                  <div className="float-left w-100 common_card_section">
                    <div className="mt-2">
                      <span style={{ fontSize: "0.9rem", marginBottom: 20 }}>Customer Documents</span>
                      <div className="sales_order__documents_upload">
                        <div className="mt-3 upload-document-box">
                          <Dragger {...documentProps} className="mt-0 mb-2">
                            <p className="ant-upload-drag-icon">
                              <FolderAddOutlined />
                            </p>
                            <p className="ant-upload-text" style={{ whiteSpace: "pre-wrap" }}>
                              Drag and drop or Browse your documents <br />
                              or photos to start uploading
                            </p>
                          </Dragger>
                          {percent > 0 ? <Progress size="small" className="mb-2" percent={percent} /> : null}
                          {customer_signed_supporting_documents.length > 0 && (
                            <div style={{ marginTop: 24 }}>
                              <EditableDocument
                                tableLayout={getScreenSize() > isMobileOrTab ? "fixed" : "auto"}
                                dataSource={customer_signed_supporting_documents}
                                options={customerSignedDocumentCategoryList}
                                handleDocuments={(doc) => {
                                  uploadedDocList = doc;
                                  setCustomerSignedSupportingDocuments(doc);
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="float-right mt-3"
                      loading={customerSignedSupportingDocumentsLoader}
                      onClick={() => {
                        setCustomerSignedSupportingDocumentsLoader(true);
                        handleCustomerSignedView();
                      }}
                    >
                      Save
                    </Button>
                  </div>
                </Col>
              )}
              {get(permissions, "upload_processing_documents") && (
                <Col xs={{ span: 24 }} md={{ span: 12 }}>
                  <div className="float-left w-100 common_card_section">
                    <div className="mt-2">
                      <span style={{ fontSize: "0.9rem", marginBottom: 20 }}>
                        Order Processing Documents
                        {/* <span style={{ fontSize: 12, color: "#ccc" }}>( Select Document Category )</span> */}
                      </span>
                      <div className="sales_order__documents_upload">
                        <div className="mt-3 upload-document-box">
                          <Dragger {...documentOrderProps} className="mt-0 mb-2">
                            <p className="ant-upload-drag-icon">
                              <FolderAddOutlined />
                            </p>
                            <p className="ant-upload-text" style={{ whiteSpace: "pre-wrap" }}>
                              Drag and drop or Browse your documents
                            </p>
                            <p className="ant-upload-text" style={{ whiteSpace: "pre-wrap" }}>
                              or photos to start uploading{" "}
                            </p>
                          </Dragger>
                          {orderUploadPercent > 0 ? <Progress size="small" className="mb-2" percent={orderUploadPercent} /> : null}
                          {supporting_documents.length > 0 && (
                            <div style={{ marginTop: 24 }}>
                              <EditableDocument
                                tableLayout={getScreenSize() > isMobileOrTab ? "fixed" : "auto"}
                                dataSource={supporting_documents}
                                options={documentCategoryList}
                                handleDocuments={(doc) => {
                                  uploadedOrderDocList = doc;
                                  setSupportingDocuments(doc);
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="float-right mt-3"
                      loading={supportingDocumentsLoader}
                      onClick={() => {
                        setSupportingDocumentsLoader(true);
                        handleSupportingDocumentsSubmit();
                      }}
                    >
                      Save
                    </Button>
                  </div>
                </Col>
              )}
            </Row>
          </div>
          <div className="common_card_section">
            <Row style={{ fontSize: "0.9rem" }}>
              <Col xs={{ span: 24 }}>
                <div className="d-flex justify-content-between">
                  <span style={{ fontWeight: 500, fontSize: 16 }} className="mb-2">
                    Uploaded Documents
                  </span>
                  {get(permissions, "update_documents") && (
                    <Button icon={<EditOutlined />} type="primary" onClick={() => setUpdateDocumentsIsOpen(true)}>
                      Edit
                    </Button>
                  )}
                </div>
                <hr style={{ backgroundColor: "#ccd5df", margin: "5px 0 20px" }} />
              </Col>
              {get(props, "documents", []).map((doc, index) => {
                return (
                  <Col span={8} key={index} style={{ cursor: "pointer" }} className="text-overflow mb-3">
                    <FilePdfOutlined style={{ paddingRight: 5 }} />
                    <Tooltip
                      placement="topLeft"
                      title={
                        <>
                          <b>{`${get(doc, "document_category")} :`}</b> {get(doc, "document_name")}
                        </>
                      }
                    >
                      <Text onClick={() => downloadDocument(doc)}>
                        <b>{`${get(doc, "document_category")} :`}</b> {get(doc, "document_name")}
                      </Text>
                    </Tooltip>
                  </Col>
                );
              })}
              {get(props, "documents", []).length === 0 && (
                <Col xs={{ span: 24 }} sm={{ span: 6 }}>
                  No Documents Available
                </Col>
              )}
            </Row>
          </div>
        </Spin>
      </ErrorBoundary>
    </>
  );
};

export default OrderDocuments;
