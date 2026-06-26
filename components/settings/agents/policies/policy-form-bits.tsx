'use client';

import { useId, useRef, useState, type ReactNode } from 'react';
import { Check, Info } from 'lucide-react';
import { DsToggle } from '@/components/settings/ds';
import { FloatingPanel } from '@/components/settings/ui/floating-panel';
import { SegmentedControl } from '@/components/settings/ui/segmented-control';
import { cn } from '@/lib/settings/cn';

/**
 * Small (i) icon that reveals a portaled popover with longer-form context on
 * click. Use for compliance notes ("SMS only — never read aloud"), runtime
 * behavior ("the agent reads this on every booking"), or anything else that
 * doesn't belong inline next to the label. Click to toggle; outside-click or
 * Escape closes (handled by FloatingPanel).
 */
export function InfoPopover({ content }: { content: ReactNode }) {
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        aria-label="More info"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-black-40 transition-colors hover:text-blue-light',
          open && 'text-blue-light'
        )}
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      <FloatingPanel
        anchorRef={anchorRef}
        open={open}
        onClose={() => setOpen(false)}
        placement="bottom-start"
        width={280}
      >
        <div className="rounded-lg border border-black/10 bg-white p-3 text-xs leading-relaxed text-black-60 shadow-lg">
          {content}
        </div>
      </FloatingPanel>
    </>
  );
}

/**
 * Two-column label + control row. Title-led, with optional one-line subtitle
 * and an (i) info popover for longer-form context.
 *
 * Pass `fullWidthControl` when the control is too wide for the right-aligned
 * 260px column (e.g. CheckboxLists with many long-label options like the CPO
 * eligibility / benefits / warranty lists). The control then renders on a
 * new line below the label at full width.
 */
export function FormRow({
  label,
  subtitle,
  info,
  control,
  error,
  required,
  fullWidthControl,
}: {
  label: string;
  subtitle?: string;
  info?: ReactNode;
  control: ReactNode;
  error?: string;
  required?: boolean;
  fullWidthControl?: boolean;
}) {
  if (fullWidthControl) {
    return (
      <div className="py-3">
        <div className="flex items-center gap-1.5 text-sm font-medium text-black-80">
          <span>{label}</span>
          {required && <span className="text-red">*</span>}
          {info && <InfoPopover content={info} />}
        </div>
        {subtitle && (
          <p className="mt-0.5 text-xs text-black-60">{subtitle}</p>
        )}
        {error && <p className="mt-1 text-xs text-red">{error}</p>}
        <div className="mt-3">{control}</div>
      </div>
    );
  }
  return (
    <div className="grid gap-3 py-3 md:grid-cols-[1fr_auto] md:items-start md:gap-6">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-sm font-medium text-black-80">
          <span>{label}</span>
          {required && <span className="text-red">*</span>}
          {info && <InfoPopover content={info} />}
        </div>
        {subtitle && (
          <p className="mt-0.5 text-xs text-black-60">{subtitle}</p>
        )}
        {error && (
          <p className="mt-1 text-xs text-red">{error}</p>
        )}
      </div>
      <div className="md:min-w-[260px] md:justify-self-end">{control}</div>
    </div>
  );
}

/** Group separator inside expanded card body. */
export function SubSection({
  title,
  children,
  enabled = true,
}: {
  title?: string;
  children: ReactNode;
  enabled?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-black/5 bg-gray-lighter/60 p-4 transition-opacity',
        !enabled && 'opacity-60'
      )}
    >
      {title && (
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-black-60">
          {title}
        </div>
      )}
      <div className="divide-y divide-black/5">{children}</div>
    </div>
  );
}

/**
 * Multi-select checklist — the canonical multi-select control for the
 * Policies tab. Renders all options in a single row by default and wraps to
 * additional rows only when there isn't enough horizontal space. Set
 * `columns` for many-option lists (e.g. US states) where a fixed grid reads
 * better than a wrapping flow.
 */
