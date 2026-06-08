/**
 * Campaign Data Requirements — the "what a campaign needs, where it comes from,
 * and what it costs when missing" model behind the Data Health → Campaign Data Map.
 *
 * Grounded in the keys-required field audit (Downloads/leads-outbound) and the
 * connector reality of US dealer systems, extended to the current integration
 * set: 4 Sales CRMs (DriveCentric, Tekion CRM, CDK eLeads, VinSolutions) + the
 * ADF website lead feed, plus DMS / Service Scheduler / IMS / CSV as sources.
 *
 * Two questions this answers:
 *   1. What data does it take to run a campaign? (DataRequirement[])
 *   2. Where does each piece come from, and is it live? (per-source SourceCell[])
 * And the payoff: when a requirement is missing, which campaigns it blocks and why.
 */

/* ── Sources ────────────────────────────────────────────────────────── */

/** The system families a requirement can be sourced from. */
export type SourceCategory =
  | "Sales CRM"
  | "DMS"
  | "Service Scheduler"
  | "IMS"
  | "Website-ADF"
  | "CSV";

/** The concrete integrations we map field availability against. */
export type SourceKey =
  | "drivecentric"
  | "tekion-crm"
  | "cdk-elead"
  | "vinsolutions"
  | "adf"
  | "dms"
  | "service"
  | "ims"
  | "csv";

export interface SourceMeta {
  key: SourceKey;
  label: string;
  category: SourceCategory;
  glyph: string; // data-health Icon name
  /** Live connection status at this rooftop — drives the "where it comes from" legend. */
  connection: "connected" | "in-api" | "not-connected";
}

/**
 * The 4 CRMs the user named + ADF, then the non-CRM source systems.
 * `connection` is the rooftop's current integration state (mock/seed).
 */
export const SOURCES: SourceMeta[] = [
  { key: "drivecentric", label: "DriveCentric", category: "Sales CRM", glyph: "contacts", connection: "connected" },
  { key: "tekion-crm", label: "Tekion CRM", category: "Sales CRM", glyph: "contacts", connection: "connected" },
  { key: "cdk-elead", label: "CDK eLeads", category: "Sales CRM", glyph: "contacts", connection: "in-api" },
  { key: "vinsolutions", label: "VinSolutions", category: "Sales CRM", glyph: "contacts", connection: "connected" },
  { key: "adf", label: "ADF Lead Feed", category: "Website-ADF", glyph: "language", connection: "connected" },
  { key: "dms", label: "DMS (CDK / Reynolds)", category: "DMS", glyph: "database", connection: "in-api" },
  { key: "service", label: "Service Scheduler", category: "Service Scheduler", glyph: "build", connection: "connected" },
  { key: "ims", label: "Inventory (IMS)", category: "IMS", glyph: "inventory_2", connection: "connected" },
  { key: "csv", label: "CSV Upload", category: "CSV", glyph: "upload_file", connection: "in-api" },
];

export const SOURCE_BY_KEY: Record<SourceKey, SourceMeta> = Object.fromEntries(
  SOURCES.map((s) => [s.key, s])
) as Record<SourceKey, SourceMeta>;

/* ── Field availability per source ──────────────────────────────────── */

/**
 * pulled   — in the API AND ingested + used today.
 * in-api   — exposed by the source's API but we don't pull/use it yet.
 * csv-only — not in any live API; only arrives via a CSV export.
 * missing  — the source does not expose this data at all.
 * n/a      — this source isn't expected to own this field (skip in the matrix).
 */
export type FieldStatus = "pulled" | "in-api" | "csv-only" | "missing" | "n/a";

export interface SourceCell {
  source: SourceKey;
  status: FieldStatus;
  /** API field / endpoint note, grounded in the keys-required audit where known. */
  apiField?: string;
}

/* ── Requirement ────────────────────────────────────────────────────── */

export type Priority = "P0" | "P1" | "P2";

/** Roll-up status of a requirement across all its sources. */
export type RequirementStatus = "ready" | "partial" | "missing";

export interface DataRequirement {
  id: string;
  name: string;
  /** One-line description of the data itself. */
  what: string;
  /** WHY it matters — the cost of not having it. The "importance when missing" copy. */
  importance: string;
  priority: Priority;
  /** Primary source category shown on the card chip. */
  primaryCategory: SourceCategory;
  /** Per-source availability — feeds the "where it comes from" matrix. */
  sources: SourceCell[];
  /** Campaign archetype ids this requirement feeds (see CAMPAIGNS). */
  unlocks: string[];
  status: RequirementStatus;
}

