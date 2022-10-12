import { CaretRightOutlined } from "@ant-design/icons";
import { Collapse } from "antd";
import { get } from "lodash";
import React from "react";
const { Panel } = Collapse;

const CustomCollapse = (props) => {
    return (
        <Collapse
            bordered={false}
            defaultActiveKey={["1"]}
            expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
            className="site-collapse-custom-collapse"
        >
            {get(props, "data", []).map((list, index) => {
                return (
                    <Panel header={get(list, "title", "")} key={Math.random()} className="site-collapse-custom-panel">
                        <p>{get(list, "text", "")}</p>
                    </Panel>
                );
            })}
        </Collapse>

    );
}

export default CustomCollapse;