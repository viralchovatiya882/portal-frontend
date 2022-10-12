import { Col, Form, Row, Select as TagsSelect, Tag } from "antd";
import { cloneDeep, find, get, uniqBy } from "lodash";
import React, { useEffect } from "react";
import PhoneInput from "react-phone-number-input";
import { connect, useSelector } from "react-redux";
import { getKeyValuePair } from "../../../../helpers/utility";
import { defaultRequestOptions } from "../../../../settings";
import { addNewCustomer } from "../../../../store/Leads/leads.actions";
import { getCityList, getCountryList, getCustomerDetail, getCustomerList, getSalesAssociateList, getStateList } from "../../../../store/SalesOrder/sale.actions";
import { CustomInputText as InputChange } from "../../../UIComponents/Input/customInput";
import { SingleSelect as Select } from "../../../UIComponents/Select/singleSelect";
import { openNotificationWithIcon } from "../../../UIComponents/Toast/notification";
import AddCustomer from "../../Leads/customerData/addCustomer";
import { terms } from "../constants";
import { emailRegex, getKeyValue, postalRegEx } from "../getData";

/**
 * Renders Customer Details component
 */
const CustomerDetailsEntry = (props) => {
  const [error, updateError] = React.useState({});
  const [modalOpen, setModalOpen] = React.useState(false);

  const [customerListState, setCustomerList] = React.useState([]);
  const [salesAssociateList, setSalesAssociateList] = React.useState([]);
  const [countryList, setCountryList] = React.useState([]);
  const [stateList, setStateList] = React.useState([]);
  const [cityList, setCityList] = React.useState([]);
  const [addNewCustomerRes, setAddNewCustomerResp] = React.useState({});

  React.useEffect(() => {
    fetchSalesMemberList();
  }, []);

  const loggedInUserDetails = useSelector((state) => {
    return get(state, "auth.loggedInUserDetails.data", null);
  });

  useEffect(() => {
    if (get(props, "validationArray", []).length > 0) {
      const temp = cloneDeep(props.validationArray);
      const obj = {};
      for (let i = 0; i < temp.length; i++) {
        obj[temp[i]] = true;
      }
      updateError(obj);
    } else {
      updateError({});
    }
  }, [props.validationArray]);

  const setModal = React.useCallback(
    (value) => {
      if (value) {
        props.setNewResp({});
        setModalOpen(true);
      } else {
        setAddNewCustomerResp({});
        setModalOpen(false);
      }
    },
    [addNewCustomerRes]
  );

  const handleSubmitAddCustomer = async (requestObj) => {
    const requestPayload = { ...requestObj };
    let addCustomerResponse = await props.addNewCustomer(requestPayload);

    if (get(addCustomerResponse, "response.status")) {
      openNotificationWithIcon("success", "Create Customer", `${get(addCustomerResponse, "response.message", "Something Went Wrong")} `);
      setModalOpen(false);
      fetchCustomerList(defaultRequestOptions);
      const obj = { id: get(addCustomerResponse, "response.customer_id") };
      fetchCustomerDetail(obj);
    }

    if (!get(addCustomerResponse, "response.status")) {
      openNotificationWithIcon("info", "Create Customer", `${get(addCustomerResponse, "response.message", "Something Went Wrong")} `);
    }

    if (get(addCustomerResponse, "error", false)) {
      openNotificationWithIcon("error", "Create Customer", `${get(addCustomerResponse, "error.message", "Something Went Wrong")} `);
    }
  };

  const getCountryListFunc = async () => {
    const countryListResp = await props.getCountryList({
      ...defaultRequestOptions,
      page: "all",
    });
    setCountryList(get(countryListResp, "response.data"));
    return get(countryListResp, "response.data");
  };

  const getStateListing = async (countrySelected, list = countryList) => {
    const selectedObj = list.find((item) => item.country_name === countrySelected);
    if (get(selectedObj, "id")) {
      const stateListResp = await props.getStateList({ country_id: get(selectedObj, "id"), page: "all" });
      setStateList(get(stateListResp, "response.data"));
      return get(stateListResp, "response.data");
    }
    return [];
  };

  const getCityListing = async (stateSelected, list = stateList) => {
    const selectedObj = list.find((item) => item.state_name === stateSelected);
    if (get(selectedObj, "id")) {
      const cityListResp = await props.getCityList({ state_id: get(selectedObj, "id"), page: "all" });
      setCityList(get(cityListResp, "response.data"));
      return get(cityListResp, "response.data");
    }
    return [];
  };

  const getStateListFunc = async (countrySelected) => {
    if (countryList.length === 0) {
      const resp = await getCountryListFunc();
      getStateListing(countrySelected, resp);
    } else {
      getStateListing(countrySelected);
    }
  };

  const getCityListFunc = async (stateSelected, countrySelected) => {
    if (stateList.length === 0) {
      const resp = await getStateListFunc(countrySelected);
      getCityListing(stateSelected, resp);
    } else {
      getCityListing(stateSelected);
    }
  };

  const fetchCustomerList = async (requestOptions) => {
    const customerList = await props.getCustomerList(requestOptions);
    setCustomerList(get(customerList, "response.data"));
  };

  const fetchSalesMemberList = async (requestOptions) => {
    const salesMemberList = await props.getSalesAssociateList(requestOptions);
    setSalesAssociateList(get(salesMemberList, "response.data"));
  };

  const handleBlur = React.useCallback((key, value) => {
    if (key === "email") {
      const tempObj = cloneDeep(error);
      if (emailRegex(value)) {
        tempObj[key] = false;
        updateError(tempObj);
      } else {
        tempObj[key] = true;
        updateError(tempObj);
      }
    }
  });

  const handleChange = React.useCallback((key, value) => {
    const tempObj = cloneDeep(error);
    tempObj[key] = false;
    updateError(tempObj);
    let newProd = { ...props.salesOrderState };
    newProd.customerDetails[key] = value;
    switch (key) {
      case "customer_name":
        const selectedCustomer = customerListState.find((item) => item.name === value);
        fetchCustomerDetail(selectedCustomer);
        break;
      case "phone_no":
        if (value && value.length <= 20) {
          props.updateState(newProd);
        }
        break;
      case "postal_code":
        if (value.length <= 15 && value.length > 0) {
          if (postalRegEx(value)) {
            props.updateState(newProd);
          }
        } else if (value.length < 1) {
          props.updateState(newProd);
        }
        break;
      case "sales_associate":
        const findSelectedKeyObj = find(salesAssociateList, function (o) {
          return get(o, "name") === value;
        });
        newProd.sales_associate = findSelectedKeyObj;
        props.updateState(newProd);
        break;
      case "country":
        let targetRegion = get(newProd, "customerDetails.target_region", "").split(",");
        targetRegion = uniqBy([...targetRegion, value]);
        const countryIndex = targetRegion.indexOf(get(newProd, "customerDetails.country"));
        if (countryIndex > -1) {
          targetRegion.splice(countryIndex, 1);
        }
        newProd.customerDetails["target_region"] = targetRegion.join(",");
        newProd.customerDetails["state"] = "";
        newProd.customerDetails["city"] = "";
        props.updateState(newProd);
        getStateListFunc(value);
        break;
      case "state":
        newProd.customerDetails["city"] = "";
        props.updateState(newProd);
        getCityListFunc(value);
        break;
      default:
        props.updateState(newProd);
        break;
    }
  });

  const updateNewCase = (detail, selectedCustomer) => {
    let newProd = { ...props.salesOrderState };
    const customerDetail = getKeyValue(detail.customer_details);
    let shippingDetail = getKeyValue(detail.shipping_details);

    const customer_entity_name_new = find(get(detail, "customer_details", []), function (o) {
      return get(o, "key") === "customer_name";
    });

    const findSelectedKeyObj = find(salesAssociateList, function (o) {
      return get(o, "email", "").toLowerCase() === get(loggedInUserDetails, "email", "").toLowerCase();
    });

    newProd.selectedCustomer;
    newProd.selectedCustomer = get(selectedCustomer, "name") || get(customer_entity_name_new, "value");
    newProd.customerDetails = {
      ...customerDetail,
      sales_associate: findSelectedKeyObj,
      target_region: get(newProd, "target_region", "") ? get(newProd, "target_region", "") : get(customerDetail, "country", ""),
    };
    shippingDetail["is_member_of_european_union"] = get(shippingDetail, "is_member_of_european_union", "").toLowerCase() === "yes" ? true : false;

    newProd.shippingDetails = { ...shippingDetail };
    newProd.spiritAdded = [];
    newProd.additionalCharges = [];

    const tempObj = cloneDeep(error);
    Object.entries(detail).forEach(([key, value]) => {
      if (value) {
        tempObj[key] = false;
      }
    });
    updateError(tempObj);
    props.updateState(newProd);
  };

  const fetchCustomerDetail = async (selectedCustomer) => {
    const customerDetailResp = await props.getCustomerDetail(get(selectedCustomer, "id", ""));
    updateNewCase(get(customerDetailResp, "response"), selectedCustomer);
  };

  return (
    <div className="sales_order__customer_details">
      {modalOpen && (
        <AddCustomer
          isModalVisible={modalOpen}
          isLoading={get(props, "loading", false)}
          handleSubmit={(respObj) => handleSubmitAddCustomer(respObj)}
          handleCancel={() => {
            setModalOpen(false);
          }}
        />
      )}
      <div className="sales_order__customer_details__add common_card_section">
        <Row>
          <Col className="pl-sm-3" xs={{ span: 24 }} sm={{ span: 9 }} md={{ span: 11 }} lg={{ span: 9 }}>
            <Select
              handleChange={(key, value) => handleChange(key, value)}
              value={get(props, "salesOrderState.selectedCustomer", "")}
              type="customer_name"
              label="Customer Entity Name"
              placeholder="Select Customer Entity Name"
              required
              maxLength={100}
              loading={false}
              validateStatus={get(error, "customer_name") && "error"}
              helpText={get(error, "customer_name") ? "Customer Name cannot be empty" : ""}
              options={getKeyValuePair(customerListState, "name")}
              className="mt-0 mb-0"
              onDropdownVisibleChange={async () => {
                if (customerListState.length === 0) {
                  const reqBody = {
                    page: "all",
                  };
                  await fetchCustomerList(reqBody);
                }
              }}
            />
            <span
              className="float-left"
              style={{
                marginTop: get(error, "customer_name") ? 0 : 0,
              }}
            >
              Cannot ﬁnd name of the customer?
              <a className="sales_order__customer_details__add_new" onClick={() => setModalOpen(true)}>
                Add New
              </a>
            </span>
          </Col>
          <Col className="pr-sm-3" xs={{ span: 24 }} sm={{ span: 6, offset: 1 }} md={{ span: 10, offset: 2 }} lg={{ span: 6, offset: 1 }}>
            <InputChange
              // handleChange={handleChange}
              value={get(props.salesOrderState.customerDetails, "customer_id", "")}
              type="customer_id"
              className="mt-0 mb-0"
              label="Customer ID"
              required
              validateStatus={get(error, "customer_id") && "error"}
              helpText={get(error, "customer_id") ? "Customer ID cannot be empty" : ""}
              disabled
            />
          </Col>

          <Col className="pl-sm-3" xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 11, offset: 0 }} lg={{ span: 7, offset: 1 }}>
            <Select
              handleChange={(key, value) => handleChange(key, value)}
              value={get(props, "salesOrderState.sales_associate.name", "")}
              type="sales_associate"
              label="Sales Associate"
              placeholder="Select Sales Associate"
              maxLength={100}
              loading={false}
              validateStatus={get(error, "sales_associate") && "error"}
              helpText={get(error, "sales_associate") ? "Sales Associate Name cannot be empty" : ""}
              options={getKeyValuePair(salesAssociateList, "name")}
              className="mt-0 mb-0"
              onDropdownVisibleChange={() => {
                if (salesAssociateList && salesAssociateList.length === 0) {
                  fetchSalesMemberList();
                }
              }}
            />
          </Col>
        </Row>
      </div>
      <div className="common_card_section">
        <div className="sale-order-divider">
          <p className="text-black">Details below are pre filled basis the last Sales Order from this customer. Please change as required.</p>
          <hr />
        </div>

        <Row>
          <Col className="create-order-fields-padding" xs={{ span: 24 }} sm={{ span: 7 }} md={{ span: 10, offset: 1 }} lg={{ span: 7, offset: 0 }}>
            <InputChange
              handleChange={handleChange}
              value={get(props, "salesOrderState.customerDetails.contact_name", "")}
              maxLength={100}
              type="contact_name"
              className="mt-0 mb-0 w-100"
              required
              validateStatus={get(error, "contact_name") && "error"}
              helpText={get(error, "contact_name") ? "Contact Name cannot be empty" : ""}
              label="Contact Name"
            />
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 11, offset: 1 }} lg={{ span: 7, offset: 1 }}>
            {/* <InputChange
            handleChange={handleChange}
            value={get(props, "salesOrderState.customerDetails.phone_no", "")}
            type="phone_no"
            maxLength={20}
            className="mt-0 mb-0 w-100"
            required
            validateStatus={get(error, "phone_no") && "error"}
            helpText={
              // eslint-disable-next-line no-nested-ternary
              get(error, "phone_no")
                ? get(props, "salesOrderState.customerDetails.phone_no", "")
                  ? "Invalid Phone Number"
                  : "Phone Number cannot be empty"
                : ""
            }
            label="Phone No"
          /> */}

            <Form layout="vertical">
              <Form.Item label={<span>Phone Number</span>} validateStatus={get(error, "phone_no") && "error"} help={get(error, "phone_no") ? "Enter Valid Phone Number" : ""} required className="mt-2">
                <PhoneInput
                  international
                  smartCaret
                  countryCallingCodeEditable={true}
                  placeholder="Enter phone number"
                  value={get(props, "salesOrderState.customerDetails.phone_no", "")}
                  onChange={(value) => handleChange("phone_no", value)}
                />
              </Form.Item>
            </Form>
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 10, offset: 1 }} lg={{ span: 7, offset: 1 }}>
            <InputChange
              handleChange={handleChange}
              value={get(props, "salesOrderState.customerDetails.email", "")}
              type="email"
              maxLength={100}
              className="mt-0 mb-0 w-100"
              required
              validateStatus={get(error, "email") && "error"}
              helpText={get(error, "email") ? "Please fill this field with valid email" : ""}
              label="Email"
              handleBlur={handleBlur}
            />
          </Col>
          <Col className="create-order-fields-padding" xs={{ span: 24 }} sm={{ span: 7 }} md={{ span: 11, offset: 1 }} lg={{ span: 7, offset: 0 }}>
            <InputChange
              handleChange={handleChange}
              value={get(props, "salesOrderState.customerDetails.invoice_address1", "")}
              maxLength={255}
              type="invoice_address1"
              className="mt-0 mb-0 w-100"
              required
              validateStatus={get(error, "invoice_address1") && "error"}
              helpText={get(error, "invoice_address1") ? "Invoice Address 1 cannot be empty" : ""}
              label="Invoice Address 1"
            />
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 10, offset: 1 }} lg={{ span: 7, offset: 1 }}>
            <InputChange
              handleChange={handleChange}
              value={get(props, "salesOrderState.customerDetails.invoice_address2", "")}
              maxLength={255}
              type="invoice_address2"
              className="mt-0 mb-0 w-100"
              validateStatus={get(error, "invoice_address2") && "error"}
              helpText={get(error, "invoice_address2") ? "Invoice Address 2 cannot be empty" : ""}
              label="Invoice Address 2"
            />
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 11, offset: 1 }} lg={{ span: 7, offset: 1 }}>
            <InputChange
              handleChange={handleChange}
              value={get(props, "salesOrderState.customerDetails.postal_code", "")}
              type="postal_code"
              maxLength={15}
              className="mt-0 mb-0 w-100"
              // required
              validateStatus={get(error, "postal_code") && "error"}
              helpText={get(error, "postal_code") ? "Postal Code cannot be empty" : ""}
              label="Postal Code"
            />
          </Col>
          <Col className="create-order-fields-padding" xs={{ span: 24 }} sm={{ span: 7 }} md={{ span: 10, offset: 1 }} lg={{ span: 7, offset: 0 }}>
            <Select
              handleChange={(key, value) => handleChange(key, value)}
              value={get(props, "salesOrderState.customerDetails.country", "")}
              type="country"
              label="Country"
              required
              loading={false}
              placeholder="Search to Select Country"
              validateStatus={get(error, "country") && "error"}
              helpText={get(error, "country") ? "Country cannot be empty" : ""}
              options={getKeyValuePair(countryList, "country_name", false)}
              className="mt-0 mb-0"
              onDropdownVisibleChange={() => {
                if (countryList.length === 0) {
                  getCountryListFunc();
                }
              }}
            />
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 11, offset: 1 }} lg={{ span: 7, offset: 1 }}>
            <Select
              handleChange={(key, value) => handleChange(key, value)}
              value={get(props, "salesOrderState.customerDetails.state", "")}
              type="state"
              label="State"
              required
              enableAddNew={true}
              loading={false}
              placeholder="Search to Select State"
              validateStatus={get(error, "state") && "error"}
              helpText={get(error, "state") ? "State Name cannot be empty" : ""}
              options={getKeyValuePair(stateList, "state_name", false)}
              className="mt-0 mb-0"
              onDropdownVisibleChange={() => {
                if (stateList.length === 0) {
                  getStateListFunc(get(props, "salesOrderState.customerDetails.country", ""));
                }
              }}
            />
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 10, offset: 1 }} lg={{ span: 7, offset: 1 }}>
            <Select
              handleChange={(key, value) => handleChange(key, value)}
              value={get(props, "salesOrderState.customerDetails.city", "")}
              type="city"
              label="City"
              required
              loading={false}
              enableAddNew={true}
              placeholder="Search to Select City"
              validateStatus={get(error, "city") && "error"}
              helpText={get(error, "city") ? "City Name cannot be empty" : ""}
              options={getKeyValuePair(cityList, "city_name", false)}
              className="mt-0 mb-0"
              onDropdownVisibleChange={() => {
                if (cityList.length === 0) {
                  getCityListFunc(get(props, "salesOrderState.customerDetails.state", ""), get(props, "salesOrderState.customerDetails.country", ""));
                }
              }}
            />
          </Col>
          <Col lg={{ span: 23 }} xs={{ span: 24 }} className="create-order-fields-padding">
            <Form layout="vertical">
              <Form.Item label="Target Region">
                <TagsSelect
                  mode="multiple"
                  value={get(props, "salesOrderState.customerDetails.target_region") ? get(props, "salesOrderState.customerDetails.target_region", "").split(",") : []}
                  showArrow
                  tagRender={tagRender}
                  onChange={(val) => handleChange("target_region", val.join(","))}
                  onDropdownVisibleChange={() => {
                    if (countryList.length === 0) {
                      getCountryListFunc();
                    }
                  }}
                  style={{
                    width: "100%",
                  }}
                  options={getKeyValuePair(countryList, "country_name", false)}
                  placeholder="Select Target Region"
                />
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </div>
      <div className="common_card_section">
        <Row>
          <Col className="create-order-fields-padding" xs={{ span: 24 }} sm={{ span: 7 }} md={{ span: 10, offset: 1 }} lg={{ span: 7, offset: 0 }}>
            <InputChange
              handleChange={handleChange}
              value={get(props, "salesOrderState.customerDetails.account_code", "")}
              maxLength={100}
              type="account_code"
              className="mt-0 mb-0 w-100"
              validateStatus={get(error, "account_code") && "error"}
              helpText={get(error, "account_code") ? "Account Code cannot be empty" : ""}
              label="Account Code"
            />
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 11, offset: 1 }} lg={{ span: 7, offset: 1 }}>
            <InputChange
              handleChange={handleChange}
              value={get(props, "salesOrderState.customerDetails.vat_no", "")}
              type="vat_no"
              maxLength={100}
              className="mt-0 mb-0 w-100"
              validateStatus={get(error, "vat_no") && "error"}
              helpText={get(error, "vat_no") ? "Vat No cannot be empty" : ""}
              label="Vat No"
            />
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 10, offset: 1 }} lg={{ span: 7, offset: 1 }}>
            <Select
              handleChange={(key, value) => handleChange(key, value)}
              value={get(props, "salesOrderState.customerDetails.payment_terms", "")}
              type="payment_terms"
              label="Payment Terms"
              placeholder="Select Payment Terms"
              loading={false}
              validateStatus={get(error, "payment_terms") && "error"}
              helpText={get(error, "payment_terms") ? "Payment Terms cannot be empty" : ""}
              options={terms}
              className="mt-0 mb-0"
            />
          </Col>
          <Col className="create-order-fields-padding" xs={{ span: 24 }} sm={{ span: 7 }} md={{ span: 11, offset: 1 }} lg={{ span: 7, offset: 0 }}>
            <InputChange
              handleChange={handleChange}
              value={get(props, "salesOrderState.customerDetails.customer_po_no", "")}
              maxLength={100}
              type="customer_po_no"
              className="mt-0 mb-0 w-100"
              validateStatus={get(error, "customer_po_no") && "error"}
              helpText={get(error, "customer_po_no") ? "Customer PO No cannot be empty" : ""}
              label="Customer PO No"
            />
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 10, offset: 1 }} lg={{ span: 7, offset: 1 }}>
            <InputChange
              handleChange={handleChange}
              value={get(props, "salesOrderState.customerDetails.warehouse_no", "")}
              maxLength={100}
              type="warehouse_no"
              className="mt-0 mb-0 w-100"
              validateStatus={get(error, "warehouse_no") && "error"}
              helpText={get(error, "warehouse_no") ? "Warehouse No cannot be empty" : ""}
              label="Warehouse No"
            />
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 11, offset: 1 }} lg={{ span: 7, offset: 1 }}>
            <InputChange
              handleChange={handleChange}
              value={get(props, "salesOrderState.customerDetails.eori_no", "")}
              maxLength={100}
              type="eori_no"
              className="mt-0 mb-0 w-100"
              validateStatus={get(error, "eori_no") ? "error" : "warning"}
              helpText={get(error, "eori_no") ? "EORI No cannot be empty" : "EORI No is mandatory for delivery to EU countries"}
              label="EORI No"
            />
          </Col>
          <Col className="create-order-fields-padding" xs={{ span: 24 }} sm={{ span: 7 }} md={{ span: 10, offset: 1 }} lg={{ span: 7, offset: 0 }}>
            <InputChange
              handleChange={handleChange}
              value={get(props, "salesOrderState.customerDetails.excise_registration_no", "")}
              maxLength={100}
              type="excise_registration_no"
              className="mt-0 mb-0 w-100"
              validateStatus={get(error, "excise_registration_no") && "error"}
              helpText={get(error, "excise_registration_no") ? "Excise Registration No cannot be empty" : ""}
              label="Excise Registration No of Place of Delivery"
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

const tagRender = (props) => {
  const { label, value, closable, onClose } = props;

  const onPreventMouseDown = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <Tag
      color="processing"
      onMouseDown={onPreventMouseDown}
      closable={closable}
      onClose={onClose}
      style={{
        marginRight: 3,
      }}
    >
      {label}
    </Tag>
  );
};
export default connect(
  (state) => ({
    loading: get(state, "salesOrder.loading", false),
    addCustomerLoading: get(state, "leads.addCustomerLoading", false),
    error: get(state, "salesOrder.error", false),
    customerList: get(state, "salesOrder.customerList", []),
    customerDetail: get(state, "salesOrder.customerDetail", []),
    addCustomerResp: get(state, "salesOrder.addCustomerResp", []),
    countryList: get(state, "salesOrder.countryList", []),
    stateList: get(state, "salesOrder.stateList", []),
    cityList: get(state, "salesOrder.cityList", []),
  }),
  { getCustomerList, getSalesAssociateList, addNewCustomer, getCountryList, getStateList, getCityList, getCustomerDetail }
)(CustomerDetailsEntry);
