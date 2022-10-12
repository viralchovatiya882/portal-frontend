import { ArrowLeftOutlined } from "@ant-design/icons";
import ErrorBoundary from "@components/UIComponents/ErrorBoundary";
import Heading from "@components/UIComponents/Heading";
import { openNotificationWithIcon } from "@components/UIComponents/Toast/notification";
import { getCustomerDetails } from "@store/Leads/leads.actions";
import { Button, Collapse, Divider, Spin } from "antd";
import { get } from "lodash";
import React from "react";
import { connect } from "react-redux";
import { isMobileOrTab } from "../../../../../constants";
import { getScreenSize } from "../../../../../helpers/utility";
import CustomerActiveOrderListing from "./activeOrders";
import CustomerDocuments from "./documents";
import "./index.scss";
import CustomerPastOrderListing from "./pastOrders";
import CustomerSummary from "./summary";
import CustomerTrackingDetails from "./trackingDetails";

const { Panel } = Collapse;

/**
 * Renders Customer Details Component
 */
const CustomerDetails = props => {
  const [expectedData, setExpectedData] = React.useState([]);
  const [expectedMetaInfoData, setExpectedMetaInfoData] = React.useState([]);

  const { match, history } = props;

  const updateState = data => {
    setExpectedData(data);
  };

  const fetchCustomerDetails = async () => {
    let customerDetailsResp = await props.getCustomerDetails(get(match, "params.id"));

    if (get(customerDetailsResp, "error", false)) {
      openNotificationWithIcon("error", "Customer Details", `${get(customerDetailsResp, "error.message", "Something Went Wrong")} `);
    }

    if (get(customerDetailsResp, "response.status")) {
      updateState(get(customerDetailsResp, "response.data", []));
      setExpectedMetaInfoData(get(customerDetailsResp, "response.meta.column_info", []));
    } else {
      openNotificationWithIcon("error", "Customer Details", `${get(customerDetailsResp, "response.message", "Something Went Wrong")} `);
    }
  };

  React.useEffect(() => {
    fetchCustomerDetails();
  }, []);

  return (
    <>
      <div className="d-flex justify-content-between">
        <Heading text={`Customer Details - # ${get(match, "params.id")}`} variant="h4" className="mt-2" />
        <Button className="float-right" type="primary" onClick={() => history.goBack()} icon={<ArrowLeftOutlined />}>
          {getScreenSize() > isMobileOrTab && "Back"}
        </Button>
      </div>
      <div className="customer_details_list">
        <ErrorBoundary>
          <Spin spinning={get(props, "loading", false)}>
            <div className="pt-0">
              <Collapse defaultActiveKey={["1", "2", "3", "4", "5"]} ghost expandIconPosition="right">
                <Panel
                  header={
                    <Divider orientation="left" plain>
                      <b>CUSTOMER SUMMARY</b>
                    </Divider>
                  }
                  key="1"
                >
                  <CustomerSummary {...expectedData} />
                </Panel>
                <Panel
                  header={
                    <Divider orientation="left" plain>
                      <b>TRACKING DETAILS</b>
                    </Divider>
                  }
                  key="2"
                >
                  <CustomerTrackingDetails {...expectedData} refetchDetails={() => fetchCustomerDetails()} />
                </Panel>
                <Panel
                  header={
                    <Divider orientation="left" plain>
                      <b>DOCUMENTS</b>
                    </Divider>
                  }
                  key="3"
                >
                  <CustomerDocuments {...expectedData} />
                </Panel>
                <Panel
                  header={
                    <Divider orientation="left" plain>
                      <b>ACTIVE ORDERS</b>
                    </Divider>
                  }
                  key="4"
                >
                  <CustomerActiveOrderListing id={get(match, "params.id")} />
                </Panel>
                <Panel
                  header={
                    <Divider orientation="left" plain>
                      <b>PAST ORDERS</b>
                    </Divider>
                  }
                  key="5"
                >
                  <CustomerPastOrderListing id={get(match, "params.id")} />
                </Panel>
              </Collapse>
            </div>
          </Spin>
        </ErrorBoundary>
      </div>
    </>
  );
};

export default connect(
  state => ({
    loading: get(state, "leads.loading", false),
    error: get(state, "leads.error", false),
  }),
  { getCustomerDetails }
)(CustomerDetails);
