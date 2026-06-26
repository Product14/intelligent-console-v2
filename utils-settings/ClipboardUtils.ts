import { toast } from 'react-toastify';

export class ClipboardUtils {
  static copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast('Copied to clipboard', {
          hideProgressBar: true,
          autoClose: 2000,
          type: 'success',
          position: 'bottom-center',
          pauseOnHover: true,
        });
      },
      (err) => {
        toast('Could not copy text: err', {
          hideProgressBar: true,
          autoClose: 2000,
          type: 'error',
          position: 'bottom-center',
          pauseOnHover: true,
        });
      }
    );
  };
}
