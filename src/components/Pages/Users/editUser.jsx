import { Modal } from "antd";
import { get } from "lodash";
import React from "react";
import validator from "validator";
import { getRolesKeyValuePairFromArray } from "../../../helpers/utility";
import { CustomInputText as InputChange } from "../../UIComponents/Input/customInput";
import { SingleSelect as Select } from "../../UIComponents/Select/singleSelect";

const EditUser = props => {
  const [name, setName] = React.useState("");
  const [isChanged, setIsChanged] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState("");

  const [nameError, updateNameError] = React.useState(false);
  const [emailError, updateEmailError] = React.useState(false);
  const [roleError, updateRoleError] = React.useState(false);

  React.useEffect(() => {
    if (get(props, "isEdit", true)) {
      setEmail(get(props, "record.email", ""));
      setName(get(props, "record.name", ""));
      setRole(get(props, "record.role", ""));
    }
  }, []);

  const handleChange = React.useCallback((name, func, value) => {
    setIsChanged(true);
    const checkValue = value ? value : "";
    if (name === "email" && validator.isEmail(checkValue)) {
      updateEmailError(false);
    }

    if (name === "name" && !validator.isEmpty(checkValue)) {
      updateNameError(false);
    }

    if (name === "role" && !validator.isEmpty(checkValue)) {
      updateRoleError(false);
    }

    func(value);
  });

  const handleSave = () => {
    const userObj = { email, name, role };

    if (!email || !validator.isEmail(email)) {
      updateEmailError(true);
      return false;
    }

    if (!name || validator.isEmpty(name)) {
      updateNameError(true);
      return false;
    }

    if (!role || validator.isEmpty(role)) {
      updateRoleError(true);
      return false;
    }

    props.handleSubmit(userObj, isChanged);
  };

  return (
    <>
      <Modal
        title={`${get(props, "isEdit", true) ? "Edit" : "Add"} User`}
        centered
        visible={get(props, "isOpen", false)}
        onOk={() => handleSave()}
        okText="Save User"
        onCancel={() => props.handleClose(false)}
        className="user_management__edit_user"
      >
        <div className="mt-3">
          <InputChange
            value={email}
            type="email"
            required
            className="mt-2"
            validateStatus={emailError && "error"}
            helpText={emailError && "Enter valid Email"}
            handleChange={(key, value) => handleChange("email", setEmail, value)}
            disabled={get(props, "isEdit", true)}
            label="Email"
          />
          <InputChange
            handleChange={(key, value) => handleChange("name", setName, value)}
            type="name"
            className="mt-2"
            required
            validateStatus={nameError && "error"}
            helpText={nameError && "Name cannot be empty"}
            value={name}
            label="Name"
          />
          <Select
            handleChange={(key, value) => handleChange("role", setRole, value)}
            className="mt-2"
            type="role"
            validateStatus={roleError && "error"}
            helpText={roleError && "Select Role"}
            options={getRolesKeyValuePairFromArray(get(props, "userRoles", []))}
            value={role}
            onDropdownVisibleChange={() => props.fetchRoles()}
            required
            label="Role"
          />
        </div>
      </Modal>
    </>
  );
};

export default EditUser;
