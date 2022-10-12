
export const getHelpURi = `${process.env.REACT_APP_API_ENDPOINT}/api/help/add`;
export const getHelpList = `${process.env.REACT_APP_API_ENDPOINT}/api/help/list`;

export const addHelpDetails = (request) => ({
    types: ["ADD_HELP_REQUEST", "ADD_HELP_SUCCESS", "ADD_HELP_FAILURE"],
    request: (http) => http.post(getHelpURi, request)
});

export const getHelpDetails = (request) => ({
    types: ["GET_HELP_LIST_REQUEST", "GET_HELP_LIST_SUCCESS", "GET_HELP_LIST_FAILURE"],
    request: (http) => http.post(getHelpList, request)
});
