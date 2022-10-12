import { CustomInputText as InputChange, CustomInputTextArea as InputTextArea } from "@ui-components/Input/customInput";
import { Form, Col, Modal, Row, Tag, Spin } from "antd";
import { find, get } from "lodash";
import React from "react";
import PhoneInput, { isPossiblePhoneNumber } from "react-phone-number-input";
import { connect } from "react-redux";
import { getKeyValuePair } from "../../../../helpers/utility";
import { defaultRequestOptions } from "../../../../settings";
import { getCityList, getCountryList, getStateList } from "../../../../store/SalesOrder/sale.actions";
import { SingleSelect as Select } from "../../../UIComponents/Select/singleSelect";
import { defaultConvertToCustomerValues } from "../constants";
import { getConvertToCustomerValues, postalRegEx } from "../helper";

const ConvertToCustomer = props => {
  const [countryList, setCountryList] = React.useState([]);
  const [stateList, setStateList] = React.useState([]);
  const [cityList, setCityList] = React.useState([]);
  const [conversionObj, setConversionObj] = React.useState(defaultConvertToCustomerValues);
  const [error, setError] = React.useState({});

  React.useEffect(() => {
    setCountryList(get(props, "countryList.data", []));
    setStateList(get(props, "stateList.data", []));
    setCityList(get(props, "cityList.data", []));
  }, []);

  React.useEffect(() => {
    setConversionObj(getConvertToCustomerValues(get(props, "record", defaultConvertToCustomerValues)));
  }, [props.record]);

  const getCountryListFunc = async () => {
    const countryListResp = await props.getCountryList({
      ...defaultRequestOptions,
      page: "all",
    });
    setCountryList(get(countryListResp, "response.data"));
    return get(countryListResp, "response.data");
  };

  const getStateListing = async (countrySelected, list = countryList) => {
    const selectedObj = list.find(item => item.country_name === countrySelected);
    if (get(selectedObj, "id")) {
      const stateListResp = await props.getStateList({ country_id: get(selectedObj, "id"), page: "all" });
      setStateList(get(stateListResp, "response.data"));
      return get(stateListResp, "response.data");
    }
    return [];
  };

  const getCityListing = async (stateSelected, list = stateList) => {
    const selectedObj = list.find(item => item.state_name === stateSelected);
    if (get(selectedObj, "id")) {
      const cityListResp = await props.getCityList({ state_id: get(selectedObj, "id"), page: "all" });
      setCityList(get(cityListResp, "response.data"));
      return get(cityListResp, "response.data");
    }
    return [];
  };

  const getStateListFunc = async countrySelected => {
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

    let newProd = { ...conversionObj };
    if (key === "phone") {
      if (value.length <= 20) {
        newProd[key] = value;
        setConversionObj(newProd);
      }
      return;
    }

    if (key === "postal_code") {
      if (value.length <= 15 && value.length > 0) {
        if (postalRegEx(value)) {
          newProd[key] = value;
          setConversionObj(newProd);
        }
      } else if (value.length < 1) {
        newProd[key] = value;
        setConversionObj(newProd);
      }
      return;
    }

    if (key === "country") {
      newProd[key] = value;
      newProd["state"] = "";
      newProd["city"] = "";
      setConversionObj(newProd);
      getStateListFunc(value);
      return;
    }

    if (key === "state") {
      newProd[key] = value;
      newProd["city"] = "";
      setConversionObj(newProd);
      getCityListFunc(value);
      return;
    }

    newProd[key] = value;
    setConversionObj(newProd);
  });

  const handleOk = () => {
    let checkValues = { ...defaultConvertToCustomerValues };
    delete checkValues["postal_code"];
    delete checkValues["invoice_address2"];
    const verifiedValue = find(Object.keys(checkValues), function (o) {
      return !conversionObj[o];
    });

    if (get(conversionObj, "phone") && !isPossiblePhoneNumber(get(conversionObj, "phone"))) {
      let errorObj = { ...error };
      errorObj["phone"] = true;
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
    <Modal
      title="Convert the lead to a Customer"
      visible={get(props, "isModalVisible", false)}
      onOk={handleOk}
      centered
      okText="Convert Lead"
      width={850}
      onCancel={() => props.handleCancel()}
    >
      <Spin spinning={get(props, "isLoading", false)}>
        <p>
          Please ensure all required details are available before proceeding.The <b>Lead status</b> will be marked as
          <Tag color="#81ba11" className="ml-sm-2">
            Complete
          </Tag>{" "}
          and a new unique <b>Customer Entity</b> record will be created.
        </p>
        <Row>
          <Col xs={{ span: 24 }} sm={{ span: 11 }}>
            <InputChange
              handleChange={handleChange}
              value={get(conversionObj, "customer_entity_name", "")}
              type="customer_entity_name"
              required
              className="mt-0 mb-0 w-100"
              label="Customer Entity Name"
              validateStatus={get(error, "customer_entity_name") && "error"}
              helpText={get(error, "customer_entity_name") ? "Customer Entity Name cannot be empty" : ""}
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
              value={get(conversionObj, "phone", "")}
              type="phone"
              required
              className="mt-0 mb-0 w-100"
              label="Phone No"
              validateStatus={get(error, "phone") && "error"}
              helpText={get(error, "phone") ? "Phone Number cannot be empty" : ""}
            /> */}

            <Form layout="vertical">
              <Form.Item
                label={<span>Phone Number</span>}
                validateStatus={get(error, "phone") && "error"}
                help={get(error, "phone") ? "Enter Valid Phone Number" : ""}
                required
                className="mt-0 mb-0"
              >
                <PhoneInput
                  international
                  smartCaret
                  countryCallingCodeEditable={true}
                  placeholder="Enter phone number"
                  value={get(conversionObj, "phone", "")}
                  onChange={value => handleChange("phone", value)}
                />
              </Form.Item>
            </Form>
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 11, offset: 2 }} >
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
          <Col xs={{ span: 24 }} sm={{ span: 11, offset: 2 }} >
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
            <InputChange
              handleChange={handleChange}
              value={get(conversionObj, "postal_code", "")}
              type="postal_code"
              className="mt-0 mb-0 w-100"
              label="Postal Code"
            />
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 11, offset: 2 }} >
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
          <Col xs={{ span: 24 }} sm={{ span: 11, offset: 2 }} >
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
  state => ({
    error: get(state, "salesOrder.error", false),
    countryList: get(state, "salesOrder.countryList", []),
    stateList: get(state, "salesOrder.stateList", []),
    cityList: get(state, "salesOrder.cityList", []),
  }),
  { getCountryList, getStateList, getCityList }
)(ConvertToCustomer);
