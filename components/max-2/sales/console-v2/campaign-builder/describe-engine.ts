/**
 * Describe-flow conversation engine — pure functions only.
 * Inspired by Agent-Workflow's /setup-agent/describe but slimmed for
 * the in-console Sales Campaigns experience.
 */

export type Phase = "intro" | "analyzing" | "questions" | "review" | "done";
export type Category = "sales_ob" | "service_ob";
export type SubUseCase =
  | "equity_mining"
  | "lease_end"
  | "save_the_deal"
  | "aged_lead"
  | "test_drive_followup"
  | "declined_services"
  | "service_recall"
  | "service_reminder"
  | "generic";

export interface PRDState {
  title?: string;
  category?: Category;
  subUseCase?: SubUseCase;
  summary?: string;

  /* 1 · Audience */
  audienceSize?: string;
  audienceSource?: string;
  /** When the audience comes from a saved audience, these are set. */
  savedAudienceId?: string;
  savedAudienceName?: string;
  savedAudienceCount?: number;

  /* 2 · Trigger */
  triggerEvent?: string;
  triggerLatency?: string;

  /* 3 · Cadence */
  cadence?: string;

  /* 4 · Channels + message */
  channels?: string[];
  coreMessage?: string;

  /* 5 · Conversation skills — what the agent can do once connected */
  conversationSkills?: string[];
  financingOffer?: string;
  managerNotify?: string;

  /* 6 · Compliance */
  restrictedTopics?: string[];
  carefulTopics?: string[];
  quietHours?: string;

  /* 7 · Exit conditions */
  exitConditions?: string[];

  /* 8 · Outcome / Attribution */
  primaryKPI?: string;
  attributionWindow?: string;

  /* CRM source — supports Audience (sales) or Trigger (service) */
  crmSource?: string;
  crmFieldMap?: Record<string, string>;
}

export type StarterGroup = "sales" | "service" | "lifecycle";

export interface StarterDefinition {
  id: string;
  label: string;
  hint: string;
  group: StarterGroup;
  text: string;
}

export const STARTER_LIBRARY: StarterDefinition[] = [
  /* Sales Outbound */
  {
    id: "equity_mining",
    label: "Equity Mining",
    hint: "Sales OB · Customers with positive equity",
    group: "sales",
    text: "Mine equity from our CRM. Pull customers whose current vehicle has positive equity (loan balance < market value) and offer them an upgrade. Frame it as 'you have a winning lottery ticket, here's how to redeem it.' Voice + SMS, 5 touches over 21 days.",
  },
  {
    id: "lease_end",
    label: "Lease End",
    hint: "Sales OB · 60–90 days from maturity",
    group: "sales",
    text: "Outbound to customers whose lease ends in the next 60–90 days. Offer three paths: buy out, trade into something new, or walk away. Lead with the residual-vs-market gap if there's positive equity. Goal: book an in-person consult. SMS + voice, 5 touches over 21 days.",
  },
  {
    id: "save_the_deal",
    label: "Save the Deal",
    hint: "Sales OB · Proposals stuck 10+ days",
    group: "sales",
    text: "Recovery campaign for customers who got a proposal but didn't buy. Cutoff: proposals sitting 10+ days without a follow-up touch. Surface what's blocking (price, financing, timing). Offer a 24-hour decision window with a small manager-approved incentive if they signal intent. 3 touches over 7 days.",
  },
  {
    id: "aged_lead",
    label: "Aged Lead Re-Activation",
    hint: "Sales OB · 90+ day cold leads",
    group: "sales",
    text: "Re-engage sales leads gone cold (no activity in 90+ days). Soft re-introduction, framing the dealership as helpful, not pushy. Reference the original vehicle they inquired about; if still in stock, mention it. If sold, offer the closest current match. SMS-first, voice on touch 3.",
  },
  {
    id: "test_drive_followup",
    label: "Test Drive Follow-Up",
    hint: "Sales OB · 48–72hrs post-drive",
    group: "sales",
    text: "Follow up with customers 48–72 hours after a test drive that didn't convert. Confirm interest, surface any objections, and offer to set up a second visit or a no-pressure consultation. 3 touches over 5 days, voice + SMS.",
  },

  /* Service Outbound */
  {
    id: "service_recall",
    label: "Service Recall",
    hint: "Service OB · Compliance-grade",
    group: "service",
    text: "Voice-only outreach for active safety recalls. Compliance-grade. State the recall in the first 10 seconds. Confirm registered owner before discussing details. Offer two specific service slots. DNC-exempt.",
  },
  {
    id: "declined_services",
    label: "Declined Service Recovery",
    hint: "Service OB · Re-engage declined work",
    group: "service",
    text: "Re-engage customers who declined a service recommendation in the past 60 days. Frame it as 'just checking back' — no pressure. Offer two appointment slots and mention any current service incentive. 2 touches over 10 days.",
  },
  {
    id: "service_reminder",
    label: "Service Reminder",
    hint: "Service OB · Due maintenance",
    group: "lifecycle",
    text: "Reminder waves for customers whose maintenance is due in the next 14 days. Reference the specific service. Offer two slots. Mention loaner-car availability if applicable. SMS + voice, single touch.",
  },
];

export const STARTER_TEXT_BY_ID: Record<string, string> = STARTER_LIBRARY.reduce(
  (acc, s) => ({ ...acc, [s.id]: s.text }),
  {}
);

