/**
 * Per-lead agent briefs — the "complete brief the agent is handed at dispatch"
 * (PRD 06). Distilled from the customer conversation-memory / purchase-intent
 * record shape: stage + confidence, vehicle of interest (with VIN/trim),
 * budget + payment, trade-ins, appointment intent, motivations, do-not-repeat,
 * persona, and the rolling conversation memory.
 *
 * Keyed by enrolled-lead id; the manage view renders this when present so the
 * operator sees exactly what the agent knows about each lead.
 */

export interface LeadBriefVehicle {
  year?: number;
  make: string;
  model: string;
  trim?: string;
  vin?: string;
  color?: string;
}

export interface LeadBrief {
  /** Purchase-intent stage + how sure we are. */
  stage: "RESEARCH" | "SHOPPING" | "EVALUATION" | "NEGOTIATION" | "CLOSING";
  stageConfidence: number; // 0–1
  timelineToBuy?: string;
  vehicleOfInterest: LeadBriefVehicle;
  budgetMax?: number;
  paymentMethod?: "CASH" | "FINANCE" | "LEASE";
  financeNote?: string;
  featurePreferences?: string[];
  tradeVehicles?: { year?: number; make: string; model: string }[];
  appointment: { promisedToBook?: boolean; bookedOn?: string | null };
  motivations?: string[];
  objections?: string[];
  doNotRepeat?: string[];
  persona?: string;
  /** Short rolling memory — what the agent should pick up from. */
  memory: string;
  engagement?: { lastContacted?: string; lastSms?: string; lastCall?: string };
}

export const LEAD_BRIEFS: Record<string, LeadBrief> = {
  // camp-1 · Speed to Lead — Internet Leads
  "el-1": {
    stage: "RESEARCH",
    stageConfidence: 0.85,
    timelineToBuy: "Not discussed",
    vehicleOfInterest: { year: 2024, make: "Honda", model: "Accord", trim: "Sport" },
    paymentMethod: undefined,
    appointment: { promisedToBook: false, bookedOn: null },
    motivations: ["Submitted an internet inquiry on the Accord Sport"],
    doNotRepeat: ["Don't re-ask for contact info — already on file"],
    persona: "Researcher · early funnel",
    memory: "Connected once but the customer didn't speak. Reopen gently — confirm it's a good time, then re-establish what drew them to the Accord Sport.",
    engagement: { lastCall: "Mar 10, 10:17 AM" },
  },
  "el-2": {
    stage: "EVALUATION",
    stageConfidence: 0.9,
    timelineToBuy: "This weekend",
    vehicleOfInterest: { year: 2023, make: "Toyota", model: "Tacoma", trim: "SR5", vin: "3TMCZ5AN8PM" },
    paymentMethod: "FINANCE",
    featurePreferences: ["4WD", "Tow package", "Crew cab"],
    tradeVehicles: [{ year: 2019, make: "Toyota", model: "Tacoma" }],
    appointment: { promisedToBook: true, bookedOn: "Apr 5, 2026 · 10:00 AM" },
    motivations: ["Upgrading from a 2019 Tacoma", "Wants a weekend test drive"],
    doNotRepeat: ["Already confirmed the trade-in — don't re-collect"],
    persona: "Upgrader · trade-in in hand",
    memory: "Strong interest in the 2023 Tacoma SR5. Owns a 2019 Tacoma to trade. Appointment booked Saturday 10 AM — confirm and prep a trade appraisal.",
    engagement: { lastCall: "Mar 31, 2:45 PM", lastSms: "Apr 1, 9:02 AM" },
  },
  "el-3": {
    stage: "SHOPPING",
    stageConfidence: 0.8,
    vehicleOfInterest: { year: 2024, make: "Subaru", model: "Crosstrek" },
    appointment: { promisedToBook: false, bookedOn: null },
    motivations: ["Asked about Crosstrek availability + current incentives"],
    persona: "Comparison shopper",
    memory: "Reached voicemail; follow-up SMS sent about availability and incentives. Lead with the incentive when she calls back.",
    engagement: { lastCall: "Mar 31, 4:12 PM", lastSms: "Mar 31, 4:20 PM" },
  },
  "el-4": {
    stage: "NEGOTIATION",
    stageConfidence: 0.9,
    timelineToBuy: "This week",
    vehicleOfInterest: { year: 2024, make: "Toyota", model: "Camry", trim: "LE", color: "White / Silver" },
    budgetMax: 30000,
    paymentMethod: "FINANCE",
    financeNote: "Pre-approved up to $30K; targeting ~$28K",
    featurePreferences: ["Sunroof", "Apple CarPlay", "White / Silver"],
    appointment: { promisedToBook: true, bookedOn: "Apr 3, 2026 · 2:00 PM" },
    motivations: ["Wants to stay near $28K", "Visiting this week"],
    objections: ["Cross-shopping the Honda Civic"],
    doNotRepeat: ["Financing already pre-approved — don't push F&I products yet"],
    persona: "Ready buyer · financed",
    memory: "Pre-approved to $30K, wants Camry LE in white or silver near $28K. Comparing with the Civic. Appointment Thursday 2 PM — have both colors ready.",
    engagement: { lastCall: "Apr 1, 9:30 AM" },
  },
  "el-5": {
    stage: "EVALUATION",
    stageConfidence: 0.85,
    vehicleOfInterest: { year: 2024, make: "Toyota", model: "Camry", trim: "XSE", color: "Blue vs Red" },
    appointment: { promisedToBook: false, bookedOn: null },
    motivations: ["Torn between XSE blue and red — wants to see both"],
    doNotRepeat: ["Asked for a callback tomorrow — honor the timing"],
    persona: "Color-deciding shopper",
    memory: "Likes the Camry XSE, deciding blue vs red, wants to compare in person. Asked for a callback tomorrow — offer to stage both colors for a visit.",
    engagement: { lastCall: "Mar 31, 11:05 AM" },
  },
  "el-6": {
    stage: "RESEARCH",
    stageConfidence: 0.75,
    vehicleOfInterest: { year: 2024, make: "Honda", model: "Civic", trim: "Sport" },
    appointment: { promisedToBook: false, bookedOn: null },
    motivations: ["AutoTrader inquiry on the Civic Sport"],
    persona: "Early researcher",
    memory: "No answer on the first call. Retry on a different channel; keep the opener short and reference the specific Civic Sport he inquired about.",
    engagement: { lastCall: "Mar 31, 3:30 PM" },
  },
  "el-7": {
    stage: "CLOSING",
    stageConfidence: 0.95,
    timelineToBuy: "Saturday",
    vehicleOfInterest: { year: 2024, make: "Ford", model: "Mustang", trim: "GT Premium" },
    paymentMethod: "FINANCE",
    financeNote: "Pre-approved",
    appointment: { promisedToBook: true, bookedOn: "Apr 5, 2026 · 11:00 AM" },
    motivations: ["Dream car — bringing spouse for the test drive"],
    doNotRepeat: ["Appointment already set — confirm only, don't re-pitch"],
    persona: "Hot buyer · bringing decision partner",
    memory: "Very high intent on the Mustang GT. Bringing her husband Saturday 11 AM. Pre-approved. Send a calendar confirmation and prep the GT Premium.",
    engagement: { lastCall: "Mar 29, 1:15 PM", lastSms: "Apr 4, 8:00 AM" },
  },
};

export function getLeadBrief(leadId?: string): LeadBrief | null {
  if (!leadId) return null;
  return LEAD_BRIEFS[leadId] ?? null;
}
