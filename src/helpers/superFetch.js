const customHeader = () => ({
  "Content-Type": "application/json",
  Accept: "application/json",
});

const SuperFetch = async (method, url, data = {}) => {
  let requestParameters = {
    method,
    headers: customHeader(),
  };

  if (method === "put" || method === "post") {
    requestParameters = { ...requestParameters, body: JSON.stringify(data) };
  }

  return fetch(url, requestParameters)
    .then((response) => response.json())
    .then((res) => res)
    .catch((error) => ({ error: "Server Error" }));
};

export default SuperFetch;
