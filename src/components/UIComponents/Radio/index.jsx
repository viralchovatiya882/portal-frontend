import { Form, Radio } from "antd";
import { get } from "lodash";
import React from "react";

const RadioButton = (props) => {

    const onChange = e => {
        props.handleChange({ type: get(props, "type", ""), value: e.target.value });
    };

    return (
        <Form layout="vertical">
            <Form.Item
                label={<span>{get(props, "label", "")}</span>}
                required={get(props, "required", false)}
                className={get(props, "className", "mt-0 mb-0")}
            >
                <Radio.Group
                    name={get(props, "name", "")}
                    defaultValue={get(props, "defaultValue", "")}
                    value={get(props, "value", "")}
                    disabled={get(props, "disabled", false)}
                    buttonStyle={get(props, "buttonStyle", "outline")}
                    onChange={onChange}
                >
                    {get(props, "options", []).map((option, index) => {
                        return (
                            <Radio
                                key={index}
                                value={get(option, "value", "")}
                            >
                                {get(option, "label", "")}
                            </Radio>
                        );
                    })}
                </Radio.Group>
            </Form.Item>
        </Form>
    );
};

export default RadioButton;