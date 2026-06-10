"use client";

/**
 * Campaign Data Map — the second lens of Data Health.
 *
 * Answers three questions, in order:
 *   1. What data does it take to run a campaign?  (requirement cards, P0→P2)
 *   2. Where does each piece come from?           (per-source matrix: the 4 CRMs
 *                                                   + ADF, plus DMS / Service /
 *                                                   IMS / CSV — with API fields)
 *   3. What does it cost when a piece is missing?  (importance copy + the exact
 *                                                   campaigns blocked / degraded)
 *
 * Source health (freshness) lives in DataHealthPage; this view is about coverage:
 * is the data even reachable, and what can't you run without it.
 */

import { useMemo, useState } from "react";
import { Icon as MaterialSymbol } from "./icons";
import { SectionLabel } from "../shared";
import {
  DATA_REQUIREMENTS,
  SOURCES,
  SOURCE_BY_KEY,
  CAMPAIGNS,
  CAMPAIGN_BY_ID,
  CANONICAL_FIELD,
  campaignsAtRisk,
  requirementSummary,
  PRIORITY_RANK,
  STATUS_RANK,
  type DataRequirement,
  type FieldStatus,
  type Priority,
  type RequirementStatus,
  type SourceKey,
} from "./campaign-data-requirements";

/* ── Visual tokens ──────────────────────────────────────────────────── */

const STATUS_META: Record<RequirementStatus, { label: string; bg: string; fg: string; bar: string; glyph: string }> = {
  ready: { label: "Ready", bg: "var(--spyne-success-subtle)", fg: "var(--spyne-success-text)", bar: "var(--spyne-success)", glyph: "check_circle" },
  partial: { label: "In API — not used", bg: "var(--spyne-warning-subtle)", fg: "var(--spyne-warning-ink)", bar: "var(--spyne-warning)", glyph: "warning" },
  missing: { label: "Missing", bg: "var(--spyne-danger-subtle)", fg: "var(--spyne-danger-text)", bar: "var(--spyne-danger-text)", glyph: "block" },
};

const PRIORITY_META: Record<Priority, { label: string; hint: string }> = {
  P0: { label: "P0", hint: "Foundation — no campaign dials without it" },
  P1: { label: "P1", hint: "Unlocks whole campaign families" },
  P2: { label: "P2", hint: "Enrichment & profile depth" },
};

const FIELD_META: Record<FieldStatus, { label: string; bg: string; fg: string; glyph: string }> = {
  pulled: { label: "Live", bg: "var(--spyne-success-subtle)", fg: "var(--spyne-success-text)", glyph: "check_circle" },
  "in-api": { label: "In API", bg: "var(--spyne-warning-subtle)", fg: "var(--spyne-warning-ink)", glyph: "pending" },
  "csv-only": { label: "CSV only", bg: "var(--spyne-primary-soft)", fg: "var(--spyne-primary)", glyph: "upload_file" },
  missing: { label: "Not exposed", bg: "var(--spyne-danger-subtle)", fg: "var(--spyne-danger-text)", glyph: "block" },
  "n/a": { label: "—", bg: "var(--spyne-page-bg)", fg: "var(--spyne-text-muted)", glyph: "remove" },
};

/* ── Page ───────────────────────────────────────────────────────────── */

