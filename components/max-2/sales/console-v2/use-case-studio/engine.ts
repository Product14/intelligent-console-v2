/**
 * Pure functions for the Use Case Studio:
 * - Persona generator (4-6 personas per Use Case)
 * - Test pack generator (must-do + must-not-do scenarios per persona)
 * - Mock batch scorer (deterministic pass rate)
 *
 * Real version would hit an LLM for persona generation and validation.
 * Here it's all rule-based so the demo is reliable.
 */

import {
  type AgentBrain,
  type BatchTestResult,
  type Channel,
  type Persona,
  type TestCase,
  type UseCase,
  type WorkflowTouch,
  DEFAULT_BRAIN,
  DEFAULT_CADENCE,
  DEFAULT_WORKFLOW,
} from "./types";

function genId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

/* ── Starter library ─────────────────────────────────────────────── */

export interface UseCaseStarter {
  id: string;
  label: string;
  category: "sales" | "service";
  subType: string;
  description: string;
  intent: string;
  brain: AgentBrain;
  channels: Channel[];
}

export const USE_CASE_STARTERS: UseCaseStarter[] = [
  {
    id: "starter_lease_end",
    label: "Lease Maturity",
    category: "sales",
    subType: "lease_end",
    description: "Re-engage lease-end customers 60-90 days from maturity with renew / upgrade / buy-out options.",
    intent: "Outbound to customers whose lease ends in the next 60–90 days. Offer three paths: buy out, trade into something new, or walk away. Lead with the residual-vs-market gap if there's positive equity.",
    channels: ["voice", "sms"],
    brain: {
      mustDo: [
        "Confirm the customer is the leaseholder on file",
        "Reference the specific vehicle and remaining lease term",
        "Offer at least two options: renew, buy-out, or upgrade",
      ],
      goodToHave: [
        "Mention current lease-loyalty incentives if relevant",
        "Offer to send a no-obligation buy-out quote by SMS",
      ],
      mustNotDo: [
        "Do not quote a final buy-out figure over the phone",
        "Do not threaten penalties or repossession",
        "Do not pressure the customer near end-of-call",
      ],
      tone: "Warm, low-pressure",
      openingLine: "Hi {{firstName}}, this is Vini from {{dealer}} — your lease on the {{vehicle}} is coming up.",
    },
  },
  {
    id: "starter_equity",
    label: "Equity Mining",
    category: "sales",
    subType: "equity_mining",
    description: "Reach customers with positive equity and offer them an upgrade.",
    intent: "Mine equity from our CRM. Pull customers whose current vehicle has positive equity (loan balance < market value) and offer them an upgrade. Frame as 'you have a winning lottery ticket'.",
    channels: ["voice", "sms"],
    brain: {
      mustDo: [
        "Confirm the customer is the owner on file",
        "State estimated equity with confidence wording (HIGH/MED/LOW)",
        "Offer to run exact numbers in store, not over the phone",
      ],
      goodToHave: [
        "Reference comparable inventory if equity is HIGH",
        "Mention manufacturer incentives if applicable",
      ],
      mustNotDo: [
        "Do not state equity as bankable — always 'approximately'",
        "Do not quote a firm trade-in value over the phone",
        "Do not promise a specific payment without dealership approval",
      ],
      tone: "Friendly, professional",
      openingLine: "Hi {{firstName}}, this is Vini from {{dealer}} — wanted to share something interesting about your {{vehicle}}.",
    },
  },
  {
    id: "starter_recall",
    label: "Service Recall",
    category: "service",
    subType: "recall",
    description: "Compliance-grade safety recall outreach. DNC-exempt.",
    intent: "Voice-only outreach for active safety recalls. Compliance-grade. State the recall in the first 10 seconds.",
    channels: ["voice"],
    brain: {
      mustDo: [
        "State this is a safety recall notification in the first 10 seconds",
        "Confirm the caller is the registered owner before discussing details",
        "Cite the recall reference number if asked",
        "Offer at least two service appointment slots",
      ],
      goodToHave: [
        "Mention loaner-car availability if applicable",
        "Confirm prior recall mailers were received",
      ],
      mustNotDo: [
        "Do not characterize the recall as optional",
        "Do not estimate repair time beyond what the system provides",
        "Do not discuss unrelated service items in the same call",
      ],
      tone: "Formal, compliance-grade",
      openingLine: "Hello, may I speak with the owner of vehicle {{vin}}? This is a safety recall notification from {{dealer}}.",
    },
  },
  {
    id: "starter_appt",
    label: "Appointment Confirmation",
    category: "sales",
    subType: "appointment_confirmation",
    description: "Defend show-rate by confirming upcoming appointments 24 hours out.",
    intent: "Confirm tomorrow's appointment. Capture cancellation or reschedule intent. Keep it short.",
    channels: ["sms", "voice"],
    brain: {
      mustDo: [
        "Greet by name and confirm appointment date / time / salesperson",
        "Ask whether the customer plans to attend",
        "Offer one reschedule option if they can't make it",
      ],
      goodToHave: [
        "Confirm vehicle of interest is still relevant",
        "Send dealership address by SMS after the call",
      ],
      mustNotDo: [
        "Do not pressure a yes — record the answer they give",
        "Do not discuss pricing or terms",
      ],
      tone: "Friendly, professional",
      openingLine: "Hi {{firstName}}, this is Vini calling to confirm your appointment with {{salesperson}} tomorrow at {{time}}.",
    },
  },
];

