"use client";

/**
 * CampaignReportingTab — a campaign-scoped reporting dashboard modeled on the
 * Spyne /reports surface. Everything here is DETERMINISTIC: KPIs, funnel,
 * quality, recovery, and data-health are all seeded off a hash of campaign.id
 * (via hashInt) and the campaign's own runtime fields, so charts/scores never
 * jitter between renders. No clock-based or random values appear in the output.
 */

import { useMemo, useState, type ReactNode } from "react";
import {
  DollarSign,
  TrendingUp,
  CalendarCheck,
  Handshake,
  Receipt,
  Smile,
  PhoneCall,
  PhoneOff,
  Clock,
  MicOff,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { SectionLabel, StatTile, SEVERITY } from "../shared";
import { type Campaign, type FunnelStage } from "./CampaignDetailView";

/* ── Deterministic hash (local copy to avoid a circular import with
 *    CampaignDetailView; same FNV-style fold). ───────────────────── */
function hashInt(s: string, mod: number, base = 0): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return base + (h % mod);
}

/* ── Period control ─────────────────────────────────────────────── */

const PERIODS = [
  { id: "today", label: "Today" },
  { id: "7d", label: "7d" },
  { id: "14d", label: "14d" },
  { id: "30d", label: "30d" },
] as const;
type PeriodId = (typeof PERIODS)[number]["id"];

/** Deterministic per-period scale — counts/revenue grow with the window so the
 *  numbers visibly change when the user switches Today/7d/14d/30d. */
const PERIOD_SCALE: Record<PeriodId, number> = {
  today: 0.04,
  "7d": 0.25,
  "14d": 0.5,
  "30d": 1.0,
};

/* ── Money formatting ───────────────────────────────────────────── */

function usd(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}
function usdK(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return `$${k >= 100 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, "")}K`;
  }
  return usd(n);
}

/* ── Derived, seeded reporting model ────────────────────────────── */

interface ReportModel {
  // bottom line
  attributedRevenue: number;
  roi: number;
  costToRun: number;
  netValueAdded: number;
  netDeltaPct: number;
  appointments: number;
  deals: number;
  avgDealValue: number;
  // funnel
  funnel: { label: string; count: number; conv: number }[];
  // quality & compliance
  csat: number;
  positiveSentiment: number;
  connectRate: number;
  silentHourViolations: number;
  // money on the table
  recovery: { label: string; amount: number; glyph: ReactNode }[];
  // data health
  dataHealth: { label: string; pct: number }[];
}

