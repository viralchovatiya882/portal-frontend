import {
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  InfoCircleTwoTone,
  LinkOutlined,
  MoreOutlined,
  SettingOutlined,
  SwapOutlined,
  SwitcherFilled,
  UndoOutlined
} from "@ant-design/icons";
import { openNotificationWithIcon } from "@components/UIComponents/Toast/notification";
import { getRequestHeader } from "@helpers/service";
import { capitalizeAllLetter, numberWithCommas } from "@helpers/utility";
import { CustomDatePicker } from "@ui-components/DatePicker";
import { Button, Col, Divider, Dropdown, List, Menu, message, Modal, Popconfirm, Radio, Row, Table, Tag, Tooltip } from "antd";
import axios from "axios";
import { cloneDeep, compact, filter, flattenDeep, get, has, isNumber, map, round, sortBy, toNumber, toString } from "lodash";
import React from "react";
import { Link } from "react-router-dom";
import { ActionOptions, TableColumnsList } from "../../../constants";
import { CaseReferenceColumns, changeLogColumnOptions, TrackActiveLeadAction, TrackOrderAction } from "./constants";
import { getStatusOptions } from "./helper";
import "./index.scss";

let statusValue = null,
  inventoryStatusValue = ActionOptions.Quantity,
  status = { type: "", value: null };

/**
 * Get Columns
 * @param
 * @returns Columns
 */
