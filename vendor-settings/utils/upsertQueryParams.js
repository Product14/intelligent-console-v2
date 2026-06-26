export const upsertQueryParams = async ({
  variable = null,
  value = null,
  deleteVariable = false,
  deleteElementInsideArray = false,
  isAList = false,
  router,
  deleteElement = false,
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
        if (deleteElement) {
          queryParams.delete(variable);
        } else {
          queryParams.set(variable, value);
        }
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

export const upsertQueryParamsNext15 = async ({
  variable = null,
  value = null,
  deleteVariable = false,
  deleteElementInsideArray = false,
  isAList = false,
  router,
  deleteElement = false,
}) => {
  // Get the current URL and create a new URLSearchParams instance
  const url = new URL(window.location.href);
  const searchParams = new URLSearchParams(url.search);

  if (deleteVariable) {
    searchParams.delete(variable);
  } else {
    if (searchParams.has(variable)) {
      let valuePresent = searchParams.get(variable);

      if (isAList) {
        if (deleteElementInsideArray) {
          const elements = getListOfValuesFromQueryParam(valuePresent);
          const valueToDelete =
            typeof value === 'number' ? JSON.stringify(value) : value;

          if (elements.indexOf(valueToDelete) >= 0) {
            const newList = [
              ...elements.slice(0, elements.indexOf(valueToDelete)),
              ...elements.slice(elements.indexOf(valueToDelete) + 1),
            ];

            if (newList.length === 0) {
              searchParams.delete(variable);
            } else {
              searchParams.set(variable, `[${newList}]`);
            }
          }
        } else {
          const elements = getListOfValuesFromQueryParam(valuePresent);
          elements.push(value);
          const listOfUniqueElements = new Set(elements);
          searchParams.set(variable, `[${[...listOfUniqueElements.values()]}]`);
        }
      } else {
        if (deleteElement) {
          searchParams.delete(variable);
        } else {
          searchParams.set(variable, value);
        }
      }
    } else {
      if (isAList) {
        searchParams.append(variable, `[${value}]`);
      } else {
        searchParams.append(variable, value);
      }
    }
  }

  // Create the new URL pathname with search params
  const pathname = window.location.pathname;
  const newUrl = `${pathname}?${searchParams.toString()}`;

  // Use the Next.js router to update the URL
  await router.replace(newUrl);
};

export const getListOfValuesFromQueryParam = (value) => {
  return value
    ?.substring(value.indexOf('[') + 1, value.indexOf(']'))
    .split(',');
};

export const convertBlobToFile = (blobFileObj) => {
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
