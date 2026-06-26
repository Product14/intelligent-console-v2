var ones = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen'
];
var tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety'
];
var scales = [
    '',
    'Thousand',
    'Million',
    'Billion',
    'Trillion'
];
/**
 * Converts a number to words.
 *
 * @param {number} num - The number to convert.
 * @returns {string} The number in words.
 */ export function numberToWords(num) {
    if (num === 0) return 'Zero';
    var word = '';
    var scaleIndex = 0;
    while(num > 0){
        var part = num % 1000;
        if (part !== 0) {
            var partWord = convertToWords(part);
            word = partWord + (scales[scaleIndex] ? ' ' + scales[scaleIndex] : '') + ' ' + word;
        }
        num = Math.floor(num / 1000);
        scaleIndex++;
    }
    return word.trim();
}
function convertToWords(num) {
    if (num < 20) {
        return ones[num];
    } else if (num < 100) {
        return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
    } else {
        return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' ' + convertToWords(num % 100) : '');
    }
}
