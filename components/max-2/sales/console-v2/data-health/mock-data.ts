/**
 * Data Layer & Connector Health — Phase-1 statically-seeded mock data.
 *
 * Everything here is `phase1Seed: true` — counts are point-in-time seeds, not a
 * live recompute. The UI footnotes this so ops never over-trusts a number.
 * Connector realism follows real DMS generations: Tekion = real-time API;
 * CDK/Dealertrack = certified-API-only; Reynolds RCI = batch/CSV. The CDK
 * "degraded-backfilling" state seeds the June-2024 ransomware incident.
 */

import type {
  DataHealthData,
  EntityHealth,
  IdentityMigration,
  ReadinessArchetype,
  ComplianceLedger,
  FleetHealth,
  DealerHealth,
} from "./types";

export const dataHealthData: DataHealthData = {
  asOf: "Today 6:18 AM",
  phase1Seed: true,
  rooftop: "Feldmann Imports",
  summary: { healthy: 3, stale: 1, disconnected: 1, campaignsAtRisk: 2 },
  connectors: [
    {
      id: "cdk-dms",
      vendor: "CDK Global",
      category: "DMS",
      vendorFamily: "CDK",
      state: "degraded-backfilling",
      syncMode: "nightly batch",
      slaWindowMins: 1440,
      staleMins: 4320,
      lastSyncLabel: "Jun 1, 2:10 AM",
      nextSyncLabel: "backfilling…",
      recordCount: 18420,
      costHint: "Deals + OEM data ~3 days behind — equity & lease counts are understated until backfill completes.",
      authorityFields: [
        { entity: "Deal", field: "gross / PVR", winningSource: "CDK Global", storeMode: "store", freshnessLabel: "Jun 1, 2:10 AM" },
        { entity: "Deal", field: "F&I product expiry", winningSource: "CDK Global", storeMode: "store", freshnessLabel: "Jun 1, 2:10 AM" },
        { entity: "Vehicle", field: "ownership type", winningSource: "CDK Global", storeMode: "store", freshnessLabel: "Jun 1, 2:10 AM" },
        { entity: "Customer", field: "address", winningSource: "CDK Global", storeMode: "store", freshnessLabel: "Jun 1, 2:10 AM" },
      ],
      syncEvents: [
        { at: "May 31, 1:30 AM", type: "sync", label: "Nightly batch — 18,420 rows", state: "success" },
        { at: "Jun 1, 2:10 AM", type: "sync", label: "Nightly batch — 18,420 rows", state: "success" },
        { at: "Jun 1, 9:40 PM", type: "outage", label: "Vendor incident — DMS portal offline (ransomware)", state: "error" },
        { at: "Jun 2 – Jun 3", type: "missed-run", label: "2 nightly runs missed", state: "error" },
        { at: "Jun 4, 3:05 AM", type: "backfilling", label: "Backfill started — catching up 3 days", state: "warning" },
      ],
    },
    {
      id: "vinsolutions-crm",
      vendor: "VinSolutions",
      category: "Sales CRM",
      vendorFamily: "Cox",
      state: "connected",
      syncMode: "intraday feed",
      slaWindowMins: 60,
      staleMins: 12,
      lastSyncLabel: "Today 6:18 AM",
      nextSyncLabel: "Today 7:18 AM",
      recordCount: 9240,
      authorityFields: [
        { entity: "Lead", field: "status / VOI", winningSource: "VinSolutions", storeMode: "store", freshnessLabel: "Today 6:18 AM" },
        { entity: "Lead", field: "last touch", winningSource: "VinSolutions", storeMode: "store", freshnessLabel: "Today 6:18 AM" },
        { entity: "Customer", field: "phone / email", winningSource: "VinSolutions", storeMode: "store", freshnessLabel: "Today 6:18 AM" },
      ],
      syncEvents: [
        { at: "Today 5:18 AM", type: "sync", label: "Intraday feed — 41 new leads", state: "success" },
        { at: "Today 6:18 AM", type: "sync", label: "Intraday feed — 18 new leads", state: "success" },
      ],
    },
    {
      id: "tekion-service",
      vendor: "Tekion Service",
      category: "Service CRM",
      vendorFamily: "independent",
      state: "connected",
      syncMode: "nightly batch",
      slaWindowMins: 1440,
      staleMins: 520,
      lastSyncLabel: "Today 1:30 AM",
      nextSyncLabel: "Tomorrow 1:30 AM",
      recordCount: 6110,
      authorityFields: [
        { entity: "Service RO", field: "OP codes / declined work", winningSource: "Tekion Service", storeMode: "store", freshnessLabel: "Today 1:30 AM" },
        { entity: "Service RO", field: "RO mileage", winningSource: "Tekion Service", storeMode: "store", freshnessLabel: "Today 1:30 AM" },
      ],
      syncEvents: [
        { at: "Yesterday 1:30 AM", type: "sync", label: "Nightly batch — 6,090 ROs", state: "success" },
        { at: "Today 1:30 AM", type: "sync", label: "Nightly batch — 6,110 ROs", state: "success" },
      ],
    },
    {
      id: "vauto-ims",
      vendor: "vAuto",
      category: "IMS",
      vendorFamily: "Cox",
      state: "connected",
      syncMode: "intraday feed",
      slaWindowMins: 60,
      staleMins: 22,
      lastSyncLabel: "Today 6:05 AM",
      nextSyncLabel: "Today 7:05 AM",
      recordCount: 312,
      authorityFields: [
        { entity: "Vehicle", field: "inventory in-stock", winningSource: "vAuto", storeMode: "store", freshnessLabel: "Today 6:05 AM" },
      ],
      syncEvents: [
        { at: "Today 5:05 AM", type: "sync", label: "Inventory refresh — 312 units", state: "success" },
        { at: "Today 6:05 AM", type: "sync", label: "Inventory refresh — 312 units", state: "success" },
      ],
    },
    {
      id: "adf-feed",
      vendor: "ADF Lead Feed",
      category: "Website-ADF",
      vendorFamily: "independent",
      state: "connected",
      syncMode: "webhook",
      slaWindowMins: 5,
      staleMins: 41,
      lastSyncLabel: "Today 5:39 AM",
      nextSyncLabel: "on event",
      recordCount: 1840,
      costHint: "Speed-to-lead can't fire — new website leads may be arriving without a sub-2-min trigger.",
      authorityFields: [
        { entity: "Lead", field: "new-lead event", winningSource: "ADF Lead Feed", storeMode: "store", freshnessLabel: "Today 5:39 AM" },
      ],
      syncEvents: [
        { at: "Today 5:31 AM", type: "sync", label: "Webhook — lead received", state: "success" },
        { at: "Today 5:39 AM", type: "sync", label: "Webhook — lead received", state: "success" },
        { at: "Today 5:44 AM+", type: "missed-run", label: "No events for 41 min — silent on a real-time channel", state: "warning" },
      ],
    },
  ],
};

