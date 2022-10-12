export const getCasedGoodsUri = `${process.env.REACT_APP_API_ENDPOINT}/api/add_spirits_listing`;
export const getCasedGoodsForOrderDetailsUri = `${process.env.REACT_APP_API_ENDPOINT}/api/add_spirits_orderdetails_listing`;
export const customerDetailUri = `${process.env.REACT_APP_API_ENDPOINT}/api/customer_details`;
export const customerListUri = `${process.env.REACT_APP_API_ENDPOINT}/api/customer_list`;
export const salesAssociateListUri = `${process.env.REACT_APP_API_ENDPOINT}/api/getSalesAssociates`;
export const addCustomerUri = `${process.env.REACT_APP_API_ENDPOINT}/api/addCustomer`;
export const countryListUri = `${process.env.REACT_APP_API_ENDPOINT}/api/country`;
export const stateListUri = `${process.env.REACT_APP_API_ENDPOINT}/api/state`;
export const cityListUri = `${process.env.REACT_APP_API_ENDPOINT}/api/city`;
export const addSalesOrder = `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/add
`;
export const productDescUri = `${process.env.REACT_APP_API_ENDPOINT}/api/productDescription
`;
export const salesOrdersUri = `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/track_your_order`;
export const cancelSalesOrdersUri = `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/update_fulfillment_status`;
export const inputJSONUri = `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/inputJson`;
export const getSOPAOSHTMLUri = `${process.env.REACT_APP_API_ENDPOINT}/docusign/get_sop_aos_html`;
export const getResignRequestURi = `${process.env.REACT_APP_API_ENDPOINT}/docusign/trigger_docusign_mail`;
export const getProformaRequestURi = `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/send_proforma_mail`;
export const getRetriggerEmailRequestURi = `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/retrigger_mail`;
export const getCancelledSalesOrderURi = `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/cancelled_orders`;
export const getManageSalesOrderURi = `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/manage_orders`;
export const getCompletedSalesOrderURi = `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/completed_orders`;
export const getSalesOrderDetailsURi = `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/order_details`;
export const addSpiritsURi = `${process.env.REACT_APP_API_ENDPOINT}/api/salesorder/add_spirits`;

export const getCasedGoodsData = request => ({
  types: ["GET_CASEDGOODS_DATA_REQUEST", "GET_CASEDGOODS_DATA_SUCCESS", "GET_CASEDGOODS_DATA_FAILURE"],
  request: http => http.post(getCasedGoodsUri, request),
});

export const getCasedGoodsDataForOrderDetails = request => ({
  types: ["GET_CASED_GOODS_ORDER_DETAILS_DATA_REQUEST", "GET_CASED_GOODS_ORDER_DETAILS_DATA_SUCCESS", "GET_CASED_GOODS_ORDER_DETAILS_DATA_FAILURE"],
  request: http => http.post(getCasedGoodsForOrderDetailsUri, request),
});
export const getCustomerList = request => ({
  types: ["GET_CUSTOMER_LIST_REQUEST", "GET_CUSTOMER_LIST_SUCCESS", "GET_CUSTOMER_LIST_FAILURE"],
  request: http => http.post(customerListUri, request),
});

export const getSalesAssociateList = request => ({
  types: ["GET_SALES_ASSOCIATE_LIST_REQUEST", "GET_SALES_ASSOCIATE_LIST_SUCCESS", "GET_SALES_ASSOCIATE_LIST_FAILURE"],
  request: http => http.get(salesAssociateListUri, request),
});

export const getCustomerDetail = id => ({
  types: ["GET_CUSTOMER_DETAIL_REQUEST", "GET_CUSTOMER_DETAIL_SUCCESS", "GET_CUSTOMER_DETAIL_FAILURE"],
  request: http => http.get(`${customerDetailUri}/${id}`),
});

export const addCustomer = request => ({
  types: ["ADD_CUSTOMER_REQUEST", "ADD_CUSTOMER_SUCCESS", "ADD_CUSTOMER_FAILURE"],
  request: http => http.post(addCustomerUri, request),
});