export function CheckboxList<T extends string>({
  values,
  options,
  onChange,
  disabled,
  ariaLabel,
  columns,
}: {
  values: T[];
  options: { value: T; label: string }[];
  onChange(next: T[]): void;
  disabled?: boolean;
  ariaLabel?: string;
  columns?: number;
}) {
  const toggle = (v: T) => {
    if (disabled) return;
    if (values.includes(v)) {
      onChange(values.filter((x) => x !== v));
    } else {
      onChange([...values, v]);
    }
  };

  const layout = columns
    ? { display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
    : undefined;

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      style={layout}
      className={cn(!columns && 'flex flex-wrap items-center gap-x-5 gap-y-2', columns && 'gap-x-4 gap-y-2')}
    >
      {options.map((opt) => {
        const checked = values.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            role="checkbox"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => toggle(opt.value)}
            className={cn(
              'inline-flex cursor-pointer items-center gap-2 text-left text-sm text-black-80 transition-colors',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            <span
              aria-hidden
              className={cn(
                'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                checked
                  ? 'border-blue-light bg-blue-light text-white'
                  : 'border-black/20 bg-white'
              )}
            >
              {checked && <Check className="h-3 w-3" strokeWidth={3} />}
            </span>
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  placeholder,
  disabled,
  width = 'w-28',
}: {
  value: number | undefined;
  onChange(next: number | undefined): void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  placeholder?: string;
  disabled?: boolean;
  width?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value ?? ''}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === '') return onChange(undefined);
          const num = Number(raw);
          if (Number.isNaN(num)) return;
          onChange(num);
        }}
        className={cn(
          'h-9 rounded-lg border border-black/10 bg-white px-3 text-sm text-black-80 outline-none transition-colors',
          'focus:border-blue-light focus:ring-2 focus:ring-blue-12',
          'disabled:cursor-not-allowed disabled:opacity-50',
          width
        )}
      />
      {suffix && <span className="text-xs text-black-60">{suffix}</span>}
    </div>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  disabled,
  width = 'w-64',
}: {
  value: string | undefined;
  onChange(next: string): void;
  placeholder?: string;
  disabled?: boolean;
  width?: string;
}) {
  return (
    <input
      type="text"
      value={value ?? ''}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'h-9 rounded-lg border border-black/10 bg-white px-3 text-sm text-black-80 outline-none transition-colors',
        'focus:border-blue-light focus:ring-2 focus:ring-blue-12',
        'disabled:cursor-not-allowed disabled:opacity-50',
        width
      )}
    />
  );
}

export function TextAreaInput({
  value,
  onChange,
  placeholder,
  disabled,
  rows = 3,
}: {
  value: string | undefined;
  onChange(next: string): void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
}) {
  return (
    <textarea
      value={value ?? ''}
      rows={rows}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-black-80 outline-none transition-colors',
        'focus:border-blue-light focus:ring-2 focus:ring-blue-12',
        'disabled:cursor-not-allowed disabled:opacity-50'
      )}
    />
  );
}

/**
 * Feature gate switch. Use ONLY for fields where ON enables a behavior and
 * (typically) reveals dependent UI — "do we offer this at all?" type questions.
 *
 * For binary value-pick questions where neither side is "off" (e.g. "deposit
 * required: Yes/No"), use `YesNo` instead so the visual language stays
 * consistent with the other value pickers.
 */
export function FeatureSwitch({
  enabled,
  onChange,
  disabled,
}: {
  enabled: boolean;
  onChange(next: boolean): void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <DsToggle
      id={id}
      toggle={enabled}
      toggleHandler={(e) => onChange(e.target.checked)}
      disabled={disabled}
    />
  );
}

/** Re-export so cards have a single import path for value-pick controls. */
export { SegmentedControl } from '@/components/settings/ui/segmented-control';

/**
 * Boolean Yes/No rendered as a two-segment SegmentedControl so the visual
 * language matches every other value pick on the page. Use for "is this
 * true?" configuration that is NOT a feature gate (e.g.
 * multipleVehiclesSameVisit, appointment required, multiBrandCpoEligible).
 */
export function YesNo({
  value,
  onChange,
  yesLabel = 'Yes',
  noLabel = 'No',
}: {
  value: boolean;
  onChange(next: boolean): void;
  yesLabel?: string;
  noLabel?: string;
}) {
  return (
    <SegmentedControl
      value={value ? 'yes' : 'no'}
      options={[
        { value: 'yes', label: yesLabel },
        { value: 'no', label: noLabel },
      ]}
      onChange={(v) => onChange(v === 'yes')}
    />
  );
}