export const entityHealthData: EntityHealth[] = [
  {
    entity: "Customer",
    symbol: "person",
    recordCount: 14820,
    asOf: "Today 6:18 AM",
    sources: ["VinSolutions", "CDK Global", "Historic CSV"],
    confidence: { high: 60, med: 28, low: 12 },
    missing: { tierA: 0, tierB: 340, tierC: 0 },
    rotProneNote: "340 customers missing SMS opt-in → SMS hard-blocked for them (voice stays open).",
  },
  {
    entity: "Vehicle",
    symbol: "directions_car",
    recordCount: 9100,
    asOf: "Jun 1, 2:10 AM",
    sources: ["CDK Global", "Black Book", "Historic CSV"],
    confidence: { high: 42, med: 38, low: 20 },
    missing: { tierA: 120, tierB: 0, tierC: 880 },
    rotProneNote: "Mileage last seen 8mo ago on 1,240 vehicles → equity confidence forced LOW (≈$1.5–3k swing).",
  },
  {
    entity: "Deal",
    symbol: "receipt_long",
    recordCount: 7650,
    asOf: "Jun 1, 2:10 AM",
    sources: ["CDK Global"],
    confidence: { high: 80, med: 15, low: 5 },
    missing: { tierA: 0, tierB: 0, tierC: 60 },
    rotProneNote: "Sourced from CDK — 3 days behind during the current backfill.",
  },
  {
    entity: "Service RO",
    symbol: "build",
    recordCount: 6110,
    asOf: "Today 1:30 AM",
    sources: ["Tekion Service"],
    confidence: { high: 74, med: 20, low: 6 },
    missing: { tierA: 0, tierB: 0, tierC: 210 },
  },
  {
    entity: "Lead",
    symbol: "person_search",
    recordCount: 12490,
    asOf: "Today 6:18 AM",
    sources: ["VinSolutions", "ADF Lead Feed"],
    confidence: { high: 88, med: 9, low: 3 },
    missing: { tierA: 0, tierB: 0, tierC: 0 },
  },
];

