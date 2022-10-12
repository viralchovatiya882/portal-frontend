import { InfoCircleOutlined } from "@ant-design/icons";
import ErrorBoundary from "@components/UIComponents/ErrorBoundary";
import Heading from "@components/UIComponents/Heading";
import { SearchInput } from "@components/UIComponents/Search";
import CustomTable from "@components/UIComponents/Table/responsiveTable";
import { openNotificationWithIcon } from "@components/UIComponents/Toast/notification";
import { TableColumnsList, staticTextInventory } from "@constants";
import { defaultRequestOptions } from "@settings";
import { getCasedGoods } from "@store/CasedGoods/casedGoods.actions";
import { cancelSalesOrdersRequest, getSalesOrdersRequest } from "@store/SalesOrder/sale.actions";
import { get } from "lodash";
import React from "react";
import { connect } from "react-redux";
import { CancelOrderUI } from "./cancelOrder";

/**
 * Renders Track Sales Order component
 */
const TrackOrder = props => {
  const [expectedData, setExpectedData] = React.useState([]);
  const [expectedMetaData, setExpectedMetaData] = React.useState([]);
  const [expectedClonedData, setExpectedClonedData] = React.useState([]);
  const [currentCancelRecord, setCurrentCancelRecord] = React.useState(null);
  const [clearSearchString, setClearSearchString] = React.useState(false);
  const [cancelOrderRequest, setCancelOrderRequest] = React.useState(false);

  const updateState = data => {
    setExpectedData(data);
    if (expectedClonedData.length === 0) {
      setExpectedClonedData(data);
    }
  };

  const isCleared = () => {
    setExpectedData(expectedClonedData);
    setClearSearchString(true);
  };

  const fetchCasedGoods = async () => {
    const searchable_columns = [{ field_name: "deleted", field_value: "no" }];
    const inventoryResponse = await props.getCasedGoods({ ...defaultRequestOptions, searchable_columns });
    if (get(inventoryResponse, "error", false)) {
      openNotificationWithIcon("error", "Inventory", `${get(inventoryResponse, "error.message", "Something Went Wrong")} `);
    }
  };

  const fetchSalesOrders = async requestOptions => {
    let salesOrderResp = await props.getSalesOrdersRequest({ ...requestOptions });

    if (get(salesOrderResp, "error", false)) {
      openNotificationWithIcon("error", "Track Order", `${get(salesOrderResp, "error.message", "Something Went Wrong")} `);
    }

    if (get(salesOrderResp, "response.status")) {
      setExpectedMetaData(get(salesOrderResp, "response.meta"));
      updateState(get(salesOrderResp, "response.data", []));
    }
  };

  React.useEffect(() => {
    fetchSalesOrders(defaultRequestOptions);
  }, []);

  const handleSearch = searchedData => {
    if (get(searchedData, "isClient", true)) {
      setExpectedData(get(searchedData, "filteredData", []));
    }
  };

  const handleEditAction = (record, type) => {
    if (type === "Cancel Order") {
      setCancelOrderRequest(true);
      setCurrentCancelRecord(record);
    }
  };

  const handleCancelOrderRequest = async (comments, sales_order_id) => {
    const requestPayload = {
      ...defaultRequestOptions,
      comments,
      sales_order_id,
      fulfillment_status: "cancelled",
    };

    let cancelSalesOrderResp = await props.cancelSalesOrdersRequest({ ...requestPayload });

    if (get(cancelSalesOrderResp, "error", false)) {
      openNotificationWithIcon("error", "Cancel Order", `${get(cancelSalesOrderResp, "error.message", "Something Went Wrong")} `);
    }

    if (get(cancelSalesOrderResp, "response.status")) {
      fetchSalesOrders(defaultRequestOptions);
      fetchCasedGoods();
      openNotificationWithIcon("success", "Cancel Order", `${get(cancelSalesOrderResp, "response.message", "Order Cancelled Successfully")} `);
      setCancelOrderRequest(false);
      setCurrentCancelRecord(null);
    }
  };

  return (
    <>
      {cancelOrderRequest && (
        <CancelOrderUI
          title="Cancel Order"
          handleCancel={() => setCancelOrderRequest(false)}
          handleSubmit={handleCancelOrderRequest}
          isModalVisible={cancelOrderRequest}
          loading={get(props, "loading", false)}
          record={currentCancelRecord}
        />
      )}
      <Heading text="Track Your Order" variant="h4" />
      <div className="bg-white p-sm-4 table-responsive-padding">
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
              columnType={TableColumnsList.TrackOrder}
              isLoading={get(props, "loading", false)}
              isCleared={isCleared}
              isGlobalFilterEnabled={true}
              onFilter={payload => fetchSalesOrders({ ...defaultRequestOptions, searchable_columns: payload })}
              onReset={() => fetchSalesOrders(defaultRequestOptions)}
              handleEdit={(record, type) => handleEditAction(record, type)}
            />
          </div>
        </ErrorBoundary>
      </div>
    </>
  );
};

export default connect(
  state => ({
    loading: state.salesOrder.loading,
    error: state.salesOrder.failure,
  }),
  { getCasedGoods, getSalesOrdersRequest, cancelSalesOrdersRequest }
)(TrackOrder);
