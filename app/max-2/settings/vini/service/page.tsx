'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SubTabs } from '@/components/settings/ui/sub-tabs';
// AGENTS_TAB (disabled): parked until backend APIs for managing the inbound
// service agent are wired. Restore both the import and the tab entry below.
// import { AgentsTab } from '@/components/settings/agents/agents-tab';
import { ServicePoliciesTab } from '@/components/settings/agents/service-policies/service-policies-tab';
import { DsButton } from '@/components/settings/ds';

/**
 * Vini AI → Service. (AGENTS_TAB disabled — pending APIs.) The Policies tab
 * hosts the service-side dealership facts (after-hours drop-off, service
 * capabilities) the agent reads on every call.
 */
export default function ServiceAgentPage() {
  const params = useSearchParams();
  // AGENTS_TAB (disabled): the `?agent=…` deep-link opened the AgentEdit
  // overlay. With Agents hidden, ignore the param.
  // const editing = !!params.get('agent');
  void params;

  const [saveSignal, setSaveSignal] = useState(0);
  const [savingState, setSavingState] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSave = async () => {
    setSavingState('saving');
    setSaveSignal((s) => s + 1);
    setTimeout(() => setSavingState('saved'), 600);
    setTimeout(() => setSavingState('idle'), 2400);
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-black-dark">Service</h1>
        <p className="mt-1 text-sm text-black-60">
          Per-rooftop policies the inbound service agent reads on every call.
        </p>
      </header>

      <SubTabs
        tabs={[
          // AGENTS_TAB (disabled): parked until the manage-agents API ships.
          // {
          //   id: 'agents',
          //   label: 'Agents',
          //   render: () => <AgentsTab agentType="service" saveSignal={saveSignal} />,
          // },
          {
            id: 'policies',
            label: 'Policies',
            render: () => <ServicePoliciesTab saveSignal={saveSignal} />,
          },
        ]}
      />

      <SaveBar savingState={savingState} onSave={handleSave} />
    </div>
  );
}

function SaveBar({
  savingState,
  onSave,
}: {
  savingState: 'idle' | 'saving' | 'saved';
  onSave: () => void;
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
      />
    </div>
  );
}
