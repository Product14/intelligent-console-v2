import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useRouter } from 'next/router';

import {
  fetchRooftopUsageDetails,
  fetchTeamAssociatedWithEnterprise,
} from '@spyne-console/actions/billing-payments/rooftops';
import { fetchTeamLevelProducts } from '@spyne-console/actions/billing-payments/team-level-products';

import NoDataCard from '../common/no-data-card';
import ViniDetailsWrapper from './converse-ai/vini-details-wrapper';
import DetailsHeader from './details-header';
import RooftopList from './rooftop-list';
import StudioDetailsWrapper from './studio-ai/studio-details-wrapper';
import {
  ProductKey,
  ProductLabelsMap,
  Rooftop,
  TeamRooftop,
  UsageGraphPoint,
  UsageHistoryRow,
  VinUsageSummary,
  createEmptyVinSummary,
  mapApiProductToKey,
  mapTeamRooftopsToRooftops,
} from './utils';

const formatDate = (date: Date) => date.toISOString().slice(0, 10);
const startOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);
const getStartOfMonthString = (date: Date) => formatDate(startOfMonth(date));
const getMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
const ROOFTOPS_PAGE_SIZE = 10;
const buildTimeline = (endDate: Date, months: number) => {
  const timeline: { monthKey: string; label: string; date: Date }[] = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const date = startOfMonth(
      new Date(endDate.getFullYear(), endDate.getMonth() - i, 1)
    );
    timeline.push({
      monthKey: getMonthKey(date),
      label: date.toLocaleString('default', { month: 'short' }),
      date,
    });
  }
  return timeline;
};
const buildGraphDataFallback = (
  timeline: { monthKey: string; label: string }[]
): UsageGraphPoint[] =>
  timeline.map((entry) => ({
    label: entry.label,
    monthKey: entry.monthKey,
    vins: 0,
    images: 0,
    spins: 0,
    videos: 0,
  }));
