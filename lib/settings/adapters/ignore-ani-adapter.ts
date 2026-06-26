// Adapter between the agent-config wire shape and the UI's TriggerPhoneNumber
// rows for the "ignore ANI" feature.
//
// Wire shape: `entityConfig.ignoreAniNumbers: string[]` — flat E.164 strings
// like "+14143572100". The UI splits them into a country dial code + digits
// so the operator can pick a country and edit the number separately.

import { PHONE_COUNTRY_CODES } from '@/components/settings/ui/phone-number-field';
import { validatePhone } from '@/lib/settings/field-validation';
import type {
  AgentConfigResponse,
  AgentConfigSavePayload,
} from '@/services/settings/agent-config.service';
import type { TriggerPhoneNumber } from '@/types/settings/vini-general-config';

// Longest-prefix-first so "+971" matches before "+9" (and "+1" doesn't
// accidentally swallow a "+91" number).
const DIAL_CODES_BY_LENGTH = [...PHONE_COUNTRY_CODES]
  .map((c) => c.code)
  .sort((a, b) => b.length - a.length);

function makeId(): string {
  return `ani-${
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  }`;
}

function splitE164(raw: string): { countryCode: string; phone: string } {
  const trimmed = (raw ?? '').trim();
  if (!trimmed) return { countryCode: '+1', phone: '' };
  if (!trimmed.startsWith('+')) {
    // No country code → keep digits as-is, default to +1.
    return { countryCode: '+1', phone: trimmed.replace(/\D/g, '') };
  }
  const digits = trimmed.replace(/\D/g, '');
  for (const code of DIAL_CODES_BY_LENGTH) {
    const codeDigits = code.replace('+', '');
    if (digits.startsWith(codeDigits)) {
      return { countryCode: code, phone: digits.slice(codeDigits.length) };
    }
  }
  // Unknown dial code — surface the whole thing as a "+1" number so the row
  // is at least editable; the operator can switch country if needed.
  return { countryCode: '+1', phone: digits };
}

export function parseIgnoreAniNumbers(
  numbers: string[] | undefined | null,
): TriggerPhoneNumber[] {
  if (!Array.isArray(numbers)) return [];
  return numbers
    .filter((n): n is string => typeof n === 'string' && n.trim() !== '')
    .map((raw) => ({ id: makeId(), ...splitE164(raw) }));
}

export function serializeIgnoreAniNumbers(
  values: TriggerPhoneNumber[],
): string[] {
  // Drop empty rows AND rows that fail libphonenumber-js validation so the
  // backend never sees a partial / malformed number. Inline UI errors already
  // tell the user which row is bad — save just won't include it.
  return values
    .filter((row) => row.phone.trim() !== '')
    .filter((row) => validatePhone(row.countryCode, row.phone) === null)
    .map((row) => `${row.countryCode}${row.phone.replace(/\D/g, '')}`);
}

export function extractIgnoreAniFromAgentConfig(
  resp: AgentConfigResponse | null | undefined,
): TriggerPhoneNumber[] {
  return parseIgnoreAniNumbers(resp?.entityConfig?.ignoreAniNumbers);
}

export function buildAgentConfigIgnoreAniPayload(args: {
  enterpriseId: string;
  teamId: string;
  numbers: TriggerPhoneNumber[];
}): AgentConfigSavePayload {
  return {
    enterpriseId: args.enterpriseId,
    teamId: args.teamId,
    entityConfig: {
      ignoreAniNumbers: serializeIgnoreAniNumbers(args.numbers),
    },
  };
}
