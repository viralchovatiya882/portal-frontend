import { getKeyValuePair } from "@helpers/utility";
import { defaultRequestOptions } from "@settings";
import { getCityList, getCountryList, getStateList } from "@store/SalesOrder/sale.actions";
import { CustomDatePicker } from "@ui-components/DatePicker";
import { CustomInputText as InputChange } from "@ui-components/Input/customInput";
import { SingleSelect as Select } from "@ui-components/Select/singleSelect";
import { Button, Col, Form, Modal, Row, Spin } from "antd";
import { get } from "lodash";
import React from "react";
import PhoneInput from "react-phone-number-input";
import { useDispatch } from "react-redux";
import { terms } from "../constants";

const UpdateModal = (props) => {
  const handleChange = (key, value) => {
    props.handleChange(key, value);
  };

  const handleSubmit = () => {
    props.handleSubmit();
  };

  return (
    <>
      <Modal
        visible={get(props, "modalInfo.visible", false)}
        width={800}
        centered
        maskClosable={false}
        title={get(props, "modalInfo.title", "Update Details")}
        onCancel={() => props.onClose()}
        footer={[
          <Button key="link" type="ghost" onClick={() => props.onClose()}>
            Cancel
          </Button>,
          <Button key="back" onClick={() => props.handleReset()}>
            Reset
          </Button>,
          <Button key="submit" type="primary" loading={get(props, "isLoading", false)} onClick={() => handleSubmit()}>
            Update
          </Button>,
        ]}
      >
        <Spin spinning={get(props, "isLoading", false)}>
          <div className="new-sales-order">
            {get(props, "modalInfo.type") === "shipping_details" && <ShippingDetailsUI availableData={get(props, "availableData")} error={get(props, "error")} handleChange={handleChange} />}
            {get(props, "modalInfo.type") === "delivery_details" && <DeliveryDetailsUI availableData={get(props, "availableData")} error={get(props, "error")} handleChange={handleChange} />}
            {get(props, "modalInfo.type") === "customer_info" && <CustomerAccountDetailsUI availableData={get(props, "availableData")} handleChange={handleChange} />}
          </div>
        </Spin>
      </Modal>
    </>
  );
};

const ShippingDetailsUI = (props) => {
  return (
    <Row>
      <Col xs={{ span: 24 }} sm={{ span: 7 }} md={{ span: 11 }} lg={{ span: 7 }}>
        <InputChange
          handleChange={props.handleChange}
          value={get(props, "availableData.shipper_contact_name", "")}
          type="shipper_contact_name"
          className="mt-0 mb-0 w-100"
          label="Shipper Contact Name"
        />
      </Col>
      <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 11, offset: 2 }} lg={{ span: 7, offset: 1 }}>
        <Form layout="vertical">
          <Form.Item
            label={<span>Shipper Phone Number</span>}
            validateStatus={get(props, "error.shipper_phone_no") && "error"}
            help={get(props, "error.shipper_phone_no") ? "Enter valid Phone Number" : ""}
            className="mt-0"
          >
            <PhoneInput
              international
              smartCaret
              countryCallingCodeEditable={true}
              placeholder="Enter phone number"
              value={get(props, "availableData.shipper_phone_no", "")}
              onChange={(value) => props.handleChange("shipper_phone_no", value)}
            />
          </Form.Item>
        </Form>
      </Col>
      <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 11, offset: 0 }} lg={{ span: 7, offset: 1 }}>
        <InputChange
          handleChange={props.handleChange}
          value={get(props, "availableData.shipper_email", "")}
          type="shipper_email"
          validateStatus={get(props, "error.shipper_email") && "error"}
          helpText={get(props, "error.shipper_email") ? "Enter valid Email" : ""}
          className="mt-0 mb-0 w-100"
          label="Shipper Email"
        />
      </Col>
      <Col xs={{ span: 24 }} sm={{ span: 7 }} md={{ span: 11, offset: 2 }} lg={{ span: 7, offset: 0 }}>
        <InputChange handleChange={props.handleChange} value={get(props, "availableData.shipper_details1", "")} type="shipper_details1" className="mt-0 mb-0 w-100" label="Shipper Details 1" />
      </Col>
      <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 11, offset: 0 }} lg={{ span: 7, offset: 1 }}>
        <InputChange handleChange={props.handleChange} value={get(props, "availableData.shipper_details2", "")} type="shipper_details2" className="mt-0 mb-0 w-100" label="Shipper Details 2" />
      </Col>
      <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 11, offset: 2 }} lg={{ span: 7, offset: 1 }}>
        <InputChange handleChange={props.handleChange} value={get(props, "availableData.who_organizes", "")} type="who_organizes" label="Who Organizes" className="mt-0 mb-0 w-100" />
      </Col>
      <Col xs={{ span: 24 }} sm={{ span: 7 }} md={{ span: 11 }} lg={{ span: 7 }}>
        <CustomDatePicker
          handleChange={props.handleChange}
          value={get(props, "availableData.shipping_date", "")}
          type="shipping_date"
          enableOnlyFutureDate={true}
          className="mt-0 mb-0 w-100"
          label="Shipping Date"
          placeholder="Shipping Date"
        />
      </Col>
      <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 11, offset: 2 }} lg={{ span: 7, offset: 1 }}>
        <InputChange handleChange={props.handleChange} value={get(props, "availableData.shipping_term", "")} type="shipping_term" label="Shipping Term" className="mt-0 mb-0 w-100" />
      </Col>
    </Row>
  );
};

