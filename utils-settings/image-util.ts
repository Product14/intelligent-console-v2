const bucketCDNMap: Record<string, string> = {
  'spyne-static.s3.us-east-1.amazonaws.com': 'd20uiuzezo3er4.cloudfront.net',
  'spyne-test.s3.us-east-1.amazonaws.com': 'd12ngfxuy41x0p.cloudfront.net',
  'spyne-prod-conversational-ai.s3.us-east-1.amazonaws.com':
    'd1dm0o5huagnd6.cloudfront.net',
};

const bucketReplaceRegex = new RegExp(
  Object.keys(bucketCDNMap)
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|')
);

export const getSafeStaticAssetUrl = (assetUrl: string): string => {
  return assetUrl.replace(
    bucketReplaceRegex,
    (match) => bucketCDNMap[match] || match
  );
};
