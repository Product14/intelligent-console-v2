'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { api } from '@/services/settings';
import type { PlanInfo } from '@/services/settings/types';
import { useSubStep } from '@/components/settings/shell/step-scaffold';
import { SubStepHeader } from '@/components/settings/shell/sub-step-header';

export function PlanSummary({ subStepId }: { subStepId: string }) {
  const [plan, setPlan] = useState<PlanInfo | null>(null);
  useSubStep(subStepId, true);

  useEffect(() => {
    api.plan.get().then(setPlan);
  }, []);

  if (!plan) return <div className="py-12 text-sm text-black-40">Loading…</div>;

  return (
    <div>
      <SubStepHeader title="Your Plan" description="Here's what's included in your Vini contract." />
      <div className="rounded-xl border border-blue-1 bg-blue-2 p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-black-40">Contract</div>
            <div className="text-lg font-semibold text-black-dark">{plan.planName}</div>
            <div className="text-sm text-black-60">#{plan.contractId}</div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <div className="mb-2 text-sm font-medium text-black-80">Agents</div>
            <ul className="space-y-1.5">
              {plan.agents.map((a) => (
                <li key={a} className="flex items-center gap-2 text-sm text-black-60">
                  <Check className="h-4 w-4 text-green" /> {a}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="mb-2 text-sm font-medium text-black-80">Add-ons</div>
            <ul className="space-y-1.5">
              {plan.addOns.map((a) => (
                <li key={a} className="flex items-center gap-2 text-sm text-black-60">
                  <Check className="h-4 w-4 text-green" /> {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
