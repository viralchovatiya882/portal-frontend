import { SaveOutlined, UndoOutlined } from "@ant-design/icons";
import { CustomInputText as InputChange, CustomInputTextArea as InputTextArea } from "@ui-components/Input/customInput";
import { Button, Col, Form, Row, Spin } from "antd";
import { get } from "lodash";
import React from "react";
import PhoneInput, { isPossiblePhoneNumber } from "react-phone-number-input";
import { connect } from "react-redux";
import { getKeyValuePair } from "../../../../helpers/utility";
import { defaultRequestOptions } from "../../../../settings";
import { updateLeadDetails } from "../../../../store/Leads/leads.actions";
import { getCityList, getCountryList, getStateList } from "../../../../store/SalesOrder/sale.actions";
import { SingleSelect as Select } from "../../../UIComponents/Select/singleSelect";
import { openNotificationWithIcon } from "../../../UIComponents/Toast/notification";
import { defaultConvertToCustomerValues } from "../constants";
import { postalRegEx } from "../helper";
import "./index.scss";

const LeadDetailsUpdateUI = props => {
  const [countryList, setCountryList] = React.useState([]);
  const [stateList, setStateList] = React.useState([]);
  const [cityList, setCityList] = React.useState([]);
  const [conversionObj, setConversionObj] = React.useState(defaultConvertToCustomerValues);
  const [loader, setSubmitLoader] = React.useState(false);
  const [error, setError] = React.useState({});

  React.useEffect(() => {
    setCountryList(get(props, "countryList.data", []));
    setStateList(get(props, "stateList.data", []));
    setCityList(get(props, "cityList.data", []));
  }, []);

  const getDefaultUpdates = () => {
    const record = {
      customer_entity_name: get(props, "customer_entity_name", ""),
      lead_id: get(props, "lead_id", ""),
      contact_name: get(props, "contact_name", ""),
      phone: get(props, "phone", ""),
      email: get(props, "email", ""),
      invoice_address1: get(props, "invoice_address1", ""),
      invoice_address2: get(props, "invoice_address2", ""),
      postal_code: get(props, "postal_code", ""),
      country: get(props, "country", ""),
      state: get(props, "state", ""),
      city: get(props, "city", ""),
    };

    setConversionObj(record);
  };

  React.useEffect(() => {
    getDefaultUpdates();
  }, [props.contact_name]);

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
    let newProd = { ...conversionObj };

    let errorObj = { ...error };
    errorObj[key] = false;
    setError(errorObj);

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
    setSubmitLoader(false);

    if (get(conversionObj, "phone") && !isPossiblePhoneNumber(get(conversionObj, "phone"))) {
      let errorObj = { ...error };
      errorObj["phone"] = true;
      setError(errorObj);
      return false;
    }

    handleSubmit();
  };

  const handleSubmit = async () => {
    const requestPayload = { ...conversionObj };
    let leadDetailsSubmitResponse = await props.updateLeadDetails(requestPayload);

    if (get(leadDetailsSubmitResponse, "response.status")) {
      openNotificationWithIcon("success", "Lead Details", `${get(leadDetailsSubmitResponse, "response.message", "Something Went Wrong")} `);
      setSubmitLoader(false);
      props.refetchDetails();
    }

    if (!get(leadDetailsSubmitResponse, "response.status")) {
      openNotificationWithIcon("info", "Lead Details", `${get(leadDetailsSubmitResponse, "response.message", "Something Went Wrong")} `);
    }

    if (get(leadDetailsSubmitResponse, "error", false)) {
      openNotificationWithIcon("error", "Lead Details", `${get(leadDetailsSubmitResponse, "error.message", "Something Went Wrong")} `);
    }
  };

  const isEditEligible = () => {
    return get(props, "disabled", false);
  };

  return (
    <Spin spinning={get(props, "isLoading", false)}>
      <div className="common_card_section">
        <Row>
          <Col xs={{ span: 24 }} sm={{ span: 11 }} md={{ span: 12 }} lg={{ span: 6 }}>
            <InputChange
              handleChange={handleChange}
              value={get(conversionObj, "customer_entity_name", "")}
              type="customer_entity_name"
              disabled={isEditEligible()}
              className="mt-0 mb-0 w-100"
              label="Customer Entity Name"
            />
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 11, offset: 1 }} md={{ span: 11 }} lg={{ span: 5, offset: 1 }}>
            <InputChange
              handleChange={handleChange}
              value={get(conversionObj, "contact_name", "")}
              type="contact_name"
              disabled={isEditEligible()}
              className="mt-0 mb-0 w-100"
              label="Contact Name"
            />
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 11 }} md={{ span: 12, offset: 0 }} lg={{ span: 5, offset: 1 }}>
            {/* <InputChange
            handleChange={handleChange}
            value={get(conversionObj, "phone", "")}
            type="phone"
            disabled={isEditEligible()}
            className="mt-0 mb-0 w-100"
            label="Phone No"
          /> */}
            <Form layout="vertical">
              <Form.Item
                label={<span>Phone Number</span>}
                validateStatus={get(error, "phone") && "error"}
                help={get(error, "phone") ? "Enter Valid Phone Number" : ""}
                className="mt-2"
              >
                <PhoneInput
                  international
                  smartCaret
                  disabled={isEditEligible()}
                  countryCallingCodeEditable={true}
                  placeholder="Enter phone number"
                  value={get(conversionObj, "phone", "")}
                  onChange={value => handleChange("phone", value)}
                />
              </Form.Item>
            </Form>
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 11, offset: 1 }} md={{ span: 11 }} lg={{ span: 5, offset: 1 }} >
            <InputChange
              disabled={isEditEligible()}
              handleChange={handleChange}
              value={get(conversionObj, "email", "")}
              type="email"
              className="mt-0 mb-0 w-100"
              label="Email"
            />
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 7 }} >
            <InputTextArea
              handleChange={handleChange}
              className="mt-0 mb-0 w-100"
              autoSize={{ minRows: 2, maxRows: 3 }}
              type="message"
              disabled
              value={get(conversionObj, "message", "")}
              label="Message"
            />
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }}>
            <InputTextArea
              handleChange={handleChange}
              className="mt-0 mb-0 w-100"
              disabled={isEditEligible()}
              autoSize={{ minRows: 2, maxRows: 3 }}
              type="invoice_address1"
              value={get(conversionObj, "invoice_address1", "")}
              label="Invoice Address 1"
            />
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }}>
            <InputTextArea
              handleChange={handleChange}
              className="mt-0 mb-0 w-100"
              disabled={isEditEligible()}
              autoSize={{ minRows: 2, maxRows: 3 }}
              type="invoice_address2"
              value={get(conversionObj, "invoice_address2", "")}
              label="Invoice Address 2"
            />
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 6 }}>
            <InputChange
              handleChange={handleChange}
              disabled={isEditEligible()}
              value={get(conversionObj, "postal_code", "")}
              type="postal_code"
              className="mt-0 mb-0 w-100"
              label="Postal Code"
            />
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 5, offset: 1 }} >
            <Select
              handleChange={handleChange}
              disabled={isEditEligible()}
              value={get(conversionObj, "country", "")}
              type="country"
              label="Country"
              options={getKeyValuePair(countryList, "country_name", false)}
              className="mt-0 mb-0"
              onDropdownVisibleChange={() => {
                if (countryList.length === 0) {
                  getCountryListFunc();
                }
              }}
            />
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 5, offset: 1 }} >
            <Select
              handleChange={(key, value) => handleChange(key, value)}
              value={get(conversionObj, "state", "")}
              type="state"
              disabled={isEditEligible()}
              label="State"
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
          <Col xs={{ span: 24 }} sm={{ span: 5, offset: 1 }} >
            <Select
              handleChange={(key, value) => handleChange(key, value)}
              value={get(conversionObj, "city", "")}
              type="city"
              label="City"
              disabled={isEditEligible()}
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
          <div className="float-right mb-3 ml-auto">
            <Button type="secondary" htmlType="reset" disabled={isEditEligible()} icon={<UndoOutlined />} onClick={() => getDefaultUpdates()}>
              Reset
            </Button>
            <Button
              type="primary"
              className="ml-3"
              disabled={isEditEligible()}
              icon={<SaveOutlined />}
              htmlType="submit"
              loading={loader}
              onClick={() => {
                setSubmitLoader(true);
                handleOk();
              }}
            >
              Save
            </Button>
          </div>
        </Row>
      </div>
    </Spin>
  );
};

export default connect(
  state => ({
    error: get(state, "salesOrder.error", false),
    countryList: get(state, "salesOrder.countryList", []),
    stateList: get(state, "salesOrder.stateList", []),
    cityList: get(state, "salesOrder.cityList", []),
  }),
  { getCountryList, getStateList, getCityList, updateLeadDetails }
)(LeadDetailsUpdateUI);
