import { CloseOutlined, DeleteOutlined, EditOutlined, PaperClipOutlined, SaveOutlined, UndoOutlined, UploadOutlined } from "@ant-design/icons";
import ErrorBoundary from "@components/UIComponents/ErrorBoundary";
import { getRequestHeader } from "@helpers/service";
import { capitalizeAllLetter } from "@helpers/utility";
import { Button, Col, Divider, Input, Modal, Popconfirm, Progress, Row, Spin, Steps, Tag, Tooltip, Typography, Upload } from "antd";
import axios from "axios";
import { debounce, get, toString } from "lodash";
import moment from "moment";
import React from "react";
import { CustomInputTextArea as InputTextArea } from "../../../../UIComponents/Input/customInput";
import { openNotificationWithIcon } from "../../../../UIComponents/Toast/notification";
import { status_color_map } from "../../constants";
import "./index.scss";

const { Step } = Steps;
const { Title } = Typography;

let cancelTokenSource = axios.CancelToken.source();

/**
 * Renders Customer Details Component
 */
const CustomerTrackingDetails = props => {
  const [comments, setComments] = React.useState("");

  const [currentUploadedFile, setCurrentUploadedFile] = React.useState("");
  const [currentUploadedFileName, setCurrentUploadedFileName] = React.useState("");

  const [percent, setUploadPercent] = React.useState(0);
  const [updatedFileName, setUpdateFileName] = React.useState("");
  const [supporting_documents, setSupportingDocuments] = React.useState([]);
  const [customerUpdateSubmitLoader, setCustomerUpdateSubmitLoader] = React.useState(false);
  const [isUploadRequested, setUploadRequested] = React.useState(false);

  const [inputVisible, setInputVisible] = React.useState(false);
  const [editInputIndex, setEditInputIndex] = React.useState(null);

  const inputRef = React.useRef(null);
  const uploadInputRef = React.useRef(null);

  React.useEffect(() => {
    if (inputVisible) {
      inputRef.current.focus();
    }
  }, [inputVisible]);

  React.useEffect(() => {
    if (currentUploadedFileName) {
      uploadInputRef.current.focus();
    }
  }, [currentUploadedFileName]);

  const handleUpload = async () => {
    if (currentUploadedFile) {
      setUploadRequested(true);

      const format = "YYYY/MM/DD";
      const datePath = moment(new Date()).format(format);
      const file_path = `customer/${datePath}/`;

      let uploadDocumentRequestPayload = new FormData();
      uploadDocumentRequestPayload.append("file_name", get(currentUploadedFile, "name"));
      uploadDocumentRequestPayload.append("file_path", file_path);
      uploadDocumentRequestPayload.append("file_binary", currentUploadedFile);

      const resp = await axios({
        method: "POST",
        url: `${process.env.REACT_APP_API_ENDPOINT}/api/uploadFile`,
        data: uploadDocumentRequestPayload,
        cancelToken: cancelTokenSource.token,
        headers: {
          "Content-Type": "multipart/form-data",
          ...getRequestHeader(),
        },
        onUploadProgress(progressEvent) {
          const { loaded, total } = progressEvent;
          let percentage = Math.floor((loaded * 100) / total);
          setUploadPercent(percentage);
        },
      }).catch(err => {
        openNotificationWithIcon("error", "Upload Document", `${get(err, "response.data.message", "Something Went Wrong")} `);
      });

      if (get(resp, "status") === 200) {
        let newOrderSupportingDocDetails = [...supporting_documents];
        newOrderSupportingDocDetails = [
          ...newOrderSupportingDocDetails,
          {
            document_name: currentUploadedFileName,
            document_url: get(resp, "data.file_url"),
            document_category: "",
          },
        ];
        setSupportingDocuments(newOrderSupportingDocDetails);
        setTimeout(() => {
          setUploadRequested(false);
          setUploadPercent(0);
        }, 1000);

        setCurrentUploadedFile("");
        setCurrentUploadedFileName("");
      }
    } else {
      openNotificationWithIcon("info", "Supporting Documents", "No documents to upload");
    }
  };

  const invokeDebounced = debounce(() => setCurrentUploadedFileName(get(currentUploadedFile, "name")), 3000);

  React.useEffect(() => {
    if (!currentUploadedFileName && currentUploadedFile) {
      invokeDebounced();
    }
  }, [currentUploadedFileName]);

  const handleRequestCancel = () => {
    setCurrentUploadedFileName("");
    setCurrentUploadedFile("");
    setUploadRequested(false);
    setUploadPercent(0);
    cancelTokenSource.cancel();
    cancelTokenSource = axios.CancelToken.source();
  };

  const handleDocumentDelete = (type, docIndex) => {
    if (type === "supporting_document") {
      let newOrderSupportingDocDetails = [...supporting_documents];
      let docList = [...newOrderSupportingDocDetails];
      docList.splice(docIndex, 1);
      newOrderSupportingDocDetails = docList;
      setSupportingDocuments(newOrderSupportingDocDetails);
    }
  };

  const handleSaveDocumentRename = type => {
    if (type === "supporting_document") {
      let newOrderSupportingDocDetails = [...supporting_documents];
      let docList = [...newOrderSupportingDocDetails];
      docList[editInputIndex] = {
        ...docList[editInputIndex],
        document_name: updatedFileName,
      };
      newOrderSupportingDocDetails = docList;
      setSupportingDocuments(newOrderSupportingDocDetails);
    }

    handleCancelDocumentRename(type);
  };

  const handleDocumentRename = (type, index, name) => {
    if (type === "supporting_document") {
      setEditInputIndex(index);
      setUpdateFileName(name);
      setInputVisible(true);
    }
  };

  const handleCancelDocumentRename = type => {
    if (type === "supporting_document") {
      setEditInputIndex(null);
      setUpdateFileName("");
      setInputVisible(false);
    }
  };

  const isEditEligible = () => {
    return get(props, "disabled", false);
  };

  const handleMoreCommentsView = (comments, value) => {
    Modal.info({
      title: "User Comments",
      centered: true,
      width: 750,
      content: (
        <div className="lead__message_info">
          <p>{comments}</p>
        </div>
      ),
      onOk() { },
    });
  };

  const getStatusCode = status => {
    return get(status_color_map, toString(status).toLowerCase());
  };

  const resetToDefault = () => {
    setComments("");
    setSupportingDocuments([]);
    setCustomerUpdateSubmitLoader(false);
    handleRequestCancel();
  };

  const validateRequestPayload = () => {
    let returnValue = false;
    if (comments) {
      returnValue = true;
    }
    if (supporting_documents.length > 0) {
      returnValue = true;
    }
    return returnValue;
  };

  const handleCustomerUpdatesSubmit = async () => {
    const requestPayload = {
      customer_id: get(props, "customer_id", ""),
      comments,
      documents: supporting_documents,
    };

    if (validateRequestPayload()) {
      const rest = await axios({
        method: "POST",
        data: requestPayload,
        url: `${process.env.REACT_APP_API_ENDPOINT}/api/update_customer`,
        headers: { ...getRequestHeader() },
      }).catch(err => {
        openNotificationWithIcon("error", "Customer Update", `${get(err, "response.data.message", "Something Went Wrong")} `);
      });

      if (get(rest, "data.status")) {
        resetToDefault();
        props.refetchDetails();
        openNotificationWithIcon("success", "Customer Update", get(rest, "data.message", "Customer Updated successfully"));
      }
    } else {
      openNotificationWithIcon("info", "Customer Update", "Nothing to update");
      setCustomerUpdateSubmitLoader(false);
    }
  };

  return (
    <>
      <ErrorBoundary>
        <Spin spinning={get(props, "loading", false)}>
          <div className="common_card_section">
            <Row>
              <Col xs={{ span: 24 }} sm={{ span: 12 }}>
                <span className="customer_details__tracking_details">
                  <Steps progressDot current={get(props, "tracking_details", []).length} direction="vertical">
                    {get(props, "tracking_details", []).map((details, index) => {
                      const getColorCode = getStatusCode(get(details, "new_value") ? get(details, "new_value") : "new");
                      const getText = capitalizeAllLetter((get(details, "new_value") ? get(details, "new_value") : "New").replace(/_/g, " "));
                      return (
                        <Step
                          title={
                            <>
                              <span>{get(details, "description", "")}</span>
                              {get(details, "event_type") === "status_change" && (
                                <Tag color={getColorCode} className="ml-3">
                                  {getText}
                                </Tag>
                              )}
                              {get(details, "user_comments") && (
                                <>
                                  <br />
                                  <span style={{ whiteSpace: "normal" }} className="pr-2">
                                    {get(details, "user_comments", "").slice(0, 40)}
                                  </span>
                                  {get(details, "user_comments", "").length > 40 && (
                                    <>
                                      ...
                                      <Button
                                        type="link"
                                        size="small"
                                        className="mt-2 mb-2"
                                        onClick={() => handleMoreCommentsView(get(details, "user_comments", ""), get(details, "new_value"))}
                                      >
                                        View More
                                      </Button>
                                    </>
                                  )}
                                </>
                              )}
                            </>
                          }
                          description={
                            <>
                              <p className="m-0">By {get(details, "created_by", "")}</p>
                              <p className="m-0">{get(details, "created_at", "")}</p>
                            </>
                          }
                        />
                      );
                    })}
                  </Steps>
                </span>
              </Col>
              {!isEditEligible() && (
                <Col xs={{ span: 24 }} sm={{ span: 11, offset: 1 }} >
                  <>
                    <span className="label_text">Add updates to the Customer</span>

                    <div className="mt-3">
                      <div className="common_card_section">
                        <InputTextArea
                          className="mt-0 mb-0 w-100"
                          handleChange={(key, value) => setComments(value)}
                          value={comments}
                          type="comments"
                          label="Add Comments"
                        />
                      </div>
                      <span className="label_text" style={{ marginBottom: 20 }}>UPLOAD DOCUMENTS</span>
                      <div className="float-left w-100 common_card_section mt-3">
                        <span style={{ fontSize: "0.9rem", marginBottom: 20 }}>
                          Customer Documents
                        </span>
                        <hr />
                        <div className="d-flex align-item-center mt-3 upload-document-box">
                          <Input
                            className="w-100"
                            value={currentUploadedFileName}
                            maxLength={50}
                            ref={uploadInputRef}
                            placeholder="Browse File"
                            bordered={false}
                            onChange={e => {
                              setCurrentUploadedFileName(e.target.value);
                            }}
                          />
                          <Upload
                            listType="text"
                            maxCount={1}
                            onRemove={file => {
                              setCurrentUploadedFile(file);
                              setCurrentUploadedFileName("");
                            }}
                            beforeUpload={file => {
                              if (file) {
                                setCurrentUploadedFile(file);
                                setCurrentUploadedFileName(get(file, "name"));
                              }
                              return false;
                            }}
                            itemRender={(originNode, file, currFileList) => {
                              return <div className="sales_order__custom_render">{ }</div>;
                            }}
                          >
                            <Button icon={<PaperClipOutlined />} type="text">
                              Browse
                            </Button>
                          </Upload>
                          <Button icon={<UploadOutlined />} onClick={handleUpload} type="primary">
                            Upload
                          </Button>
                        </div>
                        <Divider className="mt-0 mb-3" />
                        {isUploadRequested && (
                          <>
                            <Progress percent={percent} strokeWidth={4} showInfo={false} />
                            <div className="d-flex justify-content-between align-items-center">
                              <b style={{ color: percent === 100 ? "#87d068" : "#108ee9" }}>{percent}% Uploaded</b>
                              {percent !== 100 && (
                                <Button type="text" onClick={() => handleRequestCancel()}>
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </>
                        )}
                        {supporting_documents.map((list, index) => {
                          return (
                            <div className="lead__uploaded_list">
                              <div
                                key={index}
                                className="d-flex align-items-center justify-content-between mb-2"
                                style={{
                                  borderBottom: inputVisible && editInputIndex === index ? "1px solid #b1b1b1" : "none",
                                }}
                              >
                                <div className="d-flex align-items-center">
                                  {editInputIndex === index ? (
                                    <Input
                                      className="w-100"
                                      value={updatedFileName}
                                      maxLength={50}
                                      placeholder="Enter File Name"
                                      bordered={false}
                                      ref={inputRef}
                                      onChange={e => {
                                        setUpdateFileName(e.target.value);
                                      }}
                                    />
                                  ) : (
                                    <div className="d-flex align-items-center mb-2">
                                      <Popconfirm
                                        placement="topRight"
                                        title="Are you sure to delete this document?"
                                        onConfirm={() => handleDocumentDelete("supporting_document", index)}
                                        okText="Ok"
                                        cancelText="Cancel"
                                      >
                                        <Tooltip placement="top" title="Delete Document">
                                          <DeleteOutlined style={{ cursor: "pointer" }} />
                                        </Tooltip>
                                      </Popconfirm>
                                      <span className="pl-2">{get(list, "document_name")}</span>
                                    </div>
                                  )}
                                </div>
                                {inputVisible && editInputIndex === index ? (
                                  <div className="d-flex align-items-center mb-2">
                                    <Tooltip placement="top" title="Update Document">
                                      <Button type="text" onClick={() => handleSaveDocumentRename("supporting_document")}>
                                        <SaveOutlined />
                                      </Button>
                                    </Tooltip>
                                    <Button type="text" onClick={() => handleCancelDocumentRename("supporting_document")}>
                                      <Tooltip placement="top" title="Cancel">
                                        <CloseOutlined />
                                      </Tooltip>
                                    </Button>
                                  </div>
                                ) : (
                                  <Button type="text" onClick={() => handleDocumentRename("supporting_document", index, get(list, "document_name"))}>
                                    <Tooltip placement="top" title="Rename Document">
                                      <EditOutlined />
                                    </Tooltip>
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                          {/* {supporting_documents.length === 0 && <center className="pt-5">No Documents are uploaded</center>} */ }
                        })}
                      </div>
                      <div className="float-right mt-3 save-buttons">
                        <Button type="secondary" htmlType="reset" icon={<UndoOutlined />} onClick={() => resetToDefault()}>
                          Reset
                        </Button>
                        <Button
                          type="primary"
                          htmlType="submit"
                          className="ml-3"
                          icon={<SaveOutlined />}
                          loading={customerUpdateSubmitLoader}
                          onClick={() => {
                            setCustomerUpdateSubmitLoader(true);
                            handleCustomerUpdatesSubmit();
                          }}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </>
                </Col>
              )}
            </Row>
          </div>
        </Spin>
      </ErrorBoundary>
    </>
  );
};

export default CustomerTrackingDetails;
