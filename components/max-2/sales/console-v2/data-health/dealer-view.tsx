"use client";

/**
 * Dealer-altitude Data Health surface: the rooftop operator's view of whether
 * their source systems are connected and fresh enough to run a campaign.
 */

import { useRef, useState } from "react";
import { Icon as MaterialSymbol } from "./icons";
import { SpyneSegmentedButton, SpyneSegmentedControl } from "@/components/max-2/spyne-toolbar-controls";
import { spyneSalesLayout } from "@/lib/design-system/max-2";
import {
  StalenessBadge,
  LastSyncStamp,
  SyncModeChip,
  ConfidenceTierBar,
  MissingDataTierChips,
  SuppressionPreview,
} from "./primitives";
import { staleness, type Connector, type EntityHealth, type IdentityMigration, type ReadinessArchetype, type ComplianceLedger, type ReadinessStatus } from "./types";

const CATEGORY_GLYPH: Record<Connector["category"], string> = {
  DMS: "database",
  "Sales CRM": "contacts",
  "Service CRM": "build",
  IMS: "inventory_2",
  "Website-ADF": "language",
};

const STATE_PILL: Record<Connector["state"], { label: string; bg: string; fg: string }> = {
  connected: { label: "Connected", bg: "var(--spyne-success-subtle)", fg: "var(--spyne-success-text)" },
  "degraded-backfilling": { label: "Degraded", bg: "var(--spyne-danger-subtle)", fg: "var(--spyne-danger-text)" },
  "certification-pending": { label: "Cert pending", bg: "var(--spyne-warning-subtle)", fg: "var(--spyne-warning-ink)" },
  disconnected: { label: "Disconnected", bg: "var(--spyne-danger-subtle)", fg: "var(--spyne-danger-text)" },
};

/* ── Connector Health Rail ──────────────────────────────────────────── */

