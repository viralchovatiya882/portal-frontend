import { parseError } from "../utils";

export const initialState = {
  loading: true,
  error: false,
  action: false,
  casedGoods: [],
  deletedCasedGoods: [],
  changeLogs: [],
  tags: [],
  additionChangeLogs: [],
  deletionChangeLogs: [],
  pricingParameters: [],
  priceChangeLogs: [],
  pricingParametersLoading: false,
};

// eslint-disable-next-line complexity
export default (state = initialState, action = {}) => {
  switch (action.type) {
    case "GET_CASEDGOODS_REQUEST":
    case "GET_DELETED_CASEDGOODS_REQUEST":
    case "ADD_CASEDGOODS_REQUEST":
    case "EDIT_CASEDGOODS_REQUEST":
    case "UPDATE_PRICE_CASEDGOODS_REQUEST":
    case "UPDATE_QUANTITY_CASEDGOODS_REQUEST":
    case "GET_CASEDGOODS_TAGS_REQUEST":
    case "GET_CASEDGOODS_CHANGELOG_REQUEST":
    case "GET_CASEDGOODS_ADDITION_CHANGELOG_REQUEST":
    case "GET_CASEDGOODS_DELETION_CHANGELOG_REQUEST":
    case "GET_CASEDGOODS_PRICE_CHANGELOG_REQUEST":
    case "DELETE_CASEDGOODS_DETAILS_REQUEST":
      return {
        ...state,
        loading: true,
        error: false,
        action: false,
      };

    case "GET_CASEDGOODS_PRICING_PARAMETERS_REQUEST":
      return {
        ...state,
        pricingParametersLoading: true,
        error: false,
        action: false,
      };

    case "GET_CASEDGOODS_DETAILS_REQUEST":
      return {
        ...state,
        detailsloading: true,
        error: false,
        action: false,
      };

    case "GET_CASEDGOODS_FAILURE":
    case "GET_DELETED_CASEDGOODS_FAILURE":
    case "ADD_CASEDGOODS_FAILURE":
    case "EDIT_CASEDGOODS_FAILURE":
    case "GET_CASEDGOODS_CHANGELOG_FAILURE":
    case "GET_CASEDGOODS_ADDITION_CHANGELOG_FAILURE":
    case "GET_CASEDGOODS_DELETION_CHANGELOG_FAILURE":
    case "GET_CASEDGOODS_PRICING_PARAMETERS_FAILURE":
    case "GET_CASEDGOODS_DETAILS_FAILURE":
    case "DELETE_CASEDGOODS_DETAILS_FAILURE":
    case "UPDATE_PRICE_CASEDGOODS_FAILURE":
    case "UPDATE_QUANTITY_CASEDGOODS_FAILURE":
    case "GET_CASEDGOODS_TAGS_FAILURE":
    case "GET_CASEDGOODS_PRICE_CHANGELOG_FAILURE":
      return {
        ...state,
        loading: false,
        detailsloading: false,
        pricingParametersLoading: false,
        error:
          action.error.action === undefined
            ? parseError(action.error)
            : `Error: ${action.error.error}`,
        action: action.error.action !== undefined ? action.error.action : false,
      };
    case "GET_CASEDGOODS_SUCCESS":
      return {
        ...state,
        casedGoods: action.response,
        loading: false,
        error: false,
        action: false,
      };
    case "GET_DELETED_CASEDGOODS_SUCCESS":
      return {
        ...state,
        deletedCasedGoods: action.response,
        loading: false,
        error: false,
        action: false,
      };
    case "ADD_CASEDGOODS_SUCCESS":
    case "EDIT_CASEDGOODS_SUCCESS":
    case "DELETE_CASEDGOODS_DETAILS_SUCCESS":
    case "UPDATE_PRICE_CASEDGOODS_SUCCESS":
    case "UPDATE_QUANTITY_CASEDGOODS_SUCCESS":
      return {
        ...state,
        loading: false,
        error: false,
        action: false,
      };

    case "GET_CASEDGOODS_PRICING_PARAMETERS_SUCCESS":
      return {
        ...state,
        loading: false,
        pricingParameters: action.response,
        pricingParametersLoading: false,
        error: false,
        action: false,
      };
    case "GET_CASEDGOODS_TAGS_SUCCESS":
      return {
        ...state,
        loading: false,
        tags: action.response,
        error: false,
        action: false,
      };
    case "GET_CASEDGOODS_CHANGELOG_SUCCESS":
      return {
        ...state,
        loading: false,
        changeLogs: action.response,
        error: false,
        action: false,
      };
    case "GET_CASEDGOODS_ADDITION_CHANGELOG_SUCCESS":
      return {
        ...state,
        loading: false,
        additionChangeLogs: action.response,
        error: false,
        action: false,
      };
    case "GET_CASEDGOODS_PRICE_CHANGELOG_SUCCESS":
      return {
        ...state,
        loading: false,
        priceChangeLogs: action.response,
        error: false,
        action: false,
      };
    case "GET_CASEDGOODS_DELETION_CHANGELOG_SUCCESS":
      return {
        ...state,
        loading: false,
        deletionChangeLogs: action.response,
        error: false,
        action: false,
      };
    case "GET_CASEDGOODS_DETAILS_SUCCESS":
      return {
        ...state,
        detailsloading: false,
        error: false,
        action: false,
      };
    default:
      return state;
  }
};
