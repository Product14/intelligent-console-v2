export class NavigatorUtils {
  static async copyToClipboard(text: string, type: 'phone' | 'email') {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (_) {
        // no-op
      }
    }
  }
}
