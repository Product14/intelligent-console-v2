import CentralAPIHandler from "@/components/centralAPIHandler/centralAPIHandler";
import axios from "axios";
import { v4 as uuid } from "uuid"

export function formatCurrency(value) {
  if (!value && value != 0)
    return "";
  if (value < 1000) {
    return value.toString();
  }
  if (value >= 1000 && value < 1000000) {
    return (Math.floor(value / 10)) / 100 + 'K'; // Thousands
  }
  if (value >= 1000000 && value < 1000000000) {
    return (Math.floor(value / 10000)) / 100 + 'M'; // Millions
  }
  if (value >= 1000000000) {
    return (Math.floor(value / 10000000)) / 100 + 'B'; // Billions
  }
  return value.toString();
}

export const capitalize = (str) => {
  if (typeof str === 'string' && str.length > 0) {
    return str[0].toUpperCase() + str.slice(1);
  }
  return '';
};

export const addOperation = (a, b, decimalPlacesCount = 2) => {
  return a + b;
  a = a || 0;
  b = b || 0;
  const num = Math.pow(10, decimalPlacesCount);
  a = Math.floor(a * num);
  b = Math.floor(b * num);
  return (a + b) / num;
}

export const subtractOperation = (a, b, decimalPlacesCount = 2) => {
  return a - b;
  a = a || 0;
  b = b || 0;
  const num = Math.pow(10, decimalPlacesCount);;
  a = Math.floor(a * num);
  b = Math.floor(b * num);
  return (a - b) / num;
}

export const multiplicationOperation = (a, b, decimalPlacesCount = 2) => {
  return a * b;
  a = a || 0;
  b = b || 0;
  const num = Math.pow(10, decimalPlacesCount);
  a = Math.floor(a * num);
  b = Math.floor(b * num);
  const result = (a * b) / (num * num);
  return Math.floor(result * 100) / 100;
};

export const divisionOperation = (a, b, decimalPlacesCount = 2) => {
  return a / b;
  a = a || 0;
  b = b || 1;
  const num = Math.pow(10, decimalPlacesCount);
  a = Math.floor(a * num);
  b = Math.floor(b * num);
  // To avoid division by zero
  if (b === 0) {
    throw new Error('Division by zero is not allowed');
  }
  const result = a / b;
  return Math.floor(result * 100) / 100;
};
//custom styles for react-select
export const selectStyles = {
  menuPortal: base => ({ ...base, zIndex: 3 }),
  control: (defaultStyles, state) => ({
    ...defaultStyles,
    paddingTop: "0.550rem",
    paddingBottom: "0.550rem",
    borderRadius: "8px",
    boxShadow: "none",
    backgroundColor: "white",
    border: "1px solid rgba(0, 0, 0, 0.2)",
    textAlign: "left",
    cursor: "pointer",
    "&:hover": {
      borderColor: state.isFocused ? "rgba(0, 0, 0, 0.6)" : "rgba(0, 0, 0, 0.4)"
    }
  }),
  placeholder: defaultStyles => ({
    ...defaultStyles,
    color: "rgba(0, 0, 0, 0.40)",
    textAlign: "left",
    fontSize: "14px"
  })
}

export const uploadToS3 = async files => {
  try {
    let imageList = []
    for (let i = 0; i < files.length; i++) {
      const [name, extension] = files[i].name.split(".")

      imageList.push({
        "fileName": `${name}${uuid()}.${extension}`,
        "fileType": files[i].type
      })
    }

    const url = `${process.env.APP_BACKEND_BASEURL}/console/v1/util/gen-presigned`
    const { data } = await CentralAPIHandler.handlePostRequest(url, {
      "imageList": imageList
    })
    const imageUrls = await Promise.allSettled(
      data.map(async (item, index) => {
        await axios.put(item.presignedURL, files[index], {
          headers: { "Content-Type": files[index].type }
        })
        return item.presignedURL.split("?")[0]
      })
    )
    return imageUrls
  } catch (error) {
    console.error("Error uploading to S3:", error)
    throw error
  }
}

export function removeSpecialCharactersAndSpaces(str) {
  const cleanedStr = str?.replace(/[^\w\s]/gi, "").replace(/\s+/g, "")
  const lowerCaseStr = cleanedStr?.toLowerCase()
  return lowerCaseStr
}

export function isValidUrl(url) {
  const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
  return urlRegex.test(url)
}


export function deepEquals(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (a instanceof RegExp && b instanceof RegExp) return a.toString() === b.toString();
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEquals(a[key], b[key])) return false;
  }

  return true;
}

export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

export const setCookie = (name, value, days) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000); // Days to milliseconds
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}; ${expires}; path=/`;
};