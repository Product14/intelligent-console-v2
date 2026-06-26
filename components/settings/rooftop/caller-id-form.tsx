'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/services/settings';
import type { AuthorizedRep, CallerIdConfig } from '@/services/settings/types';
import { useSubStep } from '@/components/settings/shell/step-scaffold';
import { SubStepHeader } from '@/components/settings/shell/sub-step-header';
import { Input, DsButton } from '@/components/settings/ds';

export function CallerIdForm({ subStepId }: { subStepId: string }) {
  const [cfg, setCfg] = useState<CallerIdConfig | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const isValid = !!cfg && cfg.legalBusinessName.trim().length > 0;
  const { reportSaving, reportSaved } = useSubStep(subStepId, isValid);

  useEffect(() => {
    api.callerId.get().then(setCfg);
  }, []);

  const update = (patch: Partial<CallerIdConfig>) => {
    setCfg((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      reportSaving();
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => api.callerId.save(next).then(reportSaved), 1000);
      return next;
    });
  };

  const updateRep = (i: number, patch: Partial<AuthorizedRep>) => {
    if (!cfg) return;
    update({ authorizedReps: cfg.authorizedReps.map((r, idx) => (idx === i ? { ...r, ...patch } : r)) });
  };

  if (!cfg) return <div className="py-12 text-sm text-black-40">Loading…</div>;

  return (
    <div>
      <SubStepHeader
        title="Caller ID (CNAM) Registration"
        description="Verify your business identity so your number displays correctly on outbound calls."
      />
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
        <Input label="Legal Business Name" required value={cfg.legalBusinessName} onChange={(v) => update({ legalBusinessName: v })} />
        <Input label="EIN" value={cfg.ein} onChange={(v) => update({ ein: v })} />
        <Input label="Business Classification" value={cfg.businessClassification} onChange={(v) => update({ businessClassification: v })} />
        <Input label="Area Code" value={cfg.areaCode} onChange={(v) => update({ areaCode: v })} />
      </div>

      <div className="mt-7">
        <div className="mb-1 text-sm font-medium text-black-80">Authorized Representatives</div>
        <p className="mb-3 text-xs text-black-40">Add up to 2 authorized representatives for this business.</p>
        <div className="space-y-4">
          {cfg.authorizedReps.map((rep, i) => (
            <div key={i} className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-3">
              <Input label="Name" value={rep.name} onChange={(v) => updateRep(i, { name: v })} />
              <Input label="Email" value={rep.email} onChange={(v) => updateRep(i, { email: v })} />
              <Input label="Phone" value={rep.phone} onChange={(v) => updateRep(i, { phone: v })} />
            </div>
          ))}
        </div>
        {cfg.authorizedReps.length < 2 && (
          <div className="mt-3">
            <DsButton
              label="+ Add Representative"
              type="bordered"
              size="AA"
              onClick={() => update({ authorizedReps: [...cfg.authorizedReps, { name: '', email: '', phone: '' }] })}
            />
          </div>
        )}
      </div>
    </div>
  );
}
