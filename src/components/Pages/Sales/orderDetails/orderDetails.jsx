import { CheckOutlined, EditOutlined, PlusOutlined, PrinterOutlined } from "@ant-design/icons";
import ErrorBoundary from "@components/UIComponents/ErrorBoundary";
import { getRequestHeader } from "@helpers/service";
import { CustomInputTextArea as InputTextArea } from "@ui-components/Input/customInput";
import TableUI from "@ui-components/Table";
import CustomTable from "@ui-components/Table/customTable";
import { openNotificationWithIcon } from "@ui-components/Toast/notification";
import { Button, Col, Row, Spin, Tag, Tooltip, Typography } from "antd";
import axios from "axios";
import { cloneDeep, filter, findIndex, get, round } from "lodash";
import React from "react";
import { isPossiblePhoneNumber } from "react-phone-number-input";
import validator from "validator";
import { isMobileOrTab, TableColumnsList } from "../../../../constants";
import { base64toBlob, getScreenSize, numberWithCommas } from "../../../../helpers/utility";
import AddAdditionalCharges from "../addAdditionalCharges";
import AddSpiritModal from "../addSpirits";
import EditExistingOrderModal from "../editExistingOrder";
import { getCountByKey } from "../helper";
import ApproveFOCModal from "./approvalModalFOC";
import EditRotationNumber from "./editRotationNumber";
import { getOrderDetailsColumns } from "./getOrderItemsColumns";
import "./index.scss";
import { CustomerAccountDetails, DeliveryDetails, ShippingDetails } from "./staticValues";
import UpdateModal from "./updateModal";
const { Text } = Typography;
/**
 * Renders Order Details Component
 */
