import { Tabs } from "antd";
import { get } from "lodash";
import React from "react";

const { TabPane } = Tabs;

const Tabs = (props) => {

    const callback = (key) => {
        console.log(key);
    };

    const name = get(props, "name", "");
    const defaultIndex = get(props, "defaultIndex", "1");
    return (
        <Tabs defaultActiveKey="1" onChange={callback}>
            <TabPane tab={name} key={defaultIndex}>
                {this.props.children}
            </TabPane>
        </Tabs>
    );
};

export default Tabs;