import { parseError } from "../utils";

export const initialState = {
  loading: false,
  cancelledSalesOrders: [],
  cancelledSalesOrderLoading: false,
  error: false,
  action: false,
  casedGoods: [],
  casedGoodsForOrderDetails: [],
  manageSalesOrders: [],
  completedSalesOrders: [],
  manageSalesOrderLoading: false,
  currentOrderDetails: [],
  isOrderDetailsLoading: false,
  customerList: [],
  salesAssociateList: [],
  customerDetail: {},
  addCustomerResp: {},
  countryList: [],
  stateList: [],
  cityList: [],
  docuSignResp: {},
  productDesc: {},
  inputJSON: {},
  aosANDSopHtml: {},
};

// eslint-disable-next-line complexity
export default (state = initialState, action = {}) => {
  switch (action.type) {
    case "GET_CASEDGOODS_DATA_REQUEST":
    case "GET_CASED_GOODS_ORDER_DETAILS_DATA_REQUEST":
    case "GET_CUSTOMER_LIST_REQUEST":
    case "GET_CUSTOMER_DETAIL_REQUEST":
    case "ADD_CUSTOMER_REQUEST":
    case "ADD_SPIRITS_REQUEST":
    case "ADD_COUNTRY_REQUEST":
    case "ADD_STATE_REQUEST":
    case "ADD_CITY_REQUEST":
    case "DOCUSIGN_REQUEST":
    case "PRODUCT_DESC_REQUEST":
    case "GET_SALES_ORDERS_REQUEST":
    case "GET_SALES_ASSOCIATE_LIST_REQUEST":
    case "CANCEL_SALES_ORDERS_REQUEST":
    case "INPUT_JSON_REQUEST":
    case "GET_HTML_REQUEST":
    case "RETRIGGER_EMAIL_REQUEST":
    case "PROFORMA_EMAIL_REQUEST":
    case "RETRIGGER_NEW_EMAIL_REQUEST":
    case "":
      return {
        ...state,
        loading: true,
        error: false,
        action: false,
      };
    case "CANCELLED_ORDERS_SALES_REQUEST":
      return {
        ...state,
        loading: false,
        cancelledSalesOrderLoading: true,
        error: false,
        action: false,
      };
    case "MANAGE_SALES_REQUEST":
      return {
        ...state,
        loading: false,
        manageSalesOrderLoading: true,
        error: false,
        action: false,
      };
    case "GET_SALES_ORDER_DETAILS_REQUEST":
      return {
        ...state,
        loading: false,
        isOrderDetailsLoading: true,
        error: false,
        action: false,
      };
    case "GET_CASEDGOODS_DATA_FAILURE":
    case "GET_CASED_GOODS_ORDER_DETAILS_DATA_FAILURE":
    case "GET_CUSTOMER_LIST_FAILURE":
    case "GET_CUSTOMER_DETAIL_FAILURE":
    case "ADD_CUSTOMER_FAILURE":
    case "ADD_SPIRITS_FAILURE":
    case "ADD_COUNTRY_FAILURE":
    case "ADD_STATE_FAILURE":
    case "ADD_CITY_FAILURE":
    case "DOCUSIGN_FAILURE":
    case "PRODUCT_DESC_FAILURE":
    case "GET_SALES_ASSOCIATE_LIST_FAILURE":
    case "GET_SALES_ORDERS_FAILURE":
    case "CANCEL_SALES_ORDERS_FAILURE":
    case "INPUT_JSON_FAILURE":
    case "GET_HTML_FAILURE":
    case "MANAGE_SALES_FAILURE":
    case "RETRIGGER_EMAIL_FAILURE":
    case "PROFORMA_EMAIL_FAILURE":
    case "RETRIGGER_NEW_EMAIL_FAILURE":
    case "GET_SALES_ORDER_DETAILS_FAILURE":
    case "COMPLETED_SALES_ORDER_FAILURE":
    case "CANCELLED_ORDERS_SALES_FAILURE":
      return {
        ...state,
        loading: false,
        manageSalesOrderLoading: false,
        cancelledSalesOrderLoading: false,
        isOrderDetailsLoading: false,
        error: action.error.action === undefined ? parseError(action.error) : `Error: ${action.error.error}`,
        action: action.error.action !== undefined ? action.error.action : false,
      };
    case "GET_CASEDGOODS_DATA_SUCCESS":
      return {
        ...state,
        casedGoods: action.response,
        loading: false,
        error: false,
        action: false,
      };
    case "GET_CASED_GOODS_ORDER_DETAILS_DATA_SUCCESS":
      return {
        ...state,
        casedGoodsForOrderDetails: action.response,
        loading: false,
        error: false,
        action: false,
      };
    case "GET_CUSTOMER_LIST_SUCCESS":
      return {
        ...state,
        customerList: action.response,
        loading: false,
        error: false,
        action: false,
      };
    case "GET_SALES_ASSOCIATE_LIST_SUCCESS":
      return {
        ...state,
        salesAssociateList: action.response,
        loading: false,
        error: false,
        action: false,
      };
    case "GET_CUSTOMER_DETAIL_SUCCESS":
      return {
        ...state,
        customerDetail: action.response,
        loading: false,
        error: false,
        action: false,
      };
    case "GET_SALES_ORDER_DETAILS_SUCCESS":
      return {
        ...state,
        currentOrderDetails: action.response,
        isOrderDetailsLoading: false,
        error: false,
        action: false,
      };
    case "ADD_CUSTOMER_SUCCESS":
      return {
        ...state,
        addCustomerResp: action.response,
        loading: false,
        error: false,
        action: false,
      };
    case "ADD_COUNTRY_SUCCESS":
      return {
        ...state,
        countryList: action.response,
        loading: false,
        error: false,
        action: false,
      };
    case "ADD_STATE_SUCCESS":
      return {
        ...state,
        stateList: action.response,
        loading: false,
        error: false,
        action: false,
      };
    case "ADD_CITY_SUCCESS":
      return {
        ...state,
        cityList: action.response,
        loading: false,
        error: false,
        action: false,
      };
    case "DOCUSIGN_SUCCESS":
      return {
        ...state,
        docuSignResp: action.response,
        loading: false,
        error: false,
        action: false,
      };
    case "PRODUCT_DESC_SUCCESS":
      return {
        ...state,
        productDesc: action.response,
        loading: false,
        error: false,
        action: false,
      };
    case "GET_SALES_ORDERS_SUCCESS":
      return {
        ...state,
        salesOrdersResp: action.response,
        loading: false,
        error: false,
        action: false,
      };
    case "COMPLETED_SALES_ORDER_SUCCESS":
      return {
        ...state,
        completedSalesOrders: action.response,
        loading: false,
        error: false,
        action: false,
      };
    case "CANCEL_SALES_ORDERS_SUCCESS":
    case "ADD_SPIRITS_SUCCESS":
      return {
        ...state,
        loading: false,
        error: false,
        action: false,
      };
    case "INPUT_JSON_SUCCESS":
      return {
        ...state,
        inputJSON: action.response,
        loading: false,
        error: false,
        action: false,
      };
    case "GET_HTML_SUCCESS":
      return {
        ...state,
        aosANDSopHtml: action.response,
        loading: false,
        error: false,
        action: false,
      };
    case "RETRIGGER_EMAIL_SUCCESS":
    case "PROFORMA_EMAIL_SUCCESS":
    case "RETRIGGER_NEW_EMAIL_SUCCESS":
      return {
        ...state,
        loading: false,
        error: false,
        action: false,
      };
    case "CANCELLED_ORDERS_SALES_SUCCESS":
      return {
        ...state,
        cancelledSalesOrders: action.response,
        loading: false,
        cancelledSalesOrderLoading: false,
        error: false,
        action: false,
      };
    case "MANAGE_SALES_SUCCESS":
      return {
        ...state,
        manageSalesOrders: action.response,
        loading: false,
        manageSalesOrderLoading: false,
        error: false,
        action: false,
      };
    case "GET_CUSTOMER_DETAIL_SUCCESS":
      return {
        ...state,
        manageSalesOrders: action.response,
        loading: false,
        manageSalesOrderLoading: false,
        error: false,
        action: false,
      };
    default:
      return state;
  }
};
