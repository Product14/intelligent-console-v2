/**
 * Mock agent-script generator — turns natural-language guidance into a
 * structured agent brief: talking points + must-do/must-not-do + tone.
 *
 * Real version would call an LLM. This deterministic generator picks up
 * common phrases and assembles a sensible default brief.
 */

export interface AgentScript {
  /** 3-5 talking points the agent should hit during the call. */
  talkingPoints: string[];
  /** Behaviors the agent must perform. */
  mustDo: string[];
  /** Behaviors the agent must avoid. */
  mustNotDo: string[];
  /** Tone descriptor (e.g. "warm, low-pressure"). */
  tone: string;
}

interface Cue {
  match: RegExp;
  apply: (script: AgentScript) => void;
}

const CUES: Cue[] = [
  {
    match: /\b(ev|electric|hybrid)\b/i,
    apply: (s) => {
      s.talkingPoints.push("Lead with current EV / hybrid inventory and incentives");
      s.mustDo.push("Confirm whether the customer has charging access at home");
    },
  },
  {
    match: /test[- ]?drive/i,
    apply: (s) => {
      s.talkingPoints.push("Offer two specific test-drive time slots, not an open ask");
      s.mustDo.push("Confirm the lead's preferred contact method before ending");
    },
  },
  {
    match: /(book|booking|appointment|schedule)/i,
    apply: (s) => {
      s.talkingPoints.push("Drive toward a booked appointment in this call");
      s.mustDo.push("Capture name, phone, and vehicle of interest before ending");
    },
  },
  {
    match: /(discount|promo|deal|incentive|rebate)/i,
    apply: (s) => {
      s.talkingPoints.push("Mention the current incentive only if it fits their stated interest");
      s.mustNotDo.push("Do not quote a final price or APR over the phone");
    },
  },
  {
    match: /trade[- ]?in/i,
    apply: (s) => {
      s.talkingPoints.push("Acknowledge the trade-in, but route detailed valuation to in-store");
      s.mustNotDo.push("Do not quote a trade-in value over the phone");
    },
  },
  {
    match: /financ(?:e|ing)|loan|apr/i,
    apply: (s) => {
      s.talkingPoints.push("Offer to set up a financing pre-qualification at the dealership");
      s.mustNotDo.push("Do not discuss specific APR or financing terms");
    },
  },
  {
    match: /lease/i,
    apply: (s) => {
      s.talkingPoints.push("Reference the customer's remaining lease term");
      s.mustDo.push("Offer at least two options: renew, buy-out, or upgrade");
      s.mustNotDo.push("Do not quote a final buy-out figure over the phone");
    },
  },
  {
    match: /recall/i,
    apply: (s) => {
      s.talkingPoints.push("State this is a safety recall notification in the first 10 seconds");
      s.mustDo.push("Confirm the caller is the registered owner before discussing details");
      s.mustNotDo.push("Do not characterize the recall as optional");
    },
  },
  {
    match: /(service|maintenance|oil change|tire)/i,
    apply: (s) => {
      s.talkingPoints.push("Reference the specific service that is due");
      s.mustDo.push("Offer at least two service appointment slots");
      s.mustNotDo.push("Do not quote a final service price — give a starting range only");
    },
  },
  {
    match: /follow[- ]?up|reconnect|re[- ]?engage/i,
    apply: (s) => {
      s.talkingPoints.push("Reference the prior conversation by topic, not date");
      s.mustDo.push("Ask whether the original need is still open");
      s.mustNotDo.push("Do not repeat the same pitch as the prior call");
    },
  },
  {
    match: /(dormant|cold|inactive)/i,
    apply: (s) => {
      s.talkingPoints.push("Open with a fresh hook — new inventory or new incentive");
      s.mustNotDo.push("Do not pressure the lead for a same-call commitment");
    },
  },
  {
    match: /(birthday|anniversary)/i,
    apply: (s) => {
      s.talkingPoints.push("Open with a warm, personal acknowledgement before pivoting");
    },
  },
];

const TONE_CUES: { match: RegExp; tone: string }[] = [
  { match: /(low[- ]?pressure|soft|gentle|relaxed|no pressure)/i, tone: "Warm, low-pressure" },
  { match: /(urgent|asap|today|right now|immediate)/i, tone: "Direct, time-sensitive" },
  { match: /(formal|compliance|legal)/i, tone: "Formal, compliance-grade" },
  { match: /(friendly|conversational|casual)/i, tone: "Friendly, conversational" },
  { match: /(empathetic|caring|sensitive)/i, tone: "Empathetic, customer-first" },
];

function dedupe(arr: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of arr) {
    if (seen.has(x)) continue;
    seen.add(x);
    out.push(x);
  }
  return out;
}

export function generateAgentScript(prompt: string): AgentScript {
  const base: AgentScript = {
    talkingPoints: [
      "Reintroduce the dealership and reason for the call within the first turn",
      "Listen for the customer's current interest before pitching",
      "Propose a clear next step before ending — appointment, SMS recap, or callback",
    ],
    mustDo: [
      "Confirm the customer's name and preferred contact method",
      "Reference the original lead source / vehicle interest if available",
      "End the call with a clear next step",
    ],
    mustNotDo: [
      "Do not commit to a specific price",
      "Do not transfer the lead without their consent",
      "Do not ignore an explicit objection",
    ],
    tone: "Friendly, professional",
  };

  if (!prompt.trim()) return base;

  for (const cue of CUES) {
    if (cue.match.test(prompt)) cue.apply(base);
  }

  for (const t of TONE_CUES) {
    if (t.match.test(prompt)) {
      base.tone = t.tone;
      break;
    }
  }

  // Cap each list to keep things scannable
  base.talkingPoints = dedupe(base.talkingPoints).slice(0, 5);
  base.mustDo = dedupe(base.mustDo).slice(0, 5);
  base.mustNotDo = dedupe(base.mustNotDo).slice(0, 5);

  return base;
}

export const EXAMPLE_SCRIPT_PROMPTS: { label: string; prompt: string }[] = [
  {
    label: "Book test drive, soft sell",
    prompt: "Get them to book a test drive without pushing on price. Mention the current EV incentive if it fits.",
  },
  {
    label: "Service reminder",
    prompt: "Friendly service reminder. Confirm vehicle on file, offer two appointment slots.",
  },
  {
    label: "Recall outreach",
    prompt: "Recall notification. Compliance-formal tone. State recall in the first 10 seconds, offer service slot.",
  },
  {
    label: "Lease-end re-engage",
    prompt: "Lease-end customer. Offer renew, buy-out, or upgrade — empathetic, low-pressure.",
  },
];
