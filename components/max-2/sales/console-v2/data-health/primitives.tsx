"use client";

/**
 * Data-health shared primitives. Two rules are baked in here so they can't be
 * violated downstream:
 *   1. Staleness is judged per sync-mode SLA, never a flat clock.
 *   2. A value is never shown without its freshness date.
 * Colors come from the spyne-badge-* token classes — no hard-coded hexes.
 */

import { Icon as MaterialSymbol } from "./icons";
import { staleness, type ConnectorState, type SyncMode, type Severity } from "./types";

const SEVERITY_BADGE: Record<Severity, string> = {
  fresh: "spyne-badge-success",
  aging: "spyne-badge-warning",
  stale: "spyne-badge-error",
};

const STATE_LABEL: Partial<Record<ConnectorState, string>> = {
  "degraded-backfilling": "Backfilling",
  "certification-pending": "Pending cert",
  disconnected: "Disconnected",
};

/** Green/amber/red badge from last-sync vs the connector's OWN SLA window. */
export function StalenessBadge({
  staleMins,
  slaWindowMins,
  state,
  costHint,
}: {
  staleMins: number;
  slaWindowMins: number;
  state: ConnectorState;
  costHint?: string;
}) {
  const sev = staleness(staleMins, slaWindowMins, state);
  const label =
    STATE_LABEL[state] ?? (sev === "fresh" ? "Fresh" : sev === "aging" ? "Aging" : "Stale");
  const slaText =
    slaWindowMins >= 1440
      ? `${Math.round(slaWindowMins / 1440)}d SLA`
      : slaWindowMins >= 60
        ? `${Math.round(slaWindowMins / 60)}h SLA`
        : `${slaWindowMins}m SLA`;
  return (
    <span
      className={`spyne-badge ${SEVERITY_BADGE[sev]} inline-flex items-center gap-1`}
      title={costHint ?? `Judged against this connector's ${slaText} — not a flat clock.`}
    >
      <span className="size-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
}

/** "as of HH:MM · next HH:MM" — enforces the never-a-value-without-a-date rule. */
export function LastSyncStamp({
  lastSyncLabel,
  nextSyncLabel,
  compact,
}: {
  lastSyncLabel: string;
  nextSyncLabel?: string;
  compact?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-1 ${compact ? "text-[10.5px]" : "text-[11px]"}`} style={{ color: "var(--spyne-text-muted)" }}>
      <MaterialSymbol name="schedule" size={11} aria-hidden />
      as of <strong style={{ color: "var(--spyne-text-secondary)" }}>{lastSyncLabel}</strong>
      {nextSyncLabel && !compact && (
        <>
          <span aria-hidden>·</span> next {nextSyncLabel}
        </>
      )}
    </span>
  );
}

const MODE_GLYPH: Record<SyncMode, string> = {
  "real-time API": "bolt",
  webhook: "webhook",
  "intraday feed": "sync",
  "nightly batch": "bedtime",
  CSV: "upload_file",
  "on-demand lookup": "search",
  "certification-pending": "pending",
};

export function SyncModeChip({ mode, tone = "neutral" }: { mode: SyncMode; tone?: "neutral" | "warning" }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={
        tone === "warning"
          ? { background: "var(--spyne-warning-subtle)", color: "var(--spyne-warning-ink)" }
          : { background: "var(--spyne-page-bg)", color: "var(--spyne-text-secondary)" }
      }
    >
      <MaterialSymbol name={MODE_GLYPH[mode]} size={11} aria-hidden />
      {mode}
    </span>
  );
}

/** "data health as of HH:MM" + a Phase-1-seed honesty footnote. */
export function FreshnessStampPill({ asOf, phase1Seed, nextAt }: { asOf: string; phase1Seed?: boolean; nextAt?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium"
      style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-surface)", color: "var(--spyne-text-secondary)" }}
      title={phase1Seed ? "Phase-1: counts are point-in-time seeds, not a live recompute." : undefined}
    >
      <MaterialSymbol name="schedule" size={12} aria-hidden />
      Data health as of <strong style={{ color: "var(--spyne-text-primary)" }}>{asOf}</strong>
      {nextAt && <span style={{ color: "var(--spyne-text-muted)" }}>· next {nextAt}</span>}
      {phase1Seed && (
        <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide" style={{ background: "var(--spyne-page-bg)", color: "var(--spyne-text-muted)" }}>
          seed
        </span>
      )}
    </span>
  );
}

/** HIGH/MED/LOW confidence as a stacked bar. */
export function ConfidenceTierBar({ high, med, low }: { high: number; med: number; low: number }) {
  const total = Math.max(1, high + med + low);
  const seg = (n: number, color: string, label: string) =>
    n > 0 ? <span title={`${label}: ${n}%`} style={{ width: `${(n / total) * 100}%`, background: color }} className="h-full" /> : null;
  return (
    <div>
      <div className="flex h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--spyne-page-bg)" }}>
        {seg(high, "var(--spyne-success)", "High")}
        {seg(med, "var(--spyne-warning)", "Med")}
        {seg(low, "var(--spyne-error)", "Low")}
      </div>
      <div className="mt-1 flex gap-2 text-[9.5px]" style={{ color: "var(--spyne-text-muted)" }}>
        <Dot color="var(--spyne-success)" /> {high}% high
        <Dot color="var(--spyne-warning)" /> {med}% med
        <Dot color="var(--spyne-error)" /> {low}% low
      </div>
    </div>
  );
}

function Dot({ color }: { color: string }) {
  return <span className="inline-block size-1.5 rounded-full align-middle" style={{ background: color }} />;
}

/** Three missing-data tier chips with explicit counts (silent truncation banned). */
export function MissingDataTierChips({
  tierA,
  tierB,
  tierC,
  onClick,
}: {
  tierA: number;
  tierB: number;
  tierC: number;
  onClick?: (tier: "A" | "B" | "C") => void;
}) {
  const chip = (tier: "A" | "B" | "C", n: number, label: string, kind: "error" | "warning") => (
    <button
      type="button"
      disabled={!onClick}
      onClick={() => onClick?.(tier)}
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors disabled:cursor-default"
      style={
        kind === "error"
          ? { background: "var(--spyne-danger-subtle)", color: "var(--spyne-danger-text)" }
          : { background: "var(--spyne-warning-subtle)", color: "var(--spyne-warning-ink)" }
      }
      title={label}
    >
      {tier} · {n.toLocaleString()}
    </button>
  );
  return (
    <div className="flex flex-wrap gap-1">
      {chip("A", tierA, "Tier A — suppressed (data)", "error")}
      {chip("B", tierB, "Tier B — hard-blocked (legal)", "error")}
      {chip("C", tierC, "Tier C — degraded (fallback)", "warning")}
    </div>
  );
}

/** Suppressed / Hard-blocked / Degraded readout with explicit counts. */
export function SuppressionPreview({
  suppressed,
  hardBlocked,
  degraded,
}: {
  suppressed: number;
  hardBlocked: number;
  degraded: number;
}) {
  const cell = (n: number, label: string, color: string) => (
    <div className="flex flex-col">
      <span className="text-[13px] font-bold tabular-nums" style={{ color }}>{n.toLocaleString()}</span>
      <span className="text-[9.5px] uppercase tracking-wide" style={{ color: "var(--spyne-text-muted)" }}>{label}</span>
    </div>
  );
  return (
    <div className="flex gap-4">
      {cell(suppressed, "Suppressed · A", "var(--spyne-danger-text)")}
      {cell(hardBlocked, "Hard-blocked · B", "var(--spyne-danger-text)")}
      {cell(degraded, "Degraded · C", "var(--spyne-warning-ink)")}
    </div>
  );
}
