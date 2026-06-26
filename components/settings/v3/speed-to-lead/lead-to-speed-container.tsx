import React from 'react';

import {
  SpeedToLeadDataPayload,
  SpeedToLeadSourceConfig,
} from './speed-to-lead-responses';
import SpeedToLeadSection from './speed-to-lead-section';

interface LeadToSpeedContainerProps {
  payload: SpeedToLeadDataPayload;
  leadTypeOptions: string[];
  updateLeadType: (key: string, config: SpeedToLeadSourceConfig) => void;
  addLeadType: (key: string) => void;
  removeLeadType: (key: string) => void;
  speedToLeadEnabled: boolean;
  modeValidationErrors?: Record<string, string>;
}

export default function LeadToSpeedContainer({
  payload,
  leadTypeOptions,
  updateLeadType,
  addLeadType,
  removeLeadType,
  speedToLeadEnabled,
  modeValidationErrors,
}: LeadToSpeedContainerProps) {
  return (
    <div
      className={`w-full gap-x-4 overflow-hidden px-2 pb-2 ${speedToLeadEnabled ? '' : 'pointer-events-none opacity-75 blur-sm'}`}
    >
      <h3 className="col-span-2 mb-1 text-lg font-semibold leading-6 text-black/80">
        Automated Response Settings
      </h3>
      <p className="col-span-2 mb-3 text-sm font-normal text-black/60">
        Choose which incoming leads receive automated, immediate responses.
      </p>
      <SpeedToLeadSection
        type="leadType"
        title="Type"
        entries={payload.speedToLeadByLeadType}
        options={leadTypeOptions}
        modeValidationErrors={modeValidationErrors}
        onUpdate={updateLeadType}
        onAdd={addLeadType}
        onRemove={removeLeadType}
      />
      {/* Lead source section is intentionally disabled. */}
      {/* <SpeedToLeadSection
        type="source"
        title="Source"
        entries={payload.speedToLeadBySource}
        options={sourceOptions}
        modeValidationErrors={modeValidationErrors}
        onUpdate={updateSource}
        onAdd={addSource}
        onRemove={removeSource}
        disabled={!hasLeadFilterData}
      /> */}
    </div>
  );
}
