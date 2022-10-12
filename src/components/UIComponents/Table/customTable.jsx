import { DownloadOutlined, FilterOutlined, PlusOutlined, SearchOutlined, UndoOutlined } from "@ant-design/icons";
import { AutoComplete, Button, Space, Table, Tooltip } from "antd";
import { cloneDeep, filter, get, has, isEqual, isNumber } from "lodash";
import React from "react";
import Highlighter from "react-highlight-words";
import { isMobileOrTab, TableColumnsList } from "../../../constants";
import { exportToCSV } from "../../../helpers/exportToCSV";
import { getScreenSize } from "../../../helpers/utility";
import { warning } from "../Message";
import { CustomMetaColumns, getDataWrapper } from "./getMetaColumnData";
import MobileCardView from "./mobileCardView";
// import ResizableTitle from "./resizableTitle";

/**
 * Render custom table using antd
 * @param
 */
class CustomTable extends React.Component {
  state = {
    searchText: "",
    searchedColumn: "",
    pageSize: 10,
    pageNumber: 1,
    filteredInfo: null,
    sortedInfo: null,
    currentDataSource: [],
    selectedSearchValue: {},
    columns: [],
    scroll: { x: 1800 }
  };

  getColumnSearchProps = (dataIndex, filters, title) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
      return (
        <div style={{ padding: 8 }}>
          <AutoComplete
            options={filters}
            style={{ marginBottom: 8, display: "block" }}
            allowClear
            backfill
            autoFocus
            placeholder={`Search ${title}`}
            value={get(this, `state.selectedSearchValue.${dataIndex}`, "")}
            notFoundContent={`Not found, try with other ${title}`}
            onChange={value => {
              setSelectedKeys(value ? [value] : []);
              let requestObject = { ...this.state.selectedSearchValue };
              requestObject[dataIndex] = value;
              this.setState({ selectedSearchValue: requestObject });
            }}
            onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
            filterOption={(inputValue, option) => {
              if (isNumber(inputValue)) {
                return option.value === inputValue;
              }
              return option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1;
            }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Search
            </Button>
            <Button
              onClick={() => {
                let requestObject = { ...this.state.selectedSearchValue };
                delete requestObject[dataIndex];
                this.setState({ selectedSearchValue: requestObject });
                this.handleReset(clearFilters);
              }}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      );
    },
    filteredValue: get(this, `state.filteredInfo.${dataIndex}`, null) || null,
    filterIcon: filtered => <FilterOutlined style={{ color: filtered ? "#1890ff" : undefined }} onClick={e => e.preventDefault()} />,
    onFilter: (value, record) => (record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : ""),
    render: text =>
      this.state.searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[this.state.searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        <Tooltip placement="topLeft" title={text}>
          <span className="cased_goods__column_name">{text || text === 0 ? text : "----"}</span>
        </Tooltip>
      )
  });

  handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    this.setState({
      searchText: selectedKeys[0],
      searchedColumn: dataIndex
    });
  };

  handleReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: "", searchedColumn: "" });
  };

  onChange = (page, pageSize) => {
    this.setState({ pageNumber: page, pageSize });
  };

  handleChange = (pagination, filters, sorter, extra) => {
    const computedInfo = filter(filters, function (o) {
      return o !== null;
    });
    this.setState({
      filteredInfo: computedInfo.length > 0 ? filters : null,
      sortedInfo: sorter,
      currentDataSource: get(extra, "currentDataSource", [])
    });
  };

  clearAll = () => {
    this.setState({
      filteredInfo: null,
      sortedInfo: null,
      searchText: "",
      searchedColumn: "",
      currentDataSource: [],
      selectedSearchValue: {}
    });
    if (has(this, "props.isCleared")) {
      this.props.isCleared();
    }
  };

  handleCSVDownload = () => {
    const { currentDataSource } = this.state;
    const {
      columnType,
      data,
      meta: { column_info }
    } = this.props;

    let availableData = currentDataSource.length > 0 ? currentDataSource : data;
    if (availableData.length > 0) {
      let exportData = [];
      let dataToBeExported = cloneDeep(column_info);
      dataToBeExported.pop();
      exportData = availableData.map(list => {
        let tempObj = {};
        dataToBeExported.map(listColumn => {
          let keyName = get(listColumn, "key_name");
          let displayName = get(listColumn, "display_name");
          return (tempObj[displayName] = list[keyName]);
        });
        return tempObj;
      });
      exportToCSV(exportData, columnType);
    } else {
      warning("No data available");
    }
  };

  getDataSource = () => {
    const { columnType } = this.props;

    // const height = getScreenSize() > isMobileOrTab ? window.innerHeight - 350 : window.innerHeight;

    const dataSource = {
      columnType: columnType,
      isEditable: false,
      columnInfo: get(this, "props.meta.column_info", []),
      cardInfo: get(this, "props.meta.card_fields", []),
      columnData: get(this, "props.data", []),
      currentAction: get(this, "props.selectedAction"),
      userRole: get(this, "props.userRole")
    };

    return dataSource;
  };

  getColumnsBasedOnType = () => {
    const { columnType } = this.props;

    // const height = getScreenSize() > isMobileOrTab ? window.innerHeight - 350 : window.innerHeight;

    const datasource = this.getDataSource();

    const getColumns = CustomMetaColumns(this.getColumnSearchProps, datasource, (record, type, custom) => {
      this.props.handleEdit(record, type, custom);
    });

    if (columnType === TableColumnsList.Inventory) {
      return {
        scroll: { x: 5000 },
        columns: getColumns
      };
    }

    if (columnType === TableColumnsList.DeletedInventory) {
      return {
        scroll: { x: 5000 },
        columns: getColumns
      };
    }

    if (columnType === TableColumnsList.Users) {
      return {
        scroll: { x: 2000 },
        columns: getColumns
      };
    }

    if (columnType === TableColumnsList.AdditionalCharges) {
      return {
        scroll: { x: 700 },
        columns: getColumns
      };
    }

    if (columnType === TableColumnsList.Taxonomy) {
      return {
        scroll: { x: 1100 },
        columns: getColumns
      };
    }

    if (columnType === TableColumnsList.ChangeLog) {
      return {
        scroll: { x: 2300 },
        columns: getColumns
      };
    }

    if (columnType === TableColumnsList.HelpTicket) {
      return {
        scroll: { x: 1500 },
        columns: getColumns
      };
    }

    if (columnType === TableColumnsList.TrackOrder) {
      return {
        scroll: { x: getScreenSize() < 385 ? 1350 : 1800 },
        columns: getColumns
      };
    }

    if (columnType === TableColumnsList.ActiveLeads || columnType === TableColumnsList.CompletedLeads) {
      return {
        scroll: { x: 3000 },
        columns: getColumns
      };
    }

    if (columnType === TableColumnsList.CustomerList) {
      return {
        scroll: { x: 2500 },
        columns: getColumns
      };
    }

    if (columnType === TableColumnsList.CustomerDetails) {
      return {
        scroll: { x: 1300 },
        columns: getColumns
      };
    }

    if (columnType === TableColumnsList.ManageOrders || columnType === TableColumnsList.CompletedOrders) {
      return {
        scroll: { x: 1800 },
        columns: getColumns
      };
    }
    return [];
  };

  getAddButtonCheck = () => {
    let returnVal = false;

    if (has(this, "props.handleAdd")) {
      returnVal = true;
    }

    // if (get(this, "props.columnType") === TableColumnsList.AdditionalCharges) {
    //   returnVal = get(this, "props.isUpdatePermittedBasedOnOrderType", false);
    // }

    return returnVal;
  };

  // componentDidMount() {
  //   let { columns, scroll } = this.getColumnsBasedOnType();
  //   this.setState({
  //     columns,
  //     scroll
  //   });
  // }

  componentDidUpdate(prevProps) {
    if (!isEqual(this.props.data, prevProps.data)) {
      // let { columns, scroll } = this.getColumnsBasedOnType();
      this.setState({
        searchText: "",
        searchedColumn: "",
        pageSize: 10,
        pageNumber: 1,
        currentDataSource: [],
        filteredInfo: null,
        selectedSearchValue: {}
        // columns,
        // scroll
      });
    }
  }

  // components = {
  //   header: {
  //     cell: ResizableTitle
  //   }
  // };

  handleResize =
    index =>
    (e, { size }) => {
      this.setState(({ columns }) => {
        const nextColumns = [...columns];
        nextColumns[index] = {
          ...nextColumns[index],
          width: size.width
        };
        return { columns: nextColumns };
      });
    };

  render() {
    let { sortedInfo, filteredInfo, pageNumber, pageSize, currentDataSource } = this.state;

    // const columns = this.state.columns.map((col, index) => ({
    //   ...col,
    //   onHeaderCell: column => ({
    //     width: column.width,
    //     onResize: this.handleResize(index, columns)
    //   })
    // }));

    let { columns, scroll } = this.getColumnsBasedOnType();

    sortedInfo = sortedInfo || {};
    filteredInfo = filteredInfo || {};
    const dataLength = currentDataSource.length > 0 ? currentDataSource : get(this, "props.data", []);

    return (
      <>
        <div style={getScreenSize() > isMobileOrTab ? { top: "-4px" } : { top: "-40px", marginBottom: 30 }} className="search_filter_position action_btn_section">
          {get(this, "props.isExportAvailable", true) && (
            <Button onClick={this.handleCSVDownload} className="float-right" icon={<DownloadOutlined />}>
              {getScreenSize() > isMobileOrTab && "Export"}
            </Button>
          )}
          {get(this, "props.isClearable", true) && Object.keys(filteredInfo).length > 0 && (
            <Button onClick={this.clearAll} className="float-right mr-2" icon={<UndoOutlined />}>
              {getScreenSize() > isMobileOrTab && "Clear Filters"}
            </Button>
          )}
          {this.getAddButtonCheck() && (
            <Button onClick={() => this.props.handleAdd()} className="float-right mr-0" type="primary" icon={<PlusOutlined />}>
              {getScreenSize() > isMobileOrTab && get(this, "props.addText", "Add")}
            </Button>
          )}
        </div>
        <div className="position-relative">
          <Table
            columns={columns}
            size={get(this, "props.size", "middle")}
            onChange={this.handleChange}
            dataSource={getDataWrapper(get(this, "props.data", []))}
            scrollToFirstRowOnChange={false}
            // components={this.components}
            showSorterTooltip={false}
            loading={get(this, "props.isLoading", true)}
            pagination={{
              showTotal: total => `Total ${total} items`,
              showQuickJumper: false,
              showSizeChanger: dataLength.length > 10 && true,
              defaultCurrent: 1,
              showLessItems: true,
              current: pageNumber,
              total: dataLength.length,
              pageSize,
              responsive: true,
              onChange: (page, pageNumber) => this.onChange(page, pageNumber)
            }}
            sticky={true}
            tableLayout="fixed"
            scroll={scroll}
          />
        </div>
      </>
    );
  }
}

export default CustomTable;
