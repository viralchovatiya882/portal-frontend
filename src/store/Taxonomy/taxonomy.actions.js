export const getMasterDataListUri = `${process.env.REACT_APP_API_ENDPOINT}/api/masterdata_list`;
export const getMasterDataUri = `${process.env.REACT_APP_API_ENDPOINT}/api/masterdata`;
export const updateMasterDataStatusUri = `${process.env.REACT_APP_API_ENDPOINT}/api/masterdata/updateStatus`;

export const getTaxonomyList = request => ({
  types: ["GET_TAXONOMYLIST_REQUEST", "GET_TAXONOMYLIST_SUCCESS", "GET_TAXONOMYLIST_FAILURE"],
  request: http => http.post(getMasterDataListUri, request)
});

export const getTaxonomyData = request => ({
  types: ["GET_TAXONOMYDATA_REQUEST", "GET_TAXONOMYDATA_SUCCESS", "GET_TAXONOMYDATA_FAILURE"],
  request: http => http.post(getMasterDataUri, request),
  requestPayload: request
});

export const updateTaxonomyStatus = request => ({
  types: ["UPDATE_TAXONOMY_STATUS_REQUEST", "UPDATE_TAXONOMY_STATUS_SUCCESS", "UPDATE_TAXONOMY_STATUS_FAILURE"],
  request: http => http.post(updateMasterDataStatusUri, request)
});

export const updateAllTaxonomyData = data => ({
  type: "UPDATE_TAXONOMY_DATA",
  response: data
});

export const setCurrentTaxonomyTab = data => ({
  type: "SET_TAXONOMY_TAB",
  response: data
});
