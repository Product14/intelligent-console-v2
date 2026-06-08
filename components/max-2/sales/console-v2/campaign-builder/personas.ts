/**
 * Persona library — the AI voices any campaign can use.
 * Mirrors the agent-workflow PERSONA_LIBRARY but with initial-based avatars
 * (no photo assets required) and color-coded accents.
 */

export type Gender = "male" | "female";
export type AgentRole =
  | "Inbound Sales Agent"
  | "Outbound Campaign Agent"
  | "Service Follow-Up Agent"
  | "Appointment Confirmation Agent";

export interface Persona {
  id: string;
  name: string;
  role: AgentRole;
  accent: string;
  languages: string[];
  gender: Gender;
  /** Color for the avatar tile + accent. */
  accent_hex: string;
  /** Background for the avatar gradient. */
  bgGradient: string;
  /** Brief 1-line description of strengths. */
  blurb: string;
  recommended?: boolean;
}

export const PERSONA_LIBRARY: Persona[] = [
  {
    id: "vini",
    name: "VINI",
    role: "Outbound Campaign Agent",
    accent: "Texas",
    languages: ["English"],
    gender: "female",
    accent_hex: "#6366f1",
    bgGradient: "from-[#6366f1] to-[#8b5cf6]",
    blurb: "Spyne's flagship outbound voice — friendly, fast, low-pressure. Tested across 50+ rooftops.",
    recommended: true,
  },
  {
    id: "frankie",
    name: "Frankie",
    role: "Inbound Sales Agent",
    accent: "British",
    languages: ["English"],
    gender: "male",
    accent_hex: "#0891b2",
    bgGradient: "from-[#0891b2] to-[#06b6d4]",
    blurb: "Crisp British accent. Excels at appointment confirmations and warm inbound handling.",
  },
  {
    id: "mia",
    name: "Mia",
    role: "Inbound Sales Agent",
    accent: "American",
    languages: ["English"],
    gender: "female",
    accent_hex: "#ec4899",
    bgGradient: "from-[#ec4899] to-[#f43f5e]",
    blurb: "Warm American voice. Strong on objection handling for hot leads.",
  },
  {
    id: "sarah",
    name: "Sarah",
    role: "Outbound Campaign Agent",
    accent: "British",
    languages: ["English"],
    gender: "female",
    accent_hex: "#16a34a",
    bgGradient: "from-[#16a34a] to-[#14b8a6]",
    blurb: "Calm and reassuring. Best for lease-end and warranty re-engagement.",
  },
  {
    id: "james",
    name: "James",
    role: "Service Follow-Up Agent",
    accent: "British",
    languages: ["English"],
    gender: "male",
    accent_hex: "#f59e0b",
    bgGradient: "from-[#f59e0b] to-[#d97706]",
    blurb: "Compliance-grade voice for service recall and declined-work recovery.",
  },
  {
    id: "maria",
    name: "Maria",
    role: "Appointment Confirmation Agent",
    accent: "American",
    languages: ["English", "Spanish"],
    gender: "female",
    accent_hex: "#dc2626",
    bgGradient: "from-[#dc2626] to-[#b91c1c]",
    blurb: "Bilingual EN/ES. Specialised in same-day appointment confirmations.",
  },
];

export function findPersona(id: string): Persona | undefined {
  return PERSONA_LIBRARY.find((p) => p.id === id);
}

export function getInitials(name: string): string {
  return name.split(/\s+/).map((s) => s[0]).join("").slice(0, 2).toUpperCase();
}

/* ─── Customize types ─────────────────────────────────────────────── */

export type TradeInHandling = "collect" | "estimate" | "defer";
export type FinancingHandling = "collect" | "softpull" | "defer";
export type DiscountHandling = "yes" | "no" | "manager_approval";

export interface AgentCustomization {
  tradeIn: TradeInHandling;
  financing: FinancingHandling;
  discount: DiscountHandling;
  upsell: boolean;
  language: "english" | "spanish" | "hindi" | "auto";
}

export const DEFAULT_CUSTOMIZATION: AgentCustomization = {
  tradeIn: "collect",
  financing: "softpull",
  discount: "manager_approval",
  upsell: true,
  language: "english",
};

/* ─── Sample transcript generator (test call simulation) ──────────── */

export interface TranscriptLine {
  speaker: "agent" | "customer";
  text: string;
  /** ms from call start. */
  at: number;
}

interface TranscriptBrief {
  subUseCase?: string;
  title?: string;
  dealer?: string;
  personaName?: string;
}

