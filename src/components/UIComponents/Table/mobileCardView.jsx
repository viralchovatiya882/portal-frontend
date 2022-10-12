import { DownOutlined, EditOutlined, EyeOutlined, LinkOutlined, MoreOutlined, SwapOutlined, UndoOutlined, UpOutlined } from "@ant-design/icons";
import ErrorBoundary from "@components/UIComponents/ErrorBoundary";
import { capitalizeAllLetter } from "@helpers/utility";
import { Button, Col, Dropdown, Pagination, Row, Spin, Tag, Tooltip } from "antd";
import { find, get, toString } from "lodash";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { TableColumnsList } from "../../../constants";
import {
  getChangeStatusUI,
  getTitle,
  getInventoryUI,
  getStatusEditUI,
  getViewCasedGoodAllocationsUI,
  getViewCasedGoodDetailsUI,
  trackOrderActionMenu
} from "./getMetaColumnData";
import { getMobileCardDataWrapper } from "./helper";

const getUIComponent = (key_name, value, custom, callback) => {
  const evaluatedValue = value ? value : "NA";
  const titleText = capitalizeAllLetter(toString(evaluatedValue).replace(/_/g, " "));

  if (!get(custom, "isClickable", true)) {
    // Tag Generation
    if (key_name === "confirmation_status" || key_name === "fulfillment_status" || key_name === "status") {
      return (
        <p>
          <Tag color={get(custom, "color")}>{titleText}</Tag>
        </p>
      );
    }
  }

  if (get(custom, "isClickable", false)) {
    let isAvailable = false;

    const { TrackOrder, ActiveLeads, CompletedLeads, ManageOrders } = TableColumnsList;
    if ([TrackOrder, ActiveLeads, CompletedLeads, ManageOrders].includes(get(custom, "columnType"))) {
      isAvailable = true;
    }

    if (isAvailable) {
      const column_obj = {
        column_name: key_name,
        column_text: titleText,
        columnType: get(custom, "columnType"),
        status_code: get(custom, "color"),
        statusColorMap: get(custom, "statusColorMap")
      };
      return (
        <>
          {getChangeStatusUI(evaluatedValue, column_obj, get(custom, "list"), result => {
            callback(result);
          })}
        </>
      );
    }

    if (get(custom, "columnType") === TableColumnsList.ChangeLog) {
      return <>{getViewCasedGoodDetailsUI(evaluatedValue, () => callback())}</>;
    }

    if (get(custom, "columnType") === TableColumnsList.Inventory) {
      return <>{getViewCasedGoodAllocationsUI(evaluatedValue, get(custom, "list"))}</>;
    }

    if (get(custom, "columnType") === TableColumnsList.Taxonomy) {
      return (
        <>
          {getStatusEditUI(evaluatedValue, result => {
            callback(result);
          })}
        </>
      );
    }
  }

  // Link Generation
  if (key_name === "lead_id" || key_name === "sales_order_id" || key_name === "customer_id") {
    let url_param;

    switch (key_name) {
      case "sales_order_id":
        url_param = "order-details";
        break;
      case "customer_id":
        url_param = "customer-details";
        break;
      default:
        url_param = "lead-details";
        break;
    }

    return (
      <Link to={{ pathname: `/${url_param}/${evaluatedValue}` }}>
        <Button type="link" className="p-0" icon={<LinkOutlined className="pr-2" />}>
          {evaluatedValue}
        </Button>
      </Link>
    );
  }
  return getElementValue(get(custom, "dataType"), evaluatedValue);
};

const getElementValue = (dataType, evaluatedValue) => {
  if (dataType === "price") {
    return `£ ${toString(evaluatedValue).replace(/_/g, " ")}`;
  }
  return capitalizeAllLetter(toString(evaluatedValue).replace(/_/g, " "));
};

