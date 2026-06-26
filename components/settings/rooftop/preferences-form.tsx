'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/services/settings';
import type { Preferences } from '@/services/settings/types';
import { useSubStep } from '@/components/settings/shell/step-scaffold';
import { SubStepHeader } from '@/components/settings/shell/sub-step-header';
import { DsToggle } from '@/components/settings/ds';

function ToggleRow({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (c: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <span className="text-sm text-black-80">{label}</span>
      <DsToggle id={id} toggle={checked} toggleHandler={(e) => onChange(e.target.checked)} />
    </div>
  );
}

export function PreferencesForm({ subStepId }: { subStepId: string }) {
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const { reportSaving, reportSaved } = useSubStep(subStepId, true);

  useEffect(() => {
    api.preferences.get().then(setPrefs);
  }, []);

  const update = (patch: Partial<Preferences>) => {
    setPrefs((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      reportSaving();
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => api.preferences.save(next).then(reportSaved), 800);
      return next;
    });
  };

  if (!prefs) return <div className="py-12 text-sm text-black-40">Loading…</div>;

  return (
    <div>
      <SubStepHeader title="Communication Preferences" description="Choose how and when your team hears from Vini." />
      <div className="space-y-6">
        <div className="rounded-2xl border border-black/10 p-5">
          <div className="mb-3 text-sm font-semibold text-black-dark">Email Preferences</div>
          <div className="divide-y divide-black/5">
            <ToggleRow id="p-daily" label="Receive daily summary emails" checked={prefs.emailDailySummary} onChange={(c) => update({ emailDailySummary: c })} />
            <ToggleRow id="p-postcall" label="Receive emails after calls" checked={prefs.emailPostCall} onChange={(c) => update({ emailPostCall: c })} />
            <ToggleRow id="p-campaign" label="Receive campaign related emails" checked={prefs.emailCampaigns} onChange={(c) => update({ emailCampaigns: c })} />
          </div>
        </div>
        <div className="rounded-2xl border border-black/10 p-5">
          <div className="mb-3 text-sm font-semibold text-black-dark">SMS Preferences</div>
          <ToggleRow id="p-sms" label="Receive SMS after calls" checked={prefs.smsPostCall} onChange={(c) => update({ smsPostCall: c })} />
        </div>
      </div>
    </div>
  );
}
