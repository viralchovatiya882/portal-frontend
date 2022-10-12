import { Form, Select, Spin } from "antd";
import { get } from "lodash";
import React from "react";
const { Option } = Select;

export const MultiSelect = (props) => {
  const handleChange = (value) => {
    props.handleChange(get(props, "type", ""), value ? value : "");
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
          mode="multiple"
          key={get(props, "label", Math.random())}
          className="default-float-width"
          placeholder={`Search to Select ${get(props, "label", "")}`}
          value={get(props, "value", "") || undefined}
          optionFilterProp="children"
          loading={get(props, "loading", false)}
          onChange={handleChange}
          notFoundContent={
            get(props, "loading", false) ? (
              <center>
                {" "}
                <Spin size="small" />{" "}
              </center>
            ) : null
          }
          onDropdownVisibleChange={props.onDropdownVisibleChange}
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          filterSort={(optionA, optionB) =>
            optionA.children
              .toLowerCase()
              .localeCompare(optionB.children.toLowerCase())
          }
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
