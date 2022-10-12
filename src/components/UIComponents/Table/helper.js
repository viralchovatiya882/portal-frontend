import { capitalizeAllLetter } from "@helpers/utility";
import { filter, get } from "lodash";
export const getMobileCardDataWrapper = (cardFields, cardData) => {
  let returnData = [];
  returnData = cardData.map(data => {
    let tempObj = {};
    cardFields.map(element => {
      return (tempObj[element] = data[element]);
    });
    return tempObj;
  });

  return returnData;
};

export const getStatusOptions = statusObj => {
  let returnArr = [];
  returnArr = Object.keys(statusObj).map(data => {
    return {
      title: capitalizeAllLetter(data.replace(/_/g, " ")),
      color: get(statusObj, data),
      value: data
    };
  });
  return returnArr ? returnArr : [];
};

export const getFilterableData = filterObj => {
  let returnArr = [];
  returnArr = Object.keys(filterObj).map(data => {
    return {
      field_name: get(filterObj, `${data}.filter_key`, ""),
      field_value_array: get(filterObj, `${data}.filter_data`, []),
      data_type: get(filterObj, `${data}.filter_data_type`, "")
    };
  });

  returnArr = filter(returnArr, function (e) {
    return get(e, "field_value_array", []).length > 0;
  });

  return returnArr ? returnArr : [];
};