const DeliveryDetailsUI = (props) => {
  const [countryList, setCountryList] = React.useState([]);
  const [stateList, setStateList] = React.useState([]);
  const [cityList, setCityList] = React.useState([]);
  const [eoriNumberStatus, setEoriNumberStatus] = React.useState(false);
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (!get(props, "availableData.country", "")) {
      setStateList([]);
      setCityList([]);
    }

    if (!get(props, "availableData.state", "")) {
      getStateListing(get(props, "availableData.country", ""));
    }

    if (!get(props, "availableData.city", "")) {
      getCityListing(get(props, "availableData.state", ""));
    }

    if (!get(props, "availableData.eori_no", "")) {
      setEoriNumberStatus(false);
    }
  }, [props]);

  const getCountryListFunc = async () => {
    const countryListResp = await dispatch(
      getCountryList({
        ...defaultRequestOptions,
        page: "all",
      })
    );
    setCountryList(get(countryListResp, "response.data"));
    return get(countryListResp, "response.data");
  };

  const getStateListing = async (countrySelected, list = countryList) => {
    const selectedObj = list.find((item) => item.country_name === countrySelected);
    if (get(selectedObj, "id")) {
      const stateListResp = await dispatch(getStateList({ country_id: get(selectedObj, "id"), page: "all" }));
      setStateList(get(stateListResp, "response.data"));
      return get(stateListResp, "response.data");
    }
    return [];
  };

  const getCityListing = async (stateSelected, list = stateList) => {
    const selectedObj = list.find((item) => item.state_name === stateSelected);
    if (get(selectedObj, "id")) {
      const cityListResp = await dispatch(getCityList({ state_id: get(selectedObj, "id"), page: "all" }));
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

  const getCountryStatus = React.useCallback(
    (key, value) => {
      if (get(props, "error.country") && !eoriNumberStatus) {
        return "Country cannot be empty";
      }

      if (eoriNumberStatus) {
        return "EORI No (in Customer Details page) is mandatory for delivery to EU countries";
      }
    },
    [eoriNumberStatus]
  );

  return (
    <Row>
      <Col xs={{ span: 24 }} sm={{ span: 7 }} md={{ span: 11 }} lg={{ span: 7 }}>
        <InputChange
          handleChange={props.handleChange}
          value={get(props, "availableData.contact_name", "")}
          type="contact_name"
          required
          validateStatus={get(props, "error.contact_name") && "error"}
          helpText={get(props, "error.contact_name") ? "Enter valid Contact Name" : ""}
          className="mt-0 mb-0 w-100"
          label="Contact Name"
        />
      </Col>
      <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 11, offset: 2 }} lg={{ span: 7, offset: 1 }}>
        <Form layout="vertical">
          <Form.Item
            label={<span>Phone Number</span>}
            validateStatus={get(props, "error.phone_no") && "error"}
            help={get(props, "error.phone_no") ? "Enter valid Phone Number" : ""}
            required
            className="mt-0"
          >
            <PhoneInput
              international
              smartCaret
              countryCallingCodeEditable={true}
              placeholder="Enter phone number"
              value={get(props, "availableData.phone_no", "")}
              onChange={(value) => props.handleChange("phone_no", value)}
            />
          </Form.Item>
        </Form>
      </Col>
      <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 11, offset: 0 }} lg={{ span: 7, offset: 1 }}>
        <InputChange
          handleChange={props.handleChange}
          value={get(props, "availableData.email", "")}
          type="email"
          required
          validateStatus={get(props, "error.email") && "error"}
          helpText={get(props, "error.email") ? "Enter valid Email" : ""}
          className="mt-0 mb-0 w-100"
          label="Email"
        />
      </Col>
      <Col xs={{ span: 24 }} sm={{ span: 7 }} md={{ span: 11, offset: 2 }} lg={{ span: 7, offset: 0 }}>
        <InputChange
          handleChange={props.handleChange}
          value={get(props, "availableData.delivery_address1", "")}
          type="delivery_address1"
          required
          validateStatus={get(props, "error.delivery_address1") && "error"}
          helpText={get(props, "error.delivery_address1") ? "Delivery Address cannot be empty" : ""}
          className="mt-0 mb-0 w-100"
          label="Delivery Address 1"
        />
      </Col>
      <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 11, offset: 0 }} lg={{ span: 7, offset: 1 }}>
        <InputChange handleChange={props.handleChange} value={get(props, "availableData.delivery_address2", "")} type="delivery_address2" className="mt-0 mb-0 w-100" label="Delivery Address 2" />
      </Col>
      <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 11, offset: 2 }} lg={{ span: 7, offset: 1 }}>
        <InputChange handleChange={props.handleChange} value={get(props, "availableData.postal_code", "")} type="postal_code" label="Postal Code" className="mt-0 mb-0 w-100" />
      </Col>
      <Col xs={{ span: 24 }} sm={{ span: 7 }} md={{ span: 11 }} lg={{ span: 7 }}>
        <Select
          handleChange={(key, value) => {
            const selectedObj = countryList.find((item) => item.country_name === value);

            if (get(selectedObj, "is_member_of_european_union", "").toLowerCase() === "yes" && !get(props, "availableData.eori_no")) {
              setEoriNumberStatus(true);
            } else {
              setEoriNumberStatus(false);
              props.handleChange(key, value);
            }
          }}
          value={get(props, "availableData.country", "")}
          type="country"
          label="Country"
          required
          loading={false}
          placeholder="Search to Select Country"
          validateStatus={(get(props, "error.country") || eoriNumberStatus) && "error"}
          helpText={getCountryStatus()}
          options={getKeyValuePair(countryList, "country_name", false)}
          className="mt-0 mb-0"
          onDropdownVisibleChange={() => {
            if (countryList.length === 0) {
              getCountryListFunc();
            }
          }}
        />
      </Col>
      <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 11, offset: 2 }} lg={{ span: 7, offset: 1 }}>
        <Select
          handleChange={(key, value) => props.handleChange(key, value)}
          value={get(props, "availableData.state", "")}
          type="state"
          label="State"
          required
          enableAddNew={true}
          loading={false}
          disabled={!get(props, "availableData.country", "")}
          placeholder="Search to Select State"
          validateStatus={get(props, "error.state") && "error"}
          helpText={get(props, "error.state") ? "State Name cannot be empty" : ""}
          options={getKeyValuePair(stateList, "state_name", false)}
          className="mt-0 mb-0"
          onDropdownVisibleChange={() => {
            if (stateList.length === 0 && get(props, "availableData.country", "")) {
              getStateListFunc(get(props, "availableData.country", ""));
            }
          }}
        />
      </Col>
      <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 11, offset: 0 }} lg={{ span: 7, offset: 1 }}>
        <Select
          handleChange={(key, value) => props.handleChange(key, value)}
          value={get(props, "availableData.city", "")}
          type="city"
          label="City"
          required
          loading={false}
          enableAddNew={true}
          disabled={!get(props, "availableData.state", "")}
          placeholder="Search to Select City"
          validateStatus={get(props, "error.city") && "error"}
          helpText={get(props, "error.city") ? "City Name cannot be empty" : ""}
          options={getKeyValuePair(cityList, "city_name", false)}
          className="mt-0 mb-0"
          onDropdownVisibleChange={() => {
            if (cityList.length === 0) {
              getCityListFunc(get(props, "availableData.state", ""), get(props, "availableData.country", ""));
            }
          }}
        />
      </Col>
    </Row>
  );
};

