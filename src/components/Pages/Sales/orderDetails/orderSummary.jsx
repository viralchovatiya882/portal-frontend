import { DownloadOutlined, EditOutlined, EyeOutlined, LinkOutlined, SwapOutlined } from "@ant-design/icons";
import ErrorBoundary from "@components/UIComponents/ErrorBoundary";
import { getRequestHeader } from "@helpers/service";
import { capitalizeAllLetter, getFileType, numberWithCommas } from "@helpers/utility";
import { openNotificationWithIcon } from "@ui-components/Toast/notification";
import { Button, Col, Row, Spin, Tag, Tooltip, Typography } from "antd";
import axios from "axios";
import { find, get } from "lodash";
import React from "react";
import { Link } from "react-router-dom";
import ConvertOrderTypeModal from "./convertOrderTypeModal";
import "./index.scss";
import ProformaSaleConfirmationModal from "./proformaSaleConfirmationModal";
import UpdateSalesAssociate from "./updateSalesAssociate";
import UpdateTargetRegion from "./updateTargetRegion";

const { Text } = Typography;

/**
 * Renders Order Details Component
 */
const OrderSummary = (props) => {
  const {
    metaColumnInfo: { permissions },
  } = props;
  const [modalIsOpen, setModalIsOpen] = React.useState(false);
  const [targetRegionModalIsOpen, setTargetRegionModalIsOpen] = React.useState(false);
  const [updateSalesAssociateModalIsOpen, setUpdateSalesAssociateModalIsOpen] = React.useState(false);

  const [proformaModalIsOpen, setProformaModalIsOpen] = React.useState(false);

  const getStatusOptionsList = (key_name = "fulfillment_status") => {
    const StatusObj = find(get(props, "metaColumnInfo.status_list", []), function (o) {
      return get(o, "key_name") === key_name;
    });
    return get(StatusObj, "status_color_map", {});
  };

  const getConfirmationStatus = get(getStatusOptionsList("confirmation_status"), get(props, "confirmation_status", "").toLowerCase());
  const getFulfillmentStatus = get(getStatusOptionsList(), get(props, "fulfillment_status", ""));

  const getValue = (val) => {
    return val ? val : "NA";
  };

  const getOrderTypeForConversions = (type) => {
    if (type === "sales_order") {
      return "Reservation";
    }
    return "Sales Order";
  };

  const info = () => {
    setModalIsOpen(true);
  };

  const handleSalesAssociateSubmit = async (sales_associate) => {
    const rest = await axios({
      method: "POST",
      data: {
        sales_order_id: get(props, "sales_order_id"),
        sales_associate,
      },
      url: `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/update_sales_associate`,
      headers: { ...getRequestHeader() },
    }).catch((err) => {
      openNotificationWithIcon("error", "Sales Associate", `${get(err, "response.data.message", "Something Went Wrong")} `);
    });

    if (get(rest, "data.status")) {
      props.refetchSalesOrderData();
      setUpdateSalesAssociateModalIsOpen(false);
      openNotificationWithIcon("success", "Sales Associate", get(rest, "data.message", "Sales Associate updated successfully"));
    } else {
      openNotificationWithIcon("error", "Sales Associate", get(rest, "data.message", "Something Went Wrong"));
    }
  };

  const handleProformaConfirmationTypeSubmit = async (requestPayload) => {
    const rest = await axios({
      method: "POST",
      data: requestPayload,
      url: `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/send_proforma_mail`,
      headers: { ...getRequestHeader() },
    }).catch((err) => {
      openNotificationWithIcon("error", "Order Type", `${get(err, "response.data.message", "Something Went Wrong")} `);
    });

    if (get(rest, "data.status")) {
      props.refetchSalesOrderData();
      openNotificationWithIcon("success", "Order Type", get(rest, "data.message", "Order Type updated successfully"));
    } else {
      openNotificationWithIcon("error", "Order Type", get(rest, "data.message", "Something Went Wrong"));
    }
  };

  const downloadSalesDetails = async () => {
    const rest = await axios({
      method: "GET",
      url: `${process.env.REACT_APP_API_ENDPOINT}/api/getSalesDetailsPdf/${get(props, "sales_order_id")}`,
      headers: { ...getRequestHeader() },
    }).catch((err) => {
      openNotificationWithIcon("error", "Order Details", `${get(err, "response.data.message", "Something Went Wrong")} `);
    });

    if (get(rest, "status") === 200) {
      var link = document.createElement("a");
      link.setAttribute("href", `${getFileType("pdf")};base64,${get(rest, "data.pdf")}`);
      link.setAttribute("download", `${get(props, "sales_order_id")}_${new Date().toLocaleString().replace(/[/, ]/g, "_")}.pdf`);
      document.body.appendChild(link); // Required for FF
      link.click();
      openNotificationWithIcon("success", "Order Details", "Download Successful");
      props.refetchSalesOrderData();
    } else {
      openNotificationWithIcon("warning", "Order Details", get(rest, "statusText", "Something went wrong"));
    }
  };

  const handleChangeOrderTypeSubmit = async (email) => {
    const rest = await axios({
      method: "POST",
      data: {
        sales_order_id: get(props, "sales_order_id"),
        customer_email_for_sending: email,
      },
      url: `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/change_order_type`,
      headers: { ...getRequestHeader() },
    }).catch((err) => {
      openNotificationWithIcon("error", "Order Type", `${get(err, "response.data.message", "Something Went Wrong")} `);
    });

    if (get(rest, "data.status")) {
      props.refetchSalesOrderData();
      openNotificationWithIcon("success", "Order Type", get(rest, "data.message", "Order Type updated successfully"));
    } else {
      openNotificationWithIcon("error", "Order Type", get(rest, "data.message", "Something Went Wrong"));
    }
  };

  const record = {
    sales_order_id: get(props, "sales_order_id"),
    email: get(props, "customer_email"),
    target_region: get(props, "target_region"),
    sales_associate: get(props, "sales_associate"),
    contact_name: get(props, "customer_name"),
    customer_response: get(props, "confirmation_status"),
    phone_no: get(props, "customer_number"),
    documents: get(props, "documents", []),
  };

  return (
    <div className="order_details__summary">
      <ErrorBoundary>
        <Spin spinning={get(props, "loading", false)}>
          {get(props, "customer_email") && modalIsOpen && (
            <ConvertOrderTypeModal isOpen={modalIsOpen} record={record} handleSubmit={(email) => handleChangeOrderTypeSubmit(email)} handleClose={() => setModalIsOpen(false)} okText="Convert" />
          )}

          {targetRegionModalIsOpen && (
            <UpdateTargetRegion
              refetchSalesOrderData={() => props.refetchSalesOrderData()}
              record={record}
              okText="Update"
              handleClose={() => setTargetRegionModalIsOpen(false)}
              isOpen={targetRegionModalIsOpen}
            />
          )}

          {updateSalesAssociateModalIsOpen && (
            <UpdateSalesAssociate
              isOpen={updateSalesAssociateModalIsOpen}
              record={record}
              handleSubmit={(email) => handleSalesAssociateSubmit(email)}
              handleClose={() => setUpdateSalesAssociateModalIsOpen(false)}
              okText="Update"
            />
          )}

          {get(props, "customer_email") && proformaModalIsOpen && (
            <ProformaSaleConfirmationModal
              isOpen={proformaModalIsOpen}
              record={record}
              refetchSalesOrderData={() => props.refetchSalesOrderData()}
              handleSubmit={(requestPayload) => handleProformaConfirmationTypeSubmit(requestPayload)}
              handleClose={() => setProformaModalIsOpen(false)}
              okText="Send"
            />
          )}
          <div className="CFA">
            {get(permissions, "show_approve_foc_text") && (
              <p className="float-right">
                <i> The following actions will be enabled after approval of Free of Charge Items </i>
              </p>
            )}
            <Tooltip placement="topLeft" title="Download Order Details">
              <Button type="primary" className="ml-sm-3" disabled={!get(permissions, "download_order_details")} icon={<DownloadOutlined />} size="small" onClick={() => downloadSalesDetails()}>
                Download Order Details
              </Button>
            </Tooltip>
            <Tooltip placement="topLeft" title=" View Proforma Sales Doc">
              <Button type="primary" disabled={!get(permissions, "view_proforma_sales_doc")} className="ml-sm-3" icon={<EyeOutlined />} size="small" onClick={() => setProformaModalIsOpen(true)}>
                View Proforma Sales Doc
              </Button>
            </Tooltip>
            <Tooltip placement="topLeft" title="Convert to Sales Order">
              <Button type="primary" className="ml-2" disabled={!get(permissions, "convert_to_sales_order")} icon={<SwapOutlined />} size="small" onClick={() => info()}>
                Convert to {getOrderTypeForConversions(get(props, "sales_order_type", "NA"))}
              </Button>
            </Tooltip>
          </div>
          <Row style={{ fontSize: "0.9rem" }}>
            <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
              <Text type="secondary">Order ID:</Text>
              <Tooltip placement="topLeft" title={get(props, "sales_order_id", "NA")}>
                <p> # {get(props, "sales_order_id", "NA")} </p>
              </Tooltip>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
              <div>
                <Text type="secondary">Order Type: </Text>
              </div>
              <p>
                <Tooltip placement="topLeft" title={capitalizeAllLetter(get(props, "sales_order_type", "NA").replace(/_/g, " "))}>
                  {capitalizeAllLetter(get(props, "sales_order_type", "NA").replace(/_/g, " "))}
                </Tooltip>
              </p>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
              <Text type="secondary">Order Placed:</Text>
              <Tooltip placement="topLeft" title={get(props, "order_created", "NA")}>
                <p> {get(props, "order_created")} </p>
              </Tooltip>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
              <Text type="secondary">Created By:</Text>
              <Tooltip placement="topLeft" title={get(props, "created_by", "NA")}>
                <p> {get(props, "created_by", "NA")} </p>
              </Tooltip>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
              <Text type="secondary">Total Case:</Text>
              <Tooltip placement="topLeft" title={get(props, "total_case", "NA")}>
                <p> {get(props, "total_case", "NA")} </p>
              </Tooltip>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
              <Text type="secondary">Total Order Value:</Text>
              <Tooltip placement="topLeft" title={get(props, "total_order_value") ? `£ ${get(props, "total_order_value")}` : "NA"}>
                <p> {get(props, "total_order_value") ? `£ ${numberWithCommas(get(props, "total_order_value", 0))}` : "NA"} </p>
              </Tooltip>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
              <Text type="secondary">Confirmation Status:</Text>
              <p>
                <Tag color={getConfirmationStatus}>{capitalizeAllLetter(get(props, "confirmation_status", "NA").replace(/_/g, " "))}</Tag>
              </p>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
              <Text type="secondary">Fulfillment Status:</Text>
              <p>
                <Tag color={getFulfillmentStatus}>{capitalizeAllLetter(get(props, "fulfillment_status", "NA").replace(/_/g, " "))}</Tag>
              </p>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
              <Text type="secondary">Estd Shipping Date:</Text>
              <Tooltip placement="topLeft" title={get(props, "estd_shipping_date", "NA") ? get(props, "estd_shipping_date", "NA") : "NA"}>
                <p> {get(props, "estd_shipping_date", "NA") ? get(props, "estd_shipping_date", "NA") : "NA"} </p>
              </Tooltip>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
              <Text type="secondary">
                Sales Associate:
                {get(permissions, "update_sales_associate") && <EditOutlined className="pl-2" onClick={() => setUpdateSalesAssociateModalIsOpen(true)} />}
              </Text>
              <Tooltip placement="topLeft" title={get(props, "sales_associate", "NA") ? get(props, "sales_associate", "NA") : "NA"}>
                <p>{get(props, "sales_associate", "NA") ? get(props, "sales_associate", "NA") : "NA"}</p>
              </Tooltip>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
              <Text type="secondary">Order Updated On:</Text>
              <Tooltip placement="topLeft" title={get(props, "order_updated_on", "NA")}>
                <p> {get(props, "order_updated_on")} </p>
              </Tooltip>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
              <Text type="secondary">Updated By:</Text>
              <Tooltip placement="topLeft" title={get(props, "updated_by", "NA")}>
                <p> {get(props, "updated_by", "NA")} </p>
              </Tooltip>
            </Col>
            <Col lg={{ span: 24 }}>
              <Text type="secondary">
                Target Region:
                {get(permissions, "update_target_region") && get(props, "sales_order_type") === "reservation" && get(props, "fulfillment_status", "").toLowerCase() !== "shipped" && (
                  <EditOutlined className="pl-2" onClick={() => setTargetRegionModalIsOpen(true)} />
                )}
              </Text>
              {get(props, "target_region") ? (
                <p style={{ whiteSpace: "pre-wrap" }}>
                  {get(props, "target_region")
                    .split(",")
                    .map((lis) => (
                      <Tag key={lis} color="processing" className="m-1">
                        {lis}
                      </Tag>
                    ))}
                </p>
              ) : (
                <p>NA</p>
              )}
            </Col>
          </Row>
          <Row style={{ fontSize: "0.9rem" }}>
            <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
              <Text type="secondary">Customer ID:</Text>
              <Tooltip placement="topLeft" title={`View Customer Details - # ${getValue(get(props, "customer_id", "NA"))}`}>
                <p>
                  {get(props, "customer_id") ? (
                    <Link to={{ pathname: `/customer-details/${get(props, "customer_id", "NA")}` }}>
                      <Button type="link" icon={<LinkOutlined className="pr-2" />}>
                        {getValue(get(props, "customer_id", "NA"))}
                      </Button>
                    </Link>
                  ) : (
                    getValue(get(props, "customer_id", "NA"))
                  )}
                </p>
              </Tooltip>
            </Col>

            <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
              <Text type="secondary">Customer Name:</Text>
              <Tooltip placement="topLeft" title={get(props, "customer_details.customer_name", "NA")}>
                <p> {get(props, "customer_details.customer_name", "NA")} </p>
              </Tooltip>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 4 }}>
              <Text type="secondary">Country:</Text>
              <Tooltip placement="topLeft" title={get(props, "customer_details.country", "NA")}>
                <p> {get(props, "customer_details.country", "NA")} </p>
              </Tooltip>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 10 }} lg={{ span: 6 }}>
              <Text type="secondary">Customer Email:</Text>
              <Tooltip placement="topLeft" title={get(props, "customer_details.customer_email", "NA")}>
                <p> {get(props, "customer_details.customer_email", "NA")} </p>
              </Tooltip>
            </Col>
          </Row>
        </Spin>
      </ErrorBoundary>
    </div>
  );
};

export default OrderSummary;
