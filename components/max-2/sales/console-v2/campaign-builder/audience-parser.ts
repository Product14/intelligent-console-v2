/**
 * Mock audience parser — turns natural-language audience descriptions into a
 * structured tree of INCLUDE/EXCLUDE groups, each with AND/OR conditions.
 *
 * Real version would call an LLM. This deterministic parser hits enough
 * common phrasings to feel useful, and the UI lets users edit anything
 * the parser missed.
 */

export type FilterMode = "include" | "exclude";
export type FilterOp = "AND" | "OR";

export interface FilterCondition {
  id: string;
  field: string;
  op: string;
  value: string;
  /** Pretty single-line label for display. */
  label: string;
}

export interface FilterGroup {
  id: string;
  mode: FilterMode;
  op: FilterOp;
  conditions: FilterCondition[];
}

export interface ParsedAudience {
  groups: FilterGroup[];
  estimatedCount: number;
}

interface Rule {
  match: RegExp;
  build: (m: RegExpMatchArray) => Omit<FilterCondition, "id">;
}

/** Order matters — more specific rules first. */
const RULES: Rule[] = [
  // Already booked / excluded states
  {
    match: /(already|previously)\s+(booked|scheduled|made an? appointment|set an? appointment)/i,
    build: () => ({ field: "appointment_status", op: "=", value: "booked", label: "Already booked appointment" }),
  },
  {
    match: /(no[- ]show|didn'?t show|missed appointment)/i,
    build: () => ({ field: "appointment_status", op: "=", value: "no_show", label: "Appointment no-show" }),
  },
  // Recency — numeric "last N days/weeks/months"
  {
    match: /last\s+(\d+)\s*day/i,
    build: (m) => ({ field: "last_contact_days", op: "≤", value: m[1], label: `Last contact ≤ ${m[1]} days` }),
  },
  {
    match: /(\d+)\s*days?\s+ago/i,
    build: (m) => ({ field: "last_contact_days", op: "≤", value: m[1], label: `Last contact ≤ ${m[1]} days` }),
  },
  {
    match: /past\s+(?:week|7\s*days)/i,
    build: () => ({ field: "last_contact_days", op: "≤", value: "7", label: "Last contact ≤ 7 days" }),
  },
  {
    match: /past\s+month|last\s+30\s*days/i,
    build: () => ({ field: "last_contact_days", op: "≤", value: "30", label: "Last contact ≤ 30 days" }),
  },
  // Vehicle interest
  {
    match: /\b(ev|electric|hybrid)\b/i,
    build: () => ({ field: "vehicle_interest", op: "in", value: "ev_hybrid", label: "Vehicle interest = EV / Hybrid" }),
  },
  {
    match: /\b(suv|crossover)\b/i,
    build: () => ({ field: "vehicle_interest", op: "in", value: "suv", label: "Vehicle interest = SUV" }),
  },
  {
    match: /\b(truck|pickup|f-?150|silverado|ram)\b/i,
    build: () => ({ field: "vehicle_interest", op: "in", value: "truck", label: "Vehicle interest = Truck" }),
  },
  {
    match: /\b(sedan|coupe)\b/i,
    build: () => ({ field: "vehicle_interest", op: "in", value: "sedan", label: "Vehicle interest = Sedan" }),
  },
  // Intent signals
  {
    match: /trade[- ]?in/i,
    build: () => ({ field: "asked_about", op: "in", value: "trade_in", label: "Asked about trade-in" }),
  },
  {
    match: /financ(?:e|ing)|loan|apr|interest rate/i,
    build: () => ({ field: "asked_about", op: "in", value: "financing", label: "Asked about financing" }),
  },
  {
    match: /(discount|promo|deal|sale|incentive|rebate)/i,
    build: () => ({ field: "asked_about", op: "in", value: "discount", label: "Asked about discount / incentive" }),
  },
  {
    match: /test[- ]?drive/i,
    build: () => ({ field: "asked_about", op: "in", value: "test_drive", label: "Asked about test drive" }),
  },
  // Engagement state
  {
    match: /\b(dormant|cold|inactive|gone quiet|no activity)\b/i,
    build: () => ({ field: "last_contact_days", op: "≥", value: "30", label: "Last contact ≥ 30 days" }),
  },
  {
    match: /\bhot\b/i,
    build: () => ({ field: "engagement_score", op: "=", value: "hot", label: "Engagement = Hot" }),
  },
  {
    match: /(opened|clicked).+(email|link)/i,
    build: () => ({ field: "email_engagement", op: "=", value: "opened", label: "Opened last email" }),
  },
  {
    match: /(visited|came to).+(website|site)/i,
    build: () => ({ field: "website_visit_days", op: "≤", value: "14", label: "Website visit ≤ 14 days" }),
  },
  // Lease / service / recall
  {
    match: /lease\s+(end|expir|over)/i,
    build: () => ({ field: "lease_ends_days", op: "≤", value: "90", label: "Lease ends ≤ 90 days" }),
  },
  {
    match: /(service\s+due|maintenance\s+due|overdue\s+service)/i,
    build: () => ({ field: "service_due_days", op: "≤", value: "0", label: "Service is due / overdue" }),
  },
  {
    match: /recall/i,
    build: () => ({ field: "is_recall_eligible", op: "=", value: "true", label: "Recall eligible" }),
  },
  // Lead source
  {
    match: /facebook|fb/i,
    build: () => ({ field: "lead_source", op: "in", value: "facebook", label: "Lead source = Facebook" }),
  },
  {
    match: /google\s+(ads?|leads?)?/i,
    build: () => ({ field: "lead_source", op: "in", value: "google", label: "Lead source = Google" }),
  },
  {
    match: /\b(walk[- ]?in)\b/i,
    build: () => ({ field: "lead_source", op: "in", value: "walk_in", label: "Lead source = Walk-in" }),
  },
  {
    match: /\b(referral)\b/i,
    build: () => ({ field: "lead_source", op: "in", value: "referral", label: "Lead source = Referral" }),
  },
  // Geography
  {
    match: /within\s+(\d+)\s*mi/i,
    build: (m) => ({ field: "location_miles", op: "≤", value: m[1], label: `Within ${m[1]} miles` }),
  },
  {
    match: /\blocal\b/i,
    build: () => ({ field: "location_miles", op: "≤", value: "25", label: "Within 25 miles" }),
  },
  // Buyer profile
  {
    match: /first[- ]time(?:\s+buyer)?/i,
    build: () => ({ field: "buyer_type", op: "=", value: "first_time", label: "First-time buyer" }),
  },
  {
    match: /returning|repeat|previous customer/i,
    build: () => ({ field: "buyer_type", op: "=", value: "returning", label: "Returning customer" }),
  },
  {
    match: /\b(fleet|corporate|business)\b/i,
    build: () => ({ field: "buyer_type", op: "=", value: "fleet", label: "Fleet / corporate" }),
  },
  // Budget
  {
    match: /\b(luxury|premium|high[- ]end)\b/i,
    build: () => ({ field: "price_range", op: "≥", value: "60000", label: "Budget ≥ $60k" }),
  },
  {
    match: /budget under\s*\$?(\d+)\s*k?/i,
    build: (m) => ({ field: "price_range", op: "≤", value: `${m[1]}000`, label: `Budget ≤ $${m[1]}k` }),
  },
];

const EXCLUDE_MARKERS = /\b(but not|except|excluding|excluded?|minus|without|exclude)\b/i;
const OR_MARKERS = /\b(or|either)\b/i;

function genId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Parse a natural-language audience description.
 * Returns at most one INCLUDE group and one EXCLUDE group in v1.
 */
export function parseAudiencePrompt(input: string): ParsedAudience {
  if (!input.trim()) {
    return { groups: [], estimatedCount: 0 };
  }

  // Split into include / exclude halves based on exclusion markers
  const excludeMatch = input.match(EXCLUDE_MARKERS);
  let includeText: string;
  let excludeText = "";
  if (excludeMatch && excludeMatch.index !== undefined) {
    includeText = input.slice(0, excludeMatch.index);
    excludeText = input.slice(excludeMatch.index + excludeMatch[0].length);
  } else {
    includeText = input;
  }

  // Decide if the include side is AND or OR (look for an OR marker before exclude)
  const includeOp: FilterOp = OR_MARKERS.test(includeText) ? "OR" : "AND";
  const excludeOp: FilterOp = OR_MARKERS.test(excludeText) ? "OR" : "AND";

  function extract(text: string): FilterCondition[] {
    const seen = new Set<string>();
    const out: FilterCondition[] = [];
    for (const rule of RULES) {
      const m = text.match(rule.match);
      if (!m) continue;
      const built = rule.build(m);
      const key = `${built.field}|${built.op}|${built.value}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ id: genId("c"), ...built });
    }
    return out;
  }

  const includeConds = extract(includeText);
  const excludeConds = extract(excludeText);

  const groups: FilterGroup[] = [];
  if (includeConds.length > 0) {
    groups.push({ id: genId("g"), mode: "include", op: includeOp, conditions: includeConds });
  }
  if (excludeConds.length > 0) {
    groups.push({ id: genId("g"), mode: "exclude", op: excludeOp, conditions: excludeConds });
  }

  // If parser found nothing on the include side, seed with a catch-all so the
  // user has something to edit instead of an empty tree. Uses a real library
  // field (do_not_contact = false) so the condition resolves and isn't dropped.
  if (groups.length === 0) {
    groups.push({
      id: genId("g"),
      mode: "include",
      op: "AND",
      conditions: [
        { id: genId("c"), field: "do_not_contact", op: "=", value: "false", label: "All contactable leads" },
      ],
    });
  }

  return { groups, estimatedCount: estimateCount(groups) };
}

/**
 * Deterministic mock count: 950 leads base, each include condition narrows by
 * 35-65%, each exclude removes 5-15%. Same input -> same number.
 */
export function estimateCount(groups: FilterGroup[]): number {
  let n = 950;
  for (const g of groups) {
    for (const c of g.conditions) {
      const seed = hashSeed(`${c.field}|${c.value}`);
      const factor = g.mode === "include"
        ? 0.35 + (seed % 30) / 100   // 0.35 - 0.64
        : -(0.05 + (seed % 10) / 100); // -0.05 - -0.14
      if (g.mode === "include") {
        n = Math.round(n * factor + 30); // floor to keep counts realistic
      } else {
        n = Math.round(n * (1 + factor));
      }
    }
  }
  return Math.max(8, n);
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Field display metadata for the editor UI. Keyed by FIELD_LIBRARY ids. */
export const FIELD_META: Record<string, { label: string; icon: string }> = {
  vehicle_interest: { label: "Vehicle Interest", icon: "🚗" },
  asked_about: { label: "Asked About", icon: "💬" },
  lead_source: { label: "Lead Source", icon: "📥" },
  last_contact_days: { label: "Last Contact", icon: "📅" },
  website_visit_days: { label: "Website Visit", icon: "🌐" },
  email_engagement: { label: "Email Engagement", icon: "✉️" },
  engagement_score: { label: "Engagement", icon: "🔥" },
  appointment_status: { label: "Appointment", icon: "📆" },
  lease_ends_days: { label: "Lease Ends", icon: "📆" },
  service_due_days: { label: "Service Due", icon: "🛠️" },
  is_recall_eligible: { label: "Recall Eligible", icon: "🔄" },
  buyer_type: { label: "Buyer Type", icon: "🧑" },
  price_range: { label: "Budget", icon: "💰" },
  location_miles: { label: "Location", icon: "📍" },
  do_not_contact: { label: "Do-Not-Contact", icon: "🚫" },
};

export const EXAMPLE_AUDIENCE_PROMPTS: { label: string; prompt: string }[] = [
  {
    label: "EV interest, last 30 days",
    prompt: "Leads who asked about EVs in the last 30 days, excluding those who already booked an appointment",
  },
  {
    label: "Dormant trade-in leads",
    prompt: "Dormant leads who previously asked about trade-in, within 25 miles",
  },
  {
    label: "Lease ending + returning",
    prompt: "Returning customers whose lease ends in the next 90 days",
  },
  {
    label: "Service overdue",
    prompt: "Service due customers who haven't been contacted in the past 30 days",
  },
];