const getCurrentMonthLabel = (date: Date) =>
  `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;

export default function Usage() {
  const router = useRouter();
  const [selectedRooftopId, setSelectedRooftopId] = useState<string | null>(
    null
  );
  const [activeProduct, setActiveProduct] = useState<ProductKey>('studio-ai');
  const [rooftops, setRooftops] = useState<TeamRooftop[]>([]);
  const [isRooftopsLoading, setIsRooftopsLoading] = useState(false);
  const [rooftopSearch, setRooftopSearch] = useState('');
  const [debouncedRooftopSearch, setDebouncedRooftopSearch] = useState('');
  const currentMonthLabel = useMemo(() => getCurrentMonthLabel(new Date()), []);
  const initialTimeline = useMemo(() => buildTimeline(new Date(), 6), []);
  const [vinSummary, setVinSummary] = useState<VinUsageSummary>(() =>
    createEmptyVinSummary(currentMonthLabel)
  );
  const [historyRows, setHistoryRows] = useState<UsageHistoryRow[]>([]);
  const [graphData, setGraphData] = useState<UsageGraphPoint[]>(() =>
    buildGraphDataFallback(initialTimeline)
  );
  const [isUsageDetailsLoading, setIsUsageDetailsLoading] = useState(false);
  const [nextRooftopPage, setNextRooftopPage] = useState(2);
  const [hasMoreRooftops, setHasMoreRooftops] = useState(true);
  const [isFetchingMoreRooftops, setIsFetchingMoreRooftops] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<ProductKey[]>([]);
  const [productLabels, setProductLabels] = useState<ProductLabelsMap>({});

  const enterpriseId =
    typeof router.query.enterprise_id === 'string'
      ? router.query.enterprise_id
      : undefined;

  const loadRooftops = useCallback(
    async (page = 1, append = false, searchQuery = '') => {
      if (!enterpriseId) {
        return;
      }

      if (append) {
        setIsFetchingMoreRooftops(true);
      } else {
        setIsRooftopsLoading(true);
        setHasMoreRooftops(true);
        setRooftops([]);
      }

      try {
        const response = await fetchTeamAssociatedWithEnterprise({
          enterpriseId,
          page,
          limit: ROOFTOPS_PAGE_SIZE,
          search: searchQuery || undefined,
        });

        const teams = response?.teams ?? [];
        const mappedTeams: TeamRooftop[] = teams.map((team: any) => ({
          id: team.team_id,
          name: team.team_name,
        }));

        setRooftops((prev) => {
          if (!append) {
            return mappedTeams;
          }
          const existingIds = new Set(prev.map((team) => team.id));
          const newEntries = mappedTeams.filter(
            (team) => !existingIds.has(team.id)
          );
          return [...prev, ...newEntries];
        });

        if (mappedTeams.length < ROOFTOPS_PAGE_SIZE) {
          setHasMoreRooftops(false);
        } else {
          setHasMoreRooftops(true);
          setNextRooftopPage(page + 1);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch rooftops:', error);
        if (!append) {
          setRooftops([]);
        }
        setHasMoreRooftops(false);
      } finally {
        if (append) {
          setIsFetchingMoreRooftops(false);
        } else {
          setIsRooftopsLoading(false);
        }
      }
    },
    [enterpriseId]
  );

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedRooftopSearch(rooftopSearch.trim());
    }, 400);

    return () => clearTimeout(handle);
  }, [rooftopSearch]);

  useEffect(() => {
    if (!enterpriseId) {
      setRooftops([]);
      setSelectedRooftopId(null);
      return;
    }
    setNextRooftopPage(2);
    setSelectedRooftopId(null);
    void loadRooftops(1, false, debouncedRooftopSearch);
  }, [debouncedRooftopSearch, enterpriseId, loadRooftops]);

  const mappedRooftops: Rooftop[] = useMemo(
    () => mapTeamRooftopsToRooftops(rooftops),
    [rooftops]
  );

  useEffect(() => {
    if (!selectedRooftopId && mappedRooftops.length > 0) {
      setSelectedRooftopId(mappedRooftops[0].id);
    }
  }, [mappedRooftops, selectedRooftopId]);

  const selectedRooftop = mappedRooftops.find(
    (r) => r.id === selectedRooftopId
  );

  useEffect(() => {
    if (!selectedRooftopId) {
      setAvailableProducts([]);
      return;
    }

    const loadTeamProducts = async () => {
      try {
        const response = await fetchTeamLevelProducts({
          teamId: selectedRooftopId,
        });
        const items = response?.data?.products ?? [];

        const productKeys: ProductKey[] = items
          .map((item: any) => mapApiProductToKey(item))
          .filter(
            Boolean as unknown as (
              productKey: ProductKey | null
            ) => productKey is ProductKey
          );

        setAvailableProducts(productKeys);

        const labelsMap: ProductLabelsMap = {};
        items.forEach((item: any) => {
          const key = mapApiProductToKey(item);
          if (key) {
            labelsMap[key] = item.displayName ?? labelsMap[key];
          }
        });
        setProductLabels(labelsMap);

        // Ensure activeProduct aligns with available products
        setActiveProduct((prev) => {
          if (prev && productKeys.includes(prev)) {
            return prev;
          }
          // If no products are available, keep previous value but tabs/content will be hidden
          return productKeys[0] ?? prev;
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch team level products:', error);
        setAvailableProducts([]);
        setProductLabels({});
      }
    };

    void loadTeamProducts();
  }, [selectedRooftopId]);

  const fetchStudioUsageDetails = useCallback(
    async (teamId: string, enterpriseId: string) => {
      const today = new Date();
      const endDate = formatDate(today);
      const summaryStartDate = getStartOfMonthString(today);
      const timeline = buildTimeline(today, 6);
      const graphStartDate =
        timeline.length > 0
          ? getStartOfMonthString(timeline[0].date)
          : undefined;

      try {
        setIsUsageDetailsLoading(true);
        const [summaryResponse, graphResponse, historyResponse] =
          await Promise.all([
            fetchRooftopUsageDetails({
              enterpriseId,
              teamId,
              startDate: summaryStartDate,
              endDate,
            }),
            fetchRooftopUsageDetails({
              enterpriseId,
              teamId,
              startDate: graphStartDate,
              endDate,
            }),
            fetchRooftopUsageDetails({
              enterpriseId,
              teamId,
              endDate,
            }),
          ]);

        const currentMonthLabel = getCurrentMonthLabel(today);
        const summaryMonthlyData = summaryResponse?.monthlyData ?? [];
        const currentMonthData = summaryMonthlyData.at(-1);

        setVinSummary(
          currentMonthData
            ? {
                monthLabel: currentMonthLabel,
                totalVins: currentMonthData.data?.vins ?? 0,
                withImages: currentMonthData.data?.images ?? 0,
                withVideoTours: currentMonthData.data?.videos ?? 0,
                withSpins: currentMonthData.data?.threesixty ?? 0,
              }
            : createEmptyVinSummary(currentMonthLabel)
        );

        const graphMonthly = graphResponse?.monthlyData ?? [];
        const monthlyMap = new Map<string, any>();
        graphMonthly.forEach((item: any) => {
          const date = item.startDate
            ? startOfMonth(new Date(item.startDate))
            : startOfMonth(new Date(`${item.month} 1, ${item.year}`));
          monthlyMap.set(getMonthKey(date), item);
        });

        const mappedGraph: UsageGraphPoint[] = (
          timeline.length ? timeline : buildTimeline(today, 6)
        ).map((entry) => {
          const existing = monthlyMap.get(entry.monthKey);
          return {
            label: entry.label,
            monthKey: entry.monthKey,
            vins: existing?.data?.vins ?? 0,
            images: existing?.data?.images ?? 0,
            spins: existing?.data?.threesixty ?? 0,
            videos: existing?.data?.videos ?? 0,
          };
        });
        setGraphData(mappedGraph);

        const historyMonthly = historyResponse?.monthlyData || [];
        const latestHistory =
          historyMonthly.length > 0
            ? historyMonthly[historyMonthly.length - 1]
            : null;

        const mappedHistory: UsageHistoryRow[] = historyMonthly
          .map((item: any) => ({
            monthLabel: `${item.month} ${item.year}`,
            isCurrent:
              latestHistory?.month === item.month &&
              latestHistory?.year === item.year,
            vinsProcessed: item.data?.vins || 0,
            images: item.data?.images || 0,
            spins: item.data?.threesixty || 0,
            videoTours: item.data?.videos || 0,
          }))
          .reverse();
        setHistoryRows(mappedHistory);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch rooftop usage details:', error);
        const label = `${today.toLocaleString('default', {
          month: 'long',
        })} ${today.getFullYear()}`;
        setVinSummary(createEmptyVinSummary(label));
        setHistoryRows([]);
        const timelineFallback = buildTimeline(today, 6);
        setGraphData(buildGraphDataFallback(timelineFallback));
      } finally {
        setIsUsageDetailsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!selectedRooftopId) {
      return;
    }
    const enterpriseId =
      typeof router.query.enterprise_id === 'string'
        ? router.query.enterprise_id
        : undefined;

    if (!enterpriseId) {
      return;
    }

    if (activeProduct === 'studio-ai') {
      void fetchStudioUsageDetails(selectedRooftopId, enterpriseId);
    }
    // Future: add Vini AI fetch logic here once API is available.
  }, [
    activeProduct,
    fetchStudioUsageDetails,
    router.query.enterprise_id,
    selectedRooftopId,
  ]);

  const handleSelectRooftop = (id: string) => {
    setSelectedRooftopId(id);
  };

  const handleLoadMoreRooftops = () => {
    if (!hasMoreRooftops || isFetchingMoreRooftops || isRooftopsLoading) {
      return;
    }
    void loadRooftops(nextRooftopPage, true, debouncedRooftopSearch);
  };

  const isDetailsLoading = isUsageDetailsLoading || isRooftopsLoading;

  return (
    <div className="flex h-full min-h-[50vh] rounded-3xl border border-black/10 bg-white shadow-[0px_1px_4px_0px_#0000000A]">
      <div className="h-full w-96">
        <RooftopList
          rooftops={mappedRooftops}
          selectedRooftopId={selectedRooftopId}
          onSelectRooftop={handleSelectRooftop}
          isRooftopsLoading={isRooftopsLoading}
          onLoadMore={handleLoadMoreRooftops}
          hasMore={hasMoreRooftops}
          isFetchingMore={isFetchingMoreRooftops}
          onSearch={setRooftopSearch}
        />
      </div>
      <div className="w-[calc(100%-24rem)] p-3">
        <div className="bg-gray-light h-full w-full rounded-xl border border-black/10 px-9 pt-7">
          <DetailsHeader
            rooftop={selectedRooftop}
            activeProduct={activeProduct}
            onChangeProduct={setActiveProduct}
            availableProducts={availableProducts}
            productLabels={productLabels}
          />

          {selectedRooftop &&
            availableProducts.length === 0 &&
            !isDetailsLoading && (
              <div className="mt-6 flex h-[60vh] items-center justify-center">
                <NoDataCard />
              </div>
            )}

          {selectedRooftop &&
            activeProduct === 'studio-ai' &&
            availableProducts.includes('studio-ai') && (
              <StudioDetailsWrapper
                vinSummary={vinSummary}
                graphData={graphData}
                historyRows={historyRows}
                isLoading={isDetailsLoading}
              />
            )}
          {selectedRooftop &&
            activeProduct === 'conversational-ai' &&
            availableProducts.includes('conversational-ai') && (
              <ViniDetailsWrapper
                rooftop={selectedRooftop}
                enterpriseId={enterpriseId}
              />
            )}
        </div>
      </div>
    </div>
  );
}