const MobileCardView = props => {
  const [expandCard, setExpandCard] = useState(null);
  const [expectedData, setExpectedData] = useState([]);

  const [pagination, setPagination] = useState({
    minValue: 0,
    maxValue: 10,
    pageSize: 10,
    pageNumber: 1
  });

  const handleChangePage = page => {
    // document.body.scrollTop = 0; // For Safari
    // document.documentElement.scrollTop = 0;

    window.scroll({ top: 0, behavior: "smooth" });
    const minValue = (page - 1) * pagination.pageSize;
    const maxValue = page * pagination.pageSize;
    setPagination({
      ...pagination,
      pageNumber: page,
      minValue,
      maxValue
    });
    const spliceData = getData().slice(minValue, maxValue);
    setExpectedData([...spliceData]);
  };

  const getData = () => {
    return getMobileCardDataWrapper(get(props, "dataSource.cardInfo", []), get(props, "dataSource.columnData", []));
  };

  React.useEffect(() => {
    setExpectedData(getData().slice(0, 11));
  }, [props]);

  const getMoreActionPermission = list => {
    const actionItems = getActionItems();
    let returnVal = get(actionItems, "more_actions", []).length > 0 ? true : false;

    if (get(list, "fulfillment_status", "").toLowerCase() === "cancelled") {
      return false;
    }

    return returnVal;
  };

  const handleExpandCollapseCard = index => {
    if (expandCard !== index) {
      setExpandCard(index);
    } else {
      setExpandCard(null);
    }
  };

  const getURL = list => {
    let url_param, id;
    const columnType = get(props, "dataSource.columnType", "");
    switch (columnType) {
      case TableColumnsList.TrackOrder:
        url_param = "order-details";
        id = "sales_order_id";
        break;
      case TableColumnsList.ManageOrders:
        url_param = "order-details";
        id = "sales_order_id";
        break;
      case TableColumnsList.CompletedOrders:
        url_param = "order-details";
        id = "sales_order_id";
        break;
      case TableColumnsList.CustomerList:
        url_param = "customer-details";
        id = "customer_id";
        break;
      default:
        url_param = "lead-details";
        id = "id";
        break;
    }

    return `/${url_param}/${get(list, id)}`;
  };

  // console.log(get(props, "dataSource", []));

  // const currentExpectedData = getMobileCardDataWrapper(get(props, "dataSource.cardInfo", []), get(props, "dataSource.columnData", []));

  const getItemColumnInfo = key_name => {
    const displayKeyValue = find(get(props, "dataSource.columnInfo", []), function (o) {
      return o.key_name === key_name;
    });
    return displayKeyValue;
  };

  const getItemStatusColor = (info, value) => {
    return get(info, `status_color_map.${value}`);
  };

  const getActionItems = () => {
    const actionItemsIndex = get(props, "dataSource.columnInfo", []).length - 1;
    return get(props, "dataSource.columnInfo", [])[actionItemsIndex];
  };

  const iSPermissionAvailable = key => {
    const actionItems = getActionItems();
    if (get(actionItems, "options", []).includes(key)) {
      return true;
    }
    return false;
  };

  const isClickable = keyName => {
    const actionItems = getItemColumnInfo(keyName);
    return get(actionItems, "is_clickable", false);
  };

  const confirm = (record, custom) => {
    const columnType = get(props, "dataSource.columnType");
    switch (columnType) {
      case TableColumnsList.Taxonomy:
        return props.callback(record, custom);
      default:
        return props.callback(record, get(custom, "value"), { status: get(custom, "type") });
    }
  };

  return (
    <>
      <ErrorBoundary>
        <Spin spinning={get(props, "loading", false)}>
          {expectedData.map((list, index) => {
            return (
              <div className="mobile_card_view common_card_section">
                <Row className="w-100">
                  {get(props, "dataSource.cardInfo", [])
                    .slice(0, expandCard === index ? get(props, "dataSource.cardInfo", []).index : 6)
                    .map((keyName, card_index) => {
                      const displayIndexValue = get(expectedData, index);
                      const displayColumnInfo = getItemColumnInfo(keyName);
                      const statusColorCode = getItemStatusColor(displayColumnInfo, get(displayIndexValue, keyName));
                      const title = get(displayColumnInfo, "display_name", "NA");
                      const dataType = get(displayColumnInfo, "data_type", "");
                      const customPayload = {
                        color: statusColorCode,
                        list,
                        dataType,
                        isClickable: isClickable(keyName),
                        columnType: get(props, "dataSource.columnType"),
                        statusColorMap: get(displayColumnInfo, "status_color_map", {})
                      };
                      return (
                        <Col xs={{ span: 12 }} sm={{ span: 12 }}>
                          <div className="mt-2 mobile_card__title">
                            <p>{getTitle(keyName, get(props, "dataSource.columnType"), title, "small")}</p>
                          </div>
                          <div className="mobile_card_view__text">
                            {getUIComponent(keyName, get(displayIndexValue, keyName), customPayload, custom => {
                              confirm(list, custom);
                            })}
                          </div>
                        </Col>
                      );
                    })}
                </Row>
                <>
                  <hr style={{ backgroundColor: "#f0f0f7" }} />
                  <span className="d-flex flex-wrap align-items-center justify-content-end">
                    {iSPermissionAvailable("view_details") && (
                      <Link to={{ pathname: getURL(list) }}>
                        <EyeOutlined className="pr-3 text-black-50" />
                        {/* <Button type="link">View Details</Button> */}
                      </Link>
                    )}
                    {iSPermissionAvailable("edit") &&
                      (get(props, "dataSource.columnType") === TableColumnsList.Inventory ? (
                        getInventoryUI(get(props, "dataSource.currentAction"), "small", inventoryObj => props.callback(list, inventoryObj))
                      ) : (
                        <EditOutlined className="pr-3 text-black-50" onClick={() => props.callback(list)} />
                      ))}
                    {/* {iSPermissionAvailable("archive") && (
                      <SwitcherFilled className="pr-3 text-black-50" onClick={() => props.callback(list, ActionOptions.Delete)} />
                    )} */}
                    {iSPermissionAvailable("unarchive") && <UndoOutlined className="pr-3 text-black-50" onClick={() => props.callback(list)} />}
                    {getMoreActionPermission(list) && (
                      <Dropdown
                        trigger={["click"]}
                        overlayClassName="card_overlay"
                        overlay={trackOrderActionMenu([], list, get(props, "dataSource.userRole"), type => props.callback(list, type))}
                      >
                        <Tooltip placement="left" title="More actions">
                          <MoreOutlined
                            className="mr-3 text-black-50"
                            style={{
                              border: "1px solid",
                              borderRadius: 50,
                              padding: 0
                            }}
                          />
                          {/* <Button type="link">More Action</Button> */}
                        </Tooltip>
                      </Dropdown>
                    )}
                    {iSPermissionAvailable("convert_to_customer") && (
                      <Tooltip placement="left" title="Convert to Customer">
                        <SwapOutlined
                          className="pr-3"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            props.callback(list, list, { status: "convert_to_customer" });
                          }}
                        />
                      </Tooltip>
                    )}
                    {expandCard === index ? (
                      <UpOutlined onClick={() => handleExpandCollapseCard(index)} />
                    ) : (
                      <DownOutlined onClick={() => handleExpandCollapseCard(index)} />
                    )}
                    {/* <Button type="link" onClick={() => handleExpandCollapseCard(index)}>
                  {expandCard === index ? "View Less" : "View More"}
                </Button> */}
                  </span>
                </>
              </div>
            );
          })}
          <Pagination
            showTotal={total => `Total ${total} items`}
            defaultCurrent={1}
            showSizeChanger={false}
            className="mobile_card_view__pagination"
            showQuickJumper={false}
            showLessItems={false}
            current={get(pagination, "pageNumber")}
            total={getData().length}
            pageSize={10}
            responsive={true}
            onChange={page => handleChangePage(page)}
          />
        </Spin>
      </ErrorBoundary>
    </>
  );
};

export default MobileCardView;
