import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { isMobileOrTab } from "@constants";
import { getScreenSize, numberWithCommas } from "@helpers/utility";
import { info } from "@ui-components/Modal/informationModal";
import { Button, Input, Popconfirm, Tooltip } from "antd";
import { cloneDeep, compact, get, isNumber, isObject, sortBy } from "lodash";
import React from "react";

/**
 * Get Columns
 * @param
 * @returns Columns
 */
export const getCustomUIColumnsData = (getColumnSearchProps, datasource, actions, callback, columnType) => {
  let evaluatedColumnData = [];
  let columnKeys = get(datasource, "data", []).length > 0 ? Object.keys(get(datasource, "data[0]", [])) : [];

  if (get(datasource, "columns", []).length > 0) {
    columnKeys = [...get(datasource, "columns")];
  }

  if (columnKeys[0] === "key") {
    columnKeys.shift();
  }

  columnKeys.pop();

  evaluatedColumnData = columnKeys.map((data) => {
    const column_name = get(data, "key_name", data);
    const column_width = `${get(data, "width", 50)}%`;
    const isClickable = get(data, "is_clickable", false);
    const dataType = get(data, "data_type");
    const isHiglighted = get(data, "is_highlighted", false);
    const title = get(data, "display_name");
    const filters = getFilterOptions(get(datasource, "data", []), column_name);

    return {
      title: (
        <Tooltip placement="topLeft" title={title}>
          <span className={title && title.length > 17 ? "custom_table_dynamic_data_title" : ""}>{title}</span>
        </Tooltip>
      ),
      className: isHiglighted ? "custom_column_style" : "",
      dataIndex: column_name,
      filters: filters,
      key: column_name,
      fixed: getFixedPositionStatus(column_name),
      filterIcon: !get(actions, "isFilterable", false) && <></>,
      ellipsis: {
        showTitle: true,
      },
      sorter: (a, b) => {
        if (a[column_name] && b[column_name]) {
          if (isNumber(a[column_name])) {
            return a[column_name] - b[column_name];
          }
          return a[column_name].localeCompare(b[column_name]);
        }
      },
      width: column_width,
      ...getColumnSearchProps(column_name, filters, title),
      render: (text, record) => (
        <>
          {isObject(text) ? (
            <Tooltip placement="top" title={get(text, "value", "")}>
              {get(text, "isEditable", false) ? (
                getUIComponent(
                  get(text, "componentType"),
                  {
                    label: title,
                    type: column_name,
                    value: get(text, "value", ""),
                  },
                  (actionType, value) => {
                    const isEditable = actionType !== "blur" && actionType !== "enter";
                    callback(record, column_name, { actionType, value, isEditable });
                  }
                )
              ) : (
                <div className="d-flex align-items-center overflow-hidden">
                  <Tooltip placement="topLeft" title={get(text, "value", "NA")}>
                    <span className="pdf_name_ellipsis">{get(text, "value", "NA")}</span>
                  </Tooltip>
                  <Tooltip placement="left" title="Edit">
                    <EditOutlined
                      style={{ paddingLeft: 10 }}
                      onClick={(e) => {
                        e.preventDefault();
                        callback(record, column_name, { isEditable: true });
                      }}
                    />
                  </Tooltip>
                </div>
              )}
            </Tooltip>
          ) : (
            <>
              {
                <Tooltip placement="top" title={getDisplayElement(dataType, column_name, text)}>
                  {getDisplayElement(dataType, column_name, text, isClickable, () => {
                    callback(record, column_name);
                  })}
                </Tooltip>
              }
            </>
          )}
        </>
      ),
    };
  });

  if (get(actions, "isEditable", false)) {
    evaluatedColumnData.push({
      title: "Action",
      dataIndex: "edit",
      key: "edit",
      className: "text-center",
      fixed: "right",
      width: "20%",
      render: (text, record) => (
        <>
          {get(record, "edit", false) && (
            <Tooltip placement="left" title="Edit">
              <EditOutlined style={{ paddingRight: 10 }} onClick={() => callback(record, text, { isEditable: true, actionType: "edit" })} />
            </Tooltip>
          )}

          {get(record, "delete", true) && (
            <Popconfirm
              placement="topRight"
              title="Are you sure you want to delete?"
              onConfirm={() => callback(record, text, { isDelete: true, actionType: "delete" })}
              okText="Delete"
              cancelText="Cancel"
            >
              <Tooltip placement="left" title="Delete">
                <DeleteOutlined style={{ paddingRight: 10 }} />
              </Tooltip>
            </Popconfirm>
          )}
          {/* {!get(record, "edit", true) && !get(record, "delete", true) && (
            <span>
              <Tooltip placement="left" title="Editing of approved FOC Items is not allowed">
                <EditOutlined style={{ marginRight: 10 }} className="action-not-allowed" />
              </Tooltip>
              <Tooltip placement="left" title="Editing of approved FOC Items is not allowed">
                <DeleteOutlined style={{ marginRight: 10 }} className="action-not-allowed" />
              </Tooltip>
            </span>
          )} */}

          {!get(record, "edit", true) && !get(record, "delete", true) && (
            <span>
              <EditOutlined style={{ marginRight: 10 }} className="action-not-allowed" />
              <DeleteOutlined style={{ marginRight: 10 }} className="action-not-allowed" />
            </span>
          )}
        </>
      ),
    });
  }
  // if (get(actions, "isDelete", false)) {
  //   evaluatedColumnData.push({
  //     title: "",
  //     dataIndex: "delete",
  //     key: "edit",
  //     className: "text-center",
  //     fixed: "right",
  //     width: "10%",
  //     render: (text, record) => (
  //       <>
  //         <Popconfirm
  //           placement="topRight"
  //           title="Are you sure you want to delete?"
  //           onConfirm={() => callback(record, text, { isDelete: true, actionType: "delete" })}
  //           okText="Delete"
  //           cancelText="Cancel"
  //         >
  //           <Tooltip placement="left" title="Delete">
  //             <DeleteOutlined style={{ paddingRight: 10 }} />
  //           </Tooltip>
  //         </Popconfirm>
  //       </>
  //     )
  //   });
  // }
  return evaluatedColumnData;
};