function buildReport(campaign: Campaign, period: PeriodId): ReportModel {
  const id = campaign.id || "campaign";
  const scale = PERIOD_SCALE[period];
  // Scale the audience base by the selected window; everything downstream
  // (funnel ramp, deals, revenue, appointments) flows from these scaled counts.
  const enrolled = Math.max(Math.round(Math.max(campaign.leadsEnrolled || 0, 1) * scale), 1);
  const appts = Math.round((campaign.appointmentsBooked || 0) * scale);
  const responseRate = campaign.responseRate || 0;

  // Avg deal value — front+back gross, seeded $2,650–$3,650.
  const avgDealValue = hashInt(id + "gross", 1000, 2650);

  // Cost to run — per-lead AI touch cost, seeded $1.10–$1.95.
  const perLeadCents = hashInt(id + "cost", 86, 110); // 110–195¢
  const costToRun = (enrolled * perLeadCents) / 100;

  // ── Pipeline funnel ──
  // Reference ramp: outreach → conversations(28%) → qualified(50%) →
  // appointments(51%) → showed(75%) → deals(78%). conv = stage-over-stage.
  let funnel: { label: string; count: number; conv: number }[];
  if (campaign.funnel && campaign.funnel.length > 0) {
    funnel = mapExistingFunnel(campaign.funnel, scale);
  } else {
    const RAMP = [
      { label: "Outreach", conv: 100 },
      { label: "Conversations", conv: 28 },
      { label: "Qualified", conv: 50 },
      { label: "Appointments", conv: 51 },
      { label: "Showed", conv: 75 },
      { label: "Deals", conv: 78 },
    ];
    let count = enrolled;
    funnel = RAMP.map((s, i) => {
      if (i > 0) count = Math.round(count * (s.conv / 100));
      return { label: s.label, count, conv: s.conv };
    });
  }

  // Deals/ROs — SINGLE SOURCE: the funnel's terminal stage, so the bottom-line
  // KPI and the funnel never disagree.
  const deals = Math.max(1, funnel[funnel.length - 1]?.count ?? 1);
  const attributedRevenue = deals * avgDealValue;

  const roi = costToRun > 0 ? attributedRevenue / costToRun : 0;
  const netValueAdded = attributedRevenue - costToRun;
  // vs-prior delta, seeded +4–+27%.
  const netDeltaPct = hashInt(id + "delta", 24, 4);

  // ── Quality & compliance (seeded) ──
  const csat = (hashInt(id + "csat", 11, 43) / 10); // 4.3–5.3 → clamp to 5
  const positiveSentiment = hashInt(id + "sent", 16, 78); // 78–93%
  const connectRate = Math.min(96, Math.max(responseRate, hashInt(id + "conn", 24, 58))); // 58–96%

  // ── Money on the table (recovery opportunities, seeded) ──
  const missedCallbacks = hashInt(id + "miss", 9, 6) * Math.round(avgDealValue * 0.18);
  const lowShowWindows = hashInt(id + "low", 7, 4) * Math.round(avgDealValue * 0.22);
  const afterHours = hashInt(id + "ah", 8, 5) * Math.round(avgDealValue * 0.14);
  const badData = hashInt(id + "bad", 6, 3) * Math.round(avgDealValue * 0.16);
  const recovery = [
    { label: "Missed callbacks", amount: missedCallbacks, glyph: <PhoneOff size={13} /> },
    { label: "Low show-rate windows", amount: lowShowWindows, glyph: <CalendarCheck size={13} /> },
    { label: "After-hours gaps", amount: afterHours, glyph: <Clock size={13} /> },
    { label: "Bad data / wrong numbers", amount: badData, glyph: <AlertTriangle size={13} /> },
  ];

  // ── Data health (seeded coverage) ──
  const dataHealth = [
    { label: "Phone on file", pct: hashInt(id + "ph", 8, 91), glyph: "phone" },
    { label: "Email on file", pct: hashInt(id + "em", 14, 80), glyph: "mail" },
    { label: "Vehicle linked", pct: hashInt(id + "veh", 12, 84), glyph: "car" },
    { label: "Equity computed", pct: hashInt(id + "eq", 22, 66), glyph: "equity" },
    { label: "Opt-in known", pct: hashInt(id + "opt", 10, 88), glyph: "optin" },
  ].map(({ label, pct }) => ({ label, pct: Math.min(99, pct) }));

  return {
    attributedRevenue,
    roi,
    costToRun,
    netValueAdded,
    netDeltaPct,
    appointments: appts,
    deals,
    avgDealValue,
    funnel,
    csat: Math.min(5, csat),
    positiveSentiment,
    connectRate,
    silentHourViolations: 0,
    recovery,
    dataHealth,
  };
}

/** Recast the campaign's stored funnel into label/count/stage-over-stage conv,
 *  scaling counts by the selected period so the control isn't a no-op here. */
function mapExistingFunnel(stages: FunnelStage[], scale: number): { label: string; count: number; conv: number }[] {
  return stages.map((s, i) => {
    const prev = stages[i - 1];
    // conv is a ratio between adjacent stages, so it's scale-invariant.
    const conv = i === 0 ? 100 : prev && prev.count > 0 ? Math.round((s.count / prev.count) * 100) : 0;
    return { label: s.label, count: Math.round(s.count * scale), conv };
  });
}

