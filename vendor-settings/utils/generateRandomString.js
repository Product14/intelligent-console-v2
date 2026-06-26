/**
 * Generates a random alphanumeric string.
 *
 * @param {number} length - The length of the generated string.
 * @returns {string} The generated random string.
 */ export function generateRandomString(length) {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var result = '';
    for(var i = 0; i < length; i++){
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
