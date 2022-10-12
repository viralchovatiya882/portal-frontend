import { get } from "lodash";
import { InfoCircleOutlined } from "@ant-design/icons";
import React from "react";
import { connect } from "react-redux";
import { staticTextInventory, TableColumnsList } from "../../../../constants";
import { defaultRequestOptions } from "../../../../settings";
import { addNewCustomer, getCustomerList } from "../../../../store/Leads/leads.actions";
import ErrorBoundary from "../../../UIComponents/ErrorBoundary";
import Heading from "../../../UIComponents/Heading";
import { SearchInput } from "../../../UIComponents/Search";
import CustomTable from "../../../UIComponents/Table/responsiveTable";
import { openNotificationWithIcon } from "../../../UIComponents/Toast/notification";
import { getDataWrapper } from "../getData";
import "../index.scss";
import AddCustomer from "./addCustomer";

/**
 * Renders Customer component
 */
const CustomerListing = props => {
  const [expectedData, setExpectedData] = React.useState([]);
  const [expectedMetaData, setExpectedMetaData] = React.useState([]);
  const [expectedClonedData, setExpectedClonedData] = React.useState([]);
  const [clearSearchString, setClearSearchString] = React.useState(false);
  const [addCustomerModal, setAddCustomerModal] = React.useState(false);

  const updateCustomerList = data => {
    setExpectedData(getDataWrapper(data));
    if (expectedClonedData.length === 0) {
      setExpectedClonedData(getDataWrapper(data));
    }
  };

  const fetchCustomerList = async requestOptions => {
    let activeLeadsList = await props.getCustomerList(requestOptions);

    if (get(activeLeadsList, "response.status")) {
      updateCustomerList(get(activeLeadsList, "response.data"));
      setExpectedMetaData(get(activeLeadsList, "response.meta"));
    }

    if (!get(activeLeadsList, "response.status")) {
      openNotificationWithIcon("info", "Customer List", `${get(activeLeadsList, "response.message", "Something Went Wrong")} `);
    }

    if (get(activeLeadsList, "error", false)) {
      openNotificationWithIcon("error", "Customer List", `${get(activeLeadsList, "error.message", "Something Went Wrong")} `);
    }
  };

  const handleEditAction = (record, type, custom) => {
    // eslint-disable-next-line no-console
    console.log("Coming Soon");
  };

  const handleAdd = (record, type, custom) => {
    setAddCustomerModal(true);
  };

  const handleSubmit = async requestObj => {
    const requestPayload = { ...requestObj };
    let addCustomerResponse = await props.addNewCustomer(requestPayload);

    if (get(addCustomerResponse, "response.status")) {
      openNotificationWithIcon("success", "Customer List", `${get(addCustomerResponse, "response.message", "Something Went Wrong")} `);
      setAddCustomerModal(false);
      fetchCustomerList(defaultRequestOptions);
    }

    if (!get(addCustomerResponse, "response.status")) {
      openNotificationWithIcon("info", "Customer List", `${get(addCustomerResponse, "response.message", "Something Went Wrong")} `);
    }

    if (get(addCustomerResponse, "error", false)) {
      openNotificationWithIcon("error", "Customer List", `${get(addCustomerResponse, "error.message", "Something Went Wrong")} `);
    }
  };

  const init = () => {
    fetchCustomerList(defaultRequestOptions);
    if (props.error) {
      openNotificationWithIcon("error", "Customer List", get(props, "error", "Something went wrong"));
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

  React.useEffect(() => {
    init();
  }, []);

  return (
    <>
      <Heading text="Customer List" variant="h4" />
      {addCustomerModal && (
        <AddCustomer
          isModalVisible={addCustomerModal}
          isLoading={get(props, "addCustomerLoading", false)}
          handleSubmit={respObj => handleSubmit(respObj)}
          handleCancel={() => {
            setAddCustomerModal(false);
          }}
        />
      )}
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
            columnType={TableColumnsList.CustomerList}
            isLoading={get(props, "loading", false)}
            isCleared={() => isCleared()}
            isGlobalFilterEnabled={true}
            onFilter={payload => fetchCustomerList({ ...defaultRequestOptions, searchable_columns: payload })}
            onReset={() => fetchCustomerList(defaultRequestOptions)}
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
    customerListData: get(state, "leads.customerList", {})
  }),
  { getCustomerList, addNewCustomer }
)(CustomerListing);
