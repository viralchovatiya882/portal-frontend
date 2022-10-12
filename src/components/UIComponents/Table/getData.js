import {
  EditOutlined,
  EyeOutlined, InfoCircleTwoTone, SettingOutlined,
  SwitcherFilled,
  UndoOutlined
} from "@ant-design/icons";
import { Button, Popconfirm, Radio, Tooltip } from "antd";
import { cloneDeep, compact, get, sortBy, toNumber, toString } from "lodash";
import React from "react";
import { ActionOptions, newValue, oldValue, processId, TableColumnsList } from "../../../constants";
import { capitalizeAllLetter } from "../../../helpers/utility";
import { fixedColumnWidth30, highlightColumns } from "./constants";
import "./index.scss";

let statusValue = null, inventoryStatusValue = ActionOptions.Quantity;

/**
 * Get Columns
 * @param
 * @returns Columns
 */
export const CustomColumns = (
  getColumnSearchProps,
  columnData,
  metaInfo,
  isEditable = false,
  callback,
  columnType,
  currentAction
) => {
  const column_info = get(metaInfo, "column_info", []);
  let evaluatedColumnData = [];
  let columnKeys = columnData.length > 0 ? Object.keys(columnData[0]) : [];

  if (columnKeys[0] === "key") {
    columnKeys.shift();
  }

  const lastKeyElement = get(column_info, `[${column_info.length - 1}]`);
  const isActionPermitted = get(lastKeyElement, "key_name") === "action" ? get(lastKeyElement, "is_clickable", false) : false;
  const isTaxonomyStatusEditPermitted = get(lastKeyElement, "key_name") === "status" ? get(lastKeyElement, "is_clickable", false) : false;

  const confirm = (record, type) => {
    if (columnType === TableColumnsList.Taxonomy) {
      callback(record, statusValue);
    }

    if (columnType === TableColumnsList.Inventory) {
      callback(record, inventoryStatusValue);
    }
  };

  evaluatedColumnData = columnKeys.map((data) => {
    const filters = getFilterOptions(columnData, data);
    const title = capitalizeAllLetter(data.replace(/_/g, " "));
    if (data === "status" && columnType === TableColumnsList.Taxonomy) {
      return {
        title: title,
        dataIndex: data,
        key: data,
        ellipsis: { showTitle: false },
        filters: filters,
        sorter: (a, b) => {
          return toString(get(a, data, "")).localeCompare(toString(get(b, data, "")), undefined,
          { numeric: !isNaN(toNumber(get(a, data, ""))) && !isNaN(toNumber(get(b, data, ""))) })
        },
        width: "30%",
        ...getColumnSearchProps(data, filters, title),
        render: (text, record) => {
          return (
            <>
              {isTaxonomyStatusEditPermitted ?
                <Popconfirm
                  placement="topRight"
                  title={<StatusEdit value={text} />}
                  onConfirm={() => confirm(record)}
                  okText="Save"
                  cancelText="Cancel"
                >
                  <Tooltip placement="topLeft" title="Click to change status">
                    <Button icon={<SettingOutlined />}>{text}</Button>
                  </Tooltip>
                </Popconfirm> :
                <span>{text}</span>
              }
            </>
          );
        },
      };
    }
    if (data === "cased_goods_ID" && columnType === TableColumnsList.ChangeLog) {
      return {
        title: title,
        dataIndex: data,
        key: data,
        ellipsis: { showTitle: false },
        filters: filters,
        sorter: (a, b) => {
          return toString(get(a, data, "")).localeCompare(toString(get(b, data, "")), undefined,
          { numeric: !isNaN(toNumber(get(a, data, ""))) && !isNaN(toNumber(get(b, data, ""))) })
        },
        width: "35%",
        ...getColumnSearchProps(data, filters, title),
        render: (text, record) => {
          return (
            <div onClick={() => callback(record)}>
              <Tooltip placement="topLeft" title="Click to View Case Details">
                <Button icon={<EyeOutlined className="pr-2" />}>{text}</Button>
              </Tooltip>
            </div>
          );
        },
      };
    }
    if (
      (data === "new_value" || data === "old_value" || data === "process_ID") &&
      columnType === TableColumnsList.ChangeLog
    ) {
      let columnInfo;
      if (data === "new_value") {
        columnInfo = newValue;
      } else if (data === "old_value") {
        columnInfo = oldValue;
      } else if (data === "process_ID") {
        columnInfo = processId;
      }
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
      return {
        title: (
          <div
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <Tooltip
              overlayClassName="changelog-tooltip"
              placement="bottom"
              color="#43425d"
              title={titleRender}
              trigger={"click"}
            >
              <InfoCircleTwoTone style={{ marginRight: 5 }} />
            </Tooltip>
            {title}
          </div>
        ),
        dataIndex: data,
        key: data,
        ellipsis: { showTitle: false },
        filters: filters,
        sorter: (a, b) => {
          return toString(get(a, data, "")).localeCompare(toString(get(b, data, "")), undefined,
          { numeric: !isNaN(toNumber(get(a, data, ""))) && !isNaN(toNumber(get(b, data, ""))) })
        },
        width: "35%",
        ...getColumnSearchProps(data, filters, title),
      };
    }
    return {
      title: (
        <Tooltip placement="topLeft" title={title}>
          <span
            className={
              title.length > 17 ? "custom_table_dynamic_data_title" : ""
            }
          >
            {title}
          </span>
        </Tooltip>
      ),
      className: highlightColumns.includes(data) ? "custom_column_style" : "",
      dataIndex: data,
      filters: filters,
      key: data,
      ellipsis: {
        showTitle: true,
      },
      sorter: (a, b) => {
        return toString(get(a, data, "")).localeCompare(toString(get(b, data, "")), undefined,
        { numeric: !isNaN(toNumber(get(a, data, ""))) && !isNaN(toNumber(get(b, data, ""))) })
      },
      width: fixedColumnWidth30.includes(data) ? "30%" : "50%",
      ...getColumnSearchProps(data, filters, title),
    };
  });
  if (isActionPermitted || isEditable) {
    evaluatedColumnData.push({
      title: "Action",
      dataIndex: "edit",
      key: "edit",
      className: "text-center",
      fixed: "right",
      width: "20%",
      render: (text, record) => (
        <>
          {columnType !== TableColumnsList.Inventory &&
            columnType !== TableColumnsList.DeletedInventory && (
              <Tooltip placement="top" title="Edit">
                <EditOutlined
                  style={{ paddingRight: 10 }}
                  onClick={() => callback(record)}
                />
              </Tooltip>
            )}

          {columnType === TableColumnsList.DeletedInventory && (
            <Tooltip placement="top" title="Add back to Inventory">
              <UndoOutlined
                style={{ paddingRight: 10 }}
                onClick={() => callback(record)}
              />
            </Tooltip>
          )}

          {columnType === TableColumnsList.Inventory && (
            <>
              <Popconfirm
                placement="topRight"
                title={<InventoryEditOptions value={currentAction} />}
                onConfirm={() => confirm(record)}
                okText="Ok"
                cancelText="Cancel"
              >
                <Tooltip placement="top" title="Edit">
                  <EditOutlined style={{ paddingRight: 10 }} />
                </Tooltip>
              </Popconfirm>
              <Tooltip placement="top" title="Archive">
                <SwitcherFilled
                  onClick={() => {
                    inventoryStatusValue = ActionOptions.Delete;
                    confirm(record);
                  }}
                />
              </Tooltip>
            </>
          )}
        </>
      ),
    });
  }
  return evaluatedColumnData;
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
    const computedTextValue = textValue ? textValue.toString() : textValue;
    return {
      text: computedTextValue,
      value: computedTextValue,
      label: computedTextValue,
    };
  });
  return filters;
};
