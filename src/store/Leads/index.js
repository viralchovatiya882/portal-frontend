import { parseError } from "../utils";

export const initialState = {
  loading: true,
  addCustomerLoading: false,
  error: false,
  action: false,
  activeLeads: [],
  completedLeads: [],
  customerList: [],
};

// eslint-disable-next-line complexity
export default (state = initialState, action = {}) => {
  switch (action.type) {
    case "GET_ACTIVE_LEADS_REQUEST":
    case "GET_CUSTOMER_LISTING_REQUEST":
    case "GET_COMPLETED_LEADS_REQUEST":
    case "GET_CUSTOMER_DETAILS_REQUEST":
    case "GET_ACTIVE_ORDERS_REQUEST":
    case "GET_PAST_ORDERS_REQUEST":
    case "ADD_LEAD_REQUEST":
    case "GET_LEAD_DETAILS_REQUEST":
    case "CONVERT_LEAD_REQUEST":
    case "GET_LEAD_SOURCE_LIST_REQUEST":
    case "UPDATE_LEAD_REQUEST":
      return {
        ...state,
        loading: true,
        error: false,
        action: false,
      };
    case "ADD_NEW_CUSTOMER_REQUEST":
      return {
        ...state,
        addCustomerLoading: true,
        error: false,
        action: false,
      };
    case "GET_ACTIVE_LEADS_FAILURE":
    case "GET_CUSTOMER_LISTING_FAILURE":
    case "GET_COMPLETED_LEADS_FAILURE":
    case "GET_ACTIVE_ORDERS_FAILURE":
    case "GET_PAST_ORDERS_FAILURE":
    case "GET_LEAD_SOURCE_LIST_FAILURE":
    case "GET_CUSTOMER_DETAILS_FAILURE":
    case "ADD_LEAD_FAILURE":
    case "ADD_NEW_CUSTOMER_FAILURE":
    case "GET_LEAD_DETAILS_FAILURE":
    case "CONVERT_LEAD_FAILURE":
    case "UPDATE_LEAD_FAILURE":
      return {
        ...state,
        loading: false,
        addCustomerLoading: false,
        error: action.error.action === undefined ? parseError(action.error) : `Error: ${action.error.error}`,
        action: action.error.action !== undefined ? action.error.action : false,
      };
    case "GET_ACTIVE_LEADS_SUCCESS":
      return {
        ...state,
        activeLeads: action.response,
        loading: false,
        error: false,
        action: false,
      };
    case "GET_CUSTOMER_LISTING_SUCCESS":
      return {
        ...state,
        customerList: action.response,
        loading: false,
        error: false,
        action: false,
      };
    case "GET_COMPLETED_LEADS_SUCCESS":
      return {
        ...state,
        completedLeads: action.response,
        loading: false,
        error: false,
        action: false,
      };
    case "ADD_LEAD_SUCCESS":
    case "ADD_NEW_CUSTOMER_SUCCESS":
    case "GET_LEAD_DETAILS_SUCCESS":
    case "GET_ACTIVE_ORDERS_SUCCESS":
    case "GET_PAST_ORDERS_SUCCESS":
    case "GET_CUSTOMER_DETAILS_SUCCESS":
    case "CONVERT_LEAD_SUCCESS":
    case "UPDATE_LEAD_SUCCESS":
    case "GET_LEAD_SOURCE_LIST_SUCCESS":
      return {
        ...state,
        loading: false,
        addCustomerLoading: false,
        error: false,
        action: false,
      };
    default:
      return state;
  }
};
