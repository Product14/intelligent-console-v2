"use client";

/**
 * CampaignsHome — the AI-native front door for the Campaigns tab.
 *
 * Replaces the old three stacked surfaces (AIRecommendations + UseCaseList +
 * CampaignListView header with scattered "New Campaign / New Use Case" buttons)
 * with ONE command-first experience, per the Sales-Outbound PRD:
 *
 *   1. A VINI command bar — describe a campaign in plain English; VINI drafts
 *      the audience, talk track, and workflow. The blank prompt is the enemy.
 *   2. Data-derived launch suggestions — aging inventory, cold cohorts, no-shows.
 *   3. Reusable building blocks — deployed Use Cases + saved Audiences.
 *   4. A clean campaign roster — status, live metrics, provenance, one VINI line.
 *
 * The heavy generate-then-edit engines (DescribeCampaignBuilder, UseCaseStudio,
 * AudienceQueryBuilder) stay where they are — this is just the doorway into them.
 */

import { useMemo, useState } from "react";
import {
  Sparkles,
  ArrowRight,
  Search,
  MessageSquare,
  Phone,
  Mail,
  Play,
  Pause,
  PencilLine,
  Layers,
  Users,
  TrendingUp,
  TrendingDown,
  Plus,
  Wand2,
  ShieldCheck,
  CircleDot,
} from "lucide-react";
import { EmptyState } from "../shared";

/* ── Types (loose — mock data is JS) ─────────────────────────────── */

interface Campaign {
  id: string;
  name: string;
  status: string;
  type?: string;
  description?: string;
  createdAt?: string;
  leadsEnrolled?: number;
  leadsActive?: number;
  responseRate?: number;
  appointmentsBooked?: number;
  conversionRate?: number;
  channels?: string[];
  triggerDescription?: string;
}

export interface CampaignsHomeProps {
  campaigns: Campaign[];
  summaryMetrics?: { label: string; value: string }[];
  lotData?: { vehicles?: any[]; holdingCostPerDay?: number };
  useCases?: any[];
  savedAudiences?: any[];
  agentName?: string;
  /** Open the describe builder with a typed prompt (drops straight into the flow). */
  onDescribe: (prompt: string) => void;
  /** Open the describe builder with a blank intro screen. */
  onBlankDescribe: () => void;
  onOpenCampaign: (id: string) => void;
  onEditWorkflow: (id: string) => void;
  onNewUseCase: () => void;
  onOpenUseCase: (id: string) => void;
  onNewAudience: () => void;
  onUseAudience: (id: string) => void;
  /** Launch a pre-seeded campaign for a set of lot vehicles. */
  onCreateFromVehicles?: (vehicles: any[]) => void;
}

/* ── Static config ───────────────────────────────────────────────── */

const STATUS_META: Record<string, { label: string; dot: string; tone: string }> = {
  active: { label: "Active", dot: "var(--spyne-success-text)", tone: "spyne-badge-success" },
  paused: { label: "Paused", dot: "var(--spyne-warning-ink)", tone: "spyne-badge-warning" },
  draft: { label: "Draft", dot: "var(--spyne-text-muted)", tone: "spyne-badge-neutral" },
  completed: { label: "Completed", dot: "var(--spyne-info-text)", tone: "spyne-badge-info" },
};

const CHANNEL_ICON: Record<string, any> = { SMS: MessageSquare, Voice: Phone, Email: Mail };

const EXAMPLE_PROMPTS = [
  "Re-engage leads who went cold on 3-row SUVs in the last 30 days",
  "Follow up with last week's no-shows and rebook them",
  "Equity mining — customers with more than $5K positive equity, voice + SMS",
  "Lease-end customers maturing in 60–90 days — offer buy-out, trade, or walk",
];

/* ── Helpers ─────────────────────────────────────────────────────── */

const fmt = (n?: number) => (n ?? 0).toLocaleString();

