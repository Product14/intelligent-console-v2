"use client";

/**
 * OnboardingJourney — the 0→value story rendered on the Overview landing.
 * Given a stage it renders ONE focused surface (welcome/connect, connecting
 * ceremony, analyzing scan, or the opportunity aha). The 'active' end-state is
 * NOT handled here — the Overview renders the existing console verbatim for it.
 */

import { useState, useEffect, useRef } from "react";
import {
  Sparkles, ArrowRight, Check, Lock, Database, Contact, Wrench, Boxes, Globe,
  TrendingUp, Search, Rocket, Layers, Users, CircleCheck, Zap, RefreshCw,
} from "lucide-react";
import { IdentityMigrationCard, EntitySummaryGrid } from "../data-health/dealer-view";
import { identityMigrationData, entityHealthData } from "../data-health/mock-data";
import {
  type Stage, CONNECT_STEPS, TOTAL_PIPELINE_K, OPPORTUNITIES, OPPORTUNITY_TOTAL_K, type ConnectStep, type Opportunity,
} from "./state";

const GLYPH: Record<string, any> = { Contact, Database, Wrench, Boxes, Globe };

export function OnboardingJourney({
  stage,
  onStageChange,
  onNavigate,
  onDraftCampaign,
  userName = "there",
}: {
  stage: Stage;
  onStageChange: (s: Stage) => void;
  onNavigate: (page: string) => void;
  /** Draft a campaign pre-filled with an opportunity's prompt (→ campaign builder). */
  onDraftCampaign?: (prompt: string) => void;
  userName?: string;
}) {
  // Demo connect-state for the welcome panel (which sources are linked).
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const connectedValue = CONNECT_STEPS.filter((c) => connected[c.id]).reduce((s, c) => s + c.valueK, 0);
  const crmConnected = !!connected.crm;

  // The guided tour scripts the connect-state so the pipeline meter visibly
  // climbs as each source is "switched on" — the payoff the tour copy promises.
  useEffect(() => {
    const onTourConnect = (e: Event) => {
      const ids = (e as CustomEvent<{ ids: string[] }>).detail?.ids ?? [];
      setConnected(Object.fromEntries(ids.map((id) => [id, true])));
    };
    window.addEventListener("vini-tour-connect", onTourConnect as EventListener);
    return () => window.removeEventListener("vini-tour-connect", onTourConnect as EventListener);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* One framing block: the hero carries the stage story + CTA. The separate
          continue-onboarding banner was a third framing block restating it. */}
      <OnboardingHero stage={stage} userName={userName} connectedValue={connectedValue} />

      <div id="onboarding-next" className="flex flex-col gap-4 scroll-mt-24">
        {stage === "new" && (
          <WelcomePanel
            connected={connected}
            onToggle={(id) => setConnected((m) => ({ ...m, [id]: !m[id] }))}
            crmConnected={crmConnected}
            onAnalyze={() => onStageChange("connecting")}
          />
        )}
        {stage === "connecting" && <ConnectingPanel onContinue={() => onStageChange("analyzing")} />}
        {stage === "analyzing" && <AnalyzingPanel onDone={() => onStageChange("ready")} />}
        {stage === "ready" && (
          <OpportunitiesPanel
            onDraft={(prompt) => (onDraftCampaign ? onDraftCampaign(prompt) : onNavigate("campaigns"))}
            onChooseExisting={() => onNavigate("campaigns")}
          />
        )}
      </div>
    </div>
  );
}

/* ── Hero (shares ViniDailyBrief's gradient shell) ──────────────────── */

