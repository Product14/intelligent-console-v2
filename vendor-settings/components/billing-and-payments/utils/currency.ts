/**
 * Returns the currency symbol for a given currency code
 * @param currencyCode - ISO 4217 currency code (e.g., 'USD', 'AUD', 'EUR')
 * @returns Currency symbol string
 */
export function getCurrencySymbol(currencyCode: string): string {
  const currencyMap: Record<string, string> = {
    USD: '$',
    AUD: 'A$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    CHF: 'CHF',
    CNY: '¥',
    INR: '₹',
    NZD: 'NZ$',
    SGD: 'S$',
    HKD: 'HK$',
    SEK: 'kr',
    NOK: 'kr',
    DKK: 'kr',
    PLN: 'zł',
    MXN: '$',
    BRL: 'R$',
    ZAR: 'R',
    KRW: '₩',
    TRY: '₺',
    RUB: '₽',
  };

  return currencyMap[currencyCode.toUpperCase()] || currencyCode;
}

/**
 * Formats an amount with the appropriate currency symbol
 * @param amount - The numeric amount
 * @param currencyCode - ISO 4217 currency code
 * @returns Formatted string (e.g., "A$ 515.00")
 */
export function formatCurrency(amount: number, currencyCode: string): string {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol} ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
