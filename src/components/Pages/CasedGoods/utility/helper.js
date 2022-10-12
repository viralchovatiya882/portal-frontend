import { capitalizeAllLetter } from "@helpers/utility";
import { get } from "lodash";
import moment from "moment";

export const getName = (tab) => {
  if (tab === "abv" || tab === "bpc" || tab === "ays") {
    return tab.toUpperCase();
  }

  if (tab === "case_reference") {
    return "Rotation Number";
  }

  return capitalizeAllLetter(tab.replace(/_/g, " "));
};

export const getValue = (value, tab) => {
  if (Array.isArray(value) && value.length === 0) {
    return "NIL";
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (tab === "bottles_in_partial_case" && value) {
    value = value.split("/");
    return value[0];
  }

  if (value) {
    return value;
  }

  return "NIL";
};

export const getValueCheck = (value, tab) => {
  if (Array.isArray(value) && value.length === 0) {
    return false;
  }

  if (Array.isArray(value)) {
    return true;
  }

  if (value) {
    return true;
  }

  if (tab === "total_cases") {
    return true;
  }

  return false;
};

export const getYearList = () => {
  let currentYear = new Date().getFullYear(),
    years = [];
  let startYear = 1960;
  while (startYear <= currentYear) {
    years.push(startYear++);
  }
  return years;
};

export const getYearFromDate = (date) => {
  if (date) {
    return date;
    // return moment(date).year();
  }
  return "NIL";
};

export const getNoOfBottles = (bpc, cases) => {
  if (bpc && cases) {
    return Number(bpc) && Number(cases);
  }
  return "NIL";
};

export const getTags = (data) => {
  if (data.length > 0) {
    return data.map((tag) => {
      return get(tag, "name");
    });
  }
  return [];
};

export const getAge = (data) => {
  const ays = moment(get(data, "ays"));
  const bottling_date = moment(get(data, "bottling_date"));
  return bottling_date.diff(ays, "years");
};

export const checkBottlingDate = (data) => {
  return !moment(get(data, "ays")).isBefore(get(data, "bottling_date"));
};

export const getBottles = (bpc, cases) => {
  return bpc * cases;
};

export const getLoA = (abv, bpc, volume) => {
  return ((abv / 100) * bpc * volume).toFixed(2);
};

export const getComputedCases = (revisedValues) => {
  if (get(revisedValues, "cases", 0)) {
    if (get(revisedValues, "type") === "add") {
      return Number(get(revisedValues, "clonedCases", 0)) + get(revisedValues, "cases", 0);
    }

    if (get(revisedValues, "type") === "reduce") {
      return Number(get(revisedValues, "clonedCases", 0)) - get(revisedValues, "cases", 0);
    }
  } else {
    return 0;
  }
};

export const getComputedBottles = (revisedValues) => {
  if (get(revisedValues, "bottles", 0)) {
    if (get(revisedValues, "type") === "add") {
      return Number(get(revisedValues, "clonedBottles", 0)) + get(revisedValues, "bottles", 0);
    }

    if (get(revisedValues, "type") === "reduce") {
      return Number(get(revisedValues, "clonedBottles", 0)) - get(revisedValues, "bottles", 0);
    }
  } else {
    return 0;
  }
};
