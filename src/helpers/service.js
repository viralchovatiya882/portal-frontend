import { getCookie } from "./cookieHelper";

export const StatusCodes = {
	UNAUTHORIZED: 401,
	NOTFOUND: 404
};

export const ErrorMessage = {
	Get: "Error in Get",
	Post: "Error in Post",
	Delete: "Error in Delete",
	Insert: "Error in Insert"
};

export const APPLICATION_CONTENT_TYPE = "application/json; charset=utf-8";

export const HeaderProperties = {
	language: "Accept-Language",
	contentType: "Content-Type"
};

export const getRequestHeader = () => {
	return {
		Authorization: "Bearer " + getCookie("access_token")
	};
};