export const addSpirits = request => ({
  types: ["ADD_SPIRITS_REQUEST", "ADD_SPIRITS_SUCCESS", "ADD_SPIRITS_FAILURE"],
  request: http => http.post(addSpiritsURi, request),
});
export const getCountryList = request => ({
  types: ["ADD_COUNTRY_REQUEST", "ADD_COUNTRY_SUCCESS", "ADD_COUNTRY_FAILURE"],
  request: http => http.post(countryListUri, request),
});
export const getStateList = request => ({
  types: ["ADD_STATE_REQUEST", "ADD_STATE_SUCCESS", "ADD_STATE_FAILURE"],
  request: http => http.post(stateListUri, request),
});
export const getCityList = request => ({
  types: ["ADD_CITY_REQUEST", "ADD_CITY_SUCCESS", "ADD_CITY_FAILURE"],
  request: http => http.post(cityListUri, request),
});
export const createOrderRequest = request => ({
  types: ["DOCUSIGN_REQUEST", "DOCUSIGN_SUCCESS", "DOCUSIGN_FAILURE"],
  request: http => http.post(addSalesOrder, request),
});
export const getProductDesc = request => ({
  types: ["PRODUCT_DESC_REQUEST", "PRODUCT_DESC_SUCCESS", "PRODUCT_DESC_FAILURE"],
  request: http => http.post(productDescUri, request),
});
export const getInputJSON = request => ({
  types: ["INPUT_JSON_REQUEST", "INPUT_JSON_SUCCESS", "INPUT_JSON_FAILURE"],
  request: http => http.get(inputJSONUri),
});
export const getSalesOrdersRequest = request => ({
  types: ["GET_SALES_ORDERS_REQEUST", "GET_SALES_ORDERS_SUCCESS", "GET_SALES_ORDERS_FAILURE"],
  request: http => http.post(salesOrdersUri, request),
});

export const cancelSalesOrdersRequest = request => ({
  types: ["CANCEL_SALES_ORDERS_REQEUST", "CANCEL_SALES_ORDERS_SUCCESS", "CANCEL_SALES_ORDERS_FAILURE"],
  request: http => http.post(cancelSalesOrdersUri, request),
});
export const getAosSopHtml = request => ({
  types: ["GET_HTML_REQUEST", "GET_HTML_SUCCESS", "GET_HTML_FAILURE"],
  request: http => http.post(getSOPAOSHTMLUri, request),
});

export const getRetriggerRequest = request => ({
  types: ["RETRIGGER_EMAIL_REQUEST", "RETRIGGER_EMAIL_SUCCESS", "RETRIGGER_EMAIL_FAILURE"],
  request: http => http.post(getResignRequestURi, request),
});

export const getProformaRequest = request => ({
  types: ["PROFORMA_EMAIL_REQUEST", "PROFORMA_EMAIL_SUCCESS", "PROFORMA_EMAIL_FAILURE"],
  request: http => http.post(getProformaRequestURi, request),
});

export const getRetriggerEmailRequest = request => ({
  types: ["RETRIGGER_NEW_EMAIL_REQUEST", "RETRIGGER_NEW_EMAIL_SUCCESS", "RETRIGGER_NEW_EMAIL_FAILURE"],
  request: http => http.post(getRetriggerEmailRequestURi, request),
});

export const getManageSalesOrderRequest = request => ({
  types: ["MANAGE_SALES_REQUEST", "MANAGE_SALES_SUCCESS", "MANAGE_SALES_FAILURE"],
  request: http => http.post(getManageSalesOrderURi, request),
});

export const getCancelledSalesOrderRequest = request => ({
  types: ["CANCELLED_ORDERS_SALES_REQUEST", "CANCELLED_ORDERS_SALES_SUCCESS", "CANCELLED_ORDERS_SALES_FAILURE"],
  request: http => http.post(getCancelledSalesOrderURi, request),
});

export const getCompletedSalesOrderRequest = request => ({
  types: ["COMPLETED_SALES_ORDER_REQUEST", "COMPLETED_SALES_ORDER_SUCCESS", "COMPLETED_SALES_ORDER_FAILURE"],
  request: http => http.post(getCompletedSalesOrderURi, request),
});
export const getSalesOrderDetails = id => ({
  types: ["GET_SALES_ORDER_DETAILS_REQUEST", "GET_SALES_ORDER_DETAILS_SUCCESS", "GET_SALES_ORDER_DETAILS_FAILURE"],
  request: http => http.get(`${getSalesOrderDetailsURi}/${id}`),
});