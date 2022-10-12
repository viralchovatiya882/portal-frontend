import { InfoCircleOutlined } from "@ant-design/icons";
import { getRequestHeader } from "@helpers/service";
import { Modal } from "antd";
import axios from "axios";
import { get } from "lodash";
import React from "react";
import { connect } from "react-redux";
import { staticTextInventory, TableColumnsList } from "../../../constants";
import { defaultRequestOptions } from "../../../settings";
import { addLead as addNewLead, convertLead, getActiveLeads } from "../../../store/Leads/leads.actions";
import ErrorBoundary from "../../UIComponents/ErrorBoundary";
import Heading from "../../UIComponents/Heading";
import { SearchInput } from "../../UIComponents/Search";
import CustomTable from "../../UIComponents/Table/responsiveTable";
import { openNotificationWithIcon } from "../../UIComponents/Toast/notification";
import AddORUpdateUser from "./addLead";
import ConvertToCustomer from "./convertToCustomer";
import { getDataWrapper } from "./getData";
import "./index.scss";

/**
 * Renders Leads component
 */
const LeadsManagement = props => {
  const [expectedData, setExpectedData] = React.useState([]);
  const [expectedMetaData, setExpectedMetaData] = React.useState([]);
  const [currentRecord, setCurrentRecord] = React.useState(null);
  const [expectedClonedData, setExpectedClonedData] = React.useState([]);
  const [clearSearchString, setClearSearchString] = React.useState(false);
  const [addLead, setAddLead] = React.useState(false);
  const [convertLead, setConvertLead] = React.useState(false);

  const updateActiveLeadsList = data => {
    setExpectedData(getDataWrapper(data));
    if (expectedClonedData.length === 0) {
      setExpectedClonedData(getDataWrapper(data));
    }
  };

  const MessageInfo = (content = "", id = "") => {
    Modal.info({
      title: `Message - Lead #${id}`,
      centered: true,
      width: 600,
      content: (
        <div className="lead__message_info">
          <p>{content}</p>
        </div>
      ),
      onOk() {}
    });
  };

  const fetchActiveLeadsList = async requestOptions => {
    let activeLeadsList = await props.getActiveLeads(requestOptions);

    if (get(activeLeadsList, "response.status")) {
      updateActiveLeadsList(get(activeLeadsList, "response.data"));
      setExpectedMetaData(get(activeLeadsList, "response.meta"));
    }

    if (!get(activeLeadsList, "response.status")) {
      openNotificationWithIcon("info", "Active Leads", `${get(activeLeadsList, "response.message", "Something Went Wrong")} `);
    }

    if (get(activeLeadsList, "error", false)) {
      openNotificationWithIcon("error", "Active Leads", `${get(activeLeadsList, "error.message", "Something Went Wrong")} `);
    }
  };

  const addNewLeadToList = async (requestOptions, isChanged) => {
    if (isChanged) {
      let addLeadResponse = await props.addNewLead(requestOptions);

      if (get(addLeadResponse, "response.status")) {
        openNotificationWithIcon("success", "Active Leads", `${get(addLeadResponse, "response.message", "Something Went Wrong")} `);
        fetchActiveLeadsList(defaultRequestOptions);
        handleClose();
      }

      if (!get(addLeadResponse, "response.status")) {
        openNotificationWithIcon("info", "Active Leads", `${get(addLeadResponse, "response.message", "Something Went Wrong")} `);
      }

      if (get(addLeadResponse, "error", false)) {
        openNotificationWithIcon("error", "Active Leads", `${get(addLeadResponse, "error.message", "Something Went Wrong")} `);
      }
    } else {
      openNotificationWithIcon("info", "Add Lead", "Nothing to Update");
    }
  };

  const handleEditAction = (record, type, custom) => {
    if (get(custom, "status") === "status") {
      updateLeadStatus(type, get(record, "id"));
    }

    if (get(custom, "status") === "follow_up_date") {
      updateLeadFollowUpDate(type, get(record, "id"));
    }

    if (get(custom, "status") === "message") {
      MessageInfo(get(record, "message"), get(record, "id"));
    }

    if (get(custom, "status") === "convert_to_customer") {
      setConvertLead(true);
      setCurrentRecord(record);
    }
  };

  const updateLeadStatus = async (status, lead_id) => {
    const requestPayload = {
      status,
      lead_id
    };

    const updateLeadStatus = await axios({
      method: "POST",
      data: { ...requestPayload },
      url: `${process.env.REACT_APP_API_ENDPOINT}/api/leads/update_status`,
      headers: { ...getRequestHeader() }
    }).catch(err => {
      openNotificationWithIcon("error", "Active Leads", `${get(err, "response.data.message", "Something Went Wrong")} `);
    });

    if (get(updateLeadStatus, "error", false)) {
      openNotificationWithIcon("error", "Active Leads", `${get(updateLeadStatus, "data.message", "Something Went Wrong")} `);
    }

    if (get(updateLeadStatus, "data.status")) {
      fetchActiveLeadsList(defaultRequestOptions);
      openNotificationWithIcon("success", "Active Leads", get(updateLeadStatus, "data.message", "Lead Details updated successfully"));
    } else {
      openNotificationWithIcon("error", "Active Leads", get(updateLeadStatus, "data.message", "Something Went Wrong"));
    }
  };

  const updateLeadFollowUpDate = async (follow_up_date, lead_id) => {
    const requestPayload = {
      follow_up_date,
      lead_id
    };

    const updateLeadFollowUpDate = await axios({
      method: "POST",
      data: { ...requestPayload },
      url: `${process.env.REACT_APP_API_ENDPOINT}/api/leads/update_follow_up_date`,
      headers: { ...getRequestHeader() }
    }).catch(err => {
      openNotificationWithIcon("error", "Active Leads", `${get(err, "response.data.message", "Something Went Wrong")} `);
    });

    if (get(updateLeadFollowUpDate, "error", false)) {
      openNotificationWithIcon("error", "Active Leads", `${get(updateLeadFollowUpDate, "data.message", "Something Went Wrong")} `);
    }

    if (get(updateLeadFollowUpDate, "data.status")) {
      fetchActiveLeadsList(defaultRequestOptions);
      openNotificationWithIcon("success", "Active Leads", get(updateLeadFollowUpDate, "data.message", "Shipping Details updated successfully"));
    } else {
      openNotificationWithIcon("error", "Active Leads", get(updateLeadFollowUpDate, "data.message", "Shipping Details updated successfully"));
    }
  };

  const init = () => {
    // if (get(props, "active_data.data", []).length === 0) {
    //   fetchActiveLeadsList(defaultRequestOptions);
    // } else {
    //   setExpectedMetaData(get(props, "active_data.meta", []));
    //   updateActiveLeadsList(get(props, "active_data.data", []));
    // }
    fetchActiveLeadsList(defaultRequestOptions);
    if (props.error) {
      openNotificationWithIcon("error", "Active Leads", get(props, "error", "Something went wrong"));
    }
  };

  const isCleared = () => {
    setExpectedData(expectedClonedData);
    setClearSearchString(true);
  };

  const handleSearch = searchedData => {
    if (get(searchedData, "isClient", true)) {
      setExpectedData(get(searchedData, "filteredData", []));
    }
  };

  const handleAdd = () => {
    setAddLead(true);
  };

  const handleClose = () => {
    setAddLead(false);
  };

  const handleSubmit = async requestObj => {
    const requestPayload = { ...requestObj };
    let convertLeadResponse = await props.convertLead(requestPayload);

    if (get(convertLeadResponse, "response.status")) {
      openNotificationWithIcon("success", "Active Leads", `${get(convertLeadResponse, "response.message", "Something Went Wrong")} `);
      setConvertLead(false);
      setCurrentRecord(null);
      fetchActiveLeadsList(defaultRequestOptions);
    }

    if (!get(convertLeadResponse, "response.status")) {
      openNotificationWithIcon("info", "Active Leads", `${get(convertLeadResponse, "response.message", "Something Went Wrong")} `);
    }

    if (get(convertLeadResponse, "error", false)) {
      openNotificationWithIcon("error", "Active Leads", `${get(convertLeadResponse, "error.message", "Something Went Wrong")} `);
    }
  };

  React.useEffect(() => {
    init();
  }, []);

  return (
    <>
      <Heading text="Manage Customer Leads" variant="h4" />
      {addLead && (
        <AddORUpdateUser
          isOpen={addLead}
          isLoading={get(props, "addCustomerLoading", false)}
          handleClose={() => handleClose()}
          handleSubmit={(respObj, isChanged) => addNewLeadToList(respObj, isChanged)}
        />
      )}
      <ConvertToCustomer
        isModalVisible={convertLead}
        record={currentRecord}
        isLoading={get(props, "loading", false)}
        handleSubmit={respObj => handleSubmit(respObj)}
        handleCancel={() => {
          setCurrentRecord(null);
          setConvertLead(false);
        }}
      />
      <div className="bg-white p-4 table-responsive-padding">
        <ErrorBoundary>
          <div className="search_filter_position search_filter_card">
            <SearchInput data={expectedClonedData} handleSearch={handleSearch} clearSearchString={clearSearchString} />
            {/* <label className="pl-sm-3 pt-2">
              <InfoCircleOutlined />
              <span className="pl-2" dangerouslySetInnerHTML={{ __html: staticTextInventory }} />
            </label> */}
          </div>
          <CustomTable
            data={expectedData}
            meta={expectedMetaData}
            clonedData={expectedClonedData}
            handleAdd={handleAdd}
            columnType={TableColumnsList.ActiveLeads}
            isLoading={get(props, "loading", false)}
            isCleared={() => isCleared()}
            isGlobalFilterEnabled={true}
            onFilter={payload => fetchActiveLeadsList({ ...defaultRequestOptions, searchable_columns: payload })}
            onReset={() => fetchActiveLeadsList(defaultRequestOptions)}
            handleEdit={(record, type, custom) => handleEditAction(record, type, custom)}
          />
        </ErrorBoundary>
      </div>
    </>
  );
};

export default connect(
  state => ({
    loading: get(state, "leads.loading", false),
    addCustomerLoading: get(state, "leads.addCustomerLoading", false),
    error: get(state, "leads.error", false),
    active_data: get(state, "leads.activeLeads", {})
  }),
  { getActiveLeads, addNewLead, convertLead }
)(LeadsManagement);