export const CustomMetaColumns = (getColumnSearchProps, datasource, callback) => {
  let evaluatedColumnData = [];
  const columnType = get(datasource, "columnType");
  const currentAction = get(datasource, "currentAction");
  const isEditable = get(datasource, "isEditable", false);
  const userRole = get(datasource, "userRole");

  const confirm = (record, type) => {
    switch (columnType) {
      case TableColumnsList.Taxonomy:
        return callback(record, statusValue);
      case TableColumnsList.Inventory:
        return callback(record, inventoryStatusValue);
      case TableColumnsList.AdditionalCharges:
        return callback(record, type);
      case TableColumnsList.ActiveLeads:
        return callback(record, get(status, "value"), { status: get(status, "type") });
      case TableColumnsList.CompletedLeads:
        return callback(record, get(status, "value"), { status: get(status, "type") });
      case TableColumnsList.ManageOrders:
        return callback(record, get(status, "value"), { status: get(status, "type") });
      case TableColumnsList.CancelledOrders:
        return callback(record, get(status, "value"), { status: get(status, "type") });
      default:
        return callback(record);
    }
  };

  const getEditOutlinedUIOption = () => {
    switch (columnType) {
      case TableColumnsList.TrackOrder:
        return false;
      case TableColumnsList.ManageOrders:
        return false;
      case TableColumnsList.CancelledOrders:
        return false;
      case TableColumnsList.CompletedOrders:
        return false;
      case TableColumnsList.Inventory:
        return false;
      case TableColumnsList.DeletedInventory:
        return false;
      case TableColumnsList.ActiveLeads:
        return false;
      case TableColumnsList.CompletedLeads:
        return false;
      case TableColumnsList.AdditionalCharges:
        return false;
      case TableColumnsList.CustomerList:
        return false;
      default:
        return true;
    }
  };

  const getFixedColumnDataPosition = (column_name) => {
    switch (column_name) {
      case "fulfillment_status":
        return columnType !== TableColumnsList.CustomerDetails && "right";
      case "status":
        return "right";
      case "follow_up_date":
        return "right";
      // case "net_cases":
      //   return "left";
      // case "id":
      //   return "left";
      default:
        return false;
    }
  };

  evaluatedColumnData = get(datasource, "columnInfo", []).map((column_data_info) => {
    const column_name = get(column_data_info, "key_name");
    const column_width = get(column_data_info, "width", 50);
    const isClickable = get(column_data_info, "is_clickable", false);
    const dataType = get(column_data_info, "data_type");
    const isStatusLabel = get(column_data_info, "is_status_label", false);
    const statusColorMap = get(column_data_info, "status_color_map", {});
    const isHiglighted = get(column_data_info, "is_highlighted", false);
    const filter_key = get(column_data_info, "filter_key");
    const filters = getFilterOptions(get(datasource, "columnData", []), column_name, filter_key);
    const title = get(column_data_info, "display_name");

    if (column_name === "action" || isEditable) {
      const moreActions = get(column_data_info, "more_actions", []);
      const isConvertToCustomer = get(column_data_info, "enable_convert_to_customer", false);

      return {
        title: getTitle(column_name, columnType, title),
        dataIndex: column_name,
        key: column_name,
        className: "text-center",
        fixed: "right",
        width: 20,
        render: (text, record) => (
          <>
            {getEditOutlinedUIOption() && (
              <Tooltip placement="left" title="Edit">
                <EditOutlined style={{ paddingRight: 10 }} onClick={() => callback(record)} />
              </Tooltip>
            )}
            {columnType === TableColumnsList.DeletedInventory && (
              <Tooltip placement="left" title="Add back to Inventory">
                <UndoOutlined style={{ paddingRight: 10 }} onClick={() => callback(record)} />
              </Tooltip>
            )}
            {columnType === TableColumnsList.Inventory && <>{getInventoryUI(currentAction, "large", () => confirm(record))}</>}
            {columnType === TableColumnsList.ActiveLeads && (
              <>
                <Tooltip placement="left" title="View Lead Details">
                  <Link
                    to={{
                      pathname: `/lead-details/${get(record, "id")}`,
                    }}
                    className="text-decoration-none text-black-50"
                  >
                    <EyeOutlined style={{ paddingRight: 10 }} />
                  </Link>
                </Tooltip>
                {isConvertToCustomer && (
                  <Tooltip placement="left" title="Convert to Customer">
                    <SwapOutlined
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        status = { value: record, type: "convert_to_customer" };
                        confirm(record);
                      }}
                    />
                  </Tooltip>
                )}
              </>
            )}
            {columnType === TableColumnsList.CustomerList && (
              <>
                <Tooltip placement="left" title="View Customer Details">
                  <Link
                    to={{
                      pathname: `/customer-details/${get(record, "customer_id")}`,
                    }}
                    className="text-decoration-none text-black-50"
                  >
                    <EyeOutlined style={{ paddingRight: 10 }} />
                  </Link>
                </Tooltip>
              </>
            )}
            {columnType === TableColumnsList.CompletedLeads && (
              <>
                <Tooltip placement="left" title="View Lead Details">
                  <Link
                    to={{
                      pathname: `/lead-details/${get(record, "id")}`,
                    }}
                    className="text-decoration-none text-black-50"
                  >
                    <EyeOutlined style={{ paddingRight: 10 }} />
                  </Link>
                </Tooltip>
              </>
            )}
            {columnType === TableColumnsList.AdditionalCharges && (
              <>
                <Tooltip placement="left" title="Edit Item">
                  <EditOutlined style={{ paddingRight: 10 }} className="cursor-pointer" onClick={() => confirm(record, "edit")} />
                </Tooltip>
                <Popconfirm placement="topRight" title="Are you sure to delete this item?" onConfirm={() => confirm(record, "delete")} okText="Ok" cancelText="Cancel">
                  <Tooltip placement="left" title="Delete Item">
                    <DeleteOutlined className="cursor-pointer" />
                  </Tooltip>
                </Popconfirm>
              </>
            )}
            {(columnType === TableColumnsList.CompletedOrders || columnType === TableColumnsList.CancelledOrders) && (
              <>
                <Tooltip placement="left" title="View Order Details">
                  <Link
                    to={{
                      pathname: `/order-details/${get(record, "sales_order_id")}`,
                      state: { prevPath: "completedOrders" },
                    }}
                    className="text-decoration-none text-black-50"
                  >
                    <EyeOutlined style={get(record, "fulfillment_status", "").toLowerCase() !== "cancelled" ? { paddingRight: 10 } : { marginRight: "35%" }} />
                  </Link>
                </Tooltip>
                {get(record, "fulfillment_status", "").toLowerCase() !== "cancelled" && (
                  <Dropdown trigger={["click"]} overlay={trackOrderActionMenu(moreActions, record, userRole, (type) => callback(record, type))}>
                    <Tooltip placement="left" title="More actions">
                      <MoreOutlined />
                    </Tooltip>
                  </Dropdown>
                )}
              </>
            )}
            {(columnType === TableColumnsList.TrackOrder || columnType === TableColumnsList.ManageOrders) && (
              <>
                <Tooltip placement="left" title="View Order Details">
                  <Link
                    to={{
                      pathname: `/order-details/${get(record, "sales_order_id")}`,
                    }}
                    className="text-decoration-none text-black-50"
                  >
                    <EyeOutlined style={get(record, "fulfillment_status", "").toLowerCase() !== "cancelled" ? { paddingRight: 10 } : { marginRight: "35%" }} />
                  </Link>
                </Tooltip>
                {get(record, "fulfillment_status", "").toLowerCase() !== "cancelled" && (
                  <Dropdown trigger={["click"]} overlay={trackOrderActionMenu(moreActions, record, userRole, (type) => callback(record, type))}>
                    <Tooltip placement="left" title="More actions">
                      <MoreOutlined />
                    </Tooltip>
                  </Dropdown>
                )}
              </>
            )}
          </>
        ),
      };
    }
    if (isClickable) {
      return {
        title: getTitle(column_name, columnType, title),
        dataIndex: column_name,
        key: column_name,
        fixed: getFixedColumnDataPosition(column_name),
        ellipsis: { showTitle: false },
        filters: filters,
        sorter: (a, b) => {
          return toString(get(a, column_name, "")).localeCompare(toString(get(b, column_name, "")), undefined, {
            numeric: !isNaN(toNumber(get(a, column_name, ""))) && !isNaN(toNumber(get(b, column_name, ""))),
          });
        },
        width: column_width,
        ...getColumnSearchProps(column_name, filters, title),
        render: (text, record) => {
          let getRenderText = "",
            statusCode = "";
          if (isStatusLabel) {
            // const getText = toString(text).toLowerCase();
            const getText = toString(text);
            getRenderText = capitalizeAllLetter(getText.replace(/_/g, " "));
            statusCode = get(statusColorMap, getText);
          }

          let column_obj = {
            column_name,
            column_text: getRenderText,
            status_code: statusCode,
            statusColorMap,
          };
          return getUIComponent(columnType, column_obj, text, record, () => confirm(record), userRole);
        },
      };
    }

    return {
      title: getTitle(column_name, columnType, title),
      dataIndex: column_name,
      filters: filters,
      className: getClassName(isHiglighted, column_name),
      key: column_name,
      ellipsis: { showTitle: true },
      sorter: (a, b) => {
        return toString(get(a, column_name, "")).localeCompare(toString(get(b, column_name, "")), undefined, {
          numeric: !isNaN(toNumber(get(a, column_name, ""))) && !isNaN(toNumber(get(b, column_name, ""))),
        });
      },
      width: column_width,
      fixed: getFixedColumnDataPosition(column_name),
      ...getColumnSearchProps(column_name, filters, title),
      render: (text, record) => {
        const titleText = capitalizeAllLetter(toString(text).replace(/_/g, " "));
        // const titleText = toString(text);
        const textValue = dataType === "price" ? numberWithCommas(titleText) : titleText;
        if (isStatusLabel) {
          const getText = text !== "NA" ? toString(text).toLowerCase() : toString(text);
          const getRenderText = capitalizeAllLetter(getText.replace(/_/g, " "));
          const statusCode = get(statusColorMap, getText);
          return <Tag color={statusCode}>{getRenderText}</Tag>;
        }
        return (
          <Tooltip placement="topLeft" title={getElementText(dataType, titleText)}>
            {getElementText(dataType, titleText)}
          </Tooltip>
        );
      },
    };
  });

  return evaluatedColumnData;
};

