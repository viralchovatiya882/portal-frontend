import { DeleteOutlined } from "@ant-design/icons";
import { Popconfirm, Tooltip } from "antd";
import { get, round } from "lodash";
import { capitalizeAllLetter } from "../../../helpers/utility";
export const getDataColumns = (data, action, confirm) => {
  if (data.length > 0) {
    const columns_data = Object.keys(data[0]);
    if (action) {
      let column_list = columns_data.map((list) => {
        const title = capitalizeAllLetter(list.replace(/_/g, " "));
        return {
          title: title,
          dataIndex: list,
          ellipsis: {
            showTitle: true,
          },
          render: (text, record) => {
            return (
              <Tooltip placement="topLeft" title={text}>
                {text || text === 0 ? text : "----"}
              </Tooltip>
            );
          },
          key: list,
        };
      });
      column_list.push({
        title: "",
        dataIndex: "",
        width: 10,
        key: "x",
        render: (record) => {
          return (
            <center>
              <Popconfirm placement="topRight" title="Are you sure to delete this item?" onConfirm={() => confirm(record)} okText="Confirm" cancelText="Cancel">
                <Tooltip placement="left" title="Click to delete this item">
                  <DeleteOutlined />
                </Tooltip>
              </Popconfirm>
            </center>
          );
        },
      });
      return column_list;
    } else {
      return columns_data.map((list) => {
        const title = capitalizeAllLetter(list.replace(/_/g, " "));
        return {
          title: title,
          dataIndex: list,
          ellipsis: {
            showTitle: true,
          },
          key: list,
        };
      });
    }
  } else {
    return [];
  }
};
export const getCountByKey = (arr, key) => {
  let sumValue = arr.reduce((prev, cur) => {
    if (key === "unit") {
      return prev + parseInt(cur[key]);
    } else {
      return prev + round(cur[key], 2);
    }
  }, 0);
  return Number(sumValue);
};

export const getBundledDataColumns = (data, action, confirm) => {
  return data.map((list) => {
    return {
      title: get(list, "display_name"),
      dataIndex: get(list, "key_name"),
      key: get(list, "key_name"),
      width: get(list, "width"),
      ellipsis: {
        showTitle: true,
      },
    };
  });
};