const handleViewInfo = (title, message) => {
  info({
    title,
    message,
    width: 600,
  });
};

const getDisplayElement = (dataType, column_name, text, is_clickable, callback) => {
  switch (dataType) {
    case "price":
      return <span> {text || text === 0 ? `£ ${numberWithCommas(text)}` : "NA"}</span>;
    case "varchar":
      if (column_name === "custom_label_text" && is_clickable) {
        return (
          <center>
            {text ? (
              <Button icon={<EyeOutlined />} onClick={() => handleViewInfo("Custom Label Text", text)}>
                View
              </Button>
            ) : (
              "----"
            )}
          </center>
        );
      }
      if (column_name === "rotation_number" && is_clickable) {
        return (
          <center
            className="d-flex align-items-center w-75"
            style={{
              textOverflow: "ellipsis",
            }}
          >
            <span
              style={{
                textOverflow: "ellipsis",
                overflow: "hidden",
              }}
            >
              {text}
            </span>{" "}
            <EditOutlined onClick={() => callback()} />
          </center>
        );
      }
      return <span> {text ? text : "----"}</span>;

    default:
      return <span> {text || text === 0 ? text : "----"}</span>;
  }
};

const getFixedPositionStatus = (column) => {
  switch (column) {
    case "rotation_number":
      return getScreenSize() > isMobileOrTab && "right";
    default:
      return false;
  }
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

export const getFilterOptions = (data, key) => {
  let filters = [];
  let dataNewSet = cloneDeep(data).map((dataValue) => dataValue[key]);
  dataNewSet = Array.from(new Set(dataNewSet));
  dataNewSet = sortBy(dataNewSet, [
    function (o) {
      return o;
    },
  ]);
  filters = compact(dataNewSet).map((textValue) => {
    let computedTextValue = textValue ? textValue.toString() : textValue;
    if (isObject(textValue)) {
      computedTextValue = get(textValue, "value", "");
    }
    return {
      text: computedTextValue,
      value: computedTextValue,
      label: computedTextValue,
    };
  });
  return filters;
};

const getUIComponent = (componentType, inputData, handleChange) => {
  if (componentType === "inputText") {
    return (
      <Input
        onChange={(e) => {
          e.preventDefault();
          handleChange("update", e.target.value);
        }}
        value={get(inputData, "value", "")}
        onBlur={() => handleChange("blur", get(inputData, "value", ""))}
        onPressEnter={(e) => handleChange("enter", e.target.value)}
        className={get(inputData, "className", "mt-0 mb-0 w-100")}
      />
    );
  }
};
