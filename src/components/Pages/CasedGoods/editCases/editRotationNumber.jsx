import { CloseOutlined, DeleteOutlined, EditOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons";
import { Button, Form, Input, InputNumber, message, Popconfirm, Select, Spin, Table, Tooltip, Typography } from "antd";
import axios from "axios";
import { cloneDeep, get, round } from "lodash";
import React, { useState } from "react";
import { getRequestHeader } from "../../../../helpers/service";
import { openNotificationWithIcon } from "../../../UIComponents/Toast/notification";

const EditableCell = ({ editing, dataIndex, title, inputType, record, index, children, ...restProps }) => {
  let inputNode = <InputNumber className="w-100" placeholder={title} min={0} />;
  if (inputType === "text") {
    inputNode = <Input className="w-100" placeholder={title} />;
  }

  if (inputType === "dropdown") {
    inputNode = <Select placeholder={title} defaultActiveFirstOption={false} allowClear options={get(restProps, "partCaseOptions", [])} className="w-100 part-case-field" />;
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
  const [loading, setLoading] = useState(true);

  const isEditing = (record) => record.key === editingKey;

  const handleDelete = (key) => {
    setIsChanged(true);
    const newData = dataSource.filter((item) => item.key !== key);
    const rotation_numbers = getComputedPayload(newData);
    // handleOk(rotation_numbers, true);
    props.updateRotationNumber(rotation_numbers);
    setDataSource(newData);
  };

  const handleAdd = () => {
    const newData = {
      key: count,
      whole_case: "",
      bottles_in_partial_case: undefined,
      rotation_number: "",
    };
    props.updateSaveDisabled(true);
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
    props.updateSaveDisabled(true);
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey("");
    props.updateSaveDisabled(false);
  };

  const getComputedPayload = (newData) => {
    let rotation_numbers = cloneDeep(newData).map((list) => {
      return {
        whole_case: get(list, "whole_case", 0),
        bottles_in_partial_case: getBIPCValue(get(list, "bottles_in_partial_case", "0/0")),
        rotation_number: get(list, "rotation_number", 0),
      };
    });

    return rotation_numbers;
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

        let rotation_numbers = getComputedPayload(newData);

        // rotation_numbers = rotation_numbers.filter((o) => {
        //   return get(o, "whole_case", 0) + get(o, " bottles_in_partial_case", 0) > 0;
        // });

        // handleOk(rotation_numbers);
        props.updateRotationNumber(rotation_numbers);
      } else {
        message.warning("Quantity cannot be 0");
      }
    } catch (errInfo) {
      // eslint-disable-next-line no-console
      console.log("Validate Failed:", errInfo);
    }
  };

  const handleOk = async (rotation_numbers, isUpdated) => {
    if (isChanged || isUpdated) {
      const rest = await axios({
        method: "POST",
        data: {
          cased_goods_id: get(props, "record.id"),
          rotation_numbers,
        },
        url: `${process.env.REACT_APP_API_ENDPOINT}/api/inventory/edit_rotation_numbers`,
        headers: { ...getRequestHeader() },
      }).catch((err) => {
        openNotificationWithIcon("error", "Rotation Number", `${get(err, "response.data.message", "Something Went Wrong")} `);
      });

      if (get(rest, "data.status")) {
        props.updateRotationNumber(rotation_numbers);
        openNotificationWithIcon("success", "Rotation Number", get(rest, "data.message", "Rotation Number updated successfully"));
      } else {
        openNotificationWithIcon("error", "Rotation Number", get(rest, "data.message", "Something Went Wrong"));
      }
    } else {
      openNotificationWithIcon("info", "Rotation Number", "Nothing to update");
    }
  };

  const columns = [
    {
      title: "Rotation Number",
      dataIndex: "rotation_number",
      width: "35%",
      editable: true,
    },
    {
      title: "Whole Case",
      dataIndex: "whole_case",
      width: "25%",
      editable: true,
    },
    {
      title: "Part Case",
      dataIndex: "bottles_in_partial_case",
      width: "25%",
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
    if (type === "rotation_number") {
      return "text";
    }
    if (type === "bottles_in_partial_case") {
      return "dropdown";
    }
    return "number";
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
        partCaseOptions: get(props, "partCaseOptions", []),
        editing: isEditing(record),
      }),
    };
  });

  const getBIPCValue = (bottles_in_partial_case) => {
    let partCase = bottles_in_partial_case ? bottles_in_partial_case.split("/") : "";
    partCase = partCase ? partCase[0] : 0;
    return round(Number(partCase), 2);
  };

  const getAvailableRNList = async () => {
    const rest = await axios({
      method: "POST",
      data: {
        cased_goods_id: get(props, "record.id"),
        exclude_empty: false,
      },
      url: `${process.env.REACT_APP_API_ENDPOINT}/api/inventory/rotation_number_list`,
      headers: { ...getRequestHeader() },
    }).catch((err) => {
      setLoading(false);
      openNotificationWithIcon("error", "Rotation Number", `${get(err, "response.data.message", "Something Went Wrong")} `);
    });
    if (get(rest, "data.status")) {
      let newData = get(rest, "data.rotation_numbers", []).map((list, index) => {
        return {
          key: index,
          whole_case: get(list, "whole_case", 0),
          bottles_in_partial_case: `${get(list, "bottles_in_partial_case", 0)}/${get(props, "record.bpc", 0)}`,
          rotation_number: get(list, "rotation_number", ""),
        };
      });
      setCount(newData.length + 1);
      setDataSource(newData);
      setLoading(false);
    } else {
      setLoading(false);
      openNotificationWithIcon("error", "Rotation Number", get(rest, "data.message", "Something Went Wrong"));
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
    let partCase = bottles_in_partial_case ? bottles_in_partial_case.split("/") : "";
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
    const total = getWholeTotalCasesSum() + getPartTotalCasesSum();
    props.quantityState(total > get(props, "record.cases", 0));
    return total;
  };

  React.useEffect(() => {
    getAvailableRNList();
  }, []);

  React.useEffect(() => {
    getTotalCasesSum();
  }, [dataSource]);

  return (
    <Spin spinning={loading}>
      <div className="edit__rotation_number__label">
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
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          size="small"
          bordered
          dataSource={dataSource}
          scroll={{ y: 200 }}
          pagination={{
            position: ["none", "none"],
            onChange: cancel,
          }}
          columns={mergedColumns}
          rowClassName="editable-row"
        />
      </Form>
    </Spin>
  );
};

export default EditRotationNumber;
