import { get } from "lodash";
import React from "react";
import { connect } from "react-redux";
import { TableColumnsList } from "../../../../../constants";
import { defaultRequestOptions } from "../../../../../settings";
import { getActiveOrders } from "../../../../../store/Leads/leads.actions";
import ErrorBoundary from "../../../../UIComponents/ErrorBoundary";
import { SearchInput } from "../../../../UIComponents/Search";
import CustomTable from "../../../../UIComponents/Table/customTable";
import { openNotificationWithIcon } from "../../../../UIComponents/Toast/notification";
import { getDataWrapper } from "../../getData";
import "./index.scss";

/**
 * Renders Customer Active Orders component
 */
const CustomerActiveOrderListing = props => {
  const [expectedData, setExpectedData] = React.useState([]);
  const [expectedMetaData, setExpectedMetaData] = React.useState([]);
  const [expectedClonedData, setExpectedClonedData] = React.useState([]);
  const [clearSearchString, setClearSearchString] = React.useState(false);

  const updateCustomerList = data => {
    setExpectedData(getDataWrapper(data));
    if (expectedClonedData.length === 0) {
      setExpectedClonedData(getDataWrapper(data));
    }
  };

  const fetchCustomerList = async requestOptions => {
    const requestPayload = { ...requestOptions, customer_id: get(props, "id") };
    let activeLeadsList = await props.getActiveOrders(requestPayload);

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
      <div className="active_orders__listing common_card_section">
        <ErrorBoundary>
          <div className="d-flex justify-content-between search_filter_position active-order-search-field">
            <SearchInput data={expectedClonedData} handleSearch={handleSearch} clearSearchString={clearSearchString} />
          </div>
          <CustomTable
            data={expectedData}
            meta={expectedMetaData}
            columnType={TableColumnsList.CustomerDetails}
            isLoading={get(props, "loading", false)}
            isCleared={() => isCleared()}
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
    error: get(state, "leads.error", false),
    customerListData: get(state, "leads.customerList", {}),
  }),
  { getActiveOrders }
)(CustomerActiveOrderListing);
