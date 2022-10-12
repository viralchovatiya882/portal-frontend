
export const getCasedGoodsUri = `${process.env.REACT_APP_API_ENDPOINT}/api/casedgoods`;
export const getCasedGoodsTagsUri = `${process.env.REACT_APP_API_ENDPOINT}/api/tags`;
export const editCasedGoodsUri = `${process.env.REACT_APP_API_ENDPOINT}/api/updateInventory`;
export const updatePriceCasedGoodsUri = `${process.env.REACT_APP_API_ENDPOINT}/api/inventory/updatePrice`;
export const updateQuantityCasedGoodsUri = `${process.env.REACT_APP_API_ENDPOINT}/api/inventory/updateQuantity`;
export const changeLogCasedGoodsUri = `${process.env.REACT_APP_API_ENDPOINT}/api/changelog`;
export const additionsChangeLogCasedGoodsUri = `${process.env.REACT_APP_API_ENDPOINT}/api/changelog/additions`;
export const deletionsChangeLogCasedGoodsUri = `${process.env.REACT_APP_API_ENDPOINT}/api/changelog/deletions`;
export const priceChangeLogCasedGoodsUri = `${process.env.REACT_APP_API_ENDPOINT}/api/changelog/price_changes`;
export const getPricingParametersUri = `${process.env.REACT_APP_API_ENDPOINT}/api/getPricingParameters`;
export const addInventoryUri = `${process.env.REACT_APP_API_ENDPOINT}/api/addInventory`;
export const deleteInventoryUri = `${process.env.REACT_APP_API_ENDPOINT}/api/deleteOrUndeleteInventory`;
export const getCasedGoodDetailsUri = `${process.env.REACT_APP_API_ENDPOINT}/api/casedGoodsDetails`;

export const getCasedGoods = (request) => ({
  types: ["GET_CASEDGOODS_REQUEST", "GET_CASEDGOODS_SUCCESS", "GET_CASEDGOODS_FAILURE"],
  request: (http) => http.post(getCasedGoodsUri, request),
});

export const getCasedGoodsTags = (request) => ({
  types: ["GET_CASEDGOODS_TAGS_REQUEST", "GET_CASEDGOODS_TAGS_SUCCESS", "GET_CASEDGOODS_TAGS_FAILURE"],
  request: (http) => http.post(getCasedGoodsTagsUri, request),
});

export const getDeletedCasedGoods = (request) => ({
  types: ["GET_DELETED_CASEDGOODS_REQUEST", "GET_DELETED_CASEDGOODS_SUCCESS", "GET_DELETED_CASEDGOODS_FAILURE"],
  request: (http) => http.post(getCasedGoodsUri, request),
});

export const addInventory = (request) => ({
  types: ["ADD_CASEDGOODS_REQUEST", "ADD_CASEDGOODS_SUCCESS", "ADD_CASEDGOODS_FAILURE"],
  request: (http) => http.post(addInventoryUri, request),
});

export const getChangeLog = (request) => ({
  types: ["GET_CASEDGOODS_CHANGELOG_REQUEST", "GET_CASEDGOODS_CHANGELOG_SUCCESS", "GET_CASEDGOODS_CHANGELOG_FAILURE"],
  request: (http) => http.post(changeLogCasedGoodsUri, request),
});

export const getAdditionChangeLog = (request) => ({
  types: ["GET_CASEDGOODS_ADDITION_CHANGELOG_REQUEST", "GET_CASEDGOODS_ADDITION_CHANGELOG_SUCCESS", "GET_CASEDGOODS_ADDITION_CHANGELOG_FAILURE"],
  request: (http) => http.post(additionsChangeLogCasedGoodsUri, request),
});

export const getDeletionChangeLog = (request) => ({
  types: ["GET_CASEDGOODS_DELETION_CHANGELOG_REQUEST", "GET_CASEDGOODS_DELETION_CHANGELOG_SUCCESS", "GET_CASEDGOODS_DELETION_CHANGELOG_FAILURE"],
  request: (http) => http.post(deletionsChangeLogCasedGoodsUri, request),
});

export const getPriceChangeLog = (request) => ({
  types: ["GET_CASEDGOODS_PRICE_CHANGELOG_REQUEST", "GET_CASEDGOODS_PRICE_CHANGELOG_SUCCESS", "GET_CASEDGOODS_PRICE_CHANGELOG_FAILURE"],
  request: (http) => http.post(priceChangeLogCasedGoodsUri, request),
});

export const editCasedGoods = (request) => ({
  types: ["EDIT_CASEDGOODS_REQUEST", "EDIT_CASEDGOODS_SUCCESS", "EDIT_CASEDGOODS_FAILURE"],
  request: (http) => http.post(editCasedGoodsUri, request),
});

export const updatePriceCasedGoods = (request) => ({
  types: ["UPDATE_PRICE_CASEDGOODS_REQUEST", "UPDATE_PRICE_CASEDGOODS_SUCCESS", "UPDATE_PRICE_CASEDGOODS_FAILURE"],
  request: (http) => http.post(updatePriceCasedGoodsUri, request),
});

export const updateQuatityCasedGoods = (request) => ({
  types: ["UPDATE_QUANTITY_CASEDGOODS_REQUEST", "UPDATE_QUANTITY_CASEDGOODS_SUCCESS", "UPDATE_QUANTITY_CASEDGOODS_FAILURE"],
  request: (http) => http.post(updateQuantityCasedGoodsUri, request),
});

export const getPricingParameters = (request) => ({
  types: ["GET_CASEDGOODS_PRICING_PARAMETERS_REQUEST", "GET_CASEDGOODS_PRICING_PARAMETERS_SUCCESS", "GET_CASEDGOODS_PRICING_PARAMETERS_FAILURE"],
  request: (http) => http.post(getPricingParametersUri, request),
});

export const getCasedGoodDetails = (request) => ({
  types: ["GET_CASEDGOODS_DETAILS_REQUEST", "GET_CASEDGOODS_DETAILS_SUCCESS", "GET_CASEDGOODS_DETAILS_FAILURE"],
  request: (http) => http.post(getCasedGoodDetailsUri, request),
});

export const deleteCasedGoodDetails = (request) => ({
  types: ["DELETE_CASEDGOODS_DETAILS_REQUEST", "DELETE_CASEDGOODS_DETAILS_SUCCESS", "DELETE_CASEDGOODS_DETAILS_FAILURE"],
  request: (http) => http.post(deleteInventoryUri, request),
});
