import { capitalizeFirstLetter } from "@helpers/utility";
import { get, round, toString } from "lodash";
export const getOrderDetailsColumns = (responseData, isPermitted) => {
  let rowData = [];
  if (responseData && responseData.length > 0) {
    responseData.map((data, index) => {
      let rowObj = {
        key: index,
        ...data,
      };
      // if (get(data, "edit_rotation_num", false)) {
      //   rowObj["rotation_number"] = {
      //     isEditable: false,
      //     componentType: "inputText",
      //     value: get(data, "rotation_number", "NA"),
      //   };
      // }
      rowData.push(rowObj);
    });
  }
  return rowData;
};

export const getNewOrderDetailsColumns = (responseData) => {
  let rowData = [];
  if (responseData && responseData.length > 0) {
    responseData.map((data, index) => {
      let rowObj = {
        key: Math.random(),
        cased_goods_id: get(data, "id", ""),
        id: get(data, "id", ""),
        abv: get(data, "abv", ""),
        cask: get(data, "cask", ""),
        brand: capitalizeFirstLetter(toString(get(data, "brand", ""))),
        distillery: capitalizeFirstLetter(toString(get(data, "distillery", ""))),
        spirit_type: capitalizeFirstLetter(toString(get(data, "spirit_type", ""))),
        year: get(data, "year", ""),
        whole_case: get(data, "whole_case", ""),
        bottles_in_partial_case: get(data, "bottles_in_partial_case", ""),
        age: get(data, "age", ""),
        bpc: get(data, "bpc", ""),
        rotation_number: get(data, "case_reference", ""),
        custom_label_text: get(data, "custom_label_text", ""),
        quantity: get(data, "quantity", 0),
        total_price: round(get(data, "total_price", 0), 2),
        price: round(get(data, "price", 0), 2),
        price_per_case: round(get(data, "price_per_case", 0), 2),
        discount: round(get(data, "discount", 0), 2),
        price_after_discount: round(get(data, "price_after_discount", 0), 2),
        volume: get(data, "volume", ""),
        timestamp: new Date().getTime(),
      };
      rowData.push(rowObj);
    });
  }
  return rowData;
};

export const getDetailedColumnData = (data, length) => {
  let rowData = {};
  if (data) {
    rowData = {
      cased_goods_id: get(data, "id", ""),
      abv: get(data, "abv", ""),
      cask: get(data, "cask", ""),
      brand: get(data, "brand", ""),
      distillery: get(data, "distillery", ""),
      spirit_type: get(data, "spirit_type", ""),
      free_item: get(data, "free_item", ""),
      gift_box: get(data, "gift_box", ""),
      year: get(data, "year", ""),
      tags: get(data, "tags", ""),
      cases: get(data, "cases", ""),
      allocations: get(data, "allocations", ""),
      net_cases: get(data, "net_cases", ""),
      bottles: get(data, "bottles", ""),
      loa_per_case: get(data, "loa_per_case", ""),
      case_reference: get(data, "case_reference", ""),
      export_price: get(data, "export_price", ""),
      whole_case: get(data, "whole_case", ""),
      bottles_in_partial_case: get(data, "bottles_in_partial_case", ""),
      age: get(data, "age", ""),
      bpc: get(data, "bpc", ""),
      price_per_case: round(get(data, "price_per_case", 0), 2),
      discount: round(get(data, "discount", 0), 2),
      price_after_discount: round(get(data, "price_after_discount", 0), 2),
      volume: get(data, "volume", ""),
      timestamp: new Date().getTime(),
    };
  }
  return rowData;
};
