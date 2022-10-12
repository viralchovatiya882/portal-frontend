import { get, round } from "lodash";
export const getEvaluatedOutput = (arr, index, custom) => {
    let returnArr = [...arr];
    if (returnArr.length > 0 && returnArr[index]) {
      returnArr[index].quantity = get(custom, "quantity");
      returnArr[index].free_item = get(custom, "free_item", false);
      returnArr[index].whole_case = round(get(custom, "whole_case"), 2);
      returnArr[index].bottles_in_partial_case = round(get(custom, "bottles_in_partial_case"), 2);
      returnArr[index].discount = round(get(custom, "discount"), 2);
      returnArr[index].price = round(get(custom, "price"), 2);
      returnArr[index].total_price = round(get(custom, "total_price"), 2);
      returnArr[index].afterDiscount = round(get(custom, "afterDiscount"), 2);
      returnArr[index].price_after_discount = round(get(custom, "price_after_discount"), 2);
    }
    return returnArr[index];
  };