export function ConnectorHealthRail({
  connectors,
  onOpenDetail,
}: {
  connectors: Connector[];
  onOpenDetail: (connectorId: string) => void;
}) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${spyneSalesLayout.sectionGap}`}>
      {connectors.map((c) => (
        <ConnectorHealthCard key={c.id} connector={c} onOpenDetail={() => onOpenDetail(c.id)} />
      ))}
    </div>
  );
}

function ConnectorHealthCard({ connector: c, onOpenDetail }: { connector: Connector; onOpenDetail: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const sev = staleness(c.staleMins, c.slaWindowMins, c.state);
  const needsFix = sev === "stale" || c.state === "disconnected" || c.state === "degraded-backfilling" || c.state === "certification-pending";
  const pill = STATE_PILL[c.state];

  return (
    <div className="spyne-card flex flex-col p-3.5">
      <div className="flex items-start justify-between gap-2">
        <button onClick={onOpenDetail} className="flex min-w-0 items-center gap-2 text-left">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg" style={{ background: "var(--spyne-primary-soft)", color: "var(--spyne-primary)" }}>
            <MaterialSymbol name={CATEGORY_GLYPH[c.category]} size={16} aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-bold" style={{ color: "var(--spyne-text-primary)" }}>{c.vendor}</span>
            <span className="block text-[10.5px]" style={{ color: "var(--spyne-text-muted)" }}>{c.category}</span>
          </span>
        </button>
        <StalenessBadge staleMins={c.staleMins} slaWindowMins={c.slaWindowMins} state={c.state} costHint={c.costHint} />
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: pill.bg, color: pill.fg }}>
          {pill.label}
        </span>
        <SyncModeChip mode={c.syncMode} tone={needsFix ? "warning" : "neutral"} />
        <span className="ml-auto text-[11px] font-semibold tabular-nums" style={{ color: "var(--spyne-text-secondary)" }}>
          {c.recordCount.toLocaleString()} <span className="font-normal" style={{ color: "var(--spyne-text-muted)" }}>records</span>
        </span>
      </div>

      <div className="mt-2">
        <LastSyncStamp lastSyncLabel={c.lastSyncLabel} nextSyncLabel={c.nextSyncLabel} />
      </div>

      {c.costHint && needsFix && (
        <p className="mt-2 rounded-md px-2 py-1.5 text-[11px] leading-snug" style={{ background: "var(--spyne-warning-subtle)", color: "var(--spyne-warning-ink)" }}>
          {c.costHint}
        </p>
      )}

      <div className="mt-2.5 flex items-center gap-2">
        {needsFix ? (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold text-white"
            style={{ background: "var(--spyne-primary)" }}
          >
            <MaterialSymbol name="upload_file" size={13} aria-hidden />
            {expanded ? "Hide recovery" : "Restore data"}
          </button>
        ) : (
          <button onClick={onOpenDetail} className="inline-flex items-center gap-1 text-[11.5px] font-semibold" style={{ color: "var(--spyne-primary)" }}>
            View sync history <MaterialSymbol name="chevron_right" size={13} aria-hidden />
          </button>
        )}
      </div>

      {expanded && needsFix && (
        <div className="mt-2.5">
          <ConnectorFallbackPanel connector={c} variant="inline" />
        </div>
      )}
    </div>
  );
}

/* ── Connector Fallback (CSV + browser-automation) ──────────────────── */

export function ConnectorFallbackPanel({ connector: c, variant }: { connector: Connector; variant: "inline" | "full" }) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [automation, setAutomation] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const certGated = c.state === "certification-pending" || c.vendorFamily === "Reynolds" || (c.vendorFamily === "CDK" && c.syncMode === "CSV");

  return (
    <div className="rounded-xl p-3" style={{ background: "var(--spyne-page-bg)", border: "1px solid var(--spyne-border)" }}>
      <div className="mb-2 flex items-center gap-1.5">
        <MaterialSymbol name="cloud_upload" size={14} style={{ color: "var(--spyne-primary)" }} aria-hidden />
        <span className="text-[12px] font-bold" style={{ color: "var(--spyne-text-primary)" }}>Restore {c.vendor} data</span>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide" style={{ background: "var(--spyne-surface)", color: "var(--spyne-text-muted)" }}>
          <MaterialSymbol name="lock" size={9} aria-hidden /> read-only ingest
        </span>
      </div>

      {/* CSV dropzone */}
      <button
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center gap-1 rounded-lg border-2 border-dashed px-3 py-4 text-center transition-colors"
        style={{ borderColor: "var(--spyne-primary)", background: "var(--spyne-surface)" }}
      >
        <MaterialSymbol name="upload_file" size={18} style={{ color: "var(--spyne-primary)" }} aria-hidden />
        <span className="text-[11.5px] font-semibold" style={{ color: "var(--spyne-text-primary)" }}>
          {fileName ?? "Drop a CSV export, or click to browse"}
        </span>
        <span className="text-[10px]" style={{ color: "var(--spyne-text-muted)" }}>Historic sales / inventory backfill · seeds Customer + Vehicle + Deal</span>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />
      </button>

      {/* Schema mapper preview — only once a file is chosen */}
      {fileName && (
        <div className="mt-2 rounded-lg p-2" style={{ background: "var(--spyne-surface)", border: "1px solid var(--spyne-border)" }}>
          <p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wide" style={{ color: "var(--spyne-text-muted)" }}>Column → field mapping</p>
          {[
            { col: "VIN", field: "vehicle.vin", flag: "3 rows: VIN typo (17 chars expected)" },
            { col: "Customer Phone", field: "customer.phone", flag: null },
            { col: "Sale Price", field: "deal.gross", flag: "12 rows: null until F&I washes the deal" },
            { col: "SMS Consent", field: "customer.opt_in.sms", flag: "missing column → SMS hard-blocked" },
          ].map((r) => (
            <div key={r.col} className="flex items-center gap-2 py-0.5 text-[11px]">
              <span className="font-mono" style={{ color: "var(--spyne-text-secondary)" }}>{r.col}</span>
              <MaterialSymbol name="arrow_forward" size={11} style={{ color: "var(--spyne-text-muted)" }} aria-hidden />
              <span className="font-mono font-semibold" style={{ color: "var(--spyne-text-primary)" }}>{r.field}</span>
              {r.flag && (
                <span className="ml-auto inline-flex items-center gap-1 text-[10px]" style={{ color: "var(--spyne-warning-ink)" }}>
                  <MaterialSymbol name="warning" size={10} aria-hidden /> {r.flag}
                </span>
              )}
            </div>
          ))}
          <p className="mt-1.5 text-[10px]" style={{ color: "var(--spyne-text-muted)" }}>
            Plan ~10–20 hrs of CSM cleanup per dealer to normalize top-5 DMS formats. We never write back to the DMS.
          </p>
          <button className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold text-white" style={{ background: "var(--spyne-primary)" }}>
            <MaterialSymbol name="play_arrow" size={13} aria-hidden /> Start backfill
          </button>
        </div>
      )}

      {/* Browser-automation fallback for closed / cert-pending DMS */}
      {certGated && (
        <div className="mt-2 flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold" style={{ color: "var(--spyne-text-primary)" }}>Browser-automation pull</p>
            <p className="text-[10px]" style={{ color: "var(--spyne-text-muted)" }}>For closed / certification-pending DMS (Reynolds RCI, CDK 3PA). Scrapes a read-only export.</p>
          </div>
          <SpyneSegmentedControl aria-label="Browser automation">
            <SpyneSegmentedButton active={!automation} onClick={() => setAutomation(false)}>Off</SpyneSegmentedButton>
            <SpyneSegmentedButton active={automation} onClick={() => setAutomation(true)}>On</SpyneSegmentedButton>
          </SpyneSegmentedControl>
        </div>
      )}
    </div>
  );
}

/* ── Data-Layer Entity Summary ──────────────────────────────────────── */

export function EntitySummaryGrid({
  entities,
  onOpenIdentity,
}: {
  entities: EntityHealth[];
  onOpenIdentity: () => void;
}) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 ${spyneSalesLayout.sectionGap}`}>
      {entities.map((e) => (
        <EntityHealthTile key={e.entity} entity={e} onOpenIdentity={e.entity === "Customer" ? onOpenIdentity : undefined} />
      ))}
    </div>
  );
}

