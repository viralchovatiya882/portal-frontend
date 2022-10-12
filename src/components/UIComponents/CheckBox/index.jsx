import { Checkbox } from "antd";
import { get } from "lodash";
import React from "react";

const CheckBox = (props) => {
    const onChange = (e) => {
        props.handleCheckBoxChange(get(props, "type", ""), e.target.checked);
    };

    return (
        <Checkbox
            className="mt-3"
            onChange={onChange}
            checked={get(props, "value", false)}
        >
            {get(props, "label", "")}
        </Checkbox>
    );
};

export default CheckBox;