/* ── Component ──────────────────────────────────────────────────── */

export default function CampaignReportingTab({ campaign }: { campaign: Campaign }) {
  const [period, setPeriod] = useState<PeriodId>("30d");
  const m = useMemo(() => buildReport(campaign, period), [campaign, period]);

  return (
    <div className="space-y-5 spyne-animate-fade-in">
      {/* Header row — eyebrow + period segmented control */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <SectionLabel glyph="monitoring" text="Reporting" chip />
        <PeriodControl value={period} onChange={setPeriod} />
      </div>

      {/* ── BOTTOM LINE ── */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <BottomLineCard
            glyph={<DollarSign size={14} />}
            label="Attributed revenue"
            value={usdK(m.attributedRevenue)}
            sub={`${m.roi.toFixed(1)}× ROI`}
            subTone="brand"
            tone="brand"
          />
          <BottomLineCard
            glyph={<TrendingUp size={14} />}
            label="Net value added"
            value={usdK(m.netValueAdded)}
            sub={`+${m.netDeltaPct}% vs prior`}
            subTone="success"
          />
          <BottomLineCard
            glyph={<CalendarCheck size={14} />}
            label="Appointments"
            value={m.appointments.toLocaleString()}
            sub="booked"
          />
          <BottomLineCard
            glyph={<Handshake size={14} />}
            label="Deals / ROs"
            value={m.deals.toLocaleString()}
            sub={`${usdK(m.avgDealValue)} avg`}
          />
          <BottomLineCard
            glyph={<Receipt size={14} />}
            label="Cost to run"
            value={usd(m.costToRun)}
            sub={`${usdK(m.attributedRevenue - m.costToRun)} net`}
          />
        </div>
      </section>

      {/* ── PIPELINE FUNNEL + QUALITY ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_1fr] gap-4">
        <PipelineFunnel funnel={m.funnel} />
        <QualityCard m={m} />
      </div>

      {/* ── MONEY ON THE TABLE + DATA HEALTH ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4">
        <MoneyOnTheTable recovery={m.recovery} />
        <DataHealthCard items={m.dataHealth} />
      </div>
    </div>
  );
}

/* ── Period segmented control ───────────────────────────────────── */

function PeriodControl({ value, onChange }: { value: PeriodId; onChange: (p: PeriodId) => void }) {
  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-lg border p-0.5"
      style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-surface-hover)" }}
      role="tablist"
      aria-label="Reporting time period"
    >
      {PERIODS.map((p) => {
        const active = p.id === value;
        return (
          <button
            key={p.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(p.id)}
            className="spyne-focus-ring rounded-md px-2.5 py-1 text-[11.5px] font-semibold transition-colors cursor-pointer"
            style={
              active
                ? { background: "var(--spyne-surface)", color: "var(--spyne-primary)", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }
                : { color: "var(--spyne-text-muted)", background: "transparent" }
            }
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Bottom-line KPI card ───────────────────────────────────────── */

function BottomLineCard({
  glyph,
  label,
  value,
  sub,
  tone = "default",
  subTone = "muted",
}: {
  glyph: ReactNode;
  label: string;
  value: string;
  sub: string;
  tone?: "default" | "brand";
  subTone?: "muted" | "success" | "brand";
}) {
  const valueColor = tone === "brand" ? "var(--spyne-primary)" : "var(--spyne-text-primary)";
  const subColor =
    subTone === "success" ? SEVERITY.success.ink : subTone === "brand" ? "var(--spyne-primary)" : "var(--spyne-text-muted)";
  return (
    <div className="spyne-card px-4 py-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--spyne-text-muted)" }}>
          {label}
        </p>
        <span style={{ color: "var(--spyne-text-muted)" }}>{glyph}</span>
      </div>
      <p className="mt-1.5 text-[24px] font-bold leading-none tabular-nums" style={{ color: valueColor }}>
        {value}
      </p>
      <p className="mt-1.5 text-[11px] font-semibold tabular-nums" style={{ color: subColor }}>
        {sub}
      </p>
    </div>
  );
}

/* ── Pipeline funnel ────────────────────────────────────────────── */

function PipelineFunnel({ funnel }: { funnel: { label: string; count: number; conv: number }[] }) {
  const top = funnel[0]?.count || 1;
  return (
    <div className="spyne-card p-4">
      <SectionLabel glyph="filter_alt" text="Pipeline funnel" className="mb-3" />
      <div className="flex flex-col gap-2">
        {funnel.map((stage, i) => {
          // brand ramp: deepen the fill as the stage gets later/narrower.
          const widthPct = Math.max(6, Math.round((stage.count / top) * 100));
          const tint = 100 - i * 9; // 100 → ramps darker
          return (
            <div key={stage.label} className="flex items-center gap-3">
              <span
                className="w-28 shrink-0 text-[11.5px] font-semibold truncate"
                style={{ color: "var(--spyne-text-secondary)" }}
              >
                {stage.label}
              </span>
              <div className="flex-1 h-7 rounded-lg overflow-hidden relative" style={{ background: "var(--spyne-page-bg)" }}>
                <div
                  className="h-full flex items-center justify-end pr-2 transition-[width] duration-[350ms] ease-[cubic-bezier(0,0,0.2,1)]"
                  style={{
                    width: `${widthPct}%`,
                    background:
                      i === 0
                        ? "var(--spyne-primary)"
                        : `color-mix(in srgb, var(--spyne-primary) ${tint}%, var(--spyne-primary-hover))`,
                  }}
                >
                  <span className="text-[11px] font-bold text-white tabular-nums">{stage.count.toLocaleString()}</span>
                </div>
              </div>
              <span
                className="w-14 text-right text-[11px] font-semibold tabular-nums"
                style={{ color: i === 0 ? "var(--spyne-text-muted)" : "var(--spyne-text-secondary)" }}
              >
                {i === 0 ? "—" : `${stage.conv}%`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Quality & compliance ───────────────────────────────────────── */

function QualityCard({ m }: { m: ReportModel }) {
  return (
    <div className="spyne-card p-4">
      <SectionLabel glyph="verified" text="Quality & compliance" className="mb-3" />
      <div className="grid grid-cols-2 gap-2.5">
        <QualityStat glyph={<Smile size={13} />} value={`${m.csat.toFixed(1)}/5`} label="CSAT" tone="success" />
        <QualityStat glyph={<TrendingUp size={13} />} value={`${m.positiveSentiment}%`} label="Positive sentiment" tone="success" />
        <QualityStat glyph={<PhoneCall size={13} />} value={`${m.connectRate}%`} label="Connect / answer rate" tone="neutral" />
        <QualityStat glyph={<MicOff size={13} />} value={`${m.silentHourViolations}`} label="Silent-hours violations" tone="success" />
      </div>
      <div className="mt-3 flex flex-col gap-2 rounded-lg p-2.5" style={{ background: "var(--spyne-page-bg)" }}>
        <ComplianceRow label="DNC coverage" value="100%" />
        <ComplianceRow label="Recording consent" value="100%" />
      </div>
    </div>
  );
}

function QualityStat({
  glyph,
  value,
  label,
  tone,
}: {
  glyph: ReactNode;
  value: string;
  label: string;
  tone: "success" | "neutral";
}) {
  const ink = tone === "success" ? SEVERITY.success.ink : "var(--spyne-text-primary)";
  const chipBg = tone === "success" ? SEVERITY.success.fill : "var(--spyne-surface-hover)";
  return (
    <div className="rounded-lg p-2.5" style={{ background: "var(--spyne-page-bg)" }}>
      <span
        className="mb-1.5 inline-flex size-6 items-center justify-center rounded-md"
        style={{ background: chipBg, color: ink }}
      >
        {glyph}
      </span>
      <div className="text-[18px] font-bold leading-none tabular-nums" style={{ color: ink }}>
        {value}
      </div>
      <div className="mt-1 text-[9.5px] font-medium uppercase tracking-wide" style={{ color: "var(--spyne-text-muted)" }}>
        {label}
      </div>
    </div>
  );
}

function ComplianceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium" style={{ color: "var(--spyne-text-secondary)" }}>
        <CheckCircle2 size={12} style={{ color: SEVERITY.success.ink }} />
        {label}
      </span>
      <span className="text-[11.5px] font-bold tabular-nums" style={{ color: SEVERITY.success.ink }}>
        {value}
      </span>
    </div>
  );
}

/* ── Money on the table ─────────────────────────────────────────── */

function MoneyOnTheTable({ recovery }: { recovery: ReportModel["recovery"] }) {
  const total = recovery.reduce((s, r) => s + r.amount, 0);
  // Per-row queued state — clicking Recover swaps the button for a success chip.
  const [queued, setQueued] = useState<Record<string, boolean>>({});
  return (
    <div className="spyne-card p-4">
      <SectionLabel
        glyph="savings"
        text="Money on the table"
        hint={`${usdK(total)} recoverable`}
        className="mb-3"
      />
      <div className="flex flex-col gap-1.5">
        {recovery.map((r) => (
          <div
            key={r.label}
            className="flex items-center gap-3 rounded-lg px-3 py-2"
            style={{ background: "var(--spyne-page-bg)" }}
          >
            <span
              className="inline-flex size-7 items-center justify-center rounded-md shrink-0"
              style={{ background: SEVERITY.warning.fill, color: SEVERITY.warning.ink }}
            >
              {r.glyph}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold leading-tight truncate" style={{ color: "var(--spyne-text-primary)" }}>
                {r.label}
              </p>
              <p className="text-[11px] font-bold tabular-nums" style={{ color: SEVERITY.warning.ink }}>
                ~{usdK(r.amount)}
              </p>
            </div>
            {queued[r.label] ? (
              <span
                className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-bold shrink-0"
                style={{ background: SEVERITY.success.fill, color: SEVERITY.success.ink }}
              >
                <CheckCircle2 size={12} />
                Queued ✓
              </span>
            ) : (
              <button
                onClick={() => setQueued((q) => ({ ...q, [r.label]: true }))}
                className="spyne-btn-ghost !h-7 !px-2.5 !text-[11px] shrink-0"
              >
                Recover
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Data health ────────────────────────────────────────────────── */

const DATA_GLYPH: Record<string, string> = {
  "Phone on file": "call",
  "Email on file": "mail",
  "Vehicle linked": "directions_car",
  "Equity computed": "paid",
  "Opt-in known": "verified_user",
};

function DataHealthCard({ items }: { items: { label: string; pct: number }[] }) {
  return (
    <div className="spyne-card p-4">
      <SectionLabel glyph="database" text="Data health" className="mb-3" />
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {items.map((d) => {
          const tone: "success" | "warning" | "default" =
            d.pct >= 85 ? "success" : d.pct >= 70 ? "default" : "warning";
          const barInk =
            tone === "success" ? SEVERITY.success.ink : tone === "warning" ? SEVERITY.warning.ink : "var(--spyne-primary)";
          return (
            <div key={d.label}>
              <StatTile glyph={DATA_GLYPH[d.label] ?? "database"} value={`${d.pct}%`} label={d.label} tone={tone} />
              {/* coverage micro-bar — deterministic width, sits under its tile */}
              <div className="mt-1 h-1 rounded-full overflow-hidden" style={{ background: "var(--spyne-surface-hover)" }}>
                <div className="h-full rounded-full" style={{ width: `${d.pct}%`, background: barInk }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
