/**
 * Utility functions for detecting and converting URLs to clickable links
 */

/**
 * Converts URLs in text to clickable anchor tags
 * @param text - The text containing URLs
 * @returns HTML string with URLs converted to anchor tags
 */
export const linkifyText = (text: string): string => {
  if (!text) return '';

  // Regular expression to match URLs
  // Matches http://, https://, and www. URLs
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

  return text.replace(urlRegex, (url) => {
    // Add protocol if missing (for www. links)
    const href = url.startsWith('www.') ? `https://${url}` : url;
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline; cursor: pointer;">${url}</a>`;
  });
};

/**
 * Checks if a string contains any URLs
 * @param text - The text to check
 * @returns boolean indicating if URLs are present
 */
export const containsUrl = (text: string): boolean => {
  if (!text) return false;
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
  return urlRegex.test(text);
};

/**
 * Extracts all URLs from a text string
 * @param text - The text to extract URLs from
 * @returns Array of URL strings
 */
export const extractUrls = (text: string): string[] => {
  if (!text) return [];
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
  return text.match(urlRegex) || [];
};
