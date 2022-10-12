import { Form, Input, InputNumber } from "antd";
import { get, has } from "lodash";
import React from "react";
const { TextArea } = Input;

/**
 * Renders input and input text area component using antd
 * @param
 */

export const CustomInputText = props => {
  const onInputTextChange = e => {
    props.handleChange(get(props, "type", ""), e.target.value);
  };
  const handleOnBlur = e => {
    if ("handleBlur" in props) {
      props.handleBlur(get(props, "type", ""), e.target.value);
    }
  };

  return (
    <Form layout="vertical">
      <Form.Item
        label={<span>{get(props, "label", "")}</span>}
        validateStatus={get(props, "validateStatus", "")}
        help={get(props, "helpText", "")}
        required={get(props, "required", false)}
        className={get(props, "className", "")}
      >
        <Input
          placeholder={`Enter ${get(props, "label", "")}`}
          disabled={get(props, "disabled", false)}
          prefix={get(props, "prefix", "")}
          allowClear
          maxLength={get(props, "maxLength", 100000)}
          value={get(props, "value", "")}
          onChange={onInputTextChange}
          onBlur={handleOnBlur}
        />
      </Form.Item>
    </Form>
  );
};

export const CustomInputTextArea = props => {
  const onInputTextAreaChange = e => {
    props.handleChange(get(props, "type", ""), e.target.value);
  };

  return (
    <Form layout="vertical">
      <Form.Item
        label={
          <span>
            {get(props, "label", "")}
            {get(props, "note") && (
              <>
                :
                <span className="pl-2" style={{ fontSize: 11, color: "#6c757d", textTransform: "none" }}>
                  {get(props, "note", "")}
                </span>
              </>
            )}
          </span>
        }
        validateStatus={get(props, "validateStatus", "")}
        help={get(props, "helpText", "")}
        required={get(props, "required", false)}
        className={get(props, "className", "")}
      >
        <TextArea
          placeholder={get(props, "placeholder", "") ? get(props, "placeholder", "") : `Enter ${get(props, "label", "")}`}
          allowClear
          style={get(props, "style", {})}
          autoSize={get(props, "autoSize", false)}
          disabled={get(props, "disabled", false)}
          maxLength={get(props, "maxLength", 100000)}
          value={get(props, "value", "")}
          onChange={onInputTextAreaChange}
        />
      </Form.Item>
    </Form>
  );
};

export const CustomInputNumber = props => {
  const onInputNumberChange = value => {
    props.handleChange(get(props, "type", ""), value);
  };

  const handleEnterKey = e => {
    if (has(props, "handleEnterKey")) {
      props.handleEnterKey(get(props, "type", ""), e.target.value);
    }
  };

  const onBlur = e => {
    if (has(props, "onBlur")) {
      props.onBlur(get(props, "type", ""), e.target.value);
    }
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
        <InputNumber
          placeholder={`Enter ${get(props, "label", "")}`}
          disabled={get(props, "disabled", false)}
          prefix={get(props, "prefix", "")}
          allowClear
          addonBefore={get(props, "addonBefore", "")}
          addonAfter={get(props, "addonAfter", "")}
          min={get(props, "min", 0)}
          max={get(props, "max", 1000000000)}
          onBlur={onBlur}
          onPressEnter={handleEnterKey}
          value={get(props, "value", "")}
          onChange={onInputNumberChange}
          className={get(props, "className", "")}
        />
      </Form.Item>
    </Form>
  );
};
