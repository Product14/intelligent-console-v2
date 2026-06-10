"use client";

import { useState } from "react";
import { AlertTriangle, Upload, Database, Wand2, MinusCircle, X, ChevronRight, CheckCircle2, Pencil, ListChecks, Link2, Ban, Pin } from "lucide-react";
import { SEVERITY } from "../shared";
import {
  FIELD_TIERS,
  type FieldTierMeta,
  type ResolverAction,
  getResolverActions,
  getSubUseCaseLabel,
  isComplete,
  progressPercent,
  crmFieldKey,
  crmMapStatus,
  requiredCrmColumns,
  type CrmColumn,
  type PRDState,
} from "./describe-engine";

export type FieldResolution = {
  kind: "csv" | "crm" | "fallback" | "suppress" | "set" | "multi";
  value?: string;
  values?: string[];
};

interface LiveCampaignBriefProps {
  prd: PRDState;
  onResolveField?: (key: string, resolution: FieldResolution) => void;
}

export default function LiveCampaignBrief({ prd, onResolveField }: LiveCampaignBriefProps) {
  const pct = progressPercent(prd);
  const ready = isComplete(prd);
  const isService = prd.subUseCase === "service_recall" || prd.subUseCase === "declined_services";
  const subLabel = getSubUseCaseLabel(prd.subUseCase);

  const has = (k: keyof PRDState) => {
    const v = prd[k];
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === "string") return v.trim().length > 0;
    return v !== undefined && v !== null;
  };

  return (
    <div className="flex h-full flex-col gap-2 overflow-hidden">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f1e36] p-4 text-white shadow-lg">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#22d3ee]">BRIEF · LIVE</span>
          <div className="flex items-center gap-1.5">
            {isService && (
              <span className="rounded-full bg-[#7f1d1d] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#fecaca]">
                DNC EXEMPT
              </span>
            )}
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tabular-nums ${
                ready ? "text-white" : "bg-white/10 text-white/80"
              }`}
              style={ready ? { background: "var(--spyne-success-text)" } : undefined}
            >
              {ready ? "Ready" : `${pct}% complete`}
            </span>
          </div>
        </div>
        <h2 className="text-[16px] font-bold leading-tight tracking-tight">{prd.title ?? subLabel}</h2>
        {prd.summary && <p className="mt-1 line-clamp-2 text-[11.5px] leading-snug text-white/70">{prd.summary}</p>}
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: ready ? "var(--spyne-success-text)" : "var(--spyne-primary)", transitionDuration: "350ms", transitionTimingFunction: "var(--spyne-ease-out)" }}
          />
        </div>
      </div>

      {/* 8 sections */}
      <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
        <SectionCard num={1} title="Audience" status={has("audienceSize") || has("audienceSource") ? "done" : "pending"}>
          {prd.savedAudienceName && (
            <SavedAudiencePill name={prd.savedAudienceName} count={prd.savedAudienceCount} />
          )}
          <FieldOrFlag k="audienceSize" label="Size" value={prd.audienceSize} onResolve={onResolveField} />
          {!prd.savedAudienceName && (
            <FieldOrFlag k="audienceSource" label="Source" value={prd.audienceSource} onResolve={onResolveField} />
          )}
          <FieldOrFlag k="crmSource" label="CRM" value={prd.crmSource} onResolve={onResolveField} compact />
        </SectionCard>

        <SectionCard num={2} title="Trigger" status={has("triggerEvent") ? "done" : "pending"}>
          <FieldOrFlag k="triggerEvent" label="Event" value={prd.triggerEvent} onResolve={onResolveField} multiline />
          {has("triggerLatency") && <Row k="Latency" v={prd.triggerLatency!} />}
        </SectionCard>

        <SectionCard num={3} title="Cadence" status={has("cadence") ? "done" : "pending"}>
          {has("cadence") ? (
            <div className="rounded-lg px-2.5 py-1.5 text-[11.5px] font-medium" style={{ background: "var(--spyne-surface-hover)", color: "var(--spyne-text-secondary)" }}>{prd.cadence}</div>
          ) : (
            <Flag k="cadence" onResolve={onResolveField} />
          )}
        </SectionCard>

        <SectionCard
          num={4}
          title="Channel + Message"
          status={has("channels") || has("coreMessage") ? "done" : "pending"}
        >
          {has("channels") ? (
            <div className="mb-1 flex flex-wrap gap-1">
              {prd.channels!.map((c) => (
                <span key={c} className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase" style={{ background: "var(--spyne-primary-soft)", color: "var(--spyne-primary)" }}>
                  {c}
                </span>
              ))}
            </div>
          ) : (
            <Flag k="channels" onResolve={onResolveField} />
          )}
          {has("coreMessage") ? (
            <p className="text-[11.5px] italic leading-snug" style={{ color: "var(--spyne-text-secondary)" }}>"{prd.coreMessage}"</p>
          ) : (
            <Flag k="coreMessage" onResolve={onResolveField} />
          )}
        </SectionCard>

        <SectionCard
          num={5}
          title="Conversation skills"
          status={has("conversationSkills") ? "done" : "pending"}
        >
          {has("conversationSkills") ? (
            <ul className="flex flex-col gap-0.5">
              {prd.conversationSkills!.map((s, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[11.5px] leading-snug" style={{ color: "var(--spyne-text-secondary)" }}>
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full" style={{ background: "var(--spyne-primary)" }} />
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <Flag k="conversationSkills" onResolve={onResolveField} />
          )}
          {has("financingOffer") && <Row k="Financing" v={prd.financingOffer!} className="mt-1" />}
          {has("managerNotify") && <Row k="Manager rule" v={prd.managerNotify!} />}
        </SectionCard>

        <SectionCard num={6} title="Compliance" status={has("restrictedTopics") || has("quietHours") ? "done" : "pending"}>
          {has("restrictedTopics") ? (
            <div className="flex flex-wrap gap-1 mb-1">
              {prd.restrictedTopics!.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold" style={{ background: SEVERITY.danger.fill, borderColor: SEVERITY.danger.border, color: SEVERITY.danger.ink }}>
                  <Ban size={10} className="shrink-0" /> {t}
                </span>
              ))}
            </div>
          ) : (
            <Flag k="restrictedTopics" onResolve={onResolveField} />
          )}
          {has("carefulTopics") && (
            <div className="flex flex-wrap gap-1 mb-1">
              {prd.carefulTopics!.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold" style={{ background: SEVERITY.warning.fill, borderColor: SEVERITY.warning.border, color: SEVERITY.warning.ink }}>
                  <AlertTriangle size={10} className="shrink-0" /> {t}
                </span>
              ))}
            </div>
          )}
          {has("quietHours") ? (
            <Row k="Quiet hours" v={prd.quietHours!} />
          ) : (
            <Flag k="quietHours" onResolve={onResolveField} />
          )}
        </SectionCard>

        <SectionCard num={7} title="Exit conditions" status={has("exitConditions") ? "done" : "pending"}>
          {has("exitConditions") ? (
            <ul className="flex flex-col gap-0.5">
              {prd.exitConditions!.map((s, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[11.5px] leading-snug" style={{ color: "var(--spyne-text-secondary)" }}>
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full" style={{ background: "var(--spyne-success-text)" }} />
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <Flag k="exitConditions" onResolve={onResolveField} />
          )}
        </SectionCard>

        <SectionCard num={8} title="Outcome / Attribution" status={has("primaryKPI") ? "done" : "pending"}>
          <FieldOrFlag k="primaryKPI" label="KPI" value={prd.primaryKPI} onResolve={onResolveField} />
          <FieldOrFlag k="attributionWindow" label="Window" value={prd.attributionWindow} onResolve={onResolveField} compact />
        </SectionCard>

        <CRMFieldMapSection prd={prd} onResolve={onResolveField} />
      </div>
    </div>
  );
}

/* ── CRM field map — required per-lead columns ──────────────────────── */

function CRMFieldMapSection({ prd, onResolve }: { prd: PRDState; onResolve?: LiveCampaignBriefProps["onResolveField"] }) {
  const { total, mapped, missing } = crmMapStatus(prd);
  const columns = requiredCrmColumns(prd);
  const map = prd.crmFieldMap ?? {};
  const allMapped = missing.length === 0;
  const source = prd.crmSource || prd.audienceSource || "No source yet";

  return (
    <div className="spyne-card px-3 py-2.5">
      <div className="mb-1.5 flex items-center gap-2">
        <span
          className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold"
          style={
            allMapped
              ? { background: "var(--spyne-success-text)", color: "#ffffff" }
              : { background: "var(--spyne-border)", color: "var(--spyne-text-muted)" }
          }
        >
          {allMapped ? "✓" : <Link2 size={9} />}
        </span>
        <span className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: "var(--spyne-text-secondary)" }}>CRM field map</span>
        <span className="ml-1 truncate text-[10px] font-medium" style={{ color: "var(--spyne-text-muted)" }}>· {source}</span>
        <span
          className="ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider tabular-nums"
          style={
            allMapped
              ? { background: SEVERITY.success.fill, color: SEVERITY.success.ink }
              : { background: SEVERITY.danger.fill, color: SEVERITY.danger.ink }
          }
        >
          {allMapped ? `${mapped} mapped` : `${missing.length} need mapping`}
        </span>
      </div>
      <div className="ml-6 flex flex-col gap-1">
        {columns.map((col) => (
          <CRMColumnRow key={col.key} col={col} mappedTo={map[col.key]} onResolve={onResolve} />
        ))}
      </div>
    </div>
  );
}

function CRMColumnRow({
  col,
  mappedTo,
  onResolve,
}: {
  col: CrmColumn;
  mappedTo?: string;
  onResolve?: LiveCampaignBriefProps["onResolveField"];
}) {
  const [open, setOpen] = useState(false);
  const resolved = mappedTo && mappedTo.trim().length > 0;

  if (resolved) {
    return (
      <div className="flex items-center gap-1.5 rounded-lg border px-2 py-1" style={{ background: SEVERITY.success.fill, borderColor: SEVERITY.success.border }}>
        <CheckCircle2 size={11} className="shrink-0" style={{ color: SEVERITY.success.ink }} />
        <span className="font-mono text-[10.5px] font-semibold truncate" style={{ color: "var(--spyne-text-primary)" }}>{col.label}</span>
        <ChevronRight size={9} className="shrink-0" style={{ color: "var(--spyne-text-muted)" }} />
        <span className="text-[10.5px] font-medium truncate" style={{ color: SEVERITY.success.ink }}>{mappedTo}</span>
      </div>
    );
  }

  const meta: FieldTierMeta = {
    tier: "A",
    label: col.label,
    ifMissing: `Suppress — leads without ${col.label} can't be dispatched (${col.note}).`,
  };
  const tierColor = { bg: SEVERITY.danger.fill, border: SEVERITY.danger.border, text: SEVERITY.danger.ink, label: "Required" };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="spyne-focus-ring flex w-full items-center gap-1.5 rounded-lg border px-2 py-1 text-left hover:brightness-95 cursor-pointer transition-colors"
        style={{ background: SEVERITY.danger.fill, borderColor: SEVERITY.danger.border }}
      >
        <AlertTriangle size={10} className="shrink-0" style={{ color: SEVERITY.danger.ink }} />
        <span className="font-mono text-[10.5px] font-semibold truncate" style={{ color: SEVERITY.danger.ink }}>{col.label}</span>
        <span className="ml-auto shrink-0 text-[9.5px] font-bold uppercase tracking-wider" style={{ color: SEVERITY.danger.ink }}>needs mapping</span>
      </button>
      {open && (
        <ResolverPopover
          fieldKey={crmFieldKey(col.key)}
          meta={meta}
          tierColor={tierColor}
          onClose={() => setOpen(false)}
          onResolve={onResolve}
        />
      )}
    </div>
  );
}

