import { AutoComplete, Form, Spin } from "antd";
import { get } from "lodash";
import React from "react";


export const CustomAutoComplete = (props) => {
    
    const handleChange = (value) => {
        props.handleChange(get(props, "type", ""), value ? value : "");
    };

    return (
        <Form layout="vertical">
            <Form.Item
                label={<span>{get(props, "label", "")} :</span>}
                validateStatus={get(props, "validateStatus", "")}
                help={get(props, "helpText", "")}
                required={get(props, "required", false)}
                className={get(props, "className", "")}
            >
                <AutoComplete
                    options={get(props, "options", [])}
                    style={{ marginBottom: 8, display: "block" }}
                    allowClear
                    backfill
                    className="default-float-width"
                    value={get(props, "value")}
                    placeholder={`Type to select ${get(props, "placeholder", "")}`}
                    notFoundContent={get(props, "loading", false) ? <Spin size="small" /> : null}
                    onChange={handleChange}
                    onDropdownVisibleChange={props.onDropdownVisibleChange}
                    filterOption={(inputValue, option) => {
                        if (isNumber(inputValue)) {
                            return option.value === inputValue;
                        }
                        return option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1;
                    }}
                />
            </Form.Item>
        </Form>
    );
};