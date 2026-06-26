import Compressor from 'compressorjs';

import { captureEvent } from '../utils/config';

const upsertQueryParams = async ({
  variable = null,
  value = null,
  deleteVariable = false,
  deleteElementInsideArray = false,
  isAList = false,
  router,
}) => {
  const queryParams = new URLSearchParams(window.location.search);
  queryParams.search = '';
  if (deleteVariable) {
    queryParams.delete(variable);
  } else {
    if (queryParams.get(variable)) {
      let valuePresent = queryParams.get(variable);

      if (isAList) {
        // extracting values between sqaure brackets
        let elements = getListOfValuesFromQueryParam(valuePresent);
        if (deleteElementInsideArray) {
          if (typeof value === 'number') {
            value = JSON.stringify(value);
          }
          // slice
          if (elements.indexOf(value) >= 0) {
            let newList = [
              ...elements.slice(0, elements.indexOf(value)),
              ...elements.slice(elements.indexOf(value) + 1),
            ];
            if (newList.length === 0) {
              queryParams.delete(variable);
            } else {
              queryParams.set(variable, `[${newList}]`);
            }
          }
        } else {
          valuePresent.indexOf('[');
          valuePresent.indexOf(']');
          // extracting values between sqaure brackets
          let elements = getListOfValuesFromQueryParam(valuePresent);
          elements.push(value);

          let listOfUniqueElements = new Set(elements);
          queryParams.set(variable, `[${[...listOfUniqueElements.values()]}]`);
        }
      } else {
        queryParams.set(variable, value);
      }
    } else {
      if (isAList) {
        queryParams.append(variable, `[${value}]`);
      } else {
        queryParams.append(variable, value);
      }
    }
  }
  let queryParamObj = {};

  for (let key of queryParams.keys()) {
    queryParamObj[key] = queryParams.get(key);
  }
  await router.replace({ query: { ...queryParamObj } });
};

const getListOfValuesFromQueryParam = (value) => {
  return value
    ?.substring(value.indexOf('[') + 1, value.indexOf(']'))
    .split(',');
};

const listOfLikeColumns = ['sku_name', 'project_name'];
const listOfDateColumns = ['created_on'];
const handleColumnFiltersFormat = (columnFilters) => {
  let requiredDataFormat = [];
  for (const key in columnFilters) {
    if (listOfLikeColumns.includes(key)) {
      requiredDataFormat.push({
        key: key,
        value: columnFilters[key],
        type: 'like',
      });
    } else if (listOfDateColumns.includes(key)) {
      requiredDataFormat.push({
        key: key,
        value: columnFilters[key],
        type: 'date',
      });
    } else if (typeof columnFilters[key] === 'object') {
      requiredDataFormat.push({
        key: key,
        value: columnFilters[key],
        type: 'list',
      });
    } else if (typeof columnFilters[key] === 'string') {
      requiredDataFormat.push({
        key: key,
        value: columnFilters[key],
        type: 'field',
      });
    }
  }
  return requiredDataFormat;
};

const getColumnFilters = () => {
  const queryParams = new URLSearchParams(window.location.search);
  let queryParamsValue = {};
  for (const variable of queryParams.keys()) {
    let value = queryParams.get(variable);

    if (value.includes('[')) {
      let list = getListOfValuesFromQueryParam(value);
      queryParamsValue[variable] = list;
    } else {
      queryParamsValue[variable] = queryParams.get(variable);
    }
  }

  let columnFiltersList = [];
  columnFiltersList = handleColumnFiltersFormat(queryParamsValue);
  return columnFiltersList.length ? columnFiltersList : [];
};

const convertBlobToFile = (blobFileObj) => {
  try {
    return new Promise((resolve, reject) => {
      if (
        !blobFileObj ||
        !blobFileObj['name'] ||
        !blobFileObj['blobUrl'] ||
        !blobFileObj['type'] ||
        !blobFileObj['lastModified']
      ) {
        return reject(
          'File data required to convert to file is not sufficient'
        );
      }
      fetch(blobFileObj['blobUrl'], {})
        .then((res) => res.blob())
        .then(async (resp) => {
          var file = new File([resp], blobFileObj['name'], {
            type: blobFileObj['type'],
            lastModified: blobFileObj['lastModified'],
          });
          resolve(file);
        })
        .catch((err) => reject(err));
    });
  } catch (error) {
    throw error;
  }
};

const chunkArray = (arr, chunkSize) => {
  try {
    let result = [];
    let length = arr.length;
    for (let i = 0; i < length; i = i + chunkSize) {
      if (i === 0) {
        result.push(arr.slice(0, 1));
        i = i - chunkSize + 1;
      } else {
        result.push(arr.slice(i, i + chunkSize));
      }
    }
    return result;
  } catch (error) {
    // console.log(error)
  }
};

