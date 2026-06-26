'use client';

import { Rocket, Check } from 'lucide-react';
import { useSubStep } from '@/components/settings/shell/step-scaffold';
import { SubStepHeader } from '@/components/settings/shell/sub-step-header';

export function Deploy({ subStepId, agentLabel }: { subStepId: string; agentLabel: string }) {
  useSubStep(subStepId, true);
  const items = [
    'Persona, voice & first message configured',
    'Inventory and CRM connected',
    'Phone number assigned',
    'Automated voice test passed',
  ];
  return (
    <div>
      <SubStepHeader
        title="Agent Ready to Deploy"
        description={`Review the checklist and deploy your ${agentLabel}.`}
      />
      <div className="rounded-xl border border-blue-1 bg-blue-2 p-5">
        <div className="flex items-center gap-2 text-blue-light">
          <Rocket className="h-5 w-5" />
          <span className="text-sm font-semibold">{agentLabel}</span>
        </div>
        <ul className="mt-4 space-y-2">
          {items.map((i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-black-60">
              <Check className="h-4 w-4 text-green" /> {i}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-black-40">
          Click “Deploy &amp; Continue” below to take this agent live.
        </p>
      </div>
    </div>
  );
}
