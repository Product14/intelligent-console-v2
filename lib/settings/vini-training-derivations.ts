// Pure derivations for the Vini Training dashboard.
//
// Everything here takes data + lifecycle inputs and returns view-shaped values.
// No side effects; safe to call in render.

import {
  SOURCE_ORDER,
  type SourceCategory,
  type SourceId,
  type SourceStatus,
  type ViniTrainingData,
} from './vini-training-mock';

// ---------------------------------------------------------------------------
// Sources Covered card
// ---------------------------------------------------------------------------

export interface SourcesCoveredSummary {
  liveCount: number;
  totalCount: number;
  byCategory: {
    inbound:  { live: number; total: number };
    outbound: { live: number; total: number };
  };
}

export function summarizeSources(sources: SourceStatus[]): SourcesCoveredSummary {
  const inboundAll  = sources.filter((s) => s.category === 'inbound');
  const outboundAll = sources.filter((s) => s.category === 'outbound');
  return {
    liveCount:  sources.filter((s) => s.live).length,
    totalCount: sources.length,
    byCategory: {
      inbound:  { live: inboundAll.filter((s) => s.live).length,  total: inboundAll.length  },
      outbound: { live: outboundAll.filter((s) => s.live).length, total: outboundAll.length },
    },
  };
}

/** Sources sorted by SOURCE_ORDER — defensive against arbitrary backend order. */
export function orderedSources(sources: SourceStatus[]): SourceStatus[] {
  const byId = new Map(sources.map((s) => [s.id, s]));
  return SOURCE_ORDER
    .map((id) => byId.get(id))
    .filter((s): s is SourceStatus => Boolean(s));
}

// ---------------------------------------------------------------------------
// Lead Coverage card
// ---------------------------------------------------------------------------

export function coveragePct(worked: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((worked / total) * 100);
}

// ---------------------------------------------------------------------------
// Response time formatting
// ---------------------------------------------------------------------------

/** "47s" / "2m 30s" / "38m" — compact display for the response-time card. */
export function formatResponseTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (s === 0) return `${m}m`;
  if (m < 5) return `${m}m ${s}s`;
  return `${m}m`;
}

// ---------------------------------------------------------------------------
// Confidence-builder peer-source selection.
// ---------------------------------------------------------------------------
//
// When a source is NOT LIVE, we surface a one-liner proving Vini works on a
// comparable LIVE source. Inbound disabled → prefer an inbound peer; if none,
// fall back to any live source. Outbound campaigns do the same with campaigns.

const PEER_PRIORITY: Record<SourceId, SourceId[]> = {
  // Inbound disabled sources — prefer voice→voice peers, then any inbound.
  'voice-after-hours':  ['voice-overflow', 'voice-office-hours', 'chatbot', 'speed-to-lead'],
  'voice-overflow':     ['voice-after-hours', 'voice-office-hours', 'chatbot', 'speed-to-lead'],
  'voice-office-hours': ['voice-after-hours', 'voice-overflow', 'chatbot', 'speed-to-lead'],
  'chatbot':            ['voice-after-hours', 'voice-overflow', 'speed-to-lead'],
  'speed-to-lead':      ['voice-after-hours', 'chatbot', 'voice-overflow'],
  // Outbound campaigns — prefer another campaign as the peer.
  'campaign-dormant':        ['campaign-prior-interest', 'campaign-lease-expiry'],
  'campaign-prior-interest': ['campaign-dormant', 'campaign-lease-expiry'],
  'campaign-lease-expiry':   ['campaign-dormant', 'campaign-prior-interest'],
};

/** Pick the best live peer source for a disabled source. Returns null when
 *  nothing is live yet (Day 1 with zero sources — UI hides the line). */
export function pickPeerSource(
  disabledId: SourceId,
  sources: SourceStatus[]
): SourceStatus | null {
  const liveById = new Map(
    sources.filter((s) => s.live).map((s) => [s.id, s])
  );
  for (const candidate of PEER_PRIORITY[disabledId] ?? []) {
    const peer = liveById.get(candidate);
    if (peer) return peer;
  }
  // Last-resort: any live source of the same category.
  const disabled = sources.find((s) => s.id === disabledId);
  if (disabled) {
    const sameCategory = sources.find((s) => s.live && s.category === disabled.category);
    if (sameCategory) return sameCategory;
  }
  // Final fallback: any live source.
  for (const s of sources) {
    if (s.live) return s;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Source lookup by category
// ---------------------------------------------------------------------------

export function getSource(data: ViniTrainingData, id: SourceId): SourceStatus | undefined {
  return data.sources.find((s) => s.id === id);
}

export function isSourceLive(data: ViniTrainingData, id: SourceId): boolean {
  return Boolean(getSource(data, id)?.live);
}

export function sourcesByCategory(
  sources: SourceStatus[],
  category: SourceCategory
): SourceStatus[] {
  return sources.filter((s) => s.category === category);
}

// ---------------------------------------------------------------------------
// Heatmap helpers
// ---------------------------------------------------------------------------

export type HeatmapCellState = 'vini' | 'bdc' | 'missed' | 'empty';

export interface HeatmapClassification {
  state: HeatmapCellState;
  vini: number;
  bdc: number;
  missed: number;
  total: number;
}

/** Pure cell classification — picks the dominant disposition for the
 *  hour-of-week cell. "empty" when there were zero calls at that hour. */
export function classifyHeatmapCell(args: {
  vini: number;
  bdc: number;
  missed: number;
}): HeatmapClassification {
  const { vini, bdc, missed } = args;
  const total = vini + bdc + missed;
  if (total === 0) {
    return { state: 'empty', vini, bdc, missed, total };
  }
  if (vini >= bdc && vini >= missed) {
    return { state: 'vini', vini, bdc, missed, total };
  }
  if (missed >= bdc) {
    return { state: 'missed', vini, bdc, missed, total };
  }
  return { state: 'bdc', vini, bdc, missed, total };
}
