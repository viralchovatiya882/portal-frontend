import { CustomInputText as InputChange, CustomInputTextArea as InputTextArea } from "@ui-components/Input/customInput";
import { Col, Form, Modal, Row, Spin } from "antd";
import { find, get } from "lodash";
import React from "react";
import PhoneInput, { isPossiblePhoneNumber } from "react-phone-number-input";
import { connect } from "react-redux";
import { getKeyValuePair } from "../../../../../helpers/utility";
import { defaultRequestOptions } from "../../../../../settings";
import { getCityList, getCountryList, getStateList } from "../../../../../store/SalesOrder/sale.actions";
import { SingleSelect as Select } from "../../../../UIComponents/Select/singleSelect";
import { defaultAddCustomerValues } from "../../constants";
import { postalRegEx } from "../../helper";

const AddCustomer = (props) => {
  const [countryList, setCountryList] = React.useState([]);
  const [stateList, setStateList] = React.useState([]);
  const [cityList, setCityList] = React.useState([]);
  const [conversionObj, setConversionObj] = React.useState(defaultAddCustomerValues);
  const [error, setError] = React.useState({});

  React.useEffect(() => {
    setCountryList(get(props, "countryList.data", []));
    setStateList(get(props, "stateList.data", []));
    setCityList(get(props, "cityList.data", []));
  }, []);

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

  const handleChange = React.useCallback((key, value) => {
    let errorObj = { ...error };
    errorObj[key] = false;
    setError(errorObj);
    let computeValue = value ? value : "";
    let newProd = { ...conversionObj };
    if (key === "phone_no") {
      if (computeValue.length <= 20) {
        newProd[key] = computeValue;
        setConversionObj(newProd);
      }
      return;
    }

    if (key === "postal_code") {
      if (computeValue.length <= 15 && computeValue.length > 0) {
        if (postalRegEx(computeValue)) {
          newProd[key] = computeValue;
          setConversionObj(newProd);
        }
      } else if (computeValue.length < 1) {
        newProd[key] = computeValue;
        setConversionObj(newProd);
      }
      return;
    }

    if (key === "country") {
      newProd[key] = computeValue;
      newProd["state"] = "";
      newProd["city"] = "";
      setConversionObj(newProd);
      getStateListFunc(computeValue);
      return;
    }

    if (key === "state") {
      newProd[key] = computeValue;
      newProd["city"] = "";
      setConversionObj(newProd);
      getCityListFunc(computeValue);
      return;
    }

    newProd[key] = computeValue;
    setConversionObj(newProd);
  });

  const handleOk = () => {
    let checkValues = { ...defaultAddCustomerValues };
    delete checkValues["postal_code"];
    delete checkValues["invoice_address2"];
    const verifiedValue = find(Object.keys(checkValues), function (o) {
      return !conversionObj[o];
    });
    if (get(conversionObj, "phone_no") && !isPossiblePhoneNumber(get(conversionObj, "phone_no"))) {
      let errorObj = { ...error };
      errorObj["phone_no"] = true;
      setError(errorObj);
      return false;
    }
    if (verifiedValue) {
      let errorObj = { ...error };
      errorObj[verifiedValue] = true;
      setError(errorObj);
      return false;
    }
    props.handleSubmit(conversionObj);
  };

  return (
    <Modal title="Add Customer" visible={get(props, "isModalVisible", false)} onOk={handleOk} centered okText="Save Customer" width={850} onCancel={() => props.handleCancel()}>
      <Spin spinning={get(props, "isLoading", false)}>
        <Row>
          <Col xs={{ span: 24 }} sm={{ span: 11 }}>
            <InputChange
              handleChange={handleChange}
              value={get(conversionObj, "name", "")}
              type="name"
              required
              className="mt-0 mb-0 w-100"
              label="Customer Entity Name"
              validateStatus={get(error, "name") && "error"}
              helpText={get(error, "name") ? "Name cannot be empty" : ""}
            />
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 11, offset: 2 }}>
            <InputChange
              handleChange={handleChange}
              value={get(conversionObj, "contact_name", "")}
              type="contact_name"
              required
              className="mt-0 mb-0 w-100"
              label="Contact Name"
              validateStatus={get(error, "contact_name") && "error"}
              helpText={get(error, "contact_name") ? "Contact Name cannot be empty" : ""}
            />
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 11 }}>
            {/* <InputChange
              handleChange={handleChange}
              value={get(conversionObj, "phone_no", "")}
              type="phone_no"
              required
              className="mt-0 mb-0 w-100"
              label="Phone No"
              validateStatus={get(error, "phone_no") && "error"}
              helpText={get(error, "phone_no") ? "Phone Number cannot be empty" : ""}
            /> */}
            <Form layout="vertical">
              <Form.Item
                label={<span>Phone Number</span>}
                validateStatus={get(error, "phone_no") && "error"}
                help={get(error, "phone_no") ? "Phone Number cannot be empty" : ""}
                required
                className="mt-0 mb-0"
              >
                <PhoneInput
                  international
                  smartCaret
                  countryCallingCodeEditable={true}
                  placeholder="Enter phone number"
                  value={get(conversionObj, "phone_no", "")}
                  onChange={(value) => handleChange("phone_no", value)}
                />
              </Form.Item>
            </Form>
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 11, offset: 2 }}>
            <InputChange
              handleChange={handleChange}
              value={get(conversionObj, "email", "")}
              required
              type="email"
              className="mt-0 mb-0 w-100"
              label="Email"
              validateStatus={get(error, "email") && "error"}
              helpText={get(error, "email") ? "Email cannot be empty" : ""}
            />
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 11 }}>
            <InputTextArea
              handleChange={handleChange}
              className="mt-0 mb-0 w-100"
              autoSize={{ minRows: 2, maxRows: 3 }}
              type="invoice_address1"
              required
              value={get(conversionObj, "invoice_address1", "")}
              label="Invoice Address 1"
              validateStatus={get(error, "invoice_address1") && "error"}
              helpText={get(error, "invoice_address1") ? "Invoice Address 1 cannot be empty" : ""}
            />
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 11, offset: 2 }}>
            <InputTextArea
              handleChange={handleChange}
              className="mt-0 mb-0 w-100"
              autoSize={{ minRows: 2, maxRows: 3 }}
              type="invoice_address2"
              value={get(conversionObj, "invoice_address2", "")}
              label="Invoice Address 2"
            />
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 11 }}>
            <InputChange handleChange={handleChange} value={get(conversionObj, "postal_code", "")} type="postal_code" className="mt-0 mb-0 w-100" label="Postal Code" />
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 11, offset: 2 }}>
            <Select
              handleChange={handleChange}
              value={get(conversionObj, "country", "")}
              type="country"
              label="Country"
              required
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
          <Col xs={{ span: 24 }} sm={{ span: 11 }}>
            <Select
              handleChange={(key, value) => handleChange(key, value)}
              value={get(conversionObj, "state", "")}
              type="state"
              label="State"
              required
              validateStatus={get(error, "state") && "error"}
              helpText={get(error, "state") ? "State cannot be empty" : ""}
              enableAddNew={true}
              options={getKeyValuePair(stateList, "state_name", false)}
              className="mt-0 mb-0"
              onDropdownVisibleChange={() => {
                if (stateList.length === 0) {
                  getStateListFunc(get(conversionObj, "country", ""));
                }
              }}
            />
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 11, offset: 2 }}>
            <Select
              handleChange={(key, value) => handleChange(key, value)}
              value={get(conversionObj, "city", "")}
              type="city"
              label="City"
              required
              validateStatus={get(error, "city") && "error"}
              helpText={get(error, "city") ? "City cannot be empty" : ""}
              enableAddNew={true}
              options={getKeyValuePair(cityList, "city_name", false)}
              className="mt-0 mb-0"
              onDropdownVisibleChange={() => {
                if (cityList.length === 0) {
                  getCityListFunc(get(conversionObj, "state", ""), get(conversionObj, "country", ""));
                }
              }}
            />
          </Col>
        </Row>
      </Spin>
    </Modal>
  );
};

export default connect(
  (state) => ({
    error: get(state, "salesOrder.error", false),
    countryList: get(state, "salesOrder.countryList", []),
    stateList: get(state, "salesOrder.stateList", []),
    cityList: get(state, "salesOrder.cityList", []),
  }),
  { getCountryList, getStateList, getCityList }
)(AddCustomer);
