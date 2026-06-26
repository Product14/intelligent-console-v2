'use client';

import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { AsYouType, type CountryCode } from 'libphonenumber-js';
import { FloatingPanel } from '@/components/settings/ui/floating-panel';
import { validatePhone } from '@/lib/settings/field-validation';
import { cn } from '@/lib/settings/cn';

/** Rich country dial-code list with flag + label + ISO + a placeholder hint
 *  showing the country's national format. Kept here (not in `phone-input.tsx`)
 *  so this component owns its full UI surface. */
export const PHONE_COUNTRY_CODES: Array<{
  code: string;
  iso: CountryCode;
  flag: string;
  label: string;
  placeholder: string;
}> = [
  { code: '+1',   iso: 'US', flag: '🇺🇸', label: 'US / Canada',     placeholder: '(415) 555-0101' },
  { code: '+52',  iso: 'MX', flag: '🇲🇽', label: 'Mexico',          placeholder: '55 1234 5678' },
  { code: '+44',  iso: 'GB', flag: '🇬🇧', label: 'United Kingdom',  placeholder: '07400 123456' },
  { code: '+91',  iso: 'IN', flag: '🇮🇳', label: 'India',           placeholder: '98765 43210' },
  { code: '+61',  iso: 'AU', flag: '🇦🇺', label: 'Australia',       placeholder: '0412 345 678' },
  { code: '+971', iso: 'AE', flag: '🇦🇪', label: 'UAE',             placeholder: '50 123 4567' },
  { code: '+49',  iso: 'DE', flag: '🇩🇪', label: 'Germany',         placeholder: '030 12345678' },
  { code: '+33',  iso: 'FR', flag: '🇫🇷', label: 'France',          placeholder: '06 12 34 56 78' },
  { code: '+81',  iso: 'JP', flag: '🇯🇵', label: 'Japan',           placeholder: '090 1234 5678' },
  { code: '+65',  iso: 'SG', flag: '🇸🇬', label: 'Singapore',       placeholder: '8123 4567' },
];

const DIAL_TO_ISO = new Map<string, CountryCode>(
  PHONE_COUNTRY_CODES.map((c) => [c.code, c.iso])
);

/** Format a digits-only national number into the country's national display
 *  format ("(415) 555-0101" for US, "98765 43210" for IN). State stays
 *  digits-only — formatting is purely for display. */
function formatNational(countryCode: string, phone: string): string {
  if (!phone) return '';
  const iso = DIAL_TO_ISO.get(countryCode);
  if (!iso) return phone;
  // AsYouType('US').input('4155550101') → "(415) 555-0101". Each call to
  // input() is incremental, but a fresh instance per render formats the
  // whole string in one pass.
  return new AsYouType(iso).input(phone);
}

interface PhoneNumberFieldProps {
  countryCode: string;
  phone: string;
  onChange(next: { countryCode: string; phone: string }): void;
  /** Compact (h-9, sm text) for inline editors; full (h-12, base text) for
   *  top-level forms like Departments. */
  size?: 'sm' | 'md';
  placeholder?: string;
  /** Inline slot rendered at the end of the input row (e.g., an IVR toggle).
   *  Not affected by the input's error state. */
  trailing?: ReactNode;
  /** Override the inline error. When omitted the field runs `validatePhone`
   *  itself. Pass `null` to fully suppress the inline message (e.g. when the
   *  caller surfaces errors elsewhere). */
  error?: string | null;
  /** Hide the inline error message even when one exists — caller is in
   *  charge of surfacing it (e.g. a global save-bar gate). */
  hideInlineError?: boolean;
  disabled?: boolean;
  /** Container className for the wrapping <div>. */
  className?: string;
}

/**
 * Rooftop-wide phone-number input. Bundles:
 *   - rich country dial-code picker (flag + label + search)
 *   - digit-only input (strips formatting on paste/keystroke)
 *   - libphonenumber-based validation via `validatePhone`
 *   - focus-aware error display (hidden while typing, shown on blur)
 *   - optional trailing slot for an inline control (IVR toggle, etc.)
 *
 * Same building block in `phone-list-editor` and the Departments form so
 * validation + UX stays consistent across the app.
 */
