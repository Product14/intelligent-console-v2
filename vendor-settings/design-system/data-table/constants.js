export const calculateColumsHeaderWidth = (columnsHeader) => {
  if (!columnsHeader) return [];
  const newColumnsWidth = [];
  newColumnsWidth[0] = 0;
  columnsHeader.forEach((columnHeader, colIndex) => {
    newColumnsWidth[colIndex + 1] =
      (columnHeader?.width || 250) + newColumnsWidth[colIndex];
  });
  return newColumnsWidth;
};

export const defaultEndMessage = 'Yay! You have seen it all';

export const getNestedValue = (obj, keyString) => {
  return keyString.split('.').reduce((acc, key) => {
    return acc && acc[key] !== undefined ? acc[key] : undefined;
  }, obj);
};
