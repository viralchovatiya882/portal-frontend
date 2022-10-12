import { parseError } from "../utils";

export const initialState = {
    loading: true,
    error: false,
    action: false,
    loggedInUserDetails: [],
    isTokenVerified: false
};

// eslint-disable-next-line complexity
export default (state = initialState, action = {}) => {
    switch (action.type) {
        case "GET_USER_LOGIN_REQUEST":
        case "GET_TOKEN_VERIFY_REQUEST":
            return {
                ...state,
                loading: true,
                error: false,
                action: false
            };
        case "GET_USER_LOGIN_FAILURE":
        case "GET_TOKEN_VERIFY_FAILURE":
            return {
                ...state,
                loading: false,
                error: action.error.action === undefined ? parseError(action.error) : `Error: ${action.error.error}`,
                action: action.error.action !== undefined ? action.error.action : false
            };
        case "GET_USER_LOGIN_SUCCESS":
            return {
                ...state,
                loggedInUserDetails: action.response,
                loading: false,
                error: false,
                action: false
            };
        case "GET_TOKEN_VERIFY_SUCCESS":
            return {
                ...state,
                isTokenVerified: action.response,
                loading: false,
                error: false,
                action: false
            };
        default:
            return state;
    }
};
