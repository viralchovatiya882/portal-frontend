import { InfoCircleOutlined } from "@ant-design/icons";
import { SearchInput } from "@components/UIComponents/Search";
import { capitalizeAllLetter } from "@helpers/utility";
import { CustomDatePicker } from "@ui-components/DatePicker";
import { Badge, Button, Checkbox, Col, Modal, Row, Tabs } from "antd";
import { cloneDeep, compact, find, get, map, uniqBy } from "lodash";
import React from "react";
import { getFilterOptions } from "./getMetaColumnData";

const { TabPane } = Tabs;

const CustomFilter = props => {
  const [currentTab, setCurrentTab] = React.useState(null);
  const [selectedOptions, setSelectedOptions] = React.useState({});
  const [filterColumns, setFilterColumns] = React.useState([]);
  const [filterData, setFilterData] = React.useState([]);

  React.useEffect(() => {
    updateStateValues();
  }, [props]);

  const onChange = checkedValues => {
    let newObj = { ...selectedOptions };
    newObj[currentTab] = checkedValues;
    setSelectedOptions(newObj);
  };

  const getColumnsList = () => {
    let list = [...get(props, "dataSource.filterInfo", [])];
    // list.pop();
    setFilterColumns(list);
  };

  const updateAvailableOptions = tab => {
    const checkedValueArr = get(props, `currentFilters.${tab}.filter_data`, []);
    let newObj = { ...selectedOptions };
    newObj[tab] = checkedValueArr;
    setSelectedOptions(newObj);
  };

  const updateStateValues = () => {
    const firstIndexKey = get(props, "dataSource.filterInfo[0]", []);
    setCurrentTab(firstIndexKey);
    updateAvailableOptions(firstIndexKey);
    getColumnsList();
    const filters = getFilterOptions(get(props, "dataSource.columnClonedData", []), firstIndexKey);
    setFilterData(filters);
  };

  React.useEffect(() => {
    const filters = getFilterOptions(get(props, "dataSource.columnClonedData", []), currentTab);
    setFilterData(filters);
    updateAvailableOptions(currentTab);
  }, [currentTab]);

  const onTabChange = tab => {
    setCurrentTab(tab);
  };

  const handleSubmit = () => {
    let filterListAvailable = cloneDeep(selectedOptions);
    const initialClonedArr = cloneDeep(get(props, "dataSource.columnInfo", []));
    const filterColumnInfoList = uniqBy(initialClonedArr, function (e) {
      return e.key_name;
    });

    map(filterColumnInfoList, function (o, index) {
      if (get(filterListAvailable, get(o, "key_name"), "")) {
        filterListAvailable[get(o, "key_name")] = {
          filter_data: compact(filterListAvailable[get(o, "key_name")]),
          filter_key: get(o, "filter_key"),
          filter_data_type: get(o, "data_type")
        };
      }
    });

    filterListAvailable = { ...get(props, "currentFilters", {}), ...filterListAvailable };
    props.onFilterSubmit(filterListAvailable);
  };

  const handleSearch = searchedData => {
    setFilterData(get(searchedData, "filteredData"));
  };

  const getTitle = key_name => {
    const keyValue = getValueBasedOnKey(key_name);

    if (keyValue) {
      return get(keyValue, "display_name");
    }

    return capitalizeAllLetter(key_name.replace(/_/g, " "));
  };

  const getDataType = key_name => {
    const keyValue = getValueBasedOnKey(key_name);
    if (keyValue) {
      return get(keyValue, "data_type");
    }
    return "varchar";
  };

  const getValueBasedOnKey = key_name => {
    return find(get(props, "dataSource.columnInfo", []), function (o) {
      return get(o, "key_name") === key_name;
    });
  };

  const onDateTimeChange = (type, date) => {
    let newObj = { ...selectedOptions };
    newObj[currentTab] = [...get(newObj, currentTab, [])];
    if (type === "start_date") {
      newObj[currentTab][0] = date;
    }
    if (type === "end_date") {
      newObj[currentTab][1] = date;
    }
    setSelectedOptions(newObj);
  };

  const getDateValue = list => {
    if (get(selectedOptions, list, []).length > 0) {
      return get(selectedOptions, list, []);
    }
    return get(props, `currentFilters.${currentTab}.filter_data`, []);
  };

  return (
    <>
      <Modal
        title="Filter"
        className="mobile_card__filter"
        visible={props.visible}
        okText="Filter"
        width={800}
        maskClosable={false}
        onOk={() => handleSubmit()}
        centered
        footer={[
          <Button
            key="back"
            onClick={() => {
              setSelectedOptions({});
              props.onReset();
            }}
          >
            Clear Filter
          </Button>,
          <Button key="back" onClick={() => props.onClose()}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={() => handleSubmit()}>
            Submit
          </Button>
        ]}
        onCancel={() => props.onClose()}
      >
        <Tabs tabPosition="top" activeKey={currentTab} className="mobile_card__filter__tabs" onChange={onTabChange}>
          {filterColumns.map((list, index) => {
            const filters = getFilterOptions(get(props, "dataSource.columnClonedData", []), list);
            let dotValueArr = get(props, `currentFilters.${list}.filter_data`, []);
            const dotValue = compact(dotValueArr).length > 0;
            const dateTimeType = getDataType(list) === "date" || getDataType(list) === "datetime";
            const dateCurrentValue = dateTimeType && getDateValue(list);
            // const dateFormat = getDataType(list) === "date" ? "YYYY-MM-DD" : "YYYY-MM-DD HH:mm:ss";
            // const dateFormat = "YYYY-MM-DD";
            const defaultValues = [...get(selectedOptions, list, [])];

            return (
              <TabPane tab={<Badge dot={dotValue}>{getTitle(list)}</Badge>} key={list}>
                {!dateTimeType && (
                  <div style={{ width: "90%" }}>
                    <SearchInput data={filters} handleSearch={handleSearch} clearSearchString={false} />
                  </div>
                )}
                <div style={{ overflow: "auto", height: "50vh" }}>
                  {dateTimeType ? (
                    <>
                      <p>
                        <InfoCircleOutlined /> Choose Start & End Date
                      </p>
                      <Row>
                        <Col xs={{ span: 24 }} sm={{ span: 10 }}>
                          <CustomDatePicker
                            handleChange={onDateTimeChange}
                            value={dateCurrentValue[0]}
                            type="start_date"
                            enableFutureDate={true}
                            placeholder="Start Date (YYYY-MM-DD)"
                            className="mt-0 mb-0 w-100"
                            label="Start Date (YYYY-MM-DD)"
                          />
                        </Col>
                        <Col xs={{ span: 24 }} lg={{ span: 10, offset: 2 }}>
                          <CustomDatePicker
                            handleChange={onDateTimeChange}
                            value={dateCurrentValue[1]}
                            type="end_date"
                            enableFutureDate={true}
                            placeholder="End Date (YYYY-MM-DD)"
                            className="mt-0 mb-0 w-100"
                            label="End Date (YYYY-MM-DD)"
                          />
                        </Col>
                      </Row>
                    </>
                  ) : (
                    <Checkbox.Group value={defaultValues} style={{ width: "100%", marginTop: 20 }} onChange={onChange}>
                      <Row>
                        {filterData.map((filter, index) => {
                          return (
                            <Col span={24} className="mt-2" key={get(filter, "value")}>
                              <Checkbox value={get(filter, "value")}>{get(filter, "label")}</Checkbox>
                            </Col>
                          );
                        })}
                      </Row>
                    </Checkbox.Group>
                  )}
                </div>
              </TabPane>
            );
          })}
        </Tabs>
      </Modal>
    </>
  );
};

export default CustomFilter;
