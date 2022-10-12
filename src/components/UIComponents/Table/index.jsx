import { DownloadOutlined, PlusOutlined, SearchOutlined, UndoOutlined } from "@ant-design/icons";
import { AutoComplete, Button, Space, Table, Tooltip } from "antd";
import { filter, get, has, isEqual, isNumber } from "lodash";
import React from "react";
import Highlighter from "react-highlight-words";
import { isMobileOrTab, TableColumnsList } from "../../../constants";
import { exportToCSV } from "../../../helpers/exportToCSV";
import { getScreenSize } from "../../../helpers/utility";
import { warning } from "../Message";
import { getCustomUIColumnsData } from "./getColumnDataByKeys";
import { CustomMetaColumns, getDataWrapper } from "./getMetaColumnData";

/**
 * Render custom table using antd
 * @param
 */
class TableUI extends React.Component {
  state = {
    searchText: "",
    searchedColumn: "",
    pageSize: get(this, "props.pageSize", 10),
    selectedRowKeys: [],
    selectedRows: [],
    pageNumber: 1,
    filteredInfo: null,
    sortedInfo: null,
    currentDataSource: [],
    selectedSearchValue: {},
  };

  getColumnSearchProps = (dataIndex, filters, title) => {
    get(this, "props.isFilterEnabled", false)
      ? {
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
                  onChange={(value) => {
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
                    onClick={(e) => {
                      e.preventDefault();
                      this.handleSearch(selectedKeys, confirm, dataIndex);
                    }}
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
          filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />,
          onFilter: (value, record) => (record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : ""),
          render: (text) =>
            this.state.searchedColumn === dataIndex ? (
              <Highlighter highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }} searchWords={[this.state.searchText]} autoEscape textToHighlight={text ? text.toString() : ""} />
            ) : (
              <Tooltip placement="topLeft" title={text}>
                <span className="cased_goods__column_name">{text || text === 0 ? text : "----"}</span>
              </Tooltip>
            ),
        }
      : {
          render: (text) => (
            <Tooltip placement="topLeft" title={text}>
              <span className="cased_goods__column_name">{text || text === 0 ? text : "----"}</span>
            </Tooltip>
          ),
        };
  };

  handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    this.setState({
      searchText: selectedKeys[0],
      searchedColumn: dataIndex,
    });
  };

  handleReset = (clearFilters) => {
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
      currentDataSource: get(extra, "currentDataSource", []),
    });
  };

  clearAll = () => {
    this.setState({
      filteredInfo: null,
      sortedInfo: null,
      searchText: "",
      searchedColumn: "",
      currentDataSource: [],
      selectedRows: [],
      selectedRowKeys: [],
      selectedSearchValue: {},
    });
    if (has(this, "props.isCleared")) {
      this.props.isCleared();
    }
  };

  handleCSVDownload = () => {
    const { currentDataSource } = this.state;
    const { columnType, data } = this.props;
    let exportData = currentDataSource.length > 0 ? currentDataSource : data;
    if (exportData.length > 0) {
      exportToCSV(exportData, columnType);
    } else {
      warning("No data available");
    }
  };
  getDefaultColumns = () => {
    const { columnType } = this.props;

    const getColumns = getCustomUIColumnsData(
      this.getColumnSearchProps,
      {
        data: get(this, "props.data", []),
        columns: get(this, "props.columns_available", []),
      },
      {
        isEditable: false,
        isDelete: false,
      },
      (record, type) => {
        this.props.handleUpdate(record, type, custom);
      }
    );

    if (columnType === TableColumnsList.OrderDetailsNewItems) {
      return {
        scroll: { x: 1500 },
        columns: getCustomUIColumnsData(
          this.getColumnSearchProps,
          {
            data: get(this, "props.data", []),
            columns: get(this, "props.columns_available", []),
          },
          {
            isEditable: true,
            isEdit: false,
            isDelete: get(this, "props.isActionAvailable", true),
            isFilterable: get(this, "props.isFilterEnabled", false),
          },
          (record, type, custom) => {
            this.props.handleEdit(record, type, custom);
          }
        ),
      };
    }

    if (columnType === TableColumnsList.OrderDetailsExistingItems) {
      return {
        scroll: { x: 2100 },
        columns: getCustomUIColumnsData(
          this.getColumnSearchProps,
          {
            data: get(this, "props.data", []),
            columns: get(this, "props.columns_available", []),
          },
          {
            isEditable: get(this, "props.isUpdatePermittedBasedOnOrderType", false),
            isEdit: true,
            isDelete: get(this, "props.isActionAvailable", true),
            isFilterable: get(this, "props.isFilterEnabled", false),
          },
          (record, type, custom) => {
            if (get(custom, "actionType") === "delete") {
              this.props.handleDelete(record, type, custom);
            } else {
              this.props.handleEdit(record, type, custom);
            }
          }
        ),
      };
    }

    return {
      scroll: { x: get(this, "props.scroll.x", 3500) },
      columns: getColumns,
    };
  };
  getColumnsBasedOnType = () => {
    const { columnType } = this.props;

    // const height = getScreenSize() > isMobileOrTab ? window.innerHeight - 350 : window.innerHeight;

    const datasource = {
      columnType: columnType,
      isEditable: false,
      columnInfo: get(this, "props.meta.column_info", []),
      columnData: get(this, "props.data", []),
      currentAction: get(this, "props.selectedAction"),
    };

    const getColumns = CustomMetaColumns(this.getColumnSearchProps, datasource, (record, type, custom) => {
      this.props.handleEdit(record, type, custom);
    });

    if (columnType === TableColumnsList.Inventory) {
      return {
        scroll: { x: 5000 },
        columns: getColumns,
      };
    }

    if (columnType === TableColumnsList.DeletedInventory) {
      return {
        scroll: { x: 5000 },
        columns: getColumns,
      };
    }

    if (columnType === TableColumnsList.Users) {
      return {
        scroll: { x: 2000 },
        columns: getColumns,
      };
    }

    if (columnType === TableColumnsList.Taxonomy) {
      return {
        scroll: { x: 1100 },
        columns: getColumns,
      };
    }

    if (columnType === TableColumnsList.ChangeLog) {
      return {
        scroll: { x: 2300 },
        columns: getColumns,
      };
    }

    if (columnType === TableColumnsList.HelpTicket) {
      return {
        scroll: { x: 1500 },
        columns: getColumns,
      };
    }

    if (columnType === TableColumnsList.TrackOrder) {
      return {
        scroll: { x: 1800 },
        columns: getColumns,
      };
    }

    if (columnType === TableColumnsList.ManageOrders || columnType === TableColumnsList.CompletedOrders) {
      return {
        scroll: { x: 1800 },
        columns: getColumns,
      };
    }
    return [];
  };

  componentDidUpdate(prevProps) {
    if (!isEqual(this.props.data, prevProps.data)) {
      this.setState({
        searchText: "",
        searchedColumn: "",
        // pageSize: 10,
        // pageNumber: 1,
        selectedRows: [],
        currentDataSource: [],
        filteredInfo: null,
        selectedRowKeys: [],
        selectedSearchValue: {},
      });
    }
  }

  getRowSelectionConfig = () => {
    const rowSelectionConfig = {
      onSelect: (record, selected, selectedRows) => {
        if (has(this, "props.selectedRow")) {
          this.props.selectedRow(record);
        }
        this.setState({ selectedRows });
      },
      onChange: (keyIndex, selectedRowKeys) => {
        this.setState({ selectedRowKeys: keyIndex });
      },
      selectedRowKeys: this.state.selectedRowKeys,
    };
    return {
      type: get(this, "props.rowSelectionType", "radio"),
      columnWidth: get(this, "props.isSelectionAvailable") ? 50 : 0,
      renderCell: (checked, record, index, originNode) => {
        return get(this, "props.isSelectionAvailable") ? originNode : <></>;
      },
      ...rowSelectionConfig,
    };
  };

  getRowClassName = (record, index) => {
    if (get(record, "free_item", "").toLowerCase() === "yes") {
      return "highlight_row";
    }
    if (get(record, "anchor_product", false)) {
      return "highlight_row_anchor";
    }
    return "";
  };
  render() {
    let { sortedInfo, filteredInfo, pageNumber, pageSize, currentDataSource } = this.state;
    const { isDefaultType } = this.props;
    const { columns, scroll } = isDefaultType ? this.getDefaultColumns() : this.getColumnsBasedOnType();
    sortedInfo = sortedInfo || {};
    filteredInfo = filteredInfo || {};
    const dataLength = currentDataSource.length > 0 ? currentDataSource : get(this, "props.data", []);

    return (
      <>
        <div style={getScreenSize() > isMobileOrTab ? { top: "-30px" } : {}} className="search_filter_position">
          {get(this, "props.isExportEnabled", true) && (
            <Button onClick={this.handleCSVDownload} className="float-right" icon={<DownloadOutlined />}>
              {getScreenSize() > isMobileOrTab && "Export"}
            </Button>
          )}
          {Object.keys(filteredInfo).length > 0 && (
            <Button onClick={this.clearAll} className="float-right mr-2" icon={<UndoOutlined />}>
              {getScreenSize() > isMobileOrTab && "Clear Filters"}
            </Button>
          )}
          {has(this, "props.handleAdd") && (
            <Button onClick={() => this.props.handleAdd()} type="primary" className="float-right mr-2" icon={<PlusOutlined />}>
              {getScreenSize() > isMobileOrTab && "Add"}
            </Button>
          )}
        </div>
        <div style={getScreenSize() > isMobileOrTab ? { top: get(this, "props.isExportEnabled", true) ? -20 : 0 } : {}} className="position-relative">
          <Table
            columns={columns}
            size="middle"
            onChange={this.handleChange}
            rowSelection={this.getRowSelectionConfig()}
            rowClassName={(record, index) => this.getRowClassName(record, index)}
            dataSource={getDataWrapper(get(this, "props.data", []))}
            className={get(this, "props.className", "")}
            scrollToFirstRowOnChange={false}
            showSorterTooltip={false}
            loading={get(this, "props.isLoading", true)}
            pagination={{
              showTotal: (total) => `Total ${total} items`,
              showQuickJumper: false,
              showSizeChanger: dataLength.length > 10 && true,
              defaultCurrent: 1,
              showLessItems: true,
              current: pageNumber,
              total: dataLength.length,
              pageSize,
              responsive: true,
              onChange: (page, pageNumber) => this.onChange(page, pageNumber),
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

export default TableUI;