export interface CampaignArchetype {
  id: string;
  label: string;
  glyph: string;
}

/** Campaign set drawn from the multi-CRM outbound use-case coverage. */
export const CAMPAIGNS: CampaignArchetype[] = [
  { id: "speed_to_lead", label: "Speed-to-Lead", glyph: "bolt" },
  { id: "hot_lead", label: "Hot-Lead Follow-up", glyph: "rocket_launch" },
  { id: "reengage", label: "Lead Re-engagement", glyph: "sync" },
  { id: "dormant", label: "Dormant Reactivation", glyph: "bedtime" },
  { id: "no_show", label: "No-Show / Test-Drive Recovery", glyph: "person_search" },
  { id: "ev_interest", label: "EV Interest Follow-up", glyph: "bolt" },
  { id: "equity", label: "Equity Mining", glyph: "receipt_long" },
  { id: "trade_in", label: "Trade-In Outreach", glyph: "sync_alt" },
  { id: "lease_end", label: "Lease-End Outreach", glyph: "directions_car" },
  { id: "service_to_sales", label: "Service-to-Sales", glyph: "build" },
  { id: "declined_service", label: "Declined-Service Recovery", glyph: "build" },
  { id: "recall", label: "Recall", glyph: "emergency" },
  { id: "birthday", label: "Birthday / Life-Stage", glyph: "auto_awesome" },
];

export const CAMPAIGN_BY_ID: Record<string, CampaignArchetype> = Object.fromEntries(
  CAMPAIGNS.map((c) => [c.id, c])
);

/* ── The requirements (grounded field audit, 4 CRM + ADF) ───────────── */

