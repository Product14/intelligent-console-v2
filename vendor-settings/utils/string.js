/**
 * Capitalizes the first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} The capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Converts a string to a URL-friendly slug
 * @param {string} str - The string to slugify
 * @returns {string} The slugified string
 */
export const slugify = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Truncates a string to a specified length
 * @param {string} str - The string to truncate
 * @param {number} length - The maximum length
 * @param {string} [ending='...'] - The ending to append
 * @returns {string} The truncated string
 */
export const truncate = (str, length, ending = '...') => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length - ending.length) + ending;
};

/**
 * Removes special characters from a string
 * @param {string} str - The string to clean
 * @returns {string} The cleaned string
 */
export const removeSpecialChars = (str) => {
  if (!str) return '';
  return str.replace(/[^a-zA-Z0-9 ]/g, '');
};

/**
 * Converts a string to camelCase
 * @param {string} str - The string to convert
 * @returns {string} The camelCase string
 */
export const toCamelCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
};

/**
 * Checks if a string is empty or contains only whitespace
 * @param {string} str - The string to check
 * @returns {boolean} True if the string is empty or whitespace
 */
export const isEmpty = (str) => {
  return !str || str.trim().length === 0;
};

/**
 * Reverses a string
 * @param {string} str - The string to reverse
 * @returns {string} The reversed string
 */
export const reverse = (str) => {
  if (!str) return '';
  return str.split('').reverse().join('');
};

/**
 * Counts the occurrences of a substring in a string
 * @param {string} str - The string to search in
 * @param {string} searchStr - The substring to search for
 * @returns {number} The number of occurrences
 */
export const countOccurrences = (str, searchStr) => {
  if (!str || !searchStr) return 0;
  return str.split(searchStr).length - 1;
}; 