const OrderListDetails = (props) => {
  const {
    metaColumnInfo: { permissions },
  } = props;
  const [shippingDetailsData, setShippingDetails] = React.useState(ShippingDetails);
  const [addSpiritsLoader, setAddSpiritsLoader] = React.useState(false);
  const [orderDetailsUpdateLoader, setOrderDetailsUpdateLoader] = React.useState(false);
  const [error, updateError] = React.useState({});

  const [isRotationNumberEditable, setIsRotationNumberEditable] = React.useState(false);
  const [isChanged, setIsChanged] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [editOrderModalVisible, setEditOrderModalVisible] = React.useState(false);
  const [currentOrderSelected, setCurrentOrderSelected] = React.useState(null);
  const [addAdditionalChargesModal, setAddAdditionalChargesModal] = React.useState(false);
  const [orderItemsList, setOrderItemsList] = React.useState([]);
  const [existingOrderItemsList, setExistingOrderItemsList] = React.useState([]);
  const [selectedAdditionalChargeItem, setSelectedAdditionalChargeItem] = React.useState(null);
  const [notes, setNotes] = React.useState("");
  const [special_conditions, setSpecialConditions] = React.useState("");
  const [updatedAvailableData, setUpdatedAvailableData] = React.useState({});
  const [updateModalInfo, setUpdateModalInfo] = React.useState({ type: "", title: "", visible: false });
  const [approveFOCModalStatus, setApproveFOCModalStatus] = React.useState(false);

  const handleChange = React.useCallback(
    (key, value) => {
      let tempObjError = { ...error };
      tempObjError[key] = false;
      updateError(tempObjError);

      const evaluatedValue = value ? value : "";
      let newData = { ...updatedAvailableData };
      newData[key] = evaluatedValue;
      setIsChanged(true);
      if (key === "country") {
        newData["state"] = "";
        newData["city"] = "";
      }
      if (key === "state") {
        newData["city"] = "";
      }

      setUpdatedAvailableData(newData);
    },
    [updatedAvailableData]
  );

  const getNewSpiritsColumns = () => {
    // let columns = cloneDeep(get(props, "metaColumnInfo.column_info", []));
    // remove(columns, function (o) {
    //   return get(o, "key_name") === "s_no" || get(o, "key_name") === "rotation_number";
    // });
    // return columns;
    return cloneDeep(get(props, "metaColumnInfo.add_spirits_interim_column_info", []));
  };

  const calculateTotalCases = (spiritAdded) => {
    const totalCases = getCountByKey(spiritAdded, "quantity");
    return totalCases;
  };

  const calculateTotalOrderValue = (spiritAdded, action = "add") => {
    const totalSpiritValue = getCountByKey(spiritAdded, "price_after_discount");
    if (action === "add") {
      return round(totalSpiritValue, 2);
    }
    if (action === "delete") {
      return round(totalSpiritValue + Number(get(props, "total_additional_value", 0)), 2);
    }
  };

  const handleSaveSpecialConditions = async () => {
    if (get(props, "special_conditions") !== special_conditions) {
      const rest = await axios({
        method: "POST",
        data: {
          sales_order_id: get(props, "sales_order_id"),
          special_conditions,
        },
        url: `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/update_special_conditions`,
        headers: { ...getRequestHeader() },
      }).catch((err) => {
        openNotificationWithIcon("error", `${get(err, "response.data.message", "Something Went Wrong")} `);
      });

      if (get(rest, "data.status")) {
        setSpecialConditions("");
        props.refetchSalesOrderData();
        openNotificationWithIcon("success", get(rest, "data.message", "Special Conditions updated"));
      }
    } else {
      openNotificationWithIcon("info", "Special Conditions", "Nothing to update");
    }
  };

  const handleSaveNotes = async () => {
    if (get(props, "notes") !== notes) {
      const rest = await axios({
        method: "POST",
        data: {
          sales_order_id: get(props, "sales_order_id"),
          notes,
        },
        url: `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/update_notes`,
        headers: { ...getRequestHeader() },
      }).catch((err) => {
        openNotificationWithIcon("error", `${get(err, "response.data.message", "Something Went Wrong")} `);
      });

      if (get(rest, "data.status")) {
        setNotes("");
        props.refetchSalesOrderData();
        openNotificationWithIcon("success", get(rest, "data.message", "Notes Added successfully"));
      }
    } else {
      openNotificationWithIcon("info", "Notes", "Nothing to update");
    }
  };

  const handleDeleteAction = async (record) => {
    const items_list = filter(get(props, "items", []), function (o) {
      return get(o, "item_id") !== get(record, "item_id");
    });

    const rest = await axios({
      method: "DELETE",
      data: {
        item_id: get(record, "item_id"),
        sales_order_id: get(props, "sales_order_id"),
        total_case: calculateTotalCases(items_list),
        total_order_value: calculateTotalOrderValue(items_list, "delete"),
      },
      url: `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/delete_spirit`,
      headers: { ...getRequestHeader() },
    }).catch((err) => {
      openNotificationWithIcon("error", "Order Items", `${get(err, "response.data.message", "Something Went Wrong")} `);
    });

    if (get(rest, "data.status")) {
      props.refetchSalesOrderData();
      openNotificationWithIcon("success", "Order Items", get(rest, "data.message", "Order Items updated successfully"));
    }

    if (!get(rest, "data.status")) {
      openNotificationWithIcon("error", "Order Items", get(rest, "data.message", "Something Went Wrong"));
    }
  };

  const handleAddedSpiritsReset = () => {
    setOrderItemsList({ items: [], sales_order_id: get(props, "sales_order_id") });
  };

  const handleUpdateOrderDetailsSubmit = async () => {
    let tempErrorObj = { ...error };

    if (get(updateModalInfo, "type") === "shipping_details") {
      let returnValShipping = true;

      if (get(updatedAvailableData, "shipper_phone_no") && !isPossiblePhoneNumber(get(updatedAvailableData, "shipper_phone_no", ""))) {
        tempErrorObj["shipper_phone_no"] = true;
        returnValShipping = false;
      }

      if (get(updatedAvailableData, "shipper_email") && !validator.isEmail(get(updatedAvailableData, "shipper_email"))) {
        tempErrorObj["shipper_email"] = true;
        returnValShipping = false;
      }

      if (!returnValShipping) {
        updateError(tempErrorObj);
        setOrderDetailsUpdateLoader(false);
        return false;
      }
    }

    if (get(updateModalInfo, "type") === "delivery_details") {
      let returnVal = true;

      if (validator.isEmpty(get(updatedAvailableData, "contact_name"))) {
        tempErrorObj["contact_name"] = true;
        returnVal = false;
      }

      if (!isPossiblePhoneNumber(get(updatedAvailableData, "phone_no", ""))) {
        tempErrorObj["phone_no"] = true;
        returnVal = false;
      }

      if (!validator.isEmail(get(updatedAvailableData, "email"))) {
        tempErrorObj["email"] = true;
        returnVal = false;
      }

      if (validator.isEmpty(get(updatedAvailableData, "delivery_address1"))) {
        tempErrorObj["delivery_address1"] = true;
        returnVal = false;
      }

      if (validator.isEmpty(get(updatedAvailableData, "country"))) {
        tempErrorObj["country"] = true;
        returnVal = false;
      }

      if (validator.isEmpty(get(updatedAvailableData, "state"))) {
        tempErrorObj["state"] = true;
        returnVal = false;
      }

      if (validator.isEmpty(get(updatedAvailableData, "city"))) {
        tempErrorObj["city"] = true;
        returnVal = false;
      }

      if (!returnVal) {
        setOrderDetailsUpdateLoader(false);
        updateError(tempErrorObj);
        return returnVal;
      }
    }

    if (isChanged) {
      const rest = await axios({
        method: "POST",
        data: {
          sales_order_id: get(props, "sales_order_id"),
          [get(updateModalInfo, "type")]: updatedAvailableData,
        },
        url: `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/update_order_details`,
        headers: { ...getRequestHeader() },
      }).catch((err) => {
        setOrderDetailsUpdateLoader(false);
        openNotificationWithIcon("error", "Order Details", `${get(err, "response.data.message", "Something Went Wrong")} `);
      });

      if (get(rest, "data.status")) {
        setOrderDetailsUpdateLoader(false);
        setUpdateModalInfo({ type: "", title: "", visible: false });
        props.refetchSalesOrderData();
        openNotificationWithIcon("success", "Order Details", get(rest, "data.message", "Order Details updated successfully"));
      }

      if (!get(rest, "data.status", true)) {
        setOrderDetailsUpdateLoader(false);
        openNotificationWithIcon("error", "Order Details", get(rest, "data.message", "Something Went Wrong"));
      }
    } else {
      setOrderDetailsUpdateLoader(false);
      openNotificationWithIcon("info", "Order Details", "Nothing to update");
    }
  };

  const handleUpdateRotationNumberSubmit = async (reqDetails) => {
    if (get(reqDetails, "isChanged", false)) {
      const rest = await axios({
        method: "POST",
        data: {
          item_id: get(reqDetails, "item_id", ""),
          rotation_number: get(reqDetails, "rotation_number", ""),
        },
        url: `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/update_rotation_number`,
        headers: { ...getRequestHeader() },
      }).catch((err) => {
        openNotificationWithIcon("error", "Rotation Number", `${get(err, "response.data.message", "Something Went Wrong")} `);
      });

      if (get(rest, "data.status")) {
        props.refetchSalesOrderData();
        openNotificationWithIcon("success", "Rotation Number", get(rest, "data.message", "Shipping Details updated successfully"));
      }
    } else {
      openNotificationWithIcon("info", "Rotation Number", "Nothing to update");
    }
  };

  const handlePrintPackingListDownload = async () => {
    const rest = await axios({
      method: "GET",
      url: `${process.env.REACT_APP_API_ENDPOINT}/api/getPackagingListPdf/${get(props, "sales_order_id")}`,
      headers: { ...getRequestHeader() },
    }).catch((err) => {
      openNotificationWithIcon("error", "Packing List", `${get(err, "response.data.message", "Something Went Wrong")} `);
    });

    if (get(rest, "status") === 200) {
      const blob = base64toBlob(get(rest, "data.pdf"), "application/pdf");
      window.open(URL.createObjectURL(blob), "_new");
    }
  };

  const handleSpiritsAdded = (requestPayload) => {
    setOrderItemsList(requestPayload);
  };

  const handleResetOrderDetailsUpdate = () => {
    getDataWrapper();
  };

  const handleDataUpdate = (dataList, key) => {
    let newData = { ...dataList };
    Object.keys(dataList).map((data) => {
      newData[data] = get(props, `${key}.${data}`, "");
    });

    if (get(updateModalInfo, "type") === "delivery_details") {
      newData["is_member_of_european_union"] = get(props, "is_member_of_european_union", "");
      newData["eori_no"] = get(props, "customer_details.eori_no", "");
    }

    updateError({});
    setUpdatedAvailableData(newData);
  };

  React.useEffect(() => {
    let newData = { ...shippingDetailsData };
    Object.keys(ShippingDetails).map((data) => {
      newData[data] = get(props, `shipping_details.${data}`, "");
    });
    setShippingDetails(newData);
  }, [props]);

  React.useEffect(() => {
    setExistingOrderItemsList(getOrderDetailsColumns(get(props, "items", [])));
  }, [props]);

  const handleSpiritUpdate = async () => {
    if (get(orderItemsList, "items", []).length > 0) {
      let requestPayload = { ...orderItemsList };

      const addSpiritResponse = await axios({
        method: "POST",
        data: { ...requestPayload },
        url: `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/add_spirits`,
        headers: { ...getRequestHeader() },
      }).catch((err) => {
        setAddSpiritsLoader(false);
        openNotificationWithIcon("error", "Order Details", `${get(err, "response.data.message", "Something Went Wrong")} `);
      });

      if (get(addSpiritResponse, "error", false)) {
        openNotificationWithIcon("error", "Order Details", `${get(addSpiritResponse, "data.message", "Something Went Wrong")} `);
      }

      if (get(addSpiritResponse, "data.status")) {
        setAddSpiritsLoader(false);
        setOrderItemsList([]);
        openNotificationWithIcon("success", "Order Details", `${get(addSpiritResponse, "data.message", "Added Spirits Successfully")} `);
        props.refetchSalesOrderData();
      }

      if (!get(addSpiritResponse, "data.status")) {
        setAddSpiritsLoader(false);
        openNotificationWithIcon("error", "Order Details", `${get(addSpiritResponse, "data.message", "Something Went Wrong")} `);
      }
    } else {
      setAddSpiritsLoader(false);
      openNotificationWithIcon("info", "Order Details", "Nothing to update");
    }
  };

  const handleAddAdditionalChargesDetails = async (data, isChanged = false) => {
    let total_order_value = Number(get(data, "total_cost")) + Number(get(props, "total_order_value"));
    if (get(data, "action") === "delete") {
      total_order_value = Number(get(props, "total_order_value")) - Number(get(data, "total_cost"));
    }
    if (isChanged) {
      const rest = await axios({
        method: "POST",
        data: {
          sales_order_id: get(props, "sales_order_id"),
          additional_charges: [data],
          total_order_value,
        },
        url: `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/update_additional_charges`,
        headers: { ...getRequestHeader() },
      }).catch((err) => {
        openNotificationWithIcon("error", `${get(err, "response.data.message", "Something Went Wrong")} `);
      });

      if (get(rest, "data.status")) {
        openNotificationWithIcon("success", get(rest, "data.message", "Additional Charges Added successfully"));
        props.refetchSalesOrderData();
      }
    } else {
      openNotificationWithIcon("info", "Additional charges not found Or Nothing to update");
    }
  };

  const handleEditExistingSpiritKeyChange = (record, key, custom) => {
    setCurrentOrderSelected(record);

    if (get(custom, "actionType") === "edit") {
      setEditOrderModalVisible(true);
    }

    if (key === "rotation_number") {
      setIsRotationNumberEditable(true);
    }
  };

  const handleEditSpiritKeyChange = (record, key, custom) => {
    let addedSpiritsKeyUpdate = get(orderItemsList, "items", []);

    const getIndex = findIndex(addedSpiritsKeyUpdate, function (o) {
      return get(o, "hash") === get(record, "hash");
    });

    if (getIndex > -1) {
      if (get(custom, "isDelete", false)) {
        addedSpiritsKeyUpdate.splice(getIndex, 1);
      }
      if (get(custom, "isEditable", false) || get(custom, "actionType") === "enter" || get(custom, "actionType") === "blur") {
        addedSpiritsKeyUpdate[getIndex] = {
          ...record,
          [key]: {
            isEditable: get(custom, "isEditable", false),
            componentType: "inputText",
            value: get(custom, "value") ? get(custom, "value") : get(record, "rotation_number.value", ""),
          },
        };
      }
      const updateItems = {
        ...orderItemsList,
        items: addedSpiritsKeyUpdate,
      };
      setOrderItemsList(updateItems);
    }
  };

  const handleAdditionalChargesEdit = (record, type) => {
    if (type === "edit") {
      setSelectedAdditionalChargeItem({ record, type });
      setAddAdditionalChargesModal(true);
    }
    if (type === "delete") {
      const requestPayload = {
        id: get(record, "id"),
        total_cost: get(record, "total_cost"),
        action: "delete",
      };
      handleAddAdditionalChargesDetails(requestPayload, true);
    }
  };

  const getAdditionColumnsList = () => {
    let columnsInfo = [...get(props, "metaColumnInfo.additional_charges_column_info", [])];
    if (get(props, "sales_order_type", "sales_order") === "sales_order") {
      columnsInfo = filter(columnsInfo, function (o) {
        return o["key_name"] !== "action";
      });
    }
    return columnsInfo;
  };

  React.useEffect(() => {
    setNotes(get(props, "notes", ""));
  }, [props.notes]);

  React.useEffect(() => {
    setSpecialConditions(get(props, "special_conditions", ""));
  }, [props.special_conditions]);

  React.useEffect(() => {
    getDataWrapper();
  }, [updateModalInfo]);

  const getDataWrapper = () => {
    if (get(updateModalInfo, "type") === "shipping_details") {
      handleDataUpdate(ShippingDetails, "shipping_details");
    }

    if (get(updateModalInfo, "type") === "delivery_details") {
      handleDataUpdate(DeliveryDetails, "shipping_details");
    }

    if (get(updateModalInfo, "type") === "customer_info") {
      handleDataUpdate(CustomerAccountDetails, "customer_details");
    }
  };

  const getCount = React.useCallback(() => {
    let responseData = [...get(props, "items", [])];
    const freeItems = filter(responseData, function (o) {
      return get(o, "free_item", "").toLowerCase() === "yes";
    });
    return { totalCount: responseData.length, freeItemsCount: freeItems.length };
  }, [props]);

  const FOCItems = get(props, "items", []).filter((list) => {
    return get(list, "free_item", "").toLowerCase() === "yes";
  });

  const getActionFOCPermission = () => {
    return get(permissions, "add_foc_items");
  };

  const getFOCText = () => {
    if (get(props, "free_item_approved", "").toLowerCase() === "na") return "Not Available";
    if (get(props, "free_item_approved", "").toLowerCase() === "yes") return "Approved";
    if (get(props, "free_item_approved", "").toLowerCase() === "no") return "to be Approved";
  };

  return (
    <>
      <ErrorBoundary>
        <Spin spinning={get(props, "loading", false)}>
          <>
            <UpdateModal
              modalInfo={updateModalInfo}
              onClose={() => setUpdateModalInfo({ type: "", visible: false, title: "" })}
              availableData={updatedAvailableData}
              error={error}
              shippingDetailsData={shippingDetailsData}
              isLoading={orderDetailsUpdateLoader}
              handleReset={() => handleResetOrderDetailsUpdate()}
              handleSubmit={() => {
                setOrderDetailsUpdateLoader(true);
                handleUpdateOrderDetailsSubmit();
              }}
              handleChange={(key, value) => handleChange(key, value)}
            />

            <AddSpiritModal
              visible={visible}
              isFOCEditable={getActionFOCPermission()}
              setVisible={setVisible}
              refetchSalesOrderData={() => props.refetchSalesOrderData()}
              addedSpiritsDetails={{
                sales_order_id: get(props, "sales_order_id"),
                items: get(orderItemsList, "items", []),
              }}
              handleSpiritsAdded={handleSpiritsAdded}
            />

            {isRotationNumberEditable && (
              <EditRotationNumber
                isModalVisible={isRotationNumberEditable}
                title={`Edit Rotation Number - Order Id: # ${get(props, "sales_order_id", "")}`}
                record={currentOrderSelected}
                orderId={get(props, "sales_order_id", "")}
                handleCancel={() => {
                  setIsRotationNumberEditable(false);
                }}
                handleSubmit={() => {
                  props.refetchSalesOrderData();
                  setIsRotationNumberEditable(false);
                }}
              />
            )}

            <EditExistingOrderModal
              visible={editOrderModalVisible}
              isFOCEditable={getActionFOCPermission()}
              sales_order_id={get(props, "sales_order_id")}
              setVisible={setEditOrderModalVisible}
              record={currentOrderSelected}
              refetchSalesOrderData={() => props.refetchSalesOrderData()}
            />

            <ApproveFOCModal
              refetchSalesOrderData={() => props.refetchSalesOrderData()}
              sales_order_id={get(props, "sales_order_id")}
              isOpen={approveFOCModalStatus}
              handleClose={() => setApproveFOCModalStatus(false)}
              items={FOCItems}
            />

            <AddAdditionalCharges
              isOpen={addAdditionalChargesModal}
              selectedRecord={get(selectedAdditionalChargeItem, "record")}
              title={get(selectedAdditionalChargeItem, "type") === "edit" ? `Edit Additional Charges - # ${get(selectedAdditionalChargeItem, "record.id", "")}` : "Add Additional Charges"}
              okText={get(selectedAdditionalChargeItem, "type") === "edit" ? "Update" : "Add"}
              actionType={get(selectedAdditionalChargeItem, "type") === "edit" ? "update" : "add"}
              handleClose={() => {
                setAddAdditionalChargesModal(false);
                setSelectedAdditionalChargeItem(null);
              }}
              handleSubmit={(data, isChanged) => handleAddAdditionalChargesDetails(data, isChanged)}
            />
            <div className="orderList__orderDetails">
              <Row style={{ fontSize: "0.9rem" }}>
                <Col xs={{ span: 24 }}>
                  <div className="d-flex justify-content-between">
                    <span style={{ fontWeight: 500, fontSize: 16 }} className="mb-2">
                      Customer Info 1
                    </span>
                  </div>
                  <hr style={{ backgroundColor: "#ccd5df", margin: "5px 0 10px" }} />
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
                  <Text type="secondary">Customer Name:</Text>
                  <Tooltip placement="topLeft" title={get(props, "customer_details.customer_name", "NA")}>
                    <p> {get(props, "customer_details.customer_name", "NA")} </p>
                  </Tooltip>
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
                  <Text type="secondary">Customer Number:</Text>
                  <Tooltip placement="topLeft" title={get(props, "customer_details.customer_number", "NA")}>
                    <p> {get(props, "customer_details.customer_number", "NA")} </p>
                  </Tooltip>
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
                  <Text type="secondary">Customer Email:</Text>
                  <Tooltip placement="topLeft" title={get(props, "customer_details.customer_email", "NA")}>
                    <p> {get(props, "customer_details.customer_email", "NA")} </p>
                  </Tooltip>
                </Col>

                <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
                  <Text type="secondary">Invoice Address 1:</Text>
                  <Tooltip placement="topLeft" title={get(props, "customer_details.invoice_address1", "NA") ? get(props, "customer_details.invoice_address1", "NA") : "NA"}>
                    <p> {get(props, "customer_details.invoice_address1", "NA") ? get(props, "customer_details.invoice_address1", "NA") : " NA"} </p>
                  </Tooltip>
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
                  <Text type="secondary">Invoice Address 2:</Text>
                  <Tooltip placement="topLeft" title={get(props, "customer_details.invoice_address2", "NA") ? get(props, "customer_details.invoice_address2", "NA") : "NA"}>
                    <p> {get(props, "customer_details.invoice_address2", "NA") ? get(props, "customer_details.invoice_address2", "NA") : "NA"} </p>
                  </Tooltip>
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
                  <Text type="secondary">Postal Code:</Text>
                  <Tooltip placement="topLeft" title={get(props, "customer_details.postal_code", "NA") ? get(props, "customer_details.postal_code", "NA") : "NA"}>
                    <p> {get(props, "customer_details.postal_code", "NA") ? get(props, "customer_details.postal_code", "NA") : "NA"} </p>
                  </Tooltip>
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
                  <Text type="secondary">Country:</Text>
                  <Tooltip placement="topLeft" title={get(props, "customer_details.country", "NA") ? get(props, "customer_details.country", "NA") : "NA"}>
                    <p> {get(props, "customer_details.country", "NA") ? get(props, "customer_details.country", "NA") : "NA"} </p>
                  </Tooltip>
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
                  <Text type="secondary">State:</Text>
                  <Tooltip placement="topLeft" title={get(props, "customer_details.state", "NA") ? get(props, "customer_details.state", "NA") : "NA"}>
                    <p> {get(props, "customer_details.state", "NA") ? get(props, "customer_details.state", "NA") : "NA"} </p>
                  </Tooltip>
                </Col>
                <Col xs={{ span: 20 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
                  <Text type="secondary">City:</Text>
                  <Tooltip placement="topLeft" title={get(props, "customer_details.city", "NA") ? get(props, "customer_details.city", "NA") : "NA"}>
                    <p> {get(props, "customer_details.city", "NA") ? get(props, "customer_details.city", "NA") : "NA"} </p>
                  </Tooltip>
                </Col>
              </Row>

              <Row style={{ fontSize: "0.9rem" }}>
                <Col xs={{ span: 24 }}>
                  <div className="d-flex justify-content-between">
                    <span style={{ fontWeight: 500, fontSize: 16 }} className="mb-2">
                      Customer Info 2
                    </span>
                    {get(permissions, "update_customer_info") && (
                      <Button
                        icon={<EditOutlined />}
                        type="primary"
                        onClick={() => {
                          setUpdatedAvailableData(get(props, "customer_details", {}));
                          setUpdateModalInfo({ type: "customer_info", visible: true, title: "Edit Customer Info" });
                        }}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                  <hr style={{ backgroundColor: "#ccd5df", margin: "5px 0 10px" }} />
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
                  <Text type="secondary">Account Code:</Text>
                  <Tooltip placement="topLeft" title={get(props, "customer_details.account_code", "NA") ? get(props, "customer_details.account_code", "NA") : "NA"}>
                    <p> {get(props, "customer_details.account_code", "NA") ? get(props, "customer_details.account_code", "NA") : "NA"} </p>
                  </Tooltip>
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
                  <Text type="secondary">VAT No:</Text>
                  <Tooltip placement="topLeft" title={get(props, "customer_details.vat_no", "NA" ? get(props, "customer_details.vat_no", "NA") : "NA")}>
                    <p> {get(props, "customer_details.vat_no", "NA") ? get(props, "customer_details.vat_no", "NA") : "NA"} </p>
                  </Tooltip>
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
                  <Text type="secondary">Payment Terms:</Text>
                  <Tooltip placement="topLeft" title={get(props, "customer_details.payment_terms", "NA") ? get(props, "customer_details.payment_terms", "NA") : "NA"}>
                    <p>{get(props, "customer_details.payment_terms", "NA") ? get(props, "customer_details.payment_terms", "NA").toUpperCase() : "NA"}</p>
                  </Tooltip>
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
                  <Text type="secondary">Customer PO No.:</Text>
                  <Tooltip placement="topLeft" title={get(props, "customer_details.customer_po_no", "NA") ? get(props, "customer_details.customer_po_no", "NA") : "NA"}>
                    <p> {get(props, "customer_details.customer_po_no", "NA") ? get(props, "customer_details.customer_po_no", "NA") : "NA"} </p>
                  </Tooltip>
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
                  <Text type="secondary">Warehouse No.:</Text>
                  <Tooltip placement="topLeft" title={get(props, "customer_details.warehouse_no", "NA") ? get(props, "customer_details.warehouse_no", "NA") : "NA"}>
                    <p> {get(props, "customer_details.warehouse_no", "NA") ? get(props, "customer_details.warehouse_no", "NA") : "NA"} </p>
                  </Tooltip>
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
                  <Text type="secondary">EORI No.:</Text>
                  <Tooltip placement="topLeft" title={get(props, "customer_details.eori_no", "NA") ? get(props, "customer_details.eori_no", "NA") : "NA"}>
                    <p> {get(props, "customer_details.eori_no", "NA") ? get(props, "customer_details.eori_no", "NA") : "NA"} </p>
                  </Tooltip>
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
                  <Text type="secondary">Excise Registration No.:</Text>
                  <Tooltip placement="topLeft" title={get(props, "customer_details.excise_registration_no", "NA") ? get(props, "customer_details.excise_registration_no", "NA") : "NA"}>
                    <p>{get(props, "customer_details.excise_registration_no", "NA") ? get(props, "customer_details.excise_registration_no", "NA") : "NA"}</p>
                  </Tooltip>
                </Col>
              </Row>
              <Row style={{ fontSize: "0.9rem" }}>
                <Col xs={{ span: 24 }}>
                  <div className="d-flex justify-content-between">
                    <span style={{ fontWeight: 500, fontSize: 16 }} className="mb-2">
                      Delivery Details
                    </span>
                    {get(permissions, "update_delivery_details") && (
                      <Button
                        icon={<EditOutlined />}
                        type="primary"
                        onClick={() => {
                          setUpdatedAvailableData(get(props, "shipping_details", {}));
                          setUpdateModalInfo({ type: "delivery_details", visible: true, title: "Edit Delivery Details" });
                        }}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                  <hr style={{ backgroundColor: "#ccd5df", margin: "5px 0 10px" }} />
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
                  <Text type="secondary">Contact Name:</Text>
                  <Tooltip placement="topLeft" title={get(props, "shipping_details.contact_name", "NA") ? get(props, "shipping_details.contact_name", "NA") : "NA"}>
                    <p> {get(props, "shipping_details.contact_name", "NA") ? get(props, "shipping_details.contact_name", "NA") : "NA"} </p>
                  </Tooltip>
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
                  <Text type="secondary">Phone Number:</Text>
                  <Tooltip placement="topLeft" title={get(props, "shipping_details.phone_no", "NA")}>
                    <p> {get(props, "shipping_details.phone_no", "NA")} </p>
                  </Tooltip>
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
                  <Text type="secondary">Email:</Text>
                  <Tooltip placement="topLeft" title={get(props, "shipping_details.email", "NA") ? get(props, "shipping_details.email", "NA") : "NA"}>
                    <p> {get(props, "shipping_details.email", "NA") ? get(props, "shipping_details.email", "NA") : "NA"} </p>
                  </Tooltip>
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
                  <Text type="secondary">Delivery Address 1:</Text>
                  <Tooltip placement="topLeft" title={get(props, "shipping_details.delivery_address1", "NA") ? get(props, "shipping_details.delivery_address1", "NA") : "NA"}>
                    <p> {get(props, "shipping_details.delivery_address1", "NA") ? get(props, "shipping_details.delivery_address1", "NA") : "NA"} </p>
                  </Tooltip>
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
                  <Text type="secondary">Delivery Address 2:</Text>
                  <Tooltip placement="topLeft" title={get(props, "shipping_details.delivery_address2", "NA") ? get(props, "shipping_details.delivery_address2", "NA") : "NA"}>
                    <p> {get(props, "shipping_details.delivery_address2", "NA") ? get(props, "shipping_details.delivery_address2", "NA") : "NA"} </p>
                  </Tooltip>
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
                  <Text type="secondary">Postal Code:</Text>
                  <Tooltip placement="topLeft" title={get(props, "shipping_details.postal_code", "NA") ? get(props, "shipping_details.postal_code", "NA") : "NA"}>
                    <p> {get(props, "shipping_details.postal_code", "NA") ? get(props, "shipping_details.postal_code", "NA") : "NA"} </p>
                  </Tooltip>
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
                  <Text type="secondary">Country:</Text>
                  <Tooltip placement="topLeft" title={get(props, "shipping_details.country", "NA") ? get(props, "shipping_details.country", "NA") : "NA"}>
                    <p> {get(props, "shipping_details.country", "NA") ? get(props, "shipping_details.country", "NA") : "NA"} </p>
                  </Tooltip>
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
                  <Text type="secondary">State:</Text>
                  <Tooltip placement="topLeft" title={get(props, "shipping_details.state", "NA") ? get(props, "shipping_details.state", "NA") : "NA"}>
                    <p> {get(props, "shipping_details.state", "NA") ? get(props, "shipping_details.state", "NA") : "NA"} </p>
                  </Tooltip>
                </Col>
                <Col xs={{ span: 20 }} sm={{ span: 6 }} md={{ span: 12 }} lg={{ span: 6 }}>
                  <Text type="secondary">City:</Text>
                  <Tooltip placement="topLeft" title={get(props, "shipping_details.city", "NA") ? get(props, "shipping_details.city", "NA") : "NA"}>
                    <p> {get(props, "shipping_details.city", "NA") ? get(props, "shipping_details.city", "NA") : "NA"} </p>
                  </Tooltip>
                </Col>
              </Row>
            </div>
            <div className="common_card_section">
              <div className="new-sales-order">
                <Row>
                  <Col xs={{ span: 24 }}>
                    <div className="d-flex justify-content-between">
                      <span style={{ fontWeight: 500, fontSize: 16 }} className="mb-2">
                        Shipping Details
                      </span>
                      {get(permissions, "update_shipping_details") && (
                        <Button
                          icon={<EditOutlined />}
                          type="primary"
                          onClick={() => {
                            setUpdatedAvailableData(shippingDetailsData);
                            setUpdateModalInfo({ type: "shipping_details", visible: true, title: "Edit Shipping Details" });
                          }}
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                    <hr style={{ backgroundColor: "#ccd5df", margin: "5px 0 10px" }} />
                  </Col>
                  <Col xs={{ span: 24 }} sm={{ span: 7 }} md={{ span: 11 }} lg={{ span: 7 }}>
                    <Text type="secondary">Shipper Contact Name:</Text>
                    <Tooltip placement="topLeft" title={get(shippingDetailsData, "shipper_contact_name", "NA") ? get(shippingDetailsData, "shipper_contact_name", "NA") : "NA"}>
                      <p>{get(shippingDetailsData, "shipper_contact_name", "NA") ? get(shippingDetailsData, "shipper_contact_name", "NA") : "NA"} </p>
                    </Tooltip>
                  </Col>
                  <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 11, offset: 2 }} lg={{ span: 7, offset: 1 }}>
                    <Text type="secondary">Shipper Phone No:</Text>
                    <Tooltip placement="topLeft" title={get(shippingDetailsData, "shipper_phone_no", "NA") ? get(shippingDetailsData, "shipper_phone_no", "NA") : "NA"}>
                      <p>{get(shippingDetailsData, "shipper_phone_no", "NA") ? get(shippingDetailsData, "shipper_phone_no", "NA") : "NA"} </p>
                    </Tooltip>
                  </Col>
                  <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 11, offset: 0 }} lg={{ span: 7, offset: 1 }}>
                    <Text type="secondary">Shipper Email:</Text>
                    <Tooltip placement="topLeft" title={get(shippingDetailsData, "shipper_email", "NA") ? get(shippingDetailsData, "shipper_email", "NA") : "NA"}>
                      <p>{get(shippingDetailsData, "shipper_email", "NA") ? get(shippingDetailsData, "shipper_email", "NA") : "NA"} </p>
                    </Tooltip>
                  </Col>
                  <Col xs={{ span: 24 }} sm={{ span: 7 }} md={{ span: 11, offset: 2 }} lg={{ span: 7, offset: 0 }}>
                    <Text type="secondary">Shipper Details 1:</Text>
                    <Tooltip placement="topLeft" title={get(shippingDetailsData, "shipper_details1", "NA") ? get(shippingDetailsData, "shipper_details1", "NA") : "NA"}>
                      <p>{get(shippingDetailsData, "shipper_details1", "NA") ? get(shippingDetailsData, "shipper_details1", "NA") : "NA"} </p>
                    </Tooltip>
                  </Col>
                  <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 11, offset: 0 }} lg={{ span: 7, offset: 1 }}>
                    <Text type="secondary">Shipper Details 2:</Text>
                    <Tooltip placement="topLeft" title={get(shippingDetailsData, "shipper_details2", "NA") ? get(shippingDetailsData, "shipper_details2", "NA") : "NA"}>
                      <p>{get(shippingDetailsData, "shipper_details2", "NA") ? get(shippingDetailsData, "shipper_details2", "NA") : "NA"} </p>
                    </Tooltip>
                  </Col>
                  <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 11, offset: 2 }} lg={{ span: 7, offset: 1 }}>
                    <Text type="secondary">Who Organizes:</Text>
                    <Tooltip placement="topLeft" title={get(shippingDetailsData, "who_organizes", "NA") ? get(shippingDetailsData, "who_organizes", "NA") : "NA"}>
                      <p>{get(shippingDetailsData, "who_organizes", "NA") ? get(shippingDetailsData, "who_organizes", "NA") : "NA"} </p>
                    </Tooltip>
                  </Col>
                  <Col xs={{ span: 24 }} sm={{ span: 7 }} md={{ span: 11 }} lg={{ span: 7 }}>
                    <Text type="secondary">Shipping Date:</Text>
                    <Tooltip placement="topLeft" title={get(shippingDetailsData, "shipping_date", "NA") ? get(shippingDetailsData, "shipping_date", "NA") : "NA"}>
                      <p>{get(shippingDetailsData, "shipping_date", "NA") ? get(shippingDetailsData, "shipping_date", "NA") : "NA"} </p>
                    </Tooltip>
                  </Col>
                  <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 11, offset: 2 }} lg={{ span: 7, offset: 1 }}>
                    <Text type="secondary">Shipping Term:</Text>
                    <Tooltip placement="topLeft" title={get(shippingDetailsData, "shipping_term", "NA") ? get(shippingDetailsData, "shipping_term", "NA") : "NA"}>
                      <p>{get(shippingDetailsData, "shipping_term", "NA") ? get(shippingDetailsData, "shipping_term", "NA") : "NA"} </p>
                    </Tooltip>
                  </Col>
                </Row>
              </div>
            </div>

            <div className="common_card_section">
              <Text className={getScreenSize() > isMobileOrTab ? "d-flex align-items-center justify-content-between" : ""}>
                <span className="d-flex align-items-center m-0">
                  <span style={{ fontWeight: 500, fontSize: 16, marginRight: 20 }}> Order List </span>
                </span>
                {/* <label>
                  <InfoCircleOutlined />
                  <span className="pl-2" dangerouslySetInnerHTML={{ __html: staticTextInventory }} />
                </label> */}
                <span style={{ margin: "0 0 5px 0" }} className="d-flex align-items-center">
                  {getCount().freeItemsCount > 0 && (
                    <b>
                      FOC Items {getFOCText()} - <Tag color="processing"> {getCount().freeItemsCount}</Tag>
                    </b>
                  )}
                  {get(permissions, "approve_foc_items") && (
                    <Button className="float-right ml-2" style={{ position: "relative", zIndex: 8 }} icon={<CheckOutlined />} type="link" onClick={() => setApproveFOCModalStatus(true)}>
                      Approve Free Items
                    </Button>
                  )}
                  {get(permissions, "add_items") && (
                    <Button className="float-right ml-2" style={{ position: "relative", zIndex: 8 }} icon={<PlusOutlined />} type="primary" onClick={() => setVisible(true)}>
                      Add Spirits
                    </Button>
                  )}
                  {get(permissions, "packing_list") && (
                    <Button type="primary" className="float-right ml-2" style={{ position: "relative", zIndex: 8 }} icon={<PrinterOutlined />} onClick={() => handlePrintPackingListDownload()}>
                      Packing List
                    </Button>
                  )}
                </span>
              </Text>
              <hr style={{ backgroundColor: "#ccd5df", margin: "5px 0 10px" }} />

              <TableUI
                columnType={TableColumnsList.OrderDetailsExistingItems}
                isDefaultType={true}
                size="small"
                isActionAvailable={getActionFOCPermission()}
                isExportEnabled={false}
                isFilterEnabled={false}
                isUpdatePermittedBasedOnOrderType={true}
                columns_available={get(props, "metaColumnInfo.column_info", [])}
                data={existingOrderItemsList}
                className="mt-3"
                isLoading={false}
                handleEdit={handleEditExistingSpiritKeyChange}
                handleDelete={handleDeleteAction}
              />
            </div>
            {get(permissions, "add_items") && get(orderItemsList, "items", []).length > 0 && (
              <>
                <div className="common_card_section float-left w-100">
                  <span style={{ fontWeight: 500, fontSize: 16 }} className="mb-2">
                    Added Spirits
                  </span>
                  <hr style={{ backgroundColor: "#ccd5df", margin: "5px 0 10px" }} />

                  <TableUI
                    columnType={TableColumnsList.OrderDetailsNewItems}
                    isDefaultType={true}
                    size="small"
                    isExportEnabled={false}
                    isFilterEnabled={false}
                    columns_available={getNewSpiritsColumns()}
                    data={get(orderItemsList, "items", [])}
                    className="mt-3"
                    isLoading={false}
                    handleEdit={handleEditSpiritKeyChange}
                  />
                  <Row className="mt-0 mt-4 float-right">
                    <Col>
                      <Button type="secondary" htmlType="reset" onClick={() => handleAddedSpiritsReset()}>
                        Reset
                      </Button>
                      <Button
                        type="primary"
                        className="ml-2"
                        onClick={() => {
                          setAddSpiritsLoader(true);
                          handleSpiritUpdate();
                        }}
                        loading={addSpiritsLoader}
                        htmlType="submit"
                      >
                        Save
                      </Button>
                    </Col>
                  </Row>
                </div>
              </>
            )}
            <div className="common_card_section float-left w-100">
              <Text className={getScreenSize() > isMobileOrTab ? "d-flex align-items-center justify-content-between mb-2" : ""}>
                <span style={{ fontWeight: 500, fontSize: 16, marginRight: 20 }}> Additional Charges </span>
                {get(permissions, "modify_additional_charges") && (
                  <Button className="float-right ml-2" style={{ position: "relative", zIndex: 8 }} icon={<PlusOutlined />} type="primary" onClick={() => setAddAdditionalChargesModal(true)}>
                    Add Charges
                  </Button>
                )}
              </Text>
              <hr style={{ backgroundColor: "#ccd5df", margin: "5px 0 10px" }} />
              <CustomTable
                data={get(props, "additional_charges", [])}
                meta={{ column_info: getAdditionColumnsList() }}
                handleEdit={handleAdditionalChargesEdit}
                size="small"
                isUpdatePermittedBasedOnOrderType={get(permissions, "modify_additional_charges")}
                isLoading={false}
                isFilterEnabled={false}
                isExportAvailable={false}
                isClearable={true}
                columnType={TableColumnsList.AdditionalCharges}
                isCleared={() => isCleared()}
              />
            </div>
            <div className="common_card_section order__details_count float-left w-100">
              <Row style={{ fontSize: "12px" }}>
                <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                  <Text style={{ fontWeight: "bolder" }}>TOTAL CASES:</Text>
                  <p> {get(props, "total_case", "0")} </p>
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                  <Text style={{ fontWeight: "bolder" }}>TOTAL SPIRIT VALUE:</Text>
                  <p> {`£ ${numberWithCommas(get(props, "total_spirit_value", 0))}`} </p>
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                  <Text style={{ fontWeight: "bolder" }}>TOTAL ADDITIONAL VALUE:</Text>
                  <p> {`£ ${numberWithCommas(get(props, "total_additional_value", 0))}`} </p>
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                  <Text style={{ fontWeight: "bolder" }}>TOTAL ORDER VALUE:</Text>
                  <p> {`£ ${numberWithCommas(get(props, "total_order_value", 0))}`} </p>
                </Col>
              </Row>
            </div>
            <div className="common_card_section order_details__textarea float-left w-100">
              {get(permissions, "modify_special_conditions") ? (
                <>
                  <InputTextArea
                    className="mt-0 mb-0 w-100"
                    handleChange={(key, value) => setSpecialConditions(value)}
                    type="special_conditions"
                    autoSize={true}
                    style={{ minHeight: 70 }}
                    note="(Will be printed on Confirmation of Sale document)"
                    value={special_conditions}
                    label="Special Conditions"
                  />
                  <div className="float-right">
                    <Button type="secondary" onClick={() => setSpecialConditions(get(props, "special_conditions", ""))}>
                      Cancel
                    </Button>
                    <Button type="primary" htmlType="submit" className="ml-3" onClick={() => handleSaveSpecialConditions()}>
                      Save
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <InputTextArea
                    className="mt-0 mb-0 w-100"
                    disabled
                    note="(Will be printed on Confirmation of Sale document)"
                    autoSize={true}
                    type="special_conditions"
                    value={get(props, "special_conditions")}
                    label="Special Conditions"
                  />
                </>
              )}

              {get(permissions, "modify_notes") ? (
                <>
                  <InputTextArea
                    className="mt-0 mb-0 w-100"
                    handleChange={(key, value) => setNotes(value)}
                    type="notes"
                    value={notes}
                    note="(for internal team visibility)"
                    autoSize={true}
                    label="Notes"
                  />
                  <div className="float-right">
                    <Button type="secondary" onClick={() => setNotes(get(props, "notes", ""))}>
                      Cancel
                    </Button>
                    <Button type="primary" htmlType="submit" className="ml-3" onClick={() => handleSaveNotes()}>
                      Save
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <InputTextArea note="(for internal team visibility)" className="mt-0 mb-0 w-100" autoSize={true} disabled type="notes" value={get(props, "notes")} label="Notes" />
                </>
              )}
            </div>
          </>
        </Spin>
      </ErrorBoundary>
    </>
  );
};

export default OrderListDetails;
