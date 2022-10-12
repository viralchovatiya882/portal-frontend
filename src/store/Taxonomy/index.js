import { defaultTaxonomyMasterDataListName } from "../../constants";
import { parseError } from "../utils";

export const initialState = {
  isDataLoading: true,
  loading: true,
  error: false,
  action: false,
  masterData: [],
  masterAllData: [],
  masterDataList: [],
  currentActiveTab: defaultTaxonomyMasterDataListName
};

// eslint-disable-next-line complexity
export default (state = initialState, action = {}) => {
  switch (action.type) {
    case "GET_TAXONOMYDATA_REQUEST":
    case "GET_TAXONOMYLIST_REQUEST":
    case "UPDATE_TAXONOMY_STATUS_REQUEST":
      return {
        ...state,
        loading: true,
        isDataLoading: true,
        error: false,
        action: false
      };

    case "GET_TAXONOMYDATA_FAILURE":
    case "GET_TAXONOMYLIST_FAILURE":
    case "UPDATE_TAXONOMY_STATUS_FAILURE":
      return {
        ...state,
        loading: false,
        isDataLoading: false,
        error: action.error.action === undefined ? parseError(action.error) : `Error: ${action.error.error}`,
        action: action.error.action !== undefined ? action.error.action : false
      };

    case "GET_TAXONOMYDATA_SUCCESS":
      const responseData = { ...action.response, requestPayload: action.requestPayload };
      return {
        ...state,
        masterData: responseData,
        loading: false,
        isDataLoading: false,
        error: false,
        action: false
      };
    case "GET_TAXONOMYLIST_SUCCESS":
      return {
        ...state,
        masterDataList: action.response,
        loading: false,
        isDataLoading: false,
        error: false,
        action: false
      };
    case "UPDATE_TAXONOMY_DATA":
      const taxonomyDataAdded = { ...state.masterAllData, ...action.response };
      return {
        ...state,
        masterAllData: taxonomyDataAdded,
        loading: false,
        // error: false,
        action: false
      };
    case "SET_TAXONOMY_TAB":
      return {
        ...state,
        currentActiveTab: action.response,
        loading: false,
        error: false,
        action: false
      };
    case "UPDATE_TAXONOMY_STATUS_SUCCESS":
      return {
        ...state,
        loading: false,
        error: false,
        action: false
      };
    default:
      return state;
  }
};