const getClassName = (isHiglighted, column_name) => {
  if (isHiglighted) {
    return "custom_column_style";
  } else if (column_name === "total_order_value") {
    return "text-right";
  } else {
    return "";
  }
};

const getElementText = (dataType, titleText) => {
  if (dataType === "price") {
    return <span> {titleText || titleText === 0 ? `£ ${numberWithCommas(titleText)}` : "NA"}</span>;
  }
  return <span> {titleText || titleText === 0 ? titleText : "----"}</span>;
};
export const getInventoryUI = (currentAction, type = "large", callback) => {
  return (
    <>
      <Popconfirm
        placement="topRight"
        title={<InventoryEditOptions value={currentAction} />}
        onConfirm={() => callback(inventoryStatusValue)}
        okText="Ok"
        overlayClassName="inventory__ui__editing"
        icon={<></>}
        cancelText="Cancel"
      >
        <Tooltip placement="left" title="Edit">
          <EditOutlined style={{ paddingRight: 10 }} />
        </Tooltip>
      </Popconfirm>

      <Tooltip placement="left" title="Archive">
        <SwitcherFilled
          className={type === "small" ? "pl-2 pr-3" : ""}
          onClick={() => {
            inventoryStatusValue = ActionOptions.Delete;
            callback(ActionOptions.Delete);
          }}
        />
      </Tooltip>
    </>
  );
};