/** A single deterministic VINI line + suggested action per campaign. */
function campaignInsight(c: Campaign): { line: string; cta: string; trend: "up" | "down" | "flat" } {
  const rr = c.responseRate ?? 0;
  if (c.status === "active" && rr >= 55)
    return { line: `Response rate ${rr}% is beating your average — scale the audience to capture more.`, cta: "Scale 50%", trend: "up" };
  if (c.status === "active" && rr > 0 && rr < 35)
    return { line: `Response rate ${rr}% is under target — refresh the opener or tighten the audience.`, cta: "Tune", trend: "down" };
  if (c.status === "paused")
    return { line: `Paused with ${fmt(c.leadsActive)} leads still in flight. Resume to keep the cadence alive.`, cta: "Resume", trend: "flat" };
  if (c.status === "draft")
    return { line: `Draft — finish setup, run a test call, and launch.`, cta: "Finish", trend: "flat" };
  if (c.status === "completed")
    return { line: `Completed — ${fmt(c.appointmentsBooked)} appointments booked. Clone for the next wave?`, cta: "Clone", trend: "flat" };
  return { line: `${fmt(c.leadsActive)} leads in flight · next touches scheduled.`, cta: "Open", trend: "flat" };
}

/** Build up-to-3 data-derived launch suggestions. */
function buildSuggestions(
  lotData: CampaignsHomeProps["lotData"],
  campaigns: Campaign[]
): {
  id: string;
  icon: any;
  title: string;
  detail: string;
  stake?: string;
  prompt: string;
  vehicles?: any[];
  /** Provenance line — which connected source this was derived from. */
  source?: string;
  /** When set, render a dashed "Connect X" teaser instead of a live draft CTA. */
  connect?: string;
}[] {
  const out: ReturnType<typeof buildSuggestions> = [];

  // 1. Aging inventory — highest holding cost on the lot.
  const vehicles = (lotData?.vehicles ?? []).slice().sort((a, b) => (b.holdingCost ?? 0) - (a.holdingCost ?? 0));
  const aged = vehicles[0];
  if (aged) {
    const name = `${aged.year} ${aged.make} ${aged.model}`;
    out.push({
      id: "lot",
      icon: TrendingDown,
      title: `Aging unit: ${name}`,
      detail: `${aged.daysOnLot} days on lot · ${aged.matchedLeads ?? 0} matched shoppers in CRM`,
      stake: aged.holdingCost ? `$${fmt(Math.round(aged.holdingCost))} sunk` : undefined,
      source: "from IMS · synced 4m ago",
      prompt: `Create a campaign to move the ${name} that's been on the lot ${aged.daysOnLot} days. Reach shoppers who looked at similar ${aged.category ?? ""} vehicles with a limited-time price adjustment. Voice + SMS.`,
      vehicles: [aged],
    });
  } else {
    // Missing source — teaser instead of dropping the slot.
    out.push({
      id: "lot",
      icon: TrendingDown,
      title: "Aging inventory openings",
      detail: "Connect your inventory feed so VINI can surface units burning holding cost.",
      connect: "Connect IMS",
      prompt: "",
    });
  }

  // 2. Cold cohort — only if there isn't already a re-engagement campaign running.
  const hasReengage = campaigns.some((c) => /re-?engage/i.test(c.type ?? "") || /re-?engage/i.test(c.name ?? ""));
  if (!hasReengage) {
    out.push({
      id: "cold",
      icon: Users,
      title: "Cold leads piling up",
      detail: "Leads with no activity in 14+ days are decaying — recover them before they're gone.",
      source: "from CRM · synced 4m ago",
      prompt: "Re-engage leads that went cold after 14+ days of no response. Soft re-introduction, reference their original vehicle interest, offer a reason to come back. SMS-first, voice on touch 3.",
    });
  }

  // 3. Evergreen — no-show rebooking.
  out.push({
    id: "noshow",
    icon: Sparkles,
    title: "Rebook last week's no-shows",
    detail: "Customers who booked but didn't show convert well on a same-week nudge.",
    source: "from CRM · synced 4m ago",
    prompt: "Follow up with customers who had an appointment last week but didn't show. Empathetic, low-pressure, offer two new slots. Voice + SMS, 3 touches over 5 days.",
  });

  return out.slice(0, 3);
}

/* ── Component ───────────────────────────────────────────────────── */

