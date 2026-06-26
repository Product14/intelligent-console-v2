import { ProductKey, VinUsageSummary } from './utils';

export const PRODUCT_LABELS: Record<ProductKey, string> = {
  'studio-ai': 'Studio AI',
  'conversational-ai': 'Conversational AI',
};

export const MOCK_SUMMARY_BY_PRODUCT: Record<ProductKey, VinUsageSummary> = {
  'studio-ai': {
    monthLabel: 'October 2025',
    totalVins: 0,
    withImages: 0,
    withVideoTours: 0,
    withSpins: 0,
  },
  'conversational-ai': {
    monthLabel: 'October 2025',
    totalVins: 0,
    withImages: 0,
    withVideoTours: 0,
    withSpins: 0,
  },
};

export const customStyles = {
  defaultBarBg: '#45BEDC',
  defaultBarTextColor: '#fff',
  onHoverBarBg: '#45bedcc4',
  onHoverBarTextColor: '#fff',
  barTrackBg: 'transparent',
};

export const USAGE_TABLE_HEADERS = [
  {
    label: 'Month',
    key: 'monthLabel',
  },
  {
    label: 'VINs Processed',
    key: 'vinsProcessed',
  },
  {
    label: 'Images',
    key: 'images',
  },
  {
    label: '360 Spins',
    key: 'spins',
  },
  {
    label: 'Video Tours',
    key: 'videoTours',
  },
];
