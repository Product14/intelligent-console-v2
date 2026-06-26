// Vehicle API Response Types
export interface VehicleData {
  enterpriseId: string;
  teamId: string;
  dealerVinId: string;
  vin: string;
  stockNumber: string | null;
  registrationNumber: string | null;
  isDeleted: boolean;
  liveOnWeb: boolean;
  approvedByDealer: boolean;
  assured: boolean;
  recommended: boolean;
  leadCount: number;
  year: number | null;
  model: string | null;
  trim: string | null;
  make: string | null;
  isSold: boolean;
  soldAt: string | null;
  createdAt: string;
  ageInDays: number;
  costPrice: {
    value: number;
    purchasePrice: number;
    otherExpenses: any[];
    currency: string;
    currencySign: string;
  };
  sellingPrice?: {
    value?: number;
    currency?: string;
    currencySign?: string;
  };
  profit: number;
  mediaId: string;
  mediaOverallStatus: string;
  platformList: string[];
  thumbnailUrl: string;
  isCatalog: boolean;
  catalogSkuId: string | null;
  catalogProcessingStatus: string | null;
  catalogQcStatus: string | null;
  isSpin: boolean;
  spinSkuId: string | null;
  spinProcessingStatus: string | null;
  spinQcStatus: string | null;
  isFeatureVideo: boolean;
  featureVideoSkuId: string | null;
  featureVideoProcessingStatus: string | null;
  featureVideoQcStatus: string | null;
  isThreeD: boolean;
  threeDThumbnailUrl: string | null;
  threeDProcessingStatus: string | null;
  threeDQcStatus: string | null;
}

export interface VehicleListPagination {
  totalCount: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface VehicleListFilters {
  applied: {
    isSold: boolean;
  };
}

export interface VehicleListSorting {
  sortBy: string;
  sortOrder: string;
}

export interface VehicleListApiResponse {
  message: string;
  data: VehicleData[];
  pagination: VehicleListPagination;
  filters: VehicleListFilters;
  sorting: VehicleListSorting;
}

// For the table display
export interface VehicleTableData {
  id: string;
  vehicle: string;
  vin: string;
  price: string;
  mileage: string;
  dealerVinId: string;
}

// Vehicle List Request Parameters
export interface VehicleListRequest {
  enterpriseId: string;
  teamId: string;
  page?: number;
  perPage?: number;
  isSold?: boolean;
  sortBy?: string;
  sortOrder?: string;
  q?: string;
}