export function PhoneNumberField({
  countryCode,
  phone,
  onChange,
  size = 'sm',
  placeholder,
  trailing,
  error,
  hideInlineError,
  disabled,
  className,
}: PhoneNumberFieldProps) {
  const [focused, setFocused] = useState(false);

  // Caller can override; otherwise compute internally.
  const computed = error === undefined ? validatePhone(countryCode, phone) : error;
  // Suppress the message while the user is typing so it can't flicker on
  // every keystroke; save-bar gating should use `validatePhone` directly so
  // invalid input still can't slip through.
  const visibleError = focused ? null : computed;

  const inputHeight = size === 'md' ? 'h-12 text-base' : 'h-9 text-sm';
  const buttonHeight = size === 'md' ? 'h-10 px-3 text-sm' : 'h-9 px-2 text-sm';
  const countryEntry = PHONE_COUNTRY_CODES.find((c) => c.code === countryCode);
  const placeholderText = placeholder ?? countryEntry?.placeholder ?? 'Phone number';
  // Format every render — "4155550101" → "(415) 555-0101" for US, etc.
  // State stays digits-only; the input shows the formatted value.
  const displayValue = useMemo(
    () => formatNational(countryCode, phone),
    [countryCode, phone]
  );

  // As-you-type cursor preservation. The formatted value rearranges itself
  // when a digit is added/removed (e.g. "(415)" appears the moment the 3rd
  // digit lands), which would otherwise yank the caret to the end on every
  // keystroke. We:
  //   1. capture the digit-index of the caret BEFORE the change,
  //   2. let the parent update state with the digit-stripped value,
  //   3. after the next paint, walk the freshly-formatted string to find
  //      the character position that holds the same digit-index, and place
  //      the caret there.
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingDigitPos = useRef<number | null>(null);

  useLayoutEffect(() => {
    const pos = pendingDigitPos.current;
    if (pos === null || !inputRef.current) return;
    const value = inputRef.current.value;
    let charPos = 0;
    let digitsSeen = 0;
    while (charPos < value.length && digitsSeen < pos) {
      if (/\d/.test(value[charPos])) digitsSeen++;
      charPos++;
    }
    inputRef.current.setSelectionRange(charPos, charPos);
    pendingDigitPos.current = null;
  }, [displayValue]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    const cursorAt = target.selectionStart ?? target.value.length;
    const beforeCursor = target.value.slice(0, cursorAt);
    pendingDigitPos.current = beforeCursor.replace(/\D/g, '').length;
    const newDigits = target.value.replace(/\D/g, '');
    onChange({ countryCode, phone: newDigits });
  };

  // Backspace handling: if the char just before the caret is a formatting
  // glyph (space, paren, dash), the default delete only strips the glyph —
  // which we re-insert on the next render, so nothing visibly happens. Hijack
  // that case and delete the nearest preceding digit instead so backspace
  // always advances.
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Backspace') return;
    const target = e.currentTarget;
    const start = target.selectionStart ?? 0;
    const end = target.selectionEnd ?? 0;
    if (start !== end || start === 0) return;
    const charBefore = target.value[start - 1];
    if (/\d/.test(charBefore)) return; // default delete will remove the digit
    e.preventDefault();
    // Find the nearest digit to the left of the formatting glyph and drop it.
    let digitIdx = start - 2;
    while (digitIdx >= 0 && !/\d/.test(target.value[digitIdx])) digitIdx--;
    if (digitIdx < 0) return;
    const newValue =
      target.value.slice(0, digitIdx) + target.value.slice(digitIdx + 1);
    const beforeCursor = newValue.slice(0, digitIdx);
    pendingDigitPos.current = beforeCursor.replace(/\D/g, '').length;
    onChange({ countryCode, phone: newValue.replace(/\D/g, '') });
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <CountryCodeSelect
          value={countryCode}
          onChange={(c) => onChange({ countryCode: c, phone })}
          disabled={disabled}
          buttonClassName={buttonHeight}
        />
        <input
          ref={inputRef}
          value={displayValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          type="tel"
          inputMode="numeric"
          placeholder={placeholderText}
          disabled={disabled}
          aria-invalid={visibleError ? true : undefined}
          className={cn(
            'min-w-0 flex-1 rounded-lg border bg-white px-3 outline-none placeholder:text-black-40 transition-colors',
            inputHeight,
            size === 'md' ? 'font-normal text-black-60' : 'text-black-80',
            visibleError
              ? 'border-red-500 focus:border-red-500'
              : 'border-black/10 focus:border-blue-light focus:ring-2 focus:ring-blue-12',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        />
        {trailing}
      </div>
      {visibleError && !hideInlineError && (
        <div className="mt-1 text-xs font-medium text-red-600">{visibleError}</div>
      )}
    </div>
  );
}

function CountryCodeSelect({
  value,
  onChange,
  disabled,
  buttonClassName,
}: {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const buttonRef = useRef<HTMLButtonElement>(null);

  const lower = query.toLowerCase();
  const filtered = PHONE_COUNTRY_CODES.filter(
    (c) =>
      c.code.toLowerCase().includes(lower) ||
      c.label.toLowerCase().includes(lower)
  );

  const current = PHONE_COUNTRY_CODES.find((c) => c.code === value);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex shrink-0 items-center gap-2 rounded-md border border-black/10 bg-white text-black-dark hover:border-black/20 transition-colors',
          'disabled:cursor-not-allowed disabled:opacity-50',
          buttonClassName
        )}
      >
        <span className="text-base leading-none">{current?.flag ?? '🌐'}</span>
        <span className="font-medium">{value}</span>
        <Chevron open={open} />
      </button>
      <FloatingPanel
        anchorRef={buttonRef}
        open={open}
        onClose={() => {
          setOpen(false);
          setQuery('');
        }}
        placement="bottom-start"
        width={256}
        className="rounded-md border border-black/10 bg-white shadow-[0_8px_24px_rgba(16,24,40,0.12)]"
      >
        <div className="p-2">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search country"
            className="w-full rounded-md border border-black/10 bg-white px-2 py-1.5 text-sm outline-none focus:border-black/40"
          />
        </div>
        <div className="max-h-60 overflow-auto pb-1">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-xs text-black-40">No match</div>
          ) : (
            filtered.map((opt) => (
              <button
                key={opt.code}
                type="button"
                onClick={() => {
                  onChange(opt.code);
                  setOpen(false);
                  setQuery('');
                }}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-gray-light',
                  opt.code === value
                    ? 'font-semibold text-black-dark'
                    : 'text-black-80'
                )}
              >
                <span className="text-base leading-none">{opt.flag}</span>
                <span className="flex-1 truncate">{opt.label}</span>
                <span className="text-black-40">{opt.code}</span>
              </button>
            ))
          )}
        </div>
      </FloatingPanel>
    </>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('transition-transform', open && 'rotate-180')}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
