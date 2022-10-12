export const getActiveLeadsUri = `${process.env.REACT_APP_API_ENDPOINT}/api/leads/active`;
export const getCustomerListUri = `${process.env.REACT_APP_API_ENDPOINT}/api/customer_detailed_list`;
export const getCustomerDetailsUri = `${process.env.REACT_APP_API_ENDPOINT}/api/customer_history`;
export const getActiveOrdersURi = `${process.env.REACT_APP_API_ENDPOINT}/api/customer/active_orders`;
export const getPastOrdersURi = `${process.env.REACT_APP_API_ENDPOINT}/api//customer/past_orders`;
export const getCompletedLeadsUri = `${process.env.REACT_APP_API_ENDPOINT}/api/leads/completed`;
export const addLeadUri = `${process.env.REACT_APP_API_ENDPOINT}/api/leads/add`;
export const addCustomerUri = `${process.env.REACT_APP_API_ENDPOINT}/api/addCustomer_new`;
export const getLeadDetailsURi = `${process.env.REACT_APP_API_ENDPOINT}/api/leads/lead_details`;
export const leadSourceListUri = `${process.env.REACT_APP_API_ENDPOINT}/api/leads/lead_source_list`;
export const getUpdateLeadDetailsURi = `${process.env.REACT_APP_API_ENDPOINT}/api/leads/update_lead_details`;
export const getConvertLeadURi = `${process.env.REACT_APP_API_ENDPOINT}/api/leads/convert_to_customer`;
export const getActiveLeads = request => ({
  types: ["GET_ACTIVE_LEADS_REQUEST", "GET_ACTIVE_LEADS_SUCCESS", "GET_ACTIVE_LEADS_FAILURE"],
  request: http => http.post(getActiveLeadsUri, request),
});

export const getCustomerList = request => ({
  types: ["GET_CUSTOMER_LISTING_REQUEST", "GET_CUSTOMER_LISTING_SUCCESS", "GET_CUSTOMER_LISTING_FAILURE"],
  request: http => http.post(getCustomerListUri, request),
});

export const getCompletedLeads = request => ({
  types: ["GET_COMPLETED_LEADS_REQUEST", "GET_COMPLETED_LEADS_SUCCESS", "GET_COMPLETED_LEADS_FAILURE"],
  request: http => http.post(getCompletedLeadsUri, request),
});

export const addLead = request => ({
  types: ["ADD_LEAD_REQUEST", "ADD_LEAD_SUCCESS", "ADD_LEAD_FAILURE"],
  request: http => http.post(addLeadUri, request),
});

export const getLeadSourceList = () => ({
  types: ["GET_LEAD_SOURCE_LIST_REQUEST", "GET_LEAD_SOURCE_LIST_SUCCESS", "GET_LEAD_SOURCE_LIST_FAILURE"],
  request: http => http.get(leadSourceListUri),
});

export const addNewCustomer = request => ({
  types: ["ADD_NEW_CUSTOMER_REQUEST", "ADD_NEW_CUSTOMER_SUCCESS", "ADD_NEW_CUSTOMER_FAILURE"],
  request: http => http.post(addCustomerUri, request),
});

export const getLeadDetails = id => ({
  types: ["GET_LEAD_DETAILS_REQUEST", "GET_LEAD_DETAILS_SUCCESS", "GET_LEAD_DETAILS_FAILURE"],
  request: http => http.get(`${getLeadDetailsURi}/${id}`),
});

export const getActiveOrders = request => ({
  types: ["GET_ACTIVE_ORDERS_REQUEST", "GET_ACTIVE_ORDERS_SUCCESS", "GET_ACTIVE_ORDERS_FAILURE"],
  request: http => http.post(getActiveOrdersURi, request),
});

export const getPastOrders = request => ({
  types: ["GET_PAST_ORDERS_REQUEST", "GET_PAST_ORDERS_SUCCESS", "GET_PAST_ORDERS_FAILURE"],
  request: http => http.post(getPastOrdersURi, request),
});

export const getCustomerDetails = id => ({
  types: ["GET_CUSTOMER_DETAILS_REQUEST", "GET_CUSTOMER_DETAILS_SUCCESS", "GET_CUSTOMER_DETAILS_FAILURE"],
  request: http => http.get(`${getCustomerDetailsUri}/${id}`),
});

export const convertLead = request => ({
  types: ["CONVERT_LEAD_REQUEST", "CONVERT_LEAD_SUCCESS", "CONVERT_LEAD_FAILURE"],
  request: http => http.post(getConvertLeadURi, request),
});

export const updateLeadDetails = request => ({
  types: ["UPDATE_LEAD_REQUEST", "UPDATE_LEAD_SUCCESS", "UPDATE_LEAD_FAILURE"],
  request: http => http.post(getUpdateLeadDetailsURi, request),
});
