'use client';

import { useState } from 'react';
import { AskForMobileCard } from '@/components/settings/vini-general/ask-for-mobile-card';
import { useViniGeneralConfig } from '@/hooks/settings/use-vini-general-config';
import { DsButton } from '@/components/settings/ds';

/**
 * Vini AI → General. Rooftop-wide voice-agent behavior that isn't specific to
 * one agent. Currently hosts one card (Ask for caller's mobile number); more
 * sections can be added as they're scoped.
 */
export default function ViniGeneralPage() {
  const [saveSignal, setSaveSignal] = useState(0);
  const [savingState, setSavingState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const { config, loading, patch } = useViniGeneralConfig(saveSignal);

  const handleSave = async () => {
    setSavingState('saving');
    setSaveSignal((s) => s + 1);
    setTimeout(() => setSavingState('saved'), 600);
    setTimeout(() => setSavingState('idle'), 2400);
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-black-dark">General</h1>
        <p className="mt-1 text-sm text-black-60">
          Rooftop-wide Vini AI behavior that applies across every agent.
        </p>
      </header>

      {loading ? (
        <div className="h-[120px] animate-pulse rounded-2xl border border-black/10 bg-black/[0.02]" />
      ) : (
        <div className="space-y-3">
          <AskForMobileCard
            value={config.askForMobile}
            onChange={(askForMobile) => patch((c) => ({ ...c, askForMobile }))}
          />
        </div>
      )}

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
