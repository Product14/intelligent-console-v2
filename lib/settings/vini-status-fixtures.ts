// Named fixtures for the Vini Status page — used by the dev fixture picker
// to exercise every state without combinatorial bloat.
//
// Anchor date: each fixture's training-start dates are written relative to
// FIXTURE_ANCHOR_DATE. The picker exposes a `?today=YYYY-MM-DD` override so
// reviewers can land any agent on any day of training deterministically.
// If no override is set, the screen uses `new Date()` and dates drift normally.

import type { ViniStatusData } from '@/lib/settings/vini-status-mock';
import {
  EMPTY_HANDOVER,
  agentLifecycleKey,
  type HandoverFormData,
  type LifecycleState,
} from '@/lib/settings/vini-status-lifecycle';
import type { StepTimingsState } from '@/lib/settings/vini-status-step-timings';

/** Pin to a known date so fixture math is reproducible across runs. */
export const FIXTURE_ANCHOR_DATE = '2026-06-22';

function daysBefore(iso: string, days: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Building blocks — small reusable pieces of state for composing fixtures.
// ---------------------------------------------------------------------------

const ROOFTOP_FULL: ViniStatusData['rooftop'] = {
  name: 'Sundance Auto Group — Reno',
  website: 'https://sundance-reno.example.com',
  address: '1450 S Virginia St, Reno, NV 89502',
  timezone: 'America/Los_Angeles',
};

const ROOFTOP_EMPTY: ViniStatusData['rooftop'] = {
  name: null,
  website: null,
  address: null,
  timezone: null,
};

const ROOFTOP_PARTIAL: ViniStatusData['rooftop'] = {
  name: 'Sundance Auto Group — Reno',
  website: 'https://sundance-reno.example.com',
  address: null,
  timezone: null,
};

const DEPARTMENTS_FULL: ViniStatusData['departments'] = [
  { id: 'sales',   name: 'Sales',   hoursSummary: 'Mon–Fri 9 AM – 7 PM · Sat 10 AM – 6 PM · Sun Closed' },
  { id: 'service', name: 'Service', hoursSummary: 'Mon–Fri 7 AM – 6 PM · Sat 8 AM – 2 PM · Sun Closed' },
  { id: 'parts',   name: 'Parts',   hoursSummary: 'Mon–Fri 8 AM – 5 PM · Sat–Sun Closed' },
];

const DEPARTMENTS_PARTIAL: ViniStatusData['departments'] = [
  { id: 'sales',   name: 'Sales',   hoursSummary: 'Mon–Fri 9 AM – 7 PM · Sat 10 AM – 6 PM · Sun Closed' },
  { id: 'service', name: 'Service', hoursSummary: 'Mon–Fri 7 AM – 6 PM · Sat 8 AM – 2 PM · Sun Closed' },
  { id: 'parts',   name: 'Parts',   hoursSummary: null },
];

// Clearbit serves logos for well-known company domains; when a request 404s
// (some partners aren't in their index) the PartnerLogo component falls
// back to a styled initial-letter avatar.
const LOGO = {
  vinsolutions: 'https://logo.clearbit.com/vinsolutions.com',
  vauto:        'https://logo.clearbit.com/vauto.com',
  dealertrack:  'https://logo.clearbit.com/dealertrack.com',
  autocheck:    'https://logo.clearbit.com/autocheck.com',
  xtime:        'https://logo.clearbit.com/xtime.com',
} as const;

const INTEGRATIONS_FULL: ViniStatusData['integrations'] = {
  crm:              { provider: 'VinSolutions (Cox)',  logo: LOGO.vinsolutions, status: 'active', lastSyncedAt: daysBefore(FIXTURE_ANCHOR_DATE, 0) + 'T08:14:00Z' },
  ims:              { provider: 'vAuto (Cox)',         logo: LOGO.vauto,        status: 'active', lastSyncedAt: daysBefore(FIXTURE_ANCHOR_DATE, 0) + 'T08:14:00Z' },
  dms:              { provider: 'Dealertrack (Cox)',   logo: LOGO.dealertrack,  status: 'active', lastSyncedAt: daysBefore(FIXTURE_ANCHOR_DATE, 0) + 'T07:50:00Z' },
  carHistory:       { provider: 'AutoCheck',           logo: LOGO.autocheck,    selected: true },
  serviceScheduler: { provider: 'Xtime (Cox)',         logo: LOGO.xtime,        status: 'active', lastSyncedAt: daysBefore(FIXTURE_ANCHOR_DATE, 0) + 'T07:50:00Z' },
};

const INTEGRATIONS_NONE: ViniStatusData['integrations'] = {
  crm:              { provider: null, logo: null, status: 'not_connected', lastSyncedAt: null },
  ims:              { provider: null, logo: null, status: 'not_connected', lastSyncedAt: null },
  dms:              { provider: null, logo: null, status: 'not_connected', lastSyncedAt: null },
  carHistory:       { provider: null, logo: null, selected: false },
  serviceScheduler: { provider: null, logo: null, status: 'not_connected', lastSyncedAt: null },
};

const INTEGRATIONS_MIXED: ViniStatusData['integrations'] = {
  crm:              { provider: 'VinSolutions (Cox)',  logo: LOGO.vinsolutions, status: 'active',   lastSyncedAt: daysBefore(FIXTURE_ANCHOR_DATE, 0) + 'T08:14:00Z' },
  ims:              { provider: 'vAuto (Cox)',         logo: LOGO.vauto,        status: 'active',   lastSyncedAt: daysBefore(FIXTURE_ANCHOR_DATE, 0) + 'T08:14:00Z' },
  dms:              { provider: 'Dealertrack (Cox)',   logo: LOGO.dealertrack,  status: 'inactive', lastSyncedAt: daysBefore(FIXTURE_ANCHOR_DATE, 10) + 'T03:02:00Z' },
  carHistory:       { provider: 'AutoCheck',           logo: LOGO.autocheck,    selected: true },
  serviceScheduler: { provider: null,                  logo: null,              status: 'not_connected', lastSyncedAt: null },
};

const BILLING_HEALTHY: ViniStatusData['billing'] = [
  { month: 'Jun 2026', amount: '$4,200', status: 'paid' },
  { month: 'May 2026', amount: '$4,200', status: 'paid' },
  { month: 'Apr 2026', amount: '$4,100', status: 'paid' },
];

const BILLING_PENDING: ViniStatusData['billing'] = [
  { month: 'Jun 2026', amount: '$4,200', status: 'pending' },
  { month: 'May 2026', amount: '$4,200', status: 'paid' },
  { month: 'Apr 2026', amount: '$4,100', status: 'paid' },
];

const BILLING_OVERDUE: ViniStatusData['billing'] = [
  { month: 'Jun 2026', amount: '$4,200', status: 'overdue' },
  { month: 'May 2026', amount: '$4,200', status: 'paid' },
  { month: 'Apr 2026', amount: '$4,100', status: 'paid' },
];

const BILLING_ALL_OVERDUE: ViniStatusData['billing'] = [
  { month: 'Jun 2026', amount: '$4,200', status: 'overdue' },
  { month: 'May 2026', amount: '$4,200', status: 'overdue' },
  { month: 'Apr 2026', amount: '$4,100', status: 'overdue' },
];

// ---------------------------------------------------------------------------
// Agent factories — keep the per-agent boilerplate small.
// ---------------------------------------------------------------------------

function inboundAgent(
  type: 'sales' | 'service',
  args: {
    name: string;
    phone: string;
    trainingStartAt: string | null;
    channelTier?: 'live' | 'partial' | 'none';
    obConversations?: number;
    trainingConversations?: number | null;
    trainingTofu?: number | null;
    postConversations?: number | null;
    postTofu?: number | null;
  }
): ViniStatusData['agents'][number] {
  const tier = args.channelTier ?? 'live';
  return {
    type,
    callType: 'inbound',
    contracted: true,
    avatar: null,
    name: args.name,
    phone: args.phone,
    trainingStartAt: args.trainingStartAt,
    channels: CHANNEL_PRESETS[tier],
    metrics: {
      ob:           { dateRange: 'May 18 – Jun 1', conversations: args.obConversations ?? 0, tofuPct: null },
      training:     { dateRange: trainingRange(args.trainingStartAt), conversations: args.trainingConversations ?? null, tofuPct: args.trainingTofu ?? null },
      postTraining: { dateRange: postTrainingRange(args.trainingStartAt), conversations: args.postConversations ?? null, tofuPct: args.postTofu ?? null },
    },
  };
}

function outboundAgent(
  type: 'sales' | 'service',
  args: {
    name: string;
    phone: string;
    trainingStartAt: string | null;
    obLeads?: number;
    obAbr?: number;
    obConversations?: number;
    trainingLeads?: number | null;
    trainingAbr?: number | null;
    trainingConversations?: number | null;
    postLeads?: number | null;
    postAbr?: number | null;
    postConversations?: number | null;
  }
): ViniStatusData['agents'][number] {
  return {
    type,
    callType: 'outbound',
    contracted: true,
    avatar: null,
    name: args.name,
    phone: args.phone,
    trainingStartAt: args.trainingStartAt,
    metrics: {
      ob:           { dateRange: 'May 1 – May 15',  conversations: args.obConversations ?? 0,        leadsReached: args.obLeads ?? 0,        abrPct: args.obAbr ?? null },
      training:     { dateRange: trainingRange(args.trainingStartAt), conversations: args.trainingConversations ?? null, leadsReached: args.trainingLeads ?? null, abrPct: args.trainingAbr ?? null },
      postTraining: { dateRange: postTrainingRange(args.trainingStartAt), conversations: args.postConversations ?? null, leadsReached: args.postLeads ?? null, abrPct: args.postAbr ?? null },
    },
  };
}

function notContractedAgent(
  type: 'sales' | 'service',
  callType: 'inbound' | 'outbound'
): ViniStatusData['agents'][number] {
  return {
    type, callType, contracted: false,
    avatar: null, name: null, phone: null,
    trainingStartAt: null,
    metrics: {
      ob:           { dateRange: null, conversations: null },
      training:     { dateRange: null, conversations: null },
      postTraining: { dateRange: null, conversations: null },
    },
  };
}

/** A slot that's been contracted but the operator hasn't run the
 *  agent-customization + assign-number flow yet — no name, no phone, no
 *  metrics. The card body renders nothing for this state. */
function unconfiguredAgent(
  type: 'sales' | 'service',
  callType: 'inbound' | 'outbound'
): ViniStatusData['agents'][number] {
  return {
    type, callType, contracted: true,
    avatar: null, name: null, phone: null,
    trainingStartAt: null,
    metrics: {
      ob:           { dateRange: null, conversations: null },
      training:     { dateRange: null, conversations: null },
      postTraining: { dateRange: null, conversations: null },
    },
  };
}

const CHANNEL_PRESETS = {
  live:    { phone: { status: 'live'         as const, routedPct: 100 }, chatbot: { status: 'live'         as const, routedPct: 100 }, sms: { status: 'live'         as const, routedPct: 100 } },
  partial: { phone: { status: 'live'         as const, routedPct: 80 },  chatbot: { status: 'live'         as const, routedPct: 100 }, sms: { status: 'not_deployed' as const, routedPct: 0 } },
  none:    { phone: { status: 'not_deployed' as const, routedPct: 0 },   chatbot: { status: 'not_deployed' as const, routedPct: 0 },   sms: { status: 'not_deployed' as const, routedPct: 0 } },
};

function trainingRange(start: string | null): string | null {
  if (!start) return null;
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 27);
  return formatRange(start, end.toISOString().slice(0, 10));
}