export const INTRO_AGENT_TEXT =
  "I'm VINI. Tell me about the campaign you want to launch — or pick a starter below. Once you describe it, I'll detect the sub-use-case and ask the rest.";

/* ── Detection ───────────────────────────────────────────────────── */

const KEYWORDS: Record<SubUseCase, RegExp[]> = {
  equity_mining: [/\bequity\b/i, /winning lottery/i, /loan balance/i],
  lease_end: [/\blease\b.{0,40}(end|expir|matur)/i, /residual/i, /buy[- ]?out/i],
  save_the_deal: [/save the deal/i, /proposal/i, /stuck/i, /didn'?t close/i],
  aged_lead: [/aged lead/i, /cold lead/i, /90 days?/i, /re[- ]?engage/i, /gone cold/i],
  test_drive_followup: [/test drive/i, /post[- ]?drive/i],
  declined_services: [/declined service/i, /service recommendation/i],
  service_recall: [/recall/i, /safety/i, /dnc[- ]exempt/i],
  service_reminder: [/service reminder/i, /maintenance due/i, /oil change/i],
  generic: [],
};

export function detectCategory(text: string): { category: Category; subUseCase: SubUseCase } {
  for (const [sub, patterns] of Object.entries(KEYWORDS) as [SubUseCase, RegExp[]][]) {
    if (sub === "generic") continue;
    if (patterns.some((p) => p.test(text))) {
      const isService = sub === "service_recall" || sub === "declined_services";
      return { category: isService ? "service_ob" : "sales_ob", subUseCase: sub };
    }
  }
  // Fall back to sales generic
  return { category: "sales_ob", subUseCase: "generic" };
}

/* ── Question library ────────────────────────────────────────────── */

export interface ChipOption {
  label: string;
  value: string;
  hint?: string;
  custom?: { title: string; placeholder?: string; multiline?: boolean };
}

export type InputKind = "free_text" | "single_select" | "multi_select";

export interface AgentTurn {
  id: string;
  text: string;
  fieldKey: keyof PRDState | string;
  inputKind: InputKind;
  chips?: ChipOption[];
}

const COMMON_QUESTIONS: AgentTurn[] = [
  {
    id: "audience_size",
    text: "How large is the audience for this campaign?",
    fieldKey: "audienceSize",
    inputKind: "single_select",
    chips: [
      { label: "Small", hint: "< 500 leads", value: "< 500 leads" },
      { label: "Medium", hint: "500–2,500 leads", value: "500–2,500 leads" },
      { label: "Large", hint: "2,500–10,000 leads", value: "2,500–10,000 leads" },
      { label: "Custom", value: "custom_size", custom: { title: "Audience size", placeholder: "e.g. ~3,700 customers" } },
    ],
  },
  {
    id: "audience_source",
    text: "Where should I pull the audience from?",
    fieldKey: "audienceSource",
    inputKind: "single_select",
    chips: [
      { label: "DealerSocket", value: "DealerSocket" },
      { label: "Apollo / Reynolds", value: "Apollo" },
      { label: "VinSolutions", value: "VinSolutions" },
      { label: "eLeads", value: "eLeads" },
      { label: "CSV upload", value: "CSV upload" },
      { label: "Custom", value: "custom_source", custom: { title: "Audience source", placeholder: "e.g. our internal lead warehouse" } },
    ],
  },
  {
    id: "cadence",
    text: "What cadence do you want?",
    fieldKey: "cadence",
    inputKind: "single_select",
    chips: [
      { label: "Light", hint: "3 touches over 7 days", value: "3 touches over 7 days" },
      { label: "Standard", hint: "5 touches over 21 days", value: "5 touches over 21 days" },
      { label: "Heavy", hint: "7 touches over 30 days", value: "7 touches over 30 days" },
      { label: "Custom", value: "custom_cadence", custom: { title: "Custom cadence", placeholder: "e.g. 4 touches over 14 days" } },
    ],
  },
  {
    id: "channels",
    text: "Which channels should the agent use?",
    fieldKey: "channels",
    inputKind: "multi_select",
    chips: [
      { label: "Voice", value: "voice" },
      { label: "SMS", value: "sms" },
      { label: "Email", value: "email" },
    ],
  },
  {
    id: "core_message",
    text: "In one sentence, what's the core message the agent should land?",
    fieldKey: "coreMessage",
    inputKind: "free_text",
  },
  {
    id: "restricted_topics",
    text: "Anything the agent should NOT discuss on these calls?",
    fieldKey: "restrictedTopics",
    inputKind: "multi_select",
    chips: [
      { label: "Final price", value: "Final price" },
      { label: "APR / financing terms", value: "APR / financing terms" },
      { label: "Trade-in valuation", value: "Trade-in valuation" },
      { label: "Inventory promises", value: "Inventory promises" },
      { label: "Custom", value: "custom_topic", custom: { title: "Restricted topic", placeholder: "e.g. competitor pricing" } },
    ],
  },
  {
    id: "primary_kpi",
    text: "What's the headline KPI for this campaign?",
    fieldKey: "primaryKPI",
    inputKind: "single_select",
    chips: [
      { label: "Booked appointments", value: "Booked appointments" },
      { label: "Confirmed interest", value: "Confirmed interest" },
      { label: "Recovered deals", value: "Recovered deals" },
      { label: "Reactivated leads", value: "Reactivated leads" },
      { label: "Custom KPI", value: "custom_kpi", custom: { title: "Headline KPI", placeholder: "e.g. test drives booked" } },
    ],
  },
];

const SERVICE_RECALL_QUESTIONS: AgentTurn[] = [
  {
    id: "audience_size",
    text: "How many recall-eligible VINs are we calling?",
    fieldKey: "audienceSize",
    inputKind: "single_select",
    chips: [
      { label: "Small", hint: "< 250 VINs", value: "< 250 VINs" },
      { label: "Medium", hint: "250–1,000 VINs", value: "250–1,000 VINs" },
      { label: "Large", hint: "1,000+ VINs", value: "1,000+ VINs" },
      { label: "Custom", value: "custom_size", custom: { title: "Recall audience", placeholder: "e.g. 487 VINs" } },
    ],
  },
  {
    id: "cadence",
    text: "Recall campaigns are typically voice-only and single-touch. Confirm?",
    fieldKey: "cadence",
    inputKind: "single_select",
    chips: [
      { label: "Single touch", value: "1 touch · voice only" },
      { label: "Two-touch", hint: "Voice + voicemail follow-up", value: "2 touches over 5 days" },
    ],
  },
  {
    id: "primary_kpi",
    text: "What's the headline KPI?",
    fieldKey: "primaryKPI",
    inputKind: "single_select",
    chips: [
      { label: "Recall appointments booked", value: "Recall appointments booked" },
      { label: "Connected calls", value: "Connected calls" },
      { label: "VINs reached", value: "VINs reached" },
    ],
  },
];

export function getQuestions(sub?: SubUseCase, prd?: PRDState): AgentTurn[] {
  const all = sub === "service_recall" ? SERVICE_RECALL_QUESTIONS : COMMON_QUESTIONS;
  if (!prd) return all;
  // Skip questions whose fieldKey is already filled (e.g. when a saved audience
  // pre-attaches audienceSize + audienceSource).
  return all.filter((q) => {
    const key = q.fieldKey as keyof PRDState;
    const v = prd[key];
    if (Array.isArray(v)) return v.length === 0;
    if (typeof v === "number") return false; // a number means it's been set
    return !v || String(v).trim() === "";
  });
}

/* ── Progress + completion ───────────────────────────────────────── */

/** The six fields that drive progress and that the agent asks about when the
 *  prompt didn't already answer them. */
export const SCORED_FIELDS: (keyof PRDState)[] = [
  "audienceSize", "audienceSource", "cadence", "channels", "coreMessage", "primaryKPI",
];

export function progressPercent(prd: PRDState): number {
  let done = 0;
  for (const k of SCORED_FIELDS) {
    const v = prd[k];
    if (Array.isArray(v) ? v.length > 0 : v && String(v).trim().length > 0) done++;
  }
  return Math.round((done / SCORED_FIELDS.length) * 100);
}

export function isComplete(prd: PRDState): boolean {
  return progressPercent(prd) === 100;
}

export function missingFields(prd: PRDState): string[] {
  return SCORED_FIELDS.filter((k) => {
    const v = prd[k];
    return Array.isArray(v) ? v.length === 0 : !v || String(v).trim().length === 0;
  }).map(String);
}

/* ── Messages ────────────────────────────────────────────────────── */

export function analysisMessage(prd: PRDState): string {
  const sub = prd.subUseCase ?? "generic";
  const labels: Record<SubUseCase, string> = {
    equity_mining: "Equity Mining",
    lease_end: "Lease End",
    save_the_deal: "Save the Deal",
    aged_lead: "Aged Lead Re-Activation",
    test_drive_followup: "Test Drive Follow-Up",
    declined_services: "Declined Service Recovery",
    service_recall: "Service Recall",
    service_reminder: "Service Reminder",
    generic: "Custom outbound",
  };
  return `Got it. This looks like a **${labels[sub]}** campaign. I've started the brief on the right — let me ask a few questions to fill in the rest.`;
}

export function reviewMessage(prd: PRDState): string {
  if (isComplete(prd)) {
    return `Done — the brief is complete and ready to launch. Want to validate with a live test call, or save it for now?`;
  }
  const missing = missingFields(prd);
  return `Almost there. Still missing: ${missing.join(", ")}. Want to fill those in, or save what we have as a draft?`;
}

export const REVIEW_CHIPS: ChipOption[] = [
  { label: "Launch campaign", value: "launch" },
  { label: "Save as draft", value: "save" },
  { label: "Refine a section", value: "refine" },
  { label: "Start over", value: "restart" },
];

export function getSubUseCaseLabel(sub?: SubUseCase): string {
  switch (sub) {
    case "equity_mining": return "Equity Mining";
    case "lease_end": return "Lease End";
    case "save_the_deal": return "Save the Deal";
    case "aged_lead": return "Aged Lead Re-Activation";
    case "test_drive_followup": return "Test Drive Follow-Up";
    case "declined_services": return "Declined Service Recovery";
    case "service_recall": return "Service Recall";
    case "service_reminder": return "Service Reminder";
    default: return "Custom Outbound";
  }
}

export function deriveTitle(prd: PRDState, fallback: string = "AI Outbound Campaign"): string {
  if (prd.title) return prd.title;
  return getSubUseCaseLabel(prd.subUseCase) + " — " + new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/**
 * Full 8-section pre-fill per sub-use-case — mirrors the agent-workflow's
 * defaultsForSubUseCase. Picking a starter applies this immediately so the
 * live brief is populated, not "waiting on the chat".
 */
export function defaultsForSubUseCase(sub?: SubUseCase): Partial<PRDState> {
  const sharedCompliance: Partial<PRDState> = {
    quietHours: "Local TCPA hours (8am–9pm), respect customer timezone",
  };

  if (sub === "equity_mining") {
    return {
      ...sharedCompliance,
      audienceSize: "~2,400 customers with > $5K positive equity",
      audienceSource: "Apollo / Team Velocity",
      triggerEvent: "Daily Apollo sync — equity ≥ threshold",
      triggerLatency: "batched_daily",
      channels: ["voice", "sms"],
      cadence: "5 touches over 21 days",
      coreMessage: "You have a winning lottery ticket — we're just calling to let you know it's time to redeem it.",
      conversationSkills: [
        "Book an in-person appointment",
        "Verify the registered owner",
        "Warm-transfer to a trade specialist",
        "Send SMS recap of next steps",
      ],
      restrictedTopics: ["Exact loan payoff", "Specific APR on new loan", "Exact trade equity $"],
      exitConditions: ["Appointment booked", "Customer opts out (STOP)", "Max touches reached", "DNC list hit"],
      primaryKPI: "In-person appointments booked",
      attributionWindow: "30 days",
      crmSource: "Apollo",
    };
  }

  if (sub === "lease_end") {
    return {
      ...sharedCompliance,
      audienceSize: "Customers w/ lease maturing in 60–90 days",
      audienceSource: "DealerSocket — lease end date",
      triggerEvent: "Lease end date within 90 days",
      triggerLatency: "batched_daily",
      channels: ["voice", "sms"],
      cadence: "5 touches over 21 days",
      coreMessage: "Your lease is coming up — three paths: buy out, trade into something new, or walk away.",
      conversationSkills: [
        "Reference remaining lease term",
        "Offer buy-out / trade / walk options",
        "Book a no-pressure consult",
        "Send no-obligation buy-out quote by SMS",
      ],
      restrictedTopics: ["Final buy-out figure", "Specific lease penalties"],
      exitConditions: ["Buy-out quote sent", "Consult booked", "Customer opts out (STOP)", "Max touches reached"],
      primaryKPI: "Consultations booked",
      attributionWindow: "30 days",
      crmSource: "DealerSocket",
    };
  }

  if (sub === "save_the_deal") {
    return {
      ...sharedCompliance,
      audienceSize: "Stalled proposals from the last 30 days",
      audienceSource: "DealerSocket — proposal pipeline",
      triggerEvent: "Proposal sits 10+ days with no follow-up",
      triggerLatency: "batched_daily",
      channels: ["voice", "sms"],
      cadence: "3 touches over 7 days",
      coreMessage: "Following up on the proposal you saw — was it price, financing, or timing? We have flexibility.",
      conversationSkills: [
        "Capture blocking reason (price/financing/timing)",
        "Book a return visit",
        "Warm-transfer to the sales manager",
      ],
      restrictedTopics: ["Specific APR on new loan", "Exact trade equity $"],
      exitConditions: ["Customer books a return visit", "Customer says they bought elsewhere", "Customer opts out", "Max touches reached"],
      primaryKPI: "Re-opened deals",
      attributionWindow: "30 days",
      crmSource: "DealerSocket",
    };
  }

  if (sub === "aged_lead") {
    return {
      ...sharedCompliance,
      audienceSize: "~1,800 cold leads (90+ days inactive)",
      audienceSource: "CRM — last touch ≥ 90 days",
      triggerEvent: "Last activity > 90 days AND lead status = open",
      triggerLatency: "batched_daily",
      channels: ["sms", "voice"],
      cadence: "4 touches over 14 days",
      coreMessage: "Soft re-introduction — reference their original vehicle interest, frame the dealership as helpful, not pushy.",
      conversationSkills: [
        "Reference the original vehicle of interest",
        "Surface the closest current inventory match",
        "Book a no-pressure visit",
        "Re-qualify timeline",
      ],
      restrictedTopics: ["Final pricing", "APR"],
      exitConditions: ["Re-qualified to active", "Customer opts out (STOP)", "Max touches reached", "Marked dead"],
      primaryKPI: "Reactivated leads",
      attributionWindow: "45 days",
      crmSource: "VinSolutions",
    };
  }

  if (sub === "test_drive_followup") {
    return {
      ...sharedCompliance,
      audienceSize: "Test drives 48–72hrs ago, no purchase",
      audienceSource: "CRM — test drive log",
      triggerEvent: "Test drive completed 48hrs ago AND no deal opened",
      triggerLatency: "realtime",
      channels: ["voice", "sms"],
      cadence: "3 touches over 5 days",
      coreMessage: "Quick follow-up on the test drive — how did the vehicle feel, and is there anything we can answer?",
      conversationSkills: [
        "Confirm interest",
        "Surface objections",
        "Offer second visit / no-pressure consult",
        "Send vehicle photos by SMS",
      ],
      restrictedTopics: ["Final price", "APR"],
      exitConditions: ["Second visit booked", "Customer declines", "Customer opts out", "Max touches reached"],
      primaryKPI: "Second visits booked",
      attributionWindow: "14 days",
      crmSource: "DealerSocket",
    };
  }

  if (sub === "declined_services") {
    return {
      ...sharedCompliance,
      audienceSize: "~600 customers with deferred service in last 90 days",
      audienceSource: "Tekion — declined RO log",
      triggerEvent: "Service decline recorded",
      triggerLatency: "realtime",
      channels: ["sms", "voice"],
      cadence: "4 touches over 14 days",
      coreMessage: "We noticed you held off on the recommended service last visit — was it timing or cost? Sunbit financing is available if it helps.",
      conversationSkills: [
        "Capture decline reason",
        "Offer Sunbit financing (soft credit pull)",
        "Book a service appointment",
        "Warm-transfer to the advisor",
      ],
      financingOffer: "Sunbit",
      managerNotify: "Required outcome logged",
      carefulTopics: ["Safety urgency", "Specific pricing"],
      exitConditions: ["Appointment booked", "Customer opts out (STOP)", "Customer declines second time", "Manager paused"],
      primaryKPI: "Recovered RO $ amount",
      attributionWindow: "30 days",
      crmSource: "Tekion",
    };
  }

  if (sub === "service_recall") {
    return {
      ...sharedCompliance,
      audienceSize: "VINs flagged in active recall campaigns",
      audienceSource: "DMS + NHTSA recall feed",
      triggerEvent: "OEM recall feed match against DMS",
      triggerLatency: "realtime",
      channels: ["voice"],
      cadence: "1 touch — immediate only",
      coreMessage: "This is a safety recall on your vehicle — manufacturer-mandated. We'd like to book you in within two weeks, loaner cars are available.",
      conversationSkills: [
        "Verify the registered owner",
        "State the recall reference clearly",
        "Book a recall appointment",
        "Mention loaner-car availability",
      ],
      carefulTopics: ["Safety recall language", "OEM compliance disclosures"],
      restrictedTopics: ["Repair time beyond what the system provides", "Unrelated service items"],
      exitConditions: ["Recall appointment booked", "Customer opts out", "Repair completed elsewhere (logged)", "Window expired"],
      primaryKPI: "Recall appointments booked",
      attributionWindow: "60 days",
      crmSource: "Tekion",
    };
  }

  if (sub === "service_reminder") {
    return {
      ...sharedCompliance,
      audienceSize: "Customers w/ maintenance due in 14 days",
      audienceSource: "Tekion — service interval log",
      triggerEvent: "Maintenance interval reached (mileage / time)",
      triggerLatency: "batched_daily",
      channels: ["sms", "voice"],
      cadence: "2 touches over 7 days",
      coreMessage: "Quick reminder — your maintenance is due. Want me to book you a slot this week?",
      conversationSkills: [
        "Reference the specific service",
        "Offer two appointment slots",
        "Mention loaner availability",
        "Confirm vehicle make/model on file",
      ],
      restrictedTopics: ["Final service price"],
      exitConditions: ["Appointment booked", "Customer declines", "Customer opts out", "Max touches reached"],
      primaryKPI: "Service appointments booked",
      attributionWindow: "21 days",
      crmSource: "Tekion",
    };
  }

  return {
    ...sharedCompliance,
    audienceSize: "TBD — confirm once audience source is picked",
    audienceSource: "Generic CSV upload",
    triggerEvent: "Manual list upload",
    triggerLatency: "batched_daily",
    channels: ["voice", "sms"],
    cadence: "5 touches over 14 days",
    coreMessage: "Quick outreach about something we think will help.",
    conversationSkills: ["Book an appointment", "Warm-transfer to a human"],
    exitConditions: ["Outcome met", "Customer opts out (STOP)", "Max touches reached"],
    primaryKPI: "Appointments booked",
    attributionWindow: "30 days",
    crmSource: "Generic CSV upload",
  };
}

/* ── Field tiers (PRD §09 — Missing Data Handling) ─────────────────── */

export type FieldTier = "A" | "B" | "C";
export interface FieldTierMeta {
  /** A = required-to-fire (suppress), B = compliance gate (hard-block), C = enriches (degrade) */
  tier: FieldTier;
  label: string;
  ifMissing: string;
  /** Default safe fallback for tier C fields. */
  fallback?: string;
}

export const FIELD_TIERS: Record<string, FieldTierMeta> = {
  audienceSize: {
    tier: "A",
    label: "Audience size",
    ifMissing: "Suppress lead — agent has nobody to call",
  },
  audienceSource: {
    tier: "A",
    label: "Audience source",
    ifMissing: "Suppress lead — system can't resolve where to pull from",
  },
  triggerEvent: {
    tier: "A",
    label: "Trigger event",
    ifMissing: "Suppress — runtime has no entry condition",
  },
  channels: {
    tier: "A",
    label: "Channel choice",
    ifMissing: "Hard-block — agent has no way to reach the lead",
  },
  cadence: {
    tier: "A",
    label: "Cadence",
    ifMissing: "Suppress — runtime has no schedule",
  },
  quietHours: {
    tier: "B",
    label: "Quiet hours",
    ifMissing: "Hard-block this lead — TCPA risk",
  },
  restrictedTopics: {
    tier: "B",
    label: "Restricted topics",
    ifMissing: "Hard-block — compliance audit requires this",
  },
  coreMessage: {
    tier: "C",
    label: "Core message",
    ifMissing: "Degrade — agent uses a generic opener",
    fallback: "Hi {{firstName}}, quick follow-up about your recent interaction with us.",
  },
  conversationSkills: {
    tier: "C",
    label: "Conversation skills",
    ifMissing: "Degrade — agent can only book or warm-transfer, no advanced skills",
  },
  exitConditions: {
    tier: "C",
    label: "Exit conditions",
    ifMissing: "Degrade — uses default exits (booked / opt-out / max touches)",
  },
  primaryKPI: {
    tier: "C",
    label: "Primary KPI",
    ifMissing: "Degrade — defaults to appointments booked",
    fallback: "Appointments booked",
  },
  attributionWindow: {
    tier: "C",
    label: "Attribution window",
    ifMissing: "Degrade — defaults to 30 days",
    fallback: "30 days",
  },
  crmSource: {
    tier: "A",
    label: "CRM source",
    ifMissing: "Suppress — can't pull leads without a source",
  },
  financingOffer: {
    tier: "C",
    label: "Financing offer",
    ifMissing: "Degrade — agent drops the financing hook entirely",
  },
};

export interface MissingField {
  key: string;
  meta: FieldTierMeta;
}

/** Return the list of fields that are missing on the PRD, classified by tier. */
export function getMissingFieldsTiered(prd: PRDState): MissingField[] {
  const out: MissingField[] = [];
  for (const [key, meta] of Object.entries(FIELD_TIERS)) {
    const v = (prd as Record<string, unknown>)[key];
    const empty = Array.isArray(v) ? v.length === 0 : !v || (typeof v === "string" && v.trim() === "");
    if (empty) out.push({ key, meta });
  }
  return out;
}

/* ── Resolver actions (per-field resolution affordances) ───────────────
   The missing-data popover used to show the same three actions (CSV / CRM /
   Suppress) for every field — nonsensical for fields like Cadence or
   Channels. getResolverActions() returns a set tailored to the field's type:
   data-source fields get CSV/CRM, config fields get value pickers, the
   trigger gets entry-condition options, and free-text fields get a writer. */

export type ResolverActionKind =
  | "csv" // upload a CSV and map a column
  | "crm" // map a column from a connected CRM
  | "preset" // pick one value from a fixed set
  | "multi" // pick several values from a fixed set
  | "free_text" // type the value
  | "fallback" // apply a safe default and degrade gracefully
  | "suppress"; // drop affected leads / mark the field intentionally empty

export interface ResolverPreset {
  label: string;
  value: string;
  hint?: string;
}

export interface ResolverAction {
  kind: ResolverActionKind;
  title: string;
  hint: string;
  /** preset / multi options */
  presets?: ResolverPreset[];
  /** free_text placeholder */
  placeholder?: string;
  /** fallback target value (also reused as the suppress label override) */
  value?: string;
}

const DATA_SOURCE_ACTIONS: ResolverAction[] = [
  { kind: "csv", title: "Add from CSV", hint: "Upload a list with this column" },
  { kind: "crm", title: "Map a CRM column", hint: "Pull from DealerSocket / Tekion / Apollo…" },
  { kind: "suppress", title: "Suppress affected leads", hint: "Drop leads missing this field from the audience" },
];

/** The resolution actions to offer for a given field, tailored to its type. */
export function getResolverActions(fieldKey: string): ResolverAction[] {
  // CRM field-map columns are always data-source resolved.
  if (fieldKey.startsWith(CRM_FIELD_PREFIX)) return DATA_SOURCE_ACTIONS;

  switch (fieldKey) {
    case "audienceSize":
      return [
        {
          kind: "preset",
          title: "Pick a size band",
          hint: "Small · Medium · Large",
          presets: [
            { label: "Under 500", value: "< 500 leads", hint: "Small" },
            { label: "500 – 2,000", value: "500–2,000 leads", hint: "Medium" },
            { label: "2,000 – 5,000", value: "2,000–5,000 leads", hint: "Large" },
            { label: "5,000+", value: "5,000+ leads", hint: "Very large" },
          ],
        },
        { kind: "free_text", title: "Enter an exact size", hint: "Type the count yourself", placeholder: "e.g. ~2,400 customers > $5K equity" },
        { kind: "suppress", title: "Suppress — no audience", hint: "Agent has nobody to call" },
      ];
    case "audienceSource":
    case "crmSource":
      return [
        {
          kind: "preset",
          title: "Pick a source",
          hint: "Connected CRMs",
          presets: [
            { label: "DealerSocket", value: "DealerSocket" },
            { label: "Apollo / Team Velocity", value: "Apollo" },
            { label: "VinSolutions", value: "VinSolutions" },
            { label: "eLeads", value: "eLeads" },
            { label: "Tekion", value: "Tekion" },
          ],
        },
        { kind: "csv", title: "Upload a CSV instead", hint: "Bring your own list" },
        { kind: "suppress", title: "Suppress — no source", hint: "System can't resolve where to pull from" },
      ];
    case "triggerEvent":
      return [
        {
          kind: "preset",
          title: "Pick an entry condition",
          hint: "What makes a lead enter",
          presets: [
            { label: "Manual list upload", value: "Manual list upload", hint: "You load the list" },
            { label: "Daily CRM sync", value: "Daily CRM sync — rule-based entry", hint: "Batched daily" },
            { label: "Real-time event", value: "Real-time event trigger", hint: "Fires on the event" },
            { label: "Scheduled batch", value: "Scheduled batch", hint: "On a fixed schedule" },
          ],
        },
        { kind: "free_text", title: "Describe a custom condition", hint: "Write the rule yourself", placeholder: "e.g. Lease end date within 90 days" },
        { kind: "suppress", title: "Suppress — no entry condition", hint: "Runtime has nothing to fire on" },
      ];
    case "channels":
      return [
        {
          kind: "multi",
          title: "Pick channels",
          hint: "How the agent reaches the lead",
          presets: [
            { label: "Voice", value: "voice" },
            { label: "SMS", value: "sms" },
            { label: "Email", value: "email" },
          ],
        },
        { kind: "suppress", title: "Hard-block — no channel", hint: "Agent has no way to reach the lead" },
      ];
    case "cadence":
      return [
        {
          kind: "preset",
          title: "Pick a cadence",
          hint: "Touches over time",
          presets: [
            { label: "Light", value: "3 touches over 7 days", hint: "3 / 7d" },
            { label: "Standard", value: "5 touches over 21 days", hint: "5 / 21d" },
            { label: "Heavy", value: "7 touches over 30 days", hint: "7 / 30d" },
          ],
        },
        { kind: "free_text", title: "Set a custom cadence", hint: "Type it yourself", placeholder: "e.g. 4 touches over 14 days" },
        { kind: "suppress", title: "Suppress — no schedule", hint: "Runtime has no cadence" },
      ];
    case "coreMessage":
      return [
        { kind: "free_text", title: "Write the core message", hint: "One sentence the agent lands", placeholder: "e.g. You have equity — here's how to redeem it." },
        {
          kind: "fallback",
          title: "Use a generic opener",
          hint: "Agent degrades to a safe default",
          value: "Hi {{firstName}}, quick follow-up about your recent interaction with us.",
        },
      ];
    case "conversationSkills":
      return [
        {
          kind: "multi",
          title: "Pick agent skills",
          hint: "What the agent can do once connected",
          presets: [
            { label: "Book an appointment", value: "Book an appointment" },
            { label: "Warm-transfer to a human", value: "Warm-transfer to a human" },
            { label: "Verify the registered owner", value: "Verify the registered owner" },
            { label: "Send an SMS recap", value: "Send an SMS recap of next steps" },
          ],
        },
        { kind: "fallback", title: "Use default skills", hint: "Book or warm-transfer only", value: "Book an appointment, Warm-transfer to a human" },
      ];
    case "restrictedTopics":
      return [
        {
          kind: "multi",
          title: "Pick restricted topics",
          hint: "What the agent must not discuss",
          presets: [
            { label: "Final price", value: "Final price" },
            { label: "APR / financing terms", value: "APR / financing terms" },
            { label: "Trade-in valuation", value: "Trade-in valuation" },
            { label: "Inventory promises", value: "Inventory promises" },
          ],
        },
        { kind: "free_text", title: "Add a custom restriction", hint: "Type the topic", placeholder: "e.g. competitor pricing" },
      ];
    case "quietHours":
      return [
        {
          kind: "preset",
          title: "Pick calling hours",
          hint: "TCPA-safe windows",
          presets: [
            { label: "Local TCPA (8am–9pm)", value: "Local TCPA hours (8am–9pm), respect customer timezone" },
            { label: "Business hours (9am–6pm)", value: "9am–6pm local, respect customer timezone" },
            { label: "Daytime (9am–8pm)", value: "9am–8pm local, respect customer timezone" },
          ],
        },
        { kind: "free_text", title: "Set custom hours", hint: "Type the window", placeholder: "e.g. 10am–7pm local" },
      ];
    case "exitConditions":
      return [
        {
          kind: "multi",
          title: "Pick exit conditions",
          hint: "When the agent stops",
          presets: [
            { label: "Outcome met", value: "Outcome met" },
            { label: "Customer opts out (STOP)", value: "Customer opts out (STOP)" },
            { label: "Max touches reached", value: "Max touches reached" },
            { label: "Customer declines", value: "Customer declines" },
          ],
        },
        { kind: "fallback", title: "Use default exits", hint: "Booked / opt-out / max touches", value: "Outcome met, Customer opts out (STOP), Max touches reached" },
      ];
    case "primaryKPI":
      return [
        {
          kind: "preset",
          title: "Pick a headline KPI",
          hint: "What counts as success",
          presets: [
            { label: "Appointments booked", value: "Appointments booked" },
            { label: "Confirmed interest", value: "Confirmed interest" },
            { label: "Recovered deals", value: "Recovered deals" },
            { label: "Reactivated leads", value: "Reactivated leads" },
          ],
        },
        { kind: "free_text", title: "Set a custom KPI", hint: "Type it yourself", placeholder: "e.g. test drives booked" },
        { kind: "fallback", title: "Default to appointments", hint: "Use the standard KPI", value: "Appointments booked" },
      ];
    case "attributionWindow":
      return [
        {
          kind: "preset",
          title: "Pick an attribution window",
          hint: "How long a conversion counts",
          presets: [
            { label: "14 days", value: "14 days" },
            { label: "21 days", value: "21 days" },
            { label: "30 days", value: "30 days" },
            { label: "45 days", value: "45 days" },
          ],
        },
        { kind: "fallback", title: "Default to 30 days", hint: "Use the standard window", value: "30 days" },
      ];
    case "financingOffer":
      return [
        { kind: "free_text", title: "Describe the financing offer", hint: "What the agent can mention", placeholder: "e.g. 1.9% APR for qualified buyers" },
        { kind: "fallback", title: "Drop the financing hook", hint: "Agent omits financing entirely", value: "No financing offer" },
      ];
    default:
      return DATA_SOURCE_ACTIONS;
  }
}

/* ── CRM field map (required columns for dispatch) ─────────────────────
   Every campaign needs a handful of per-lead columns mapped before it can
   fire. These are surfaced as their own brief section; each unmapped column
   is resolvable through the same popover (CSV / CRM / suppress). */

export const CRM_FIELD_PREFIX = "crmField:";

export interface CrmColumn {
  key: string;
  label: string;
  note: string;
}

const BASE_CRM_COLUMNS: CrmColumn[] = [
  { key: "customer.first_name", label: "customer.first_name", note: "Personalize the opener" },
  { key: "customer.phone", label: "customer.phone", note: "Dial / SMS the lead" },
  { key: "vehicle.year_make_model", label: "vehicle.year_make_model", note: "Reference their vehicle" },
];

/** The per-lead columns this campaign needs mapped, varying by sub-use-case. */
export function requiredCrmColumns(prd: PRDState): CrmColumn[] {
  const extra: CrmColumn =
    prd.subUseCase === "equity_mining"
      ? { key: "vehicle.equity_usd", label: "vehicle.equity_usd", note: "Qualify on equity" }
      : prd.subUseCase === "lease_end"
        ? { key: "lease.end_date", label: "lease.end_date", note: "Time the outreach" }
        : prd.subUseCase === "service_recall"
          ? { key: "recall.campaign_id", label: "recall.campaign_id", note: "State the recall" }
          : prd.subUseCase === "declined_services"
            ? { key: "service.declined_job", label: "service.declined_job", note: "Reference the declined work" }
            : { key: "customer.email", label: "customer.email", note: "Email channel + recaps" };
  return [...BASE_CRM_COLUMNS, extra];
}

/** Build the field key used to resolve a CRM column through the popover. */
export function crmFieldKey(column: string): string {
  return CRM_FIELD_PREFIX + column;
}

/** Mapped vs needs-mapping status for the CRM field-map section. */
export function crmMapStatus(prd: PRDState): { total: number; mapped: number; missing: CrmColumn[] } {
  const cols = requiredCrmColumns(prd);
  const map = prd.crmFieldMap ?? {};
  const missing = cols.filter((c) => !map[c.key] || !map[c.key].trim());
  return { total: cols.length, mapped: cols.length - missing.length, missing };
}

/* ── Prompt parsing — extract answers already stated in the prompt ─────
   So the agent only asks for what's genuinely missing. Conservative: a field
   is filled only when the signal in the prompt is unambiguous. */
export function parsePromptAnswers(text: string): Partial<PRDState> {
  const out: Partial<PRDState> = {};
  const t = text.toLowerCase();

  // Channels
  const channels: string[] = [];
  if (/\bvoice\b|\bcall(?:s|ing)?\b|\bphone\b/.test(t)) channels.push("voice");
  if (/\bsms\b|\btext(?:s|ing)?\b/.test(t)) channels.push("sms");
  if (/\bemail\b/.test(t)) channels.push("email");
  if (channels.length) out.channels = channels;

  // Cadence — "5 touches over 21 days"
  const cad = t.match(/(\d+)\s*touch(?:es)?\s*(?:over|across|in)\s*(\d+)\s*days?/);
  if (cad) out.cadence = `${cad[1]} touches over ${cad[2]} days`;

  // Audience size — "~3,700 equity-eligible customers", "2,400 customers"
  const size = text.match(
    /~?\s*(?:\d{1,3}(?:,\d{3})+|\d{3,})\s*[A-Za-z$>%\s-]{0,28}?(?:customers|leads|vins|owners|contacts|accounts|prospects)/i
  );
  if (size) out.audienceSize = size[0].trim().replace(/\s+/g, " ");

  // Source / CRM
  const sources: { re: RegExp; label: string }[] = [
    { re: /\bapollo\b|team velocity/i, label: "Apollo" },
    { re: /\bdealersocket\b/i, label: "DealerSocket" },
    { re: /\btekion\b/i, label: "Tekion" },
    { re: /\bvinsolutions\b/i, label: "VinSolutions" },
    { re: /\beleads?\b/i, label: "eLeads" },
    { re: /\breynolds\b/i, label: "Reynolds" },
  ];
  for (const s of sources) {
    if (s.re.test(text)) {
      out.audienceSource = s.label;
      out.crmSource = s.label;
      break;
    }
  }
  if (!out.audienceSource && /\bcsv\b|upload a list|spreadsheet/i.test(text)) {
    out.audienceSource = "CSV upload";
    out.crmSource = "Generic CSV upload";
  }

  // Primary KPI — light heuristics
  if (/book[\s\w]*(?:appointment|consult|visit)|appointments?\s*booked|test drive/i.test(text)) {
    out.primaryKPI = "Appointments booked";
  } else if (/re-?activat|re-?engage/i.test(text)) {
    out.primaryKPI = "Reactivated leads";
  } else if (/recover|save the deal|re-?open/i.test(text)) {
    out.primaryKPI = "Recovered deals";
  }

  return out;
}
