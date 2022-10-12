import { Col, Form, Row } from "antd";
import { cloneDeep, get } from "lodash";
import React, { useEffect } from "react";
import PhoneInput from "react-phone-number-input";
import { connect } from "react-redux";
import { getKeyValuePair } from "../../../../helpers/utility";
import { defaultRequestOptions } from "../../../../settings";
import { getCityList, getCountryList, getStateList } from "../../../../store/SalesOrder/sale.actions";
import { CustomDatePicker } from "../../../UIComponents/DatePicker";
import { CustomInputText as InputChange } from "../../../UIComponents/Input/customInput";
import { SingleSelect as Select } from "../../../UIComponents/Select/singleSelect";
import { emailRegex, postalRegEx } from "../getData";

/**
 * Renders Shipper Details component
 */
const ShippingDetails = (props) => {
  const [error, updateError] = React.useState({});
  const [countryList, setCountryList] = React.useState([]);
  const [stateList, setStateList] = React.useState([]);
  const [cityList, setCityList] = React.useState([]);

  useEffect(() => {
    let newProd = { ...props.salesOrderState };
    let shippingDetail = { ...get(props, "salesOrderState.shippingDetails", {}) };
    let customerDetail = { ...get(props, "salesOrderState.customerDetails", {}) };

    if (!shippingDetail.contact_name && !shippingDetail.phone_no) {
      newProd.shippingDetails.contact_name = get(customerDetail, "contact_name", "");
      newProd.shippingDetails.phone_no = get(customerDetail, "phone_no", "");
      newProd.shippingDetails.email = get(customerDetail, "email", "");
      newProd.shippingDetails.postal_code = get(customerDetail, "postal_code", "");
      newProd.shippingDetails.country = get(customerDetail, "country", "");
      newProd.shippingDetails.state = get(customerDetail, "state", "");
      newProd.shippingDetails.city = get(customerDetail, "city", "");
      newProd.shippingDetails.delivery_address1 = get(customerDetail, "invoice_address1", "");
      newProd.shippingDetails.delivery_address2 = get(customerDetail, "invoice_address2", "");
    }

    const tempObj = cloneDeep(error);
    Object.entries(shippingDetail).forEach(([key, value]) => {
      if (value) {
        tempObj[key] = false;
      }
    });
    updateError(tempObj);
    props.updateState(newProd);
  }, []);

  useEffect(() => {
    if (props.validationArray.length > 0) {
      const temp = cloneDeep(props.validationArray);
      const tempErrorObj = {};
      for (let i = 0; i < temp.length; i++) {
        tempErrorObj[temp[i]] = true;
      }
      updateError(tempErrorObj);
    }
  }, [props.validationArray]);

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

  const handleBlur = React.useCallback((key, value) => {
    if (key === "email" || key === "shipper_email") {
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
    newProd.shippingDetails[key] = value;

    switch (key) {
      case "phone_no":
        if (value && value.length <= 20) {
          props.updateState(newProd);
        }
        break;
      case "shipper_phone_no":
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
      case "country":
        newProd.shippingDetails["state"] = "";
        newProd.shippingDetails["city"] = "";
        const selectedObj = countryList.find((item) => item.country_name === value);
        if (get(selectedObj, "is_member_of_european_union", "").toLowerCase() === "yes") {
          newProd.shippingDetails["is_member_of_european_union"] = true;
        } else {
          newProd.shippingDetails["is_member_of_european_union"] = false;
        }
        props.updateState(newProd);
        getStateListFunc(value);
        break;
      case "state":
        newProd.shippingDetails["city"] = "";
        getCityListFunc(value);
        break;
      default:
        props.updateState(newProd);
        break;
    }
  });

  return (
    <div className="sales_order__customer_details">
      <div className="common_card_section">
        <Row>
          <Col className="create-order-fields-padding" xs={{ span: 24 }} sm={{ span: 7 }} md={{ span: 10, offset: 1 }} lg={{ span: 7, offset: 0 }}>
            <InputChange
              handleChange={handleChange}
              value={get(props, "salesOrderState.shippingDetails.contact_name", "")}
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
            value={get(props, "salesOrderState.shippingDetails.phone_no", "")}
            type="phone_no"
            className="mt-0 mb-0 w-100"
            required
            maxLength={20}
            validateStatus={get(error, "phone_no") && "error"}
            helpText={
              // eslint-disable-next-line no-nested-ternary
              get(error, "phone_no")
                ? get(props, "salesOrderState.shippingDetails.phone_no", "")
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
                  value={get(props, "salesOrderState.shippingDetails.phone_no", "")}
                  onChange={(value) => handleChange("phone_no", value)}
                />
              </Form.Item>
            </Form>
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 10, offset: 1 }} lg={{ span: 7, offset: 1 }}>
            <InputChange
              handleChange={handleChange}
              value={get(props, "salesOrderState.shippingDetails.email", "")}
              type="email"
              className="mt-0 mb-0 w-100"
              required
              maxLength={100}
              validateStatus={get(error, "email") && "error"}
              helpText={get(error, "email") ? "Please fill this field with valid email" : ""}
              label="Email"
              handleBlur={handleBlur}
            />
          </Col>
          <Col className="create-order-fields-padding" xs={{ span: 24 }} sm={{ span: 7 }} md={{ span: 11, offset: 1 }} lg={{ span: 7, offset: 0 }}>
            <InputChange
              handleChange={handleChange}
              value={get(props, "salesOrderState.shippingDetails.delivery_address1", "")}
              maxLength={255}
              type="delivery_address1"
              className="mt-0 mb-0 w-100"
              required
              validateStatus={get(error, "delivery_address1") && "error"}
              helpText={get(error, "delivery_address1") ? "Delivery Address 1 cannot be empty" : ""}
              label="Delivery Address 1"
            />
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 10, offset: 1 }} lg={{ span: 7, offset: 1 }}>
            <InputChange
              handleChange={handleChange}
              value={get(props, "salesOrderState.shippingDetails.delivery_address2", "")}
              maxLength={255}
              type="delivery_address2"
              className="mt-0 mb-0 w-100"
              validateStatus={get(error, "delivery_address2") && "error"}
              helpText={get(error, "delivery_address2") ? "Delivery Address 2 cannot be empty" : ""}
              label="Delivery Address 2"
            />
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 11, offset: 1 }} lg={{ span: 7, offset: 1 }}>
            <InputChange
              handleChange={handleChange}
              value={get(props, "salesOrderState.shippingDetails.postal_code", "")}
              maxLength={15}
              type="postal_code"
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
              value={get(props, "salesOrderState.shippingDetails.country", "")}
              type="country"
              label="Country"
              required
              loading={false}
              validateStatus={get(error, "country") && "error"}
              helpText={get(error, "country") ? "Country Name cannot be empty" : ""}
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
              value={get(props, "salesOrderState.shippingDetails.state", "")}
              type="state"
              label="State"
              required
              enableAddNew={true}
              loading={false}
              validateStatus={get(error, "state") && "error"}
              helpText={get(error, "state") ? "State Name cannot be empty" : ""}
              options={getKeyValuePair(stateList, "state_name", false)}
              className="mt-0 mb-0"
              onDropdownVisibleChange={() => {
                if (stateList.length === 0) {
                  getStateListFunc(get(props, "salesOrderState.shippingDetails.country", ""));
                }
              }}
            />
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 10, offset: 1 }} lg={{ span: 7, offset: 1 }}>
            <Select
              handleChange={(key, value) => handleChange(key, value)}
              value={get(props, "salesOrderState.shippingDetails.city", "")}
              type="city"
              label="City"
              required
              enableAddNew={true}
              loading={false}
              validateStatus={get(error, "city") && "error"}
              helpText={get(error, "city") ? "City Name cannot be empty" : ""}
              options={getKeyValuePair(cityList, "city_name", false)}
              className="mt-0 mb-0"
              onDropdownVisibleChange={() => {
                if (cityList.length === 0) {
                  getCityListFunc(get(props, "salesOrderState.shippingDetails.state", ""), get(props, "salesOrderState.shippingDetails.country", ""));
                }
              }}
            />
          </Col>
        </Row>
      </div>
      <div className="common_card_section">
        <Row>
          <Col className="create-order-fields-padding" xs={{ span: 24 }} sm={{ span: 7 }} md={{ span: 10, offset: 1 }} lg={{ span: 7, offset: 0 }}>
            <InputChange
              handleChange={handleChange}
              value={get(props, "salesOrderState.shippingDetails.shipper_details1", "")}
              maxLength={255}
              type="shipper_details1"
              className="mt-0 mb-0 w-100"
              validateStatus={get(error, "shipper_details1") && "error"}
              helpText={get(error, "shipper_details1") ? "Shipper Details 1 cannot be empty" : ""}
              label="Shipper Details 1"
            />
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 11, offset: 1 }} lg={{ span: 7, offset: 1 }}>
            <InputChange
              handleChange={handleChange}
              value={get(props, "salesOrderState.shippingDetails.shipper_details2", "")}
              maxLength={255}
              type="shipper_details2"
              className="mt-0 mb-0 w-100"
              validateStatus={get(error, "shipper_details2") && "error"}
              helpText={get(error, "shipper_details2") ? "Shipper Details 2 cannot be empty" : ""}
              label="Shipper Details 2"
            />
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 10, offset: 1 }} lg={{ span: 7, offset: 1 }}>
            <InputChange
              handleChange={handleChange}
              value={get(props, "salesOrderState.shippingDetails.who_organizes", "")}
              maxLength={255}
              type="who_organizes"
              label="Who Organizes"
              onDropdownVisibleChange={() => {
                // eslint-disable-next-line
                // console.log("CALL CUSTOMER API");
              }}
              loading={false}
              validateStatus={get(error, "who_organizes") && "error"}
              helpText={get(error, "who_organizes") ? "Who Organizes cannot be empty" : ""}
              className="mt-0 mb-0 w-100"
            />
          </Col>
          <Col className="create-order-fields-padding" xs={{ span: 24 }} sm={{ span: 7 }} md={{ span: 11, offset: 1 }} lg={{ span: 7, offset: 0 }}>
            <InputChange
              handleChange={handleChange}
              value={get(props, "salesOrderState.shippingDetails.shipper_contact_name", "")}
              maxLength={100}
              type="shipper_contact_name"
              className="mt-0 mb-0 w-100"
              validateStatus={get(error, "shipper_contact_name") && "error"}
              helpText={get(error, "shipper_contact_name") ? "Contact Name cannot be empty" : ""}
              label="Shipper Contact Name"
            />
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 10, offset: 1 }} lg={{ span: 7, offset: 1 }}>
            {/* <InputChange
            handleChange={handleChange}
            value={get(props, "salesOrderState.shippingDetails.shipper_phone_no", "")}
            maxLength={20}
            type="shipper_phone_no"
            className="mt-0 mb-0 w-100"
            validateStatus={get(error, "shipper_phone_no") && "error"}
            helpText={
              // eslint-disable-next-line no-nested-ternary
              get(error, "shipper_phone_no")
                ? get(props, "salesOrderState.shippingDetails.shipper_phone_no", "")
                  ? "Invalid Shipper Phone Number"
                  : "Shipper Phone Number cannot be empty"
                : ""
            }
            label="Shipper Phone No"
          /> */}

            <Form layout="vertical">
              <Form.Item
                label={<span>Shipper Phone Number</span>}
                validateStatus={get(error, "shipper_phone_no") && "error"}
                help={get(error, "shipper_phone_no") ? "Enter Valid Phone Number" : ""}
                className="mt-0"
              >
                <PhoneInput
                  international
                  smartCaret
                  countryCallingCodeEditable={true}
                  placeholder="Enter phone number"
                  value={get(props, "salesOrderState.shippingDetails.shipper_phone_no", "")}
                  onChange={(value) => handleChange("shipper_phone_no", value)}
                />
              </Form.Item>
            </Form>
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 11, offset: 1 }} lg={{ span: 7, offset: 1 }}>
            <InputChange
              handleChange={handleChange}
              value={get(props, "salesOrderState.shippingDetails.shipper_email", "")}
              maxLength={100}
              type="shipper_email"
              className="mt-0 mb-0 w-100"
              validateStatus={get(error, "shipper_email") && "error"}
              helpText={get(error, "shipper_email") ? "Please fill this field with valid email" : ""}
              label="Shipper Email"
              handleBlur={handleBlur}
            />
          </Col>
          <Col className="create-order-fields-padding" xs={{ span: 24 }} sm={{ span: 7 }} md={{ span: 10, offset: 1 }} lg={{ span: 7, offset: 0 }}>
            <CustomDatePicker
              handleChange={handleChange}
              // value={get(
              //   props,
              //   "salesOrderState.shippingDetails.shipping_date",
              //   ""
              // )}
              type="shipping_date"
              className="mt-0 mb-0 w-100"
              label="Shipping Date"
              placeholder="Shipping Date"
              enableOnlyFutureDate={true}
              validateStatus={get(error, "shipping_date") && "error"}
              helpText={get(error, "shipping_date") ? "Shipping Date cannot be empty" : ""}
            />
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 15, offset: 1 }} md={{ span: 11, offset: 1 }} lg={{ span: 15, offset: 1 }}>
            <InputChange
              handleChange={handleChange}
              value={get(props, "salesOrderState.shippingDetails.shipping_term", "")}
              type="shipping_term"
              maxLength={255}
              label="Shipping Terms"
              className="mt-0 mb-0 w-100"
              validateStatus={get(error, "shipping_term") && "error"}
              helpText={get(error, "shipping_term") ? "Shipping Terms cannot be empty" : ""}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default connect(
  (state) => ({
    loading: get(state, "salesOrder.loading", false),
    error: get(state, "salesOrder.error", false),
    countryList: get(state, "salesOrder.countryList", []),
    stateList: get(state, "salesOrder.stateList", []),
    cityList: get(state, "salesOrder.cityList", []),
    customerDetail: get(state, "salesOrder.customerDetail", []),
  }),
  { getCountryList, getStateList, getCityList }
)(ShippingDetails);
