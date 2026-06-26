export const downloadMP4Video = async (downloadUrl, videoDownloadName) => {
  const response = await fetch(downloadUrl, { method: 'GET' });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const blob = await response.blob();
  if (blob.type !== 'video/mp4') {
    throw new Error('Downloaded file is not a valid MP4 video');
  }

  const urlCreator = window.URL || window.webkitURL;
  const videoUrl = urlCreator.createObjectURL(blob);
  const tag = document.createElement('a');
  tag.href = videoUrl;
  tag.download = `${videoDownloadName}.mp4`;
  document.body.appendChild(tag);
  tag.click();
  document.body.removeChild(tag);
  urlCreator.revokeObjectURL(videoUrl);
}