const compressFileObject = ({
  file,
  imageData = { name: '', type: '', lastModified: '' },
  imageKey,
  quality = 0.6,
}) => {
  return new Promise((resolveCompressoion, _) => {
    new Compressor(file, {
      quality: quality >= 0.5 && quality <= 1 ? quality : 0.6,
      success(result) {
        let newFile = null;
        if (result instanceof Blob) {
          newFile = new File([result], imageData['name'], {
            type: imageData['type'],
            lastModified: imageData['lastModified'],
          });
        }
        resolveCompressoion(
          { file: newFile, imageKey } ?? { file: result, imageKey }
        );
      },
      error(err) {
        resolveCompressoion({ file, imageKey });
      },
      mimeType: 'auto',
    });
  });
};

const bulkImageUploadViaPresigned = async (
  index = -1,
  imageKey = -1,
  fileData = null,
  fileType = '',
  presignedURL = '',
  cb = null
) => {
  if (!fileData || !fileType || !presignedURL)
    return Promise.reject('fileData or fileType or PresignedURL not available');

  try {
    let uploadStart = new Date();
    const response = await fetch(presignedURL, {
      method: 'PUT',
      headers: {
        'Content-Type': fileType,
      },
      body: fileData,
    });
    let uploadEnd = new Date();
    captureEvent('single_upload_vs', {
      response: response.url,
      uploadTime: `${uploadEnd - uploadStart}ms`,
    });
    if (typeof cb === 'function') {
      cb({ imageKey, index });
    }
    if (response.ok) {
      return Promise.resolve({ resp: response, imageKey });
    } else {
      return Promise.reject({ err: response, imageKey });
    }
  } catch (error) {
    if (typeof cb === 'function') {
      cb({ imageKey, index });
    }

    captureEvent('single_upload_vs', {
      error: error.message,
      uploadTime: `${uploadEnd - uploadStart}ms`,
    });
    return Promise.reject({ err: error, imageKey });
  }
};

const formatTimeSince = (dateIsoString) => {
  if (!dateIsoString) return '';

  const date = new Date(dateIsoString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} years ago`;
  if (months > 0) return `${months} months ago`;
  if (days > 0) return `${days} days ago`;
  if (hours > 0) return `${hours} hours ago`;
  if (minutes > 0) return `${minutes} minutes ago`;
  return `${seconds} seconds ago`;
};

const formatDate = (date) => {
  const tzOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
  const localISOTime = new Date(date - tzOffset).toISOString().slice(0, 10);
  return localISOTime;
};

const numberToDateCreate = (dateStr) => {
  const year = parseInt(dateStr.substring(0, 4), 10);
  const month = parseInt(dateStr.substring(4, 6), 10) - 1; // JS months are zero-indexed
  const day = parseInt(dateStr.substring(6, 8), 10);

  const date = new Date(year, month, day);
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }); //  "D MMM" format
};

const customStyles = {
  menuPortal: (base) => ({ ...base, zIndex: 2 }),
  control: (defaultStyles, state) => ({
    ...defaultStyles,
    paddingTop: '0.700rem',
    paddingBottom: '0.700rem',
    borderRadius: '8px',
    boxShadow: 'none',
    border: '1px solid #00000033',
    textAlign: 'left',
    '&:hover': {
      // Overwrittes the different states of border
      borderColor: state.isFocused ? '#00000099' : '#00000066',
    },
  }),
  placeholder: (defaultStyles) => ({
    ...defaultStyles,
    color: '#00000099',
    textAlign: 'left',
  }),
};

function removeSpecialCharactersAndSpaces(str) {
  const cleanedStr = str?.replace(/[^\w\s]/gi, '').replace(/\s+/g, '');
  const lowerCaseStr = cleanedStr?.toLowerCase();
  return lowerCaseStr;
}

const formatNumberInShort = (num) => {
  if (num < 1000) return num.toString(); // If less than 1000, return the number as is.
  if (num < 1000000) return (num / 1000).toFixed(1) + 'k'; // For thousands
  if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M'; // For millions
  return (num / 1000000000).toFixed(1) + 'B'; // For billions
};

export {
  upsertQueryParams,
  getListOfValuesFromQueryParam,
  handleColumnFiltersFormat,
  getColumnFilters,
  convertBlobToFile,
  chunkArray,
  compressFileObject,
  bulkImageUploadViaPresigned,
  formatTimeSince,
  formatDate,
  numberToDateCreate,
  customStyles,
  removeSpecialCharactersAndSpaces,
  formatNumberInShort,
};
