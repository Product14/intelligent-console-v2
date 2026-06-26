// Department-level mandatory-field rules. Centralised here so:
//   - the form can disable optional fields until mandatory ones are filled,
//   - the save layer can drop incomplete departments from the POST payload,
//   - tightening the contract is a one-line change in MANDATORY_FIELDS.
//
// If the backend later makes email required, add it here and every gated
// surface picks it up automatically — no form-wide refactor.

import type { DepartmentConfig } from '@/services/settings/types';

interface MandatoryField {
  /** DepartmentConfig key whose presence is required. */
  key: keyof DepartmentConfig;
  /** Human-readable label used in tooltip / save-block messages. */
  label: string;
  /** When true, the rule only applies to custom (operator-added) depts.
   *  Standard depts (sales/service/parts/finance) have an auto-set name. */
  appliesToCustomOnly?: boolean;
}

export const MANDATORY_DEPT_FIELDS: ReadonlyArray<MandatoryField> = [
  { key: 'name', label: 'department name', appliesToCustomOnly: true },
  { key: 'phone', label: 'phone number' },
];

/** Returns the human-readable labels of mandatory fields the dept is missing.
 *  Empty array = ready for save and for editing optional fields. */
export function getMissingMandatoryFields(dept: DepartmentConfig): string[] {
  const missing: string[] = [];
  for (const f of MANDATORY_DEPT_FIELDS) {
    if (f.appliesToCustomOnly && !dept.isCustom) continue;
    const value = dept[f.key];
    const filled = typeof value === 'string' ? value.trim().length > 0 : !!value;
    if (!filled) missing.push(f.label);
  }
  return missing;
}

export function isDeptReady(dept: DepartmentConfig): boolean {
  return getMissingMandatoryFields(dept).length === 0;
}

/** Sentence for the hover tooltip on gated controls. */
export function buildGatingMessage(missing: string[]): string {
  if (missing.length === 0) return '';
  const joined = joinNatural(missing);
  return `Fill the ${joined} before editing other fields.`;
}

function joinNatural(items: string[]): string {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}
