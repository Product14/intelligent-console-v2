/**
 * Checks if an object is empty.
 *
 * @param {object} obj - The object to check.
 * @returns {boolean} True if the object is empty, false otherwise.
 */ export function isEmptyObject(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}