export const identityMigrationData: IdentityMigration = {
  rowsBefore: 31240,
  customersAfter: 14820,
  matchKeyBreakdown: { phone: 9200, email: 3800, nameAddress: 1820 },
  falseMergeRatePct: 2.1,
  tuningBudgetNote: "Merge rules still settling — budget a 60–90 day tuning window before counts are ground truth.",
  pendingResolution: 142,
  unmergeCandidates: [
    {
      id: "merge-1",
      customerA: "Michael R. Torres",
      customerB: "Mike Torres",
      sharedKey: "phone (555) 234-9921",
      fields: [
        { field: "email", valueA: "m.torres@gmail.com", valueB: "miketorres84@yahoo.com", provenance: "VinSolutions vs Historic CSV" },
        { field: "owned vehicle", valueA: "2021 RAV4", valueB: "2018 Tacoma", provenance: "CDK vs CSV" },
      ],
    },
    {
      id: "merge-2",
      customerA: "Jennifer Park",
      customerB: "J. Park (household)",
      sharedKey: "name + address",
      fields: [
        { field: "phone", valueA: "(555) 887-1200", valueB: "(555) 887-3471", provenance: "VinSolutions vs CDK" },
      ],
    },
  ],
};

export const campaignReadinessData: ReadinessArchetype[] = [
  {
    archetype: "Lease-end",
    status: "ready",
    feedingSources: ["Deal", "Vehicle"],
    draftPrompt:
      "Outbound to customers whose lease matures in the next 60–90 days. Offer buy-out, trade, or walk. Voice + SMS, 5 touches over 21 days.",
    suppression: { suppressed: 40, hardBlocked: 0, degraded: 0 },
  },
  {
    archetype: "Service-to-sales",
    status: "ready",
    feedingSources: ["Service RO", "Deal"],
    draftPrompt:
      "Re-engage customers who declined recommended service in the last 60 days and are equity-positive — pivot to an upgrade conversation. SMS + voice.",
    suppression: { suppressed: 0, hardBlocked: 0, degraded: 0 },
  },
  {
    archetype: "Equity mining",
    status: "degraded",
    feedingSources: ["Vehicle", "Black Book", "Deal"],
    reason: "Mileage 8mo stale on 1,240 vehicles → equity confidence LOW → agent softens the trade line.",
    draftPrompt:
      "Mine equity from customers with >$5K positive equity and offer an upgrade. Frame the trade value as an estimate. Voice + SMS, 5 touches over 21 days.",
    suppression: { suppressed: 120, hardBlocked: 0, degraded: 880 },
  },
  {
    archetype: "Recall",
    status: "blocked",
    feedingSources: ["Vehicle", "NHTSA feed"],
    reason: "NHTSA recall feed offline — recall campaign cannot fire until it's restored.",
    draftPrompt: "Voice-only recall outreach. Compliance-grade, DNC-exempt. State the recall in the first 10 seconds.",
  },
  {
    archetype: "Speed-to-lead",
    status: "blocked",
    feedingSources: ["ADF feed", "Inventory"],
    reason: "ADF lead feed silent 41 min — the sub-2-min trigger is unreliable. Fix the feed before launching.",
    draftPrompt: "Instant outreach to new internet leads within 2 minutes. SMS + AI voice with voicemail fallback.",
  },
];

