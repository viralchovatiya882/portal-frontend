import { ArrowLeftOutlined } from "@ant-design/icons";
import ErrorBoundary from "@components/UIComponents/ErrorBoundary";
import Heading from "@components/UIComponents/Heading";
import { openNotificationWithIcon } from "@components/UIComponents/Toast/notification";
import { getSalesOrderDetails } from "@store/SalesOrder/sale.actions";
import { Button, Collapse, Divider, Spin } from "antd";
import { get } from "lodash";
import React from "react";
import { connect } from "react-redux";
import { isMobileOrTab } from "../../../../constants";
import { getScreenSize } from "../../../../helpers/utility";
import OrderDocuments from "./documents";
import "./index.scss";
import OrderListDetails from "./orderDetails";
import OrderSummary from "./orderSummary";
import OrderTrackingDetails from "./trackingDetails";

const { Panel } = Collapse;

const text = "Content Coming Soon";

/**
 * Renders Order Details Component
 */
const OrderDetails = (props) => {
  const [expectedData, setExpectedData] = React.useState([]);
  const [expectedMetaInfoData, setExpectedMetaInfoData] = React.useState([]);
  const { match, history } = props;
  const updateState = (data) => {
    setExpectedData(data);
  };

  const fetchSalesOrderDetails = async () => {
    let salesOrderDetailsResp = await props.getSalesOrderDetails(get(match, "params.id"));

    if (get(salesOrderDetailsResp, "error", false)) {
      openNotificationWithIcon("error", "Sales Order Details", `${get(salesOrderDetailsResp, "error.message", "Something Went Wrong")} `);
    }

    if (get(salesOrderDetailsResp, "response.status")) {
      updateState(get(salesOrderDetailsResp, "response.data", []));
      setExpectedMetaInfoData(get(salesOrderDetailsResp, "response.meta", []));
    } else {
      openNotificationWithIcon("error", "Sales Order Details", `${get(salesOrderDetailsResp, "response.message", "Something Went Wrong")} `);
    }
  };

  const refetchSalesOrderData = () => {
    fetchSalesOrderDetails();
  };

  React.useEffect(() => {
    fetchSalesOrderDetails();
  }, []);

  return (
    <>
      <div className="d-flex justify-content-between">
        <Heading text={`Order Details - # ${get(match, "params.id")}`} variant="h4" className="mt-2" />
        <Button className="float-right" type="primary" onClick={() => history.goBack()} icon={<ArrowLeftOutlined />}>
          {getScreenSize() > isMobileOrTab && "Back"}
        </Button>
      </div>
      <div className="order_details_list">
        <ErrorBoundary>
          <Spin spinning={get(props, "loading", false)}>
            <Collapse defaultActiveKey={["1", "2", "3", "4"]} ghost expandIconPosition="right">
              <Panel
                header={
                  <Divider orientation="left" plain>
                    <b>ORDER SUMMARY</b>
                  </Divider>
                }
                key="1"
              >
                <OrderSummary {...expectedData} metaColumnInfo={expectedMetaInfoData} refetchSalesOrderData={refetchSalesOrderData} />
              </Panel>
              <Panel
                header={
                  <Divider orientation="left" plain>
                    <b>TRACKING DETAILS</b>
                  </Divider>
                }
                key="2"
              >
                <OrderTrackingDetails metaColumnInfo={expectedMetaInfoData} history={history} {...expectedData} refetchSalesOrderData={refetchSalesOrderData} />
              </Panel>
              <Panel
                header={
                  <Divider orientation="left" plain>
                    <b>DOCUMENTS</b>
                  </Divider>
                }
                key="3"
              >
                <OrderDocuments {...expectedData} metaColumnInfo={expectedMetaInfoData} history={history} refetchSalesOrderData={refetchSalesOrderData} />
              </Panel>
              <Panel
                header={
                  <Divider orientation="left" plain>
                    <b>ORDER DETAILS</b>
                  </Divider>
                }
                key="4"
              >
                <OrderListDetails history={history} {...expectedData} refetchSalesOrderData={refetchSalesOrderData} metaColumnInfo={expectedMetaInfoData} />
              </Panel>
            </Collapse>
          </Spin>
        </ErrorBoundary>
      </div>
    </>
  );
};

export default connect(
  (state) => ({
    loading: state.salesOrder.isOrderDetailsLoading,
    error: state.salesOrder.failure,
  }),
  { getSalesOrderDetails }
)(OrderDetails);
