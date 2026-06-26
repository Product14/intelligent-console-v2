// Format validators for the dept contact row. Both return a human-readable
// error message when the value is filled-but-invalid, and `null` when it's
// either empty (handled by the mandatory-field gate elsewhere) or valid.
//
// Phone validation uses libphonenumber-js so per-country rules (digit count,
// number ranges, mobile vs landline) match reality instead of a hand-rolled
// digit-count heuristic.

import { isValidPhoneNumber, validatePhoneNumberLength } from 'libphonenumber-js';
import type { DepartmentConfig } from '@/services/settings/types';

/** Strip every non-digit so user-entered formatting (spaces, parens, hyphens,
 *  periods) doesn't trip the validator. */
function digitsOnly(input: string): string {
  return input.replace(/\D/g, '');
}

/** Human-readable hints per country code. Lets us tell the user
 *  "+1 numbers need 10 digits" instead of a flat "not a valid number". */
const PHONE_COUNTRY_HINTS: Record<string, { label: string; digits: string }> = {
  '+1': { label: 'US/Canada', digits: '10 digits' },
  '+52': { label: 'Mexico', digits: '10 digits' },
  '+44': { label: 'UK', digits: '10 digits' },
  '+91': { label: 'India', digits: '10 digits' },
  '+61': { label: 'Australia', digits: '9 digits' },
  '+971': { label: 'UAE', digits: '9 digits' },
  '+49': { label: 'Germany', digits: '7–11 digits' },
  '+33': { label: 'France', digits: '9 digits' },
  '+81': { label: 'Japan', digits: '9 or 10 digits' },
  '+65': { label: 'Singapore', digits: '8 digits' },
};

export function validatePhone(
  countryCode: string,
  phone: string
): string | null {
  const trimmed = phone.trim();
  if (!trimmed) return null;
  const digits = digitsOnly(trimmed);
  if (!digits) return 'Enter digits only.';

  const full = `${countryCode}${digits}`;
  const hint = PHONE_COUNTRY_HINTS[countryCode];
  const label = hint?.label ?? countryCode;
  const expected = hint?.digits;
  const expectedSuffix = expected ? ` — ${label} numbers need ${expected}.` : '.';

  // libphonenumber returns specific length reasons; surface them so the user
  // knows exactly what's wrong instead of a generic rejection.
  const lengthIssue = validatePhoneNumberLength(full);
  if (lengthIssue === 'TOO_SHORT') return `Phone number is too short${expectedSuffix}`;
  if (lengthIssue === 'TOO_LONG') return `Phone number is too long${expectedSuffix}`;
  if (lengthIssue === 'INVALID_LENGTH') return `Phone number length is invalid${expectedSuffix}`;
  if (lengthIssue === 'NOT_A_NUMBER') return 'Enter digits only.';
  if (lengthIssue === 'INVALID_COUNTRY') return `Unknown country code ${countryCode}.`;

  // Length checked out, so the issue is in the digits themselves — usually
  // an area code or prefix that doesn't exist in the country's numbering
  // plan (e.g. US area codes can't start with 0 or 1). Don't repeat the
  // digit-count hint here — the user already entered the right length and
  // that suffix made the message misleading.
  if (!isValidPhoneNumber(full)) {
    return `Not a valid ${label} phone number — check the area code.`;
  }
  return null;
}

// Standard form-validation regex — not RFC-5321 compliant (that's a 7000-char
// regex no one should ship) but rejects every obviously-bad email a user
// might mistype.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string | undefined): string | null {
  if (!email || !email.trim()) return null;
  if (!EMAIL_REGEX.test(email.trim())) {
    return 'Enter a valid email address.';
  }
  return null;
}

/** Returns true when the dept has no filled-but-invalid contact fields.
 *  Empty values pass — they're handled by the mandatory-field gate. */
export function hasValidContactFormat(dept: DepartmentConfig): boolean {
  return (
    validatePhone(dept.countryCode, dept.phone) === null &&
    validateEmail(dept.email) === null
  );
}