/* ── Section card ───────────────────────────────────────────────── */

function SectionCard({
  num,
  title,
  status,
  children,
}: {
  num: number;
  title: string;
  status: "done" | "pending";
  children: React.ReactNode;
}) {
  return (
    <div className="spyne-card px-3 py-2.5">
      <div className="mb-1.5 flex items-center gap-2">
        <span
          className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold tabular-nums"
          style={
            status === "done"
              ? { background: "var(--spyne-success-text)", color: "#ffffff" }
              : { background: "var(--spyne-border)", color: "var(--spyne-text-muted)" }
          }
        >
          {status === "done" ? "✓" : num}
        </span>
        <span className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: "var(--spyne-text-secondary)" }}>{title}</span>
      </div>
      <div className="ml-6 flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function Row({ k, v, className }: { k: string; v: string; className?: string }) {
  return (
    <div className={`flex items-baseline gap-2 ${className ?? ""}`}>
      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--spyne-text-muted)" }}>{k}</span>
      <span className="text-[11.5px] font-semibold" style={{ color: "var(--spyne-text-primary)" }}>{v}</span>
    </div>
  );
}

function SavedAudiencePill({ name, count }: { name: string; count?: number }) {
  return (
    <div className="mb-1 flex items-center gap-1.5 rounded-lg border px-2 py-1" style={{ background: "var(--spyne-primary-soft)", borderColor: "var(--spyne-brand-muted)" }}>
      <Pin size={11} className="shrink-0" style={{ color: "var(--spyne-primary)" }} />
      <span className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: "var(--spyne-primary)" }}>Saved</span>
      <span className="text-[11.5px] font-semibold truncate" style={{ color: "var(--spyne-text-primary)" }}>{name}</span>
      {count !== undefined && (
        <span className="ml-auto text-[10.5px] font-bold tabular-nums" style={{ color: "var(--spyne-primary)" }}>{count.toLocaleString()}</span>
      )}
    </div>
  );
}