function postTrainingRange(start: string | null): string | null {
  if (!start) return null;
  const post = new Date(start);
  post.setUTCDate(post.getUTCDate() + 28);
  return `${formatDay(post.toISOString().slice(0, 10))} → `;
}

function formatRange(fromIso: string, toIso: string): string {
  return `${formatDay(fromIso)} – ${formatDay(toIso)}`;
}

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

// ---------------------------------------------------------------------------
// The fixtures.
// ---------------------------------------------------------------------------

export type FixtureKey =
  | 'fresh'
  | 'pre_handover_all'
  | 'pending_ob_all'
  | 'rejected_back_to_sales'
  | 'mixed_handover_progress'
  | 'just_accepted_all'
  | 'mid_onboarding'
  | 'integrations_missing'
  | 'all_not_contracted'
  | 'ready_pre_training'
  | 'training_day_1'
  | 'training_day_14'
  | 'training_day_27'
  | 'post_training_healthy'
  | 'partial_channels'
  | 'billing_overdue'
  | 'billing_history_empty'
  | 'billing_all_overdue';

export interface FixtureMeta {
  key: FixtureKey;
  label: string;
  description: string;
  data: ViniStatusData;
  /** Default lifecycle state for this fixture. Read by useViniLifecycle when
   *  there's no localStorage data for this scope. */
  lifecycle?: LifecycleState;
  /** Default per-step timings. Read by useViniStepTimings when there's no
   *  localStorage data for this scope. */
  stepTimings?: StepTimingsState;
}

// ---------------------------------------------------------------------------
// Lifecycle + timings helpers — keep each fixture's lifecycle block compact.
// ---------------------------------------------------------------------------

