import { EditOutlined, FileOutlined } from "@ant-design/icons";
import { Form, Input, Popconfirm, Select, Table, Tooltip } from "antd";
import DeleteIcon from "../../../../assets/images/delete.png";

import { get } from "lodash";
import React, { useContext, useEffect, useRef, useState } from "react";
const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell = ({ title, editable, children, dataIndex, record, dropDownOptions, handleSave, ...restProps }) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);

  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      // eslint-disable-next-line no-console
      console.log("Save failed:", errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        className="w-100"
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        {dataIndex === "document_category" ? (
          <Select
            style={{ width: "100%", margin: "10px 0" }}
            onChange={save}
            type="customer_document"
            label="Select Document Category"
            placeholder="Select Document Category"
            required
            onPressEnter={save}
            onBlur={save}
            ref={inputRef}
            maxLength={100}
            options={dropDownOptions ? dropDownOptions : []}
            className="mt-2 mb-0"
          />
        ) : (
          <Input ref={inputRef} onPressEnter={save} onBlur={save} className="w-100" />
        )}
      </Form.Item>
    ) : (
      <div className="editable-cell-value-wrap d-flex align-items-center" onClick={toggleEdit} style={{ cursor: "pointer" }}>
        <span style={{ display: "flex", alignItems: "center", overflow: "hidden" }}>
          <Tooltip placement="topLeft" title={children}>
            <span className="pdf_name_ellipsis"> {children} </span>
          </Tooltip>
          <EditOutlined className="pl-1"/>
        </span>
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

const EditableDocument = (props) => {
  const [dataSource, setDataSource] = useState([]);

  const handleDelete = (key) => {
    const newData = dataSource.filter((item) => item.key !== key);
    const elem = newData.map((list, index) => {
      return { ...list, key: index + 1 };
    });
    setDataSource(elem);
    props.handleDocuments(elem);
  };

  React.useEffect(() => {
    const elem = get(props, "dataSource", []).map((list, index) => {
      return { ...list, key: index + 1 };
    });

    setDataSource(elem);
  }, [props]);

  let defaultColumns = [
    {
      title: "Item",
      dataIndex: "key",
      width: get(props, "options", []).length > 0 ? 50 : 80,
    },
    {
      title: "Document Name",
      dataIndex: "document_name",
      editable: true,
      width: get(props, "options", []).length > 0 ? 140 : 250,
      className: "document_name_ellipsis",
      ellipsis: true,
    },
    {
      title: "",
      dataIndex: "operation",
      ellipsis: true,
      render: (_, record) =>
        dataSource.length >= 1 ? (
          <div className="task_operation" style={{ display: "flex", alignItems: "center" }}>
            <span style={{ display: "flex", alignItems: "center", overflow: "hidden" }}>
              <FileOutlined style={{ margin: "0px 8px 0px 8px" }} />
              <Tooltip placement="topLeft" title={get(record, "file_name")}>
                <span className="pdf_name_ellipsis">{get(record, "file_name")}</span>
              </Tooltip>
            </span>
            <Popconfirm title="Are you sure to delete?" onConfirm={() => handleDelete(record.key)}>
              <img src={DeleteIcon} alt="delete icon" style={{ marginLeft: "auto", cursor: "pointer" }} />
            </Popconfirm>
          </div>
        ) : null,
    },
  ];

  if (get(props, "options", []).length > 0) {
    defaultColumns.splice(2, 0, {
      title: "Document Category",
      dataIndex: "document_category",
      editable: true,
      width: 140,
      className: "document_name_ellipsis",
      ellipsis: true,
    });
  }

  const handleSave = (row) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    setDataSource(newData);
    props.handleDocuments(newData);
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dropDownOptions: get(props, "options", []),
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });
  return (
    <div className="task__uploaded_list">
      <Table
        tableLayout={get(props, "tableLayout", "fixed")}
        components={components}
        pagination={false}
        size="middle"
        className="mt-2"
        rowClassName={() => "editable-row"}
        dataSource={dataSource}
        columns={columns}
      />
    </div>
  );
};

export default EditableDocument;
