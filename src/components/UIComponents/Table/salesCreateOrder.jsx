import { DeleteFilled, EditOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { Input, Table, Tooltip } from "antd";
import { get } from "lodash";
import React, { useEffect, useState } from "react";
import { getScreenSize } from "../../../helpers/utility";

const SalesCreateOrderTableUI = (props) => {
  const [tableData, setTableData] = useState([]);
  const [metaData, setMetaData] = useState([]);
  const [scroll, setScroll] = useState({ x: 900, y: 530 });

  const inputPriceRef = React.useRef(null);
  const inputDiscountRef = React.useRef(null);

  const handleAction = (action, item, value, key_name) => {
    props.handleAction(action, item, value, key_name);
  };

  const handleAddCharges = (action, item) => {
    props.handleAddCharges(action, item);
  };

  useEffect(() => {
    if (get(inputDiscountRef, "current")) {
      inputDiscountRef.current.focus({
        cursor: "all",
      });
    }
  }, [inputDiscountRef.current]);

  useEffect(() => {
    if (get(inputPriceRef, "current")) {
      inputPriceRef.current.focus({
        cursor: "all",
      });
    }
  }, [inputPriceRef.current]);

  useEffect(() => {
    if (props.tableFor === "spiritAdded") {
      setScroll({ x: 2000, y: 300 });
    }
  }, [props.tableFor]);

  useEffect(() => {
    if (get(props, "data", []).length > 0) {
      const columnInfo = get(props, "metaInfo", []).map((item) => {
        const defaultConfigOptions = {
          title: item.display_name,
          dataIndex: item.key_name,
          key: item.key_name,
          ellipsis: { showTitle: true },
          width: item.width,
          fixed: getScreenSize() > 1180 ? "fixed" in item && item.fixed : null,
        };

        switch (item.key_name) {
          case "quantity":
            return {
              ...defaultConfigOptions,
              render: (text, item) => {
                return (
                  <Tooltip placement="topLeft" title={text}>
                    <div>
                      <span className="pr-1 pl-1">{text}</span>
                      <EditOutlined style={{ marginLeft: 3 }} onClick={() => handleAction("editCasePopup", item)} />
                    </div>
                  </Tooltip>
                );
              },
            };
          case "unit":
            return {
              ...defaultConfigOptions,
              render: (text, item) => {
                return (
                  <div>
                    <MinusOutlined onClick={() => handleAddCharges("reduce", item)} />
                    <span className="pr-2 pl-2">{text}</span>
                    <PlusOutlined onClick={() => handleAddCharges("add", item)} />
                  </div>
                );
              },
            };
          case "price_per_case":
            return {
              ...defaultConfigOptions,
              render: (text, item) => {
                return (
                  <div>
                    {item.editPrice ? (
                      <Input
                        onPressEnter={(e) =>
                          handleAction("blur", item, [
                            {
                              key_name: "price_per_case",
                              key_value: e.target.value,
                            },
                          ])
                        }
                        ref={inputPriceRef}
                        onBlur={(e) =>
                          handleAction("blur", item, [
                            {
                              key_name: "price_per_case",
                              key_value: e.target.value,
                            },
                          ])
                        }
                      />
                    ) : (
                      <Tooltip placement="topLeft" title={text}>
                        {get(item, "free_item", "").toLowerCase() === "yes" ? (
                          <span>&#163; {text}</span>
                        ) : (
                          <span>
                            &#163; {text}
                            <EditOutlined
                              style={{ marginLeft: 10 }}
                              onClick={() => {
                                handleAction("editPrice", item);
                              }}
                            />
                          </span>
                        )}
                      </Tooltip>
                    )}
                  </div>
                );
              },
            };
          case "discount":
            return {
              ...defaultConfigOptions,
              render: (text, item) => {
                return (
                  <div>
                    {item.editDiscount ? (
                      <Input
                        ref={inputDiscountRef}
                        onPressEnter={(e) =>
                          handleAction("blur", item, [
                            {
                              key_name: "discount",
                              key_value: e.target.value,
                            },
                          ])
                        }
                        onBlur={(e) =>
                          handleAction("blur", item, [
                            {
                              key_name: "discount",
                              key_value: e.target.value,
                            },
                          ])
                        }
                      />
                    ) : (
                      <Tooltip placement="topLeft" title={text}>
                        {get(item, "free_item", "").toLowerCase() === "yes" ? (
                          <span>{text}</span>
                        ) : (
                          <span>
                            {text}
                            <EditOutlined
                              style={{ marginLeft: 10 }}
                              onClick={() => {
                                handleAction("editDiscount", item);
                              }}
                            />
                          </span>
                        )}
                      </Tooltip>
                    )}
                  </div>
                );
              },
            };
          case "total_cost":
            return {
              ...defaultConfigOptions,
              render: (text, item) => {
                return (
                  <Tooltip placement="topLeft" title={text}>
                    £ {text}
                  </Tooltip>
                );
              },
            };
          case "cost_per_unit":
            return {
              ...defaultConfigOptions,
              render: (text, item) => {
                return (
                  <Tooltip placement="topLeft" title={text}>
                    £ {text}
                  </Tooltip>
                );
              },
            };
          case "total_price":
            return {
              ...defaultConfigOptions,
              render: (text, item) => {
                return (
                  <Tooltip placement="topLeft" title={text}>
                    £ {text}
                  </Tooltip>
                );
              },
            };
          case "price_after_discount":
            return {
              ...defaultConfigOptions,
              render: (text, item) => {
                return (
                  <Tooltip placement="topLeft" title={text}>
                    £ {text}
                  </Tooltip>
                );
              },
            };
          case "afterDiscount":
            return {
              ...defaultConfigOptions,
              render: (text, item) => {
                return (
                  <Tooltip placement="topLeft" title={text}>
                    £ {text}
                  </Tooltip>
                );
              },
            };
          case "delete-spirit":
            return {
              ...defaultConfigOptions,
              render: (text, item) => {
                return (
                  <center>
                    <DeleteFilled onClick={() => handleAction("delete", item)} />
                  </center>
                );
              },
            };
          case "delete-charges":
            return {
              ...defaultConfigOptions,
              render: (text, item) => {
                return (
                  <center>
                    <DeleteFilled onClick={() => handleAddCharges("delete", item)} />
                  </center>
                );
              },
            };
          default:
            return {
              ...defaultConfigOptions,
              render: (text, record) => {
                return (
                  <Tooltip placement="left" title={text}>
                    <span>{text || text === 0 ? text : "NA"}</span>
                  </Tooltip>
                );
              },
            };
        }
      });
      setMetaData(columnInfo);
    }
    setTableData(props.data);
  }, [props.data]);

  const getRowClassName = (record, index) => {
    if (get(record, "free_item", "").toLowerCase() === "yes") {
      return "highlight_row";
    }
    if (get(record, "anchor_product", false)) {
      return "highlight_row_anchor";
    }
    return "";
  };

  return (
    <Table
      dataSource={tableData}
      scroll={scroll}
      size="small"
      rowClassName={(record, index) => getRowClassName(record, index)}
      columns={metaData}
      pagination={false}
      loading={get(props, "isLoading", false)}
    />
  );
};

export default SalesCreateOrderTableUI;
