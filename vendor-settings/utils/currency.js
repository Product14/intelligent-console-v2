export function formatCurrency(value) {
    if (!value && value != 0) return '';
    if (value < 1000) {
        return value.toString();
    }
    if (value >= 1000 && value < 1000000) {
        return Math.floor(value / 10) / 100 + 'K'; // Thousands
    }
    if (value >= 1000000 && value < 1000000000) {
        return Math.floor(value / 10000) / 100 + 'M'; // Millions
    }
    if (value >= 1000000000) {
        return Math.floor(value / 10000000) / 100 + 'B'; // Billions
    }
    return value.toString();
}
