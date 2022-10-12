import { OrderedListOutlined, SendOutlined, UserOutlined } from "@ant-design/icons";
import { find, get, round } from "lodash";
import React, { useEffect } from "react";
// import { isMobilePhone } from "validator";
import { isPossiblePhoneNumber } from "react-phone-number-input";
import { connect, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { capitalizeAllLetter } from "../../../helpers/utility";
import { createOrderRequest, getInputJSON, getRetriggerRequest, getSalesAssociateList } from "../../../store/SalesOrder/sale.actions";
import CustomStepsProgress from "../../UIComponents/Steps/salesOrderSteps";
import { openNotificationWithIcon } from "../../UIComponents/Toast/notification";
import Confirmation from "./confirmation";
import OrderConfirmation from "./confirmation/orderConfirmation";
import { salesOrder } from "./constants";
import OrderList from "./createOrder";
import CustomerDetails from "./customerDetails";
import EmailSuccessPage from "./emailSuccessPage";
import { emailRegex } from "./getData";
import "./index.scss";
import ReviewComponent from "./reviewDoc";
import ShippingDetails from "./shippingDetails";
import SuccessPage from "./successPage";
import ViewDocument from "./viewDocuments";

/**
 * Renders New Sales Order component
 */
const SalesOrder = (props) => {
  const history = useHistory();
  const [salesOrderState, updateState] = React.useState(salesOrder);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isUploading, setIsUploadingStatus] = React.useState(false);
  const [viewDocumentStatus, setViewDocumentStatus] = React.useState(false);
  const [viewEmailSuccessStatus, setViewEmailSuccessStatus] = React.useState(false);
  const [customerEmailToBeSent, setCustomerEmailToBeSent] = React.useState("");
  const [sentEmailDetails, setSentEmailDetails] = React.useState(null);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [salesOrderType, setSalesOrderType] = React.useState("reservation");
  const [notFilled, setNotFilled] = React.useState([]);
  const [finalResp, setFinalResp] = React.useState({});
  const [finalRequestPayload, setFinalRequestPayload] = React.useState(null);
  const [render, setRender] = React.useState(false);
  const [showModal, setShowModal] = React.useState(true);
  const [showConfirmationModal, setShowConfirmationModal] = React.useState(false);
  const [disableEmailTrigger, setDisableEmailTriggerStatus] = React.useState(false);
  const [salesAssociateList, setSalesAssociateList] = React.useState([]);

  const loggedInUserPermission = useSelector((state) => {
    return get(state, "auth.loggedInUserDetails.data.user_permissions", null);
  });

  const loggedInUserDetails = useSelector((state) => {
    return get(state, "auth.loggedInUserDetails.data", null);
  });

  useEffect(() => {
    if (get(loggedInUserPermission, "order_type_selection", []).length === 0) {
      setSalesOrderType("sales_order");
      setRender(true);
    }
    history.listen(() => updateState(salesOrder));
  }, [history]);

  useEffect(() => {
    fetchSalesMemberList();
    if (!props.inputJSON.status) {
      props.getInputJSON({
        page: "all",
        searchable_columns: [],
      });
    }
  }, []);

  const fetchSalesMemberList = async (requestOptions) => {
    const salesMemberList = await props.getSalesAssociateList(requestOptions);
    setSalesAssociateList(get(salesMemberList, "response.data"));
  };

  const handleRender = (modalStatus, value) => {
    let newProd = { ...salesOrderState };

    const userObj = find(salesAssociateList, function (o) {
      return get(o, "email", "").toLowerCase() === get(loggedInUserDetails, "email", "").toLowerCase();
    });

    if (userObj) {
      newProd["sales_associate"] = userObj;
    }

    newProd.sales_order_type = value;
    setSalesOrderType(value);
    updateState(newProd);
    setShowModal(modalStatus);
    setRender(true);
  };

  const validCheck = (obj, referer) => {
    let valid = true;
    let notFilled = [];
    for (let i = 0; i < referer.length; i++) {
      if (referer[i].mandatory === "yes" && obj.hasOwnProperty(referer[i].key)) {
        if (!obj[referer[i].key]) {
          valid = false;
          notFilled.push(referer[i].key);
        }

        // if (referer[i].key === "phone_no") {
        //   if (!isMobilePhone(obj[referer[i].key])) {
        //     valid = false;
        //     notFilled.push(referer[i].key);
        //   }
        // }

        if (referer[i].key === "phone_no") {
          if (!isPossiblePhoneNumber(obj[referer[i].key])) {
            valid = false;
            notFilled.push(referer[i].key);
          }
        }

        if (referer[i].key === "email" || referer[i].key == "shipper_email") {
          if (!emailRegex(obj[referer[i].key])) {
            valid = false;
            notFilled.push(referer[i].key);
          }
        }
      }
    }
    setNotFilled(notFilled);
    return valid;
  };

  const topFunction = () => {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  };

  const validCheckStatus = (data) => {
    if (get(props, "inputJSON.status", false)) {
      if (currentStep === 0) {
        const validatorCustomerDetailsJSON = get(props, "inputJSON.data.customer_details", {});
        const customerDetailObj = get(data, "customerDetails", {});
        const valid = validCheck(customerDetailObj, validatorCustomerDetailsJSON);
        if (valid) {
          setNotFilled([]);
        }
      }
    }
  };

  const handleNext = () => {
    topFunction();
    if (get(props, "inputJSON.status", false)) {
      if (currentStep === 0) {
        const validatorCustomerDetailsJSON = get(props, "inputJSON.data.customer_details", {});
        const customerDetailObj = salesOrderState.customerDetails;
        const valid = validCheck(customerDetailObj, validatorCustomerDetailsJSON);
        if (valid) {
          setCurrentStep(currentStep + 1);
        }
      } else if (currentStep === 1) {
        const validatorShipperDetailsJSON = get(props, "inputJSON.data.shipping_details", {});
        const shipDetailObj = salesOrderState.shippingDetails;
        const valid = validCheck(shipDetailObj, validatorShipperDetailsJSON);
        if (valid) {
          if (get(shipDetailObj, "is_member_of_european_union", false) && !get(salesOrderState, "customerDetails.eori_no")) {
            openNotificationWithIcon("error", `Order Type - ${capitalizeAllLetter(salesOrderType.replace(/_/g, " "))}`, "EORI No (in Customer Details page) is mandatory for delivery to EU countries");
          } else {
            setCurrentStep(currentStep + 1);
          }
        }
      } else if (currentStep === 2) {
        if ((get(salesOrderState, "spiritAdded", []).length > 0 || get(salesOrderState, "new_sales_order_items", []).length > 0) && !isUploading) {
          setCurrentStep(currentStep + 1);
        } else {
          openNotificationWithIcon(
            "error",
            `Order Type - ${capitalizeAllLetter(salesOrderType.replace(/_/g, " "))}`,
            get(salesOrderState, "spiritAdded", []).length === 0 ? "Please Add Spirit to Continue." : "Document upload in progress"
          );
        }
      }
    }
  };

  const handlePrev = (current) => {
    topFunction();
    setCurrentStep(currentStep - 1);
  };

  let NewSaleOrderList = [
    {
      title: "Customer Details",
      content: (
        <CustomerDetails
          salesOrderState={salesOrderState}
          updateState={(data) => {
            updateState(data);
            validCheckStatus(data);
          }}
          validationArray={notFilled}
        />
      ),
      icon: <UserOutlined />,
    },
    {
      title: "Delivery Details",
      content: <ShippingDetails salesOrderState={salesOrderState} updateState={updateState} validationArray={notFilled} />,
      icon: <SendOutlined />,
    },
    {
      title: "Order Details",
      content: <OrderList salesOrderState={salesOrderState} updateState={updateState} isDocumentUploading={(status) => setIsUploadingStatus(status)} />,
      icon: <OrderedListOutlined />,
    },
  ];

  if (salesOrderType === "sales_order") {
    NewSaleOrderList = [
      ...NewSaleOrderList,
      {
        title: "Review Document",
        content: (
          <ViewDocument
            record={salesOrderState}
            handleCustomerPostingDetails={(data) => {
              setCustomerEmailToBeSent(get(data, "email", ""));
            }}
          />
        ),
        icon: <OrderedListOutlined />,
      },
    ];
  }

  const handleOrderConfirmationModal = () => {
    setShowConfirmationModal((prevValue) => !prevValue);
  };

  const validateSpiritsAdded = () => {
    if ((get(salesOrderState, "spiritAdded", []).length > 0 || get(salesOrderState, "new_sales_order_items", []).length > 0) && !isUploading) {
      setShowConfirmationModal(true);
    } else {
      openNotificationWithIcon(
        "error",
        `Order Type - ${capitalizeAllLetter(salesOrderType.replace(/_/g, " "))}`,
        [...get(salesOrderState, "spiritAdded", []), ...get(salesOrderState, "salesOrderState.new_sales_order_items", [])].length === 0
          ? "Please Add Spirit to Continue."
          : "Document upload in progress"
      );
    }
  };

  const handleTriggerEmailSent = (details) => {
    setDisableEmailTriggerStatus(true);
    setViewDocumentStatus(false);
    setViewEmailSuccessStatus(true);
    setSentEmailDetails(details);
  };

  const getSumArrayOFObjWithKey = (arr, key) => {
    let sumValue = arr.reduce((prev, cur) => {
      if (key === "unit") {
        return prev + parseInt(cur[key]);
      } else {
        return prev + round(Number(cur[key]), 2);
      }
    }, 0);
    return sumValue;
  };

  const calculateTotalCases = () => {
    const spiritAdded = [...get(salesOrderState, "spiritAdded", []), ...get(salesOrderState, "new_sales_order_items", [])];
    const totalWholeCases = getSumArrayOFObjWithKey(spiritAdded, "quantity");
    return round(totalWholeCases, 2);
  };

  const calculateTotalOrderValue = () => {
    const spiritAdded = [...get(salesOrderState, "spiritAdded", []), ...get(salesOrderState, "new_sales_order_items", [])];
    const totalSpiritValue = getSumArrayOFObjWithKey(spiritAdded, "price_after_discount");
    const total = round(totalSpiritValue, 2);

    const additionalCharges = [...salesOrderState.additionalCharges];
    const totalAdditionalCharges = getSumArrayOFObjWithKey(additionalCharges, "total_cost");
    return round(totalAdditionalCharges, 2) + total;
  };

  const handleFinalSubmit = async () => {
    const totalSpirits = [...get(salesOrderState, "spiritAdded", []), ...get(salesOrderState, "new_sales_order_items", [])];
    const spiritsAddedFinal = totalSpirits.map((item) => {
      return {
        cased_goods_id: get(item, "cased_goods_id", ""),
        quantity: get(item, "quantity", 0),
        discount: get(item, "discount", 0),
        anchor_product: get(item, "anchor_product", false),
        bundle_details_array: get(item, "bundle_details_array", []),
        price_after_discount: round(get(item, "afterDiscount"), 2),
        whole_case: Number(get(item, "whole_case", 0)),
        bottles_in_partial_case: Number(get(item, "bottles_in_partial_case", 0)),
        rotation_number: get(item, "rotation_number", ""),
        volume: get(item, "volume", ""),
        age: get(item, "age", ""),
        abv: get(item, "abv", ""),
        custom_label_text: get(item, "custom_label_text", ""),
        cask: get(item, "cask", ""),
        free_item: get(item, "free_item", false),
        bpc: get(item, "bpc", ""),
        brand: get(item, "brand", ""),
        distillery: get(item, "distillery", ""),
        spirit_type: get(item, "spirit_type", ""),
        year: get(item, "year", ""),
        price: get(item, "total_price", 0),
        price_per_case: get(item, "price_per_case", 0),
      };
    });

    const expectedObj = {
      customer_details: get(salesOrderState, "customerDetails", {}),
      shipping_details: get(salesOrderState, "shippingDetails", {}),
      items: [...spiritsAddedFinal],
      additional_charges: get(salesOrderState, "additionalCharges", {}),
      supporting_documents: get(salesOrderState, "supporting_documents", {}),
      total_case: calculateTotalCases(),
      customer_email_for_sending: customerEmailToBeSent || get(salesOrderState, "customerDetails.email", ""),
      total_order_value: calculateTotalOrderValue(),
      notes: get(salesOrderState, "notes", ""),
      special_conditions: get(salesOrderState, "special_conditions", ""),
      sales_order_type: get(salesOrderState, "sales_order_type", "sales_order"),
      sales_associate: get(salesOrderState, "sales_associate.email", ""),
      target_region: get(salesOrderState, "customerDetails.target_region", ""),
    };

    setFinalRequestPayload(expectedObj);

    const finalSubmit = await props.createOrderRequest(expectedObj);

    if (get(finalSubmit, "response.status")) {
      updateState(salesOrder);
      setCurrentStep(0);
      setShowConfirmationModal(false);
      setCustomerEmailToBeSent("");
      setDisableEmailTriggerStatus(false);
      setSubmitSuccess(true);
      setFinalResp(finalSubmit.response);
      openNotificationWithIcon("success", `Order Type - ${capitalizeAllLetter(salesOrderType.replace(/_/g, " "))}`, `${get(finalSubmit, "response.message", "Added Successfully")} `);
    }

    if (get(finalSubmit, "error", false)) {
      openNotificationWithIcon("error", `Order Type - ${capitalizeAllLetter(salesOrderType.replace(/_/g, " "))}`, `${get(finalSubmit, "error.message", "Something Went Wrong")} `);
    }
  };

  if (render) {
    return (
      <>
        <div className="new-sales-order">
          <div className="mb-2">
            <b> Creating New - {capitalizeAllLetter(salesOrderType.replace(/_/g, " "))} </b>
          </div>
          <OrderConfirmation isOpen={showConfirmationModal} handleOrderConfirmationModal={handleOrderConfirmationModal} handleConfirmationSubmit={handleFinalSubmit} />
          {viewDocumentStatus && (
            <ReviewComponent
              disableEmailTriggerButton={disableEmailTrigger}
              handleRetriggerEmail={(details) => handleTriggerEmailSent(details)}
              finalResp={finalResp}
              finalRequestPayload={finalRequestPayload}
              handleAddNewSalesOrder={() => setViewDocumentStatus(false)}
            />
          )}
          {submitSuccess && (
            <SuccessPage
              setSubmitSuccess={(val) => {
                setSubmitSuccess(false);
                setRender(false);
                setShowModal(true);
                setSalesOrderType("reservation");
              }}
              finalResp={finalResp}
              salesOrderType={salesOrderType}
              salesOrderState={salesOrderState}
              viewDocuments={() => {
                setSubmitSuccess(false);
                setViewDocumentStatus(true);
              }}
            />
          )}
          {viewEmailSuccessStatus && <EmailSuccessPage details={sentEmailDetails} />}
          {!viewDocumentStatus && !submitSuccess && !viewEmailSuccessStatus && (
            <CustomStepsProgress data={NewSaleOrderList} onSubmit={validateSpiritsAdded} handleNext={handleNext} handlePrev={handlePrev} current={currentStep} />
          )}
        </div>
      </>
    );
  }
  return <Confirmation showModal={showModal} handleRender={handleRender} />;
};
export default connect(
  (state) => ({
    loading: get(state, "salesOrder.loading", false),
    error: get(state, "salesOrder.error", false),
    inputJSON: get(state, "salesOrder.inputJSON", {}),
  }),
  { createOrderRequest, getSalesAssociateList, getRetriggerRequest, getInputJSON }
)(SalesOrder);
