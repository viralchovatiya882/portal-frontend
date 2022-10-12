import { get } from "lodash";
import { capitalizeFirstLetter } from "../../../helpers/utility";

export const getDataWrapper = responseData => {
  let rowData = [];
  if (responseData && responseData.length > 0) {
    responseData.map((data, index) => {
      const rowObj = {
        key: index,
        id: get(data, "id", ""),
        brand: capitalizeFirstLetter(get(data, "brand", "").toLowerCase()),
        distillery: capitalizeFirstLetter(get(data, "distillery", "").toLowerCase()),
        spirit_type: capitalizeFirstLetter(get(data, "spirit_type", "").toLowerCase()),
        gift_box: get(data, "gift_box", ""),
        dateAdded: new Date(get(data, "date_added")).toLocaleDateString(),
        year: get(data, "year", ""),
        type: capitalizeFirstLetter(get(data, "type", "").toLowerCase()),
        cask: get(data, "cask", ""),
        cask_type: get(data, "cask_type", ""),
        age: get(data, "age", ""),
        bottles: get(data, "bottles", ""),
        abv: get(data, "abv", ""),
        bpc: get(data, "bpc", ""),
        volume: get(data, "volume", ""),
        cases: get(data, "cases", ""),
        case_reference: get(data, "case_reference", ""),
        last_location: get(data, "last_location", ""),
        offers: get(data, "offers", ""),
        comments: get(data, "comments", ""),
        export_price: get(data, "export_price", ""),
        wholesale_price: get(data, "wholesale_price", ""),
        duty: get(data, "duty", ""),
        uk_trade_price: get(data, "uk_trade_price", ""),
        retail_price_case: get(data, "retail_price_case", ""),
        retail_price_case_incl_vat: get(data, "retail_price_case_incl_vat", ""),
        retail_price_unit_incl_vat: get(data, "retail_price_unit_incl_vat", ""),
      };
      rowData.push(rowObj);
    });
  }
  return rowData;
};

export const getDynamicDataWrapper = responseData => {
  let rowData = [];
  if (responseData && responseData.length > 0) {
    responseData.map((data, index) => {
      const rowObj = {
        key: index,
        ...data,
      };
      rowData.push(rowObj);
    });
  }
  return rowData;
};

export const getExpectedSelectData = data => {
  const expectedData = data.map(item => {
    return {
      label: item.name,
      value: item.id,
    };
  });
  return expectedData;
};

export const getKeyValue = data => {
  const detail = {};
  for (var i = 0; i < data.length; i++) {
    detail[data[i].key] = data[i].value;
  }
  return detail;
};

export const numberFieldRegex = input => {
  const regExp = new RegExp("^[0-9]+$");
  return regExp.test(input);
};
export const phoneNumberRegex = input => {
  const regExp = new RegExp("^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-s./0-9]*$");
  return regExp.test(input);
};
export const emailRegex = input => {
  const regExp = new RegExp("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$");
  return regExp.test(input);
};
export const postalRegEx = input => {
  // const regExp = new RegExp("^[A-Za-z0-9 _]*[A-Za-z0-9][A-Za-z0-9 _]*$");
  // return regExp.test(input);
  return true;
};
