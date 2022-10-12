import { get } from "lodash";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { TableColumnsList } from "../../../constants";
import { defaultRequestOptions } from "../../../settings";
import { getHelpDetails } from "../../../store/Help/help.actions";
import ErrorBoundary from "../../UIComponents/ErrorBoundary";
import Heading from "../../UIComponents/Heading";
import { info } from "../../UIComponents/Modal/informationModal";
import { SearchInput } from "../../UIComponents/Search";
import CustomTable from "../../UIComponents/Table/responsiveTable";
import "./style.scss";

import { getDataWrapper } from "../../../helpers/utility";

const HelpTicket = props => {
  const [expectedData, setExpectedData] = useState([]);
  const [expectedMetaData, setExpectedMetaData] = React.useState([]);
  const [expectedClonedData, setExpectedClonedData] = useState([]);
  const [clearSearchString, setClearSearchString] = useState(false);

  const getHelpList = async () => {
    const helpList = await props.getHelpDetails(defaultRequestOptions);
    updateState(get(helpList, "response.data"));
    setExpectedMetaData(get(helpList, "response.meta"));
  };

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

  const handleSearch = searchedData => {
    if (get(searchedData, "isClient", true)) {
      setExpectedData(get(searchedData, "filteredData", []));
    }
  };

  useEffect(() => {
    if (get(props, "helpListData", []).length === 0) {
      getHelpList();
    } else {
      setExpectedMetaData(get(props, "helpListData.meta"));
      updateState(get(props, "helpListData.data", []));
    }
  }, [props]);

  const getCaseDetailsContent = requestData => {
    return (
      <div className="issue_image">
        <div className="issue_image_container">
          <img src={requestData.image_url} alt="" />
        </div>
        <div className="description">
          <label>Description</label>
          <p>{requestData.comments}</p>
        </div>
      </div>
    );
  };

  const handleViewDetail = async record => {
    info({
      title: "Issue Image",
      message: getCaseDetailsContent(record),
      width: 800
    });
  };

  return (
    <>
      <Heading text="Help Tickets" variant="h4" />
      <div className="bg-white p-4">
        <ErrorBoundary>
          <div className="d-flex justify-content-between search_filter_position">
            <SearchInput data={expectedClonedData} handleSearch={handleSearch} clearSearchString={clearSearchString} />
          </div>
          <div>
            <CustomTable
              data={expectedData}
              meta={expectedMetaData}
              clonedData={expectedClonedData}
              columnType={TableColumnsList.HelpTicket}
              isLoading={get(props, "loading", false)}
              isCleared={isCleared}
              handleEdit={record => handleViewDetail(record)}
            />
          </div>
        </ErrorBoundary>
      </div>
    </>
  );
};

export default connect(
  state => ({
    loading: state.help.loading,
    error: state.help.failure,
    helpListData: state.help.helpList
  }),
  { getHelpDetails }
)(HelpTicket);
