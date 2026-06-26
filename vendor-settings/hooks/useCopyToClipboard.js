import { useState } from 'react';

const useCopyToClipboard = () => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async (text) => {
    if (!navigator.clipboard) {
      console.error('Clipboard API is not available.');
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500); // reset the state after 1.5 seconds
      return true;
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setIsCopied(false);
      return false;
    }
  };

  return { isCopied, copyToClipboard };
};

export default useCopyToClipboard;
