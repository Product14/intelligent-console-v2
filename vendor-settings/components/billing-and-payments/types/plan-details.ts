export interface ProductItem {
  name: string;
  displayName: string;
  displayLogoUrl: string;
}

export interface PlanDetailsItem {
  product: ProductItem[];
  plan: string;
  totalRooftops: number;
  billing: number;
  pricing: number;
  currency: string;
}

export interface GetPlanDetailsParams {
  enterpriseId: string;
}

export interface GetPlanDetailsResponse {
  message: string;
  error: boolean;
  code: string;
  details: null;
  data: {
    studioAi: PlanDetailsItem[];
    conversationalAi: PlanDetailsItem[];
  };
}
