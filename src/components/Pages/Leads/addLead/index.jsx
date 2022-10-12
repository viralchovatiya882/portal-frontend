import { getRequestHeader } from "@helpers/service";
import { CustomDatePicker } from "@ui-components/DatePicker";
import { Col, Form, Modal, Row, Spin } from "antd";
import axios from "axios";
import { find, get } from "lodash";
import moment from "moment";
import React from "react";
import PhoneInput, { isPossiblePhoneNumber } from "react-phone-number-input";
import { useSelector } from "react-redux";
import validator from "validator";
import { getKeyValuePair } from "../../../../helpers/utility";
import { CustomInputText as InputChange, CustomInputTextArea as InputTextArea } from "../../../UIComponents/Input/customInput";
import { SingleSelect as Select } from "../../../UIComponents/Select/singleSelect";
import { openNotificationWithIcon } from "../../../UIComponents/Toast/notification";

const AddORUpdateUser = props => {
  const [contact_name, setContactName] = React.useState("");
  const [isChanged, setIsChanged] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [phone, setPhoneNo] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [status, setStatus] = React.useState("new");
  const [follow_up_date, setFollowUpDate] = React.useState("");
  const [lead_source, setLeadSource] = React.useState("");
  const [sales_associate, setSalesAssociate] = React.useState("");

  const [leadSourceOptions, setLeadSourceOptions] = React.useState([]);
  const [statusOptions, setStatusOptions] = React.useState([]);
  const [salesAssociatesOptions, setSalesAssociatesOptions] = React.useState([]);

  const [contactNameError, updateContactNameError] = React.useState(false);
  const [salesAssociateError, updateSalesAssociateError] = React.useState(false);
  const [messageError, updateMessageError] = React.useState(false);
  const [phoneNoError, updatePhoneNoError] = React.useState(false);
  const [leadSourceError, updateLeadSourceError] = React.useState(false);
  const [followUpDateError, updateFollowUpDateError] = React.useState(false);
  const [emailError, updateEmailError] = React.useState(false);
  const [statusError, updateStatusError] = React.useState(false);

  const loggedInUserRole = useSelector(state => {
    return get(state, "auth.loggedInUserDetails.data", null);
  });

  React.useEffect(() => {
    if (get(loggedInUserRole, "role") === "salesAssociate") {
      setSalesAssociate(get(loggedInUserRole, "name"));
      // setSalesAssociatesOptions([{ name: get(loggedInUserRole, "name"), email: get(loggedInUserRole, "email") }]);
    }
  }, [loggedInUserRole]);

  React.useEffect(() => {
    init();
    let nextDate = new Date();
    nextDate.setDate(new Date().getDate() + 6);
    const dateFormat = "YYYY-MM-DD";
    setFollowUpDate(moment(nextDate).format(dateFormat));
  }, []);

  const handleChange = React.useCallback((name, func, value) => {
    setIsChanged(true);
    const checkValue = value ? value : "";

    if (name === "lead_source" && !validator.isEmpty(checkValue)) {
      updateLeadSourceError(false);
    }

    if (name === "follow_up_date" && !validator.isEmpty(checkValue)) {
      updateFollowUpDateError(false);
    }

    if (name === "phone" && !validator.isEmpty(checkValue)) {
      updatePhoneNoError(false);
    }

    if (name === "email" && validator.isEmail(checkValue)) {
      updateEmailError(false);
    }

    if (name === "contact_name" && !validator.isEmpty(checkValue)) {
      updateContactNameError(false);
    }

    if (name === "message" && !validator.isEmpty(checkValue)) {
      updateMessageError(false);
    }

    if (name === "status" && !validator.isEmpty(checkValue)) {
      updateStatusError(false);
    }

    if (name === "sales_associate" && !validator.isEmpty(checkValue)) {
      updateSalesAssociateError(false);
    }

    func(value);
  });

  const init = () => {
    getLeadSourceList();
    getLeadStatusList();
  };

  const getLeadSourceList = async (status, lead_id) => {
    const getLeadSourceListResp = await axios({
      method: "GET",
      url: `${process.env.REACT_APP_API_ENDPOINT}/api/leads/lead_source_list`,
      headers: { ...getRequestHeader() },
    }).catch(err => {
      openNotificationWithIcon("error", "Lead Source List", `${get(err, "response.data.message", "Something Went Wrong")} `);
    });

    if (get(getLeadSourceListResp, "error", false)) {
      openNotificationWithIcon("error", "Lead Source List", `${get(getLeadSourceListResp, "data.message", "Something Went Wrong")} `);
    }

    if (get(getLeadSourceListResp, "data.status")) {
      setLeadSourceOptions(get(getLeadSourceListResp, "data.data", []));
    } else {
      openNotificationWithIcon("error", "Lead Source List", get(getLeadSourceListResp, "data.message", "Something Went Wrong"));
    }
  };

  const getLeadStatusList = async () => {
    const getLeadStatusListResp = await axios({
      method: "GET",
      url: `${process.env.REACT_APP_API_ENDPOINT}/api/leads/lead_status_list`,
      headers: { ...getRequestHeader() },
    }).catch(err => {
      openNotificationWithIcon("error", "Lead Status List", `${get(err, "response.data.message", "Something Went Wrong")} `);
    });

    if (get(getLeadStatusListResp, "error", false)) {
      openNotificationWithIcon("error", "Lead Status List", `${get(getLeadStatusListResp, "data.message", "Something Went Wrong")} `);
    }

    if (get(getLeadStatusListResp, "data.status")) {
      setStatusOptions(get(getLeadStatusListResp, "data.data", []));
    } else {
      openNotificationWithIcon("error", "Lead Status List", get(getLeadStatusListResp, "data.message", "Something Went Wrong"));
    }
  };

  const getSalesAssociateList = async () => {
    const getSalesAssociateListResp = await axios({
      method: "GET",
      url: `${process.env.REACT_APP_API_ENDPOINT}/api/getSalesAssociates`,
      headers: { ...getRequestHeader() },
    }).catch(err => {
      openNotificationWithIcon("error", "Sales List", `${get(err, "response.data.message", "Something Went Wrong")} `);
    });

    if (get(getSalesAssociateListResp, "error", false)) {
      openNotificationWithIcon("error", "Sales List", `${get(getSalesAssociateListResp, "data.message", "Something Went Wrong")} `);
    }

    if (get(getSalesAssociateListResp, "data.status")) {
      setSalesAssociatesOptions([...salesAssociatesOptions, ...get(getSalesAssociateListResp, "data.data", [])]);
    } else {
      openNotificationWithIcon("error", "Sales List", get(getSalesAssociateListResp, "data.message", "Something Went Wrong"));
    }
  };

  const handleSave = () => {
    const userObj = { email, contact_name, status, lead_source, message, phone, sales_associate, follow_up_date };

    if (!lead_source || validator.isEmpty(lead_source)) {
      updateLeadSourceError(true);
      return false;
    }

    if (!status || validator.isEmpty(status)) {
      updateStatusError(true);
      return false;
    }

    if (!contact_name || validator.isEmpty(contact_name)) {
      updateContactNameError(true);
      return false;
    }

    if (!follow_up_date || validator.isEmpty(follow_up_date)) {
      updateFollowUpDateError(true);
      return false;
    }

    if (!email || !validator.isEmail(email)) {
      updateEmailError(true);
      return false;
    }

    if (!phone || validator.isEmpty(phone)) {
      updatePhoneNoError(true);
      return false;
    }

    if (phone && !isPossiblePhoneNumber(phone)) {
      updatePhoneNoError(true);
      return false;
    }

    if (!sales_associate || validator.isEmpty(sales_associate)) {
      updateSalesAssociateError(true);
      return false;
    }

    if (sales_associate) {
      const findSelectedKeyObj = find(salesAssociatesOptions, function (o) {
        return get(o, "name") === sales_associate;
      });
      userObj["sales_associate"] = findSelectedKeyObj ? get(findSelectedKeyObj, "email") : get(loggedInUserRole, "email");
    }

    // if (!message || validator.isEmpty(message)) {
    //   updateMessageError(true);
    //   return false;
    // }

    props.handleSubmit(userObj, isChanged);
  };

  return (
    <>
      <Modal
        title="Add Lead"
        centered
        width={650}
        visible={get(props, "isOpen", false)}
        onOk={() => handleSave()}
        okText="Save Lead"
        onCancel={() => props.handleClose(false)}
        className="user_management__edit_user"
      >
        <div className="mt-3">
          <Spin spinning={get(props, "isLoading", false)}>
            <Row>
              <Col xs={{ span: 24 }} sm={{ span: 11 }}>
                <Select
                  handleChange={(key, value) => handleChange("lead_source", setLeadSource, value)}
                  className="mt-2"
                  type="lead_source"
                  validateStatus={leadSourceError && "error"}
                  helpText={leadSourceError && "Select Lead Source"}
                  options={leadSourceOptions}
                  value={lead_source}
                  enableAddNew={true}
                  required
                  label="Lead Source"
                />
              </Col>
              <Col xs={{ span: 24 }} sm={{ span: 11, offset: 2 }}>
                <Select
                  handleChange={(key, value) => handleChange("status", setStatus, value)}
                  className="mt-2"
                  type="status"
                  defaultValue="new"
                  validateStatus={statusError && "error"}
                  helpText={statusError && "Select Status"}
                  options={statusOptions}
                  value={status}
                  required
                  label="Status"
                />
              </Col>
              <Col xs={{ span: 24 }} sm={{ span: 11 }}>
                <InputChange
                  handleChange={(key, value) => handleChange("contact_name", setContactName, value)}
                  type="contact_name"
                  className="mt-2"
                  required
                  validateStatus={contactNameError && "error"}
                  helpText={contactNameError && "Contact Name cannot be empty"}
                  value={contact_name}
                  label="Contact Name"
                />
              </Col>
              <Col xs={{ span: 24 }} sm={{ span: 11, offset: 2 }}>
                <CustomDatePicker
                  handleChange={(key, value) => handleChange("follow_up_date", setFollowUpDate, value)}
                  type="follow_up_date"
                  value={follow_up_date}
                  required
                  enableOnlyFutureDate={true}
                  validateStatus={followUpDateError && "error"}
                  helpText={followUpDateError ? "A.Y.S should be less than Bottling Date" : ""}
                  className="mt-0 mb-0 w-100"
                  label="Follow Up Date (YYYY-MM-DD)"
                  placeholder="Follow Up Date (YYYY-MM-DD)"
                />
              </Col>
              <Col xs={{ span: 24 }} sm={{ span: 11 }}>
                <InputChange
                  value={email}
                  type="email"
                  required
                  className="mt-2"
                  validateStatus={emailError && "error"}
                  helpText={emailError && "Enter valid Email"}
                  handleChange={(key, value) => handleChange("email", setEmail, value)}
                  label="Email"
                />
              </Col>
              <Col xs={{ span: 24 }} sm={{ span: 11, offset: 2 }}>
                {/* <InputChange
                  value={phone}
                  type="phone"
                  required
                  className="mt-2"
                  validateStatus={phoneNoError && "error"}
                  helpText={phoneNoError && "Enter valid Phone Number"}
                  handleChange={(key, value) => handleChange("phone", setPhoneNo, value)}
                  label="Phone Number"
                /> */}
                <Form layout="vertical">
                  <Form.Item
                    label={<span>Phone Number</span>}
                    validateStatus={phoneNoError && "error"}
                    help={phoneNoError && "Enter valid Phone Number"}
                    required
                    className="mt-2"
                  >
                    <PhoneInput
                      international
                      smartCaret
                      countryCallingCodeEditable={true}
                      placeholder="Enter phone number"
                      value={phone}
                      onChange={value => handleChange("phone", setPhoneNo, value)}
                    />
                  </Form.Item>
                </Form>
              </Col>
              <Col xs={{ span: 24 }} sm={{ span: 11 }}>
                <Select
                  handleChange={(key, value) => handleChange("sales_associate", setSalesAssociate, value)}
                  className="mt-2"
                  type="sales_associate"
                  validateStatus={salesAssociateError && "error"}
                  helpText={salesAssociateError && "Select Sales Associate"}
                  options={getKeyValuePair(salesAssociatesOptions, "name")}
                  onDropdownVisibleChange={() => {
                    if (salesAssociatesOptions.length === 0) {
                      getSalesAssociateList();
                    }
                  }}
                  value={sales_associate}
                  required
                  label="Mapped Sales Associate"
                />
              </Col>
              <Col xs={{ span: 24 }} span={24}>
                <InputTextArea
                  handleChange={(key, value) => handleChange("message", setMessage, value)}
                  value={message}
                  type="comments"
                  validateStatus={messageError && "error"}
                  helpText={messageError && "Message cannot be empty"}
                  label="Message"
                />
              </Col>
            </Row>
          </Spin>
        </div>
      </Modal>
    </>
  );
};

export default AddORUpdateUser;
