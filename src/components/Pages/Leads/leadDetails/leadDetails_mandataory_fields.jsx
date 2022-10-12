import { SaveOutlined, UndoOutlined } from "@ant-design/icons";
import { CustomInputText as InputChange, CustomInputTextArea as InputTextArea } from "@ui-components/Input/customInput";
import { Button, Col, message, Row, Spin } from "antd";
import { find, get } from "lodash";
import React from "react";
import { connect } from "react-redux";
import { getKeyValuePair } from "../../../../helpers/utility";
import { defaultRequestOptions } from "../../../../settings";
import { convertLead } from "../../../../store/Leads/leads.actions";
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
  const [error, setError] = React.useState({});
  const [loader, setSubmitLoader] = React.useState(false);

  React.useEffect(() => {
    setCountryList(get(props, "countryList.data", []));
    setStateList(get(props, "stateList.data", []));
    setCityList(get(props, "cityList.data", []));
  }, []);

  const getDefaultUpdates = () => {
    const record = {
      name: get(props, "name", ""),
      lead_id: get(props, "lead_id", ""),
      contact_name: get(props, "contact_name", ""),
      phone_no: get(props, "phone_no", ""),
      email: get(props, "email", ""),
      invoice_address1: get(props, "customer_details.invoice_address1", ""),
      invoice_address2: get(props, "customer_details.invoice_address2", ""),
      postal_code: get(props, "postal_code", ""),
      country: get(props, "country", ""),
      state: get(props, "state", ""),
      city: get(props, "city", ""),
    };
    setError({});
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
    let errorObj = { ...error };
    errorObj[key] = false;
    setError(errorObj);

    let newProd = { ...conversionObj };
    if (key === "phone_no") {
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
    if (verifiedValue) {
      let errorObj = { ...error };
      errorObj[verifiedValue] = true;
      setError(errorObj);
      setSubmitLoader(false);
      return false;
    }
    message.info("Coming Soon");
    setSubmitLoader(false);
    // handleSubmit(conversionObj);
  };

  const handleSubmit = async requestObj => {
    const requestPayload = { ...requestObj };
    let leadDetailsSubmitResponse = await props.convertLead(requestPayload);

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

  return (
    <Spin spinning={get(props, "isLoading", false)}>
      <Row>
        <Col span={6}>
          <InputChange
            handleChange={handleChange}
            value={get(conversionObj, "name", "")}
            type="name"
            required
            disabled
            className="mt-0 mb-0 w-100"
            label="Customer Entity Name"
            validateStatus={get(error, "name") && "error"}
            helpText={get(error, "name") ? "Customer Entity Name cannot be empty" : ""}
          />
        </Col>
        <Col span={5} offset={1}>
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
        <Col span={5} offset={1}>
          <InputChange
            handleChange={handleChange}
            value={get(conversionObj, "phone_no", "")}
            type="phone_no"
            required
            className="mt-0 mb-0 w-100"
            label="Phone No"
            validateStatus={get(error, "phone_no") && "error"}
            helpText={get(error, "phone_no") ? "Phone Number cannot be empty" : ""}
          />
        </Col>
        <Col span={5} offset={1}>
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
        <Col span={7}>
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
        <Col span={7} offset={1}>
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
        <Col span={7} offset={1}>
          <InputTextArea
            handleChange={handleChange}
            className="mt-0 mb-0 w-100"
            autoSize={{ minRows: 2, maxRows: 3 }}
            type="invoice_address2"
            value={get(conversionObj, "invoice_address2", "")}
            label="Invoice Address 2"
          />
        </Col>
        <Col span={6}>
          <InputChange
            handleChange={handleChange}
            value={get(conversionObj, "postal_code", "")}
            type="postal_code"
            className="mt-0 mb-0 w-100"
            label="Postal Code"
          />
        </Col>
        <Col span={5} offset={1}>
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
        <Col span={5} offset={1}>
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
        <Col span={5} offset={1}>
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
      <div className="float-right mb-3">
        <Button type="secondary" htmlType="reset" icon={<UndoOutlined />} onClick={() => getDefaultUpdates()}>
          Reset
        </Button>
        <Button
          type="primary"
          className="ml-3"
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
  { getCountryList, getStateList, getCityList, convertLead }
)(LeadDetailsUpdateUI);
