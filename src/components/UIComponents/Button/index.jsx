import { Button } from "antd";
import { get } from "lodash";
import React from "react";
import { isMobileOrTab } from "../../../constants";
import { getScreenSize } from "../../../helpers/utility";

export const ButtonUI = (props) => {

    const handleButtonClick = () => {
        props.handleButtonClick();
    }

    return (
        <Button
            type={get(props, "type", "primary")}
            className={get(props, "className", "ml-3")}
            size={get(props, "size", "middle")}
            onClick={handleButtonClick}
        >
            {getScreenSize() > isMobileOrTab && get(props, "text", "")}
        </Button>
    );
};