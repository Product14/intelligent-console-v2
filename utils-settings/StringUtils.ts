export class StringUtils {
  static toReadableString(str: string): string {
    if (!str) return '';

    return str.replace(/[_\-\.]+/g, ' ');
  }

  static toCapitalize(str: string, captialiseEachWord: boolean = true): string {
    if (!str) return '';

    if (captialiseEachWord) {
      return str
        .trim()
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static camelCaseToReadable(str: string): string {
    if (!str) return '';

    // Normalize common delimiters to single spaces
    let readable = str.replace(/[_\-\.]+/g, ' ');

    // Insert spaces between lowercase-to-uppercase boundaries (e.g., "customerName" -> "customer Name")
    readable = readable.replace(/([a-z])([A-Z])/g, '$1 $2');

    // Split acronym-to-word boundaries (e.g., "HTMLParser" -> "HTML Parser")
    readable = readable.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');

    // Split letter-number and number-letter boundaries (e.g., "order2Items" -> "order 2 Items")
    readable = readable
      .replace(/([a-zA-Z])([0-9])/g, '$1 $2')
      .replace(/([0-9])([a-zA-Z])/g, '$1 $2');

    // Collapse multiple spaces and trim
    readable = readable.replace(/\s+/g, ' ').trim();

    // Title-case words
    return StringUtils.toCapitalize(readable);
  }

  static formatPhoneNumber(phoneNumber: string): string {
    if (!phoneNumber) return '';

    // Remove all non-digit characters except +
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');

    // Handle US/Canada format: +1XXXXXXXXXX
    if (cleaned.startsWith('+1') && cleaned.length === 12) {
      const areaCode = cleaned.substring(2, 5);
      const firstPart = cleaned.substring(5, 8);
      const secondPart = cleaned.substring(8, 12);
      return `+1 (${areaCode}) ${firstPart}-${secondPart}`;
    }

    // Handle US/Canada format without country code: 10 digits
    if (!cleaned.startsWith('+') && cleaned.length === 10) {
      const areaCode = cleaned.substring(0, 3);
      const firstPart = cleaned.substring(3, 6);
      const secondPart = cleaned.substring(6, 10);
      return `+1 (${areaCode}) ${firstPart}-${secondPart}`;
    }

    // Return original if format doesn't match
    return phoneNumber;
  }
}
