interface ProductStyleConfig {
  bgColor: string;
  borderColor: string;
  textColor: string;
  logo: string;
  bgImage: string;
}

export function getProductStyles(productName: string): ProductStyleConfig {
  const normalizedName = productName.toLowerCase().trim();

  const productStyleMap: Record<string, ProductStyleConfig> = {
    'studio ai': {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      logo: 'https://spyne-static.s3.us-east-1.amazonaws.com/console/admin+tools/studio+ai.svg',
      bgImage:
        'https://spyne-static.s3.us-east-1.amazonaws.com/console/admin+tools/studio+bg.svg',
    },
    'vini ai': {
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700',
      logo: 'https://spyne-static.s3.us-east-1.amazonaws.com/console/admin+tools/vini+ai.svg',
      bgImage:
        'https://spyne-static.s3.us-east-1.amazonaws.com/console/admin+tools/vini+bg.svg',
    },
    'conversational ai': {
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700',
      logo: 'https://spyne-static.s3.us-east-1.amazonaws.com/console/admin+tools/vini+ai.svg',
      bgImage:
        'https://spyne-static.s3.us-east-1.amazonaws.com/console/admin+tools/vini+bg.svg',
    },
  };

  // Return the style config or default gray scheme if product not found
  return (
    productStyleMap[normalizedName] || {
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-700',
      logo: 'https://spyne-static.s3.us-east-1.amazonaws.com/console/admin+tools/studio+ai.svg',
      bgImage:
        'https://spyne-static.s3.us-east-1.amazonaws.com/console/admin+tools/studio+bg.svg',
    }
  );
}

export function getProductBadgeClasses(productName: string): string {
  const { bgColor, borderColor, textColor } = getProductStyles(productName);
  return `${bgColor} ${borderColor} ${textColor}`;
}

// Get styles for individual product features based on parent product (Studio AI or Vini AI)
export function getProductFeatureStyles(
  parentProductName: string
): Pick<ProductStyleConfig, 'bgColor' | 'borderColor' | 'textColor'> {
  const normalizedName = normalizeProductName(parentProductName)
    .toLowerCase()
    .trim();

  // Studio AI products get blue colors
  if (normalizedName === 'studio ai') {
    return {
      bgColor: 'bg-gradient-to-b from-blue-50 to-teal-50',
      borderColor: 'border-gray-300',
      textColor: 'text-gray-700 text-xs font-medium ',
    };
  }

  // Vini AI products get purple colors
  if (normalizedName === 'vini ai') {
    return {
      bgColor: 'bg-gradient-to-b from-purple-50 to-white',
      borderColor: 'border-gray-300',
      textColor: 'text-gray-700 text-xs font-medium ',
    };
  }

  // Default gray scheme for unknown products
  return {
    bgColor: 'bg-gradient-to-b from-gray-50 to-white',
    borderColor: 'border-gray-300',
    textColor: 'text-gray-700 text-xs font-medium ',
  };
}

// Normalize product display name (replace "Conversational AI" with "Vini AI")
export function normalizeProductName(productName: string): string {
  if (!productName) return productName;
  const normalized = productName.trim();
  if (
    normalized.toLowerCase() === 'conversational ai' ||
    normalized === 'Conversational AI'
  ) {
    return 'Vini AI';
  }
  return productName;
}
