import ErrorBoundary from "@components/UIComponents/ErrorBoundary";
import Heading from "@components/UIComponents/Heading";
import { SearchInput } from "@components/UIComponents/Search";
import CustomTable from "@components/UIComponents/Table/responsiveTable";
import { openNotificationWithIcon } from "@components/UIComponents/Toast/notification";
import { TableColumnsList } from "@constants";
import { defaultRequestOptions } from "@settings";
import { getCasedGoods } from "@store/CasedGoods/casedGoods.actions";
import { cancelSalesOrdersRequest, getCancelledSalesOrderRequest } from "@store/SalesOrder/sale.actions";
import { get } from "lodash";
import React from "react";
import { connect, useSelector } from "react-redux";
import CancelOrderConfirmation from "../confirmation/cancelOrderConfirmation";
import { CancelOrderUI } from "../trackOrder/cancelOrder";

/**
 * Renders Cancelled Sales Order component
 */
const CancelledSalesOrder = (props) => {
  const [expectedData, setExpectedData] = React.useState([]);
  const [expectedMetaData, setExpectedMetaData] = React.useState([]);
  const [expectedClonedData, setExpectedClonedData] = React.useState([]);
  const [currentCancelRecord, setCurrentCancelRecord] = React.useState(null);
  const [clearSearchString, setClearSearchString] = React.useState(false);
  const [cancelOrderRequest, setCancelOrderRequest] = React.useState(false);

  const [showReasonModal, setShowReasonModal] = React.useState(false);
  const [cancellationReason, setCancellationReason] = React.useState("");
  const [currentRecord, setCurrentRecord] = React.useState(null);
  const [currentFulfillmentStatus, setCurrentFulfillmentStatus] = React.useState("");

  const loggedInUserRole = useSelector((state) => {
    return get(state, "auth.loggedInUserDetails.data.role", null);
  });

  const updateState = (data) => {
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

  const fetchSalesOrders = async (requestOptions) => {
    let salesOrderResp = await props.getCancelledSalesOrderRequest({ ...requestOptions });

    if (get(salesOrderResp, "error", false)) {
      openNotificationWithIcon("error", "Cancelled Sales Order", `${get(salesOrderResp, "error.message", "Something Went Wrong")} `);
    }

    if (get(salesOrderResp, "response.status")) {
      setExpectedMetaData(get(salesOrderResp, "response.meta"));
      updateState(get(salesOrderResp, "response.data", []));
    }
  };

  React.useEffect(() => {
    fetchSalesOrders(defaultRequestOptions);
  }, []);

  const handleSearch = (searchedData) => {
    if (get(searchedData, "isClient", true)) {
      setExpectedData(get(searchedData, "filteredData", []));
    }
  };

  const handleReasonSubmit = () => {
    updateFulfillmentStatus(currentFulfillmentStatus, get(currentRecord, "sales_order_id"), cancellationReason);
  };

  const handleEditAction = (record, type, custom) => {
    setCurrentRecord(record);
    setCurrentFulfillmentStatus(type);

    if (type === "Cancel Order") {
      setCancelOrderRequest(true);
      setCurrentCancelRecord(record);
    }
    if (get(custom, "status") === "fulfillment_status") {
      if (type === "cancelled" || type === "shipped") {
        setShowReasonModal(true);
      } else {
        updateFulfillmentStatus(type, get(record, "sales_order_id"));
      }
    }
  };

  const updateFulfillmentStatus = async (fulfillment_status, sales_order_id, comments) => {
    let requestPayload = {
      ...defaultRequestOptions,
      fulfillment_status,
      sales_order_id,
    };
    if (comments) {
      requestPayload["comments"] = comments;
    }
    let fulFillmentOrderResp = await props.cancelSalesOrdersRequest({ ...requestPayload });
    if (get(fulFillmentOrderResp, "error", false)) {
      openNotificationWithIcon("error", "Fulfillment Status", `${get(fulFillmentOrderResp, "error.message", "Something Went Wrong")} `);
    }

    if (get(fulFillmentOrderResp, "response.status")) {
      fetchSalesOrders(defaultRequestOptions);
      setCancellationReason("");
      setCurrentFulfillmentStatus("");
      setCurrentRecord(null);
      setShowReasonModal(false);
      fetchCasedGoods();
      openNotificationWithIcon("success", "Fulfillment Status", `${get(fulFillmentOrderResp, "response.message", "Fulfillment Status Successfully")} `);
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
      {showReasonModal && (
        <CancelOrderConfirmation
          handleReason={(reason) => setCancellationReason(reason)}
          cancellationReason={cancellationReason}
          customDetails={{
            fulfillment_status: currentFulfillmentStatus,
            signer_email: get(currentRecord, "signer_email"),
            email_sent_at: get(currentRecord, "email_sent_at"),
          }}
          handleReasonSubmit={handleReasonSubmit}
          showModal={true}
          handleClose={() => setShowReasonModal(false)}
        />
      )}
      <Heading text="Cancelled Orders" variant="h4" />
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
              userRole={loggedInUserRole}
              clonedData={expectedClonedData}
              meta={expectedMetaData}
              columnType={TableColumnsList.CancelledOrders}
              isLoading={get(props, "loading", false)}
              isCleared={isCleared}
              isGlobalFilterEnabled={true}
              onFilter={(payload) => fetchSalesOrders({ ...defaultRequestOptions, searchable_columns: payload })}
              onReset={() => fetchSalesOrders(defaultRequestOptions)}
              handleEdit={(record, type, custom) => handleEditAction(record, type, custom)}
            />
          </div>
        </ErrorBoundary>
      </div>
    </>
  );
};

export default connect(
  (state) => ({
    loading: get(state, "salesOrder.cancelledSalesOrderLoading", false),
    error: get(state, "salesOrder.failure", false),
  }),
  { getCasedGoods, getCancelledSalesOrderRequest, cancelSalesOrdersRequest }
)(CancelledSalesOrder);