/**
 * Renders Title based on condition
 * @param
 */
export const getTitle = (data, columnType, text, type = "large") => {
  const isChangeLog = (data === "new_value" || data === "old_value" || data === "process_ID") && columnType === TableColumnsList.ChangeLog;

  if (isChangeLog) {
    const columnInfo = get(changeLogColumnOptions, data, []);
    const titleRender = () => {
      return (
        <div className="tooltip-extended">
          {columnInfo.map((item) => (
            <div>
              <label key={item.id}>{item.label}</label>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      );
    };
    return (
      <>
        <Tooltip overlayClassName="changelog-tooltip" placement="bottom" color="#43425d" title={titleRender} trigger="click">
          <InfoCircleTwoTone onClick={(event) => event.stopPropagation()} />
        </Tooltip>
        <span className="pl-2">{text}</span>
      </>
    );
  }

  return (
    <Tooltip placement="topLeft" title={text}>
      <span className={type === "large" ? "custom_table_dynamic_data_title" : ""}>{text}</span>
    </Tooltip>
  );
};

const getCancelledOrderPermission = (role, columnType = "CancelledOrders") => {
  let returnVal = false;

  switch (role) {
    case "admin":
      returnVal = true;
      break;
    case "productionManager":
      returnVal = true;
      break;
    case "salesDirector":
      returnVal = true;
      break;
    default:
      returnVal = false;
      break;
  }
  return returnVal;
};

/**
 * Renders UI Component based on condition
 * @param
 */
const getUIComponent = (columnType, column_obj, text, record, callback, userRole = "") => {
  let isAvailable = false;
  const { TrackOrder, ActiveLeads, CompletedLeads, ManageOrders, CancelledOrders } = TableColumnsList;

  if ([TrackOrder, ActiveLeads, CompletedLeads, ManageOrders, CancelledOrders].includes(columnType)) {
    isAvailable = true;
  }

  if (columnType === "CancelledOrders" && !getCancelledOrderPermission(userRole)) {
    isAvailable = false;
  }

  return (
    <>
      {columnType === TableColumnsList.Taxonomy && getStatusEditUI(text, () => callback())}
      {columnType === TableColumnsList.Inventory && getViewCasedGoodRSupportingUI(text, record, column_obj, () => callback())}
      {columnType === TableColumnsList.ChangeLog && getViewCasedGoodDetailsUI(text, () => callback())}
      {columnType === TableColumnsList.HelpTicket && getHelpTicketImageUI(text, () => callback())}
      {columnType === TableColumnsList.CustomerList && getCustomerListingUI(text, () => callback())}
      {columnType === TableColumnsList.CustomerDetails && getCustomerDetailsUI(text, () => callback())}
      {isAvailable && getChangeStatusUI(text, { ...column_obj, columnType }, record, () => callback())}
      {columnType === TableColumnsList.CompletedOrders && getCompletedSalesOrdersUI(text, () => callback())}
    </>
  );
};

/**
 * Renders Taxonomy Status Supporting UI
 * @param
 */
export const getStatusEditUI = (text, confirm) => {
  return (
    <Popconfirm placement="topRight" icon={<></>} title={<StatusEdit value={text} />} onConfirm={() => confirm(statusValue)} okText="Save" cancelText="Cancel">
      <Tooltip placement="topLeft" title="Click to change status">
        <Button icon={<SettingOutlined />}>{text}</Button>
      </Tooltip>
    </Popconfirm>
  );
};

/**
 * Renders View Cased Goods Details Supporting UI
 * @param
 */
export const getViewCasedGoodDetailsUI = (text, confirm) => {
  return (
    <div onClick={() => confirm()}>
      <Tooltip placement="topLeft" title="Click to View Case Details">
        <Button icon={<EyeOutlined className="pr-2" />}>{text}</Button>
      </Tooltip>
    </div>
  );
};

const fetchAllocations = async (record) => {
  const allocatedResp = await axios({
    method: "GET",
    url: `${process.env.REACT_APP_API_ENDPOINT}/api/allocated_orders/${get(record, "id")}`,
    headers: {
      ...getRequestHeader(),
    },
  }).catch((err) => {
    openNotificationWithIcon("error", "Inventory Allocations", `${get(err, "response.data.message", "Something Went Wrong")} `);
  });

  if (get(allocatedResp, "status") === 200) {
    return get(allocatedResp, "data.data", []);
  }
};

const fetchCaseReferenceDetails = async (record) => {
  const caseReferenceResp = await axios({
    method: "POST",
    data: {
      cased_goods_id: get(record, "id"),
      exclude_empty: false,
    },
    url: `${process.env.REACT_APP_API_ENDPOINT}/api/inventory/rotation_number_list`,
    headers: {
      ...getRequestHeader(),
    },
  }).catch((err) => {
    openNotificationWithIcon("error", "Inventory Rotation Number", `${get(err, "response.data.message", "Something Went Wrong")} `);
  });

  if (get(caseReferenceResp, "status") === 200) {
    return get(caseReferenceResp, "data.rotation_numbers", []);
  }
};

/**
 * Renders View Cased Goods Inventory Supporting UI
 * @param
 */
export const getViewCasedGoodRSupportingUI = (text, record, column_obj) => {
  if (get(column_obj, "column_name") === "allocations") {
    return getViewCasedGoodAllocationsUI(text, record, column_obj);
  }

  if (get(column_obj, "column_name") === "case_reference") {
    return getViewCasedGoodReferenceUI(text, record, column_obj);
  }
};

/**
 * Renders View Cased Goods Case Reference Details Supporting UI
 * @param
 */
export const getViewCasedGoodReferenceUI = (text, record, column_obj) => {
  return (
    <div
      onClick={() => {
        if (text) {
          caseReferenceInfoModal(record);
        } else {
          message.info("No Rotation Number Found");
        }
      }}
    >
      {text ? (
        <Tooltip placement="right" title="Click to View Rotation Number">
          <Button className="d-flex align-items-center w-100" icon={<EyeOutlined className="pr-2" />} style={{ textOverflow: "ellipsis" }}>
            <span style={{ textOverflow: "ellipsis", overflow: "hidden" }}> {text} </span>
          </Button>
        </Tooltip>
      ) : (
        <>NA</>
      )}
    </div>
  );
};

/**
 * Renders View Cased Goods Allocation Details Supporting UI
 * @param
 */
export const getViewCasedGoodAllocationsUI = (text, record, column_obj) => {
  return (
    <div
      onClick={() => {
        if (text) {
          infoModal(record);
        } else {
          message.info("No Allocations Found");
        }
      }}
    >
      <Tooltip placement="right" title="Click to View Allocations">
        <Button icon={<EyeOutlined className="pr-2" />}>{text}</Button>
      </Tooltip>
    </div>
  );
};

const infoModal = async (record) => {
  const resp = await fetchAllocations(record);

  Modal.info({
    className: "info_quick_modal",
    icon: <></>,
    title: "Cased Goods Allocations",
    centered: true,
    content: (
      <div style={{ height: "300px", overflow: "auto" }}>
        <List
          itemLayout="horizontal"
          dataSource={resp ? resp : []}
          renderItem={(item) => {
            const getAllocationTitle = () => {
              if (get(item, "sales_order_type") === "reservation") {
                return "Reservation";
              }
              if (get(item, "sales_order_type") === "consignment") {
                return "Consignment";
              }
              return "Order ID";
            };

            return (
              <List.Item>
                <List.Item.Meta
                  title={
                    <>
                      {getAllocationTitle()}:<b className="pl-1 pr-1">{get(item, "sales_order_id")}</b>
                      <span>
                        {get(item, "customer_name", "") ? (
                          <>
                            for <b> {get(item, "customer_name", "")}</b>
                          </>
                        ) : (
                          <></>
                        )}
                      </span>
                    </>
                  }
                  description={
                    <>
                      Allocated Cases : <b>{item.allocated_cases}</b>
                    </>
                  }
                />
              </List.Item>
            );
          }}
        />
      </div>
    ),
    onOk() {},
  });
};

const caseReferenceInfoModal = async (record) => {
  const resp = await fetchCaseReferenceDetails(record);

  const dataEvaluated = resp.map((list, index) => {
    return {
      key: index,
      rotation_number: get(list, "rotation_number"),
      quantity: round(Number(get(list, "bottles", 0)) / Number(get(list, "bpc", 0)), 2),
      allocated_quantity: round(Number(get(list, "allocated_bottles", 0)) / Number(get(list, "bpc", 0)), 2),
    };
  });

  Modal.info({
    className: "info_quick_modal",
    icon: <></>,
    title: (
      <>
        <Row gutter={[10, 10]}>
          <Col>
            <span>
              Cased Goods ID:
              <b className="ml-1">
                <Tag color="#108ee9">{get(record, "id") ? get(record, "id") : "NIL"} </Tag>
              </b>
            </span>
          </Col>
          <Col>
            <span>
              Year: <b> {get(record, "year") ? get(record, "year") : "NIL"} </b>
            </span>
          </Col>
          <Col>
            <span>
              Brand: <b> {get(record, "brand") ? get(record, "brand") : "NIL"}</b>
            </span>
          </Col>
          <Col>
            <span>
              Distillery: <b> {get(record, "distillery") ? get(record, "distillery") : "NIL"}</b>
            </span>
          </Col>
          <Col>
            <span>
              Available Cases:
              <b className="ml-1">
                <Tag color="#108ee9">{get(record, "cases") ? get(record, "cases") : 0}</Tag>
              </b>
            </span>
          </Col>
          <Col>
            <span>
              Allocated Cases:
              <b className="ml-1">
                <Tag color="#108ee9">{get(record, "allocations") ? get(record, "allocations") : 0}</Tag>
              </b>
            </span>
          </Col>
          <Col>
            <span>
              Net Cases:
              <b className="ml-1">
                <Tag color="#108ee9">{get(record, "net_cases") ? get(record, "net_cases") : 0}</Tag>
              </b>
            </span>
          </Col>
          <Col>
            <span>
              BPC:
              <b className="ml-1">
                <Tag color="#108ee9">{get(record, "bpc", 0) ? get(record, "bpc", 0) : "0"}</Tag>
              </b>
            </span>
          </Col>
          <Col>
            <span>
              Bottles:
              <b className="ml-1">
                <Tag color="#108ee9">{get(record, "bottles", 0) ? get(record, "bottles", 0) : "0"}</Tag>
              </b>
            </span>
          </Col>
        </Row>
      </>
    ),
    centered: true,
    width: 850,
    content: (
      <>
        <Table
          size="small"
          bordered
          className="mt-3"
          dataSource={dataEvaluated}
          scroll={{ y: 300 }}
          pagination={{
            position: ["none", "none"],
          }}
          columns={CaseReferenceColumns}
        />
      </>
    ),
    onOk() {},
  });
};

/**
 * Renders Help Ticket Supporting UI
 * @param
 */
const getHelpTicketImageUI = (text, confirm) => {
  return <span> {text ? text : <center>----</center>} </span>;
  // return (
  //   <div onClick={() => confirm()}>
  //     <Tooltip placement="topLeft" title="Click to View Image">
  //       <Button icon={<EyeOutlined className="pr-2" />}>
  //         View Image
  //       </Button>
  //     </Tooltip>
  //   </div>
  // );
};

/**
 * Renders Customer Details Supporting UI
 * @param
 */
const getCustomerDetailsUI = (text, confirm) => {
  return (
    <div>
      <Tooltip placement="topLeft" title={`View Order Details - # ${text ? text : "NA"}`}>
        {text ? (
          <Link
            to={{
              pathname: `/order-details/${text}`,
            }}
          >
            <Button type="link" icon={<LinkOutlined className="pr-2" />}>
              {text}
            </Button>
          </Link>
        ) : (
          <span> ---- </span>
        )}
      </Tooltip>
    </div>
  );
};

/**
 * Renders Customer Listing Supporting UI
 * @param
 */
const getCustomerListingUI = (text, confirm) => {
  return (
    <center>
      <Tooltip placement="topLeft" title={`View Lead Details - # ${text ? text : "NA"}`}>
        {text ? (
          <Link
            to={{
              pathname: `/lead-details/${text}`,
              state: { prevPath: "customer_listing" },
            }}
          >
            <Button type="link" icon={<LinkOutlined className="pr-2" />}>
              {text}
            </Button>
          </Link>
        ) : (
          <span> ---- </span>
        )}
      </Tooltip>
    </center>
  );
};

/**
 * Renders Completed Sales Order Supporting UI
 * @param
 */
const getCompletedSalesOrdersUI = (text, confirm) => {
  return <span> {text ? text : <center>----</center>} </span>;
};

/**
 * Renders Total Sales Order Supporting UI
 * @param
 */
export const getChangeStatusUI = (text, column_obj, record, confirm) => {
  if (get(column_obj, "column_name") === "follow_up_date") {
    return (
      <Popconfirm
        placement="bottomRight"
        title={<FollowUpDateChange value={text} type={get(column_obj, "columnType")} />}
        onConfirm={() => confirm(status)}
        okText="Update"
        icon={<></>}
        cancelText="Cancel"
      >
        <Tooltip placement="topLeft" title="Click to change Follow up date">
          <span style={{ cursor: "pointer" }}> {text} </span> <EditOutlined />
        </Tooltip>
      </Popconfirm>
    );
  }

  if (get(column_obj, "column_name") === "message") {
    return (
      <>
        {text ? (
          <div
            onClick={() => {
              const requestRecord = { value: record, type: "message" };
              status = requestRecord;
              confirm(requestRecord);
            }}
          >
            <Tooltip placement="topLeft" title="Click to View Message">
              <Button icon={<EyeOutlined />}>View</Button>
            </Tooltip>
          </div>
        ) : (
          <center> NA </center>
        )}
      </>
    );
  }

  if (get(column_obj, "column_name") === "fulfillment_status" || get(column_obj, "column_name") === "status") {
    return (
      <Popconfirm
        placement="bottomRight"
        title={<StatusUpdateUI value={get(column_obj, "column_text")} statusColorMap={get(column_obj, "statusColorMap")} type={get(column_obj, "columnType")} />}
        onConfirm={() => confirm(status)}
        okText="Update"
        icon={<></>}
        cancelText="Cancel"
      >
        <Tooltip placement="topLeft" title="Click to change status">
          <span style={{ cursor: "pointer" }}>
            <Tag color={get(column_obj, "status_code")}>{get(column_obj, "column_text")}</Tag> <EditOutlined />
          </span>
        </Tooltip>
      </Popconfirm>
    );
  }
  return <span> {text ? text : <center>----</center>} </span>;
};

/**
 * Get Column Data
 * @param
 * @returns Columns Data
 */
export const getDataWrapper = (responseData) => {
  let rowData = [];
  if (responseData && responseData.length > 0) {
    responseData.map((data, index) => {
      const rowObj = {
        key: Math.random(),
        ...data,
      };
      rowData.push(rowObj);
    });
  }
  return rowData;
};

/**
 * Renders Taxonomy Status Edit Supporting UI
 * @param
 */
const StatusEdit = (props) => {
  const [value, setValue] = React.useState(props.value);

  const onStatusChange = (e) => {
    setValue(e.target.value);
    statusValue = e.target.value;
  };

  return (
    <>
      <b className="w-100 float-left mb-2">Choose Status</b>
      <Radio.Group onChange={onStatusChange} value={value}>
        <Radio value="Active">Active</Radio>
        <Radio value="Inactive">Inactive</Radio>
      </Radio.Group>
    </>
  );
};

/**
 * Renders Follow Up Date Edit Supporting UI
 * @param
 */
export const FollowUpDateChange = (props) => {
  const [value, setValue] = React.useState(props.value);

  return (
    <>
      <CustomDatePicker
        handleChange={(key, val) => {
          setValue(val);
          status = { value: val, type: "follow_up_date" };
        }}
        enableOnlyFutureDate={true}
        type="follow_up_date"
        value={value}
        className="mt-0 mb-0 w-100"
        label="Follow Up Date (YYYY-MM-DD)"
        placeholder="Follow Up Date (YYYY-MM-DD)"
      />
    </>
  );
};

/**
 * Renders Order Details Status Edit Supporting UI
 * @param
 */
export const StatusUpdateUI = (props) => {
  const [value, setValue] = React.useState(props.value);

  React.useEffect(() => {
    setValue(props.value);
  }, [props]);

  const onStatusChange = (selectedTitle, selectedValue) => {
    setValue(selectedTitle);
    status = { value: selectedValue, type: get(props, "type") === TableColumnsList.ActiveLeads ? "status" : "fulfillment_status" };
    if (has(props, "handleStatusChange", false)) {
      props.handleStatusChange(status);
    }
  };

  // const data = get(props, "type") === TableColumnsList.ActiveLeads ? ActiveLeadStatusData : SalesOrderFulFillmentStatusData;
  const data = getStatusOptions(get(props, "statusColorMap", {}));

  return (
    <>
      <List
        itemLayout="horizontal"
        dataSource={data}
        className="fulfillment__status_listing"
        renderItem={(item) => (
          <List.Item style={{ cursor: "pointer" }}>
            <List.Item.Meta
              title={
                <span onClick={() => onStatusChange(get(item, "title"), get(item, "value"))}>
                  <Tag color={get(item, "color")}>{get(item, "title")}</Tag>
                  {value === get(item, "title") && <CheckOutlined style={{ color: "#81ba11" }} />}
                </span>
              }
            />
          </List.Item>
        )}
      />
    </>
  );
};

/**
 * Renders Live Inventory Edit Supporting UI
 * @param
 */
const InventoryEditOptions = (props) => {
  const [value, setValue] = React.useState(props.value);

  React.useEffect(() => {
    setValue(props.value);
    inventoryStatusValue = props.value;
  }, [props]);

  const onStatusChange = (e) => {
    setValue(e.target.value);
    inventoryStatusValue = e.target.value;
  };

  return (
    <>
      <b className="w-100 float-left mb-2">Choose field to edit</b>
      <Radio.Group onChange={onStatusChange} value={value}>
        <Radio value={ActionOptions.Quantity}>Quantity</Radio>
        <Radio value={ActionOptions.Price}>Price</Radio>
      </Radio.Group>
    </>
  );
};

/**
 * Get Column Data
 * @param
 * @returns Filtered Data
 */
export const getFilterOptions = (data, key, filter_key_ref) => {
  let filters = [];

  if (data.length === 0) {
    return filters;
  }

  let dataNewSet = cloneDeep(data).map((dataValue) => dataValue[key]);
  if (key === "tags") {
    const tagsArray = map(dataNewSet, function (o) {
      return o && o.split(" | ");
    });
    dataNewSet = flattenDeep(tagsArray);
  }
  dataNewSet = Array.from(new Set(dataNewSet));

  dataNewSet = sortBy(dataNewSet, [
    function (o) {
      return isNumber(o) ? o : toString(o).toLowerCase();
    },
  ]);
  filters = compact(dataNewSet).map((textValue) => {
    const computedTextValue = textValue ? textValue.toString() : textValue;
    const label = capitalizeAllLetter(toString(computedTextValue).replace(/_/g, " "));
    return { text: computedTextValue, value: computedTextValue, label };
  });
  return filters;
};

export const trackOrderActionMenu = (moreActions, record, userRole, actionCallback) => {
  let trackOptionsList = cloneDeep(TrackOrderAction);
  if (get(record, "fulfillment_status") === "shipped" && userRole !== "admin") {
    trackOptionsList = filter(trackOptionsList, function (o) {
      return o.type !== "cancel";
    });
  }
  return (
    <>
      <Menu>
        {trackOptionsList.map((list, index) => {
          return (
            <>
              <Menu.Item icon={get(list, "component")} key={index} disabled={get(list, "item.disabled", false)}>
                {get(list, "pathname") ? (
                  <Link
                    to={{
                      pathname: get(list, "pathname"),
                      state: { record, type: get(list, "type"), title: get(list, "item") },
                    }}
                    className="text-decoration-none"
                  >
                    {get(list, "item")}
                  </Link>
                ) : (
                  <span onClick={() => actionCallback(get(list, "item"))}>{get(list, "item")}</span>
                )}
              </Menu.Item>
              <Divider style={{ margin: 0 }} />
            </>
          );
        })}
      </Menu>
    </>
  );
};

const trackLeadActionMenu = (moreActions, record, actionCallback) => {
  return (
    <>
      <Menu>
        {TrackActiveLeadAction.map((list, index) => {
          return (
            <>
              <Menu.Item icon={get(list, "component")} key={index}>
                {get(list, "pathname") ? (
                  <Link
                    to={{
                      pathname: get(list, "pathname"),
                      state: { record, type: get(list, "type"), title: get(list, "item") },
                    }}
                    className="text-decoration-none"
                  >
                    {get(list, "item")}
                  </Link>
                ) : (
                  <span onClick={() => actionCallback(get(list, "item"))}>{get(list, "item")}</span>
                )}
              </Menu.Item>
              <Divider style={{ margin: 0 }} />
            </>
          );
        })}
      </Menu>
    </>
  );
};
