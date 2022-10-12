
export const getUsersUri = `${process.env.REACT_APP_API_ENDPOINT}/api/users`;
export const getUserRolesUri = `${process.env.REACT_APP_API_ENDPOINT}/api/userRoles`;
export const addUserUri = `${process.env.REACT_APP_API_ENDPOINT}/api/addUser`;
export const updateUserUri = `${process.env.REACT_APP_API_ENDPOINT}/api/updateUser`;

export const getUsers = (request) => ({
    types: ["GET_USERS_REQUEST", "GET_USERS_SUCCESS", "GET_USERS_FAILURE"],
    request: (http) => http.post(getUsersUri, request)
});

export const getUserRoles = () => ({
    types: ["GET_USER_ROLES_REQUEST", "GET_USER_ROLES_SUCCESS", "GET_USER_ROLES_FAILURE"],
    request: (http) => http.get(getUserRolesUri)
});

export const addUser = (request) => ({
    types: ["GET_ADD_USER_REQUEST", "GET_ADD_USER_SUCCESS", "GET_ADD_USER_FAILURE"],
    request: (http) => http.post(addUserUri, request)
});

export const updateUser = (request) => ({
    types: ["GET_UPADTE_USER_REQUEST", "GET_UPDATE_USER_SUCCESS", "GET_UPDATE_USER_FAILURE"],
    request: (http) => http.post(updateUserUri, request)
});