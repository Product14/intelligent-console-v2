// Vini Status data layer — types + mock.
//
// Shape mirrors what a real analytics API would deliver so the eventual swap
// is a one-file change inside hooks/use-vini-status.ts. Section-ready and
// summary-banner derivations live in lib/vini-status-rules.ts.

export type AgentType = 'sales' | 'service';
export type AgentCallType = 'inbound' | 'outbound';

export interface RooftopStatus {
  name: string | null;
  website: string | null;
  address: string | null;
  timezone: string | null;
}

export interface DepartmentStatus {
  id: string;
  name: string;
  hoursSummary: string | null;
}

export interface RoutingStatus {
  employeeCount: number;
  withPhoneCount: number;
  withTransferRouteCount: number;
}

export interface UsersStatus {
  /** Console users invited, excluding Spyne staff. ≥ 1 means console training
   *  has happened (an operator other than Spyne is using the console). */
  nonSpyneCount: number;
}

export type IntegrationStatusValue = 'active' | 'inactive' | 'not_connected';

export interface IntegrationRow {
  provider: string | null;
  /** URL to the partner's logo. `null` when not connected or when the
   *  partner has no logo registered yet — the UI falls back to a styled
   *  initial-letter avatar in either case. */
  logo: string | null;
  status: IntegrationStatusValue;
  lastSyncedAt: string | null;
}

export interface CarHistoryRow {
  provider: string | null;
  logo: string | null;
  selected: boolean;
}

export interface IntegrationsStatus {
  crm: IntegrationRow;
  ims: IntegrationRow;
  dms: IntegrationRow;
  carHistory: CarHistoryRow;
  serviceScheduler: IntegrationRow;
}

export type ChannelStatus = 'live' | 'partial' | 'not_deployed';

export interface ChannelRow {
  status: ChannelStatus;
  routedPct: number;
}

export interface ChannelDeployment {
  phone: ChannelRow;
  chatbot: ChannelRow;
  sms: ChannelRow;
}

export interface PeriodMetrics {
  /** Inclusive date range covering the period, e.g. "Mar 5 – Apr 1". `null`
   *  when the period hasn't started for this agent yet. */
  dateRange: string | null;
  conversations: number | null;
  /** Inbound-only — TOFU opened % across the period. */
  tofuPct?: number | null;
  /** Outbound-only — leads reached out to in this period. */
  leadsReached?: number | null;
  /** Outbound-only — Answer-By-Recipient % (ABR). */
  abrPct?: number | null;
}

export interface AgentStatus {
  type: AgentType;
  callType: AgentCallType;
  contracted: boolean;
  avatar: string | null;
  name: string | null;
  phone: string | null;
  /** ISO date string. `null` until OB marks implementation done; the day this
   *  is set, training Day 1 begins. */
  trainingStartAt: string | null;
  /** Inbound agents only. Outbound agents omit this field. */
  channels?: ChannelDeployment;
  metrics: {
    ob: PeriodMetrics;
    training: PeriodMetrics;
    postTraining: PeriodMetrics;
  };
}

export type BillingMonthStatus = 'paid' | 'pending' | 'overdue';

export interface BillingMonth {
  /** Human label, e.g. "Jun 2026". */
  month: string;
  /** Display string with currency symbol, e.g. "$4,200". */
  amount: string;
  status: BillingMonthStatus;
}

export interface ViniStatusData {
  rooftop: RooftopStatus;
  departments: DepartmentStatus[];
  routing: RoutingStatus;
  users: UsersStatus;
  integrations: IntegrationsStatus;
  agents: AgentStatus[];
  billing: BillingMonth[];
}

// Named fixtures live in lib/vini-status-fixtures.ts. The hook resolves a
// fixture by URL param (?fixture=<key>); this file owns the data shape only.

/** The four agent slots a rooftop *could* contract, in display order. */
export const AGENT_SLOTS: Array<{ type: AgentType; callType: AgentCallType; label: string }> = [
  { type: 'sales',   callType: 'inbound',  label: 'Sales · Inbound' },
  { type: 'sales',   callType: 'outbound', label: 'Sales · Outbound' },
  { type: 'service', callType: 'inbound',  label: 'Service · Inbound' },
  { type: 'service', callType: 'outbound', label: 'Service · Outbound' },
];

/** Helper used by the screen + tests — `today` is injected so we don't call
 *  Date.now() inside pure code. */
export function getAgentSlot(
  agents: AgentStatus[],
  type: AgentType,
  callType: AgentCallType
): AgentStatus | undefined {
  return agents.find((a) => a.type === type && a.callType === callType);
}
