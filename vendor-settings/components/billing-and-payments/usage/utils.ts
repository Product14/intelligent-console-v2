export const EMPTY_GRAPH_POINT: UsageGraphPoint = {
  label: '',
  monthKey: '',
  vins: 0,
  images: 0,
  spins: 0,
  videos: 0,
};
export type TeamRooftop = {
  readonly id: string;
  readonly name: string;
};

export type ProductKey = 'studio-ai' | 'conversational-ai';

export type ProductLabelsMap = Partial<Record<ProductKey, string>>;

export type VinUsageSummary = {
  readonly monthLabel: string;
  readonly totalVins: number;
  readonly withImages: number;
  readonly withVideoTours: number;
  readonly withSpins: number;
};

export type UsageHistoryRow = {
  readonly monthLabel: string;
  readonly isCurrent?: boolean;
  readonly vinsProcessed: number;
  readonly images: number;
  readonly spins: number;
  readonly videoTours: number;
};

export type UsageGraphPoint = {
  readonly label: string;
  readonly monthKey: string;
  readonly vins: number;
  readonly images: number;
  readonly spins: number;
  readonly videos: number;
};

export function getRooftopInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

export function mapTeamRooftopsToRooftops(rooftops: TeamRooftop[]): Rooftop[] {
  return rooftops.map((r) => ({
    id: r.id,
    name: r.name,
    initials: getRooftopInitials(r.name),
  }));
}

export function createEmptyVinSummary(monthLabel: string): VinUsageSummary {
  return {
    monthLabel,
    totalVins: 0,
    withImages: 0,
    withVideoTours: 0,
    withSpins: 0,
  };
}

export type Rooftop = {
  id: string;
  name: string;
  initials: string;
};

export type DetailsHeaderProps = {
  readonly rooftop?: Rooftop;
  readonly activeProduct: ProductKey;
  readonly onChangeProduct: (product: ProductKey) => void;
  readonly availableProducts?: ProductKey[];
  readonly productLabels?: ProductLabelsMap;
};
export type RooftopListProps = {
  readonly rooftops: Rooftop[];
  readonly selectedRooftopId: string | null;
  readonly onSelectRooftop: (id: string) => void;
  readonly isRooftopsLoading?: boolean;
  readonly onLoadMore?: () => void;
  readonly hasMore?: boolean;
  readonly isFetchingMore?: boolean;
  readonly onSearch?: (value: string) => void;
};

export type ViniMonthlyUsageSummary = {
  readonly id: string;
  readonly monthLabel: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly totalCalls: number;
  readonly includedCalls: number;
};

export type ViniAgentUsageSummary = {
  readonly id: string;
  readonly name: string;
  readonly direction: string;
  readonly category: string;
  readonly callsMade: number;
  readonly includedCalls: number;
  readonly isOverUsage?: boolean;
};

export function mapApiProductToKey(product: any): ProductKey | null {
  const registryId = product?.productLineRegistryId as string | undefined;
  if (!registryId) return null;

  if (registryId === '68ff7a1abefb847b44b6d1b7') return 'studio-ai';
  if (registryId === '68ff7a65befb847b44b6d1b8') return 'conversational-ai';
  return null;
}
