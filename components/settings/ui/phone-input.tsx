'use client';

import { cn } from '@/lib/settings/cn';

/** Country dial codes — same set used by the Departments form so this surface
 *  accepts the numbers an operator has already entered elsewhere. */
export const COUNTRY_CODES = [
  { code: '+1', label: '🇺🇸 +1' },
  { code: '+44', label: '🇬🇧 +44' },
  { code: '+91', label: '🇮🇳 +91' },
  { code: '+61', label: '🇦🇺 +61' },
  { code: '+33', label: '🇫🇷 +33' },
  { code: '+49', label: '🇩🇪 +49' },
  { code: '+52', label: '🇲🇽 +52' },
  { code: '+65', label: '🇸🇬 +65' },
  { code: '+81', label: '🇯🇵 +81' },
  { code: '+971', label: '🇦🇪 +971' },
];

interface PhoneInputProps {
  countryCode: string;
  phone: string;
  onChange(next: { countryCode: string; phone: string }): void;
  /** Width class for the digit input. Default fits ~10 digits. */
  width?: string;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Compact phone-with-country-code input. Country dropdown + digit-only number
 * input. Stripping non-digits on every keystroke means pasted formatted
 * numbers ("(415) 555-0101") get cleaned automatically.
 */
export function PhoneInput({
  countryCode,
  phone,
  onChange,
  width = 'w-40',
  placeholder = 'Phone number',
  disabled,
}: PhoneInputProps) {
  return (
    <div className="inline-flex items-center gap-2">
      <select
        value={countryCode}
        disabled={disabled}
        onChange={(e) => onChange({ countryCode: e.target.value, phone })}
        className={cn(
          'h-9 shrink-0 rounded-lg border border-black/10 bg-white px-2 text-sm text-black-80 outline-none transition-colors',
          'focus:border-blue-light focus:ring-2 focus:ring-blue-12',
          'disabled:cursor-not-allowed disabled:opacity-50'
        )}
      >
        {COUNTRY_CODES.map((opt) => (
          <option key={opt.code} value={opt.code}>
            {opt.label}
          </option>
        ))}
      </select>
      <input
        type="tel"
        inputMode="numeric"
        value={phone}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) =>
          onChange({ countryCode, phone: e.target.value.replace(/\D/g, '') })
        }
        className={cn(
          'h-9 rounded-lg border border-black/10 bg-white px-3 text-sm text-black-80 outline-none transition-colors',
          'focus:border-blue-light focus:ring-2 focus:ring-blue-12',
          'disabled:cursor-not-allowed disabled:opacity-50',
          width
        )}
      />
    </div>
  );
}
