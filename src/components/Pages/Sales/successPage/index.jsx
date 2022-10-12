import { PlusSquareOutlined } from "@ant-design/icons";
import { Button, Result } from "antd";
import { get } from "lodash";
import React from "react";
import { Link } from "react-router-dom";
import "./index.scss";

const SuccessPage = props => {
  const isReservationOrConsignment = () => {
    return get(props, "salesOrderType") === "reservation" || get(props, "salesOrderType") === "consignment";
  };


  const getTitleText = () => {
    if (isReservationOrConsignment()) {
      return {
        title: "Order Created Successfully",
        subTitle: `Order number: ${get(props, "finalResp.sales_order_id", "")} `
      };
    }
    return {
      title: "Order Created Successfully",
      subTitle: (
        <>
          {`Order number: ${get(props, "finalResp.sales_order_id", "")} `} <br />
          E-mail sent successfully to <b> {get(props, "finalResp.data.customer_email_for_sending", "")} </b>
        </>
      )
    };
  };

  return (
    <div style={{ minHeight: 400 }} className="bg-white p-4">
      <div className="float-right">
        <Button type="primary" onClick={() => props.setSubmitSuccess(false)} icon={<PlusSquareOutlined />}>
          Create New Order
        </Button>
      </div>
      <Result
        status="success"
        title={getTitleText().title}
        subTitle={getTitleText().subTitle}
        extra={[
          <Link to="/track-order">
            <Button type="secondary" key="console">
              Track Order
            </Button>
          </Link>
          // get(props, "salesOrderType") === "sales_order" && (
          //   <Button
          //     type="primary"
          //     onClick={() => {
          //       props.viewDocuments();
          //     }}
          //   >
          //     View AOS/SOP Docs
          //   </Button>
          // )
        ]}
      />
    </div>
  );
};
export default SuccessPage;
