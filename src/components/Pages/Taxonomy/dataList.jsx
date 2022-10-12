import { Button } from "antd";
import { get } from "lodash";
import React from "react";

const DataList = (props) => {
    const name = get(props, "name", "");
    return (
        <Button
            key={Math.random()}
            className="mr-3 mb-3"
            size="middle"
            onClick={() => props.handleClick(get(props, "valueIndex"))}
            type={get(props, "type", "default")}
        >
            {name}
        </Button>
    );
};

export default DataList;