function OnboardingHero({ stage, userName, connectedValue }: { stage: Stage; userName: string; connectedValue: number }) {
  const copy: Record<Stage, { h: string; s: string }> = {
    new: { h: `Connect your data, ${userName}`, s: `~$${TOTAL_PIPELINE_K}K of pipeline sits across your systems today.` },
    connecting: { h: "Syncing your systems…", s: "Resolving your rows into one record per customer." },
    analyzing: { h: "Reading your data…", s: "" },
    ready: { h: `${OPPORTUNITIES.length} campaign opportunities worth ~$${Math.round(OPPORTUNITY_TOTAL_K)}K`, s: "All from your own data." },
    active: { h: "", s: "" },
  };
  const c = copy[stage];
  const progress: { label: string; value: string }[] =
    stage === "new"
      ? [{ label: "Sources live", value: "0 / 5" }, { label: "Customers resolved", value: "—" }, { label: "Vehicles seeded", value: "—" }, { label: "Campaigns ready", value: "—" }]
      : stage === "connecting"
        ? [{ label: "Sources live", value: "3 / 5" }, { label: "Customers resolved", value: "14,820" }, { label: "Vehicles seeded", value: "9,100" }, { label: "Campaigns ready", value: "2" }]
        : stage === "analyzing"
          ? [{ label: "Sources live", value: "3 / 5" }, { label: "Customers resolved", value: "14,820" }, { label: "Vehicles seeded", value: "9,100" }, { label: "Opportunities", value: "scanning…" }]
          : [{ label: "Sources live", value: "5 / 5" }, { label: "Customers resolved", value: "14,820" }, { label: "Vehicles seeded", value: "9,100" }, { label: "Campaigns ready", value: `${OPPORTUNITIES.length}` }];

  return (
    <section data-tour="hero" className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 42%, #4600F2 100%)" }}>
      <div className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #22d3ee 0%, transparent 70%)" }} />
      <div className="relative">
        <div className="mb-1 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/15"><Sparkles size={13} /></span>
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#a5b4fc]">VINI · Getting started</span>
        </div>
        <h1 className="max-w-3xl text-[20px] font-bold leading-tight tracking-tight">{c.h}</h1>
        {c.s && <p className="mt-1 max-w-3xl text-[12.5px] leading-snug text-white/70">{c.s}</p>}

        {stage === "new" && (
          <div data-tour="value-bar" className="mt-3 max-w-md">
            <div className="flex items-center justify-between text-[11px] text-white/70">
              <span>Pipeline unlocked</span>
              <span className="font-bold text-white">$<CountUp value={connectedValue} />K <span className="font-normal text-white/50">of ${TOTAL_PIPELINE_K}K</span></span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-[#22d3ee] to-[#34d399] transition-all duration-500" style={{ width: `${Math.round((connectedValue / TOTAL_PIPELINE_K) * 100)}%` }} />
            </div>
          </div>
        )}

        <div className="mt-3.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {progress.map((p) => (
            <div key={p.label} className="rounded-xl bg-white/[0.07] p-2.5 ring-1 ring-white/10">
              <div className="text-[15px] font-bold leading-none tabular-nums">{p.value}</div>
              <div className="mt-1 text-[9.5px] uppercase tracking-wide text-white/55">{p.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Stage 0 · Welcome / Connect ────────────────────────────────────── */

function WelcomePanel({ connected, onToggle, crmConnected, onAnalyze }: { connected: Record<string, boolean>; onToggle: (id: string) => void; crmConnected: boolean; onAnalyze: () => void }) {
  const liveCount = CONNECT_STEPS.filter((c) => connected[c.id]).length;
  return (
    <div data-tour="connect-panel" className="spyne-card p-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-[15px] font-bold" style={{ color: "var(--spyne-text-primary)" }}>Connect your systems</h2>
          <p className="text-[12px]" style={{ color: "var(--spyne-text-muted)" }}>CRM is all VINI needs to start. The rest add more campaigns.</p>
        </div>
        <span className="text-[11px] font-semibold" style={{ color: "var(--spyne-text-secondary)" }}>{liveCount} of {CONNECT_STEPS.length} connected</span>
      </div>

      <div className="flex flex-col gap-2">
        {CONNECT_STEPS.map((step) => (
          <ConnectRow key={step.id} step={step} connected={!!connected[step.id]} onToggle={() => onToggle(step.id)} />
        ))}
      </div>

      <div className="mt-3.5 flex flex-wrap items-center justify-end gap-3 border-t border-spyne-border pt-3">
        {!crmConnected && (
          <p className="min-w-0 flex-1 text-[11.5px]" style={{ color: "var(--spyne-text-muted)" }}>Connect your CRM to continue.</p>
        )}
        <button
          data-tour="analyze-cta"
          onClick={onAnalyze}
          disabled={!crmConnected}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12.5px] font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          style={{ background: "var(--spyne-primary)" }}
        >
          <Sparkles size={14} /> Analyze my data
        </button>
      </div>
    </div>
  );
}

function ConnectRow({ step, connected, onToggle }: { step: ConnectStep; connected: boolean; onToggle: () => void }) {
  const Glyph = GLYPH[step.glyph] ?? Database;
  return (
    <div data-tour={step.id === "crm" ? "connect-crm" : step.id === "dms" ? "connect-dms" : undefined} className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: connected ? "var(--spyne-success-text)" : "var(--spyne-border)", background: connected ? "var(--spyne-success-subtle)" : "var(--spyne-surface)" }}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg" style={{ background: "var(--spyne-primary-soft)", color: "var(--spyne-primary)" }}><Glyph size={17} /></span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--spyne-text-muted)" }}>{step.category}</span>
          <span className="text-[13px] font-bold" style={{ color: "var(--spyne-text-primary)" }}>{step.vendor}</span>
          {step.required && <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase" style={{ background: "var(--spyne-primary-soft)", color: "var(--spyne-primary)" }}>Required</span>}
        </div>
        <p className="text-[11.5px]" style={{ color: "var(--spyne-text-secondary)" }}>{step.blurb}</p>
      </div>
      <span className="hidden shrink-0 text-right sm:block">
        <span className="text-[12.5px] font-bold tabular-nums" style={{ color: "var(--spyne-success-text)" }}>+${step.valueK}K</span>
        <span className="block text-[9px] uppercase tracking-wide" style={{ color: "var(--spyne-text-muted)" }}>pipeline</span>
      </span>
      <button
        onClick={onToggle}
        className="inline-flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-[11.5px] font-semibold transition-colors"
        style={connected ? { background: "var(--spyne-success-subtle)", color: "var(--spyne-success-text)" } : { background: "var(--spyne-primary)", color: "#fff" }}
      >
        {connected ? <><Check size={13} /> Connected</> : <>Connect</>}
      </button>
    </div>
  );
}

