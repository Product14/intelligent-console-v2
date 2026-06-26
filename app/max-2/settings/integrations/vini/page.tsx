'use client';

import { useMemo, useState } from 'react';
import { Check, MailQuestion, Pencil, Plug, Plus, Search, X } from 'lucide-react';
import { cn } from '@/lib/settings/cn';
import { Button } from '@/components/settings/ui/button';
import { Checkbox } from '@/components/settings/ui/checkbox';
import { TextField } from '@/components/settings/ui/text-field';
import { Textarea } from '@/components/settings/ui/textarea';

type CapabilityId =
  | 'crm'
  | 'dms'
  | 'ims'
  | 'photo-provider'
  | 'car-history'
  | 'stock-image'
  | 'service-scheduler';

const CAPABILITIES: { id: CapabilityId; label: string }[] = [
  { id: 'crm', label: 'CRM' },
  { id: 'dms', label: 'DMS' },
  { id: 'ims', label: 'IMS' },
  { id: 'photo-provider', label: 'Photo Provider' },
  { id: 'car-history', label: 'Car History' },
  { id: 'stock-image', label: 'Stock Image' },
  { id: 'service-scheduler', label: 'Service Scheduler' },
];

const CAPABILITY_LABEL: Record<CapabilityId, string> = Object.fromEntries(
  CAPABILITIES.map((c) => [c.id, c.label])
) as Record<CapabilityId, string>;

interface Partner {
  id: string;
  name: string;
  description: string;
  capabilities: CapabilityId[];
  logo?: string;
}

const PARTNERS: Partner[] = [
  {
    id: 'cox',
    name: 'Cox Automotive',
    description: 'VinSolutions, vAuto, Xtime, Dealertrack — one auth unlocks multiple capabilities.',
    capabilities: ['crm', 'dms', 'ims', 'service-scheduler'],
    logo: 'https://logo.clearbit.com/coxautoinc.com',
  },
  {
    id: 'tekion',
    name: 'Tekion',
    description: 'ARC DMS + Automotive Partner Cloud apps.',
    capabilities: ['crm', 'dms', 'ims', 'service-scheduler'],
    logo: 'https://logo.clearbit.com/tekion.com',
  },
  {
    id: 'cdk',
    name: 'CDK Global',
    description: 'CDK DMS, Elead CRM, and partner ecosystem.',
    capabilities: ['crm', 'dms', 'ims'],
    logo: 'https://logo.clearbit.com/cdkglobal.com',
  },
  {
    id: 'reynolds',
    name: 'Reynolds & Reynolds',
    description: 'ERA-IGNITE DMS and integrated retail tools.',
    capabilities: ['dms', 'ims', 'service-scheduler'],
    logo: 'https://logo.clearbit.com/reyrey.com',
  },
  {
    id: 'dealersocket',
    name: 'DealerSocket',
    description: 'CRM and IDMS suite for franchise and independent dealers.',
    capabilities: ['crm', 'dms'],
    logo: 'https://logo.clearbit.com/dealersocket.com',
  },
  {
    id: 'elead',
    name: 'Elead CRM',
    description: 'Standalone CRM for sales and BDC teams.',
    capabilities: ['crm'],
    logo: 'https://logo.clearbit.com/eleadcrm.com',
  },
  {
    id: 'xtime',
    name: 'Xtime',
    description: 'Service scheduling and lane management.',
    capabilities: ['service-scheduler'],
    logo: 'https://logo.clearbit.com/xtime.com',
  },
  {
    id: 'carfax',
    name: 'Carfax',
    description: 'VIN-keyed vehicle history reports.',
    capabilities: ['car-history'],
    logo: 'https://logo.clearbit.com/carfax.com',
  },
  {
    id: 'autocheck',
    name: 'AutoCheck',
    description: 'Vehicle history reports by Experian.',
    capabilities: ['car-history'],
    logo: 'https://logo.clearbit.com/autocheck.com',
  },
  {
    id: 'homenet',
    name: 'HomeNet',
    description: 'Inventory management and merchandising.',
    capabilities: ['ims'],
    logo: 'https://logo.clearbit.com/homenetauto.com',
  },
  {
    id: 'helio',
    name: 'Helio',
    description: 'On-lot photography service for new and used inventory.',
    capabilities: ['photo-provider'],
  },
  {
    id: 'spiffy',
    name: 'Spiffy',
    description: 'Mobile photo and reconditioning service.',
    capabilities: ['photo-provider'],
    logo: 'https://logo.clearbit.com/getspiffy.com',
  },
  {
    id: 'evox',
    name: 'EVOX Images',
    description: 'OEM-licensed stock imagery and 360° spins.',
    capabilities: ['stock-image'],
    logo: 'https://logo.clearbit.com/evoximages.com',
  },
  {
    id: 'izmo',
    name: 'IZMO Cars',
    description: 'Vehicle stock photography and interactive media.',
    capabilities: ['stock-image'],
    logo: 'https://logo.clearbit.com/izmocars.com',
  },
  {
    id: 'chromedata',
    name: 'ChromeData',
    description: 'Stock images and vehicle descriptions database.',
    capabilities: ['stock-image'],
    logo: 'https://logo.clearbit.com/chromedata.com',
  },
];

