import { CloseOutlined, DeleteOutlined, EditOutlined, InfoCircleOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, InputNumber, message, Modal, Popconfirm, Row, Select, Spin, Table, Tag, Tooltip, Typography } from "antd";
import axios from "axios";
import { cloneDeep, find, get, round, toString } from "lodash";
import React, { useState } from "react";
import { getRequestHeader } from "../../../../helpers/service";
import { getKeyValuePair } from "../../../../helpers/utility";
import { openNotificationWithIcon } from "../../../UIComponents/Toast/notification";

const EditableCell = ({ editing, dataIndex, title, inputType, record, index, children, ...restProps }) => {
  let inputNode = <InputNumber className="w-100" placeholder={title} min={0} />;
  if (inputType === "text") {
    inputNode = <Input className="w-100" placeholder={title} />;
  }

  if (inputType === "dropdown") {
    const options = dataIndex === "rotation_number" ? get(restProps, "rotationNumberList", []) : get(restProps, "partCaseOptions", []);
    inputNode = <Select placeholder={title} defaultActiveFirstOption={false} allowClear options={options} className="w-100 part-case-field" />;
  }

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: dataIndex === "bottles_in_partial_case" ? false : true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const EditRotationNumber = (props) => {
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState([]);
  const [isChanged, setIsChanged] = useState(false);
  const [editingKey, setEditingKey] = useState("");
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [partCaseOptions, setPartCaseOptions] = React.useState([]);
  const [rotationNumberOptions, setRotationNumberOptions] = React.useState([]);

  const handlePartCaseOptions = (BPC) => {
    if (BPC) {
      let partCaseOptionsList = [];
      for (let i = 1; i < BPC; i++) {
        partCaseOptionsList.push({
          label: `${i} / ${BPC}`,
          value: `${i}/${BPC}`,
        });
      }
      if (partCaseOptionsList.length === 0) {
        partCaseOptionsList = [{ label: 0, value: 0 }];
        setPartCaseOptions([...partCaseOptionsList]);
      } else {
        setPartCaseOptions([...partCaseOptionsList]);
      }
    }
  };

  React.useEffect(() => {
    handlePartCaseOptions(get(props, "record.bpc", 0));
  }, [props.record.bpc]);

  const isEditing = (record) => record.key === editingKey;

  const handleDelete = (key) => {
    setIsChanged(true);
    setIsDisabled(false);
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
  };

  const handleAdd = () => {
    const newData = {
      key: count,
      whole_case: "",
      bottles_in_partial_case: undefined,
      rotation_number: undefined,
    };
    setIsDisabled(true);
    setEditingKey("");
    edit(newData);
    setIsChanged(true);
    setDataSource([...dataSource, newData]);
    setCount(count + 1);
  };

  const edit = (record) => {
    form.setFieldsValue({
      whole_case: "",
      bottles_in_partial_case: "",
      rotation_number: "",
      ...record,
    });
    setIsDisabled(true);
    setEditingKey(record.key);
  };

  const cancel = () => {
    setIsDisabled(false);
    setEditingKey("");
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const bottles_in_partial_case = getBIPCValue(get(row, "bottles_in_partial_case", "0/0"));
      const sumValue = get(row, "whole_case", 0) + bottles_in_partial_case;
      if (sumValue > 0) {
        const newData = [...dataSource];
        const index = newData.findIndex((item) => key === item.key);
        if (index > -1) {
          const item = newData[index];
          newData.splice(index, 1, { ...item, ...row });
          setDataSource(newData);
          setEditingKey("");
        } else {
          newData.push(row);
          setDataSource(newData);
          setEditingKey("");
        }
        setIsDisabled(false);
      } else {
        message.warning("Quantity cannot be 0");
      }
    } catch (errInfo) {
      // eslint-disable-next-line no-console
      console.log("Validate Failed:", errInfo);
    }
  };

  const columns = [
    {
      title: "Rotation Number",
      dataIndex: "rotation_number",
      width: "45%",
      editable: true,
    },
    {
      title: "Whole Case",
      dataIndex: "whole_case",
      width: "20%",
      editable: true,
    },
    {
      title: "Part Case",
      dataIndex: "bottles_in_partial_case",
      width: "20%",
      editable: true,
    },
    {
      title: "Action",
      dataIndex: "operation",
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link onClick={() => save(record.key)}>
              <Tooltip placement="left" title="Save">
                <SaveOutlined />
              </Tooltip>
            </Typography.Link>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a className="pl-3">
                <Tooltip placement="left" title="Cancel">
                  <CloseOutlined />
                </Tooltip>
              </a>
            </Popconfirm>
          </span>
        ) : (
          <>
            <Typography.Link disabled={editingKey !== ""} onClick={() => edit(record)}>
              <Tooltip placement="left" title="Edit">
                <EditOutlined />
              </Tooltip>
            </Typography.Link>
            {dataSource.length >= 1 ? (
              <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.key)}>
                <a className="pl-3">
                  <Tooltip placement="left" title="Delete">
                    <DeleteOutlined />
                  </Tooltip>
                </a>
              </Popconfirm>
            ) : null}
          </>
        );
      },
    },
  ];

  const getInputType = (type) => {
    let returnVal = "text";

    switch (type) {
      case "bottles_in_partial_case":
        returnVal = "dropdown";
        break;
      case "rotation_number":
        if (get(props, "record.cased_goods_id")) {
          returnVal = "dropdown";
        } else {
          returnVal = "text";
        }
        break;
      case "whole_case":
        returnVal = "number";
        break;
      default:
        returnVal = "text";
        break;
    }

    return returnVal;
  };

  const getCustomRotationNumberList = (rotationNumberOptionsListing) => {
    const list = getKeyValuePair(rotationNumberOptionsListing, "rotation_number", false);
    let tempArr = list.map((data, index) => {
      const currentValue = find(rotationNumberOptionsListing, function (o) {
        return get(o, "rotation_number") === get(data, "value");
      });
      if (currentValue) {
        return {
          label: (
            <>
              {get(currentValue, "rotation_number")}
              <b className="float-right">
                Available Qty <Tag color="#108ee9">{get(currentValue, "available_qty", 0)} </Tag>
              </b>
            </>
          ),
          value: get(data, "value"),
        };
      }
    });
    setRotationNumberOptions(tempArr);
  };

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: getInputType(col.dataIndex),
        dataIndex: col.dataIndex,
        title: col.title,
        rotationNumberList: rotationNumberOptions,
        partCaseOptions,
        editing: isEditing(record),
      }),
    };
  });

  const getBIPCValue = (bottles_in_partial_case) => {
    let partCase = bottles_in_partial_case ? bottles_in_partial_case.split("/") : "";
    partCase = partCase ? partCase[0] : 0;
    return round(Number(partCase), 2);
  };

  const handleOk = async () => {
    if (isChanged) {
      let rotation_numbers = dataSource.map((list) => {
        return {
          whole_case: get(list, "whole_case", 0),
          bottles_in_partial_case: getBIPCValue(get(list, "bottles_in_partial_case", "0/0")),
          rotation_number: get(list, "rotation_number", 0),
        };
      });

      // rotation_numbers = rotation_numbers.filter((o) => {
      //   return get(o, "whole_case", 0) + get(o, " bottles_in_partial_case", 0) > 0;
      // });

      const rest = await axios({
        method: "POST",
        data: {
          sales_order_id: get(props, "orderId"),
          cased_goods_id: get(props, "record.cased_goods_id"),
          item_id: get(props, "record.item_id"),
          rotation_numbers,
        },
        url: `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/edit_item_rotation_numbers`,
        headers: { ...getRequestHeader() },
      }).catch((err) => {
        setLoading(false);
        openNotificationWithIcon("error", "Rotation Number", `${get(err, "response.data.message", "Something Went Wrong")} `);
      });

      if (get(rest, "data.status")) {
        setLoading(false);
        props.handleSubmit();
        openNotificationWithIcon("success", "Rotation Number", get(rest, "data.message", "Rotation Number updated successfully"));
      } else {
        setLoading(false);
        openNotificationWithIcon("error", "Rotation Number", get(rest, "data.message", "Something Went Wrong"));
      }
    } else {
      setLoading(false);
      openNotificationWithIcon("info", "Rotation Number", "Nothing to update");
    }
  };

  const getSumArrayOfObjWithKey = (arr, key) => {
    let sumValue = arr.reduce((prev, cur) => {
      return prev + (key === "bottles_in_partial_case" ? round(Number(getPartCaseValue(cur[key])), 2) : round(Number(cur[key]), 2));
    }, 0);
    return sumValue;
  };

  const getPartCaseValue = (bottles_in_partial_case) => {
    let BPC = get(props, "record.bpc", 0);
    let partCase = bottles_in_partial_case ? toString(bottles_in_partial_case).split("/") : "";
    partCase = partCase ? partCase[0] : 0;
    return round(Number(partCase) / Number(BPC), 2);
  };

  const getWholeTotalCasesSum = () => {
    return round(getSumArrayOfObjWithKey(dataSource, "whole_case"), 2);
  };

  const getPartTotalCasesSum = () => {
    return round(getSumArrayOfObjWithKey(dataSource, "bottles_in_partial_case"), 2);
  };

  const getTotalCasesSum = () => {
    return getWholeTotalCasesSum() + getPartTotalCasesSum();
  };

  const getAvailableRNList = async () => {
    const rest = await axios({
      method: "POST",
      data: {
        cased_goods_id: get(props, "record.cased_goods_id"),
        exclude_empty: true,
      },
      url: `${process.env.REACT_APP_API_ENDPOINT}/api/inventory/rotation_number_list`,
      headers: { ...getRequestHeader() },
    }).catch((err) => {
      setLoading(false);
      openNotificationWithIcon("error", "Rotation Number", `${get(err, "response.data.message", "Something Went Wrong")} `);
    });
    if (get(rest, "data.status")) {
      getCustomRotationNumberList(get(rest, "data.rotation_numbers", []));
      setLoading(false);
    } else {
      setLoading(false);
      openNotificationWithIcon("error", "Rotation Number", get(rest, "data.message", "Something Went Wrong"));
    }
  };

  React.useEffect(() => {
    getAvailableRNList();
    let newDataAvailable = cloneDeep(get(props, "record.rotation_numbers", []));
    newDataAvailable = newDataAvailable.map((list, index) => {
      list["key"] = index;
      list["bottles_in_partial_case"] = get(list, "bottles_in_partial_case", 0) ? `${get(list, "bottles_in_partial_case", 0)}/${get(props, "record.bpc", 0)}` : undefined;
      return list;
    });
    setCount(newDataAvailable.length);
    setDataSource(newDataAvailable);
  }, []);

  const getDisabledValue = () => {
    let returnVal = false;
    if (isDisabled) {
      returnVal = true;
    }
    if (getTotalCasesSum() != get(props, "record.quantity", 0)) {
      returnVal = true;
    }
    return returnVal;
  };

  return (
    <Modal
      className="rotation_number__editing"
      title=""
      maskClosable={false}
      closable={false}
      visible={get(props, "isModalVisible", false)}
      okText="Save"
      okButtonProps={{
        disabled: getDisabledValue(),
      }}
      onOk={() => {
        setLoading(true);
        handleOk();
      }}
      centered
      destroyOnClose={true}
      width={800}
      onCancel={() => props.handleCancel()}
    >
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col>
            <span>
              Cased Goods ID:
              <b className="ml-1">
                <Tag color="#108ee9">{get(props, "record.cased_goods_id") ? get(props, "record.cased_goods_id") : "NIL"}</Tag>
              </b>
            </span>
          </Col>
          <Col>
            <span>
              Year: <b> {get(props, "record.year") ? get(props, "record.year") : "NIL"} </b>
            </span>
          </Col>
          <Col>
            <span>
              Brand: <b> {get(props, "record.brand") ? get(props, "record.brand") : "NIL"}</b>
            </span>
          </Col>
          <Col>
            <span>
              Distillery: <b> {get(props, "record.distillery") ? get(props, "record.distillery") : "NIL"}</b>
            </span>
          </Col>
          <Col>
            <span>
              Available Cases:
              <b className="ml-1">
                <Tag color="#108ee9">{get(props, "record.cases") ? get(props, "record.cases") : 0}</Tag>
              </b>
            </span>
          </Col>
          <Col>
            <span>
              Allocated Cases:
              <b className="ml-1">
                <Tag color="#108ee9">{get(props, "record.allocations") ? get(props, "record.allocations") : 0}</Tag>
              </b>
            </span>
          </Col>
          <Col>
            <span>
              Net Cases:
              <b className="ml-1">
                <Tag color="#108ee9">{get(props, "record.net_cases") ? get(props, "record.net_cases") : 0}</Tag>
              </b>
            </span>
          </Col>
          {/* <Col>
            <span>
              Quantity:
              <b className="ml-1">
                <Tag color="#108ee9">{get(props, "record.quantity") ? get(props, "record.quantity") : 0}</Tag>
              </b>
            </span>
          </Col> */}
        </Row>

        <div className="float-right edit__rotation_number__label mt-3">
          <Tooltip placement="left" title="Add Rotation Number">
            <Button
              onClick={handleAdd}
              type="primary"
              // disabled={getTotalCasesSum() >= get(props, "record.cases", 0)}
              className="float-right"
              style={{
                marginBottom: 16,
              }}
              icon={<PlusOutlined />}
            >
              Add
            </Button>
          </Tooltip>
        </div>
        <Form
          form={form}
          component={false}
          onValuesChange={(changedValues, allValues) => {
            setIsChanged(true);
          }}
        >
          <Table
            className="mb-2"
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            size="small"
            bordered
            dataSource={dataSource}
            scroll={{ y: 300 }}
            pagination={{
              position: ["none", "none"],
              onChange: cancel,
            }}
            columns={mergedColumns}
            rowClassName="editable-row"
          />
        </Form>
        {getTotalCasesSum() != get(props, "record.quantity", 0) && (
          <i style={{ color: "#F00", fontSize: 12 }}>
            <InfoCircleOutlined className="pr-1" />
            Allocations across rotation numbers must equal to {get(props, "record.quantity", 0)}
          </i>
        )}
      </Spin>
      <Row gutter={[16, 16]} className="mt-3">
        <Col>
          <span>
            Allocations across Rot. Num:
            <b className="ml-1">
              <Tag color="#87d068">{getTotalCasesSum()}</Tag>
            </b>
          </span>
        </Col>
        <Col>
          <span>
            Quantity for the Order:
            <b className="ml-1">
              <Tag color="#108ee9">{get(props, "record.quantity") ? get(props, "record.quantity") : 0}</Tag>
            </b>
          </span>
        </Col>
      </Row>
    </Modal>
  );
};

export default EditRotationNumber;
