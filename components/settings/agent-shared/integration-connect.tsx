'use client';

import { useEffect, useState } from 'react';
import { Check, RefreshCw } from 'lucide-react';
import { api } from '@/services/settings';
import type { IntegrationPartner } from '@/services/settings/types';
import { useSubStep } from '@/components/settings/shell/step-scaffold';
import { SubStepHeader } from '@/components/settings/shell/sub-step-header';
import { Input, DsButton } from '@/components/settings/ds';
import { cn } from '@/lib/settings/cn';

export function IntegrationConnect({
  subStepId,
  segment,
  kind,
}: {
  subStepId: string;
  segment: string;
  kind: 'ims' | 'crm';
}) {
  const [partners, setPartners] = useState<IntegrationPartner[]>([]);
  const [provider, setProvider] = useState('');
  const [dealerId, setDealerId] = useState('');
  const [status, setStatus] = useState<'not_connected' | 'connected'>('not_connected');
  const [syncing, setSyncing] = useState(false);
  useSubStep(subStepId, status === 'connected' || !!provider);

  const isIms = kind === 'ims';
  const title = isIms ? 'Connect your Inventory (IMS)' : 'Connect the CRM you use';
  const desc = isIms
    ? 'Choose your inventory management system so Vini can talk about live inventory.'
    : 'Connect your CRM so every lead Vini captures lands in your pipeline.';

  useEffect(() => {
    api.integrations.listPartners(kind).then(setPartners);
    if (isIms) {
      api.integrations.getIms(segment).then((c) => {
        setProvider(c.provider);
        setDealerId(c.dealerId);
        setStatus(c.status);
      });
    } else {
      api.integrations.getCrm(segment).then((c) => {
        setProvider(c.provider);
        setStatus(c.status);
      });
    }
  }, [segment, kind, isIms]);

  const sync = async () => {
    setSyncing(true);
    if (isIms) {
      await api.integrations.saveIms(segment, { provider, dealerId, status: 'not_connected' });
      const r = await api.integrations.syncIms(segment);
      setStatus(r.status);
    } else {
      await api.integrations.saveCrm(segment, { provider, status: 'not_connected' });
      const r = await api.integrations.syncCrm(segment);
      setStatus(r.status);
    }
    setSyncing(false);
  };

  return (
    <div>
      <SubStepHeader title={title} description={desc} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {partners.map((p) => {
          const on = provider === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setProvider(p.id);
                setStatus('not_connected');
              }}
              className={cn(
                'flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors',
                on ? 'border-blue-light bg-blue-2 text-blue-light' : 'border-black/10 text-black-80 hover:border-blue-1'
              )}
            >
              {p.name}
              {on && <Check className="h-4 w-4" />}
            </button>
          );
        })}
      </div>

      {provider && (
        <div className="mt-6 rounded-xl border border-black/10 p-5">
          {isIms && (
            <div className="mb-4 max-w-sm">
              <Input label="Dealer ID" value={dealerId} onChange={setDealerId} />
            </div>
          )}
          <div className="flex items-center gap-4">
            <DsButton
              label={status === 'connected' ? 'Re-sync' : isIms ? 'Sync IMS' : 'Sync CRM'}
              type={status === 'connected' ? 'bordered' : 'primary'}
              icon={<RefreshCw className={cn('h-4 w-4', syncing && 'animate-spin')} />}
              onClick={sync}
              isLoading={syncing}
            />
            {status === 'connected' && (
              <span className="flex items-center gap-1.5 text-sm text-green-darker">
                <Check className="h-4 w-4" /> Connected
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
