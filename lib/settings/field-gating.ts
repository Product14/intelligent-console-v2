// Field gating — encodes "VINI - Configurations & Onboarding.xlsx".
// Rule: render a field in the wizard only when keepInOnboarding === true.
// Mandatory + no safe default => required; otherwise optional with a silent default.
// Skipped fields still exist in post-onboarding settings (not modeled here).

export type ConfigBucket =
  | 'rooftop'
  | 'department'
  | 'holidays'
  | 'users'
  | 'agent-profile'
  | 'speed-to-lead'
  | 'service'
  | 'chatbot';

export interface FieldGate {
  id: string;
  bucket: ConfigBucket;
  label: string;
  mandatory: boolean;
  hasDefault: boolean;
  keepInOnboarding: boolean;
  /** Silent default applied when the field is skipped in onboarding. */
  default?: unknown;
  /** Prefilled via autofill/scrape, shown for confirmation. */
  autofill?: boolean;
  notes?: string;
}

export const FIELD_GATES: FieldGate[] = [
  // --- Rooftop Details ---
  { id: 'rooftopName', bucket: 'rooftop', label: 'Rooftop Name', mandatory: true, hasDefault: false, keepInOnboarding: true },
  { id: 'websiteUrl', bucket: 'rooftop', label: 'Website URL', mandatory: true, hasDefault: false, keepInOnboarding: true },
  { id: 'rooftopAddress', bucket: 'rooftop', label: 'Rooftop Address', mandatory: true, hasDefault: false, keepInOnboarding: true, autofill: true },
  { id: 'region', bucket: 'rooftop', label: 'Region', mandatory: false, hasDefault: false, keepInOnboarding: false, autofill: true, notes: 'Automatic' },
  { id: 'timezone', bucket: 'rooftop', label: 'Timezone', mandatory: true, hasDefault: false, keepInOnboarding: true, autofill: true, notes: 'Automatic' },
  { id: 'websiteListingUrl', bucket: 'rooftop', label: 'Website Listing URL', mandatory: false, hasDefault: false, keepInOnboarding: false },
  { id: 'dealsIn', bucket: 'rooftop', label: 'Deals in — New/Pre-Owned', mandatory: false, hasDefault: true, keepInOnboarding: false, default: { new: true, preOwned: true } },
  { id: 'ein', bucket: 'rooftop', label: 'EIN', mandatory: false, hasDefault: false, keepInOnboarding: true },
  { id: 'areaCode', bucket: 'rooftop', label: 'Area Code', mandatory: false, hasDefault: false, keepInOnboarding: true },
  { id: 'authorizedReps', bucket: 'rooftop', label: 'Authorized Representatives', mandatory: false, hasDefault: false, keepInOnboarding: true },

  // --- Department Details ---
  { id: 'deptName', bucket: 'department', label: 'Name', mandatory: true, hasDefault: false, keepInOnboarding: true, autofill: true },
  { id: 'deptEmail', bucket: 'department', label: 'Email', mandatory: false, hasDefault: false, keepInOnboarding: true },
  { id: 'deptPhone', bucket: 'department', label: 'Phone', mandatory: true, hasDefault: false, keepInOnboarding: true, autofill: true },
  { id: 'deptAddress', bucket: 'department', label: 'Address', mandatory: false, hasDefault: false, keepInOnboarding: true, autofill: true },
  { id: 'shiftTimings', bucket: 'department', label: 'Shift timings with exceptions', mandatory: true, hasDefault: false, keepInOnboarding: true, autofill: true },
  { id: 'isIvr', bucket: 'department', label: 'is IVR Phone number', mandatory: false, hasDefault: false, keepInOnboarding: false },

  // --- Holidays ---
  { id: 'holidays', bucket: 'holidays', label: 'Holidays (Rooftop / Dept / Individual)', mandatory: false, hasDefault: true, keepInOnboarding: true, default: [] },

  // --- Users / Employee Directory & Routing ---
  // Sheet marks keep=No, but the model + Figma include it. Included as OPTIONAL pending confirmation.
  { id: 'usersDirectory', bucket: 'users', label: 'Users, Employee Directory & Routing', mandatory: false, hasDefault: false, keepInOnboarding: true, notes: 'Sheet=No; flagged for confirmation — included optional' },

  // --- Agent Profile (all have safe defaults but are kept = prefilled & editable) ---
  { id: 'agentName', bucket: 'agent-profile', label: 'Name', mandatory: true, hasDefault: true, keepInOnboarding: true },
  { id: 'agentGender', bucket: 'agent-profile', label: 'Gender', mandatory: true, hasDefault: true, keepInOnboarding: true },
  { id: 'agentLanguages', bucket: 'agent-profile', label: 'Spoken Languages', mandatory: true, hasDefault: true, keepInOnboarding: true },
  { id: 'agentVoice', bucket: 'agent-profile', label: 'Voice', mandatory: true, hasDefault: true, keepInOnboarding: true },
  { id: 'agentAvatar', bucket: 'agent-profile', label: 'Avatar', mandatory: true, hasDefault: true, keepInOnboarding: true },

  // --- Sales Speed to Lead ---
  { id: 'stlEnabled', bucket: 'speed-to-lead', label: 'Enable/disable', mandatory: false, hasDefault: true, keepInOnboarding: true, default: true },
  { id: 'leadsToPick', bucket: 'speed-to-lead', label: 'Leads to pick', mandatory: true, hasDefault: false, keepInOnboarding: true },
  { id: 'stlAdvanced', bucket: 'speed-to-lead', label: 'Advanced (Nudge, Follow-up sequence)', mandatory: false, hasDefault: true, keepInOnboarding: false, default: { nudge: 'default', followUp: 'default' } },

  // --- Service Agent ---
  { id: 'loanerVehicle', bucket: 'service', label: 'Loaner Vehicle', mandatory: true, hasDefault: false, keepInOnboarding: true },
  { id: 'pickupDrop', bucket: 'service', label: 'Pickup & Drop', mandatory: true, hasDefault: false, keepInOnboarding: true },
  { id: 'roadside', bucket: 'service', label: 'Roadside Assistance', mandatory: true, hasDefault: false, keepInOnboarding: true },

  // --- Chatbot (only enable/disable asked; rest defaulted) ---
  { id: 'chatbotEnabled', bucket: 'chatbot', label: 'Enable/Disable', mandatory: true, hasDefault: false, keepInOnboarding: true },
  { id: 'chatbotEntryPoint', bucket: 'chatbot', label: 'Entry Point', mandatory: false, hasDefault: true, keepInOnboarding: false, default: 'default' },
  { id: 'chatbotState', bucket: 'chatbot', label: 'Chat State (Pinned vs Floating)', mandatory: false, hasDefault: true, keepInOnboarding: false, default: 'floating' },
  { id: 'chatbotTheme', bucket: 'chatbot', label: 'Theme', mandatory: false, hasDefault: true, keepInOnboarding: false, default: 'system' },
  { id: 'chatbotAgentsEligible', bucket: 'chatbot', label: 'Agents eligible', mandatory: false, hasDefault: true, keepInOnboarding: false, default: 'both' },
  { id: 'chatbotPages', bucket: 'chatbot', label: 'Pages to show/hide', mandatory: false, hasDefault: true, keepInOnboarding: false, default: 'all' },
  { id: 'chatbotTalkWithoutPhone', bucket: 'chatbot', label: 'Talk without phone number', mandatory: false, hasDefault: true, keepInOnboarding: false, default: true },
];

const BY_ID = new Map(FIELD_GATES.map((g) => [g.id, g]));

export function gate(id: string): FieldGate | undefined {
  return BY_ID.get(id);
}

/** Is this field shown during onboarding? */
export function isRendered(id: string): boolean {
  return !!BY_ID.get(id)?.keepInOnboarding;
}

/** Fields rendered in onboarding for a given bucket. */
export function renderedGates(bucket: ConfigBucket): FieldGate[] {
  return FIELD_GATES.filter((g) => g.bucket === bucket && g.keepInOnboarding);
}

/** Defaults to silently apply for skipped (not-kept) fields in a bucket. */
export function silentDefaults(bucket: ConfigBucket): Record<string, unknown> {
  return FIELD_GATES.filter(
    (g) => g.bucket === bucket && !g.keepInOnboarding && g.hasDefault
  ).reduce<Record<string, unknown>>((acc, g) => {
    acc[g.id] = g.default;
    return acc;
  }, {});
}