export default function CampaignsHome({
  campaigns,
  summaryMetrics = [],
  lotData,
  useCases = [],
  savedAudiences = [],
  agentName,
  onDescribe,
  onBlankDescribe,
  onOpenCampaign,
  onEditWorkflow,
  onNewUseCase,
  onOpenUseCase,
  onNewAudience,
  onUseAudience,
  onCreateFromVehicles,
}: CampaignsHomeProps) {
  const [prompt, setPrompt] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");

  const suggestions = useMemo(() => buildSuggestions(lotData, campaigns), [lotData, campaigns]);
  const deployedUseCases = useMemo(() => useCases.filter((u) => u.status === "deployed"), [useCases]);

  const filtered = useMemo(
    () =>
      campaigns.filter((c) => {
        if (statusFilter !== "all" && c.status !== statusFilter) return false;
        if (query && !c.name.toLowerCase().includes(query.toLowerCase())) return false;
        return true;
      }),
    [campaigns, statusFilter, query]
  );

  const counts = useMemo(() => {
    const by: Record<string, number> = { all: campaigns.length };
    for (const c of campaigns) by[c.status] = (by[c.status] ?? 0) + 1;
    return by;
  }, [campaigns]);

  const submit = () => {
    const t = prompt.trim();
    if (!t) return onBlankDescribe();
    onDescribe(t);
    setPrompt("");
  };

  return (
    <div className="space-y-5 spyne-animate-fade-in">
      {/* ── 1 · VINI command bar ─────────────────────────────────── */}
      <section
        className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg"
        style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--spyne-primary) 70%, #000) 0%, var(--spyne-primary) 100%)" }}
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full opacity-20" style={{ background: "radial-gradient(circle, color-mix(in srgb, #fff 40%, transparent) 0%, transparent 70%)" }} />
        <div className="relative">
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/15">
              <Sparkles size={13} />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">VINI · Campaign Builder</span>
          </div>
          <h1 className="text-[19px] font-bold leading-tight tracking-tight">Launch outbound in plain English</h1>
          <p className="mt-0.5 text-[12.5px] leading-snug text-white/70">
            Describe what you want{agentName ? `, ${agentName}` : ""} — VINI drafts the audience, the talk track, and the workflow. You review and launch.
          </p>

          {/* Command input */}
          <div className="mt-3.5 flex items-center gap-2 rounded-xl bg-white/95 p-1.5 shadow-md ring-1 ring-white/20 focus-within:ring-2 focus-within:ring-[color-mix(in_srgb,var(--spyne-primary)_40%,transparent)]">
            <Wand2 size={16} className="ml-2 shrink-0" style={{ color: "var(--spyne-primary)" }} />
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="e.g. Re-engage leads who went cold on 3-row SUVs…"
              className="min-w-0 flex-1 bg-transparent px-1 py-1.5 text-[13px] outline-none placeholder:text-[var(--spyne-text-muted)]"
              style={{ color: "var(--spyne-text-primary)" }}
            />
            <button onClick={submit} className="spyne-btn-primary shrink-0 gap-1.5 text-[12.5px]">
              Draft it <ArrowRight size={14} />
            </button>
          </div>

          {/* Example prompt chips */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {EXAMPLE_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => onDescribe(p)}
                className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/85 ring-1 ring-white/15 transition-colors hover:bg-white/20"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Secondary affordances */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-white/65">
            <button onClick={onNewUseCase} className="inline-flex items-center gap-1.5 hover:text-white">
              <Layers size={12} /> Build a reusable Use Case
            </button>
            <button onClick={onNewAudience} className="inline-flex items-center gap-1.5 hover:text-white">
              <Users size={12} /> Build an audience
            </button>
            <span className="inline-flex items-center gap-1.5 text-white/55">
              <ShieldCheck size={12} /> Every draft is compliance-gated before launch
            </span>
          </div>
        </div>
      </section>

      {/* ── 2 · Data-derived launch suggestions ──────────────────── */}
      {suggestions.length > 0 && (
        <section>
          <SectionLabel icon={Sparkles} text="VINI spotted these openings" />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {suggestions.map((s) => {
              const Icon = s.icon;
              const isTeaser = !!s.connect;
              return (
                <div
                  key={s.id}
                  className={`flex flex-col gap-2 p-3.5 ${isTeaser ? "rounded-lg border border-dashed bg-[var(--spyne-surface)]" : "spyne-card"}`}
                  style={isTeaser ? { borderColor: "var(--spyne-border)" } : undefined}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: "var(--spyne-primary-soft)", color: "var(--spyne-primary)" }}
                    >
                      <Icon size={16} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[12.5px] font-semibold" style={{ color: "var(--spyne-text-primary)" }}>{s.title}</p>
                      {s.stake && <p className="text-[11px] font-semibold tabular-nums" style={{ color: "var(--spyne-warning-ink)" }}>{s.stake}</p>}
                    </div>
                  </div>
                  <p className="text-[11.5px] leading-snug" style={{ color: "var(--spyne-text-secondary)" }}>{s.detail}</p>
                  {s.source && (
                    <p className="inline-flex items-center gap-1 text-[10.5px] font-medium" style={{ color: "var(--spyne-text-muted)" }}>
                      <CircleDot size={9} style={{ color: "var(--spyne-success-text)" }} /> {s.source}
                    </p>
                  )}
                  {isTeaser ? (
                    <button
                      onClick={onBlankDescribe}
                      className="spyne-btn-secondary spyne-focus-ring mt-auto !h-8 self-start !px-2.5 !text-[11.5px]"
                    >
                      <Plus size={13} /> {s.connect}
                    </button>
                  ) : (
                    <button
                      onClick={() => (s.vehicles && onCreateFromVehicles ? onCreateFromVehicles(s.vehicles) : onDescribe(s.prompt))}
                      className="spyne-focus-ring mt-auto inline-flex items-center gap-1.5 self-start rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold transition-colors"
                      style={{ background: "var(--spyne-primary-soft)", color: "var(--spyne-primary)" }}
                    >
                      Draft campaign <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── 3 · Reusable building blocks ─────────────────────────── */}
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <BuildingBlock
          icon={Layers}
          title="Use Cases"
          subtitle="Reusable agent brains + workflows"
          emptyHint="No Use Cases yet — build one VINI can reuse across campaigns."
          onNew={onNewUseCase}
          newLabel="New Use Case"
          items={deployedUseCases.map((u) => ({ id: u.id, name: u.name ?? u.title ?? "Untitled use case", meta: u.subUseLabel ?? u.category ?? "Deployed" }))}
          onOpen={onOpenUseCase}
        />
        <BuildingBlock
          icon={Users}
          title="Saved Audiences"
          subtitle="Live filters you can attach to any campaign"
          emptyHint="No saved audiences — build a reusable segment with live counts."
          onNew={onNewAudience}
          newLabel="New Audience"
          items={savedAudiences.map((a) => ({ id: a.id, name: a.name, meta: a.count != null ? `${fmt(a.count)} leads` : "Audience" }))}
          onOpen={onUseAudience}
          openLabel="Use"
        />
      </section>

      {/* ── 4 · Campaign roster ──────────────────────────────────── */}
      <section className="spyne-card overflow-hidden p-0">
        {/* Roster header */}
        <div className="flex flex-col gap-3 border-b border-[var(--spyne-border)] px-4 py-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-[14px] font-semibold" style={{ color: "var(--spyne-text-primary)" }}>Campaigns</h2>
              {summaryMetrics.slice(0, 4).map((m) => (
                <span key={m.label} className="hidden items-baseline gap-1 rounded-lg bg-[var(--spyne-page-bg)] px-2 py-1 sm:inline-flex">
                  <span className="text-[12px] font-bold tabular-nums" style={{ color: "var(--spyne-text-primary)" }}>{m.value}</span>
                  <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--spyne-text-muted)" }}>{m.label}</span>
                </span>
              ))}
            </div>
            <div className="relative">
              <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--spyne-text-muted)" }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search campaigns…"
                className="spyne-input spyne-focus-ring h-8 w-44 pl-7 text-[12px]"
              />
            </div>
          </div>
          {/* Status filter chips */}
          <div className="flex flex-wrap gap-1.5">
            {["all", "active", "paused", "draft", "completed"].map((s) => {
              const active = statusFilter === s;
              const label = s === "all" ? "All" : STATUS_META[s]?.label ?? s;
              const n = counts[s] ?? 0;
              if (s !== "all" && n === 0) return null;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`spyne-pill spyne-focus-ring ${active ? "spyne-pill-active" : ""}`}
                >
                  {label} <span className="tabular-nums opacity-70">{n}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          campaigns.length === 0 ? (
            <EmptyState
              glyph="campaign"
              title="No campaigns yet"
              helper="Describe a campaign in plain English and VINI drafts the audience, talk track, and workflow for you."
              action={
                <button onClick={onBlankDescribe} className="spyne-btn-primary text-[12.5px]">
                  <Wand2 size={14} /> Draft your first campaign
                </button>
              }
            />
          ) : (
            <EmptyState
              glyph="filter_alt_off"
              title="No campaigns match"
              helper="Try a different status filter or clear your search to see the full roster."
              action={
                <button
                  onClick={() => {
                    setStatusFilter("all");
                    setQuery("");
                  }}
                  className="spyne-btn-secondary text-[12.5px]"
                >
                  Clear filters
                </button>
              }
            />
          )
        ) : (
          <ul className="divide-y divide-[var(--spyne-border)]">
            {filtered.map((c) => (
              <CampaignRow key={c.id} c={c} onOpen={() => onOpenCampaign(c.id)} onEditWorkflow={() => onEditWorkflow(c.id)} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ── Sub-components ───────────────────────────────────────────────── */

function SectionLabel({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="mb-2 flex items-center gap-1.5">
      <Icon size={13} style={{ color: "var(--spyne-primary)" }} />
      <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--spyne-text-secondary)" }}>{text}</span>
    </div>
  );
}

function BuildingBlock({
  icon: Icon,
  title,
  subtitle,
  emptyHint,
  items,
  onNew,
  newLabel,
  onOpen,
  openLabel = "Open",
}: {
  icon: any;
  title: string;
  subtitle: string;
  emptyHint: string;
  items: { id: string; name: string; meta: string }[];
  onNew: () => void;
  newLabel: string;
  onOpen: (id: string) => void;
  openLabel?: string;
}) {
  return (
    <div className="spyne-card flex flex-col p-3.5">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg" style={{ background: "var(--spyne-primary-soft)", color: "var(--spyne-primary)" }}>
            <Icon size={16} />
          </span>
          <div>
            <p className="text-[13px] font-bold" style={{ color: "var(--spyne-text-primary)" }}>{title}</p>
            <p className="text-[11px]" style={{ color: "var(--spyne-text-muted)" }}>{subtitle}</p>
          </div>
        </div>
        <button onClick={onNew} className="spyne-btn-secondary spyne-focus-ring !h-8 shrink-0 !px-2 !text-[11.5px]" style={{ color: "var(--spyne-primary)" }}>
          <Plus size={12} /> {newLabel}
        </button>
      </div>
      {items.length === 0 ? (
        <p className="rounded-lg bg-[var(--spyne-page-bg)] px-3 py-3 text-[11.5px] leading-snug" style={{ color: "var(--spyne-text-muted)" }}>{emptyHint}</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {items.slice(0, 4).map((it) => (
            <li key={it.id}>
              <button
                onClick={() => onOpen(it.id)}
                className="spyne-focus-ring flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-[var(--spyne-page-bg)]"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <CircleDot size={11} className="shrink-0" style={{ color: "var(--spyne-primary)" }} />
                  <span className="truncate text-[12px] font-semibold" style={{ color: "var(--spyne-text-primary)" }}>{it.name}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="text-[10.5px] tabular-nums" style={{ color: "var(--spyne-text-muted)" }}>{it.meta}</span>
                  <span className="text-[11px] font-semibold" style={{ color: "var(--spyne-primary)" }}>{openLabel}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CampaignRow({ c, onOpen, onEditWorkflow }: { c: Campaign; onOpen: () => void; onEditWorkflow: () => void }) {
  const meta = STATUS_META[c.status] ?? STATUS_META.draft;
  const insight = campaignInsight(c);
  const TrendIcon = insight.trend === "up" ? TrendingUp : insight.trend === "down" ? TrendingDown : Sparkles;
  const trendColor =
    insight.trend === "up"
      ? "var(--spyne-success-text)"
      : insight.trend === "down"
        ? "var(--spyne-danger-text)"
        : "var(--spyne-primary)";

  const stop = (fn: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    fn();
  };

  return (
    <li
      onClick={onOpen}
      className="group cursor-pointer border-l-2 border-transparent px-4 py-3 transition-[background,box-shadow,border-color] duration-[var(--spyne-duration-fast)] [transition-timing-function:var(--spyne-ease-out)] hover:border-l-[var(--spyne-primary)] hover:bg-[var(--spyne-page-bg)] hover:shadow-sm"
    >
      <div className="flex items-start gap-3">
        {/* Status dot */}
        <span className="mt-1 flex shrink-0 items-center" title={meta.label}>
          <span className="h-2 w-2 rounded-full" style={{ background: meta.dot }} />
        </span>

        {/* Main */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-[13.5px] font-bold transition-colors group-hover:text-[var(--spyne-primary)]" style={{ color: "var(--spyne-text-primary)" }}>
              {c.name}
            </span>
            <span className={`spyne-badge ${meta.tone} text-[10px]`}>{meta.label}</span>
            {/* Provenance */}
            {c.type && (
              <span className="inline-flex items-center gap-1 rounded-md bg-[var(--spyne-page-bg)] px-1.5 py-0.5 text-[10px] font-medium" style={{ color: "var(--spyne-text-secondary)" }}>
                <Layers size={9} /> {c.type}
              </span>
            )}
            {/* Channels */}
            <span className="inline-flex items-center gap-1">
              {(c.channels ?? []).map((ch) => {
                const Icon = CHANNEL_ICON[ch];
                return Icon ? <Icon key={ch} size={11} style={{ color: "var(--spyne-text-muted)" }} /> : null;
              })}
            </span>
          </div>

          {/* Metrics */}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
            <Metric label="Enrolled" value={fmt(c.leadsEnrolled)} />
            <Metric label="In flight" value={fmt(c.leadsActive)} />
            <Metric label="Response" value={`${c.responseRate ?? 0}%`} />
            <Metric label="Appts" value={fmt(c.appointmentsBooked)} />
          </div>

          {/* VINI insight */}
          <div className="mt-2 flex items-start gap-1.5 rounded-lg px-2 py-1.5" style={{ background: "var(--spyne-primary-soft)" }}>
            <TrendIcon size={12} className="mt-0.5 shrink-0" style={{ color: trendColor }} />
            <p className="text-[11.5px] leading-snug" style={{ color: "var(--spyne-text-secondary)" }}>{insight.line}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          <IconBtn title={c.status === "paused" ? "Resume" : "Pause"} onClick={stop(onOpen)}>
            {c.status === "paused" ? <Play size={14} /> : <Pause size={14} />}
          </IconBtn>
          <IconBtn title="Edit workflow" onClick={stop(onEditWorkflow)}>
            <PencilLine size={14} />
          </IconBtn>
          <button
            onClick={stop(onOpen)}
            className="spyne-btn-secondary spyne-focus-ring ml-1 hidden !h-8 !px-2.5 !text-[11.5px] group-hover:border-[var(--spyne-primary)] group-hover:text-[var(--spyne-primary)] sm:inline-flex"
          >
            {insight.cta} <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </li>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-baseline gap-1">
      <span className="text-[12.5px] font-bold tabular-nums" style={{ color: "var(--spyne-text-primary)" }}>{value}</span>
      <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--spyne-text-muted)" }}>{label}</span>
    </span>
  );
}

function IconBtn({ children, title, onClick }: { children: React.ReactNode; title: string; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="spyne-btn-ghost spyne-focus-ring flex !h-8 !w-8 items-center justify-center rounded-lg !p-0"
      style={{ color: "var(--spyne-text-secondary)" }}
    >
      {children}
    </button>
  );
}
