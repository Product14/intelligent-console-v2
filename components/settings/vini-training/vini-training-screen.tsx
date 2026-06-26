'use client';

import { useViniTraining } from '@/hooks/settings/use-vini-training';
import { currentWindow } from '@/lib/settings/vini-training-windows';
import { DashboardHeader } from './dashboard-header';
import { TrainingModeHeader } from './training-mode-header';
import { SourcesCoveredCard } from './sources-covered-card';
import { LeadCoverageCard } from './lead-coverage-card';
import { ResponseTimeCard } from './response-time-card';
import { InboundSection } from './inbound-section';
import { OutboundSection } from './outbound-section';
import { WindowComparisonStrip } from './window-comparison-strip';
import { ViniTrainingSkeleton } from './vini-training-skeleton';

export function ViniTrainingScreen() {
  const { data, today, loading } = useViniTraining();

  if (loading || !data) {
    return <ViniTrainingSkeleton />;
  }

  const activeKey = currentWindow(data.trainingStartAt, today);
  const activeWindow = activeKey
    ? data.windows.find((w) => w.key === activeKey)
    : null;
  const windowLabel = activeWindow?.dateRange ?? null;

  return (
    <div className="pb-16">
      <DashboardHeader />
      <TrainingModeHeader
        trainingStartAt={data.trainingStartAt}
        today={today}
      />

      {/* Top-line cards — three KPIs combining inbound + outbound. */}
      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <SourcesCoveredCard sources={data.sources} />
        <LeadCoverageCard metrics={data.topLine} windowLabel={windowLabel} />
        <ResponseTimeCard metrics={data.topLine} />
      </div>

      {/* Inbound + Outbound sections. */}
      <div className="mt-8 space-y-8">
        <InboundSection
          inbound={data.inbound}
          sources={data.sources}
          topLine={data.topLine}
        />
        <OutboundSection
          outbound={data.outbound}
          sources={data.sources}
          topLine={data.topLine}
        />
      </div>

      {/* Time-window comparison strip. */}
      <div className="mt-8">
        <WindowComparisonStrip windows={data.windows} />
      </div>
    </div>
  );
}
