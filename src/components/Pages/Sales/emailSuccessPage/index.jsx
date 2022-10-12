import { PlusSquareOutlined } from "@ant-design/icons";
import { Button, Result } from "antd";
import { get } from "lodash";
import React from "react";
import { Link } from "react-router-dom";
import "./index.scss";

/**
 * Renders Email Success Page
 */
const EmailSuccessPage = props => {
  return (
    <>
      <Result
        status="success"
        title="E-mail Sent Successfully"
        subTitle={`Please check your E-mail ${get(props, "details.email", "")}`}
        extra={[
          <Link to="/track-order">
            <Button type="secondary" key="console">
              Track Order
            </Button>
          </Link>,
          <Link to="/create-new-order">
            <Button type="primary" icon={<PlusSquareOutlined />}>
              Create New Order
            </Button>
          </Link>,
        ]}
      />
    </>
  );
};
export default EmailSuccessPage;
