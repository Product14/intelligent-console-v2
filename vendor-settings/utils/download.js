export const downloadFile = async (url, filename) => {
  try {
    // Fetch the file
    const response = await fetch(url, { mode: 'cors', cache: 'reload' });

    // Check if the fetch was successful
    if (!response.ok) {
      throw new Error(
        `Failed to download: ${response.status} ${response.statusText}`
      );
    }

    // Convert the response to a blob
    const blob = await response.blob();

    // If no filename is provided, try to get it from the URL or use a default
    if (!filename) {
      // Try to extract filename from URL or Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // If still no filename, extract from URL
      if (!filename) {
        filename = url.split('/').pop().split('?')[0] || 'download';
      }
    }

    // Create a temporary URL for the blob
    const blobUrl = window.URL.createObjectURL(blob);

    // Create a temporary anchor element
    const downloadLink = document.createElement('a');

    // Set download attributes
    downloadLink.href = blobUrl;
    downloadLink.download = filename;

    // Append to the DOM (not visible)
    document.body.appendChild(downloadLink);

    // Programmatically click the link to trigger the download
    downloadLink.click();

    // Clean up
    document.body.removeChild(downloadLink);
    window.URL.revokeObjectURL(blobUrl);

    return true;
  } catch (error) {
    console.error('Download failed:', error);
    return false;
  }
};
