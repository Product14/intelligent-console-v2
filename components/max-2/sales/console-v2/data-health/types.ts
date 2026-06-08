/**
 * Data Layer & Connector Health — domain types.
 *
 * Models the front of the outbound journey: are a dealer's source systems
 * connected and fresh enough to run a campaign? Grounded in PRD 03 (entities),
 * 09 (A/B/C missing-data tiers), 14 (architecture), and the connector reality
 * of US dealer DMS/CRM/IMS vendors.
 */

/** Navigation target — mirrors SalesPage in console-v2-sales-experience.tsx
 *  (kept here to avoid a UI→shell import cycle; structurally identical). */
export type SalesPageLike =
  | "overview"
  | "data-health"
  | "data-health-connector"
  | "data-health-dealer"
  | "campaigns"
  | "action-items"
  | "appointments"
  | "customers"
  | "customer-profile";

export type ConnectorCategory = "DMS" | "Sales CRM" | "Service CRM" | "IMS" | "Website-ADF";

export type VendorFamily = "Cox" | "Solera" | "CDK" | "Reynolds" | "independent";

export type ConnectorState =
  | "connected"
  | "degraded-backfilling"
  | "certification-pending"
  | "disconnected";

/** Sync cadence — staleness is judged against the connector's OWN mode, not a flat clock. */
export type SyncMode =
  | "real-time API"
  | "webhook"
  | "intraday feed"
  | "nightly batch"
  | "CSV"
  | "on-demand lookup"
  | "certification-pending";

/** store = persisted & filterable · lookup = fetched on demand (rots/costs) · compute = derived. */
export type StoreMode = "store" | "lookup" | "compute";

export type EntityName = "Customer" | "Vehicle" | "Deal" | "Service RO" | "Lead";

export type Tier = "A" | "B" | "C";

export interface AuthorityField {
  entity: EntityName;
  field: string;
  winningSource: string;
  storeMode: StoreMode;
  freshnessLabel: string;
}

export interface SyncEvent {
  at: string;
  type: "sync" | "missed-run" | "outage" | "backfilling";
  label: string;
  state: "success" | "warning" | "error";
}

export interface Connector {
  id: string;
  vendor: string;
  category: ConnectorCategory;
  vendorFamily: VendorFamily;
  state: ConnectorState;
  syncMode: SyncMode;
  /** The freshness budget for this mode, in minutes (real-time≈5, intraday≈60, nightly≈1440, CSV≈days). */
  slaWindowMins: number;
  /** Minutes since last successful sync (deterministic mock — avoids wall-clock churn). */
  staleMins: number;
  lastSyncLabel: string;
  nextSyncLabel: string;
  recordCount: number;
  /** Plain-language cost of this connector being stale. */
  costHint?: string;
  authorityFields?: AuthorityField[];
  syncEvents?: SyncEvent[];
}

export interface DataHealthSummary {
  healthy: number;
  stale: number;
  disconnected: number;
  campaignsAtRisk: number;
}

export interface DataHealthData {
  asOf: string;
  phase1Seed: boolean;
  rooftop: string;
  summary: DataHealthSummary;
  connectors: Connector[];
}

export interface EntityHealth {
  entity: EntityName;
  symbol: string; // MaterialSymbol name
  recordCount: number;
  asOf: string;
  /** Source connectors feeding this entity, winner first (DMS wins on conflict). */
  sources: string[];
  confidence: { high: number; med: number; low: number };
  missing: { tierA: number; tierB: number; tierC: number };
  rotProneNote?: string;
}

export interface UnmergeCandidate {
  id: string;
  customerA: string;
  customerB: string;
  sharedKey: string;
  fields: { field: string; valueA: string; valueB: string; provenance: string }[];
}

export interface IdentityMigration {
  rowsBefore: number;
  customersAfter: number;
  matchKeyBreakdown: { phone: number; email: number; nameAddress: number };
  falseMergeRatePct: number;
  tuningBudgetNote: string;
  pendingResolution: number;
  unmergeCandidates: UnmergeCandidate[];
}

export type ReadinessStatus = "ready" | "degraded" | "blocked";

export interface ReadinessArchetype {
  archetype: string;
  status: ReadinessStatus;
  feedingSources: string[];
  reason?: string;
  draftPrompt: string;
  suppression?: { suppressed: number; hardBlocked: number; degraded: number };
}

export interface ComplianceGate {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail";
  detail: string;
}

export interface LedgerRow {
  audience: string;
  tier: Tier;
  kind: "suppression" | "hard-block";
  droppedCount: number;
  reason: string;
}

export interface ComplianceLedger {
  gates: ComplianceGate[];
  suppressions: LedgerRow[];
}

/* ── Fleet (internal CSM control tower) ─────────────────────────────── */

export interface TriageRow {
  id: string;
  dealerId: string;
  dealerName: string;
  location: string;
  connectorId: string;
  vendor: string;
  category: ConnectorCategory;
  entityFed: string;
  syncMode: SyncMode;
  slaWindowMins: number;
  staleMins: number;
  lastSyncLabel: string;
  nextSyncLabel: string;
  state: ConnectorState;
  riskScore: number;
  blastRadius: number; // # campaigns gated
  owner: string;
  acked: boolean;
}

export interface VendorFamilyRollup {
  family: VendorFamily;
  green: number;
  amber: number;
  red: number;
}

export interface FleetHealth {
  asOf: string;
  scope: "fleet" | "oem";
  kpis: {
    dealersMonitored: number;
    red: number;
    amber: number;
    green: number;
    slaBreached: number;
    degraded: number;
    oldestUnactioned: string;
  };
  triage: TriageRow[];
  vendorFamilies: VendorFamilyRollup[];
  droppedCount?: number;
}

export interface ProvenanceRow {
  source: string;
  fieldsWon: string[];
  confidence: "HIGH" | "MED" | "LOW";
}

export interface DownstreamImpact {
  campaignId: string;
  name: string;
  status: "gated" | "stale-counts";
  reason: string;
}

export interface DealerHealth {
  dealerId: string;
  dealerName: string;
  location: string;
  csm: string;
  oemDataOwner?: string;
  connectors: Connector[];
  provenance: { entity: EntityName; rows: ProvenanceRow[] }[];
  downstreamImpact: DownstreamImpact[];
}

/* ── Staleness severity — the load-bearing per-SLA rule ─────────────── */

export type Severity = "fresh" | "aging" | "stale";

/**
 * Judge staleness against the connector's OWN sync-mode SLA, never a flat clock.
 * A nightly batch at 20h is fresh; a real-time feed silent 10min is stale.
 */
export function staleness(staleMins: number, slaWindowMins: number, state: ConnectorState): Severity {
  if (state === "disconnected" || state === "degraded-backfilling") return "stale";
  if (state === "certification-pending") return "aging";
  const ratio = staleMins / Math.max(1, slaWindowMins);
  if (ratio <= 1) return "fresh";
  if (ratio <= 3) return "aging";
  return "stale";
}