/* ── Persona library ─────────────────────────────────────────────── */

const PERSONA_ARCHETYPES: { archetype: string; brief: (subType: string) => string; expectedBehavior: string }[] = [
  {
    archetype: "Hot Intent",
    brief: () => "Actively shopping, low friction. Wants the path of least resistance to an appointment.",
    expectedBehavior: "Agent confirms intent, captures contact, books appointment within 3 turns.",
  },
  {
    archetype: "Price-First Negotiator",
    brief: () => "Wants a final number before they invest time. Will push back hard if the agent declines.",
    expectedBehavior: "Agent declines to quote a firm number over the phone, offers to confirm at the store.",
  },
  {
    archetype: "Skeptical Re-Engage",
    brief: () => "Has been called before. Suspicious of being upsold. Slow to commit.",
    expectedBehavior: "Agent acknowledges prior contact, references their original interest, keeps low-pressure.",
  },
  {
    archetype: "Wrong Number",
    brief: () => "Customer no longer owns the number. Flags data quality issue.",
    expectedBehavior: "Agent confirms identity, drops cleanly on wrong-number signal, flags suppression.",
  },
  {
    archetype: "Opt-Out Request",
    brief: () => "Asks to be removed from contact lists.",
    expectedBehavior: "Agent records opt-out, confirms, ends call. Must write Customer-level opt-out.",
  },
  {
    archetype: "Ambiguous Intent",
    brief: () => "Hedges. Says 'maybe' to everything. Doesn't confirm or close.",
    expectedBehavior: "Agent stays on slower nurture cadence, doesn't push for a same-call decision.",
  },
];

export function generatePersonas(intent: string, count = 5): Persona[] {
  return PERSONA_ARCHETYPES.slice(0, count).map((p, i) => ({
    id: genId(`p${i}`),
    name: `${p.archetype.split(" ")[0]} ${["Avery", "Jordan", "Riley", "Casey", "Sam", "Taylor"][i]}`,
    archetype: p.archetype,
    brief: p.brief(intent),
    expectedBehavior: p.expectedBehavior,
  }));
}

/* ── Test pack generator ─────────────────────────────────────────── */

export function generateTestPack(brain: AgentBrain, personas: Persona[]): TestCase[] {
  const cases: TestCase[] = [];

  for (const persona of personas) {
    // 1 must-do case
    if (brain.mustDo.length > 0) {
      const rule = brain.mustDo[Math.floor(Math.random() * brain.mustDo.length)];
      cases.push({
        id: genId("tc"),
        personaId: persona.id,
        scenarioLabel: persona.archetype + " · must-do",
        rule: { kind: "must", rule },
        outcome: "pass",
        observed: `Agent followed the rule: "${rule.slice(0, 70)}…"`,
      });
    }
    // 1 must-not-do case
    if (brain.mustNotDo.length > 0) {
      const rule = brain.mustNotDo[Math.floor(Math.random() * brain.mustNotDo.length)];
      cases.push({
        id: genId("tc"),
        personaId: persona.id,
        scenarioLabel: persona.archetype + " · must-not-do",
        rule: { kind: "must_not", rule },
        outcome: "pass",
        observed: `Agent correctly avoided: "${rule.slice(0, 70)}…"`,
      });
    }
    // 1 good-to-have case (lower weight)
    if (brain.goodToHave.length > 0 && Math.random() > 0.4) {
      const rule = brain.goodToHave[Math.floor(Math.random() * brain.goodToHave.length)];
      cases.push({
        id: genId("tc"),
        personaId: persona.id,
        scenarioLabel: persona.archetype + " · good-to-have",
        rule: { kind: "good", rule },
        outcome: Math.random() > 0.3 ? "pass" : "warn",
        observed: `Agent ${Math.random() > 0.3 ? "mentioned" : "missed"}: "${rule.slice(0, 70)}…"`,
      });
    }
  }

  return cases;
}

