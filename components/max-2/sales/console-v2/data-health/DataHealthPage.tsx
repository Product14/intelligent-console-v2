"use client";

/**
 * DataHealthPage — a single dealer's view of their own source systems.
 *
 * Dealer-facing only (no cross-rooftop / fleet / OEM views — those belong to an
 * internal tool). The job is simple: show whether each system (DMS, Sales CRM,
 * Service CRM, IMS, Website) is connected and fresh, let the dealer upload a CSV
 * when a system falls behind, and auto-remind the team for a fresh upload before
 * data goes stale — so campaigns never run on stale leads.
 */

import { useMemo, useState } from "react";
import { Icon as MaterialSymbol } from "./icons";
import { spyneSalesLayout, max2Classes } from "@/lib/design-system/max-2";
import { SpyneSegmentedButton, SpyneSegmentedControl } from "@/components/max-2/spyne-toolbar-controls";
import { FreshnessStampPill, StalenessBadge, LastSyncStamp, SyncModeChip } from "./primitives";
import { ConnectorFallbackPanel } from "./dealer-view";
import { CampaignDataMap } from "./CampaignDataMap";
import { SectionLabel, SpyneSwitch, StatusBanner, ProcessingButton } from "../shared";
import { staleness, type Connector, type ConnectorCategory } from "./types";
import { dataHealthData, entityHealthData } from "./mock-data";

type DataHealthLens = "sources" | "campaign-map";

const CATEGORY_ORDER: ConnectorCategory[] = ["DMS", "Sales CRM", "Service CRM", "IMS", "Website-ADF"];
const CATEGORY_LABEL: Record<ConnectorCategory, string> = {
  DMS: "DMS",
  "Sales CRM": "Sales CRM",
  "Service CRM": "Service CRM",
  IMS: "Inventory (IMS)",
  "Website-ADF": "Website",
};
const CATEGORY_GLYPH: Record<ConnectorCategory, string> = {
  DMS: "database",
  "Sales CRM": "contacts",
  "Service CRM": "build",
  IMS: "inventory_2",
  "Website-ADF": "language",
};

function needsRefresh(c: Connector): boolean {
  return staleness(c.staleMins, c.slaWindowMins, c.state) === "stale" || c.state !== "connected";
}

export function DataHealthPage() {
  const connectors = useMemo(
    () => [...dataHealthData.connectors].sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category)),
    []
  );
  const stale = connectors.filter(needsRefresh);
  const fresh = connectors.length - stale.length;

  const [autoRemind, setAutoRemind] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(stale[0]?.id ?? null);
  const [requested, setRequested] = useState<Record<string, boolean>>({});
  const [lens, setLens] = useState<DataHealthLens>("sources");

  const topStale = stale[0];

  return (
    <div className={spyneSalesLayout.pageStack}>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className={max2Classes.pageTitle}>Data Health</h1>
          <p className={max2Classes.pageDescription}>{dataHealthData.rooftop}</p>
        </div>
        <FreshnessStampPill asOf={dataHealthData.asOf} phase1Seed={dataHealthData.phase1Seed} />
      </div>

      {/* Lens toggle: source freshness vs campaign data coverage */}
      <SpyneSegmentedControl aria-label="Data health view">
        <SpyneSegmentedButton active={lens === "sources"} onClick={() => setLens("sources")}>
          <span className="inline-flex items-center gap-1.5">
            <MaterialSymbol name="database" size={13} /> Source health
            {stale.length > 0 && (
              <span className="rounded-full px-1.5 text-[10px] font-bold tabular-nums" style={{ background: "var(--spyne-warning-subtle)", color: "var(--spyne-warning-ink)" }}>{stale.length}</span>
            )}
          </span>
        </SpyneSegmentedButton>
        <SpyneSegmentedButton active={lens === "campaign-map"} onClick={() => setLens("campaign-map")}>
          <span className="inline-flex items-center gap-1.5"><MaterialSymbol name="account_tree" size={13} /> Campaign data map</span>
        </SpyneSegmentedButton>
      </SpyneSegmentedControl>

      {lens === "campaign-map" ? (
        <CampaignDataMap />
      ) : (
        <SourceHealthLens
          connectors={connectors}
          stale={stale}
          fresh={fresh}
          topStale={topStale}
          autoRemind={autoRemind}
          setAutoRemind={setAutoRemind}
          expandedId={expandedId}
          setExpandedId={setExpandedId}
          requested={requested}
          setRequested={setRequested}
        />
      )}
    </div>
  );
}

/* ── Source-health lens (connector freshness + CSV fallback) ──────────── */

