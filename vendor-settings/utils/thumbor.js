import { createNewImage } from './config';

export function s3ToCdn(url) {
  const mappings = {
    'spyne-static': 'd20uiuzezo3er4.cloudfront.net',
    spyne: 'd3idfzajdmihlu.cloudfront.net',
    'spyne-prod-tech': 'dne6gcks9bdc7.cloudfront.net',
    'spyne-test': 'd12ngfxuy41x0p.cloudfront.net',
  };

  const decodedUrl = decodeURIComponent(url);

  const match = decodedUrl.match(/https:\/\/(.+?)\.s3\.amazonaws\.com/);
  if (match && match[1] in mappings) {
    return decodedUrl.replace(
      `${match[1]}.s3.amazonaws.com`,
      mappings[match[1]]
    );
  }

  return decodedUrl;
}

export const createThumborUrl = ({
  originalImageUrl,
  resolution,
  format = 'webp',
  quality = 75,
}) => {
  try {
    if (!originalImageUrl || typeof originalImageUrl !== 'string') {
      throw new Error('Invalid originalImageUrl.');
    }

    if (
      !process.env.NEXT_PUBLIC_SHOW_THUMBOR_URL ||
      originalImageUrl.startsWith('blob:') ||
      originalImageUrl.toLowerCase().endsWith('.svg')
    ) {
      return originalImageUrl;
    }

    const cdnUrl = s3ToCdn(originalImageUrl);

    const thumborDomain = process.env.NEXT_PUBLIC_THUMBOR_DOMAIN_URL;

    if (!thumborDomain) {
      throw new Error('Thumbor domain URL is not configured.');
    }

    const resolutionParam = resolution ? `fit-in/${resolution}` : 'fit-in';

    const formatParam = `filters:format(${format})`;

    const qualityParam = quality ? `quality(${quality})` : '';

    const thumborUrl = `${thumborDomain}/unsafe/${resolutionParam}/${formatParam}/${cdnUrl}`;

    return thumborUrl;
  } catch (error) {
    console.error('Error creating Thumbor URL:', error.message);
    return originalImageUrl;
  }
};

export default function thumborLoader({ src, width, quality }) {
  // return createThumborUrl({
  //   originalImageUrl: src,
  //   resolution: `${width}x0`,
  //   quality: quality || 75,
  // });
  if (!width || !/^\d+(x\d*)?$/.test(width)) {
    // accept : 300, 300x300, 300x
    return src;
  }

  const filteredWidth = String(width)?.split('x')[0];
  return createNewImage(src, `${filteredWidth}x`);
}
