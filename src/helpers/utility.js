import { cloneDeep, filter, get, isBoolean } from "lodash";

export function isBlank(str) {
  return str === null || str === undefined || (typeof str === "string" && /^\s*$/.test(str));
}

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function capitalizeAllLetter(string) {
  return string.replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase());
}

export function getScreenSize() {
  return window.innerWidth || document.body.clientWidth;
}

export function getBooleanValue(value) {
  if (!value) {
    return false;
  }
  if (isBoolean(value)) {
    return value;
  }
  return value.toLowerCase() === "no" ? false : true;
}

export function checkUserPermission(value) {
  if (!value || !Array.isArray(value) || value.length === 0) {
    return false;
  }

  return value.length > 0 ? true : false;
}

export function getKeyValuePair(data, key, isReversed = true) {
  let inputData = cloneDeep(data);

  if (isReversed) {
    inputData = inputData.reverse();
  }

  inputData = filter(inputData, function (o) {
    if (key) {
      return o[key] && o[key].toString();
    }
    return o && o.toString();
  });

  return inputData.map(list => {
    if (key) {
      return { label: get(list, key, ""), value: get(list, key, "") };
    } else {
      return { label: list, value: list };
    }
  });
}

export function getKeyValuePairFromObject(data) {
  return Object.keys(cloneDeep(data)).map(list => {
    return { label: `${get(data, list)}`, value: `${get(data, list)}` };
  });
}

export function getKeyValuePairFromArray(data) {
  return cloneDeep(data).map(list => {
    const value = capitalizeAllLetter(list.replace(/_/g, " "));
    return { label: value, value };
  });
}

export function getUserPermittedList(data) {
  const checkData = cloneDeep(data);
  let permittedData = [];
  Object.keys(checkData).map(list => {
    const isPermitted = checkUserPermission(checkData[list]);
    if (isPermitted) {
      permittedData.push(list);
    }
  });

  return permittedData;
}

export function getRolesKeyValuePairFromArray(data) {
  return cloneDeep(data).map(list => {
    return { label: get(list, "display_name"), value: get(list, "key_name") };
  });
}

export const toBase64 = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

export const acceptOnlyNumbers = str => {
  if (str) {
    return str.replace(/[^0-9.]/g, "").replace(/(\..*?)\..*/g, "$1");
  }
  return null;
};

export const acceptNumbersAndHyphen = str => {
  if (str) {
    return str.replace(/[^0-9.\-]/g, "").replace(/(\..*?)\..*/g, "$1");
  }
  return "";
};

export const onlyNumbersWithNoDecimal = num => {
  if (/[^0-9]+/.test(num)) {
    return num.replace(/[^0-9]*/g, "");
  }
  return num;
};

export const decimalWithTwoPointsCheck = value => {
  const RE = /^\d*\.?\d{0,2}$/;
  if (RE.test(value)) {
    return true;
  } else {
    return false;
  }
};
export const validateForm = (obj, notRequired) => {
  let errors = {};
  if (notRequired !== undefined) {
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === "" || value?.length === 0) {
        if (!notRequired.includes(key)) {
          errors[key] = unSlugify(key) + " is required";
        }
      }
    }
  } else {
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === "" || value?.length === 0) {
        errors[key] = unSlugify(key) + " is required";
      }
    }
  }
  if (Object.keys(errors).length) {
    return errors;
  } else {
    return true;
  }
};

export const slugify = text => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
};

export const unSlugify = slug => {
  var words = slug.split(/-|_/);
  return words
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();
    })
    .join(" ");
};

export const base64toBlob = (b64Data, contentType = "", sliceSize = 512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize),
      byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
};

export const numberWithCommas = x => {
  let numberToBeConverted = x ? x : 0;
  return numberToBeConverted.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const getFileType = key => {
  switch (key) {
    case "pdf":
      return "data:application/pdf";
    case "png":
      return "data:image/png";
    case "jpeg":
      return "data:image/jpeg";
    case "jpg":
      return "data:image/jpg";
    case "txt":
      return "data:text/plain";
    case "csv":
      return "data:text/csv";
    case "html":
      return "data:text/html";
    case "htm":
      return "data:text/html";
    case "doc":
      return "data:application/msword";
    case "docx":
      return "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "xls":
      return "data:application/vnd.ms-excel";
    case "xlsx":
      return "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "ppt":
      return "data:application/vnd.ms-powerpoint";
    case "pptx":
      return "data:application/vnd.openxmlformats-officedocument.presentationml.presentation";
    case "odt":
      return "data:application/vnd.oasis.opendocument.text";
    default:
      break;
  }
};


export const getDataWrapper = (responseData) => {
  let rowData = [];
  if (responseData && responseData.length > 0) {
      responseData.map((data, index) => {
          delete data["user_permissions"];
          const rowObj = {
              key: index,
              ...data
          };
          rowData.push(rowObj);
      });
  };
  return rowData;
};
