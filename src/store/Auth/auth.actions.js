export const userLoginUri = `${process.env.REACT_APP_API_ENDPOINT}/api/login`;
export const tokenVerifyUri = `${process.env.REACT_APP_API_ENDPOINT}/api/verifyAccessToken`;

export const userLogin = (request) => ({
    types: ["GET_USER_LOGIN_REQUEST", "GET_USER_LOGIN_SUCCESS", "GET_USER_LOGIN_FAILURE"],
    request: (http) => http.post(userLoginUri, request)
});

export const verifyToken = () => ({
    types: ["GET_TOKEN_VERIFY_REQUEST", "GET_TOKEN_VERIFY_SUCCESS", "GET_TOKEN_VERIFY_FAILURE"],
    request: (http) => http.get(tokenVerifyUri)
});