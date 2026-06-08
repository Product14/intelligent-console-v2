/**
 * Use Case = function definition. The parent surface in the PRD architecture.
 * The Campaign Builder consumes deployed Use Cases as its 5-parameter input.
 */

export type UseCaseStatus = "draft" | "testing" | "deployed" | "archived";
export type Channel = "voice" | "sms" | "email";
export type Tone =
  | "Friendly, professional"
  | "Warm, low-pressure"
  | "Direct, time-sensitive"
  | "Formal, compliance-grade"
  | "Empathetic, customer-first";

export interface AgentBrain {
  mustDo: string[];
  goodToHave: string[];
  mustNotDo: string[];
  tone: Tone;
  openingLine?: string;
}

export interface WorkflowTouch {
  id: string;
  dayOffset: number; // days after enrollment
  channel: Channel;
  /** "Initial reach", "Reminder", "Final attempt", etc. */
  intent: string;
}

export interface DefaultCadence {
  maxAttempts: number;
  /** Hours between retries of the same touch. */
  retryDelayHours: number;
  /** Hours to wait before considering a customer non-responsive. */
  silentHoursStart: string; // "HH:MM"
  silentHoursEnd: string;
}

export interface Persona {
  id: string;
  name: string;
  archetype: string; // "Skeptical lease-end", "Hot intent", "Wrong number" etc.
  brief: string;
  expectedBehavior: string;
}

export type TestOutcome = "pass" | "fail" | "warn";

export interface TestCase {
  id: string;
  personaId: string;
  scenarioLabel: string; // "Asks about price", "Wrong number", "Hard objection"
  /** Which rule from the agent brain this case is testing. */
  rule: { kind: "must" | "must_not" | "good"; rule: string };
  outcome: TestOutcome;
  observed: string; // the line the AI "said" — mock
}

export interface BatchTestResult {
  cases: TestCase[];
  passed: number;
  failed: number;
  warned: number;
  passRate: number; // 0..1
  /** Timestamp of the run — set when batch is run. */
  ranAt: string;
}

export interface UseCase {
  id: string;
  name: string;
  /** Short one-liner — "Re-engage lease-end customers 60-90 days out". */
  description: string;
  /** Plain English campaign intent, captured at the Describe step. */
  intent: string;
  category: "sales" | "service";
  subType: string;
  channels: Channel[];
  agentBrain: AgentBrain;
  workflow: WorkflowTouch[];
  cadence: DefaultCadence;
  personas: Persona[];
  batchResult: BatchTestResult | null;
  status: UseCaseStatus;
  /** Pinned per the PRD — every deployed Use Case carries an immutable promptVersionId. */
  promptVersionId: string;
  /** How many campaigns currently reference this Use Case. */
  campaignsUsing: number;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_CADENCE: DefaultCadence = {
  maxAttempts: 3,
  retryDelayHours: 24,
  silentHoursStart: "21:00",
  silentHoursEnd: "08:00",
};

export const DEFAULT_BRAIN: AgentBrain = {
  mustDo: [
    "Reintroduce the dealership and reason for the call within the first turn",
    "Listen for the customer's current interest before pitching",
    "End the call with a clear next step",
  ],
  goodToHave: [
    "Reference the original lead source or vehicle of interest",
    "Offer a callback at a time the lead specifies",
  ],
  mustNotDo: [
    "Do not commit to a specific price",
    "Do not transfer the lead without their consent",
    "Do not ignore an explicit objection",
  ],
  tone: "Friendly, professional",
  openingLine: "Hi {{firstName}}, this is Vini from {{dealer}}.",
};

export const DEFAULT_WORKFLOW: WorkflowTouch[] = [
  { id: "t1", dayOffset: 1, channel: "voice", intent: "First outreach" },
  { id: "t2", dayOffset: 3, channel: "sms", intent: "Follow-up nudge" },
  { id: "t3", dayOffset: 5, channel: "voice", intent: "Final attempt" },
];