export const DATA_REQUIREMENTS: DataRequirement[] = [
  /* ---- P0 — foundation: no campaign dials without these ---- */
  {
    id: "identity",
    name: "Contact identity & reachability",
    what: "Name, mobile, email, mailing address — the dial-able record itself.",
    importance:
      "Without a verified phone/email there is no campaign at all — every archetype dials this record first. Missing or stale contacts silently shrink every audience.",
    priority: "P0",
    primaryCategory: "Sales CRM",
    status: "ready",
    unlocks: ["speed_to_lead", "hot_lead", "reengage", "dormant", "no_show", "equity", "trade_in", "lease_end", "service_to_sales", "declined_service", "recall", "birthday"],
    sources: [
      { source: "drivecentric", status: "pulled", apiField: "contact.phone / email / address" },
      { source: "tekion-crm", status: "pulled", apiField: "customer.phones[] / emails[] / residences[]" },
      { source: "cdk-elead", status: "pulled", apiField: "Prospect.PhoneNumbers / Emails" },
      { source: "vinsolutions", status: "pulled", apiField: "Contact.Phone / Email / Addresses" },
      { source: "adf", status: "pulled", apiField: "<contact><phone><email>" },
      { source: "dms", status: "pulled", apiField: "customer master (address authority)" },
      { source: "csv", status: "csv-only", apiField: "customer.* columns" },
    ],
  },
  {
    id: "consent",
    name: "Consent & opt-out (TCPA / DNC)",
    what: "Per-channel SMS/call opt-in, opt-out flags, and DNC scrub status.",
    importance:
      "A legal gate, not a nice-to-have. Missing SMS opt-in hard-blocks the entire SMS channel for that customer (voice may stay open). No DNC scrub = compliance exposure on every dial.",
    priority: "P0",
    primaryCategory: "Sales CRM",
    status: "partial",
    unlocks: ["speed_to_lead", "hot_lead", "reengage", "dormant", "no_show", "trade_in", "lease_end", "service_to_sales"],
    sources: [
      { source: "drivecentric", status: "pulled", apiField: "communicationPreference / optOut" },
      { source: "tekion-crm", status: "in-api", apiField: "consentStatus — exposed, not pulled" },
      { source: "cdk-elead", status: "in-api", apiField: "OptOut flags — not pulled" },
      { source: "vinsolutions", status: "pulled", apiField: "Contact.DoNotCall / DoNotEmail" },
      { source: "csv", status: "csv-only", apiField: "customer.opt_in.sms — often a missing column" },
    ],
  },
  {
    id: "lead_status",
    name: "Lead status, source & vehicle-of-interest",
    what: "Pipeline stage, lead source/sub-source, and the vehicle the lead asked about (VOI).",
    importance:
      "Drives both targeting and the call script. Without status + VOI the agent dials blind — no idea if this is a fresh internet lead, a working deal, or a lost opportunity, and nothing specific to pitch.",
    priority: "P0",
    primaryCategory: "Sales CRM",
    status: "ready",
    unlocks: ["speed_to_lead", "hot_lead", "reengage", "dormant", "ev_interest"],
    sources: [
      { source: "drivecentric", status: "pulled", apiField: "opportunity.status / vehiclesOfInterest" },
      { source: "tekion-crm", status: "pulled", apiField: "status / vehicleOfInterest / source" },
      { source: "cdk-elead", status: "pulled", apiField: "Opportunity.Status / VehicleSought" },
      { source: "vinsolutions", status: "pulled", apiField: "leadGroupCategory / VOI" },
      { source: "adf", status: "pulled", apiField: "<vehicle interest='buy'>" },
    ],
  },
  {
    id: "last_contacted",
    name: "Last-contacted & engagement timestamps",
    what: "Last/first contacted & engaged times, attempt counts per channel.",
    importance:
      "Powers stale-lead detection, optimal callback timing, and frequency caps. Exposed by the CRM APIs but not yet pulled — so dormant vs hot can't be told apart and we risk over-dialing.",
    priority: "P0",
    primaryCategory: "Sales CRM",
    status: "partial",
    unlocks: ["hot_lead", "reengage", "dormant", "no_show"],
    sources: [
      { source: "drivecentric", status: "in-api", apiField: "latestAttemptDate / latestManualAttemptDate" },
      { source: "tekion-crm", status: "in-api", apiField: "lastContactedTime / firstEngagedTime / lastEngagedTime" },
      { source: "cdk-elead", status: "in-api", apiField: "LastActivityDate — not pulled" },
      { source: "vinsolutions", status: "in-api", apiField: "lastActivityDate — partial" },
    ],
  },
  {
    id: "lead_type",
    name: "Lead type / intent classification",
    what: "Purchase vs acquisition-only vs service intent on the lead.",
    importance:
      "Completely changes the script — a sell-your-car lead and a buy lead are opposite conversations. Available in the APIs but unused, so acquisition and service-intent campaigns can't be segmented.",
    priority: "P0",
    primaryCategory: "Sales CRM",
    status: "partial",
    unlocks: ["trade_in", "service_to_sales", "reengage"],
    sources: [
      { source: "tekion-crm", status: "in-api", apiField: "type (VEHICLE_PURCHASE / VEHICLE_ACQUISITION_ONLY)" },
      { source: "vinsolutions", status: "in-api", apiField: "leadGroupCategory — not pulled" },
      { source: "drivecentric", status: "in-api", apiField: "opportunity.type — not pulled" },
      { source: "cdk-elead", status: "missing", apiField: "no intent classification exposed" },
    ],
  },

  /* ---- P1 — sharpens targeting, unlocks whole campaign families ---- */
  {
    id: "owned_vehicle_equity",
    name: "Owned vehicle, ownership & equity",
    what: "VIN, ownership/loan type, payoff amount, ACV / equity estimate.",
    importance:
      "The backbone of equity & lease-end campaigns. Sourced from the DMS (loan/ownership) + a valuation feed (ACV). When mileage or payoff is stale, equity confidence drops and the agent must soften the trade line.",
    priority: "P1",
    primaryCategory: "DMS",
    status: "partial",
    unlocks: ["equity", "trade_in", "lease_end"],
    sources: [
      { source: "dms", status: "pulled", apiField: "vehicle.ownershipType / loanTerms / payoff" },
      { source: "tekion-crm", status: "in-api", apiField: "tradePayOff / actualCashValue — not pulled" },
      { source: "drivecentric", status: "in-api", apiField: "payoffAmount / allowance / actualCashValue" },
      { source: "vinsolutions", status: "in-api", apiField: "trade fields — not pulled" },
      { source: "csv", status: "csv-only", apiField: "historic sales backfill (VIN + ownership)" },
    ],
  },
  {
    id: "trade_financials",
    name: "Trade-in financial details",
    what: "Trade allowance, payoff, ACV, lien-holder — the equity position.",
    importance:
      "Determines whether a customer is equity-positive (upgrade pitch) or underwater (payoff-rescue pitch). All in the APIs but unused — so trade-in outreach can't be tailored to the customer's actual position.",
    priority: "P1",
    primaryCategory: "Sales CRM",
    status: "missing",
    unlocks: ["trade_in", "equity"],
    sources: [
      { source: "tekion-crm", status: "in-api", apiField: "tradeAllowance / tradePayOff / lienHolderDetails" },
      { source: "drivecentric", status: "in-api", apiField: "payoffAmount / allowance / actualCashValue (meta)" },
      { source: "cdk-elead", status: "missing", apiField: "not exposed" },
      { source: "vinsolutions", status: "missing", apiField: "not exposed" },
    ],
  },
  {
    id: "appointments",
    name: "Appointments, no-shows & cancellations",
    what: "Booked appointments, show / no-show outcome, cancellation reason.",
    importance:
      "No-show recovery is a top-converting campaign — but cancelled appointments are dropped at ingest instead of tracked, so the no-show audience can't even be built.",
    priority: "P1",
    primaryCategory: "Sales CRM",
    status: "missing",
    unlocks: ["no_show"],
    sources: [
      { source: "drivecentric", status: "missing", apiField: "cancelled appts filtered OUT at ingest" },
      { source: "tekion-crm", status: "in-api", apiField: "appointments[].status — not pulled" },
      { source: "vinsolutions", status: "in-api", apiField: "isOnShowroom / appointment — partial" },
      { source: "cdk-elead", status: "in-api", apiField: "Appointment.Outcome — not pulled" },
    ],
  },
  {
    id: "showroom_visits",
    name: "Showroom visits & physical activity",
    what: "Visit count and on-showroom status — walk-in vs digital browser.",
    importance:
      "The difference between a serious in-market shopper and a tire-kicker. Exposed across CRMs but unused, so high-intent walk-in-no-buy follow-up can't be prioritized.",
    priority: "P1",
    primaryCategory: "Sales CRM",
    status: "partial",
    unlocks: ["hot_lead", "no_show"],
    sources: [
      { source: "tekion-crm", status: "in-api", apiField: "numberOfVisits — not pulled" },
      { source: "drivecentric", status: "in-api", apiField: "appointments[].show — not pulled" },
      { source: "vinsolutions", status: "in-api", apiField: "isOnShowroom — not pulled" },
    ],
  },
  {
    id: "service_history",
    name: "Service history & declined work",
    what: "RO history, declined-service line items, RO mileage.",
    importance:
      "Feeds service-to-sales and declined-service recovery, and supplies the freshest mileage for equity math. Sourced from the Service Scheduler — if it's not connected, two campaign families go dark and equity confidence drops.",
    priority: "P1",
    primaryCategory: "Service Scheduler",
    status: "ready",
    unlocks: ["service_to_sales", "declined_service", "equity"],
    sources: [
      { source: "service", status: "pulled", apiField: "RO.opCodes / declinedWork / mileage" },
      { source: "tekion-crm", status: "pulled", apiField: "serviceHistory (Tekion unified)" },
      { source: "dms", status: "in-api", apiField: "service RO via DMS — fallback" },
      { source: "csv", status: "csv-only", apiField: "RO export columns" },
    ],
  },
  {
    id: "inventory_match",
    name: "Live inventory match",
    what: "In-stock units, price, and spec to match against lead interest.",
    importance:
      "Lets the agent offer a real, in-stock vehicle instead of a generic pitch. Sourced from the IMS — stale inventory means offering cars that already sold.",
    priority: "P1",
    primaryCategory: "IMS",
    status: "ready",
    unlocks: ["hot_lead", "ev_interest", "equity"],
    sources: [
      { source: "ims", status: "pulled", apiField: "inventory.inStock / price / VIN" },
      { source: "vinsolutions", status: "in-api", apiField: "sellingPrice / msrp / driveTrain — not pulled" },
    ],
  },
  {
    id: "transcripts",
    name: "Call transcripts & communication logs",
    what: "Call outcomes, SMS/email content, call duration, sentiment cues.",
    importance:
      "Unlocks sentiment-based routing, warm-vs-cold scoring, and objection-aware scripts. Almost no transcript data is pulled from any CRM today — so every prior conversation is invisible to the agent.",
    priority: "P1",
    primaryCategory: "Sales CRM",
    status: "missing",
    unlocks: ["reengage", "hot_lead", "no_show"],
    sources: [
      { source: "tekion-crm", status: "in-api", apiField: "leads/{id}/notes — title+desc only" },
      { source: "cdk-elead", status: "in-api", apiField: "ActivityHistory — not pulled" },
      { source: "drivecentric", status: "missing", apiField: "no comm history pulled" },
      { source: "vinsolutions", status: "missing", apiField: "comm logs not via standard API" },
    ],
  },

  /* ---- P2 — enrichment & profile depth ---- */
  {
    id: "contact_prefs",
    name: "Contact preferences (channel & time)",
    what: "Preferred contact method and preferred time-of-day window.",
    importance:
      "Channel- and time-optimized outreach lifts contact rates and prevents opt-outs. Available but unused, so dials land at the wrong time on the wrong channel.",
    priority: "P2",
    primaryCategory: "Sales CRM",
    status: "partial",
    unlocks: ["reengage", "dormant"],
    sources: [
      { source: "vinsolutions", status: "in-api", apiField: "PreferredContactMethod / PreferredContactTime" },
      { source: "drivecentric", status: "in-api", apiField: "communicationPreference — not pulled" },
    ],
  },
  {
    id: "demographics",
    name: "Demographics & date of birth",
    what: "DOB, age band, life-stage signals.",
    importance:
      "Enables birthday and life-stage campaigns and age-appropriate vehicle recommendations. Pulled in some CRMs but never used in campaign logic.",
    priority: "P2",
    primaryCategory: "Sales CRM",
    status: "partial",
    unlocks: ["birthday"],
    sources: [
      { source: "tekion-crm", status: "in-api", apiField: "dateOfBirth — pulled, unused" },
      { source: "drivecentric", status: "in-api", apiField: "birthdate — not pulled" },
      { source: "cdk-elead", status: "missing", apiField: "not exposed" },
    ],
  },
  {
    id: "recall_feed",
    name: "OEM recall / safety feed",
    what: "Open NHTSA / OEM safety recalls keyed to owned VINs.",
    importance:
      "Recall outreach is DNC-exempt and compliance-grade — but it can only fire when the recall feed is live and joined to owned VINs. No feed, no recall campaign.",
    priority: "P2",
    primaryCategory: "DMS",
    status: "missing",
    unlocks: ["recall"],
    sources: [
      { source: "dms", status: "in-api", apiField: "owned VIN list (join key)" },
      { source: "csv", status: "csv-only", apiField: "NHTSA recall export" },
    ],
  },
];

