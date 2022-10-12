import "isomorphic-fetch";
import { getRequestHeader } from "../helpers/service";

const checkStatus = async response => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const json = await response.json();
  if (response.status === 401) {
    window.location.href = "/403";
  }
  const error = (new Error(response.statusText).response = json);
  throw error;
};

const http = async (url, config = {}) => {
  const defaultConfig = {
    method: "get",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
      ...getRequestHeader()
    }
  };
  const response = await fetch(url, { ...defaultConfig, ...config });
  try {
    await checkStatus(response);
    return response.status === 204 ? response.text() : response.json();
  } catch (err) {
    throw err;
  }
};

["get", "delete"].forEach(method => {
  http[method] = (url, params, config = {}) => {
    config.method = method;
    config.body = JSON.stringify(params);
    const query = params ? params : "";
    return http(url + query, config);
  };
});

["post", "put", "patch"].forEach(method => {
  http[method] = (url, data, config = {}) => {
    config.method = method;
    config.body = JSON.stringify(data);
    return http(url, config);
  };
});

export default http;