function EntityHealthTile({ entity: e, onOpenIdentity }: { entity: EntityHealth; onOpenIdentity?: () => void }) {
  return (
    <div className="spyne-card flex flex-col gap-2 p-3">
      <div className="flex items-center gap-1.5">
        <MaterialSymbol name={e.symbol} size={15} style={{ color: "var(--spyne-primary)" }} aria-hidden />
        <span className="text-[12px] font-bold" style={{ color: "var(--spyne-text-primary)" }}>{e.entity}</span>
      </div>
      <div>
        <span className="text-[18px] font-bold leading-none tabular-nums" style={{ color: "var(--spyne-text-primary)" }}>{e.recordCount.toLocaleString()}</span>
        <div className="mt-1"><LastSyncStamp lastSyncLabel={e.asOf} compact /></div>
      </div>
      <p className="text-[10px]" style={{ color: "var(--spyne-text-muted)" }}>
        {e.sources.map((s, i) => (
          <span key={s}>
            {i === 0 ? <strong style={{ color: "var(--spyne-text-secondary)" }}>{s}</strong> : s}
            {i < e.sources.length - 1 ? " · " : ""}
          </span>
        ))}
      </p>
      <ConfidenceTierBar high={e.confidence.high} med={e.confidence.med} low={e.confidence.low} />
      <MissingDataTierChips tierA={e.missing.tierA} tierB={e.missing.tierB} tierC={e.missing.tierC} />
      {e.rotProneNote && (
        <p className="text-[10px] leading-snug" style={{ color: "var(--spyne-warning-ink)" }}>{e.rotProneNote}</p>
      )}
      {onOpenIdentity && (
        <button onClick={onOpenIdentity} className="mt-auto inline-flex items-center gap-1 text-[10.5px] font-semibold" style={{ color: "var(--spyne-primary)" }}>
          Identity & merge health <MaterialSymbol name="arrow_forward" size={11} aria-hidden />
        </button>
      )}
    </div>
  );
}

