'use client';

import { useEffect, useMemo, useState } from 'react';
import { TextField } from '@/components/settings/ui/text-field';
import { Textarea } from '@/components/settings/ui/textarea';
import {
  EMPTY_HANDOVER,
  handoverFormErrors,
  type HandoverFormData,
} from '@/lib/settings/vini-status-lifecycle';
import { cn } from '@/lib/settings/cn';

interface HandoverFormProps {
  value: HandoverFormData;
  /** When false, the form renders as read-only labelled rows (no inputs). */
  editable: boolean;
  /** Called on every field change so the parent can persist the draft. */
  onChange?: (next: HandoverFormData) => void;
  /** Last rejection reason (most recent across all agents) — rendered as an
   *  inline callout above the form so Sales sees what to fix. */
  rejectionCallout?: { reason: string; at: string } | null;
}

/** Section header above each field group. */
function GroupHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-3 border-b border-black/8 pb-1.5">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-black-60">
        {title}
      </div>
      {hint && <div className="mt-0.5 text-[11px] text-black-40">{hint}</div>}
    </div>
  );
}

export function HandoverForm({ value, editable, onChange, rejectionCallout }: HandoverFormProps) {
  // Field-focus tracking so we can defer inline errors until blur (matches
  // the project ui-pattern: errors appear when not-focused, not on every
  // keystroke).
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const errors = useMemo(() => (editable ? handoverFormErrors(value) : {}), [value, editable]);

  // When `editable` flips to false (form becomes read-only), force-clear any
  // lingering focused state so we don't display a stale error suppression.
  useEffect(() => {
    if (!editable) setFocusedField(null);
  }, [editable]);

  const visibleError = (field: string): string | undefined =>
    focusedField === field ? undefined : errors[field];

  const update = <K extends keyof HandoverFormData>(field: K, val: HandoverFormData[K]) => {
    if (!onChange) return;
    onChange({ ...value, [field]: val });
  };

  const updatePrimary = <K extends keyof HandoverFormData['primaryContact']>(
    field: K,
    val: HandoverFormData['primaryContact'][K]
  ) => {
    if (!onChange) return;
    onChange({ ...value, primaryContact: { ...value.primaryContact, [field]: val } });
  };

  const updateSecondary = (
    field: keyof NonNullable<HandoverFormData['secondaryContact']>,
    val: string | undefined
  ) => {
    if (!onChange) return;
    const next = { ...(value.secondaryContact ?? {}), [field]: val };
    onChange({ ...value, secondaryContact: next });
  };

  const updateIntegration = (
    field: keyof HandoverFormData['currentIntegrations'],
    val: string | undefined
  ) => {
    if (!onChange) return;
    onChange({
      ...value,
      currentIntegrations: { ...value.currentIntegrations, [field]: val || undefined },
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
      <header className="border-b border-black/8 px-5 py-3.5">
        <h2 className="text-sm font-semibold text-black-dark">Sales → OB Handover</h2>
        <p className="mt-0.5 text-xs text-black-60">
          {editable
            ? 'Capture the basic business details and what the dealer currently uses. Required fields are marked with *.'
            : 'Submitted by Sales. Review and Accept or Reject below.'}
        </p>
      </header>

      {rejectionCallout && (
        <div className="border-b border-red-warningRed/20 bg-red-lightest px-5 py-3 text-xs text-red-warningRed">
          <div className="font-semibold">Most recent rejection</div>
          <p className="mt-0.5">{rejectionCallout.reason}</p>
          <div className="mt-1 text-[11px] opacity-75">
            {new Date(rejectionCallout.at).toLocaleString()}
          </div>
        </div>
      )}

      <div className="space-y-6 px-5 py-5">
        {/* Business details */}
        <section>
          <GroupHeader title="Business details" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {editable ? (
              <>
                <TextField
                  label="Dealer name" required
                  value={value.dealerName}
                  onChange={(e) => update('dealerName', e.target.value)}
                  onFocus={() => setFocusedField('dealerName')}
                  onBlur={() => setFocusedField(null)}
                  error={visibleError('dealerName')}
                />
                <TextField
                  label="Website" required
                  placeholder="https://"
                  value={value.website}
                  onChange={(e) => update('website', e.target.value)}
                  onFocus={() => setFocusedField('website')}
                  onBlur={() => setFocusedField(null)}
                  error={visibleError('website')}
                />
              </>
            ) : (
              <>
                <ReadField label="Dealer name" value={value.dealerName} />
                <ReadField label="Website" value={value.website} />
              </>
            )}
          </div>
        </section>

        {/* Address */}
        <section>
          <GroupHeader title="Address" />
          {editable ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <TextField
                  label="Street address" required
                  value={value.addressLine1}
                  onChange={(e) => update('addressLine1', e.target.value)}
                  onFocus={() => setFocusedField('addressLine1')}
                  onBlur={() => setFocusedField(null)}
                  error={visibleError('addressLine1')}
                />
              </div>
              <div className="sm:col-span-2">
                <TextField
                  label="Address line 2"
                  value={value.addressLine2 ?? ''}
                  onChange={(e) => update('addressLine2', e.target.value || undefined)}
                />
              </div>
              <TextField
                label="City" required
                value={value.city}
                onChange={(e) => update('city', e.target.value)}
                onFocus={() => setFocusedField('city')}
                onBlur={() => setFocusedField(null)}
                error={visibleError('city')}
              />
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="State" required
                  value={value.state}
                  onChange={(e) => update('state', e.target.value)}
                  onFocus={() => setFocusedField('state')}
                  onBlur={() => setFocusedField(null)}
                  error={visibleError('state')}
                />
                <TextField
                  label="ZIP" required
                  value={value.zip}
                  onChange={(e) => update('zip', e.target.value)}
                  onFocus={() => setFocusedField('zip')}
                  onBlur={() => setFocusedField(null)}
                  error={visibleError('zip')}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <ReadField
                label="Address"
                value={[value.addressLine1, value.addressLine2, [value.city, value.state, value.zip].filter(Boolean).join(', ')]
                  .filter(Boolean)
                  .join(' · ')}
              />
            </div>
          )}
        </section>

        {/* Primary contact */}
        <section>
          <GroupHeader title="Primary contact" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {editable ? (
              <>
                <TextField
                  label="Name" required
                  value={value.primaryContact.name}
                  onChange={(e) => updatePrimary('name', e.target.value)}
                  onFocus={() => setFocusedField('primaryContact.name')}
                  onBlur={() => setFocusedField(null)}
                  error={visibleError('primaryContact.name')}
                />
                <TextField
                  label="Role"
                  value={value.primaryContact.role ?? ''}
                  onChange={(e) => updatePrimary('role', e.target.value || undefined)}
                />
                <TextField
                  label="Email" required
                  type="email"
                  value={value.primaryContact.email}
                  onChange={(e) => updatePrimary('email', e.target.value)}
                  onFocus={() => setFocusedField('primaryContact.email')}
                  onBlur={() => setFocusedField(null)}
                  error={visibleError('primaryContact.email')}
                />
                <TextField
                  label="Phone"
                  type="tel"
                  value={value.primaryContact.phone ?? ''}
                  onChange={(e) => updatePrimary('phone', e.target.value || undefined)}
                />
              </>
            ) : (
              <>
                <ReadField label="Name" value={value.primaryContact.name} />
                <ReadField label="Role" value={value.primaryContact.role} />
                <ReadField label="Email" value={value.primaryContact.email} />
                <ReadField label="Phone" value={value.primaryContact.phone} />
              </>
            )}
          </div>
        </section>

        {/* Secondary contact */}
        <section>
          <GroupHeader title="Secondary contact" hint="Optional" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {editable ? (
              <>
                <TextField
                  label="Name"
                  value={value.secondaryContact?.name ?? ''}
                  onChange={(e) => updateSecondary('name', e.target.value || undefined)}
                />
                <TextField
                  label="Role"
                  value={value.secondaryContact?.role ?? ''}
                  onChange={(e) => updateSecondary('role', e.target.value || undefined)}
                />
                <TextField
                  label="Email"
                  type="email"
                  value={value.secondaryContact?.email ?? ''}
                  onChange={(e) => updateSecondary('email', e.target.value || undefined)}
                />
                <TextField
                  label="Phone"
                  type="tel"
                  value={value.secondaryContact?.phone ?? ''}
                  onChange={(e) => updateSecondary('phone', e.target.value || undefined)}
                />
              </>
            ) : (
              <>
                <ReadField label="Name" value={value.secondaryContact?.name} />
                <ReadField label="Role" value={value.secondaryContact?.role} />
                <ReadField label="Email" value={value.secondaryContact?.email} />
                <ReadField label="Phone" value={value.secondaryContact?.phone} />
              </>
            )}
          </div>
        </section>

        {/* Current integrations */}
        <section>
          <GroupHeader
            title="Current integrations"
            hint="What the dealer is using today — OB uses this as the starting point for the Integrations setup step."
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {INTEGRATION_LABELS.map(({ key, label }) =>
              editable ? (
                <TextField
                  key={key}
                  label={label}
                  placeholder="Provider name"
                  value={value.currentIntegrations[key] ?? ''}
                  onChange={(e) => updateIntegration(key, e.target.value)}
                />
              ) : (
                <ReadField key={key} label={label} value={value.currentIntegrations[key]} />
              )
            )}
          </div>
        </section>

        {/* Notes for OB */}
        <section>
          <GroupHeader title="Notes for OB" hint="Anything OB should know before kicking off." />
          {editable ? (
            <Textarea
              label=""
              value={value.notesForOb ?? ''}
              onChange={(e) => update('notesForOb', e.target.value || undefined)}
              rows={3}
              placeholder="e.g. 'Dealer is migrating from a legacy system next month — kickoff after July 1.'"
            />
          ) : (
            <ReadField label="Notes" value={value.notesForOb} multiline />
          )}
        </section>
      </div>
    </div>
  );
}

const INTEGRATION_LABELS: Array<{
  key: keyof HandoverFormData['currentIntegrations'];
  label: string;
}> = [
  { key: 'crm',              label: 'CRM' },
  { key: 'ims',              label: 'IMS' },
  { key: 'dms',              label: 'DMS' },
  { key: 'carHistory',       label: 'Car History' },
  { key: 'serviceScheduler', label: 'Service Scheduler' },
];

function ReadField({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string | undefined;
  multiline?: boolean;
}) {
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-wide text-black-40">
        {label}
      </div>
      <div className={cn('mt-0.5 text-sm', value ? 'text-black-80' : 'text-black-40 italic', multiline && 'whitespace-pre-wrap')}>
        {value || 'Not provided'}
      </div>
    </div>
  );
}