export function buildSampleTranscript(brief: TranscriptBrief): TranscriptLine[] {
  const dealer = brief.dealer ?? "Auto Mall";
  const agentName = brief.personaName ?? "Vini";
  const sub = brief.subUseCase ?? "";

  if (sub === "equity_mining") {
    return [
      { speaker: "agent",    at: 0,     text: `Hi, this is ${agentName} calling from ${dealer}. Quick heads-up — I'm an AI agent following up on your account. Got a minute?` },
      { speaker: "customer", at: 2200,  text: "Uh, sure — what's this about?" },
      { speaker: "agent",    at: 4200,  text: "So our records show your 2022 GLE has about $16k of equity right now. That's enough to roll into a newer 2026 for the same monthly payment — or take a check at delivery." },
      { speaker: "customer", at: 9800,  text: "What's the exact payoff number you have?" },
      { speaker: "agent",    at: 12000, text: "I can see what we have, but the exact payoff needs to come from your lender — they're the source of truth. The equity number on our side is what matters for the appraisal. Want to set up a quick visit so the team can walk you through it?" },
      { speaker: "customer", at: 19000, text: "Maybe Saturday morning?" },
      { speaker: "agent",    at: 21000, text: "Saturday works — I have 10am or 11:30am open with our trade specialist. Which one?" },
      { speaker: "customer", at: 24000, text: "10am." },
      { speaker: "agent",    at: 25500, text: "Booked. You'll get an SMS confirmation in a minute. Thanks — see you Saturday." },
    ];
  }
  if (sub === "lease_end" || sub === "follow_up") {
    return [
      { speaker: "agent",    at: 0,     text: `Hi, this is ${agentName} from ${dealer}. Your lease on the 2023 RX is wrapping up — got a minute to talk options?` },
      { speaker: "customer", at: 2400,  text: "Yeah, what are you offering?" },
      { speaker: "agent",    at: 4200,  text: "Three paths typically — return it, buy it out, or upgrade into something new. Based on the residual, you have some equity if you wanted to roll into a 2026. No pressure either way." },
      { speaker: "customer", at: 10500, text: "What's the buyout look like?" },
      { speaker: "agent",    at: 12500, text: "The exact buyout has to come from the captive lender, but I can pull a no-obligation quote and text it to you in the next hour. Want me to?" },
      { speaker: "customer", at: 19000, text: "Sure, text me that." },
      { speaker: "agent",    at: 20500, text: "Sending now. Also — would you like to come in this weekend to compare? 10am or 11am Saturday?" },
      { speaker: "customer", at: 26500, text: "11 works." },
      { speaker: "agent",    at: 28000, text: "Booked for 11am Saturday. SMS confirmation incoming. Thanks!" },
    ];
  }
  if (sub === "recall" || sub === "declined_services") {
    return [
      { speaker: "agent",    at: 0,     text: `Hello, this is ${agentName} from ${dealer} service. I'm an AI assistant calling about an active safety recall on your vehicle. May I confirm I'm speaking with the registered owner?` },
      { speaker: "customer", at: 3200,  text: "Yes, that's me. What's the recall about?" },
      { speaker: "agent",    at: 5500,  text: "It's a brake-line inspection recall — quick service, usually under 90 minutes. The fix is free to you. I have appointments Friday at 9am or 10:30am with our service team. Which works?" },
      { speaker: "customer", at: 11000, text: "Friday 10:30." },
      { speaker: "agent",    at: 12500, text: "Booked for 10:30am Friday. SMS confirmation in a minute. Thanks — drive safe." },
    ];
  }
  // Generic
  return [
    { speaker: "agent",    at: 0,     text: `Hi, this is ${agentName} from ${dealer}. Got a quick second?` },
    { speaker: "customer", at: 2000,  text: "Sure, what's this about?" },
    { speaker: "agent",    at: 3500,  text: "Just a quick follow-up on your recent inquiry. Was there anything specific you wanted more info on?" },
    { speaker: "customer", at: 9000,  text: "Not right now, thanks." },
    { speaker: "agent",    at: 10500, text: "No problem at all — I'll leave the door open. Thanks for your time." },
  ];
}

/* ─── Conflict detection ──────────────────────────────────────────── */

export interface ConflictResult {
  conflicted: boolean;
  conflictedCount: number;
  conflictingCampaignName: string;
}

/** Mock conflict: 18% of the audience overlaps a hard-coded running campaign. */
export function detectConflict(audienceCount: number, hasActiveCampaign = true): ConflictResult {
  if (!hasActiveCampaign || audienceCount === 0) {
    return { conflicted: false, conflictedCount: 0, conflictingCampaignName: "" };
  }
  return {
    conflicted: audienceCount > 60,
    conflictedCount: Math.round(audienceCount * 0.18),
    conflictingCampaignName: "Speed to Lead — Internet Leads",
  };
}
