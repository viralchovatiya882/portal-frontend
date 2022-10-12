import { InfoCircleOutlined } from "@ant-design/icons";
import { Tabs } from "antd";
import { cloneDeep, get, map } from "lodash";
import React from "react";
import { connect } from "react-redux";
import { defaultTaxonomyMasterDataListName, MasterDataKeyPair, staticTextInventory, TableColumnsList } from "../../../constants";
import { capitalizeAllLetter } from "../../../helpers/utility";
import { defaultRequestKey, defaultRequestOptions } from "../../../settings";
import {
  getTaxonomyData,
  getTaxonomyList,
  setCurrentTaxonomyTab,
  updateAllTaxonomyData,
  updateTaxonomyStatus
} from "../../../store/Taxonomy/taxonomy.actions";
import ErrorBoundary from "../../UIComponents/ErrorBoundary";
import Heading from "../../UIComponents/Heading";
import { SearchInput } from "../../UIComponents/Search";
import CustomTable from "../../UIComponents/Table/responsiveTable";
import { openNotificationWithIcon } from "../../UIComponents/Toast/notification";
import { getDataWrapper } from "./getData";
import "./style.scss";
const { TabPane } = Tabs;
/**
 * Renders information about the taxonomy obtained
 */

const Taxonomy = props => {
  const [expectedData, setExpectedData] = React.useState([]);
  const [expectedMetaData, setExpectedMetaData] = React.useState([]);
  const [clearSearchString, setClearSearchString] = React.useState(false);
  const [selectedList, setList] = React.useState(defaultTaxonomyMasterDataListName);
  const [expectedDataList, setExpectedDataList] = React.useState([]);
  const [expectedClonedData, setExpectedClonedData] = React.useState([]);

  const updateTaxonomyList = data => {
    setExpectedDataList(data);
  };

  const fetchTaxonomyList = async requestOptions => {
    const taxonomyList = await props.getTaxonomyList(requestOptions);
    if (get(taxonomyList, "error", false)) {
      openNotificationWithIcon("error", "Master Data List", `${get(taxonomyList, "error.message", "Failed to load master data list")} `);
    }
    updateTaxonomyList(get(taxonomyList, "response.data"));
  };

  const updateTaxonomyData = data => {
    setExpectedData(getDataWrapper(data));
    setExpectedClonedData(getDataWrapper(data));
  };

  const fetchTaxonomyData = async (requestOptions, masterKey = get(props, "currentActiveTab", "product_distiller")) => {
    requestOptions[MasterDataKeyPair.MasterDataKey] = masterKey;
    requestOptions["status_filter"] = "all";

    const getName = capitalizeAllLetter(masterKey.replace(/_/g, " "));
    const taxonomyData = await props.getTaxonomyData(requestOptions);

    if (get(taxonomyData, "error", false)) {
      openNotificationWithIcon("error", getName, `${get(taxonomyData, "error.message", `Failed to load ${getName} taxonomy data`)} `);
    }

    if (get(taxonomyData, "response.status")) {
      const tempObj = { ...get(taxonomyData, "response"), requestPayload: requestOptions };
      const currentDataObj = { [masterKey]: tempObj };
      props.updateAllTaxonomyData({ ...props.masterAllData, ...currentDataObj });
      setExpectedMetaData(get(taxonomyData, "response.meta"));
      updateTaxonomyData(get(taxonomyData, "response.data"));
    }
  };

  const checkStoreData = () => {
    const { masterAllData, currentActiveTab, masterDataList } = props;
    setList(currentActiveTab);
    if (get(masterDataList, "data", []).length === 0) {
      fetchTaxonomyList(defaultRequestKey);
    } else {
      updateTaxonomyList(get(masterDataList, "data"));
    }

    if (masterAllData[currentActiveTab]) {
      const getMasterDataWithCurrentTab = masterAllData[currentActiveTab];
      if (get(getMasterDataWithCurrentTab, "data", []).length > 0) {
        setExpectedMetaData(get(getMasterDataWithCurrentTab, "meta"));
        updateTaxonomyData(get(getMasterDataWithCurrentTab, "data"));
      }
    } else {
      fetchTaxonomyData(defaultRequestOptions);
    }
  };

  React.useEffect(() => {
    fetchTaxonomyList(defaultRequestKey);
    fetchTaxonomyData(defaultRequestOptions);
    // checkStoreData();
  }, []);

  const handleSearch = searchedData => {
    if (get(searchedData, "isClient", true)) {
      setExpectedData(get(searchedData, "filteredData", []));
      setClearSearchString(false);
    }
  };

  const isCleared = () => {
    setExpectedData(expectedClonedData);
    setClearSearchString(true);
  };

  const handleClick = keyValue => {
    setClearSearchString(true);
    // const keyValue = expectedDataList[index];
    // const selectedListValue = get(keyValue, "masterdata_key", "");
    props.setCurrentTaxonomyTab(keyValue);
    setList(keyValue);
    fetchTaxonomyData(defaultRequestOptions, keyValue);
  };

  const handleEdit = async (record, statusValue) => {
    let requestOptions = cloneDeep(record);
    requestOptions["status"] = statusValue;
    requestOptions["masterdata_key"] = selectedList;

    const updateTaxonomyStatus = await props.updateTaxonomyStatus({
      ...defaultRequestKey,
      ...requestOptions
    });

    if (get(updateTaxonomyStatus, "error", false)) {
      openNotificationWithIcon(
        "error",
        `${capitalizeAllLetter(selectedList.replace(/_/g, " "))}`,
        `${get(updateTaxonomyStatus, "error.message", "Something Went Wrong")} `
      );
    }

    if (get(updateTaxonomyStatus, "response.status", false)) {
      openNotificationWithIcon(
        "success",
        `${capitalizeAllLetter(selectedList.replace(/_/g, " "))}`,
        get(updateTaxonomyStatus, "response.message", "Updated Successfully")
      );
      fetchTaxonomyData(defaultRequestOptions, selectedList);
    }
  };

  return (
    <>
      <Heading text="Taxonomy" variant="h4" />
      <ErrorBoundary>
        <div className="bg-white p-4 table-responsive-padding">
          <Tabs activeKey={get(props, "currentActiveTab", "product_distiller")} onChange={handleClick}>
            {map(expectedDataList || [], (list, index) => (
              <TabPane tab={get(list, "display_name")} key={get(list, "masterdata_key")}>
                <div className="search_filter_position search_filter_card">
                  <SearchInput
                    data={expectedClonedData}
                    label={`Search ${capitalizeAllLetter(selectedList.replace(/_/g, " "))}`}
                    clearSearchString={clearSearchString}
                    handleSearch={handleSearch}
                  />
                  {/* <label className="pl-sm-3 pt-2">
                    <InfoCircleOutlined />
                    <span className="pl-2" dangerouslySetInnerHTML={{ __html: staticTextInventory }} />
                  </label> */}
                </div>
                <CustomTable
                  data={expectedData}
                  clonedData={expectedClonedData}
                  meta={expectedMetaData}
                  handleEdit={handleEdit}
                  columnType={TableColumnsList.Taxonomy}
                  isLoading={props.masterDataLoading}
                  isGlobalFilterEnabled={true}
                  onFilter={payload => fetchTaxonomyData({ ...defaultRequestOptions, searchable_columns: payload }, selectedList)}
                  onReset={() => fetchTaxonomyData(defaultRequestOptions, selectedList)}
                  isCleared={() => isCleared()}
                />
              </TabPane>
            ))}
          </Tabs>
        </div>
      </ErrorBoundary>
    </>
  );
};

export default connect(
  state => ({
    masterDataLoading: get(state, "taxonomy.isDataLoading", false),
    masterAllData: get(state, "taxonomy.masterAllData", []),
    masterDataList: get(state, "taxonomy.masterDataList", []),
    masterDataListLoading: get(state, "taxonomy.loading", false),
    error: get(state, "taxonomy.error", false),
    currentActiveTab: get(state, "taxonomy.currentActiveTab", "product_distiller")
  }),
  { getTaxonomyList, getTaxonomyData, updateAllTaxonomyData, setCurrentTaxonomyTab, updateTaxonomyStatus }
)(Taxonomy);