export const complianceLedgerData: ComplianceLedger = {
  gates: [
    { id: "state-tz", label: "State / timezone", status: "pass", detail: "Derived for 99.2% of customers; area-code fallback used as last resort." },
    { id: "opt-in", label: "Per-channel opt-in / out", status: "warn", detail: "340 customers missing SMS opt-in → SMS hard-blocked for them (voice stays open)." },
    { id: "dnc", label: "DNC scrub", status: "pass", detail: "Scrubbed against federal + TX state DNC nightly." },
    { id: "10dlc", label: "10DLC A2P registration", status: "pass", detail: "Brand + campaign approved — SMS at scale enabled." },
  ],
  suppressions: [
    { audience: "All SMS campaigns", tier: "B", kind: "hard-block", droppedCount: 340, reason: "Missing SMS opt-in — legal gate (voice remains open)." },
    { audience: "Equity mining", tier: "A", kind: "suppression", droppedCount: 120, reason: "No owned-vehicle Y/M/M on file — agent has nothing to pitch." },
    { audience: "Equity mining", tier: "C", kind: "suppression", droppedCount: 880, reason: "Mileage stale → equity LOW → softened talk-track (not dropped, degraded)." },
    { audience: "Lease-end", tier: "A", kind: "suppression", droppedCount: 40, reason: "No lease end date resolvable from Deal." },
  ],
};

/* ── Fleet (internal CSM control tower) ─────────────────────────────── */

export const fleetHealthData: FleetHealth = {
  asOf: "Today 6:20 AM",
  scope: "fleet",
  kpis: { dealersMonitored: 52, red: 6, amber: 11, green: 35, slaBreached: 6, degraded: 3, oldestUnactioned: "2d 4h" },
  vendorFamilies: [
    { family: "CDK", green: 8, amber: 4, red: 3 },
    { family: "Cox", green: 14, amber: 3, red: 1 },
    { family: "Reynolds", green: 5, amber: 2, red: 2 },
    { family: "Solera", green: 3, amber: 1, red: 0 },
    { family: "independent", green: 5, amber: 1, red: 0 },
  ],
  droppedCount: 0,
  triage: [
    { id: "t1", dealerId: "feldmann", dealerName: "Feldmann Imports", location: "Bloomington, MN", connectorId: "cdk-dms", vendor: "CDK Global", category: "DMS", entityFed: "Deal · Vehicle", syncMode: "nightly batch", slaWindowMins: 1440, staleMins: 4320, lastSyncLabel: "Jun 1, 2:10 AM", nextSyncLabel: "backfilling…", state: "degraded-backfilling", riskScore: 96, blastRadius: 4, owner: "A. Mehta", acked: false },
    { id: "t2", dealerId: "prestige", dealerName: "Prestige Auto Group", location: "Dallas, TX", connectorId: "reynolds-dms", vendor: "Reynolds RCI", category: "DMS", entityFed: "Deal", syncMode: "CSV", slaWindowMins: 4320, staleMins: 11520, lastSyncLabel: "May 26", nextSyncLabel: "manual", state: "disconnected", riskScore: 91, blastRadius: 3, owner: "A. Mehta", acked: false },
    { id: "t3", dealerId: "lakeside", dealerName: "Lakeside Honda", location: "Tampa, FL", connectorId: "adf", vendor: "ADF Lead Feed", category: "Website-ADF", entityFed: "Lead", syncMode: "webhook", slaWindowMins: 5, staleMins: 95, lastSyncLabel: "Today 4:45 AM", nextSyncLabel: "on event", state: "connected", riskScore: 84, blastRadius: 2, owner: "R. Shah", acked: false },
    { id: "t4", dealerId: "summit", dealerName: "Summit Ford", location: "Denver, CO", connectorId: "xtime", vendor: "xTime", category: "Service CRM", entityFed: "Service RO", syncMode: "nightly batch", slaWindowMins: 1440, staleMins: 3000, lastSyncLabel: "Jun 2", nextSyncLabel: "tonight", state: "connected", riskScore: 71, blastRadius: 1, owner: "R. Shah", acked: false },
    { id: "t5", dealerId: "bayarea", dealerName: "Bay Area Toyota", location: "Fremont, CA", connectorId: "dealertrack", vendor: "Dealertrack", category: "DMS", entityFed: "Deal", syncMode: "certification-pending", slaWindowMins: 1440, staleMins: 0, lastSyncLabel: "Never · cert req. Jun 3", nextSyncLabel: "cert pending", state: "certification-pending", riskScore: 60, blastRadius: 2, owner: "A. Mehta", acked: true },
    { id: "t6", dealerId: "metro", dealerName: "Metro Nissan", location: "Phoenix, AZ", connectorId: "vauto", vendor: "vAuto", category: "IMS", entityFed: "Vehicle", syncMode: "intraday feed", slaWindowMins: 60, staleMins: 210, lastSyncLabel: "Today 2:50 AM", nextSyncLabel: "Today 7:00 AM", state: "connected", riskScore: 48, blastRadius: 1, owner: "R. Shah", acked: false },
  ],
};