const CustomerAccountDetailsUI = (props) => {
  return (
    <Row>
      <Col xs={{ span: 24 }} sm={{ span: 7 }} md={{ span: 11 }} lg={{ span: 7 }}>
        <InputChange handleChange={props.handleChange} value={get(props, "availableData.account_code", "")} type="account_code" className="mt-0 mb-0 w-100" label="Account Code" />
      </Col>
      <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 11, offset: 2 }} lg={{ span: 7, offset: 1 }}>
        <InputChange handleChange={props.handleChange} value={get(props, "availableData.vat_no", "")} type="vat_no" className="mt-0 mb-0 w-100" label="VAT No" />
      </Col>
      <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 11, offset: 0 }} lg={{ span: 7, offset: 1 }}>
        <Select
          handleChange={(key, value) => props.handleChange(key, value)}
          value={get(props, "availableData.payment_terms", "")}
          type="payment_terms"
          label="Payment Terms"
          placeholder="Select Payment Terms"
          options={terms}
          className="mt-0 mb-0"
        />
      </Col>
      <Col xs={{ span: 24 }} sm={{ span: 7 }} md={{ span: 11, offset: 2 }} lg={{ span: 7, offset: 0 }}>
        <InputChange handleChange={props.handleChange} value={get(props, "availableData.customer_po_no", "")} type="customer_po_no" className="mt-0 mb-0 w-100" label="Customer PO No." />
      </Col>
      <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 11, offset: 0 }} lg={{ span: 7, offset: 1 }}>
        <InputChange handleChange={props.handleChange} value={get(props, "availableData.warehouse_no", "")} type="warehouse_no" className="mt-0 mb-0 w-100" label="Warehouse No." />
      </Col>
      <Col xs={{ span: 24 }} sm={{ span: 7, offset: 1 }} md={{ span: 11, offset: 2 }} lg={{ span: 7, offset: 1 }}>
        <InputChange handleChange={props.handleChange} value={get(props, "availableData.eori_no", "")} type="eori_no" label="EORI No." className="mt-0 mb-0 w-100" />
      </Col>
      <Col xs={{ span: 24 }} sm={{ span: 7 }} md={{ span: 11 }} lg={{ span: 7 }}>
        <InputChange
          handleChange={props.handleChange}
          value={get(props, "availableData.excise_registration_no", "")}
          type="excise_registration_no"
          label="Excise Registration No."
          className="mt-0 mb-0 w-100"
        />
      </Col>
    </Row>
  );
};

export default UpdateModal;
