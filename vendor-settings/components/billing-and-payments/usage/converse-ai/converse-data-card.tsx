import React from 'react';

import SvgIcon from '@spyne-console/design-system/svg';

import { ViniAgentUsageSummary } from '../utils';

type ConverseDataCardProps = {
  readonly agent: ViniAgentUsageSummary;
  readonly isOver: boolean;
  readonly usageLabel: string;
  readonly barColor: string;
  readonly usagePercent: number;
};
export default function ConverseDataCard({
  agent,
  isOver,
  usageLabel,
  barColor,
  usagePercent,
}: ConverseDataCardProps) {
  return (
    <div
      key={agent.id}
      className="w-full rounded-xl border border-black/10 bg-white p-4"
    >
      <div className="mb-1 flex items-center justify-between">
        <h4 className="text-sm font-medium text-black/80">{agent.name}</h4>
        {isOver && (
          <span className="bg-orange-red/15 text-orange-red border-orange-red/20 flex items-center gap-1 rounded-full border p-0.5 text-xs font-medium tracking-wide">
            <SvgIcon
              iconName="exclamation"
              className="fill-orange-red h-4 w-4"
            />{' '}
            Overusage
          </span>
        )}
      </div>

      <p className="my-2 text-sm font-normal tracking-wide text-black/60">
        {usageLabel}
      </p>
      <div className="w-full rounded-full bg-black/5">
        <div
          className={`${barColor} h-1.5 rounded-full transition-all`}
          style={{ width: `${usagePercent}%` }}
        />
      </div>
    </div>
  );
}