const STANDARD_HANDOVER: HandoverFormData = {
  dealerName: 'Sundance Auto Group — Reno',
  website: 'https://sundance-reno.example.com',
  addressLine1: '1450 S Virginia St',
  addressLine2: undefined,
  city: 'Reno',
  state: 'NV',
  zip: '89502',
  primaryContact: {
    name: 'Riley Tanaka',
    role: 'GM',
    email: 'riley@sundance-reno.example.com',
    phone: '+1 (775) 555-0100',
  },
  secondaryContact: {
    name: 'Drew Patel',
    role: 'Service Director',
    email: 'drew@sundance-reno.example.com',
  },
  currentIntegrations: {
    crm: 'VinSolutions',
    ims: 'vAuto',
    dms: 'Dealertrack',
    carHistory: 'AutoCheck',
    serviceScheduler: 'Xtime',
  },
  notesForOb: 'Dealer is migrating off a legacy system this month — schedule kick-off after July 1.',
};

const HALF_FILLED_HANDOVER: HandoverFormData = {
  ...EMPTY_HANDOVER,
  dealerName: 'Sundance Auto Group — Reno',
  website: 'https://sundance-reno.example.com',
  primaryContact: {
    name: 'Riley Tanaka',
    role: undefined,
    email: '',
    phone: undefined,
  },
};

/** Build a lifecycle where every contracted agent has been accepted N days
 *  ago. Transferred 1 day before accepted to simulate a quick Sales→OB
 *  turnaround. */
function allAccepted(daysAgo: number): LifecycleState {
  const acceptedAt = daysBefore(FIXTURE_ANCHOR_DATE, daysAgo) + 'T08:00:00Z';
  const transferredAt = daysBefore(FIXTURE_ANCHOR_DATE, daysAgo + 1) + 'T08:00:00Z';
  return {
    handover: STANDARD_HANDOVER,
    agents: {
      [agentLifecycleKey('sales', 'inbound')]:    { transferredAt, acceptedAt, rejectionHistory: [] },
      [agentLifecycleKey('sales', 'outbound')]:   { transferredAt, acceptedAt, rejectionHistory: [] },
      [agentLifecycleKey('service', 'inbound')]:  { transferredAt, acceptedAt, rejectionHistory: [] },
      [agentLifecycleKey('service', 'outbound')]: { transferredAt, acceptedAt, rejectionHistory: [] },
    },
  };
}

/** Rooftop step timings seeded so each step has plausible elapsed days.
 *  acceptedDaysAgo is the day count since OB accepted. */
function rooftopTimings(args: {
  acceptedDaysAgo: number;
  rooftopDoneDaysAgo?: number;
  departmentsDoneDaysAgo?: number;
  routingDoneDaysAgo?: number;
  usersDoneDaysAgo?: number;
  integrationsDoneDaysAgo?: number;
  billingDoneDaysAgo?: number;
}): StepTimingsState['rooftop'] {
  const startedAt = daysBefore(FIXTURE_ANCHOR_DATE, args.acceptedDaysAgo) + 'T08:00:00Z';
  const t = (doneDaysAgo: number | undefined) =>
    doneDaysAgo !== undefined
      ? { startedAt, completedAt: daysBefore(FIXTURE_ANCHOR_DATE, doneDaysAgo) + 'T16:00:00Z' }
      : { startedAt };
  return {
    rooftop:      t(args.rooftopDoneDaysAgo),
    departments:  t(args.departmentsDoneDaysAgo),
    routing:      t(args.routingDoneDaysAgo),
    users:        t(args.usersDoneDaysAgo),
    integrations: t(args.integrationsDoneDaysAgo),
    billing:      t(args.billingDoneDaysAgo),
  };
}

function agentTimings(args: {
  acceptedDaysAgo: number;
  completedDaysAgo?: number;
}): StepTimingsState['agents'][string] {
  return {
    startedAt: daysBefore(FIXTURE_ANCHOR_DATE, args.acceptedDaysAgo) + 'T08:00:00Z',
    completedAt:
      args.completedDaysAgo !== undefined
        ? daysBefore(FIXTURE_ANCHOR_DATE, args.completedDaysAgo) + 'T16:00:00Z'
        : undefined,
  };
}

function allAgentsTimings(daysAgo: number): StepTimingsState['agents'] {
  return {
    [agentLifecycleKey('sales', 'inbound')]:    agentTimings({ acceptedDaysAgo: daysAgo }),
    [agentLifecycleKey('sales', 'outbound')]:   agentTimings({ acceptedDaysAgo: daysAgo }),
    [agentLifecycleKey('service', 'inbound')]:  agentTimings({ acceptedDaysAgo: daysAgo }),
    [agentLifecycleKey('service', 'outbound')]: agentTimings({ acceptedDaysAgo: daysAgo }),
  };
}

// Day offsets relative to FIXTURE_ANCHOR_DATE for the training-day-N fixtures.
// A Day-14 fixture sets trainingStartAt to 13 days before anchor so day 1+13=14.
const TRAINING_START_DAY_1  = daysBefore(FIXTURE_ANCHOR_DATE, 0);
const TRAINING_START_DAY_14 = daysBefore(FIXTURE_ANCHOR_DATE, 13);
const TRAINING_START_DAY_27 = daysBefore(FIXTURE_ANCHOR_DATE, 26);
const TRAINING_START_POST   = daysBefore(FIXTURE_ANCHOR_DATE, 60);