/* ── Derived helpers ────────────────────────────────────────────────── */

export const STATUS_RANK: Record<RequirementStatus, number> = { missing: 0, partial: 1, ready: 2 };
export const PRIORITY_RANK: Record<Priority, number> = { P0: 0, P1: 1, P2: 2 };

/**
 * The canonical (unified) field a requirement resolves to in our data layer.
 * Mapping a source key means pointing a source's API field / CSV column at this.
 */
export const CANONICAL_FIELD: Record<string, string> = {
  identity: "customer.phone · email · address",
  consent: "customer.consent.sms · dnc_status",
  lead_status: "lead.status · source · vehicle_of_interest",
  last_contacted: "lead.last_contacted_at · attempts",
  lead_type: "lead.type",
  owned_vehicle_equity: "vehicle.vin · ownership · equity",
  trade_financials: "trade.payoff · acv · allowance",
  appointments: "appointment.status · outcome",
  showroom_visits: "lead.showroom_visits",
  service_history: "service.ro · declined_work · mileage",
  inventory_match: "inventory.in_stock · price",
  transcripts: "comm.transcript · outcome · sentiment",
  contact_prefs: "customer.pref_channel · pref_time",
  demographics: "customer.dob",
  recall_feed: "vehicle.open_recall",
};

/** Campaigns blocked or degraded because a requirement they need isn't ready. */
export function campaignsAtRisk(reqs: DataRequirement[] = DATA_REQUIREMENTS): {
  blocked: Set<string>;
  degraded: Set<string>;
} {
  const blocked = new Set<string>();
  const degraded = new Set<string>();
  for (const r of reqs) {
    if (r.status === "missing") r.unlocks.forEach((c) => blocked.add(c));
    else if (r.status === "partial") r.unlocks.forEach((c) => degraded.add(c));
  }
  // A campaign that's outright blocked shouldn't also count as merely degraded.
  blocked.forEach((c) => degraded.delete(c));
  return { blocked, degraded };
}

export function requirementSummary(reqs: DataRequirement[] = DATA_REQUIREMENTS) {
  const ready = reqs.filter((r) => r.status === "ready").length;
  const partial = reqs.filter((r) => r.status === "partial").length;
  const missing = reqs.filter((r) => r.status === "missing").length;
  return { ready, partial, missing, total: reqs.length };
}
