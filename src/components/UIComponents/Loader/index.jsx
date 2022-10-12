import React from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const antIcon = <LoadingOutlined style={{ fontSize: 80, color: "#43425d" }} spin />;

const Loader = () => {
    return (
        <div
            style={{
                position: "absolute",
                top: "40%",
                left: "45%"
            }}
        >
            <Spin indicator={antIcon} />
        </div>

    );
};

export default Loader;