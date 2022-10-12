import { parseError } from "../utils";

export const initialState = {
    loading: true,
    rolesLoading: true,
    error: false,
    action: false,
    usersDataList: [],
    userRoles: []
};

// eslint-disable-next-line complexity
export default (state = initialState, action = {}) => {
    switch (action.type) {
        case "GET_USER_ROLES_REQUEST":
        case "GET_USERS_REQUEST":
        case "GET_ADD_USER_REQUEST":
        case "GET_UPADTE_USER_REQUEST":
            return {
                ...state,
                loading: true,
                error: false,
                rolesLoading: true,
                action: false
            };
        case "GET_USERS_FAILURE":
        case "GET_USER_ROLES_FAILURE":
        case "GET_ADD_USER_FAILURE":
        case "GET_UPDATE_USER_FAILURE":
            return {
                ...state,
                loading: false,
                rolesLoading: false,
                error: action.error.action === undefined ? parseError(action.error) : `Error: ${action.error.error}`,
                action: action.error.action !== undefined ? action.error.action : false
            };
        case "GET_USERS_SUCCESS":
            return {
                ...state,
                usersDataList: action.response,
                loading: false,
                error: false,
                rolesLoading: false,
                action: false
            };
        case "GET_USER_ROLES_SUCCESS":
            return {
                ...state,
                userRoles: action.response,
                rolesLoading: false,
                loading: false,
                error: false,
                action: false
            };
        case "GET_ADD_USER_SUCCESS":
            const userAdded = { ...action.response.data, ...state.usersDataList.data };
            let addedUserData = state.usersDataList;
            addedUserData["data"] = userAdded;
            return {
                ...state,
                usersDataList: addedUserData,
                loading: false,
                rolesLoading: false,
                error: false,
                action: false
            };
        case "GET_UPDATE_USER_SUCCESS":
            const userUpdated = { ...action.response.data, ...state.usersDataList.data };
            let updatedUserData = state.usersDataList;
            updatedUserData["data"] = userUpdated;
            return {
                ...state,
                usersDataList: updatedUserData,
                loading: false,
                rolesLoading: false,
                error: false,
                action: false
            };
        default:
            return state;
    }
};
