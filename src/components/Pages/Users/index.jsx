import { InfoCircleOutlined } from "@ant-design/icons";
import { get } from "lodash";
import React from "react";
import { connect } from "react-redux";
import { staticTextInventory, TableColumnsList } from "../../../constants";
import { defaultRequestOptions } from "../../../settings";
import { addUser, getUserRoles, getUsers, updateUser } from "../../../store/Users/users.actions";
import ErrorBoundary from "../../UIComponents/ErrorBoundary";
import Heading from "../../UIComponents/Heading";
import { SearchInput } from "../../UIComponents/Search";
import CustomTable from "../../UIComponents/Table/responsiveTable";
import { openNotificationWithIcon } from "../../UIComponents/Toast/notification";
import EditUser from "./editUser";
import { getDataWrapper } from "./getData";
import "./index.scss";

/**
 * Renders User list component
 */
const UserManagement = props => {
  const [expectedData, setExpectedData] = React.useState([]);
  const [userRoles, setUserRoles] = React.useState([]);
  const [expectedMetaData, setExpectedMetaData] = React.useState([]);
  const [expectedClonedData, setExpectedClonedData] = React.useState([]);
  const [isEditable, setIsEditable] = React.useState(false);
  const [addUser, setAddUser] = React.useState(false);
  const [selectedRecord, setSelectedRecord] = React.useState({});
  const [clearSearchString, setClearSearchString] = React.useState(false);

  const updateUsersList = data => {
    setExpectedData(getDataWrapper(data));
    if (expectedClonedData.length === 0) {
      setExpectedClonedData(getDataWrapper(data));
    }
  };

  const fetchUserRoles = async () => {
    const userRolesList = await props.getUserRoles();

    if (get(userRolesList, "response.status")) {
      setUserRoles(get(userRolesList, "response.user_roles", []));
    }

    if (!get(userRolesList, "response.status")) {
      openNotificationWithIcon("info", "User", `${get(userRolesList, "response.message", "Something Went Wrong")} `);
    }

    if (get(userRolesList, "error", false)) {
      openNotificationWithIcon("error", "User", `${get(userRolesList, "error.message", "Something Went Wrong")} `);
    }
  };

  const fetchUsersList = async requestOptions => {
    let userList = await props.getUsers(requestOptions);

    if (get(userList, "response.status")) {
      updateUsersList(get(userList, "response.data"));
      setExpectedMetaData(get(userList, "response.meta"));
    }

    if (!get(userList, "response.status")) {
      openNotificationWithIcon("info", "User", `${get(userList, "response.message", "Something Went Wrong")} `);
    }

    if (get(userList, "error", false)) {
      openNotificationWithIcon("error", "User", `${get(userList, "error.message", "Something Went Wrong")} `);
    }
  };

  const init = () => {
    // if (get(props, "userAvailableRoles.user_roles", []).length === 0) {
    //   fetchUserRoles();
    // } else {
    //   setUserRoles(get(props, "userAvailableRoles.user_roles", []));
    // }

    fetchUsersList(defaultRequestOptions);

    // if (get(props, "userData.data", []).length === 0) {
    //     fetchUsersList(defaultRequestOptions);
    // } else {
    //     setExpectedMetaData(get(props, "userData.meta", []));
    //     updateUsersList(get(props, "userData.data", []));
    // }

    if (props.usersError) {
      openNotificationWithIcon("error", "User", get(props, "usersError", "Something went wrong"));
    }
  };

  const EditOrAddUser = async (requestOptions, userObj) => {
    const evaluatedUserObj = { ...userObj, ...requestOptions };
    let userList = {};

    if (addUser) {
      userList = await props.addUser(evaluatedUserObj);
    } else {
      userList = await props.updateUser(evaluatedUserObj);
    }

    if (get(userList, "response.status")) {
      await fetchUsersList(defaultRequestOptions);
      openNotificationWithIcon("success", "User", `${get(userList, "response.message", addUser ? "Added Successfully" : "Updated Successfully")} `);
    }

    if (!get(userList, "response.status")) {
      openNotificationWithIcon("info", "User", `${get(userList, "response.message", "Something Went Wrong")} `);
    }

    if (get(userList, "error", false)) {
      openNotificationWithIcon("error", "User", `${get(userList, "error.message", "Something Went Wrong")} `);
    }

    handleClose();
  };

  const isCleared = () => {
    setExpectedData(expectedClonedData);
    setClearSearchString(true);
  };

  const handleSearch = searchedData => {
    if (get(searchedData, "isClient", true)) {
      setExpectedData(get(searchedData, "filteredData", []));
    }
  };

  const handleUserEdit = record => {
    setSelectedRecord(record);
    setIsEditable(true);
  };

  const handleUserSubmit = (userObj, isChanged) => {
    if (isChanged) {
      EditOrAddUser(defaultRequestOptions, userObj);
    } else {
      openNotificationWithIcon("info", "User", "Everything is upto date");
      handleClose();
    }
  };

  const handleAdd = () => {
    setAddUser(true);
  };

  const handleClose = () => {
    setIsEditable(false);
    setAddUser(false);
  };

  React.useEffect(() => {
    init();
  }, []);

  return (
    <>
      <Heading text="User Management" variant="h4" />
      {(isEditable || addUser) && (
        <EditUser
          isOpen={isEditable || addUser}
          isEdit={!addUser}
          userRoles={userRoles}
          record={selectedRecord}
          fetchRoles={() => {
            if (get(props, "userAvailableRoles.user_roles", []).length === 0) {
              fetchUserRoles();
            } else {
              setUserRoles(get(props, "userAvailableRoles.user_roles", []));
            }
          }}
          handleClose={() => handleClose()}
          handleSubmit={(userObj, isChanged) => handleUserSubmit(userObj, isChanged)}
        />
      )}
      <div className="bg-white p-4 table-responsive-padding">
        <ErrorBoundary>
          <div className="search_filter_position search_filter_card">
            <SearchInput data={expectedClonedData} handleSearch={handleSearch} clearSearchString={clearSearchString} />
            {/* <label className="pl-sm-3 pt-2">
              <InfoCircleOutlined />
              <span className="pl-2" dangerouslySetInnerHTML={{ __html: staticTextInventory }} />
            </label> */}
          </div>
          <CustomTable
            data={expectedData}
            meta={expectedMetaData}
            clonedData={expectedClonedData}
            handleEdit={handleUserEdit}
            handleAdd={handleAdd}
            columnType={TableColumnsList.Users}
            isLoading={get(props, "usersLoading", false)}
            isGlobalFilterEnabled={true}
            onFilter={payload => fetchUsersList({ ...defaultRequestOptions, searchable_columns: payload })}
            onReset={() => fetchUsersList(defaultRequestOptions)}
            isCleared={() => isCleared()}
          />
        </ErrorBoundary>
      </div>
    </>
  );
};

export default connect(
  state => ({
    usersLoading: state.users.loading,
    userRolesLoading: state.users.rolesLoading,
    usersError: state.users.error,
    userData: state.users.usersDataList,
    userAvailableRoles: state.users.userRoles
  }),
  { getUsers, getUserRoles, addUser, updateUser }
)(UserManagement);
