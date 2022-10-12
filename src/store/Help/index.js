import { parseError } from "../utils";

export const initialState = {
    loading: true,
    error: false,
    action: false,
    helpDetails: []
};

// eslint-disable-next-line complexity
export default (state = initialState, action = {}) => {
    switch (action.type) {
        case "ADD_HELP_REQUEST":
        case "GET_HELP_LIST_REQUEST":
            return {
                ...state,
                loading: true,
                error: false,
                action: false
            };
        case "ADD_HELP_FAILURE":
        case "GET_HELP_LIST_FAILURE":
            return {
                ...state,
                loading: false,
                error: action.error.action === undefined ? parseError(action.error) : `Error: ${action.error.error}`,
                action: action.error.action !== undefined ? action.error.action : false
            };
        case "ADD_HELP_SUCCESS":
            const helpListDataAdded = { ...action.response, ...state.helpList };
            return {
                ...state,
                helpDetails: action.response,
                helpList: helpListDataAdded,
                loading: false,
                error: false,
                action: false
            };
        case "GET_HELP_LIST_SUCCESS":
            return {
                ...state,
                helpList: action.response,
                loading: false,
                error: false,
                action: false
            };
        default:
            return state;
    }
};