/* ── Identity / Migration (leadId → customerId) ─────────────────────── */

export function IdentityMigrationCard({ data }: { data: IdentityMigration }) {
  const total = data.matchKeyBreakdown.phone + data.matchKeyBreakdown.email + data.matchKeyBreakdown.nameAddress;
  const seg = (n: number, color: string, label: string) =>
    <span title={`${label}: ${n.toLocaleString()}`} style={{ width: `${(n / Math.max(1, total)) * 100}%`, background: color }} className="h-full" />;

  return (
    <div className="spyne-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <MaterialSymbol name="merge" size={16} style={{ color: "var(--spyne-primary)" }} aria-hidden />
        <h3 className="text-[14px] font-bold" style={{ color: "var(--spyne-text-primary)" }}>Identity resolution</h3>
        <span className="text-[11px]" style={{ color: "var(--spyne-text-muted)" }}>leadId → customerId · the prerequisite every count depends on</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Stat value={data.rowsBefore.toLocaleString()} label="raw rows" />
        <MaterialSymbol name="trending_flat" size={18} style={{ color: "var(--spyne-text-muted)" }} aria-hidden />
        <Stat value={data.customersAfter.toLocaleString()} label="unique customers" accent />
        <div className="ml-auto text-right">
          <span className="text-[13px] font-bold tabular-nums" style={{ color: "var(--spyne-warning-ink)" }}>{data.falseMergeRatePct}%</span>
          <span className="block text-[9.5px] uppercase tracking-wide" style={{ color: "var(--spyne-text-muted)" }}>false-merge rate</span>
        </div>
      </div>

      <div className="mt-3">
        <p className="mb-1 text-[10.5px] font-bold uppercase tracking-wide" style={{ color: "var(--spyne-text-muted)" }}>Merge match keys</p>
        <div className="flex h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--spyne-page-bg)" }}>
          {seg(data.matchKeyBreakdown.phone, "var(--spyne-primary)", "phone")}
          {seg(data.matchKeyBreakdown.email, "var(--spyne-info)", "email")}
          {seg(data.matchKeyBreakdown.nameAddress, "var(--spyne-warning)", "name+address")}
        </div>
        <div className="mt-1 flex gap-3 text-[9.5px]" style={{ color: "var(--spyne-text-muted)" }}>
          <span>phone {data.matchKeyBreakdown.phone.toLocaleString()}</span>
          <span>email {data.matchKeyBreakdown.email.toLocaleString()}</span>
          <span>name+addr {data.matchKeyBreakdown.nameAddress.toLocaleString()}</span>
        </div>
      </div>

      <p className="mt-2 rounded-md px-2 py-1.5 text-[10.5px] leading-snug" style={{ background: "var(--spyne-warning-subtle)", color: "var(--spyne-warning-ink)" }}>
        {data.tuningBudgetNote}
      </p>

      <div className="mt-3">
        <p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wide" style={{ color: "var(--spyne-text-muted)" }}>
          {data.pendingResolution.toLocaleString()} pending · review possible false merges
        </p>
        <ul className="flex flex-col gap-1.5">
          {data.unmergeCandidates.map((m) => (
            <li key={m.id} className="rounded-lg p-2" style={{ background: "var(--spyne-page-bg)" }}>
              <div className="flex items-center gap-2">
                <span className="text-[11.5px] font-semibold" style={{ color: "var(--spyne-text-primary)" }}>{m.customerA}</span>
                <MaterialSymbol name="sync_alt" size={12} style={{ color: "var(--spyne-text-muted)" }} aria-hidden />
                <span className="text-[11.5px] font-semibold" style={{ color: "var(--spyne-text-primary)" }}>{m.customerB}</span>
                <span className="ml-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-medium" style={{ background: "var(--spyne-surface)", color: "var(--spyne-text-muted)" }}>matched on {m.sharedKey}</span>
                <button className="ml-auto inline-flex items-center gap-1 text-[10.5px] font-semibold" style={{ color: "var(--spyne-primary)" }}>
                  <MaterialSymbol name="call_split" size={11} aria-hidden /> Un-merge
                </button>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                {m.fields.map((f) => (
                  <span key={f.field} className="text-[10px]" style={{ color: "var(--spyne-text-muted)" }}>
                    <strong style={{ color: "var(--spyne-text-secondary)" }}>{f.field}:</strong> {f.valueA} vs {f.valueB} <em>({f.provenance})</em>
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Stat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className="text-[20px] font-bold leading-none tabular-nums" style={{ color: accent ? "var(--spyne-primary)" : "var(--spyne-text-primary)" }}>{value}</span>
      <span className="text-[9.5px] uppercase tracking-wide" style={{ color: "var(--spyne-text-muted)" }}>{label}</span>
    </div>
  );
}

/* ── Campaign Readiness (the gate — what can I run right now) ────────── */

const READY_META: Record<ReadinessStatus, { label: string; bg: string; fg: string; glyph: string }> = {
  ready: { label: "Ready", bg: "var(--spyne-success-subtle)", fg: "var(--spyne-success-text)", glyph: "check_circle" },
  degraded: { label: "Degraded", bg: "var(--spyne-warning-subtle)", fg: "var(--spyne-warning-ink)", glyph: "warning" },
  blocked: { label: "Blocked", bg: "var(--spyne-danger-subtle)", fg: "var(--spyne-danger-text)", glyph: "block" },
};

export function CampaignReadinessPanel({
  archetypes,
  onDraft,
}: {
  archetypes: ReadinessArchetype[];
  onDraft: (prompt: string) => void;
}) {
  return (
    <div className="spyne-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <MaterialSymbol name="rocket_launch" size={16} style={{ color: "var(--spyne-primary)" }} aria-hidden />
        <h3 className="text-[14px] font-bold" style={{ color: "var(--spyne-text-primary)" }}>What you can run right now</h3>
        <span className="text-[11px]" style={{ color: "var(--spyne-text-muted)" }}>data health → campaign readiness</span>
      </div>
      <ul className="flex flex-col gap-2">
        {archetypes.map((a) => {
          const m = READY_META[a.status];
          return (
            <li key={a.archetype} className="rounded-lg p-2.5" style={{ background: "var(--spyne-page-bg)" }}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ background: m.bg, color: m.fg }}>
                  <MaterialSymbol name={m.glyph} size={11} aria-hidden /> {m.label}
                </span>
                <span className="text-[12.5px] font-bold" style={{ color: "var(--spyne-text-primary)" }}>{a.archetype}</span>
                <span className="text-[10px]" style={{ color: "var(--spyne-text-muted)" }}>← {a.feedingSources.join(" · ")}</span>
                <button
                  disabled={a.status === "blocked"}
                  onClick={() => onDraft(a.draftPrompt)}
                  title={a.status === "blocked" ? a.reason : "Draft this campaign"}
                  className="ml-auto inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ background: a.status === "blocked" ? "var(--spyne-page-bg)" : "var(--spyne-primary)", color: a.status === "blocked" ? "var(--spyne-text-muted)" : "#fff", boxShadow: a.status === "blocked" ? "inset 0 0 0 1px var(--spyne-border)" : "none" }}
                >
                  Draft this <MaterialSymbol name="arrow_forward" size={11} aria-hidden />
                </button>
              </div>
              {a.reason && (
                <p className="mt-1 text-[10.5px] leading-snug" style={{ color: a.status === "blocked" ? "var(--spyne-danger-text)" : "var(--spyne-warning-ink)" }}>{a.reason}</p>
              )}
              {a.suppression && (a.suppression.suppressed + a.suppression.hardBlocked + a.suppression.degraded > 0) && (
                <div className="mt-1.5"><SuppressionPreview {...a.suppression} /></div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ── Compliance gates + suppression ledger ──────────────────────────── */

export function ComplianceSection({ data }: { data: ComplianceLedger }) {
  const [open, setOpen] = useState(false);
  const gateIcon = (s: string) =>
    s === "pass" ? { name: "check_circle", color: "var(--spyne-success-text)" } : s === "warn" ? { name: "warning", color: "var(--spyne-warning-ink)" } : { name: "block", color: "var(--spyne-danger-text)" };

  return (
    <div className="spyne-card p-4">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-2">
        <MaterialSymbol name="verified_user" size={16} style={{ color: "var(--spyne-primary)" }} aria-hidden />
        <h3 className="text-[14px] font-bold" style={{ color: "var(--spyne-text-primary)" }}>Compliance & suppression ledger</h3>
        <span className="text-[11px]" style={{ color: "var(--spyne-text-muted)" }}>failures pushed left · per-rooftop</span>
        <MaterialSymbol name={open ? "expand_less" : "expand_more"} size={18} style={{ marginLeft: "auto", color: "var(--spyne-text-muted)" }} aria-hidden />
      </button>

      {open && (
        <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Gates */}
          <div>
            <p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wide" style={{ color: "var(--spyne-text-muted)" }}>Tier-B gates (legal)</p>
            <ul className="flex flex-col gap-1.5">
              {data.gates.map((g) => {
                const ic = gateIcon(g.status);
                return (
                  <li key={g.id} className="flex items-start gap-2 rounded-lg p-2" style={{ background: "var(--spyne-page-bg)" }}>
                    <MaterialSymbol name={ic.name} size={14} style={{ color: ic.color, marginTop: 1 }} aria-hidden />
                    <div>
                      <span className="text-[11.5px] font-semibold" style={{ color: "var(--spyne-text-primary)" }}>{g.label}</span>
                      <p className="text-[10.5px] leading-snug" style={{ color: "var(--spyne-text-muted)" }}>{g.detail}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Ledger */}
          <div>
            <p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wide" style={{ color: "var(--spyne-text-muted)" }}>Dropped / blocked — explicit counts (no silent truncation)</p>
            <ul className="flex flex-col gap-1.5">
              {data.suppressions.map((r, i) => (
                <li key={i} className="flex items-center gap-2 rounded-lg p-2" style={{ background: "var(--spyne-page-bg)" }}>
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-bold uppercase"
                    style={r.kind === "hard-block"
                      ? { background: "var(--spyne-danger-subtle)", color: "var(--spyne-danger-text)" }
                      : { background: "var(--spyne-warning-subtle)", color: "var(--spyne-warning-ink)" }}
                    title={r.kind === "hard-block" ? "Legal hard-block" : "Data suppression"}
                  >
                    {r.kind === "hard-block" ? "Hard-block" : "Suppress"} · {r.tier}
                  </span>
                  <span className="text-[11.5px] font-bold tabular-nums" style={{ color: "var(--spyne-text-primary)" }}>{r.droppedCount.toLocaleString()}</span>
                  <span className="min-w-0 flex-1 text-[10.5px]" style={{ color: "var(--spyne-text-muted)" }}>
                    <strong style={{ color: "var(--spyne-text-secondary)" }}>{r.audience}</strong> — {r.reason}
                  </span>
                  {/* A legal hard-block closes one channel, not the lead — show what's still open. */}
                  {r.kind === "hard-block" && (
                    <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-bold uppercase" style={{ background: "var(--spyne-success-subtle)", color: "var(--spyne-success-text)" }} title="The lead is still reachable on these channels">
                      <span className="size-1.5 rounded-full" style={{ background: "var(--spyne-success)" }} /> voice + email open
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
