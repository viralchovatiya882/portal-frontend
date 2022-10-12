import { ArrowLeftOutlined, SwapOutlined } from "@ant-design/icons";
import ErrorBoundary from "@components/UIComponents/ErrorBoundary";
import Heading from "@components/UIComponents/Heading";
import { openNotificationWithIcon } from "@components/UIComponents/Toast/notification";
import { convertLead, getLeadDetails } from "@store/Leads/leads.actions";
import { Button, Collapse, Divider, Spin } from "antd";
import { get } from "lodash";
import React from "react";
import { connect, useSelector } from "react-redux";
import { isMobileOrTab } from "../../../../constants";
import { getScreenSize } from "../../../../helpers/utility";
import ConvertToCustomer from "../convertToCustomer";
import LeadDocuments from "./documents";
import "./index.scss";
import LeadDetailsUpdateUI from "./leadDetails";
import LeadSummary from "./leadSummary";
import LeadTrackingDetails from "./trackingDetails";

const { Panel } = Collapse;

/**
 * Renders Lead Details Component
 */
const LeadDetails = props => {
  const [expectedData, setExpectedData] = React.useState([]);
  const [expectedMetaInfoData, setExpectedMetaInfoData] = React.useState([]);
  const [convertLead, setConvertLead] = React.useState(false);

  const { match, history } = props;

  const loggedInUserPermission = useSelector(state => {
    return get(state, "auth.loggedInUserDetails.data.user_permissions", null);
  });

  const updateState = data => {
    setExpectedData(data);
  };

  const fetchLeadDetails = async () => {
    let leadDetailsResp = await props.getLeadDetails(get(match, "params.id"));

    if (get(leadDetailsResp, "error", false)) {
      openNotificationWithIcon("error", "Lead Details", `${get(leadDetailsResp, "error.message", "Something Went Wrong")} `);
    }

    if (get(leadDetailsResp, "response.status")) {
      updateState(get(leadDetailsResp, "response.data", []));
      setExpectedMetaInfoData(get(leadDetailsResp, "response.meta.column_info", []));
    } else {
      openNotificationWithIcon("error", "Lead Details", `${get(leadDetailsResp, "response.message", "Something Went Wrong")} `);
    }
  };

  React.useEffect(() => {
    fetchLeadDetails();
  }, []);

  const handleConvertLeadSubmit = async requestObj => {
    if (!isDisabled) {
      const requestPayload = { ...requestObj };
      let convertLeadResponse = await props.convertLead(requestPayload);

      if (get(convertLeadResponse, "response.status")) {
        openNotificationWithIcon("success", "Leads Details", `${get(convertLeadResponse, "response.message", "Something Went Wrong")} `);
        fetchLeadDetails();
        setConvertLead(false);
      }

      if (!get(convertLeadResponse, "response.status")) {
        openNotificationWithIcon("info", "Leads Details", `${get(convertLeadResponse, "response.message", "Something Went Wrong")} `);
      }

      if (get(convertLeadResponse, "error", false)) {
        openNotificationWithIcon("error", "Leads Details", `${get(convertLeadResponse, "error.message", "Something Went Wrong")} `);
      }
    }
  };

  const getReturnURL = () => {
    const prevPath = get(history, "location.state.prevPath", "");
    if (get(expectedData, "status", "new") === "completed" && !prevPath) {
      history.push("/completed-leads");
    } else {
      history.goBack();
    }
  };

  const isDisabled = get(expectedData, "status", "new") === "completed";

  const isConvertToCustomerEnabled = get(loggedInUserPermission, "lead_details_convert_to_customer", []).length > 0;
  const isUpdateLeadEnabled = get(loggedInUserPermission, "lead_details_update_lead", []).length > 0;
  const isUpdateLeadDetailsEnabled = get(loggedInUserPermission, "lead_details_update_lead_details", []).length > 0;

  return (
    <>
      <div className="d-flex justify-content-between">
        <Heading text={`Lead Details - # ${get(match, "params.id")}`} variant="h4" className="mt-2" />
        <Button className="float-right" type="primary" onClick={() => getReturnURL()} icon={<ArrowLeftOutlined />}>
          {getScreenSize() > isMobileOrTab && "Back"}
        </Button>
      </div>
      <ConvertToCustomer
        isModalVisible={convertLead}
        record={expectedData}
        isLoading={get(props, "loading", false)}
        handleSubmit={respObj => handleConvertLeadSubmit(respObj)}
        handleCancel={() => {
          setConvertLead(false);
        }}
      />
      <div className="lead_details_list">
        <ErrorBoundary>
          <Spin spinning={get(props, "loading", false)}>
            <Button className="float-right mr-2" type="primary" disabled={isDisabled || !isConvertToCustomerEnabled} icon={<SwapOutlined />} onClick={() => setConvertLead(true)}>
              {getScreenSize() > isMobileOrTab && "Convert to Customer"}
            </Button>
            <div className="pt-5">
              <Collapse defaultActiveKey={["1", "2", "3", "4"]} ghost expandIconPosition="right">
                <Panel
                  header={
                    <Divider orientation="left" plain>
                      <b>LEAD SUMMARY</b>
                    </Divider>
                  }
                  key="1"
                >
                  <LeadSummary {...expectedData} />
                </Panel>
                <Panel
                  header={
                    <Divider orientation="left" plain>
                      <b>TRACKING DETAILS</b>
                    </Divider>
                  }
                  key="2"
                >
                  <LeadTrackingDetails
                    {...expectedData}
                    disabled={isDisabled || !isUpdateLeadEnabled}
                    refetchDetails={() => fetchLeadDetails()}
                  />
                </Panel>
                <Panel
                  header={
                    <Divider orientation="left" plain>
                      <b>DOCUMENTS</b>
                    </Divider>
                  }
                  key="3"
                >
                  <LeadDocuments {...expectedData} disabled={isDisabled} />
                </Panel>
                <Panel
                  header={
                    <Divider orientation="left" plain>
                      <b>LEAD DETAILS</b>
                    </Divider>
                  }
                  key="4"
                >
                  <LeadDetailsUpdateUI
                    {...expectedData}
                    disabled={!isUpdateLeadDetailsEnabled || isDisabled}
                    refetchDetails={() => fetchLeadDetails()}
                  />
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
  { getLeadDetails, convertLead }
)(LeadDetails);
