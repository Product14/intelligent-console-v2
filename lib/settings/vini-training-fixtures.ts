// Named fixtures for the Vini Training dashboard — exercise each lifecycle
// phase with realistic numbers. The fixture picker exposes ?fixture=<key>
// for QA + demo.
//
// Anchor: training-start dates are written relative to FIXTURE_ANCHOR_DATE,
// shared with vini-status-fixtures so both dashboards age in sync.

import { FIXTURE_ANCHOR_DATE } from '@/lib/settings/vini-status-fixtures';
import {
  SOURCE_LABELS,
  SOURCE_ORDER,
  type HeatmapCell,
  type SourceCategory,
  type SourceId,
  type SourceStatus,
  type ViniTrainingData,
} from './vini-training-mock';

const SOURCE_CATEGORY: Record<SourceId, SourceCategory> = {
  'voice-after-hours':       'inbound',
  'voice-overflow':          'inbound',
  'voice-office-hours':      'inbound',
  'chatbot':                 'inbound',
  'speed-to-lead':           'inbound',
  'campaign-dormant':        'outbound',
  'campaign-prior-interest': 'outbound',
  'campaign-lease-expiry':   'outbound',
};

function daysBefore(iso: string, days: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

/** Build a sources array from a set of live IDs. */
function buildSources(
  liveSinceByDays: Partial<Record<SourceId, number>>
): SourceStatus[] {
  return SOURCE_ORDER.map((id) => {
    const liveBefore = liveSinceByDays[id];
    return {
      id,
      label: SOURCE_LABELS[id],
      category: SOURCE_CATEGORY[id],
      live: liveBefore !== undefined,
      liveSince:
        liveBefore !== undefined
          ? daysBefore(FIXTURE_ANCHOR_DATE, liveBefore)
          : null,
    };
  });
}

/** Build a 24×7 heatmap with a realistic dealership pattern.
 *  - office hours (Mon-Fri 8am-6pm): heavy traffic
 *  - Saturday: medium
 *  - Sunday + late nights: light
 *
 *  `coverage` shapes how the calls split:
 *    'after-hours-only'  → Vini covers 6pm-8am + Sun; BDC covers daytime
 *    'partial'           → Vini covers nights + Sat; BDC daytime; missed scattered
 *    'mostly'            → Vini covers most; BDC covers some daytime
 *    'full'              → Vini covers nearly everything
 */
function buildHeatmap(coverage: 'after-hours-only' | 'partial' | 'mostly' | 'full'): HeatmapCell[] {
  const cells: HeatmapCell[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const isWeekday = day >= 1 && day <= 5;
      const isSat = day === 6;
      const isOfficeHours = hour >= 8 && hour < 18;
      const isLateNight = hour >= 22 || hour < 6;

      let baseVolume: number;
      if (isWeekday && isOfficeHours) baseVolume = 6;
      else if (isWeekday && !isLateNight) baseVolume = 3;
      else if (isWeekday && isLateNight) baseVolume = 1;
      else if (isSat && isOfficeHours) baseVolume = 3;
      else if (isSat) baseVolume = 1;
      else baseVolume = 1; // Sun

      const total = baseVolume;
      let vini = 0;
      let bdc = 0;
      let missed = 0;

      if (coverage === 'after-hours-only') {
        if (isWeekday && isOfficeHours) {
          bdc = Math.floor(total * 0.7);
          missed = total - bdc;
        } else {
          vini = total;
        }
      } else if (coverage === 'partial') {
        if (isWeekday && isOfficeHours) {
          bdc = Math.floor(total * 0.6);
          missed = Math.max(0, total - bdc - 1);
          vini = total - bdc - missed;
        } else if (isSat && isOfficeHours) {
          bdc = Math.floor(total * 0.4);
          vini = total - bdc;
        } else {
          vini = total;
        }
      } else if (coverage === 'mostly') {
        if (isWeekday && isOfficeHours) {
          vini = Math.floor(total * 0.7);
          bdc = total - vini;
        } else {
          vini = total;
        }
      } else {
        // full
        vini = total;
      }

      cells.push({ day, hour, vini, bdc, missed });
    }
  }
  return cells;
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

export type FixtureKey =
  | 'day_1'
  | 'day_15'
  | 'day_45'
  | 'day_75'
  | 'day_95_post_training';

export interface FixtureMeta {
  key: FixtureKey;
  label: string;
  description: string;
  /** ISO date to drive "today" when running this fixture from the picker. */
  recommendedToday: string;
  data: ViniTrainingData;
}

const DEALER_NAME = 'Sundance Auto Group — Reno';

// ---------------------------------------------------------------------------
// Day 1 — training just started; after-hours voice + dormant campaign live.
// ---------------------------------------------------------------------------
const DAY_1: ViniTrainingData = {
  dealerName: DEALER_NAME,
  trainingStartAt: FIXTURE_ANCHOR_DATE,
  sources: buildSources({
    'voice-after-hours': 0,
    'campaign-dormant':  0,
  }),
  windows: [
    {
      key: 'baseline',
      state: 'baseline',
      dateRange: 'May 23 – Jun 21',
      leadCoveragePct: 0,
      leadsWorked: 0,
      leadsTotal: 412,
      inboundResponsePct: 47,
      sourcesLive: 0,
    },
    {
      key: 'w1',
      state: 'current',
      dateRange: 'Day 1',
      leadCoveragePct: 8,
      leadsWorked: 6,
      leadsTotal: 78,
      inboundResponsePct: 55,
      sourcesLive: 2,
    },
    { key: 'w2', state: 'not_started', dateRange: null, leadCoveragePct: null, leadsWorked: null, leadsTotal: null, inboundResponsePct: null, sourcesLive: null },
    { key: 'w3', state: 'not_started', dateRange: null, leadCoveragePct: null, leadsWorked: null, leadsTotal: null, inboundResponsePct: null, sourcesLive: null },
  ],
  topLine: {
    leadsWorked: 6,
    leadsTotal: 78,
    leadsGap: 72,
    responseTimeViniSec: 47,
    responseTimeTeamSec: 38 * 60,
  },
  inbound: {
    voice: {
      subBuckets: [
        { id: 'after-hours',  label: 'After-hours',  status: 'live',     callsHandled: 4, callsMissed: 0 },
        { id: 'overflow',     label: 'Overflow',     status: 'not_live', callsHandled: 0, callsMissed: 2 },
        { id: 'office-hours', label: 'Office-hours', status: 'not_live', callsHandled: 0, callsMissed: 14 },
      ],
      heatmap: buildHeatmap('after-hours-only'),
    },
    chatbot: { status: 'not_live', sessionsHandled: 0, sessionsUnanswered: 2 },
    speedToLead: { status: 'not_live', leadsReachedInSla: 0, leadsLate: 3, slaWindowLabel: '5 minutes' },
    outcomes: { appointmentsBooked: 1, qualifiedLeads: 2, routedToHuman: 1 },
  },
  outbound: {
    aggregate: { leadsEngaged: 12, positiveResponses: 1, bdcHoursEquivalent: 1.5 },
    campaigns: [
      { id: 'dormant',        label: 'Dormant leads',  status: 'live',     audienceSize: 420, touches: 12, positiveResponses: 1, unactionedPositives: 1 },
      { id: 'prior-interest', label: 'Prior interest', status: 'not_live', audienceSize: 156, touches: 0,  positiveResponses: 0, unactionedPositives: 0 },
      { id: 'lease-expiry',   label: 'Lease expiry',   status: 'not_live', audienceSize: 87,  touches: 0,  positiveResponses: 0, unactionedPositives: 0 },
    ],
  },
};

// ---------------------------------------------------------------------------
// Day 15 — overflow voice + prior-interest campaign now live (4 of 8).
// ---------------------------------------------------------------------------
const DAY_15: ViniTrainingData = {
  dealerName: DEALER_NAME,
  trainingStartAt: daysBefore(FIXTURE_ANCHOR_DATE, 14),
  sources: buildSources({
    'voice-after-hours':       14,
    'voice-overflow':          5,
    'campaign-dormant':        14,
    'campaign-prior-interest': 6,
  }),
  windows: [
    { key: 'baseline', state: 'baseline', dateRange: 'May 9 – Jun 7',  leadCoveragePct: 0,  leadsWorked: 0,   leadsTotal: 412, inboundResponsePct: 47, sourcesLive: 0 },
    { key: 'w1',       state: 'current',  dateRange: 'Day 1 – 15',     leadCoveragePct: 34, leadsWorked: 78,  leadsTotal: 230, inboundResponsePct: 68, sourcesLive: 4 },
    { key: 'w2',       state: 'not_started', dateRange: null, leadCoveragePct: null, leadsWorked: null, leadsTotal: null, inboundResponsePct: null, sourcesLive: null },
    { key: 'w3',       state: 'not_started', dateRange: null, leadCoveragePct: null, leadsWorked: null, leadsTotal: null, inboundResponsePct: null, sourcesLive: null },
  ],
  topLine: {
    leadsWorked: 78,
    leadsTotal: 230,
    leadsGap: 152,
    responseTimeViniSec: 42,
    responseTimeTeamSec: 38 * 60,
  },
  inbound: {
    voice: {
      subBuckets: [
        { id: 'after-hours',  label: 'After-hours',  status: 'live',     callsHandled: 62, callsMissed: 0 },
        { id: 'overflow',     label: 'Overflow',     status: 'live',     callsHandled: 28, callsMissed: 8 },
        { id: 'office-hours', label: 'Office-hours', status: 'not_live', callsHandled: 0,  callsMissed: 178 },
      ],
      heatmap: buildHeatmap('partial'),
    },
    chatbot: { status: 'not_live', sessionsHandled: 0, sessionsUnanswered: 24 },
    speedToLead: { status: 'not_live', leadsReachedInSla: 0, leadsLate: 41, slaWindowLabel: '5 minutes' },
    outcomes: { appointmentsBooked: 8, qualifiedLeads: 22, routedToHuman: 14 },
  },
  outbound: {
    aggregate: { leadsEngaged: 218, positiveResponses: 14, bdcHoursEquivalent: 32 },
    campaigns: [
      { id: 'dormant',        label: 'Dormant leads',  status: 'live',     audienceSize: 420, touches: 156, positiveResponses: 9, unactionedPositives: 3 },
      { id: 'prior-interest', label: 'Prior interest', status: 'live',     audienceSize: 156, touches: 62,  positiveResponses: 5, unactionedPositives: 2 },
      { id: 'lease-expiry',   label: 'Lease expiry',   status: 'not_live', audienceSize: 87,  touches: 0,   positiveResponses: 0, unactionedPositives: 0 },
    ],
  },
};

// ---------------------------------------------------------------------------
// Day 45 — chatbot + office-hours voice on; speed-to-lead still off (6 of 8).
// W1 is completed; W2 is current.
// ---------------------------------------------------------------------------
const DAY_45: ViniTrainingData = {
  dealerName: DEALER_NAME,
  trainingStartAt: daysBefore(FIXTURE_ANCHOR_DATE, 44),
  sources: buildSources({
    'voice-after-hours':       44,
    'voice-overflow':          35,
    'voice-office-hours':      22,
    'chatbot':                 20,
    'campaign-dormant':        44,
    'campaign-prior-interest': 36,
  }),
  windows: [
    { key: 'baseline', state: 'baseline',  dateRange: 'Apr 9 – May 8',   leadCoveragePct: 0,  leadsWorked: 0,   leadsTotal: 412, inboundResponsePct: 47, sourcesLive: 0 },
    { key: 'w1',       state: 'completed', dateRange: 'May 9 – Jun 7',   leadCoveragePct: 38, leadsWorked: 162, leadsTotal: 428, inboundResponsePct: 71, sourcesLive: 4 },
    { key: 'w2',       state: 'current',   dateRange: 'Day 31 – 45',     leadCoveragePct: 68, leadsWorked: 154, leadsTotal: 226, inboundResponsePct: 84, sourcesLive: 6 },
    { key: 'w3',       state: 'not_started', dateRange: null, leadCoveragePct: null, leadsWorked: null, leadsTotal: null, inboundResponsePct: null, sourcesLive: null },
  ],
  topLine: {
    leadsWorked: 154,
    leadsTotal: 226,
    leadsGap: 72,
    responseTimeViniSec: 38,
    responseTimeTeamSec: 38 * 60,
  },
  inbound: {
    voice: {
      subBuckets: [
        { id: 'after-hours',  label: 'After-hours',  status: 'live', callsHandled: 58,  callsMissed: 0 },
        { id: 'overflow',     label: 'Overflow',     status: 'live', callsHandled: 41,  callsMissed: 4 },
        { id: 'office-hours', label: 'Office-hours', status: 'live', callsHandled: 124, callsMissed: 18 },
      ],
      heatmap: buildHeatmap('mostly'),
    },
    chatbot: { status: 'live', sessionsHandled: 38, sessionsUnanswered: 6 },
    speedToLead: { status: 'not_live', leadsReachedInSla: 0, leadsLate: 51, slaWindowLabel: '5 minutes' },
    outcomes: { appointmentsBooked: 28, qualifiedLeads: 62, routedToHuman: 31 },
  },
  outbound: {
    aggregate: { leadsEngaged: 384, positiveResponses: 38, bdcHoursEquivalent: 78 },
    campaigns: [
      { id: 'dormant',        label: 'Dormant leads',  status: 'live',     audienceSize: 420, touches: 240, positiveResponses: 21, unactionedPositives: 4 },
      { id: 'prior-interest', label: 'Prior interest', status: 'live',     audienceSize: 156, touches: 144, positiveResponses: 17, unactionedPositives: 5 },
      { id: 'lease-expiry',   label: 'Lease expiry',   status: 'not_live', audienceSize: 87,  touches: 0,   positiveResponses: 0,  unactionedPositives: 0 },
    ],
  },
};

// ---------------------------------------------------------------------------
// Day 75 — speed-to-lead + lease-expiry now on (8 of 8).
// W1 + W2 completed; W3 is current.
// ---------------------------------------------------------------------------
const DAY_75: ViniTrainingData = {
  dealerName: DEALER_NAME,
  trainingStartAt: daysBefore(FIXTURE_ANCHOR_DATE, 74),
  sources: buildSources({
    'voice-after-hours':       74,
    'voice-overflow':          65,
    'voice-office-hours':      52,
    'chatbot':                 50,
    'speed-to-lead':           18,
    'campaign-dormant':        74,
    'campaign-prior-interest': 66,
    'campaign-lease-expiry':   20,
  }),
  windows: [
    { key: 'baseline', state: 'baseline',  dateRange: 'Mar 10 – Apr 8',  leadCoveragePct: 0,  leadsWorked: 0,   leadsTotal: 412, inboundResponsePct: 47, sourcesLive: 0 },
    { key: 'w1',       state: 'completed', dateRange: 'Apr 9 – May 8',   leadCoveragePct: 38, leadsWorked: 162, leadsTotal: 428, inboundResponsePct: 71, sourcesLive: 4 },
    { key: 'w2',       state: 'completed', dateRange: 'May 9 – Jun 7',   leadCoveragePct: 72, leadsWorked: 312, leadsTotal: 434, inboundResponsePct: 86, sourcesLive: 6 },
    { key: 'w3',       state: 'current',   dateRange: 'Day 61 – 75',     leadCoveragePct: 92, leadsWorked: 198, leadsTotal: 216, inboundResponsePct: 96, sourcesLive: 8 },
  ],
  topLine: {
    leadsWorked: 198,
    leadsTotal: 216,
    leadsGap: 18,
    responseTimeViniSec: 36,
    responseTimeTeamSec: 38 * 60,
  },
  inbound: {
    voice: {
      subBuckets: [
        { id: 'after-hours',  label: 'After-hours',  status: 'live', callsHandled: 62,  callsMissed: 0 },
        { id: 'overflow',     label: 'Overflow',     status: 'live', callsHandled: 48,  callsMissed: 2 },
        { id: 'office-hours', label: 'Office-hours', status: 'live', callsHandled: 140, callsMissed: 8 },
      ],
      heatmap: buildHeatmap('full'),
    },
    chatbot: { status: 'live', sessionsHandled: 46, sessionsUnanswered: 2 },
    speedToLead: { status: 'live', leadsReachedInSla: 49, leadsLate: 4, slaWindowLabel: '5 minutes' },
    outcomes: { appointmentsBooked: 41, qualifiedLeads: 88, routedToHuman: 22 },
  },
  outbound: {
    aggregate: { leadsEngaged: 512, positiveResponses: 62, bdcHoursEquivalent: 104 },
    campaigns: [
      { id: 'dormant',        label: 'Dormant leads',  status: 'live', audienceSize: 420, touches: 320, positiveResponses: 28, unactionedPositives: 3 },
      { id: 'prior-interest', label: 'Prior interest', status: 'live', audienceSize: 156, touches: 152, positiveResponses: 21, unactionedPositives: 2 },
      { id: 'lease-expiry',   label: 'Lease expiry',   status: 'live', audienceSize: 87,  touches: 40,  positiveResponses: 13, unactionedPositives: 4 },
    ],
  },
};

// ---------------------------------------------------------------------------
// Day 95 — post-training. All windows complete; lifecycle 'just_completed'.
// ---------------------------------------------------------------------------
const DAY_95: ViniTrainingData = {
  dealerName: DEALER_NAME,
  trainingStartAt: daysBefore(FIXTURE_ANCHOR_DATE, 94),
  sources: buildSources({
    'voice-after-hours':       94,
    'voice-overflow':          85,
    'voice-office-hours':      72,
    'chatbot':                 70,
    'speed-to-lead':           38,
    'campaign-dormant':        94,
    'campaign-prior-interest': 86,
    'campaign-lease-expiry':   40,
  }),
  windows: [
    { key: 'baseline', state: 'baseline',  dateRange: 'Feb 18 – Mar 19', leadCoveragePct: 0,  leadsWorked: 0,   leadsTotal: 412, inboundResponsePct: 47, sourcesLive: 0 },
    { key: 'w1',       state: 'completed', dateRange: 'Mar 20 – Apr 18', leadCoveragePct: 38, leadsWorked: 162, leadsTotal: 428, inboundResponsePct: 71, sourcesLive: 4 },
    { key: 'w2',       state: 'completed', dateRange: 'Apr 19 – May 18', leadCoveragePct: 72, leadsWorked: 312, leadsTotal: 434, inboundResponsePct: 86, sourcesLive: 6 },
    { key: 'w3',       state: 'completed', dateRange: 'May 19 – Jun 17', leadCoveragePct: 94, leadsWorked: 408, leadsTotal: 434, inboundResponsePct: 97, sourcesLive: 8 },
  ],
  topLine: {
    leadsWorked: 408,
    leadsTotal: 434,
    leadsGap: 26,
    responseTimeViniSec: 35,
    responseTimeTeamSec: 38 * 60,
  },
  inbound: {
    voice: {
      subBuckets: [
        { id: 'after-hours',  label: 'After-hours',  status: 'live', callsHandled: 128, callsMissed: 0 },
        { id: 'overflow',     label: 'Overflow',     status: 'live', callsHandled: 96,  callsMissed: 3 },
        { id: 'office-hours', label: 'Office-hours', status: 'live', callsHandled: 286, callsMissed: 14 },
      ],
      heatmap: buildHeatmap('full'),
    },
    chatbot: { status: 'live', sessionsHandled: 92, sessionsUnanswered: 4 },
    speedToLead: { status: 'live', leadsReachedInSla: 102, leadsLate: 8, slaWindowLabel: '5 minutes' },
    outcomes: { appointmentsBooked: 86, qualifiedLeads: 184, routedToHuman: 48 },
  },
  outbound: {
    aggregate: { leadsEngaged: 1124, positiveResponses: 134, bdcHoursEquivalent: 218 },
    campaigns: [
      { id: 'dormant',        label: 'Dormant leads',  status: 'live', audienceSize: 420, touches: 416, positiveResponses: 62, unactionedPositives: 6 },
      { id: 'prior-interest', label: 'Prior interest', status: 'live', audienceSize: 156, touches: 156, positiveResponses: 48, unactionedPositives: 5 },
      { id: 'lease-expiry',   label: 'Lease expiry',   status: 'live', audienceSize: 87,  touches: 84,  positiveResponses: 24, unactionedPositives: 3 },
    ],
  },
};

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export const FIXTURES: Record<FixtureKey, FixtureMeta> = {
  day_1: {
    key: 'day_1',
    label: 'Day 1 — first day',
    description: 'Training just started; only after-hours voice + dormant campaign live (2 of 8).',
    recommendedToday: FIXTURE_ANCHOR_DATE,
    data: DAY_1,
  },
  day_15: {
    key: 'day_15',
    label: 'Day 15 — mid first window',
    description: 'Overflow voice + prior-interest campaign added (4 of 8). W1 in progress.',
    recommendedToday: FIXTURE_ANCHOR_DATE,
    data: DAY_15,
  },
  day_45: {
    key: 'day_45',
    label: 'Day 45 — second window',
    description: 'Chatbot + office-hours voice on (6 of 8). W1 completed, W2 current.',
    recommendedToday: FIXTURE_ANCHOR_DATE,
    data: DAY_45,
  },
  day_75: {
    key: 'day_75',
    label: 'Day 75 — final stretch',
    description: 'All 8 sources live. W1 + W2 completed; W3 current.',
    recommendedToday: FIXTURE_ANCHOR_DATE,
    data: DAY_75,
  },
  day_95_post_training: {
    key: 'day_95_post_training',
    label: 'Day 95 — post-training',
    description: 'All windows complete; lifecycle in just_completed.',
    recommendedToday: FIXTURE_ANCHOR_DATE,
    data: DAY_95,
  },
};

export const FIXTURE_ORDER: FixtureKey[] = [
  'day_1',
  'day_15',
  'day_45',
  'day_75',
  'day_95_post_training',
];

export const DEFAULT_FIXTURE: FixtureKey = 'day_15';

export function resolveFixture(key: string | null | undefined): FixtureMeta {
  if (key && key in FIXTURES) return FIXTURES[key as FixtureKey];
  return FIXTURES[DEFAULT_FIXTURE];
}
