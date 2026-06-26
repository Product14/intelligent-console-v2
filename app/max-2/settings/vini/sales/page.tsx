'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SpeedToLeadForm } from '@/components/settings/agent-shared/speed-to-lead';
import { SubTabs } from '@/components/settings/ui/sub-tabs';
// AGENTS_TAB (disabled): the Agents sub-tab is parked until backend APIs for
// managing inbound/outbound sales agents land. Re-enable by uncommenting the
// import + the tab entry below.
// import { AgentsTab } from '@/components/settings/agents/agents-tab';
import { PoliciesTab } from '@/components/settings/agents/policies/policies-tab';
import { DsButton } from '@/components/settings/ds';

const INBOUND_SEGMENT = 'inboundSales';

/**
 * Vini AI → Sales. (AGENTS_TAB disabled — pending APIs.) The remaining tabs
 * are Reachout & Follow-ups and Policies; both flush their save effects on
 * the page-level Save button.
 */
export default function SalesAgentPage() {
  const params = useSearchParams();
  // AGENTS_TAB (disabled): the `?agent=…` deep-link opened the AgentEdit
  // overlay. With Agents hidden, ignore the param. Re-enable when the tab
  // returns.
  // const editing = !!params.get('agent');
  void params;

  const [saveSignal, setSaveSignal] = useState(0);
  const [savingState, setSavingState] = useState<'idle' | 'saving' | 'saved'>('idle');
  // Tracks the Reachout & Follow-ups form's live validity. Defaults to true
  // — the child reports false when Instant Reachout is on with zero lead
  // types selected. Save button is gated on this.
  const [formIsValid, setFormIsValid] = useState(true);

  const handleSave = async () => {
    if (!formIsValid) return;
    setSavingState('saving');
    setSaveSignal((s) => s + 1);
    // Sections fire their save effects on the signal change. We optimistically
    // flip to "Saved" after a short tick — section saves are fire-and-forget.
    setTimeout(() => setSavingState('saved'), 600);
    setTimeout(() => setSavingState('idle'), 2400);
  };

  // AGENTS_TAB (disabled): the edit-overlay branch is parked. Restore when
  // the Agents tab is re-enabled above.
  // if (editing) {
  //   return (
  //     <div>
  //       <header className="mb-6 flex items-start justify-between gap-4">
  //         <div>
  //           <h1 className="text-2xl font-semibold text-black-dark">Sales</h1>
  //         </div>
  //         <SaveControls savingState={savingState} onSave={handleSave} />
  //       </header>
  //       <AgentsTab agentType="sales" saveSignal={saveSignal} />
  //     </div>
  //   );
  // }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-black-dark">Sales</h1>
        <p className="mt-1 text-sm text-black-60">
          Reach-out cadence and per-rooftop policies for the inbound sales agent.
        </p>
      </header>

      <SubTabs
        tabs={[
          // AGENTS_TAB (disabled): parked until the manage-agents API ships.
          // {
          //   id: 'agents',
          //   label: 'Agents',
          //   render: () => <AgentsTab agentType="sales" saveSignal={saveSignal} />,
          // },
          {
            id: 'speed-to-lead',
            label: 'Reachout & Follow-ups',
            render: () => (
              <SpeedToLeadForm
                subStepId="sales:speed-to-lead"
                segment={INBOUND_SEGMENT}
                saveSignal={saveSignal}
                onValidityChange={setFormIsValid}
              />
            ),
          },
          {
            id: 'policies',
            label: 'Policies',
            render: () => <PoliciesTab saveSignal={saveSignal} />,
          },
        ]}
      />

      <SaveBar savingState={savingState} onSave={handleSave} disabled={!formIsValid} />
    </div>
  );
}

function SaveBar({
  savingState,
  onSave,
  disabled,
}: {
  savingState: 'idle' | 'saving' | 'saved';
  onSave: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="mt-8 flex items-center justify-end gap-3 border-t border-black/8 pt-5">
      <span className="text-xs">
        {savingState === 'saving' && <span className="text-black-60">Saving…</span>}
        {savingState === 'saved' && (
          <span className="font-medium text-emerald-600">Saved ✓</span>
        )}
      </span>
      <DsButton
        label="Save changes"
        type="primary"
        size="AA"
        onClick={onSave}
        isLoading={savingState === 'saving'}
        disabled={disabled}
      />
    </div>
  );
}