interface ActiveIntegration {
  partnerId: string;
  dealerId: string;
  /** Capabilities the dealer actually wants enabled on this partner. */
  enabledCapabilities: CapabilityId[];
  /** ISO timestamp of last save. */
  connectedAt: string;
}

type PickerStep =
  | { kind: 'closed' }
  | { kind: 'list' }
  | {
      kind: 'configure';
      partner: Partner;
      existingDealerId?: string;
      existingCapabilities?: CapabilityId[];
    }
  | { kind: 'request' };

export default function IntegrationsViniPage() {
  const [active, setActive] = useState<ActiveIntegration[]>([]);
  const [picker, setPicker] = useState<PickerStep>({ kind: 'closed' });

  const openList = () => setPicker({ kind: 'list' });
  const openRequest = () => setPicker({ kind: 'request' });
  const close = () => setPicker({ kind: 'closed' });

  function handleSave(
    partnerId: string,
    dealerId: string,
    enabledCapabilities: CapabilityId[]
  ) {
    setActive((prev) => {
      const without = prev.filter((a) => a.partnerId !== partnerId);
      return [
        ...without,
        {
          partnerId,
          dealerId,
          enabledCapabilities,
          connectedAt: new Date().toISOString(),
        },
      ];
    });
    setPicker({ kind: 'list' });
  }

  function handleEdit(partnerId: string) {
    const partner = PARTNERS.find((p) => p.id === partnerId);
    if (!partner) return;
    const existing = active.find((a) => a.partnerId === partnerId);
    setPicker({
      kind: 'configure',
      partner,
      existingDealerId: existing?.dealerId,
      existingCapabilities: existing?.enabledCapabilities,
    });
  }

  return (
    <div>
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-black-dark">Integrations</h1>
          <p className="mt-1 text-sm text-black-60">
            Connect CRM, DMS, inventory, vehicle history, and service-scheduler
            partners. Vini reads and writes through these systems on calls.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" onClick={openRequest}>
            <MailQuestion className="h-4 w-4" />
            Request New Integration
          </Button>
          {active.length > 0 && (
            <Button onClick={openList}>
              <Plus className="h-4 w-4" />
              Add Integration Partner
            </Button>
          )}
        </div>
      </header>

      {active.length === 0 ? (
        <EmptyState onAdd={openList} onRequest={openRequest} />
      ) : (
        <ActiveList active={active} onEdit={handleEdit} />
      )}

      {picker.kind === 'list' && (
        <PartnerPickerModal
          activePartnerIds={new Set(active.map((a) => a.partnerId))}
          onClose={close}
          onConfigure={(partner) => setPicker({ kind: 'configure', partner })}
          onRequest={openRequest}
        />
      )}

      {picker.kind === 'configure' && (
        <ConfigureModal
          partner={picker.partner}
          existingDealerId={picker.existingDealerId}
          existingCapabilities={picker.existingCapabilities}
          onBack={() => setPicker({ kind: 'list' })}
          onClose={close}
          onSave={handleSave}
        />
      )}

      {picker.kind === 'request' && (
        <RequestIntegrationModal onClose={close} />
      )}
    </div>
  );
}

function EmptyState({
  onAdd,
  onRequest,
}: {
  onAdd: () => void;
  onRequest: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-black/15 bg-gray-lighter/40 px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-2 text-blue-light">
        <Plug className="h-5 w-5" />
      </div>
      <h2 className="text-base font-semibold text-black-dark">
        No integrations yet
      </h2>
      <p className="mt-1 max-w-md text-sm text-black-60">
        Connect a partner to unlock CRM sync, live inventory, vehicle history,
        and service scheduling for this rooftop.
      </p>
      <div className="mt-5 flex items-center gap-2">
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4" />
          Add Integration Partner
        </Button>
        <Button variant="secondary" onClick={onRequest}>
          <MailQuestion className="h-4 w-4" />
          Request New Integration
        </Button>
      </div>
    </div>
  );
}

