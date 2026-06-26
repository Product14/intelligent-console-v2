// Vini Training Dashboard — data types.
//
// Dealer-facing performance view for the first ~90 days. Vini is technically
// capable from Day 1; the period exists so the dealer can enable sources at
// their own pace as confidence builds. Every metric here serves the narrative
// "what's enabled, what we did, what's still slipping through."
//
// Shape mirrors what a real analytics API would deliver. Hook resolves a
// fixture by URL param (?fixture=<key>); see lib/vini-training-fixtures.ts.

// ---------------------------------------------------------------------------
// Sources — the 8 demand surfaces the dealer can turn on for Vini.
// ---------------------------------------------------------------------------

export type SourceCategory = 'inbound' | 'outbound';

export type SourceId =
  // Inbound
  | 'voice-after-hours'
  | 'voice-overflow'
  | 'voice-office-hours'
  | 'chatbot'
  | 'speed-to-lead'
  // Outbound
  | 'campaign-dormant'
  | 'campaign-prior-interest'
  | 'campaign-lease-expiry';

export interface SourceStatus {
  id: SourceId;
  label: string;
  category: SourceCategory;
  /** True when the dealer has enabled this source and Vini is actively working it. */
  live: boolean;
  /** ISO date this source went live, or null if not yet live. */
  liveSince: string | null;
}

// ---------------------------------------------------------------------------
// Time windows — baseline (-30→0), w1 (0-30), w2 (30-60), w3 (60-90).
// ---------------------------------------------------------------------------

export type WindowKey = 'baseline' | 'w1' | 'w2' | 'w3';

export type WindowState =
  | 'baseline'       // -30→0; populated from CRM backfill
  | 'completed'      // a past 30-day window inside training; frozen comparison point
  | 'current'        // the active window
  | 'not_started';   // future window — render as ghosted placeholder

export interface WindowSummary {
  key: WindowKey;
  state: WindowState;
  /** Display string like "May 23 – Jun 22" or "Day 0 – 30". Null when not_started. */
  dateRange: string | null;
  /** Combined coverage % across all reachable demand in this window. Null when
   *  not_started or when there's no data yet for the current window. */
  leadCoveragePct: number | null;
  /** Leads worked vs total reachable. */
  leadsWorked: number | null;
  leadsTotal: number | null;
  /** Inbound response rate — calls + chats actually handled / total attempts. */
  inboundResponsePct: number | null;
  /** Sources live count at the end of this window (or now, for current). */
  sourcesLive: number | null;
}

// ---------------------------------------------------------------------------
// Top-line metrics — combined inbound + outbound for the current window.
// ---------------------------------------------------------------------------

export interface TopLineMetrics {
  /** Lead Coverage — leads Vini worked / total reachable leads this window. */
  leadsWorked: number;
  leadsTotal: number;
  /** Factual gap — leadsTotal - leadsWorked. Pre-computed for the card. */
  leadsGap: number;
  /** Response Time — Vini avg vs team avg, in seconds. */
  responseTimeViniSec: number;
  responseTimeTeamSec: number;
}

// ---------------------------------------------------------------------------
// Inbound — three channels + heatmap.
// ---------------------------------------------------------------------------

export type ChannelLiveness = 'live' | 'not_live';

export interface VoiceSubBucket {
  id: 'after-hours' | 'overflow' | 'office-hours';
  label: string;
  status: ChannelLiveness;
  callsHandled: number;
  callsMissed: number;
}

/** One cell of the 24×7 heatmap. */
export interface HeatmapCell {
  /** 0=Sun ... 6=Sat */
  day: number;
  /** 0..23 */
  hour: number;
  vini: number;
  bdc: number;
  missed: number;
}

export interface VoiceChannel {
  subBuckets: VoiceSubBucket[];
  heatmap: HeatmapCell[];
}

export interface ChatbotChannel {
  status: ChannelLiveness;
  sessionsHandled: number;
  sessionsUnanswered: number;
}

export interface SpeedToLeadChannel {
  status: ChannelLiveness;
  leadsReachedInSla: number;
  leadsLate: number;
  /** Display string e.g. "5 minutes" */
  slaWindowLabel: string;
}

export interface InboundOutcomes {
  appointmentsBooked: number;
  qualifiedLeads: number;
  routedToHuman: number;
}

export interface InboundSection {
  voice: VoiceChannel;
  chatbot: ChatbotChannel;
  speedToLead: SpeedToLeadChannel;
  outcomes: InboundOutcomes;
}

// ---------------------------------------------------------------------------
// Outbound — aggregate + per-campaign.
// ---------------------------------------------------------------------------

export type CampaignId = 'dormant' | 'prior-interest' | 'lease-expiry';

export interface CampaignCard {
  id: CampaignId;
  label: string;
  status: ChannelLiveness;
  audienceSize: number;
  touches: number;
  positiveResponses: number;
  /** Positive responses that the dealer hasn't acted on — surface "Action needed". */
  unactionedPositives: number;
}

export interface OutboundAggregate {
  leadsEngaged: number;
  positiveResponses: number;
  /** Talk-time + chat-time absorbed, expressed as hours saved. */
  bdcHoursEquivalent: number;
}

export interface OutboundSection {
  aggregate: OutboundAggregate;
  campaigns: CampaignCard[];
}

// ---------------------------------------------------------------------------
// Top-level dashboard payload.
// ---------------------------------------------------------------------------

export interface ViniTrainingData {
  /** Dealer name for the hero strip. */
  dealerName: string;
  /** ISO date when training began. Drives "Day X of 90" + lifecyclePhase. */
  trainingStartAt: string;
  /** 8 demand sources — order is the display order in the Sources Covered card. */
  sources: SourceStatus[];
  /** 4 windows in display order: baseline, w1, w2, w3. */
  windows: WindowSummary[];
  /** Combined inbound + outbound metrics for the current window. */
  topLine: TopLineMetrics;
  /** Inbound channels — values represent the current window. */
  inbound: InboundSection;
  /** Outbound campaigns — values represent the current window. */
  outbound: OutboundSection;
}

// ---------------------------------------------------------------------------
// Source ordering — drives the Sources Covered grid layout.
// ---------------------------------------------------------------------------

export const SOURCE_ORDER: SourceId[] = [
  'voice-after-hours',
  'voice-overflow',
  'voice-office-hours',
  'chatbot',
  'speed-to-lead',
  'campaign-dormant',
  'campaign-prior-interest',
  'campaign-lease-expiry',
];

export const SOURCE_LABELS: Record<SourceId, string> = {
  'voice-after-hours':       'After-hours voice',
  'voice-overflow':          'Overflow voice',
  'voice-office-hours':      'Office-hours voice',
  'chatbot':                 'Website chatbot',
  'speed-to-lead':           'Speed-to-Lead',
  'campaign-dormant':        'Dormant leads',
  'campaign-prior-interest': 'Prior interest',
  'campaign-lease-expiry':   'Lease expiry',
};

/** The full training period in days. The dealer's "Day X of 90". */
export const TRAINING_PERIOD_DAYS = 90;