export const FIXTURES: Record<FixtureKey, FixtureMeta> = {
  fresh: {
    key: 'fresh',
    label: 'Fresh — nothing done',
    description: 'Brand-new dealer; no setup completed, agents contracted but not configured.',
    data: {
      rooftop: ROOFTOP_EMPTY,
      departments: [],
      routing: { employeeCount: 0, withPhoneCount: 0, withTransferRouteCount: 0 },
      users: { nonSpyneCount: 0 },
      integrations: INTEGRATIONS_NONE,
      agents: [
        unconfiguredAgent('sales',   'inbound'),
        unconfiguredAgent('sales',   'outbound'),
        unconfiguredAgent('service', 'inbound'),
        unconfiguredAgent('service', 'outbound'),
      ],
      billing: [],
    },
    // fresh has no lifecycle — defaults to all-pre_handover with empty form
    // (which is exactly what useViniLifecycle returns when localStorage is empty).
  },

  pre_handover_all: {
    key: 'pre_handover_all',
    label: 'Pre-handover · all 4',
    description: 'Sales is filling the handover form; rooftop steps locked.',
    data: {
      rooftop: ROOFTOP_EMPTY,
      departments: [],
      routing: { employeeCount: 0, withPhoneCount: 0, withTransferRouteCount: 0 },
      users: { nonSpyneCount: 0 },
      integrations: INTEGRATIONS_NONE,
      agents: [
        unconfiguredAgent('sales',   'inbound'),
        unconfiguredAgent('sales',   'outbound'),
        unconfiguredAgent('service', 'inbound'),
        unconfiguredAgent('service', 'outbound'),
      ],
      billing: [],
    },
    lifecycle: {
      handover: HALF_FILLED_HANDOVER,
      agents: {}, // no agents transferred yet → all in pre_handover by derivation
    },
  },

  pending_ob_all: {
    key: 'pending_ob_all',
    label: 'Pending OB · all 4',
    description: 'Sales has transferred all 4 agents; OB hasn\'t acted yet.',
    data: {
      rooftop: ROOFTOP_EMPTY,
      departments: [],
      routing: { employeeCount: 0, withPhoneCount: 0, withTransferRouteCount: 0 },
      users: { nonSpyneCount: 0 },
      integrations: INTEGRATIONS_NONE,
      agents: [
        unconfiguredAgent('sales',   'inbound'),
        unconfiguredAgent('sales',   'outbound'),
        unconfiguredAgent('service', 'inbound'),
        unconfiguredAgent('service', 'outbound'),
      ],
      billing: [],
    },
    lifecycle: {
      handover: STANDARD_HANDOVER,
      agents: {
        [agentLifecycleKey('sales', 'inbound')]:    { transferredAt: daysBefore(FIXTURE_ANCHOR_DATE, 2) + 'T10:00:00Z', rejectionHistory: [] },
        [agentLifecycleKey('sales', 'outbound')]:   { transferredAt: daysBefore(FIXTURE_ANCHOR_DATE, 2) + 'T10:00:00Z', rejectionHistory: [] },
        [agentLifecycleKey('service', 'inbound')]:  { transferredAt: daysBefore(FIXTURE_ANCHOR_DATE, 2) + 'T10:00:00Z', rejectionHistory: [] },
        [agentLifecycleKey('service', 'outbound')]: { transferredAt: daysBefore(FIXTURE_ANCHOR_DATE, 2) + 'T10:00:00Z', rejectionHistory: [] },
      },
    },
  },

  rejected_back_to_sales: {
    key: 'rejected_back_to_sales',
    label: 'Rejected — back to Sales',
    description: 'OB previously rejected one agent; the rejection callout shows on its row.',
    data: {
      rooftop: ROOFTOP_EMPTY,
      departments: [],
      routing: { employeeCount: 0, withPhoneCount: 0, withTransferRouteCount: 0 },
      users: { nonSpyneCount: 0 },
      integrations: INTEGRATIONS_NONE,
      agents: [
        unconfiguredAgent('sales',   'inbound'),
        unconfiguredAgent('sales',   'outbound'),
        unconfiguredAgent('service', 'inbound'),
        unconfiguredAgent('service', 'outbound'),
      ],
      billing: [],
    },
    lifecycle: {
      handover: STANDARD_HANDOVER,
      agents: {
        [agentLifecycleKey('sales', 'inbound')]: {
          rejectionHistory: [{
            at: daysBefore(FIXTURE_ANCHOR_DATE, 3) + 'T14:30:00Z',
            reason: 'Phone numbers in the handover form don\'t match what the dealer told us on the discovery call. Please re-confirm.',
          }],
        },
        [agentLifecycleKey('sales', 'outbound')]:   { rejectionHistory: [] },
        [agentLifecycleKey('service', 'inbound')]:  { rejectionHistory: [] },
        [agentLifecycleKey('service', 'outbound')]: { rejectionHistory: [] },
      },
    },
  },

  mixed_handover_progress: {
    key: 'mixed_handover_progress',
    label: 'Mixed — one of each stage',
    description: 'Sales IB in implementation, Sales OB in training, Service IB pending OB, Service OB pre-handover.',
    data: {
      rooftop: ROOFTOP_PARTIAL,
      departments: DEPARTMENTS_PARTIAL,
      routing: { employeeCount: 8, withPhoneCount: 6, withTransferRouteCount: 4 },
      users: { nonSpyneCount: 2 },
      integrations: INTEGRATIONS_MIXED,
      agents: [
        inboundAgent('sales',   { name: 'Avery (Sales IB)',  phone: '+1 (775) 555-0142', trainingStartAt: null,                  channelTier: 'partial', obConversations: 18 }),
        outboundAgent('sales',  { name: 'Quinn (Sales OB)',  phone: '+1 (775) 555-0188', trainingStartAt: TRAINING_START_DAY_14, obLeads: 80, obAbr: 28, trainingLeads: 720, trainingAbr: 31, trainingConversations: 240 }),
        unconfiguredAgent('service', 'inbound'),
        unconfiguredAgent('service', 'outbound'),
      ],
      billing: BILLING_HEALTHY,
    },
    lifecycle: {
      handover: STANDARD_HANDOVER,
      agents: {
        [agentLifecycleKey('sales', 'inbound')]: {
          transferredAt: daysBefore(FIXTURE_ANCHOR_DATE, 18) + 'T08:00:00Z',
          acceptedAt:    daysBefore(FIXTURE_ANCHOR_DATE, 17) + 'T08:00:00Z',
          rejectionHistory: [],
        },
        [agentLifecycleKey('sales', 'outbound')]: {
          transferredAt: daysBefore(FIXTURE_ANCHOR_DATE, 30) + 'T08:00:00Z',
          acceptedAt:    daysBefore(FIXTURE_ANCHOR_DATE, 29) + 'T08:00:00Z',
          rejectionHistory: [],
        },
        [agentLifecycleKey('service', 'inbound')]: {
          transferredAt: daysBefore(FIXTURE_ANCHOR_DATE, 1) + 'T08:00:00Z',
          rejectionHistory: [],
        },
        // Service OB has no entries → pre_handover by derivation
      },
    },
    stepTimings: {
      rooftop: rooftopTimings({
        acceptedDaysAgo: 29,
        rooftopDoneDaysAgo: 22,
        departmentsDoneDaysAgo: 20,
        routingDoneDaysAgo: 15,
        integrationsDoneDaysAgo: 17,
      }),
      agents: {
        [agentLifecycleKey('sales', 'inbound')]:  agentTimings({ acceptedDaysAgo: 17 }),
        [agentLifecycleKey('sales', 'outbound')]: agentTimings({ acceptedDaysAgo: 29 }),
      },
    },
  },

  just_accepted_all: {
    key: 'just_accepted_all',
    label: 'Just accepted — Day 0',
    description: 'All 4 agents accepted today; implementation clock starts.',
    data: {
      rooftop: ROOFTOP_EMPTY,
      departments: [],
      routing: { employeeCount: 0, withPhoneCount: 0, withTransferRouteCount: 0 },
      users: { nonSpyneCount: 0 },
      integrations: INTEGRATIONS_NONE,
      agents: [
        unconfiguredAgent('sales',   'inbound'),
        unconfiguredAgent('sales',   'outbound'),
        unconfiguredAgent('service', 'inbound'),
        unconfiguredAgent('service', 'outbound'),
      ],
      billing: [],
    },
    lifecycle: allAccepted(0),
    stepTimings: {
      rooftop: {},
      agents: allAgentsTimings(0),
    },
  },

  mid_onboarding: {
    key: 'mid_onboarding',
    label: 'Mid-onboarding — mixed',
    description: 'Partial setup; agents in different phases; billing pending.',
    data: {
      rooftop: ROOFTOP_FULL,
      departments: DEPARTMENTS_PARTIAL,
      routing: { employeeCount: 12, withPhoneCount: 9, withTransferRouteCount: 7 },
      users: { nonSpyneCount: 3 },
      integrations: INTEGRATIONS_MIXED,
      agents: [
        inboundAgent('sales',   { name: 'Avery (Sales IB)',   phone: '+1 (775) 555-0142', trainingStartAt: TRAINING_START_DAY_14, channelTier: 'partial', obConversations: 42,  trainingConversations: 318, trainingTofu: 62 }),
        outboundAgent('sales',  { name: 'Quinn (Sales OB)',   phone: '+1 (775) 555-0188', trainingStartAt: TRAINING_START_POST,   obLeads: 96,  obAbr: 29, obConversations: 28, trainingLeads: 1240, trainingAbr: 33, trainingConversations: 412, postLeads: 510, postAbr: 33, postConversations: 168 }),
        inboundAgent('service', { name: 'Rowan (Service IB)', phone: '+1 (775) 555-0205', trainingStartAt: null, channelTier: 'partial', obConversations: 14 }),
        notContractedAgent('service', 'outbound'),
      ],
      billing: BILLING_PENDING,
    },
    lifecycle: {
      handover: STANDARD_HANDOVER,
      agents: {
        [agentLifecycleKey('sales',   'inbound')]:  { transferredAt: daysBefore(FIXTURE_ANCHOR_DATE, 30) + 'T08:00:00Z', acceptedAt: daysBefore(FIXTURE_ANCHOR_DATE, 29) + 'T08:00:00Z', rejectionHistory: [] },
        [agentLifecycleKey('sales',   'outbound')]: { transferredAt: daysBefore(FIXTURE_ANCHOR_DATE, 65) + 'T08:00:00Z', acceptedAt: daysBefore(FIXTURE_ANCHOR_DATE, 62) + 'T08:00:00Z', rejectionHistory: [] },
        [agentLifecycleKey('service', 'inbound')]:  { transferredAt: daysBefore(FIXTURE_ANCHOR_DATE, 8)  + 'T08:00:00Z', acceptedAt: daysBefore(FIXTURE_ANCHOR_DATE, 7)  + 'T08:00:00Z', rejectionHistory: [] },
      },
    },
    stepTimings: {
      rooftop: rooftopTimings({ acceptedDaysAgo: 62, rooftopDoneDaysAgo: 55, departmentsDoneDaysAgo: 50, integrationsDoneDaysAgo: 40 }),
      agents: {
        [agentLifecycleKey('sales',   'inbound')]:  agentTimings({ acceptedDaysAgo: 29 }),
        [agentLifecycleKey('sales',   'outbound')]: agentTimings({ acceptedDaysAgo: 62, completedDaysAgo: 30 }),
        [agentLifecycleKey('service', 'inbound')]:  agentTimings({ acceptedDaysAgo: 7 }),
      },
    },
  },

  integrations_missing: {
    key: 'integrations_missing',
    label: 'Integrations missing',
    description: 'Setup ready except integrations; agents can\'t be configured without them.',
    data: {
      rooftop: ROOFTOP_FULL,
      departments: DEPARTMENTS_FULL,
      routing: { employeeCount: 14, withPhoneCount: 14, withTransferRouteCount: 10 },
      users: { nonSpyneCount: 4 },
      integrations: INTEGRATIONS_NONE,
      agents: [
        unconfiguredAgent('sales',   'inbound'),
        unconfiguredAgent('sales',   'outbound'),
        unconfiguredAgent('service', 'inbound'),
        unconfiguredAgent('service', 'outbound'),
      ],
      billing: BILLING_HEALTHY,
    },
    lifecycle: allAccepted(5),
    stepTimings: {
      rooftop: rooftopTimings({
        acceptedDaysAgo: 5,
        rooftopDoneDaysAgo: 4,
        departmentsDoneDaysAgo: 3,
        routingDoneDaysAgo: 2,
        usersDoneDaysAgo: 2,
      }),
      agents: allAgentsTimings(5),
    },
  },

  all_not_contracted: {
    key: 'all_not_contracted',
    label: 'No agents contracted',
    description: 'Setup mostly ready, but the rooftop hasn\'t contracted any agents yet.',
    data: {
      rooftop: ROOFTOP_FULL,
      departments: DEPARTMENTS_FULL,
      routing: { employeeCount: 8, withPhoneCount: 6, withTransferRouteCount: 4 },
      users: { nonSpyneCount: 2 },
      integrations: INTEGRATIONS_MIXED,
      agents: [
        notContractedAgent('sales', 'inbound'),
        notContractedAgent('sales', 'outbound'),
        notContractedAgent('service', 'inbound'),
        notContractedAgent('service', 'outbound'),
      ],
      billing: BILLING_HEALTHY,
    },
    // No contracted agents → distribution shows 0 across every stage. The
    // page still renders the rooftop summary and steps; agent rows render
    // as "Not contracted".
    lifecycle: { handover: STANDARD_HANDOVER, agents: {} },
    stepTimings: {
      rooftop: rooftopTimings({
        acceptedDaysAgo: 20,
        rooftopDoneDaysAgo: 15,
        departmentsDoneDaysAgo: 12,
        routingDoneDaysAgo: 10,
        usersDoneDaysAgo: 9,
        integrationsDoneDaysAgo: 7,
      }),
      agents: {},
    },
  },

  ready_pre_training: {
    key: 'ready_pre_training',
    label: 'Ready — pre-training',
    description: 'Every setup area green; agents contracted but training not started.',
    data: {
      rooftop: ROOFTOP_FULL,
      departments: DEPARTMENTS_FULL,
      routing: { employeeCount: 14, withPhoneCount: 14, withTransferRouteCount: 12 },
      users: { nonSpyneCount: 5 },
      integrations: INTEGRATIONS_FULL,
      agents: [
        inboundAgent('sales',  { name: 'Avery (Sales IB)',  phone: '+1 (775) 555-0142', trainingStartAt: null, channelTier: 'live' }),
        outboundAgent('sales', { name: 'Quinn (Sales OB)',  phone: '+1 (775) 555-0188', trainingStartAt: null }),
        inboundAgent('service',{ name: 'Rowan (Service IB)',phone: '+1 (775) 555-0205', trainingStartAt: null, channelTier: 'live' }),
        outboundAgent('service',{name: 'Sage (Service OB)', phone: '+1 (775) 555-0211', trainingStartAt: null }),
      ],
      billing: BILLING_HEALTHY,
    },
    lifecycle: allAccepted(10),
    stepTimings: {
      rooftop: rooftopTimings({
        acceptedDaysAgo: 10,
        rooftopDoneDaysAgo: 8,
        departmentsDoneDaysAgo: 7,
        routingDoneDaysAgo: 6,
        usersDoneDaysAgo: 5,
        integrationsDoneDaysAgo: 3,
        billingDoneDaysAgo: 2,
      }),
      agents: allAgentsTimings(10),
    },
  },

  training_day_1: {
    key: 'training_day_1',
    label: 'Training — Day 1',
    description: 'All 4 agents just started training today.',
    data: {
      rooftop: ROOFTOP_FULL,
      departments: DEPARTMENTS_FULL,
      routing: { employeeCount: 14, withPhoneCount: 14, withTransferRouteCount: 12 },
      users: { nonSpyneCount: 5 },
      integrations: INTEGRATIONS_FULL,
      agents: [
        inboundAgent('sales',  { name: 'Avery (Sales IB)',  phone: '+1 (775) 555-0142', trainingStartAt: TRAINING_START_DAY_1, channelTier: 'live', obConversations: 38, trainingConversations: 4, trainingTofu: 10 }),
        outboundAgent('sales', { name: 'Quinn (Sales OB)',  phone: '+1 (775) 555-0188', trainingStartAt: TRAINING_START_DAY_1, obLeads: 80, obAbr: 25, obConversations: 22, trainingLeads: 18, trainingAbr: 22, trainingConversations: 4 }),
        inboundAgent('service',{ name: 'Rowan (Service IB)',phone: '+1 (775) 555-0205', trainingStartAt: TRAINING_START_DAY_1, channelTier: 'live', obConversations: 24, trainingConversations: 2, trainingTofu: 8 }),
        outboundAgent('service',{name: 'Sage (Service OB)', phone: '+1 (775) 555-0211', trainingStartAt: TRAINING_START_DAY_1, obLeads: 50, obAbr: 22, obConversations: 12, trainingLeads: 10, trainingAbr: 20, trainingConversations: 2 }),
      ],
      billing: BILLING_HEALTHY,
    },
    lifecycle: allAccepted(7),
    stepTimings: {
      rooftop: rooftopTimings({
        acceptedDaysAgo: 7,
        rooftopDoneDaysAgo: 6,
        departmentsDoneDaysAgo: 5,
        routingDoneDaysAgo: 4,
        usersDoneDaysAgo: 3,
        integrationsDoneDaysAgo: 1,
      }),
      agents: allAgentsTimings(7),
    },
  },

  training_day_14: {
    key: 'training_day_14',
    label: 'Training — Day 14',
    description: 'All 4 agents halfway through the 28-day training ramp.',
    data: {
      rooftop: ROOFTOP_FULL,
      departments: DEPARTMENTS_FULL,
      routing: { employeeCount: 14, withPhoneCount: 14, withTransferRouteCount: 12 },
      users: { nonSpyneCount: 5 },
      integrations: INTEGRATIONS_FULL,
      agents: [
        inboundAgent('sales',  { name: 'Avery (Sales IB)',  phone: '+1 (775) 555-0142', trainingStartAt: TRAINING_START_DAY_14, channelTier: 'live', obConversations: 38, trainingConversations: 220, trainingTofu: 58 }),
        outboundAgent('sales', { name: 'Quinn (Sales OB)',  phone: '+1 (775) 555-0188', trainingStartAt: TRAINING_START_DAY_14, obLeads: 80, obAbr: 25, obConversations: 22, trainingLeads: 720, trainingAbr: 31, trainingConversations: 240 }),
        inboundAgent('service',{ name: 'Rowan (Service IB)',phone: '+1 (775) 555-0205', trainingStartAt: TRAINING_START_DAY_14, channelTier: 'live', obConversations: 24, trainingConversations: 165, trainingTofu: 55 }),
        outboundAgent('service',{name: 'Sage (Service OB)', phone: '+1 (775) 555-0211', trainingStartAt: TRAINING_START_DAY_14, obLeads: 50, obAbr: 22, obConversations: 12, trainingLeads: 520, trainingAbr: 28, trainingConversations: 168 }),
      ],
      billing: BILLING_HEALTHY,
    },
    lifecycle: allAccepted(20),
    stepTimings: {
      rooftop: rooftopTimings({
        acceptedDaysAgo: 20,
        rooftopDoneDaysAgo: 18,
        departmentsDoneDaysAgo: 17,
        routingDoneDaysAgo: 15,
        usersDoneDaysAgo: 14,
        integrationsDoneDaysAgo: 14,
        billingDoneDaysAgo: 10,
      }),
      agents: allAgentsTimings(20),
    },
  },

  training_day_27: {
    key: 'training_day_27',
    label: 'Training — Day 27',
    description: 'Agents on the final day of training, about to transition to post-training.',
    data: {
      rooftop: ROOFTOP_FULL,
      departments: DEPARTMENTS_FULL,
      routing: { employeeCount: 14, withPhoneCount: 14, withTransferRouteCount: 12 },
      users: { nonSpyneCount: 5 },
      integrations: INTEGRATIONS_FULL,
      agents: [
        inboundAgent('sales',  { name: 'Avery (Sales IB)',  phone: '+1 (775) 555-0142', trainingStartAt: TRAINING_START_DAY_27, channelTier: 'live', obConversations: 38, trainingConversations: 480, trainingTofu: 71 }),
        outboundAgent('sales', { name: 'Quinn (Sales OB)',  phone: '+1 (775) 555-0188', trainingStartAt: TRAINING_START_DAY_27, obLeads: 80, obAbr: 25, obConversations: 22, trainingLeads: 1480, trainingAbr: 35, trainingConversations: 510 }),
        inboundAgent('service',{ name: 'Rowan (Service IB)',phone: '+1 (775) 555-0205', trainingStartAt: TRAINING_START_DAY_27, channelTier: 'live', obConversations: 24, trainingConversations: 360, trainingTofu: 68 }),
        outboundAgent('service',{name: 'Sage (Service OB)', phone: '+1 (775) 555-0211', trainingStartAt: TRAINING_START_DAY_27, obLeads: 50, obAbr: 22, obConversations: 12, trainingLeads: 1080, trainingAbr: 31, trainingConversations: 360 }),
      ],
      billing: BILLING_HEALTHY,
    },
    lifecycle: allAccepted(35),
    stepTimings: {
      rooftop: rooftopTimings({
        acceptedDaysAgo: 35,
        rooftopDoneDaysAgo: 32,
        departmentsDoneDaysAgo: 30,
        routingDoneDaysAgo: 28,
        usersDoneDaysAgo: 27,
        integrationsDoneDaysAgo: 27,
        billingDoneDaysAgo: 20,
      }),
      agents: allAgentsTimings(35),
    },
  },

  post_training_healthy: {
    key: 'post_training_healthy',
    label: 'Post-training — healthy',
    description: 'Agents in full production, billing current, everything green.',
    data: {
      rooftop: ROOFTOP_FULL,
      departments: DEPARTMENTS_FULL,
      routing: { employeeCount: 14, withPhoneCount: 14, withTransferRouteCount: 12 },
      users: { nonSpyneCount: 6 },
      integrations: INTEGRATIONS_FULL,
      agents: [
        inboundAgent('sales',  { name: 'Avery (Sales IB)',  phone: '+1 (775) 555-0142', trainingStartAt: TRAINING_START_POST, channelTier: 'live', obConversations: 38, trainingConversations: 520, trainingTofu: 71, postConversations: 280, postTofu: 74 }),
        outboundAgent('sales', { name: 'Quinn (Sales OB)',  phone: '+1 (775) 555-0188', trainingStartAt: TRAINING_START_POST, obLeads: 80, obAbr: 25, obConversations: 22, trainingLeads: 1580, trainingAbr: 35, trainingConversations: 540, postLeads: 820, postAbr: 36, postConversations: 290 }),
        inboundAgent('service',{ name: 'Rowan (Service IB)',phone: '+1 (775) 555-0205', trainingStartAt: TRAINING_START_POST, channelTier: 'live', obConversations: 24, trainingConversations: 380, trainingTofu: 68, postConversations: 210, postTofu: 72 }),
        outboundAgent('service',{name: 'Sage (Service OB)', phone: '+1 (775) 555-0211', trainingStartAt: TRAINING_START_POST, obLeads: 50, obAbr: 22, obConversations: 12, trainingLeads: 1180, trainingAbr: 31, trainingConversations: 380, postLeads: 620, postAbr: 33, postConversations: 215 }),
      ],
      billing: BILLING_HEALTHY,
    },
    lifecycle: allAccepted(70),
    stepTimings: {
      rooftop: rooftopTimings({
        acceptedDaysAgo: 70,
        rooftopDoneDaysAgo: 65,
        departmentsDoneDaysAgo: 63,
        routingDoneDaysAgo: 60,
        usersDoneDaysAgo: 58,
        integrationsDoneDaysAgo: 58,
        billingDoneDaysAgo: 45,
      }),
      agents: {
        [agentLifecycleKey('sales', 'inbound')]:    agentTimings({ acceptedDaysAgo: 70, completedDaysAgo: 30 }),
        [agentLifecycleKey('sales', 'outbound')]:   agentTimings({ acceptedDaysAgo: 70, completedDaysAgo: 30 }),
        [agentLifecycleKey('service', 'inbound')]:  agentTimings({ acceptedDaysAgo: 70, completedDaysAgo: 30 }),
        [agentLifecycleKey('service', 'outbound')]: agentTimings({ acceptedDaysAgo: 70, completedDaysAgo: 30 }),
      },
    },
  },

  partial_channels: {
    key: 'partial_channels',
    label: 'Partial channel deployment',
    description: 'Inbound agents have inconsistent channel deployment — phone live but SMS not.',
    data: {
      rooftop: ROOFTOP_FULL,
      departments: DEPARTMENTS_FULL,
      routing: { employeeCount: 14, withPhoneCount: 14, withTransferRouteCount: 12 },
      users: { nonSpyneCount: 5 },
      integrations: INTEGRATIONS_FULL,
      agents: [
        inboundAgent('sales',  { name: 'Avery (Sales IB)',  phone: '+1 (775) 555-0142', trainingStartAt: TRAINING_START_DAY_14, channelTier: 'partial', obConversations: 38, trainingConversations: 220, trainingTofu: 58 }),
        outboundAgent('sales', { name: 'Quinn (Sales OB)',  phone: '+1 (775) 555-0188', trainingStartAt: TRAINING_START_DAY_14, obLeads: 80, obAbr: 25, trainingLeads: 720, trainingAbr: 31, trainingConversations: 240 }),
        inboundAgent('service',{ name: 'Rowan (Service IB)',phone: '+1 (775) 555-0205', trainingStartAt: TRAINING_START_DAY_14, channelTier: 'partial', obConversations: 24, trainingConversations: 110, trainingTofu: 42 }),
        outboundAgent('service',{name: 'Sage (Service OB)', phone: '+1 (775) 555-0211', trainingStartAt: TRAINING_START_DAY_14, obLeads: 50, obAbr: 22, trainingLeads: 520, trainingAbr: 28, trainingConversations: 168 }),
      ],
      billing: BILLING_HEALTHY,
    },
    lifecycle: allAccepted(20),
    stepTimings: {
      rooftop: rooftopTimings({
        acceptedDaysAgo: 20,
        rooftopDoneDaysAgo: 18,
        departmentsDoneDaysAgo: 17,
        routingDoneDaysAgo: 15,
        usersDoneDaysAgo: 14,
        integrationsDoneDaysAgo: 14,
      }),
      agents: allAgentsTimings(20),
    },
  },

  billing_overdue: {
    key: 'billing_overdue',
    label: 'Billing — overdue',
    description: 'Otherwise healthy account with the current month overdue.',
    data: {
      rooftop: ROOFTOP_FULL,
      departments: DEPARTMENTS_FULL,
      routing: { employeeCount: 14, withPhoneCount: 14, withTransferRouteCount: 12 },
      users: { nonSpyneCount: 6 },
      integrations: INTEGRATIONS_FULL,
      agents: [
        inboundAgent('sales',  { name: 'Avery (Sales IB)',  phone: '+1 (775) 555-0142', trainingStartAt: TRAINING_START_POST, channelTier: 'live', obConversations: 38, trainingConversations: 520, trainingTofu: 71, postConversations: 280, postTofu: 74 }),
        outboundAgent('sales', { name: 'Quinn (Sales OB)',  phone: '+1 (775) 555-0188', trainingStartAt: TRAINING_START_POST, obLeads: 80, obAbr: 25, trainingLeads: 1580, trainingAbr: 35, trainingConversations: 540, postLeads: 820, postAbr: 36, postConversations: 290 }),
        inboundAgent('service',{ name: 'Rowan (Service IB)',phone: '+1 (775) 555-0205', trainingStartAt: TRAINING_START_POST, channelTier: 'live', obConversations: 24, trainingConversations: 380, trainingTofu: 68, postConversations: 210, postTofu: 72 }),
        outboundAgent('service',{name: 'Sage (Service OB)', phone: '+1 (775) 555-0211', trainingStartAt: TRAINING_START_POST, obLeads: 50, obAbr: 22, trainingLeads: 1180, trainingAbr: 31, trainingConversations: 380, postLeads: 620, postAbr: 33, postConversations: 215 }),
      ],
      billing: BILLING_OVERDUE,
    },
    lifecycle: allAccepted(70),
    stepTimings: {
      rooftop: rooftopTimings({
        acceptedDaysAgo: 70,
        rooftopDoneDaysAgo: 65,
        departmentsDoneDaysAgo: 63,
        routingDoneDaysAgo: 60,
        usersDoneDaysAgo: 58,
        integrationsDoneDaysAgo: 58,
      }),
      agents: {
        [agentLifecycleKey('sales', 'inbound')]:    agentTimings({ acceptedDaysAgo: 70, completedDaysAgo: 30 }),
        [agentLifecycleKey('sales', 'outbound')]:   agentTimings({ acceptedDaysAgo: 70, completedDaysAgo: 30 }),
        [agentLifecycleKey('service', 'inbound')]:  agentTimings({ acceptedDaysAgo: 70, completedDaysAgo: 30 }),
        [agentLifecycleKey('service', 'outbound')]: agentTimings({ acceptedDaysAgo: 70, completedDaysAgo: 30 }),
      },
    },
  },

  billing_history_empty: {
    key: 'billing_history_empty',
    label: 'Billing — no history',
    description: 'First-month dealer, no invoices generated yet.',
    data: {
      rooftop: ROOFTOP_FULL,
      departments: DEPARTMENTS_FULL,
      routing: { employeeCount: 10, withPhoneCount: 10, withTransferRouteCount: 8 },
      users: { nonSpyneCount: 4 },
      integrations: INTEGRATIONS_FULL,
      agents: [
        inboundAgent('sales',  { name: 'Avery (Sales IB)',  phone: '+1 (775) 555-0142', trainingStartAt: TRAINING_START_DAY_1, channelTier: 'live', obConversations: 38, trainingConversations: 4, trainingTofu: 10 }),
        outboundAgent('sales', { name: 'Quinn (Sales OB)',  phone: '+1 (775) 555-0188', trainingStartAt: TRAINING_START_DAY_1, obLeads: 80, obAbr: 25, trainingLeads: 18, trainingAbr: 22, trainingConversations: 4 }),
        notContractedAgent('service', 'inbound'),
        notContractedAgent('service', 'outbound'),
      ],
      billing: [],
    },
    lifecycle: {
      handover: STANDARD_HANDOVER,
      agents: {
        [agentLifecycleKey('sales', 'inbound')]:  { transferredAt: daysBefore(FIXTURE_ANCHOR_DATE, 7) + 'T08:00:00Z', acceptedAt: daysBefore(FIXTURE_ANCHOR_DATE, 6) + 'T08:00:00Z', rejectionHistory: [] },
        [agentLifecycleKey('sales', 'outbound')]: { transferredAt: daysBefore(FIXTURE_ANCHOR_DATE, 7) + 'T08:00:00Z', acceptedAt: daysBefore(FIXTURE_ANCHOR_DATE, 6) + 'T08:00:00Z', rejectionHistory: [] },
      },
    },
    stepTimings: {
      rooftop: rooftopTimings({
        acceptedDaysAgo: 6,
        rooftopDoneDaysAgo: 5,
        departmentsDoneDaysAgo: 4,
        routingDoneDaysAgo: 3,
        usersDoneDaysAgo: 2,
        integrationsDoneDaysAgo: 1,
      }),
      agents: {
        [agentLifecycleKey('sales', 'inbound')]:  agentTimings({ acceptedDaysAgo: 6 }),
        [agentLifecycleKey('sales', 'outbound')]: agentTimings({ acceptedDaysAgo: 6 }),
      },
    },
  },

  billing_all_overdue: {
    key: 'billing_all_overdue',
    label: 'Billing — all overdue',
    description: 'All three months unpaid; account is at risk.',
    data: {
      rooftop: ROOFTOP_FULL,
      departments: DEPARTMENTS_FULL,
      routing: { employeeCount: 14, withPhoneCount: 14, withTransferRouteCount: 12 },
      users: { nonSpyneCount: 6 },
      integrations: INTEGRATIONS_FULL,
      agents: [
        inboundAgent('sales',  { name: 'Avery (Sales IB)',  phone: '+1 (775) 555-0142', trainingStartAt: TRAINING_START_POST, channelTier: 'live', obConversations: 38, trainingConversations: 520, trainingTofu: 71, postConversations: 280, postTofu: 74 }),
        outboundAgent('sales', { name: 'Quinn (Sales OB)',  phone: '+1 (775) 555-0188', trainingStartAt: TRAINING_START_POST, obLeads: 80, obAbr: 25, trainingLeads: 1580, trainingAbr: 35, trainingConversations: 540, postLeads: 820, postAbr: 36, postConversations: 290 }),
        inboundAgent('service',{ name: 'Rowan (Service IB)',phone: '+1 (775) 555-0205', trainingStartAt: TRAINING_START_POST, channelTier: 'live', obConversations: 24, trainingConversations: 380, trainingTofu: 68, postConversations: 210, postTofu: 72 }),
        outboundAgent('service',{name: 'Sage (Service OB)', phone: '+1 (775) 555-0211', trainingStartAt: TRAINING_START_POST, obLeads: 50, obAbr: 22, trainingLeads: 1180, trainingAbr: 31, trainingConversations: 380, postLeads: 620, postAbr: 33, postConversations: 215 }),
      ],
      billing: BILLING_ALL_OVERDUE,
    },
    lifecycle: allAccepted(70),
    stepTimings: {
      rooftop: rooftopTimings({
        acceptedDaysAgo: 70,
        rooftopDoneDaysAgo: 65,
        departmentsDoneDaysAgo: 63,
        routingDoneDaysAgo: 60,
        usersDoneDaysAgo: 58,
        integrationsDoneDaysAgo: 58,
      }),
      agents: {
        [agentLifecycleKey('sales', 'inbound')]:    agentTimings({ acceptedDaysAgo: 70, completedDaysAgo: 30 }),
        [agentLifecycleKey('sales', 'outbound')]:   agentTimings({ acceptedDaysAgo: 70, completedDaysAgo: 30 }),
        [agentLifecycleKey('service', 'inbound')]:  agentTimings({ acceptedDaysAgo: 70, completedDaysAgo: 30 }),
        [agentLifecycleKey('service', 'outbound')]: agentTimings({ acceptedDaysAgo: 70, completedDaysAgo: 30 }),
      },
    },
  },
};

export const FIXTURE_ORDER: FixtureKey[] = [
  // Lifecycle stages — Sales → OB handover progression
  'fresh',
  'pre_handover_all',
  'pending_ob_all',
  'rejected_back_to_sales',
  'mixed_handover_progress',
  'just_accepted_all',
  // Implementation & training
  'mid_onboarding',
  'integrations_missing',
  'all_not_contracted',
  'ready_pre_training',
  'training_day_1',
  'training_day_14',
  'training_day_27',
  'post_training_healthy',
  'partial_channels',
  // Billing edge cases
  'billing_overdue',
  'billing_history_empty',
  'billing_all_overdue',
];

export const DEFAULT_FIXTURE: FixtureKey = 'mid_onboarding';

export function resolveFixture(key: string | null | undefined): FixtureMeta {
  if (key && key in FIXTURES) return FIXTURES[key as FixtureKey];
  return FIXTURES[DEFAULT_FIXTURE];
}
