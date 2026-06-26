'use client';

// Lightweight Rooftop Profile — replaces the vendored OnboardingRooftopDetails.
// No vendor/ or components/v3/ imports — only thin local primitives.
// Scope: Rooftop name, Website URL, Address (Google Places). Timezone lives
// in Department Details.

import { useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { TextField } from '@/components/settings/ui/text-field';
import { Button } from '@/components/settings/ui/button';
import { AddressField } from '@/components/settings/ui/address-field';
import type { ParsedAddress } from '@/lib/settings/google-places';

interface FormState {
  name: string;
  website: string;
  address: ParsedAddress | null;
}

const EMPTY: FormState = { name: '', website: '', address: null };

const URL_RE = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,})([/\w.-]*)*\/?$/i;

// TODO: source the real contract URL from the bridge / a backend field.
// For now, fall back to a placeholder so the button is clickable.
const FALLBACK_CONTRACT_URL = 'https://spyne.ai';

function validate(form: FormState): Partial<Record<keyof FormState, string>> {
  const errors: Partial<Record<keyof FormState, string>> = {};
  if (!form.name.trim()) errors.name = 'Required';
  if (!form.website.trim()) errors.website = 'Required';
  else if (!URL_RE.test(form.website.trim())) errors.website = 'Enter a valid URL';
  if (!form.address?.formattedAddress) errors.address = 'Required';
  return errors;
}

export function RooftopProfileScreen() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  const errors = useMemo(() => validate(form), [form]);
  const isDirty =
    form.name !== EMPTY.name ||
    form.website !== EMPTY.website ||
    form.address !== EMPTY.address;
  const hasErrors = Object.keys(errors).length > 0;

  const updateText = (key: 'name' | 'website') =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  const onBlur = (key: keyof FormState) => () =>
    setTouched((t) => ({ ...t, [key]: true }));
  const showError = (key: keyof FormState) => touched[key] && errors[key];

  const onSave = async () => {
    if (hasErrors) {
      setTouched({ name: true, website: true, address: true });
      return;
    }
    setSaveState('saving');
    // TODO: wire to live save (PUT /rooftop/profile).
    await new Promise((r) => setTimeout(r, 400));
    setSaveState('saved');
    setTimeout(() => setSaveState('idle'), 1500);
  };

  const onViewContract = () => {
    window.open(FALLBACK_CONTRACT_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="mx-auto max-w-3xl pb-24">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-semibold text-black-dark">Rooftop Profile</h1>
          <p className="mt-0.5 text-sm text-black-60">
            Name, website, listing URL, and contract details for this rooftop.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={onViewContract}
          aria-label="View contract"
        >
          View contract
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </header>

      <section className="rounded-2xl border border-black/8 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextField
              label="Rooftop name"
              placeholder="e.g. Acme Motors — Downtown"
              value={form.name}
              onChange={updateText('name')}
              onBlur={onBlur('name')}
              error={showError('name') ? errors.name : undefined}
              required
            />
            <TextField
              label="Website URL"
              placeholder="https://acme-motors.com"
              type="url"
              value={form.website}
              onChange={updateText('website')}
              onBlur={onBlur('website')}
              error={showError('website') ? errors.website : undefined}
              required
            />
          </div>
          <AddressField
            value={form.address}
            onChange={(next) => {
              setForm((f) => ({ ...f, address: next }));
              setTouched((t) => ({ ...t, address: true }));
            }}
            error={showError('address') ? errors.address : undefined}
            required
          />
        </div>
      </section>

      <SaveBar
        saveState={saveState}
        disabled={!isDirty || hasErrors}
        onSave={onSave}
      />
    </div>
  );
}

function SaveBar({
  saveState,
  disabled,
  onSave,
}: {
  saveState: 'idle' | 'saving' | 'saved';
  disabled: boolean;
  onSave: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-72 right-0 z-10 border-t border-black/8 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 px-10 py-3">
        <span
          className={
            saveState === 'saving'
              ? 'text-xs text-black-40'
              : saveState === 'saved'
                ? 'text-xs font-medium text-green'
                : 'hidden'
          }
        >
          {saveState === 'saving' ? 'Saving…' : 'Saved'}
        </span>
        <Button onClick={onSave} disabled={disabled} isLoading={saveState === 'saving'}>
          Save changes
        </Button>
      </div>
    </div>
  );
}
