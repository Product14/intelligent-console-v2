'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SubTabs } from '@/components/settings/ui/sub-tabs';
import { AgentsTab } from '@/components/settings/agents/agents-tab';
import { ReceptionKnowledge } from '@/components/settings/reception-knowledge/reception-knowledge';
import { DsButton } from '@/components/settings/ds';

/**
 * Vini AI → Reception. Inbound-only agent + a Knowledge Base sub-tab that
 * powers what the agent says on every call.
 *
 * The Save button only ticks `saveSignal` (Agents sub-tab consumes it). The
 * Knowledge Base is local-state only — its edits don't persist across refresh.
 */
export default function ReceptionAgentPage() {
  const params = useSearchParams();
  const editing = !!params.get('agent');

  const [saveSignal, setSaveSignal] = useState(0);
  const [savingState, setSavingState] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSave = async () => {
    setSavingState('saving');
    setSaveSignal((s) => s + 1);
    setTimeout(() => setSavingState('saved'), 600);
    setTimeout(() => setSavingState('idle'), 2400);
  };

  if (editing) {
    return (
      <div>
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-black-dark">Reception</h1>
          </div>
          <SaveControls savingState={savingState} onSave={handleSave} />
        </header>
        <AgentsTab agentType="reception" saveSignal={saveSignal} />
      </div>
    );
  }

  return (
    <div>
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-black-dark">Reception</h1>
          <p className="mt-1 text-sm text-black-60">
            Persona, first message, voice test, and deploy for the inbound
            reception agent. The knowledge base powers what the agent says on
            every call.
          </p>
        </div>
        <SaveControls savingState={savingState} onSave={handleSave} />
      </header>

      <SubTabs
        tabs={[
          {
            id: 'agents',
            label: 'Agents',
            render: () => <AgentsTab agentType="reception" saveSignal={saveSignal} />,
          },
          {
            id: 'knowledge',
            label: 'Knowledge Base',
            render: () => <ReceptionKnowledge />,
          },
        ]}
      />
    </div>
  );
}

function SaveControls({
  savingState,
  onSave,
}: {
  savingState: 'idle' | 'saving' | 'saved';
  onSave: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-3">
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