/**
 * Deterministic-ish scorer: pass rate is influenced by the *quantity* of
 * must-not-do rules (more rails → harder to game), and randomness for demo.
 * Real version: run cases through the model + grader.
 */
export function scoreTestPack(brain: AgentBrain, personas: Persona[]): BatchTestResult {
  const allCases = generateTestPack(brain, personas);

  // Inject realistic failures: 10-25% based on a seeded rate
  const failureRate = clamp(0.12 + (brain.mustNotDo.length < 3 ? 0.10 : 0), 0.05, 0.30);
  const cases = allCases.map((c, i) => {
    const seed = hashSeed(`${c.id}|${c.rule.kind}|${i}`);
    const roll = (seed % 100) / 100;
    let outcome: TestCase["outcome"] = "pass";
    if (c.rule.kind === "must" && roll < failureRate * 0.6) outcome = "fail";
    else if (c.rule.kind === "must_not" && roll < failureRate * 0.9) outcome = "fail";
    else if (c.rule.kind === "good" && roll < 0.25) outcome = "warn";
    return {
      ...c,
      outcome,
      observed: outcome === "fail"
        ? `❌ Agent violated the rule on ${c.scenarioLabel.split(" · ")[0]}: said "${c.rule.rule.slice(0, 60)}…" anyway.`
        : outcome === "warn"
          ? `⚠️ Agent missed the optional cue: "${c.rule.rule.slice(0, 60)}…"`
          : c.observed,
    };
  });

  const passed = cases.filter((c) => c.outcome === "pass").length;
  const failed = cases.filter((c) => c.outcome === "fail").length;
  const warned = cases.filter((c) => c.outcome === "warn").length;
  const passRate = cases.length === 0 ? 0 : passed / cases.length;

  return {
    cases,
    passed,
    failed,
    warned,
    passRate,
    ranAt: new Date().toISOString(),
  };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/* ── Use Case factory ────────────────────────────────────────────── */

export function makeDraftUseCase(starter?: UseCaseStarter): UseCase {
  const now = new Date().toISOString();
  if (!starter) {
    return {
      id: genId("uc"),
      name: "",
      description: "",
      intent: "",
      category: "sales",
      subType: "follow_up",
      channels: ["voice", "sms"],
      agentBrain: { ...DEFAULT_BRAIN },
      workflow: [...DEFAULT_WORKFLOW],
      cadence: { ...DEFAULT_CADENCE },
      personas: [],
      batchResult: null,
      status: "draft",
      promptVersionId: genId("pv"),
      campaignsUsing: 0,
      createdAt: now,
      updatedAt: now,
    };
  }
  return {
    id: genId("uc"),
    name: starter.label,
    description: starter.description,
    intent: starter.intent,
    category: starter.category,
    subType: starter.subType,
    channels: [...starter.channels],
    agentBrain: { ...starter.brain },
    workflow: [...DEFAULT_WORKFLOW],
    cadence: { ...DEFAULT_CADENCE },
    personas: [],
    batchResult: null,
    status: "draft",
    promptVersionId: genId("pv"),
    campaignsUsing: 0,
    createdAt: now,
    updatedAt: now,
  };
}

/** PRD: ≥75% pass rate is the deploy gate. */
export const DEPLOY_GATE_THRESHOLD = 0.75;

export function canDeploy(uc: UseCase): boolean {
  return !!uc.batchResult && uc.batchResult.passRate >= DEPLOY_GATE_THRESHOLD;
}
