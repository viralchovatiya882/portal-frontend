import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Result } from "antd";
import React from "react";
import { withRouter } from "react-router";

const CustomNotFound = (props) => {
    const { history } = props;
    return (
        <Result
            status="404"
            title="404"
            subTitle="Sorry, the page you visited does not exist."
            extra={
                <Button type="primary" onClick={() => history.goBack()}>
                   <ArrowLeftOutlined /> Go Back
                </Button>
            }
        />
    );
};

export default withRouter(CustomNotFound);