/* ── Stage 2 · Connecting ceremony (identity resolve) ───────────────── */

function ConnectingPanel({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div data-tour="sync-status" className="flex items-center gap-2 rounded-xl border border-spyne-border bg-spyne-surface px-4 py-2.5">
        <RefreshCw size={14} className="animate-spin" style={{ color: "var(--spyne-primary)" }} />
        <p className="text-[12px]" style={{ color: "var(--spyne-text-secondary)" }}>
          <strong style={{ color: "var(--spyne-text-primary)" }}>First sync running</strong> — CRM live, DMS backfilling, Service CRM syncing.
        </p>
      </div>
      <div data-tour="identity-card"><IdentityMigrationCard data={identityMigrationData} /></div>
      <EntitySummaryGrid entities={entityHealthData} onOpenIdentity={() => {}} />
      <div className="flex justify-end">
        <button onClick={onContinue} className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12.5px] font-semibold text-white" style={{ background: "var(--spyne-primary)" }}>
          Continue <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

/* ── Stage 3 · Analyzing scan ───────────────────────────────────────── */

function AnalyzingPanel({ onDone }: { onDone: () => void }) {
  const lines = [
    { icon: Users, text: "14,820 customers · 9,100 vehicles read" },
    { icon: TrendingUp, text: "240 equity-positive owners · 92 leases maturing in 60–90 days" },
    { icon: Boxes, text: "1 aging Tahoe matched to in-market shoppers" },
    { icon: Search, text: "34 no-shows to recover" },
  ];
  return (
    <div className="spyne-card spyne-scan-host p-5">
      <span className="spyne-scan-sweep" aria-hidden />
      <div className="mb-3 flex items-center gap-2">
        <span className="relative flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4600F2] opacity-60" /><span className="relative inline-flex h-3 w-3 rounded-full" style={{ background: "var(--spyne-primary)" }} /></span>
        <span className="text-[12px] font-bold uppercase tracking-wide" style={{ color: "var(--spyne-primary)" }}>VINI is analyzing your data</span>
      </div>
      <ul className="flex flex-col gap-2.5">
        {lines.map((l, i) => (
          <li key={i} className="flex items-center gap-2.5 text-[13px]" style={{ color: "var(--spyne-text-secondary)" }}>
            <l.icon size={15} style={{ color: "var(--spyne-primary)" }} /> {l.text}
          </li>
        ))}
      </ul>
      <div data-tour="analyzing-result" className="mt-4 flex flex-wrap items-center gap-3 rounded-xl p-3" style={{ background: "var(--spyne-success-subtle)" }}>
        <CircleCheck size={18} style={{ color: "var(--spyne-success-text)" }} />
        <p className="min-w-0 flex-1 text-[13px] font-semibold" style={{ color: "var(--spyne-text-primary)" }}>
          Found {OPPORTUNITIES.length} opportunities worth ~${Math.round(OPPORTUNITY_TOTAL_K)}K — all from your own data.
        </p>
        <button onClick={onDone} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12.5px] font-semibold text-white" style={{ background: "var(--spyne-primary)" }}>
          See opportunities <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

/* ── Stage 4 · Opportunities (FTUE) ─────────────────────────────────── */

function OpportunitiesPanel({ onDraft, onChooseExisting }: { onDraft: (prompt: string) => void; onChooseExisting: () => void }) {
  // In the demo, Service CRM is "not connected" → its opportunity is a locked teaser.
  const connectedCats = new Set(["CRM", "DMS", "IMS", "Website"]);
  const ready = OPPORTUNITIES.filter((o) => !o.needs || connectedCats.has(o.needs));
  const locked = OPPORTUNITIES.filter((o) => o.needs && !connectedCats.has(o.needs));

  return (
    <div className="flex flex-col gap-3">
      <div data-tour="opps-header"><SectionLabel icon={Rocket} text="Opportunities" hint="ranked by gross at stake" /></div>
      <div className="flex flex-col gap-2.5">
        {ready.map((o, i) => <OpportunityCard key={o.id} o={o} rank={i + 1} dataTour={i === 0 ? "opp-card-1" : undefined} onDraft={() => onDraft(o.prompt)} />)}
        {locked.map((o, i) => <LockedTeaser key={o.id} o={o} dataTour={i === 0 ? "opp-locked" : undefined} />)}
      </div>

      {/* Choose existing */}
      <div data-tour="use-case-card" className="spyne-card flex flex-wrap items-center gap-3 p-3.5">
        <span className="flex size-8 items-center justify-center rounded-lg" style={{ background: "var(--spyne-primary-soft)", color: "var(--spyne-primary)" }}><Layers size={15} /></span>
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-bold" style={{ color: "var(--spyne-text-primary)" }}>Or start from a Use Case template</p>
          <p className="text-[11px]" style={{ color: "var(--spyne-text-muted)" }}>Equity Mining, Lease End, Service-Drive Trade-In.</p>
        </div>
        <button onClick={onChooseExisting} className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-spyne-border px-3 py-1.5 text-[12px] font-semibold" style={{ color: "var(--spyne-primary)" }}>
          Browse templates <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

function OpportunityCard({ o, rank, onDraft, dataTour }: { o: Opportunity; rank: number; onDraft: () => void; dataTour?: string }) {
  return (
    <div data-tour={dataTour} className="spyne-card flex items-start gap-3 p-3.5" style={{ borderLeft: "3px solid var(--spyne-primary)" }}>
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold" style={{ background: "var(--spyne-primary-soft)", color: "var(--spyne-primary)" }}>{rank}</span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13.5px] font-bold" style={{ color: "var(--spyne-text-primary)" }}>{o.title}</span>
          <span className="rounded-full px-2 py-0.5 text-[10.5px] font-bold" style={{ background: "var(--spyne-success-subtle)", color: "var(--spyne-success-text)" }}>~${o.stakeK}K</span>
        </div>
        <p className="mt-1 text-[12px] leading-snug" style={{ color: "var(--spyne-text-secondary)" }}>{o.detail}</p>
        <p className="mt-1 inline-flex items-center gap-1 text-[10.5px]" style={{ color: "var(--spyne-text-muted)" }}><Database size={10} /> from {o.sourceLabel}</p>
      </div>
      <button onClick={onDraft} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-white" style={{ background: "var(--spyne-primary)" }}>
        Draft campaign <ArrowRight size={13} />
      </button>
    </div>
  );
}

function LockedTeaser({ o, dataTour }: { o: Opportunity; dataTour?: string }) {
  return (
    <div data-tour={dataTour} className="flex items-start gap-3 rounded-xl border border-dashed p-3.5" style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-page-bg)" }}>
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--spyne-surface)", color: "var(--spyne-text-muted)" }}><Lock size={12} /></span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-bold" style={{ color: "var(--spyne-text-secondary)" }}>{o.title}</span>
          <span className="rounded-full px-2 py-0.5 text-[10.5px] font-bold" style={{ background: "var(--spyne-surface)", color: "var(--spyne-text-muted)" }}>~${o.stakeK}K locked</span>
        </div>
        <p className="mt-1 text-[11.5px] leading-snug" style={{ color: "var(--spyne-text-muted)" }}>{o.detail}</p>
      </div>
      <span className="inline-flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-[11.5px] font-semibold" style={{ background: "var(--spyne-warning-subtle)", color: "var(--spyne-warning-ink)" }}>
        <Zap size={12} /> Connect {o.needs}
      </span>
    </div>
  );
}

/** Smooth count-up so connecting a source visibly *adds* pipeline (Apple-like). */
function CountUp({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    let raf = 0;
    const start = performance.now();
    const dur = 650;
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className="tabular-nums">{display}</span>;
}

function SectionLabel({ icon: Icon, text, hint }: { icon: any; text: string; hint?: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="inline-flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wide" style={{ color: "var(--spyne-text-secondary)" }}><Icon size={14} style={{ color: "var(--spyne-primary)" }} /> {text}</span>
      {hint && <span className="text-[10.5px]" style={{ color: "var(--spyne-text-muted)" }}>{hint}</span>}
    </div>
  );
}