/* ── Field-or-flag (renders value if present, missing-data flag if not) ── */

function FieldOrFlag({
  k,
  label,
  value,
  onResolve,
  multiline,
  compact,
}: {
  k: string;
  label: string;
  value?: string;
  onResolve?: LiveCampaignBriefProps["onResolveField"];
  multiline?: boolean;
  compact?: boolean;
}) {
  if (value && value.trim()) {
    if (multiline) {
      return <p className="text-[11.5px] font-semibold leading-snug" style={{ color: "var(--spyne-text-primary)" }}>{value}</p>;
    }
    return (
      <div className={`flex items-baseline gap-2 ${compact ? "" : ""}`}>
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--spyne-text-muted)" }}>{label}</span>
        <span className="text-[11.5px] font-semibold truncate" style={{ color: "var(--spyne-text-primary)" }}>{value}</span>
      </div>
    );
  }
  return <Flag k={k} onResolve={onResolve} compact={compact} />;
}

/* ── Flag — the missing-data resolution affordance ──────────────── */

function Flag({
  k,
  onResolve,
  compact,
}: {
  k: string;
  onResolve?: LiveCampaignBriefProps["onResolveField"];
  compact?: boolean;
}) {
  const meta = FIELD_TIERS[k];
  const [open, setOpen] = useState(false);

  if (!meta) return <span className="text-[11px] italic" style={{ color: "var(--spyne-text-muted)" }}>Pending answer</span>;

  const tierColor =
    meta.tier === "A" ? { bg: SEVERITY.danger.fill, border: SEVERITY.danger.border, text: SEVERITY.danger.ink, label: "Required" } :
    meta.tier === "B" ? { bg: SEVERITY.warning.fill, border: SEVERITY.warning.border, text: SEVERITY.warning.ink, label: "Compliance" } :
                        { bg: SEVERITY.info.fill, border: SEVERITY.info.border, text: SEVERITY.info.ink, label: "Enriches" };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="spyne-focus-ring w-full flex items-center justify-between gap-1.5 rounded-lg border px-1.5 py-0.5 text-left cursor-pointer hover:brightness-95 transition-colors"
        style={{ background: tierColor.bg, borderColor: tierColor.border }}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <AlertTriangle size={10} style={{ color: tierColor.text }} className="shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-wider truncate" style={{ color: tierColor.text }}>
            {meta.label} missing
          </span>
        </div>
        <span
          className="rounded-full px-1 py-0 text-[8.5px] font-bold uppercase tracking-wider tabular-nums shrink-0"
          style={{ background: tierColor.text, color: "white" }}
        >
          Tier {meta.tier}
        </span>
      </button>

      {open && (
        <ResolverPopover
          fieldKey={k}
          meta={meta}
          tierColor={tierColor}
          onClose={() => setOpen(false)}
          onResolve={onResolve}
        />
      )}
    </div>
  );
}

