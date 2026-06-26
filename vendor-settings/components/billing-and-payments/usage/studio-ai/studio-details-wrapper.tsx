import React from 'react';

import BarGraph from '@spyne-console/design-system/charts/bar-graph';

import { customStyles } from '../config';
import UsageHistoryCard from '../studio-ai/usage-history-card';
import { UsageGraphPoint, UsageHistoryRow, VinUsageSummary } from '../utils';
import VinSummaryCard from './vins-card';

type StudioDetailsWrapperProps = {
  readonly vinSummary: VinUsageSummary;
  readonly graphData: UsageGraphPoint[];
  readonly historyRows: UsageHistoryRow[];
  readonly isLoading: boolean;
};

export default function StudioDetailsWrapper({
  vinSummary,
  graphData,
  historyRows,
  isLoading,
}: StudioDetailsWrapperProps) {
  return (
    <div className="no-scrollbar mt-5 max-h-[66vh] w-full overflow-y-auto">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <VinSummaryCard summary={vinSummary} isLoading={isLoading} />
        <div className="flex-1 rounded-2xl border border-black/10 bg-white px-4 py-4 shadow-sm">
          <div className="mb-3 text-sm font-normal text-black/60">
            VINs Processed (Past 6 months)
          </div>
          <BarGraph
            data={graphData}
            xDataKey="label"
            yDataKey="vins"
            isLoading={isLoading}
            customStyles={customStyles}
            height={210}
            aspect={1.5}
            skeletonClassName="md:h-fit w-full"
            containerClassName="w-full"
            barChartClassName="!h-[115%]"
          />
        </div>
      </div>
      <UsageHistoryCard rows={historyRows} isLoading={isLoading} />
    </div>
  );
}
