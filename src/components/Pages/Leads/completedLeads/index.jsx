import { InfoCircleOutlined } from "@ant-design/icons";
import { Modal } from "antd";
import ErrorBoundary from "@components/UIComponents/ErrorBoundary";
import Heading from "@components/UIComponents/Heading";
import { SearchInput } from "@components/UIComponents/Search";
import CustomTable from "@components/UIComponents/Table/responsiveTable";
import { openNotificationWithIcon } from "@components/UIComponents/Toast/notification";
import { staticTextInventory, TableColumnsList } from "@constants";
import { defaultRequestOptions } from "@settings";
import { getCompletedLeads } from "@store/Leads/leads.actions";
import { get } from "lodash";
import React from "react";
import { connect } from "react-redux";
import { getDataWrapper } from "../getData";

/**
 * Renders Completed Leads component
 */
const CompletedLeads = props => {
  const [expectedData, setExpectedData] = React.useState([]);
  const [expectedMetaData, setExpectedMetaData] = React.useState([]);
  const [expectedClonedData, setExpectedClonedData] = React.useState([]);
  const [clearSearchString, setClearSearchString] = React.useState(false);

  const updateState = data => {
    setExpectedData(getDataWrapper(data));
    if (expectedClonedData.length === 0) {
      setExpectedClonedData(getDataWrapper(data));
    }
  };

  const isCleared = () => {
    setExpectedData(expectedClonedData);
    setClearSearchString(true);
  };

  const fetchCompletedLeads = async requestOptions => {
    let completedLeadsResp = await props.getCompletedLeads({ ...requestOptions });

    if (get(completedLeadsResp, "error", false)) {
      openNotificationWithIcon("error", "Completed Leads", `${get(completedLeadsResp, "error.message", "Something Went Wrong")} `);
    }

    if (get(completedLeadsResp, "response.status")) {
      setExpectedMetaData(get(completedLeadsResp, "response.meta"));
      updateState(get(completedLeadsResp, "response.data", []));
    }
  };

  React.useEffect(() => {
    fetchCompletedLeads(defaultRequestOptions);
  }, []);

  const handleSearch = searchedData => {
    if (get(searchedData, "isClient", true)) {
      setExpectedData(get(searchedData, "filteredData", []));
    }
  };

  const handleEditAction = (record, type, custom) => {
    if (get(custom, "status") === "message") {
      MessageInfo(get(record, "message"), get(record, "id"));
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
      onOk() {},
    });
  };

  return (
    <>
      <Heading text="Completed Leads" variant="h4" />
      <div className="bg-white p-4 table-responsive-padding">
        <ErrorBoundary>
          <div className="search_filter_position search_filter_card">
            <SearchInput data={expectedClonedData} handleSearch={handleSearch} clearSearchString={clearSearchString} />
            {/* <label className="pl-sm-3 pt-2">
              <InfoCircleOutlined />
              <span className="pl-2" dangerouslySetInnerHTML={{ __html: staticTextInventory }} />
            </label> */}
          </div>
          <div>
            <CustomTable
              data={expectedData}
              meta={expectedMetaData}
              clonedData={expectedClonedData}
              columnType={TableColumnsList.CompletedLeads}
              isLoading={get(props, "loading", false)}
              isCleared={isCleared}
              isGlobalFilterEnabled={true}
              onFilter={payload => fetchCompletedLeads({ ...defaultRequestOptions, searchable_columns: payload })}
              onReset={() => fetchCompletedLeads(defaultRequestOptions)}
              handleEdit={(record, type, custom) => handleEditAction(record, type, custom)}
            />
          </div>
        </ErrorBoundary>
      </div>
    </>
  );
};

export default connect(
  state => ({
    loading: get(state, "leads.loading", false),
    error: get(state, "leads.failure", false),
  }),
  { getCompletedLeads }
)(CompletedLeads);