/* ── ResolverPopover — the 4-path resolution UI ─────────────────── */

function ResolverPopover({
  fieldKey,
  meta,
  tierColor,
  onClose,
  onResolve,
}: {
  fieldKey: string;
  meta: FieldTierMeta;
  tierColor: { bg: string; border: string; text: string; label: string };
  onClose: () => void;
  onResolve?: LiveCampaignBriefProps["onResolveField"];
}) {
  const [active, setActive] = useState<ResolverAction | null>(null);
  const actions = getResolverActions(fieldKey);

  const apply = (resolution: FieldResolution) => {
    onResolve?.(fieldKey, resolution);
    onClose();
  };

  const onPick = (action: ResolverAction) => {
    // Suppress is a one-tap action — everything else opens a sub-flow.
    if (action.kind === "suppress") return apply({ kind: "suppress", value: action.value });
    setActive(action);
  };

  return (
    <>
      <div className="fixed inset-0 z-[40]" onClick={onClose} />
      <div className="spyne-float absolute right-0 top-[calc(100%+4px)] z-[50] w-[280px] rounded-xl overflow-hidden" style={{ background: "var(--spyne-surface)" }}>
        {/* Header */}
        <div className="border-b px-3 py-2.5" style={{ background: tierColor.bg, borderColor: "var(--spyne-border)" }}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold" style={{ color: tierColor.text }}>{meta.label}</p>
              <p className="text-[10px] mt-0.5 leading-snug" style={{ color: tierColor.text }}>
                <strong>If missing:</strong> {meta.ifMissing}
              </p>
            </div>
            <button onClick={onClose} className="spyne-focus-ring rounded p-0.5 hover:bg-white/40">
              <X size={11} style={{ color: tierColor.text }} />
            </button>
          </div>
        </div>

        {/* Sub-flows */}
        {active?.kind === "csv" && <CSVResolver label={meta.label} onCancel={() => setActive(null)} onApply={(col) => apply({ kind: "csv", value: col })} />}
        {active?.kind === "crm" && <CRMResolver label={meta.label} onCancel={() => setActive(null)} onApply={(crmCol) => apply({ kind: "crm", value: crmCol })} />}
        {active?.kind === "fallback" && active.value && (
          <FallbackResolver fallback={active.value} onCancel={() => setActive(null)} onApply={() => apply({ kind: "set", value: active.value })} />
        )}
        {active?.kind === "preset" && (
          <PresetResolver action={active} onCancel={() => setActive(null)} onApply={(value) => apply({ kind: "set", value })} />
        )}
        {active?.kind === "multi" && (
          <MultiResolver action={active} onCancel={() => setActive(null)} onApply={(values) => apply({ kind: "multi", values })} />
        )}
        {active?.kind === "free_text" && (
          <FreeTextResolver action={active} onCancel={() => setActive(null)} onApply={(value) => apply({ kind: "set", value })} />
        )}

        {!active && (
          <div className="p-2 flex flex-col gap-1">
            {actions.map((action, i) => {
              const v = ACTION_VISUAL[action.kind];
              return (
                <ResolverActionButton
                  key={i}
                  icon={v.icon}
                  accent={v.accent}
                  title={action.title}
                  hint={action.hint}
                  onClick={() => onPick(action)}
                />
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

const ACTION_VISUAL: Record<ResolverAction["kind"], { icon: React.ReactNode; accent: string }> = {
  csv: { icon: <Upload size={12} />, accent: "var(--spyne-primary)" },
  crm: { icon: <Database size={12} />, accent: "var(--spyne-info-text)" },
  preset: { icon: <ListChecks size={12} />, accent: "var(--spyne-info-text)" },
  multi: { icon: <ListChecks size={12} />, accent: "var(--spyne-info-text)" },
  free_text: { icon: <Pencil size={12} />, accent: "var(--spyne-primary)" },
  fallback: { icon: <Wand2 size={12} />, accent: "var(--spyne-primary)" },
  suppress: { icon: <MinusCircle size={12} />, accent: "var(--spyne-danger-text)" },
};

function ResolverActionButton({
  icon,
  accent,
  title,
  hint,
  onClick,
}: {
  icon: React.ReactNode;
  accent: string;
  title: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="spyne-focus-ring flex items-start gap-2 rounded-lg px-2 py-1.5 text-left cursor-pointer transition-colors hover:bg-[var(--spyne-surface-hover)]"
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: `color-mix(in srgb, ${accent} 12%, transparent)`, color: accent }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold leading-tight" style={{ color: "var(--spyne-text-primary)" }}>{title}</p>
        <p className="text-[10px] leading-tight mt-0.5 truncate" style={{ color: "var(--spyne-text-secondary)" }}>{hint}</p>
      </div>
      <ChevronRight size={11} className="shrink-0 mt-1" style={{ color: "var(--spyne-text-muted)" }} />
    </button>
  );
}

/* ── Preset / multi / free-text resolvers ───────────────────────────── */

function PresetResolver({ action, onCancel, onApply }: { action: ResolverAction; onCancel: () => void; onApply: (value: string) => void }) {
  return (
    <div className="p-3 flex flex-col gap-2">
      <p className="text-[11px] font-semibold" style={{ color: "var(--spyne-text-primary)" }}>{action.title}</p>
      <div className="flex flex-col gap-1 max-h-[180px] overflow-y-auto">
        {action.presets?.map((p) => (
          <button
            key={p.value}
            onClick={() => onApply(p.value)}
            className="spyne-focus-ring flex items-center justify-between gap-2 rounded-lg border px-2 py-1.5 text-left transition-colors hover:border-[var(--spyne-primary)] hover:bg-[var(--spyne-primary-soft)]"
            style={{ background: "var(--spyne-surface)", borderColor: "var(--spyne-border)" }}
          >
            <span className="text-[11.5px] font-semibold" style={{ color: "var(--spyne-text-secondary)" }}>{p.label}</span>
            {p.hint && <span className="text-[10px]" style={{ color: "var(--spyne-text-muted)" }}>{p.hint}</span>}
          </button>
        ))}
      </div>
      <div className="flex justify-end">
        <button onClick={onCancel} className="spyne-btn-secondary !h-7 !px-2 !py-1 !text-[10.5px]">
          Cancel
        </button>
      </div>
    </div>
  );
}

function MultiResolver({ action, onCancel, onApply }: { action: ResolverAction; onCancel: () => void; onApply: (values: string[]) => void }) {
  const [picked, setPicked] = useState<string[]>([]);
  const toggle = (value: string) =>
    setPicked((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  return (
    <div className="p-3 flex flex-col gap-2">
      <p className="text-[11px] font-semibold" style={{ color: "var(--spyne-text-primary)" }}>{action.title}</p>
      <div className="flex flex-col gap-1 max-h-[160px] overflow-y-auto">
        {action.presets?.map((p) => {
          const on = picked.includes(p.value);
          return (
            <button
              key={p.value}
              onClick={() => toggle(p.value)}
              className="spyne-focus-ring flex items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition-colors"
              style={
                on
                  ? { borderColor: "var(--spyne-primary)", background: "var(--spyne-primary-soft)" }
                  : { borderColor: "var(--spyne-border)", background: "var(--spyne-surface)" }
              }
            >
              <span
                className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border"
                style={on ? { borderColor: "var(--spyne-primary)", background: "var(--spyne-primary)" } : { borderColor: "var(--spyne-border-strong)" }}
              >
                {on && <CheckCircle2 size={10} className="text-white" />}
              </span>
              <span className="text-[11.5px] font-semibold" style={{ color: "var(--spyne-text-secondary)" }}>{p.label}</span>
            </button>
          );
        })}
      </div>
      <div className="flex justify-end gap-1.5">
        <button onClick={onCancel} className="spyne-btn-secondary !h-7 !px-2 !py-1 !text-[10.5px]">
          Cancel
        </button>
        <button
          onClick={() => picked.length && onApply(picked)}
          disabled={picked.length === 0}
          className="spyne-btn-primary !h-7 !px-2 !py-1 !text-[10.5px] tabular-nums disabled:opacity-30"
        >
          Apply {picked.length || ""}
        </button>
      </div>
    </div>
  );
}

function FreeTextResolver({ action, onCancel, onApply }: { action: ResolverAction; onCancel: () => void; onApply: (value: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <div className="p-3 flex flex-col gap-2">
      <p className="text-[11px] font-semibold" style={{ color: "var(--spyne-text-primary)" }}>{action.title}</p>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={action.placeholder}
        rows={2}
        className="spyne-focus-ring w-full resize-none rounded-lg border px-2 py-1.5 text-[11px] outline-none"
        style={{ background: "var(--spyne-surface)", borderColor: "var(--spyne-border)", color: "var(--spyne-text-primary)" }}
      />
      <div className="flex justify-end gap-1.5">
        <button onClick={onCancel} className="spyne-btn-secondary !h-7 !px-2 !py-1 !text-[10.5px]">
          Cancel
        </button>
        <button
          onClick={() => value.trim() && onApply(value.trim())}
          disabled={!value.trim()}
          className="spyne-btn-primary !h-7 !px-2 !py-1 !text-[10.5px] disabled:opacity-30"
        >
          Apply
        </button>
      </div>
    </div>
  );
}

/* ── CSV resolver ───────────────────────────────────────────────── */

function CSVResolver({ label, onCancel, onApply }: { label: string; onCancel: () => void; onApply: (col: string) => void }) {
  const [columnName, setColumnName] = useState("");
  return (
    <div className="p-3 flex flex-col gap-2">
      <p className="text-[11px] font-semibold" style={{ color: "var(--spyne-text-primary)" }}>CSV column for "{label}"</p>
      <div className="rounded-lg border-2 border-dashed p-3 flex flex-col items-center gap-1" style={{ borderColor: "var(--spyne-brand-muted)", background: "var(--spyne-primary-soft)" }}>
        <Upload size={14} style={{ color: "var(--spyne-primary)" }} />
        <p className="text-[10.5px] font-semibold" style={{ color: "var(--spyne-text-primary)" }}>Drop CSV here or click to browse</p>
        <p className="text-[9.5px]" style={{ color: "var(--spyne-text-muted)" }}>VinSolutions / Tekion / generic format</p>
      </div>
      <input
        value={columnName}
        onChange={(e) => setColumnName(e.target.value)}
        placeholder="Column name in CSV (e.g. equity_amount)"
        className="spyne-focus-ring w-full rounded-lg border px-2 py-1.5 text-[11px] outline-none"
        style={{ background: "var(--spyne-surface)", borderColor: "var(--spyne-border)", color: "var(--spyne-text-primary)" }}
      />
      <div className="flex justify-end gap-1.5">
        <button onClick={onCancel} className="spyne-btn-secondary !h-7 !px-2 !py-1 !text-[10.5px]">
          Cancel
        </button>
        <button
          onClick={() => columnName && onApply(columnName)}
          disabled={!columnName.trim()}
          className="spyne-btn-primary !h-7 !px-2 !py-1 !text-[10.5px] disabled:opacity-30"
        >
          Map column
        </button>
      </div>
    </div>
  );
}

/* ── CRM resolver ───────────────────────────────────────────────── */

const CRM_OPTIONS = [
  { id: "dealersocket", name: "DealerSocket", color: "#6366f1", fields: ["lead_status", "lease_end_date", "trade_in_value"] },
  { id: "tekion", name: "Tekion", color: "#16a34a", fields: ["ro_history", "declined_services", "service_due_date"] },
  { id: "vinsolutions", name: "VinSolutions", color: "#dc2626", fields: ["lead_age_days", "last_activity", "voi"] },
  { id: "eleads", name: "eLeads", color: "#f59e0b", fields: ["proposal_status", "deal_stage", "salesperson"] },
  { id: "apollo", name: "Apollo / Team Velocity", color: "#0891b2", fields: ["equity_amount", "loan_payoff", "credit_tier"] },
];

function CRMResolver({ label, onCancel, onApply }: { label: string; onCancel: () => void; onApply: (col: string) => void }) {
  const [selectedCrm, setSelectedCrm] = useState<string | null>(null);
  const crm = CRM_OPTIONS.find((c) => c.id === selectedCrm);

  return (
    <div className="p-3 flex flex-col gap-2">
      <p className="text-[11px] font-semibold" style={{ color: "var(--spyne-text-primary)" }}>Map "{label}" from a CRM</p>

      {!selectedCrm && (
        <div className="grid grid-cols-2 gap-1.5">
          {CRM_OPTIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCrm(c.id)}
              className="spyne-focus-ring rounded-lg border px-2 py-1.5 text-[11px] font-semibold text-left transition-colors hover:border-[var(--spyne-primary)] hover:text-[var(--spyne-primary)]"
              style={{ background: "var(--spyne-surface)", borderColor: "var(--spyne-border)", color: "var(--spyne-text-secondary)" }}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {crm && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold" style={{ color: "var(--spyne-text-primary)" }}>{crm.name}</span>
            <button onClick={() => setSelectedCrm(null)} className="spyne-focus-ring rounded text-[10px] underline transition-colors hover:text-[var(--spyne-text-primary)]" style={{ color: "var(--spyne-text-secondary)" }}>
              Change CRM
            </button>
          </div>
          <p className="text-[10px]" style={{ color: "var(--spyne-text-muted)" }}>Pick the source column:</p>
          <div className="flex flex-col gap-0.5 max-h-[140px] overflow-y-auto">
            {crm.fields.map((f) => (
              <button
                key={f}
                onClick={() => onApply(`${crm.name}.${f}`)}
                className="spyne-focus-ring flex items-center justify-between rounded-lg border px-2 py-1 text-[10.5px] font-medium transition-colors hover:border-[var(--spyne-primary)] hover:bg-[var(--spyne-primary-soft)] hover:text-[var(--spyne-primary)]"
                style={{ background: "var(--spyne-surface)", borderColor: "var(--spyne-border)", color: "var(--spyne-text-secondary)" }}
              >
                <span className="font-mono">{f}</span>
                <ChevronRight size={9} style={{ color: "var(--spyne-text-muted)" }} />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={onCancel} className="spyne-btn-secondary !h-7 !px-2 !py-1 !text-[10.5px]">
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ── Fallback resolver ──────────────────────────────────────────── */

function FallbackResolver({ fallback, onCancel, onApply }: { fallback: string; onCancel: () => void; onApply: () => void }) {
  return (
    <div className="p-3 flex flex-col gap-2">
      <p className="text-[11px] font-semibold" style={{ color: "var(--spyne-text-primary)" }}>Use safe fallback</p>
      <div className="rounded-lg border px-2.5 py-2 text-[11px] italic leading-snug" style={{ background: "var(--spyne-primary-soft)", borderColor: "var(--spyne-brand-muted)", color: "var(--spyne-primary)" }}>
        "{fallback}"
      </div>
      <p className="text-[10px] leading-snug" style={{ color: "var(--spyne-text-secondary)" }}>
        Used when the per-lead value is missing. Never blocks dispatch.
      </p>
      <div className="flex justify-end gap-1.5">
        <button onClick={onCancel} className="spyne-btn-secondary !h-7 !px-2 !py-1 !text-[10.5px]">
          Cancel
        </button>
        <button onClick={onApply} className="spyne-btn-primary !h-7 !px-2 !py-1 !text-[10.5px]">
          Apply fallback
        </button>
      </div>
    </div>
  );
}