const FELDMANN_CONNECTORS = dataHealthData.connectors;

export const dealerHealthData: DealerHealth[] = [
  {
    dealerId: "feldmann",
    dealerName: "Feldmann Imports",
    location: "Bloomington, MN",
    csm: "A. Mehta",
    oemDataOwner: "Cox Automotive (Bridge)",
    connectors: FELDMANN_CONNECTORS,
    provenance: [
      { entity: "Customer", rows: [
        { source: "VinSolutions", fieldsWon: ["phone", "email", "last touch"], confidence: "HIGH" },
        { source: "CDK Global", fieldsWon: ["address"], confidence: "MED" },
      ] },
      { entity: "Vehicle", rows: [
        { source: "CDK Global", fieldsWon: ["VIN", "ownership type", "loan terms"], confidence: "MED" },
        { source: "Black Book", fieldsWon: ["ACV / equity estimate"], confidence: "LOW" },
      ] },
      { entity: "Deal", rows: [
        { source: "CDK Global", fieldsWon: ["gross", "F&I expiry", "deal date"], confidence: "MED" },
      ] },
    ],
    downstreamImpact: [
      { campaignId: "camp-2", name: "Equity Mining — Q2", status: "stale-counts", reason: "Vehicle/Deal counts 3 days behind during CDK backfill." },
      { campaignId: "camp-5", name: "Lease-End Wave", status: "gated", reason: "Lease end dates resolve from CDK Deal — paused until backfill completes." },
    ],
  },
  {
    dealerId: "prestige",
    dealerName: "Prestige Auto Group",
    location: "Dallas, TX",
    csm: "A. Mehta",
    oemDataOwner: "Reynolds & Reynolds",
    connectors: [
      { id: "reynolds-dms", vendor: "Reynolds RCI", category: "DMS", vendorFamily: "Reynolds", state: "disconnected", syncMode: "CSV", slaWindowMins: 4320, staleMins: 11520, lastSyncLabel: "May 26", nextSyncLabel: "manual upload", recordCount: 22100, costHint: "No API — last CSV backfill was 8 days ago. Every deal-based campaign is running on stale counts.", syncEvents: [
        { at: "May 26", type: "sync", label: "Manual CSV backfill — 22,100 rows", state: "success" },
        { at: "May 27 – Jun 4", type: "missed-run", label: "No upload for 8 days", state: "error" },
      ] },
      { id: "drivecentric", vendor: "DriveCentric", category: "Sales CRM", vendorFamily: "independent", state: "connected", syncMode: "real-time API", slaWindowMins: 5, staleMins: 3, lastSyncLabel: "Today 6:21 AM", nextSyncLabel: "live", recordCount: 14200 },
    ],
    provenance: [
      { entity: "Deal", rows: [{ source: "Reynolds RCI", fieldsWon: ["gross", "deal date"], confidence: "LOW" }] },
      { entity: "Lead", rows: [{ source: "DriveCentric", fieldsWon: ["status", "VOI", "last touch"], confidence: "HIGH" }] },
    ],
    downstreamImpact: [
      { campaignId: "camp-9", name: "Trade-In Upgrade", status: "stale-counts", reason: "Reynolds CSV is 8 days old — equity estimates unreliable." },
    ],
  },
];