export function CampaignDataMap() {
  const reqs = useMemo(
    () =>
      [...DATA_REQUIREMENTS].sort(
        (a, b) =>
          STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
          PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
      ),
    []
  );
  const summary = useMemo(() => requirementSummary(), []);
  const risk = useMemo(() => campaignsAtRisk(), []);
  const [expandedId, setExpandedId] = useState<string | null>(reqs.find((r) => r.status === "missing")?.id ?? null);

  return (
    <div className="flex flex-col gap-6">
      {/* HERO — how much you can run today + what's at risk */}
      <CoverageHeader summary={summary} risk={risk} />

      {/* ZONE — where the data comes from */}
      <div>
        <SectionLabel glyph="account_tree" text="Where it comes from" hint="your connected sources" className="mb-3" />
        <SourceLegend />
      </div>

      {/* ZONE — requirement cards, worst-first */}
      <div>
        <SectionLabel glyph="rule" text="What a campaign needs" hint={`${summary.total} data requirements · sorted by what's blocking you`} className="mb-3" />
        <div className="spyne-stagger flex flex-col gap-2.5">
          {reqs.map((r) => (
            <RequirementCard
              key={r.id}
              req={r}
              expanded={expandedId === r.id}
              onToggle={() => setExpandedId((id) => (id === r.id ? null : r.id))}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Coverage header ────────────────────────────────────────────────── */

function CoverageHeader({
  summary,
  risk,
}: {
  summary: ReturnType<typeof requirementSummary>;
  risk: ReturnType<typeof campaignsAtRisk>;
}) {
  const blocked = [...risk.blocked];
  const degraded = [...risk.degraded];
  const ready = CAMPAIGNS.filter((c) => !risk.blocked.has(c.id) && !risk.degraded.has(c.id));

  return (
    <div className="spyne-card spyne-animate-fade-in p-4">
      {/* Hero answer — campaigns runnable today, led by the number */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[34px] font-bold leading-none tabular-nums" style={{ color: "var(--spyne-text-primary)" }}>{ready.length}</span>
            <span className="text-[16px] font-semibold leading-none tabular-nums" style={{ color: "var(--spyne-text-muted)" }}>/ {CAMPAIGNS.length}</span>
          </div>
          <p className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--spyne-text-muted)" }}>
            <MaterialSymbol name="campaign" size={13} style={{ color: "var(--spyne-primary)" }} /> Campaign types runnable today
          </p>
        </div>
        {/* Requirement breakdown — supporting stats */}
        <div className="flex items-center gap-4">
          <Stat value={summary.ready} label="ready" color="var(--spyne-success-text)" />
          <Stat value={summary.partial} label="in API — unused" color="var(--spyne-warning-ink)" />
          <Stat value={summary.missing} label="missing" color="var(--spyne-danger-text)" />
        </div>
      </div>
      <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--spyne-page-bg)" }}>
        <span style={{ width: `${(summary.ready / summary.total) * 100}%`, background: "var(--spyne-success)" }} />
        <span style={{ width: `${(summary.partial / summary.total) * 100}%`, background: "var(--spyne-warning)" }} />
        <span style={{ width: `${(summary.missing / summary.total) * 100}%`, background: "var(--spyne-danger-text)" }} />
      </div>

      {/* Campaigns at risk — the importance, rolled up */}
      {(blocked.length > 0 || degraded.length > 0) && (
        <div className="mt-3 border-t border-spyne-border pt-3">
          {blocked.length > 0 && (
            <CampaignRiskRow
              tone="danger"
              glyph="block"
              lead={`${blocked.length} campaign${blocked.length > 1 ? "s" : ""} blocked`}
              note="a required data source isn't connected"
              ids={blocked}
            />
          )}
          {degraded.length > 0 && (
            <CampaignRiskRow
              tone="warning"
              glyph="warning"
              lead={`${degraded.length} campaign${degraded.length > 1 ? "s" : ""} degraded`}
              note="will run, but on softened or partial data"
              ids={degraded}
            />
          )}
        </div>
      )}
    </div>
  );
}

function CampaignRiskRow({
  tone,
  glyph,
  lead,
  note,
  ids,
}: {
  tone: "danger" | "warning";
  glyph: string;
  lead: string;
  note: string;
  ids: string[];
}) {
  const fg = tone === "danger" ? "var(--spyne-danger-text)" : "var(--spyne-warning-ink)";
  const bg = tone === "danger" ? "var(--spyne-danger-subtle)" : "var(--spyne-warning-subtle)";
  return (
    <div className="mb-2 flex flex-wrap items-center gap-2 last:mb-0">
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ background: bg, color: fg }}>
        <MaterialSymbol name={glyph} size={12} /> {lead}
      </span>
      <span className="text-[11px]" style={{ color: "var(--spyne-text-muted)" }}>— {note}</span>
      <div className="flex w-full flex-wrap gap-1.5 pl-0.5">
        {ids.map((id) => {
          const c = CAMPAIGN_BY_ID[id];
          if (!c) return null;
          return (
            <span
              key={id}
              className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10.5px] font-medium"
              style={{ background: "var(--spyne-page-bg)", color: "var(--spyne-text-secondary)" }}
            >
              <MaterialSymbol name={c.glyph} size={11} style={{ color: fg }} /> {c.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ── Source legend (where it comes from) ────────────────────────────── */

function SourceLegend() {
  const grouped = useMemo(() => {
    const order = ["Sales CRM", "Website-ADF", "DMS", "Service Scheduler", "IMS", "CSV"] as const;
    return order
      .map((cat) => ({ cat, items: SOURCES.filter((s) => s.category === cat) }))
      .filter((g) => g.items.length > 0);
  }, []);

  return (
    <div className="spyne-card flex flex-wrap items-stretch gap-2 p-3">
      {grouped.map((g) => (
        <div key={g.cat} className="flex min-w-0 flex-col gap-1.5 rounded-lg p-2.5" style={{ background: "var(--spyne-page-bg)" }}>
          <span className="text-[9.5px] font-bold uppercase tracking-wide" style={{ color: "var(--spyne-text-muted)" }}>{g.cat}</span>
            <div className="flex flex-wrap gap-1.5">
              {g.items.map((s) => {
                const conn =
                  s.connection === "connected"
                    ? { fg: "var(--spyne-success-text)", glyph: "link", label: "connected" }
                    : s.connection === "in-api"
                      ? { fg: "var(--spyne-warning-ink)", glyph: "pending", label: "available, not pulled" }
                      : { fg: "var(--spyne-danger-text)", glyph: "link_off", label: "not connected" };
                return (
                  <span
                    key={s.key}
                    title={`${s.label} — ${conn.label}`}
                    className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold"
                    style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-surface)", color: "var(--spyne-text-primary)" }}
                  >
                    <MaterialSymbol name={conn.glyph} size={11} style={{ color: conn.fg }} />
                    {s.label}
                  </span>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Requirement card ───────────────────────────────────────────────── */

function RequirementCard({
  req,
  expanded,
  onToggle,
}: {
  req: DataRequirement;
  expanded: boolean;
  onToggle: () => void;
}) {
  const st = STATUS_META[req.status];
  const pr = PRIORITY_META[req.priority];
  const [showMap, setShowMap] = useState(false);
  // Matrix order: the 4 CRMs + ADF first (the user's named set), then the rest.
  const cells = useMemo(() => {
    const rank: Record<string, number> = { "Sales CRM": 0, "Website-ADF": 1, DMS: 2, "Service Scheduler": 3, IMS: 4, CSV: 5 };
    return [...req.sources]
      .filter((c) => c.status !== "n/a")
      .sort((a, b) => rank[SOURCE_BY_KEY[a.source].category] - rank[SOURCE_BY_KEY[b.source].category]);
  }, [req.sources]);

  return (
    <div className="spyne-card spyne-animate-fade-in overflow-hidden p-0" style={{ borderLeft: `3px solid ${st.bar}` }}>
      <button onClick={onToggle} className="spyne-focus-ring flex w-full items-start gap-3 rounded-lg p-3.5 text-left transition-colors hover:bg-[var(--spyne-page-bg)]">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg" style={{ background: st.bg, color: st.fg }}>
          <MaterialSymbol name={st.glyph} size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[14px] font-bold leading-none" style={{ color: "var(--spyne-text-primary)" }}>{req.name}</span>
            <span className="rounded px-1.5 py-0.5 text-[9.5px] font-bold" style={{ background: "var(--spyne-page-bg)", color: "var(--spyne-text-muted)" }} title={pr.hint}>{pr.label}</span>
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: st.bg, color: st.fg }}>{st.label}</span>
          </div>
          <p className="mt-1 text-[11.5px] leading-snug" style={{ color: "var(--spyne-text-secondary)" }}>{req.what}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold" style={{ color: "var(--spyne-text-muted)" }}>
              <MaterialSymbol name="account_tree" size={11} /> {req.primaryCategory}
            </span>
            <span className="inline-flex items-center gap-1 text-[10.5px]" style={{ color: "var(--spyne-text-muted)" }}>
              <MaterialSymbol name="campaign" size={11} /> feeds {req.unlocks.length} campaign{req.unlocks.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <MaterialSymbol name={expanded ? "expand_less" : "expand_more"} size={18} style={{ color: "var(--spyne-text-muted)", marginTop: 4 }} />
      </button>

      {expanded && (
        <div className="border-t border-spyne-border px-3.5 py-3" style={{ background: "var(--spyne-page-bg)" }}>
          {/* Importance — why it matters / cost when missing */}
          <div
            className="mb-3 flex items-start gap-2 rounded-lg px-3 py-2.5"
            style={{ background: st.bg }}
          >
            <MaterialSymbol name={req.status === "missing" ? "warning" : "key"} size={14} style={{ color: st.fg, marginTop: 1 }} />
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: st.fg }}>
                {req.status === "missing" ? "Why this is blocking you" : "Why this matters"}
              </p>
              <p className="mt-0.5 text-[11.5px] leading-snug" style={{ color: "var(--spyne-text-primary)" }}>{req.importance}</p>
            </div>
          </div>

          {/* Where it comes from — per-source matrix */}
          <div className="mb-1.5 flex items-center gap-2">
            <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--spyne-text-muted)" }}>Where it comes from</p>
            <button
              onClick={() => setShowMap((v) => !v)}
              className="ml-auto inline-flex items-center gap-1 rounded-md border border-spyne-border px-2 py-0.5 text-[10.5px] font-semibold"
              style={{ color: "var(--spyne-primary)" }}
            >
              <MaterialSymbol name="key" size={11} /> {showMap ? "Close key mapping" : "Map keys"}
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {cells.map((c) => {
              const src = SOURCE_BY_KEY[c.source];
              const fm = FIELD_META[c.status];
              return (
                <div key={c.source} className="flex items-center gap-2 rounded-md px-2 py-1.5" style={{ background: "var(--spyne-surface)" }}>
                  <MaterialSymbol name={src.glyph} size={13} style={{ color: "var(--spyne-text-muted)" }} />
                  <span className="w-[120px] shrink-0 text-[11.5px] font-semibold" style={{ color: "var(--spyne-text-primary)" }}>{src.label}</span>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-bold" style={{ background: fm.bg, color: fm.fg }}>
                    <MaterialSymbol name={fm.glyph} size={10} /> {fm.label}
                  </span>
                  {c.apiField && (
                    <span className="min-w-0 flex-1 truncate text-right font-mono text-[10px]" style={{ color: "var(--spyne-text-muted)" }} title={c.apiField}>{c.apiField}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Key mapping editor */}
          {showMap && <KeyMappingEditor req={req} />}

          {/* Campaigns this unlocks */}
          <p className="mb-1.5 mt-3 text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--spyne-text-muted)" }}>
            {req.status === "ready" ? "Campaigns this powers" : "Campaigns waiting on this"}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {req.unlocks.map((id) => {
              const c = CAMPAIGN_BY_ID[id];
              if (!c) return null;
              const tone = req.status === "missing" ? "var(--spyne-danger-text)" : req.status === "partial" ? "var(--spyne-warning-ink)" : "var(--spyne-success-text)";
              return (
                <span key={id} className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10.5px] font-medium" style={{ background: "var(--spyne-surface)", color: "var(--spyne-text-secondary)" }}>
                  <MaterialSymbol name={c.glyph} size={11} style={{ color: tone }} /> {c.label}
                </span>
              );
            })}
          </div>

          {/* Fix CTA when not ready */}
          {req.status !== "ready" && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowMap(true)}
                className="spyne-btn-primary !h-8 !text-[11.5px]"
              >
                <MaterialSymbol name={req.status === "missing" ? "link" : "key"} size={13} />
                {req.status === "missing" ? "Connect & map keys" : "Map keys to turn on"}
              </button>
              <button className="spyne-btn-secondary !h-8 !text-[11.5px]">
                <MaterialSymbol name="upload_file" size={13} /> Backfill via CSV
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Key mapping editor ─────────────────────────────────────────────── */

interface MapRow {
  id: number;
  source: SourceKey;
  field: string;
  on: boolean;
  /** A field already live (pulled) — shown locked, can't be unmapped here. */
  locked: boolean;
}

function KeyMappingEditor({ req }: { req: DataRequirement }) {
  const destination = CANONICAL_FIELD[req.id] ?? req.id;
  const seed: MapRow[] = useMemo(
    () =>
      req.sources
        .filter((c) => c.status !== "n/a" && c.status !== "missing")
        .map((c, i) => ({
          id: i,
          source: c.source,
          field: c.apiField ?? "",
          on: c.status === "pulled",
          locked: c.status === "pulled",
        })),
    [req.sources]
  );
  const [rows, setRows] = useState<MapRow[]>(seed);
  const [nextId, setNextId] = useState(seed.length);
  const [saved, setSaved] = useState(false);

  const update = (id: number, patch: Partial<MapRow>) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setSaved(false);
  };
  const addRow = () => {
    setRows((rs) => [...rs, { id: nextId, source: "csv", field: "", on: true, locked: false }]);
    setNextId((n) => n + 1);
    setSaved(false);
  };
  const removeRow = (id: number) => {
    setRows((rs) => rs.filter((r) => r.id !== id));
    setSaved(false);
  };

  const mappedCount = rows.filter((r) => r.on).length;
  const newlyMapped = rows.filter((r) => r.on && !r.locked).length;

  return (
    <div className="mt-3 rounded-xl p-3" style={{ background: "var(--spyne-surface)", border: "1px solid var(--spyne-border)" }}>
      <div className="flex flex-wrap items-center gap-2">
        <MaterialSymbol name="key" size={14} style={{ color: "var(--spyne-primary)" }} />
        <span className="text-[12px] font-bold" style={{ color: "var(--spyne-text-primary)" }}>Map source keys</span>
        <MaterialSymbol name="arrow_forward" size={12} style={{ color: "var(--spyne-text-muted)" }} />
        <span className="inline-flex items-center rounded-md px-2 py-0.5 font-mono text-[10.5px] font-semibold" style={{ background: "var(--spyne-primary-soft)", color: "var(--spyne-primary)" }}>{destination}</span>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide" style={{ background: "var(--spyne-page-bg)", color: "var(--spyne-text-muted)" }}>
          <MaterialSymbol name="lock" size={9} /> read-only ingest
        </span>
      </div>

      {/* Rows */}
      <div className="mt-2 flex flex-col gap-1.5">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center gap-1.5">
            <select
              value={r.source}
              disabled={r.locked}
              onChange={(e) => update(r.id, { source: e.target.value as SourceKey })}
              className="spyne-focus-ring shrink-0 rounded-md border px-1.5 py-1 text-[11px] font-semibold disabled:opacity-70"
              style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-page-bg)", color: "var(--spyne-text-primary)", width: 132 }}
            >
              {SOURCES.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
            <input
              value={r.field}
              disabled={r.locked}
              onChange={(e) => update(r.id, { field: e.target.value })}
              placeholder="API field / CSV column"
              className="spyne-focus-ring min-w-0 flex-1 rounded-lg border px-2 py-1 font-mono text-[10.5px] disabled:opacity-70"
              style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-page-bg)", color: "var(--spyne-text-primary)" }}
            />
            <button
              onClick={() => !r.locked && update(r.id, { on: !r.on })}
              disabled={r.locked}
              role="switch"
              aria-checked={r.on}
              title={r.locked ? "Already live" : r.on ? "Mapped — click to skip" : "Skipped — click to map"}
              className="spyne-focus-ring relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-70"
              style={{ background: r.on ? "var(--spyne-primary)" : "var(--spyne-border)" }}
            >
              <span className="inline-block size-4 rounded-full bg-white transition-transform" style={{ transform: r.on ? "translateX(18px)" : "translateX(2px)" }} />
            </button>
            {r.locked ? (
              <span className="inline-flex w-6 shrink-0 justify-center" title="Live — managed by the connector">
                <MaterialSymbol name="check_circle" size={14} style={{ color: "var(--spyne-success-text)" }} />
              </span>
            ) : (
              <button onClick={() => removeRow(r.id)} className="inline-flex w-6 shrink-0 justify-center" title="Remove">
                <MaterialSymbol name="block" size={13} style={{ color: "var(--spyne-text-muted)" }} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <button onClick={addRow} className="spyne-btn-secondary !h-8 !text-[11.5px]">
          <MaterialSymbol name="key" size={13} /> Add key
        </button>
        <button onClick={() => setSaved(true)} className="spyne-btn-primary !h-8 !text-[11.5px]">
          <MaterialSymbol name="check" size={13} /> Save mapping
        </button>
        <span className="text-[10.5px]" style={{ color: "var(--spyne-text-muted)" }}>{mappedCount} of {rows.length} keys mapped</span>
        {saved && (
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold" style={{ background: "var(--spyne-success-subtle)", color: "var(--spyne-success-text)" }}>
            <MaterialSymbol name="check_circle" size={11} />
            {newlyMapped > 0 ? `${newlyMapped} new key${newlyMapped > 1 ? "s" : ""} mapped → live next sync` : "Mapping saved"}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Small parts ────────────────────────────────────────────────────── */

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex flex-col items-end">
      <span className="text-[22px] font-bold leading-none tabular-nums" style={{ color }}>{value}</span>
      <span className="mt-1 text-[9.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--spyne-text-muted)" }}>{label}</span>
    </div>
  );
}
