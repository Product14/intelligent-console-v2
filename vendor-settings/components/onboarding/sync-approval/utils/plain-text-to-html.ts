/**
 * Converts plain text to HTML, preserving the structure the user entered.
 *
 * - Double newlines (\n\n) are treated as paragraph breaks (<p>).
 * - Single newlines (\n) become <br /> tags within a paragraph.
 * - Special characters are escaped to prevent XSS.
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function plainTextToHtml(text: string): string {
  if (!text.trim()) return '';

  const escaped = escapeHtml(text);

  // Split by double newlines to create paragraphs
  const paragraphs = escaped.split(/\n{2,}/);

  return paragraphs
    .map((paragraph) => {
      // Replace single newlines with <br /> within each paragraph
      const withBreaks = paragraph.trim().replace(/\n/g, '<br />');
      return `<p>${withBreaks}</p>`;
    })
    .join('');
}