function ActiveList({
  active,
  onEdit,
}: {
  active: ActiveIntegration[];
  onEdit: (partnerId: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [activeCap, setActiveCap] = useState<CapabilityId | 'all'>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return active.filter((a) => {
      const partner = PARTNERS.find((p) => p.id === a.partnerId);
      if (!partner) return false;
      const matchesCap =
        activeCap === 'all' || a.enabledCapabilities.includes(activeCap);
      const matchesQuery =
        !q ||
        partner.name.toLowerCase().includes(q) ||
        partner.description.toLowerCase().includes(q);
      return matchesCap && matchesQuery;
    });
  }, [active, query, activeCap]);

  return (
    <div>
      <div className="mb-4 rounded-lg border border-black/8 bg-white px-4 py-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black-40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search connected partners"
            className="h-10 w-full rounded-lg border border-blue-1 bg-white pl-9 pr-3 text-sm text-black-87 outline-none placeholder:text-black-40 focus:border-blue-light focus:ring-2 focus:ring-blue-12"
          />
        </div>
        <div role="tablist" className="mt-3 flex flex-wrap gap-1.5">
          <FilterTab
            label="All"
            selected={activeCap === 'all'}
            onClick={() => setActiveCap('all')}
          />
          {CAPABILITIES.map((c) => (
            <FilterTab
              key={c.id}
              label={c.label}
              selected={activeCap === c.id}
              onClick={() => setActiveCap(c.id)}
            />
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-black/15 bg-gray-lighter/40 py-10 text-center text-sm text-black-60">
          No connected partners match your search.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((a) => {
            const partner = PARTNERS.find((p) => p.id === a.partnerId);
            if (!partner) return null;
            return (
              <li
                key={a.partnerId}
                className="flex items-start justify-between gap-4 rounded-lg border border-black/10 bg-white px-5 py-4"
              >
                <div className="flex min-w-0 flex-1 gap-4">
                  <PartnerAvatar partner={partner} size={44} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-black-dark">
                        {partner.name}
                      </h3>
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-lighter px-2 py-0.5 text-[11px] font-medium text-green-darker">
                        <Check className="h-3 w-3" />
                        Active
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-black-60">{partner.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {partner.capabilities.map((c) => (
                        <CapabilityChip
                          key={c}
                          id={c}
                          enabled={a.enabledCapabilities.includes(c)}
                        />
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-black-40">
                      Dealer ID: <span className="font-medium text-black-60">{a.dealerId}</span>
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onEdit(a.partnerId)}
                  className="shrink-0"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function CapabilityChip({
  id,
  enabled = true,
}: {
  id: CapabilityId;
  enabled?: boolean;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
        enabled
          ? 'bg-blue-2 text-blue-light'
          : 'bg-gray-8 text-black-40 line-through'
      )}
    >
      {CAPABILITY_LABEL[id]}
    </span>
  );
}

function PartnerAvatar({
  partner,
  size = 40,
}: {
  partner: Partner;
  size?: number;
}) {
  const [errored, setErrored] = useState(false);
  const showImage = partner.logo && !errored;
  return (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-black/8 bg-white"
      style={{ width: size, height: size }}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={partner.logo}
          alt={`${partner.name} logo`}
          width={size}
          height={size}
          className="h-full w-full object-contain p-1"
          onError={() => setErrored(true)}
        />
      ) : (
        <span
          className="font-semibold text-black-60"
          style={{ fontSize: Math.max(12, size * 0.42) }}
        >
          {partner.name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}

function PartnerPickerModal({
  activePartnerIds,
  onClose,
  onConfigure,
  onRequest,
}: {
  activePartnerIds: Set<string>;
  onClose: () => void;
  onConfigure: (partner: Partner) => void;
  onRequest: () => void;
}) {
  const [query, setQuery] = useState('');
  const [activeCap, setActiveCap] = useState<CapabilityId | 'all'>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PARTNERS.filter((p) => {
      const matchesCap =
        activeCap === 'all' || p.capabilities.includes(activeCap);
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return matchesCap && matchesQuery;
    });
  }, [query, activeCap]);

  return (
    <ModalShell onClose={onClose} width="max-w-3xl">
      <div className="flex items-start justify-between gap-4 border-b border-black/8 px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold text-black-dark">
            Add Integration Partner
          </h2>
          <p className="mt-1 text-sm text-black-60">
            Choose a provider to connect for this rooftop.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-md p-1 text-black-40 hover:bg-gray-8 hover:text-black-80"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="border-b border-black/8 px-6 pb-3 pt-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black-40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search partners by name or capability"
            className="h-10 w-full rounded-lg border border-blue-1 bg-white pl-9 pr-3 text-sm text-black-87 outline-none placeholder:text-black-40 focus:border-blue-light focus:ring-2 focus:ring-blue-12"
          />
        </div>

        <div role="tablist" className="mt-3 flex flex-wrap gap-1.5">
          <FilterTab
            label="All"
            selected={activeCap === 'all'}
            onClick={() => setActiveCap('all')}
          />
          {CAPABILITIES.map((c) => (
            <FilterTab
              key={c.id}
              label={c.label}
              selected={activeCap === c.id}
              onClick={() => setActiveCap(c.id)}
            />
          ))}
        </div>
      </div>

      <div className="max-h-[55vh] overflow-y-auto px-6 py-4">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-black-60">
            No partners match your search.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {filtered.map((p) => {
              const isActive = activePartnerIds.has(p.id);
              return (
                <li
                  key={p.id}
                  className="flex items-start justify-between gap-4 rounded-lg border border-black/8 bg-white px-4 py-3 hover:border-black/15"
                >
                  <div className="flex min-w-0 flex-1 gap-3">
                    <PartnerAvatar partner={p} size={36} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-black-dark">
                          {p.name}
                        </h3>
                        {isActive && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-lighter px-2 py-0.5 text-[10px] font-medium text-green-darker">
                            <Check className="h-2.5 w-2.5" />
                            Connected
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-black-60">{p.description}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {p.capabilities.map((c) => (
                          <CapabilityChip key={c} id={c} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant={isActive ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => onConfigure(p)}
                    className="shrink-0"
                  >
                    {isActive ? 'Edit' : 'Configure'}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-black/8 bg-gray-lighter/40 px-6 py-3">
        <span className="text-xs text-black-60">
          Don&apos;t see your provider?
        </span>
        <button
          type="button"
          onClick={onRequest}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-light hover:underline"
        >
          <MailQuestion className="h-3.5 w-3.5" />
          Request a new integration
        </button>
      </div>
    </ModalShell>
  );
}

function FilterTab({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className={cn(
        'rounded-full px-3 py-1 text-xs font-medium transition-colors',
        selected
          ? 'bg-blue-light text-white'
          : 'bg-gray-8 text-black-60 hover:bg-gray-lighter hover:text-black-80'
      )}
    >
      {label}
    </button>
  );
}

function ConfigureModal({
  partner,
  existingDealerId,
  existingCapabilities,
  onBack,
  onClose,
  onSave,
}: {
  partner: Partner;
  existingDealerId?: string;
  existingCapabilities?: CapabilityId[];
  onBack: () => void;
  onClose: () => void;
  onSave: (
    partnerId: string,
    dealerId: string,
    enabledCapabilities: CapabilityId[]
  ) => void;
}) {
  const [dealerId, setDealerId] = useState(existingDealerId ?? '');
  const [enabledCaps, setEnabledCaps] = useState<CapabilityId[]>(
    existingCapabilities ?? [...partner.capabilities]
  );
  const [verifyState, setVerifyState] = useState<
    'idle' | 'verifying' | 'verified' | 'failed'
  >(existingDealerId ? 'verified' : 'idle');
  const [error, setError] = useState<string | null>(null);

  const canVerify = dealerId.trim().length > 0 && verifyState !== 'verifying';
  const canSave = verifyState === 'verified' && enabledCaps.length > 0;

  function toggleCap(id: CapabilityId) {
    setEnabledCaps((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function handleVerify() {
    const value = dealerId.trim();
    setError(null);
    setVerifyState('verifying');

    window.setTimeout(() => {
      const invalid =
        value.length < 4 || /fail/i.test(value) || /[^a-zA-Z0-9-]/.test(value);
      if (invalid) {
        setVerifyState('failed');
        setError(
          'We could not verify this dealer ID with ' +
            partner.name +
            '. Double-check the ID and try again.'
        );
      } else {
        setVerifyState('verified');
      }
    }, 600);
  }

  function handleDealerIdChange(value: string) {
    setDealerId(value);
    if (verifyState !== 'idle') {
      setVerifyState('idle');
      setError(null);
    }
  }

  const isEdit = existingDealerId !== undefined;

  return (
    <ModalShell onClose={onClose} width="max-w-xl">
      <div className="flex items-start justify-between gap-4 border-b border-black/8 px-6 py-5">
        <div className="flex min-w-0 gap-3">
          <PartnerAvatar partner={partner} size={44} />
          <div className="min-w-0">
            {!isEdit && (
              <button
                type="button"
                onClick={onBack}
                className="mb-1 text-xs font-medium text-blue-light hover:underline"
              >
                ← Back to partners
              </button>
            )}
            <h2 className="text-lg font-semibold text-black-dark">
              {isEdit ? `Edit ${partner.name}` : `Configure ${partner.name}`}
            </h2>
            <p className="mt-1 text-sm text-black-60">{partner.description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-md p-1 text-black-40 hover:bg-gray-8 hover:text-black-80"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-6 px-6 py-5">
        <div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <TextField
                label="Dealer ID"
                required
                value={dealerId}
                onChange={(e) => handleDealerIdChange(e.target.value)}
                placeholder={`Your ${partner.name} dealer ID`}
                error={error ?? undefined}
                hint={
                  !error
                    ? `The dealer ID issued by ${partner.name} for this rooftop.`
                    : undefined
                }
              />
            </div>
            <Button
              variant="secondary"
              onClick={handleVerify}
              disabled={!canVerify}
              isLoading={verifyState === 'verifying'}
              className="mb-[22px]"
            >
              {verifyState === 'verified' ? 'Re-verify' : 'Verify'}
            </Button>
          </div>

          {verifyState === 'verified' && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-green-lighter px-3 py-1.5 text-xs font-medium text-green-darker">
              <Check className="h-3.5 w-3.5" />
              Verified with {partner.name}
            </div>
          )}
        </div>

        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-sm font-medium text-black-80">
              Capabilities to enable
              <span className="ml-1 text-red">*</span>
            </span>
            <span className="text-xs text-black-40">
              {enabledCaps.length} of {partner.capabilities.length} selected
            </span>
          </div>
          <p className="mb-3 text-xs text-black-60">
            {partner.name} supports the capabilities below. Turn on only the
            ones this rooftop will use.
          </p>
          <div className="flex flex-col gap-2 rounded-lg border border-black/8 bg-gray-lighter/40 px-3 py-3">
            {partner.capabilities.map((c) => (
              <Checkbox
                key={c}
                checked={enabledCaps.includes(c)}
                onChange={() => toggleCap(c)}
                label={CAPABILITY_LABEL[c]}
              />
            ))}
          </div>
          {enabledCaps.length === 0 && (
            <p className="mt-2 text-xs text-red">
              Select at least one capability.
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-black/8 px-6 py-4">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={() => onSave(partner.id, dealerId.trim(), enabledCaps)}
          disabled={!canSave}
        >
          Save
        </Button>
      </div>
    </ModalShell>
  );
}

function RequestIntegrationModal({ onClose }: { onClose: () => void }) {
  const [partnerName, setPartnerName] = useState('');
  const [capability, setCapability] = useState<CapabilityId | ''>('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = partnerName.trim().length > 0 && capability !== '';

  function handleSubmit() {
    setSubmitted(true);
  }

  return (
    <ModalShell onClose={onClose} width="max-w-xl">
      <div className="flex items-start justify-between gap-4 border-b border-black/8 px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold text-black-dark">
            Request a new integration
          </h2>
          <p className="mt-1 text-sm text-black-60">
            Tell us which partner you&apos;d like Spyne to integrate with. Our
            partnerships team will follow up.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-md p-1 text-black-40 hover:bg-gray-8 hover:text-black-80"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {submitted ? (
        <div className="px-6 py-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-lighter text-green-darker">
            <Check className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-black-dark">
            Request submitted
          </h3>
          <p className="mt-1 text-sm text-black-60">
            Thanks — the partnerships team will be in touch about
            <span className="font-medium text-black-80"> {partnerName.trim()}</span>.
          </p>
          <Button onClick={onClose} className="mt-5">
            Done
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4 px-6 py-5">
            <TextField
              label="Partner name"
              required
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              placeholder="e.g. ProMax CRM"
            />

            <div>
              <span className="mb-1.5 block text-sm font-medium text-black-60">
                Capability needed <span className="text-red">*</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {CAPABILITIES.map((c) => (
                  <FilterTab
                    key={c.id}
                    label={c.label}
                    selected={capability === c.id}
                    onClick={() =>
                      setCapability(capability === c.id ? '' : c.id)
                    }
                  />
                ))}
              </div>
            </div>

            <Textarea
              label="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How is the rooftop using this partner today? Any contacts we should reach?"
              hint="Include account reps or website URLs if you have them."
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-black/8 px-6 py-4">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              Submit request
            </Button>
          </div>
        </>
      )}
    </ModalShell>
  );
}

function ModalShell({
  onClose,
  width,
  children,
}: {
  onClose: () => void;
  width: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          'relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl',
          width
        )}
      >
        {children}
      </div>
    </div>
  );
}
