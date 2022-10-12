import { PlusOutlined } from "@ant-design/icons";
import { Divider, Form, Input, Select, Spin } from "antd";
import { get } from "lodash";
import React from "react";
const { Option } = Select;

export const SingleSelect = props => {
  const [items, setItems] = React.useState([]);
  const [name, setName] = React.useState("");

  React.useEffect(() => {
    setItems(get(props, "options", []));
  }, [props]);

  const handleChange = value => {
    props.handleChange(get(props, "type", ""), value ? value : "");
  };

  const onNameChange = event => {
    setName(event.target.value);
  };

  const addItem = () => {
    props.handleChange(get(props, "type", ""), name ? name : "");
    setName("");
  };

  return (
    <Form layout="vertical">
      <Form.Item
        label={<span>{get(props, "label", "")} </span>}
        validateStatus={get(props, "validateStatus", "")}
        help={get(props, "helpText", "")}
        required={get(props, "required", false)}
        className={get(props, "className", "")}
      >
        <Select
          showSearch
          allowClear
          key={get(props, "label", Math.random())}
          className="default-float-width"
          placeholder={get(props, "placeholder", "")}
          value={get(props, "value", "") || undefined}
          optionFilterProp="children"
          loading={get(props, "loading", false)}
          onChange={handleChange}
          notFoundContent={
            get(props, "loading", false) ? (
              <center>
                <Spin size="small" />
              </center>
            ) : null
          }
          onDropdownVisibleChange={props.onDropdownVisibleChange}
          dropdownRender={menu => (
            <div>
              {menu}
              {get(props, "enableAddNew", false) && (
                <>
                  <Divider style={{ margin: "4px 0" }} />
                  <div style={{ display: "flex", flexWrap: "nowrap", padding: 8 }}>
                    <Input style={{ flex: "auto" }} value={name} onChange={onNameChange} />
                    <a style={{ flex: "none", padding: "8px", display: "block", cursor: "pointer" }} onClick={addItem}>
                      <PlusOutlined /> Add item
                    </a>
                  </div>
                </>
              )}
            </div>
          )}
          filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          filterSort={(optionA, optionB) => optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())}
        >
          {get(props, "options", []).map((list, index) => {
            return (
              <Option key={index} value={get(list, "value", "")}>
                {get(list, "label", "")}
              </Option>
            );
          })}
        </Select>
      </Form.Item>
    </Form>
  );
};
