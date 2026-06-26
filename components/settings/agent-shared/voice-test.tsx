'use client';

import { useEffect, useState } from 'react';
import { Check, AlertTriangle, PhoneCall } from 'lucide-react';
import { api } from '@/services/settings';
import type { VoiceTestResult } from '@/services/settings/types';
import { useSubStep } from '@/components/settings/shell/step-scaffold';
import { SubStepHeader } from '@/components/settings/shell/sub-step-header';
import { DsButton } from '@/components/settings/ds';
import { cn } from '@/lib/settings/cn';

export function VoiceTest({ subStepId, segment, agentName = 'Mike' }: { subStepId: string; segment: string; agentName?: string }) {
  const [result, setResult] = useState<VoiceTestResult | null>(null);
  const [running, setRunning] = useState(false);
  useSubStep(subStepId, true);

  useEffect(() => {
    api.voiceTest.get(segment).then(setResult);
  }, [segment]);

  const run = async () => {
    setRunning(true);
    setResult(await api.voiceTest.run(segment));
    setRunning(false);
  };

  return (
    <div>
      <SubStepHeader
        title="Automated Voice Testing"
        description={`We'll run 10 scripted calls to verify ${agentName} is ready before going live.`}
      />
      {!result && (
        <DsButton
          label={running ? 'Running 10 scripted calls…' : 'Start Auto-Test'}
          icon={<PhoneCall className="h-4 w-4" />}
          onClick={run}
          isLoading={running}
        />
      )}

      {result && (
        <>
          <div className="overflow-hidden rounded-xl border border-black/10">
            {result.checks.map((c, i) => (
              <div
                key={i}
                className={cn('flex items-start gap-3 p-4', i > 0 && 'border-t border-black/5')}
              >
                <span
                  className={cn(
                    'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                    c.status === 'pass' ? 'bg-green-lighter text-green-darker' : 'bg-unpaidMarkerBg text-unpaidMarkerText'
                  )}
                >
                  {c.status === 'pass' ? <Check className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                </span>
                <div>
                  <div className="text-sm font-medium text-black-dark">{c.label}</div>
                  <div className="text-xs text-black-60">{c.detail}</div>
                </div>
                <span
                  className={cn(
                    'ml-auto text-xs font-medium',
                    c.status === 'pass' ? 'text-green-darker' : 'text-unpaidMarkerText'
                  )}
                >
                  {c.status === 'pass' ? 'Passed' : 'Needs review'}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <DsButton label="Re-run Test" type="bordered" onClick={run} isLoading={running} />
            <span className="text-sm text-black-60">
              {result.ready ? 'Agent ready to deploy.' : 'Resolve the items above before deploying.'}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