function SourceHealthLens({
  connectors,
  stale,
  fresh,
  topStale,
  autoRemind,
  setAutoRemind,
  expandedId,
  setExpandedId,
  requested,
  setRequested,
}: {
  connectors: Connector[];
  stale: Connector[];
  fresh: number;
  topStale: Connector | undefined;
  autoRemind: boolean;
  setAutoRemind: React.Dispatch<React.SetStateAction<boolean>>;
  expandedId: string | null;
  setExpandedId: React.Dispatch<React.SetStateAction<string | null>>;
  requested: Record<string, boolean>;
  setRequested: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}) {
  const bannerSeverity = stale.length === 0
    ? "success"
    : topStale && (topStale.state === "disconnected" || topStale.state === "degraded-backfilling")
      ? "danger"
      : "warning";

  return (
    <>
      {/* HERO — the one answer: severity escalates fresh → warning (aging) → danger (outage) */}
      <StatusBanner
        severity={bannerSeverity}
        title={
          stale.length === 0 || !topStale ? (
            <>All {connectors.length} systems fresh — campaigns are running on live data.</>
          ) : (
            <>
              <strong className="tabular-nums">{fresh} of {connectors.length}</strong> systems fresh · <strong>{topStale.vendor}</strong> ({CATEGORY_LABEL[topStale.category]}) is behind.
            </>
          )
        }
        action={topStale ? (
          <button
            onClick={() => { setExpandedId(topStale.id); document.getElementById(`src-${topStale.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }); }}
            className="spyne-btn-primary"
          >
            <MaterialSymbol name="upload_file" size={14} /> Fix {topStale.vendor}
          </button>
        ) : undefined}
      />

      {/* ZONE 1 — Your systems (the connected sources + their freshness) */}
      <div>
        <SectionLabel
          glyph="dns"
          text="Your systems"
          hint={stale.length === 0 ? `${connectors.length} connected · all fresh` : `${fresh} fresh · ${stale.length} need a refresh`}
          className="mb-3"
        />
        <div className="spyne-stagger flex flex-col gap-2.5">
          {connectors.map((c) => (
            <SourceCard
              key={c.id}
              c={c}
              expanded={expandedId === c.id}
              onToggle={() => setExpandedId((id) => (id === c.id ? null : c.id))}
              autoRemind={autoRemind}
              requested={!!requested[c.id]}
              onRequest={() => setRequested((m) => ({ ...m, [c.id]: true }))}
            />
          ))}
        </div>

        {/* Auto-reminder — quiet footer to the zone, not a competing peer card */}
        <div className="mt-2.5 flex flex-wrap items-center gap-3 rounded-xl border border-spyne-border px-4 py-2.5" style={{ background: "var(--spyne-page-bg)" }}>
          <MaterialSymbol name="schedule" size={15} style={{ color: autoRemind ? "var(--spyne-primary)" : "var(--spyne-text-muted)" }} />
          <p className="min-w-0 flex-1 text-[12px]" style={{ color: "var(--spyne-text-secondary)" }}>
            <strong style={{ color: "var(--spyne-text-primary)" }}>Auto-reminders {autoRemind ? "on" : "off"}</strong>
            {" — "}email the team for a fresh upload before any system goes stale.
          </p>
          <SpyneSwitch checked={autoRemind} onChange={setAutoRemind} label="Toggle auto-reminders" />
        </div>
      </div>

      {/* ZONE 2 — What this feeds (quieter payoff) */}
      <DataLayerStrip />
    </>
  );
}

/* ── Source card ─────────────────────────────────────────────────── */

function SourceCard({
  c,
  expanded,
  onToggle,
  autoRemind,
  requested,
  onRequest,
}: {
  c: Connector;
  expanded: boolean;
  onToggle: () => void;
  autoRemind: boolean;
  requested: boolean;
  onRequest: () => void;
}) {
  const stale = needsRefresh(c);
  const events = (c.syncEvents ?? []).slice(-4).reverse();

  return (
    <div id={`src-${c.id}`} className="spyne-card spyne-animate-fade-in overflow-hidden p-0" style={{ borderLeft: `3px solid ${stale ? "var(--spyne-warning)" : "var(--spyne-success)"}` }}>
      <button onClick={onToggle} className="spyne-focus-ring flex w-full items-center gap-3 rounded-lg p-3.5 text-left transition-colors hover:bg-[var(--spyne-page-bg)]">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg" style={{ background: stale ? "var(--spyne-warning-subtle)" : "var(--spyne-success-subtle)", color: stale ? "var(--spyne-warning-ink)" : "var(--spyne-success-text)" }}>
          <MaterialSymbol name={CATEGORY_GLYPH[c.category]} size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[14px] font-bold leading-none" style={{ color: "var(--spyne-text-primary)" }}>{c.vendor}</span>
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--spyne-text-muted)" }}>{CATEGORY_LABEL[c.category]}</span>
            <StalenessBadge staleMins={c.staleMins} slaWindowMins={c.slaWindowMins} state={c.state} costHint={c.costHint} />
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <LastSyncStamp lastSyncLabel={c.lastSyncLabel} nextSyncLabel={c.nextSyncLabel} compact />
            <span className="text-[10.5px] tabular-nums" style={{ color: "var(--spyne-text-muted)" }}>{c.recordCount.toLocaleString()} records</span>
            {!stale && <SyncModeChip mode={c.syncMode} />}
          </div>
        </div>
        {/* Quick action / status */}
        {stale ? (
          <span className="hidden shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold text-white sm:inline-flex" style={{ background: "var(--spyne-primary)" }}>
            <MaterialSymbol name="upload_file" size={13} /> {expanded ? "Close" : "Upload CSV"}
          </span>
        ) : (
          <span className="hidden shrink-0 items-center gap-1 text-[11px] font-semibold sm:inline-flex" style={{ color: "var(--spyne-success-text)" }}>
            <MaterialSymbol name="check_circle" size={13} /> Up to date
          </span>
        )}
        <MaterialSymbol name={expanded ? "expand_less" : "expand_more"} size={18} style={{ color: "var(--spyne-text-muted)" }} />
      </button>

      {expanded && (
        <div className="border-t border-spyne-border px-3.5 py-3" style={{ background: "var(--spyne-page-bg)" }}>
          {stale ? (
            <>
              {/* Manual CSV upload flow */}
              <ConnectorFallbackPanel connector={c} variant="full" />

              {/* Automated re-upload reminder */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2 rounded-lg border border-spyne-border bg-spyne-surface px-3 py-2">
                <MaterialSymbol name="schedule" size={14} style={{ color: "var(--spyne-primary)" }} />
                <p className="min-w-0 flex-1 text-[11.5px]" style={{ color: "var(--spyne-text-secondary)" }}>
                  {requested
                    ? <>Request sent — follow-up in 3 days if still behind.</>
                    : autoRemind
                      ? <>Auto-reminder scheduled.</>
                      : <>Auto-reminders off.</>}
                </p>
                <ProcessingButton
                  variant="secondary"
                  className="shrink-0 !h-8 !text-[11.5px]"
                  icon="send"
                  processingLabel="Sending request…"
                  doneLabel="Requested"
                  onRun={onRequest}
                >
                  Request upload
                </ProcessingButton>
              </div>
            </>
          ) : (
            <p className="text-[11.5px]" style={{ color: "var(--spyne-text-muted)" }}>
              Auto-syncing {c.syncMode}.
            </p>
          )}

          {/* Recent sync history */}
          {events.length > 0 && (
            <div className="mt-2.5">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--spyne-text-muted)" }}>Recent syncs</p>
              <ul className="flex flex-col gap-1">
                {events.map((e, i) => (
                  <li key={i} className="flex items-center gap-2 text-[11px]">
                    <span className="size-1.5 rounded-full" style={{ background: e.state === "error" ? "var(--spyne-danger-text)" : e.state === "warning" ? "var(--spyne-warning-ink)" : "var(--spyne-success-text)" }} />
                    <span style={{ color: "var(--spyne-text-secondary)" }}>{e.label}</span>
                    <span className="ml-auto" style={{ color: "var(--spyne-text-muted)" }}>{e.at}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Data layer (compact) ────────────────────────────────────────── */

function DataLayerStrip() {
  const note = entityHealthData.find((e) => e.rotProneNote)?.rotProneNote;
  return (
    <div>
      <SectionLabel glyph="account_tree" text="What this feeds" hint="the unified records your campaigns read" className="mb-3" />
      <div className="spyne-card p-4">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
          {entityHealthData.map((e) => (
            <div key={e.entity} className="rounded-lg p-2.5" style={{ background: "var(--spyne-page-bg)" }}>
              <div className="text-[20px] font-bold leading-none tabular-nums" style={{ color: "var(--spyne-text-primary)" }}>{e.recordCount.toLocaleString()}</div>
              <div className="mt-1.5 text-[9.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--spyne-text-muted)" }}>{e.entity}</div>
              <div className="mt-0.5 text-[9.5px]" style={{ color: "var(--spyne-text-muted)" }}>as of {e.asOf}</div>
            </div>
          ))}
        </div>
        {note && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border-t-0 px-3 py-2.5" style={{ background: "var(--spyne-warning-subtle)" }}>
            <MaterialSymbol name="warning" size={14} style={{ color: "var(--spyne-warning-ink)", marginTop: 1 }} />
            <p className="text-[11.5px] leading-snug" style={{ color: "var(--spyne-warning-ink)" }}>{note}</p>
          </div>
        )}
      </div>
    </div>
  );
}

