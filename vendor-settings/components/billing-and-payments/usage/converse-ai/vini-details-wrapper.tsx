import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import SvgIcon from '@spyne-console/design-system/svg';

import { fetchUnitCount } from '@spyne-console/actions/billing-payments/get-unit-count';
import {
  fetchTeamMonthlyUsageAgentTypes,
  fetchTeamMonthlyUsageSummary,
} from '@spyne-console/actions/billing-payments/monthly-usage-team-agents';

import NoDataCard from '../../common/no-data-card';
import { formatDate } from '../../utils/date';
import {
  Rooftop,
  ViniAgentUsageSummary,
  ViniMonthlyUsageSummary,
} from '../utils';
import ConverseDataCard from './converse-data-card';
import ViniAgentsSkeleton from './vini-agents-skeleton';
import ViniMonthlySkeleton from './vini-monthly-skeleton';

type ViniDetailsWrapperProps = {
  readonly rooftop?: Rooftop;
  readonly enterpriseId?: string;
};

type AgentTypesByMonthKey = Record<string, ViniAgentUsageSummary[]>;

export default function ViniDetailsWrapper({
  rooftop,
  enterpriseId,
}: ViniDetailsWrapperProps) {
  const [monthlySummary, setMonthlySummary] = useState<
    ViniMonthlyUsageSummary[]
  >([]);
  const [agentTypesByMonth, setAgentTypesByMonth] =
    useState<AgentTypesByMonthKey>({});
  const [expandedMonthKey, setExpandedMonthKey] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [nextSummaryPage, setNextSummaryPage] = useState(2);
  const [hasMoreMonths, setHasMoreMonths] = useState(true);
  const [isFetchingMoreMonths, setIsFetchingMoreMonths] = useState(false);
  const [totalIncludedUnits, setTotalIncludedUnits] = useState(0);
  const [includedUnitsByType, setIncludedUnitsByType] = useState<
    Record<string, number>
  >({});

  const teamId = rooftop?.id;

  const hasData = monthlySummary.length > 0;

  const fetchAgentTypesForMonth = async (
    month: ViniMonthlyUsageSummary,
    unitsByType: Record<string, number>
  ) => {
    if (!enterpriseId || !teamId) {
      return;
    }

    if (agentTypesByMonth[month.id]) {
      return;
    }

    const monthIso = month.startDate?.slice(0, 7) ?? '';
    if (!monthIso) {
      return;
    }

    // Use override if provided, otherwise use state (for newly expanded months)
    const unitsToUse = unitsByType ?? includedUnitsByType;

    try {
      setIsLoadingAgents(true);
      const baseAgents: ViniAgentUsageSummary[] = Object.keys(unitsToUse).map(
        (unitKey) => {
          const includedCalls = unitsToUse[unitKey] ?? 0;

          // Parse unitKey: inboundSales, outboundSales, inboundService, outboundService
          const direction = unitKey.startsWith('inbound')
            ? 'inbound'
            : 'outbound';
          const category = unitKey.includes('Sales') ? 'sales' : 'service';

          return {
            id: `${unitKey}-${month.id}`,
            name: `0 ${category} ${direction} Agents`,
            direction,
            category,
            callsMade: 0,
            includedCalls,
            isOverUsage: false,
          };
        }
      );

      // Step 2: Fetch actual usage data from API
      const response = await fetchTeamMonthlyUsageAgentTypes({
        enterpriseId,
        teamId,
        month: monthIso,
      });

      const items = response ?? [];

      // Step 3: Create a map of usage data by unitKey
      const usageMap = new Map<string, any>();
      items.forEach((item: any) => {
        const direction = item.callType ?? 'inbound';
        const category = item.agentType ?? 'sales';
        const unitKey = `${direction}${category.charAt(0).toUpperCase()}${category.slice(1)}`;
        usageMap.set(unitKey, item);
      });

      // Step 4: Merge usage data into base cards
      const mappedAgents: ViniAgentUsageSummary[] = baseAgents.map(
        (baseAgent) => {
          // Extract unitKey from agent id
          const unitKey = baseAgent.id.split('-')[0];
          const usageData = usageMap.get(unitKey);

          if (usageData) {
            // Update with actual usage data
            const agentCount = usageData.agentCount ?? 0;
            const callsMade = usageData.totalCalls ?? 0;

            const isOverUsage =
              typeof callsMade === 'number' &&
              typeof baseAgent.includedCalls === 'number' &&
              baseAgent.includedCalls > 0 &&
              callsMade > baseAgent.includedCalls;

            return {
              ...baseAgent,
              name: `${agentCount} ${baseAgent.category} ${baseAgent.direction} Agents`,
              callsMade,
              isOverUsage,
            };
          }

          // Keep base agent with 0 usage
          return baseAgent;
        }
      );

      setAgentTypesByMonth((prev) => ({
        ...prev,
        [month.id]: mappedAgents,
      }));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load Vini monthly agent types:', error);

      // On error, still show all agent types from get-unit-count with 0 usage
      const fallbackAgents: ViniAgentUsageSummary[] = Object.keys(
        unitsByType
      ).map((unitKey) => {
        const includedCalls = unitsByType[unitKey] ?? 0;
        const direction = unitKey.startsWith('inbound')
          ? 'inbound'
          : 'outbound';
        const category = unitKey.includes('Sales') ? 'sales' : 'service';

        return {
          id: `${unitKey}-${month.id}`,
          name: `0 ${category} ${direction} Agents`,
          direction,
          category,
          callsMade: 0,
          includedCalls,
          isOverUsage: false,
        };
      });

      setAgentTypesByMonth((prev) => ({
        ...prev,
        [month.id]: fallbackAgents,
      }));
    } finally {
      setIsLoadingAgents(false);
    }
  };

  useEffect(() => {
    if (!enterpriseId || !teamId) {
      setMonthlySummary([]);
      setExpandedMonthKey(null);
      setAgentTypesByMonth({});
      setHasMoreMonths(true);
      setNextSummaryPage(2);
      return;
    }

    const loadSummary = async () => {
      try {
        setIsLoadingSummary(true);
        const [summaryResponse, unitResponse] = await Promise.all([
          fetchTeamMonthlyUsageSummary({
            enterpriseId,
            teamId,
            page: 1,
            limit: 10,
          }),
          fetchUnitCount({ teamId }),
        ]);

        const items = summaryResponse?.data ?? [];
        const mapped: ViniMonthlyUsageSummary[] = items.map(
          (item: any, index: number) => ({
            id: `${item.year}-${item.month}-${index}`,
            monthLabel: item.month,
            startDate: item.start,
            endDate: item.end,
            totalCalls: item?.totalCalls ?? 0,
            includedCalls: 0, // will be set below from unit counts
          })
        );
        setMonthlySummary(mapped);

        // Derive included units for Conversational AI from fetchUnitCount
        const units = unitResponse?.data?.units ?? [];
        const conversationalUnits = units.filter(
          (unit: any) => unit.productLineRegistryName === 'conversationalAi'
        );
        const byType: Record<string, number> = {};
        let totalUnits = 0;
        conversationalUnits.forEach((unit: any) => {
          const key = unit.productRegistryName;
          const value = typeof unit.units === 'number' ? unit.units : 0;
          if (key) {
            byType[key] = value;
          }
          totalUnits += value;
        });
        setIncludedUnitsByType(byType);
        setTotalIncludedUnits(totalUnits);

        // Update monthly summaries with total included units
        if (totalUnits > 0) {
          setMonthlySummary((prev) =>
            prev.map((month) => ({
              ...month,
              includedCalls: totalUnits,
            }))
          );
        }

        const hasNext = Boolean(summaryResponse?.pagination?.hasNext);
        setHasMoreMonths(hasNext);
        if (hasNext && typeof summaryResponse?.pagination?.page === 'number') {
          setNextSummaryPage(summaryResponse.pagination.page + 1);
        } else {
          setNextSummaryPage(2);
        }

        const firstMonth = mapped[0];
        setExpandedMonthKey(firstMonth?.id ?? null);

        if (firstMonth && Object.keys(byType).length > 0) {
          void fetchAgentTypesForMonth(firstMonth, byType);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load Vini monthly usage summary:', error);
        setMonthlySummary([]);
        setExpandedMonthKey(null);
      } finally {
        setIsLoadingSummary(false);
      }
    };

    void loadSummary();
  }, [enterpriseId, teamId]);

  const loadMoreMonths = async () => {
    if (!enterpriseId || !teamId) {
      return;
    }
    if (!hasMoreMonths || isFetchingMoreMonths || isLoadingSummary) {
      return;
    }

    try {
      setIsFetchingMoreMonths(true);
      const response = await fetchTeamMonthlyUsageSummary({
        enterpriseId,
        teamId,
        page: nextSummaryPage,
        limit: 10,
      });

      const items = response?.data ?? [];
      const mapped: ViniMonthlyUsageSummary[] = items.map(
        (item: any, index: number) => ({
          id: `${item.year}-${item.month}-${nextSummaryPage}-${index}`,
          monthLabel: item.month,
          startDate: item.start,
          endDate: item.end,
          totalCalls: item?.totalCalls ?? 0,
          includedCalls: totalIncludedUnits,
        })
      );

      setMonthlySummary((prev) => [...prev, ...mapped]);

      const hasNext = Boolean(response?.pagination?.hasNext);
      setHasMoreMonths(hasNext);
      if (hasNext && typeof response?.pagination?.page === 'number') {
        setNextSummaryPage(response.pagination.page + 1);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load more Vini monthly usage summary:', error);
      setHasMoreMonths(false);
    } finally {
      setIsFetchingMoreMonths(false);
    }
  };

  const handleToggleMonth = async (month: ViniMonthlyUsageSummary) => {
    if (!enterpriseId || !teamId) {
      return;
    }
    const isSame = expandedMonthKey === month.id;
    if (isSame) {
      setExpandedMonthKey(null);
      return;
    }

    setExpandedMonthKey(month.id);

    void fetchAgentTypesForMonth(month, includedUnitsByType);
  };

  return (
    <div
      id="vini-monthly-scroll-container"
      className="no-scrollbar my-5 max-h-[66vh] w-full overflow-y-auto"
    >
      <div className="w-full">
        {isLoadingSummary && !hasData && <ViniMonthlySkeleton rows={3} />}

        {!isLoadingSummary && !hasData && (
          <div className="mt-6 flex h-[50vh] w-full items-center justify-center">
            <NoDataCard />
          </div>
        )}

        <InfiniteScroll
          dataLength={monthlySummary.length}
          next={loadMoreMonths}
          hasMore={hasMoreMonths}
          loader={
            isFetchingMoreMonths ? <ViniMonthlySkeleton rows={1} /> : null
          }
          scrollableTarget="vini-monthly-scroll-container"
          scrollThreshold="0.9"
          className="w-full"
        >
          {monthlySummary.map((month) => {
            const isExpanded = expandedMonthKey === month.id;
            const agents = agentTypesByMonth[month.id] ?? [];
            const monthTitle = month.monthLabel;

            return (
              <div
                key={month.id}
                className="mb-3 rounded-xl border border-black/10 bg-white px-4 py-3 shadow-[0px_1px_4px_0px_#0000000A]"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-black/80">
                      {monthTitle}
                    </h2>
                    <p className="mt-1 text-xs font-normal text-black/60">
                      {formatDate(month.startDate)} -{' '}
                      {formatDate(month.endDate)}
                    </p>
                  </div>
                  <div className="text-right text-xs text-black/60">
                    <p className="text-base font-semibold text-black/80">
                      {month.totalCalls.toLocaleString()}
                      <span className="text-sm font-normal text-black/60">
                        /{month.includedCalls.toLocaleString()}
                      </span>
                    </p>
                    <p className="mt-1 text-xs font-normal text-black/60">
                      Total Calls
                    </p>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 w-full border-t border-black/10">
                    {isLoadingAgents && agents.length === 0 ? (
                      <ViniAgentsSkeleton cards={4} />
                    ) : agents.length === 0 ? (
                      <p className="my-3 text-xs text-black/60">
                        No agent usage data available for this month.
                      </p>
                    ) : (
                      <div className="my-3 grid w-full grid-cols-1 gap-3 md:grid-cols-2">
                        {agents.map((agent) => {
                          const usageLabel = `${agent.callsMade.toLocaleString()} Calls made / ${agent.includedCalls.toLocaleString()} included`;
                          const isOver = !!agent.isOverUsage;
                          let usagePercent = 0;
                          if (agent.includedCalls > 0) {
                            usagePercent = Math.min(
                              100,
                              (agent.callsMade / agent.includedCalls) * 100
                            );
                          }
                          const barColor = isOver
                            ? 'bg-red-400'
                            : 'bg-green-500';

                          return (
                            <ConverseDataCard
                              key={agent.id}
                              agent={agent}
                              isOver={isOver}
                              usageLabel={usageLabel}
                              barColor={barColor}
                              usagePercent={usagePercent}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleToggleMonth(month)}
                  className="flex w-full items-center justify-end gap-2 border-t border-black/5 pt-3 text-sm font-normal text-[#1490DF]"
                >
                  <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                  <span>
                    <SvgIcon
                      iconName="rightCaret"
                      className={`h-3 w-3 transition-transform duration-300 ease-in-out ${
                        isExpanded ? 'rotate-[270deg]' : 'rotate-90'
                      } fill-[#1490DF]`}
                    />
                  </span>
                </button>
              </div>
            );
          })}
        </InfiniteScroll>
      </div>
    </div>
  );
}
