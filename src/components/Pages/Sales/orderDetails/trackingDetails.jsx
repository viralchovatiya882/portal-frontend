import ErrorBoundary from "@components/UIComponents/ErrorBoundary";
import { getRequestHeader } from "@helpers/service";
import { capitalizeAllLetter } from "@helpers/utility";
import { CustomDatePicker } from "@ui-components/DatePicker";
import { Button, Col, Form, Input, List, Modal, Row, Select, Spin, Steps, Tag } from "antd";
import axios from "axios";
import { find, get, isEmpty } from "lodash";
import React from "react";
import { openNotificationWithIcon } from "../../../UIComponents/Toast/notification";
import CancelOrderConfirmation from "../confirmation/cancelOrderConfirmation";
import "./index.scss";

const { TextArea } = Input;
const { Step } = Steps;

/**
 * Renders Order Details Component
 */
const OrderTrackingDetails = (props) => {
  const {
    metaColumnInfo: { permissions },
  } = props;
  const [fulfillment_status, setFulfillment_status] = React.useState("");
  const [fulfillmentLoader, setFulfillmentLoader] = React.useState(false);

  const [estd_shipping_date, setEstimatedShippingDate] = React.useState("");
  const [estimatedShippingDateLoader, setEstimatedShippingDateLoader] = React.useState(false);

  const [comments, setComments] = React.useState("");
  const [commentsLoader, setCommentsLoader] = React.useState(false);

  const [showReasonModal, setShowReasonModal] = React.useState(false);
  const [cancellationReason, setCancellationReason] = React.useState("");

  const handleChange = (value) => {
    setFulfillment_status(value);
  };

  const handleReasonSubmit = () => {
    setFulfillmentLoader(true);
    handleFulfillmentSubmit();
  };

  const handleFulfillmentSubmit = async () => {
    let data = {
      sales_order_id: get(props, "sales_order_id"),
      fulfillment_status,
    };
    if (cancellationReason) {
      data["comments"] = cancellationReason;
    }
    if (fulfillment_status) {
      const rest = await axios({
        method: "POST",
        data,
        url: `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/update_fulfillment_status`,
        headers: { ...getRequestHeader() },
      }).catch((err) => {
        openNotificationWithIcon("error", "Fulfillment Status", `${get(err, "response.data.message", "Something Went Wrong")} `);
      });

      if (get(rest, "data.status")) {
        setFulfillment_status("");
        setShowReasonModal(false);
        setFulfillmentLoader(false);
        setCancellationReason("");
        props.refetchSalesOrderData();
        openNotificationWithIcon("success", "Fulfillment Status", get(rest, "data.message", "Fulfillment status updated successfully"));
      }

      if (!get(rest, "data.status", true)) {
        setFulfillment_status("");
        setShowReasonModal(false);
        setFulfillmentLoader(false);
        setCancellationReason("");
        // props.refetchSalesOrderData();
        openNotificationWithIcon("error", "Fulfillment Status", get(rest, "data.message", "Fulfillment status updated successfully"));
      }
    } else {
      openNotificationWithIcon("info", "Fulfillment Status", "Nothing to update");
      setFulfillmentLoader(false);
    }
  };

  const handleEstimatedShippingDateSubmit = async () => {
    if (estd_shipping_date) {
      const rest = await axios({
        method: "POST",
        data: {
          sales_order_id: get(props, "sales_order_id"),
          estd_shipping_date,
        },
        url: `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/update_estd_shipping_date`,
        headers: { ...getRequestHeader() },
      }).catch((err) => {
        openNotificationWithIcon("error", "Estimated Shipping Date", `${get(err, "response.data.message", "Something Went Wrong")} `);
        setEstimatedShippingDateLoader(false);
      });

      if (get(rest, "data.status")) {
        setEstimatedShippingDate("");
        setEstimatedShippingDateLoader(false);
        props.refetchSalesOrderData();
        openNotificationWithIcon("success", "Estimated Shipping Date", get(rest, "data.message", "Estimated Shipping Date updated successfully"));
      }
      if (!get(rest, "data.status", true)) {
        setEstimatedShippingDateLoader(false);
        openNotificationWithIcon("error", "Estimated Shipping Date", get(rest, "data.message", "Estimated Shipping Date updated successfully"));
      }
    } else {
      openNotificationWithIcon("info", "Estimated Shipping Date", "Nothing to update");
      setEstimatedShippingDateLoader(false);
    }
  };

  const handleCommentsSubmit = async () => {
    if (comments) {
      const rest = await axios({
        method: "POST",
        data: {
          sales_order_id: get(props, "sales_order_id"),
          comments,
        },
        url: `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/add_comments`,
        headers: { ...getRequestHeader() },
      }).catch((err) => {
        openNotificationWithIcon("error", "Order Details Comments", `${get(err, "response.data.message", "Something Went Wrong")} `);
      });

      if (get(rest, "data.status")) {
        setComments("");
        setCommentsLoader(false);
        props.refetchSalesOrderData();
        openNotificationWithIcon("success", "Order Details Comments", get(rest, "data.message", "Comments updated successfully"));
      }
      if (!get(rest, "data.status", true)) {
        setCommentsLoader(false);
        openNotificationWithIcon("error", "Order Details Comments", get(rest, "data.message", "Something Went Wrong"));
      }
    } else {
      openNotificationWithIcon("info", "Order Details Comments", "Nothing to update");
      setCommentsLoader(false);
    }
  };

  const handleMoreCommentsView = (comments, value) => {
    Modal.info({
      title: value === "cancelled" ? "Reason for Cancellation" : "User Comments",
      centered: true,
      width: 750,
      content: (
        <div>
          <p>{comments}</p>
        </div>
      ),
      onOk() {},
    });
  };

  const handleRequestHeaderView = (requestHeader) => {
    Modal.info({
      title: "Customer Request Header",
      centered: true,
      width: 750,
      content: (
        <List
          size="small"
          style={{
            overflow: "scroll",
            maxHeight: "400px",
          }}
          bordered
          dataSource={Object.keys(requestHeader)}
          renderItem={(item) => (
            <List.Item>
              {item} : {get(requestHeader, item, "")}
            </List.Item>
          )}
        />
      ),
      onOk() {},
    });
  };

  const getStatusCode = (status, key_name = "fulfillment_status") => {
    const StatusObj = find(get(props, "metaColumnInfo.status_list", []), function (o) {
      return get(o, "key_name") === key_name;
    });
    return get(StatusObj, `status_color_map.${status}`);
  };

  const getStatusOptionsList = (key_name = "fulfillment_status") => {
    const StatusObj = find(get(props, "metaColumnInfo.status_list", []), function (o) {
      return get(o, "key_name") === key_name;
    });

    let returnArr = [];
    returnArr = Object.keys(get(StatusObj, "status_color_map", {})).map((data) => {
      return {
        label: capitalizeAllLetter(data.replace(/_/g, " ")),
        value: data,
      };
    });

    return returnArr ? returnArr : [];
  };

  return (
    <>
      <ErrorBoundary>
        <Spin spinning={get(props, "loading", false)}>
          <div className="bg-white p-4" style={{ borderRadius: 10 }}>
            {showReasonModal && (
              <CancelOrderConfirmation
                handleReason={(reason) => setCancellationReason(reason)}
                cancellationReason={cancellationReason}
                customDetails={{
                  fulfillment_status,
                  signer_email: get(props, "signer_email"),
                  email_sent_at: get(props, "email_sent_at"),
                }}
                handleReasonSubmit={handleReasonSubmit}
                showModal={true}
                handleClose={() => setShowReasonModal(false)}
              />
            )}
            <Row>
              <Col xs={{ span: 24 }} sm={{ span: 14 }}>
                <span className="order_details__tracking_details">
                  <Steps progressDot current={get(props, "tracking_details", []).length} direction="vertical">
                    {get(props, "tracking_details", []).map((details, index) => {
                      const getColorCode = getStatusCode(get(details, "new_value") ? get(details, "new_value") : "new");
                      const getText = capitalizeAllLetter((get(details, "new_value") ? get(details, "new_value") : "New").replace(/_/g, " "));
                      return (
                        <Step
                          className="mb-2"
                          title={
                            <>
                              <span>{get(details, "description", "")}</span>
                              {get(details, "event_type") === "fulfillment_status_change" && (
                                <Tag color={getColorCode} className="ml-3">
                                  {getText}
                                </Tag>
                              )}
                              {!isEmpty(get(details, "customer_request_header")) && (
                                <Button type="link" size="small" className="mt-2 mb-2" onClick={() => handleRequestHeaderView(get(details, "customer_request_header", ""), get(details, "new_value"))}>
                                  View Details
                                </Button>
                              )}
                              {get(details, "user_comments") && (
                                <>
                                  <div style={{ whiteSpace: "normal" }} className="pr-2">
                                    {get(details, "user_comments", "").slice(0, 40)}
                                  </div>
                                  {get(details, "user_comments", "").length > 40 && (
                                    <>
                                      ...
                                      <Button type="link" size="small" className="mt-2 mb-2" onClick={() => handleMoreCommentsView(get(details, "user_comments", ""), get(details, "new_value"))}>
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
              <Col xs={{ span: 24 }} sm={{ span: 10 }}>
                <>
                  <div className="head_officer_action__status">
                    <div className="common-border1 float-left w-100 common_card_section">
                      <div className="mt-0">
                        <span className="label_text">CHANGE THE FULFILLMENT STATUS</span>
                        <Form name="customized_form_controls " className="estimated_shipping_date w-100 mt-2" layout="vertical">
                          <Form.Item>
                            <Select
                              value={fulfillment_status ? fulfillment_status : get(props, "fulfillment_status")}
                              placeholder="Select Fulfillment Status"
                              allowClear
                              disabled={!get(permissions, "change_fulfillment_status")}
                              className="full-fillment-status-select_bkp w-100"
                              // style={getScreenSize() > isMobileOrTab ? { width: "350px" } : {}}
                              onChange={handleChange}
                            >
                              {getStatusOptionsList().map((list, index) => {
                                return (
                                  <Option value={get(list, "value")} key={index}>
                                    {get(list, "label")}
                                  </Option>
                                );
                              })}
                            </Select>
                          </Form.Item>
                          <Form.Item>
                            <Button
                              type="primary"
                              loading={fulfillmentLoader}
                              className="float-right mt-4"
                              disabled={!get(permissions, "change_fulfillment_status")}
                              htmlType="submit"
                              onClick={() => {
                                if (fulfillment_status === "shipped" || fulfillment_status === "cancelled") {
                                  setShowReasonModal(true);
                                } else {
                                  setFulfillmentLoader(true);
                                  handleFulfillmentSubmit();
                                }
                              }}
                            >
                              Save
                            </Button>
                          </Form.Item>
                        </Form>
                      </div>
                    </div>
                  </div>

                  {get(permissions, "change_estd_shipping_date") && (
                    <div className="common-border1 float-left w-100 common_card_section">
                      <div className="mt-0">
                        {/* <span className="label_text">ESTIMATED SHIPPING DATE  (YYYY-MM-DD)</span> */}
                        <Form name="customized_form_controls w-100 mb-0" className="estimated_shipping_date" layout="vertical">
                          <Form.Item>
                            <CustomDatePicker
                              handleChange={(key, val) => {
                                setEstimatedShippingDate(val);
                              }}
                              enableOnlyFutureDate={true}
                              value={estd_shipping_date}
                              type="estd_shipping_date"
                              className="mt-0 mb-0 w-100"
                              label="ESTIMATED SHIPPING DATE  (YYYY-MM-DD)"
                            />
                          </Form.Item>
                          <Form.Item>
                            <Button
                              type="primary"
                              className="float-right"
                              htmlType="submit"
                              loading={estimatedShippingDateLoader}
                              onClick={() => {
                                setEstimatedShippingDateLoader(true);
                                handleEstimatedShippingDateSubmit();
                              }}
                            >
                              Save
                            </Button>
                          </Form.Item>
                        </Form>
                      </div>
                    </div>
                  )}
                  {get(permissions, "add_comments") && (
                    <div className="common-border1 float-left w-100 common_card_section">
                      <div className="mt-0">
                        <Form name="customized_form_controls" layout="vertical">
                          <Form.Item label="ADD COMMENTS">
                            <TextArea value={comments} onChange={(e) => setComments(e.target.value)} className="mt-0 mb-0 w-100" placeholder="Enter Comments" />
                          </Form.Item>
                          <Form.Item className="float-right mb-0">
                            <Button
                              type="primary"
                              htmlType="submit"
                              loading={commentsLoader}
                              onClick={() => {
                                setCommentsLoader(true);
                                handleCommentsSubmit();
                              }}
                            >
                              Save
                            </Button>
                          </Form.Item>
                        </Form>
                      </div>
                    </div>
                  )}
                </>
              </Col>
            </Row>
          </div>
        </Spin>
      </ErrorBoundary>
    </>
  );
};

export default OrderTrackingDetails;
