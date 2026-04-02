"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Info,
  Users,
  PhoneCall,
  Calendar,
  Handshake,
  DollarSign,
  ChevronDown,
  ChevronUp,
  BarChart2,
  Target,
  CircleCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"

/* ────────────────────────────────────────────────────────────
   TYPES
   ──────────────────────────────────────────────────────────── */

type Period = "month" | "quarter" | "year"

/* ────────────────────────────────────────────────────────────
   MOCK DATA
   ──────────────────────────────────────────────────────────── */

const STATS = {
  month: {
    // Lane 1: Built by Vini
    leadsContacted:      89,
    followupSequences:   47,
    noShowRecoveries:    12,
    appointmentsBooked:  23,
    qualifiedHandoffs:   18,
    potentialGross:      84000,
    potentialGrossCalc: {
      handoffs: 18,
      avgGross:  2400,
      closeRate: "30%",
      source:   "your historical close rate on internet leads",
    },

    // Lane 2: Closed by your team
    handoffsActedOn:       13,
    handoffToApptRate:     "69%",
    showRate:              "67%",
    closeRateActual:       "46%",
    closeRateBenchmark:    "30%",
    realizedGross:         15000,

    // Bridge
    gap: 69000,
  },
}

const SALESPERSON_DATA = [
  { name: "Jordan M.", handoffs: 8, acted: 6, appointments: 4, closed: 3, gross: 7200 },
  { name: "Mike D.",   handoffs: 7, acted: 5, appointments: 4, closed: 2, gross: 4800 },
  { name: "Alex T.",   handoffs: 3, acted: 2, appointments: 1, closed: 1, gross: 3000 },
]

/* ────────────────────────────────────────────────────────────
   SUB-COMPONENTS
   ──────────────────────────────────────────────────────────── */

function MetricCard({
  icon,
  label,
  value,
  sub,
  highlight = false,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  highlight?: boolean
}) {
  return (
    <div
      className="spyne-card p-4"
      style={
        highlight
          ? {
              background: "var(--spyne-brand-subtle)",
              borderColor: "var(--spyne-brand-muted)",
            }
          : {}
      }
    >
      <div
        className="flex items-center justify-center w-8 h-8 rounded-xl mb-3"
        style={{
          background: highlight ? "var(--spyne-brand)" : "var(--secondary)",
          color: highlight ? "var(--spyne-brand-on)" : "var(--spyne-text-secondary)",
        }}
      >
        {icon}
      </div>
      <p
        className="spyne-number mb-0.5"
        style={{
          color: highlight ? "var(--spyne-brand)" : "var(--spyne-text-primary)",
          fontSize: "22px",
        }}
      >
        {value}
      </p>
      <p className="spyne-label" style={{ fontSize: "12px" }}>{label}</p>
      {sub && <p className="spyne-caption mt-0.5">{sub}</p>}
    </div>
  )
}

function BenchmarkRow({
  label,
  actual,
  benchmark,
  format = "percent",
}: {
  label: string
  actual: string
  benchmark: string
  format?: "percent" | "dollar"
}) {
  // Simple comparison — positive if actual > benchmark numerically
  const actualNum    = parseFloat(actual.replace(/[^0-9.]/g, ""))
  const benchmarkNum = parseFloat(benchmark.replace(/[^0-9.]/g, ""))
  const isAbove      = actualNum >= benchmarkNum

  return (
    <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: "var(--spyne-border)" }}>
      <p className="spyne-label" style={{ fontSize: "13px" }}>{label}</p>
      <div className="flex items-center gap-3">
        <span
          className="font-semibold"
          style={{
            fontSize: "13px",
            color: isAbove ? "var(--spyne-success-text)" : "var(--spyne-danger-text)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {actual}
        </span>
        <span className="spyne-caption">vs. {benchmark} benchmark</span>
        {isAbove
          ? <TrendingUp  size={13} style={{ color: "var(--spyne-success-text)" }} />
          : <TrendingDown size={13} style={{ color: "var(--spyne-danger-text)"  }} />
        }
      </div>
    </div>
  )
}

function GrossCalculation({
  handoffs,
  avgGross,
  closeRate,
  source,
  result,
}: {
  handoffs: number
  avgGross: number
  closeRate: string
  source: string
  result: number
}) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: "var(--spyne-border)" }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="spyne-caption mb-1">Potential Gross Generated</p>
            <p
              className="spyne-number"
              style={{ fontSize: "28px", color: "var(--spyne-brand)" }}
            >
              ${result.toLocaleString()}
            </p>
          </div>
          <button
            className="spyne-btn-ghost flex items-center gap-1"
            style={{ height: "30px", fontSize: "11px", color: "var(--spyne-text-muted)" }}
            onClick={() => setOpen((o) => !o)}
          >
            How calculated
            {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {open && (
        <div
          className="px-4 pb-4 border-t pt-3"
          style={{
            borderColor: "var(--spyne-border)",
            background: "var(--secondary)",
          }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="spyne-badge spyne-badge-brand"
              style={{ fontSize: "12px", padding: "4px 10px" }}
            >
              {handoffs} handoffs
            </span>
            <span style={{ color: "var(--spyne-text-muted)", fontSize: "14px" }}>×</span>
            <span
              className="spyne-badge spyne-badge-neutral"
              style={{ fontSize: "12px", padding: "4px 10px" }}
            >
              ${avgGross.toLocaleString()} avg gross/car
            </span>
            <span style={{ color: "var(--spyne-text-muted)", fontSize: "14px" }}>×</span>
            <span
              className="spyne-badge spyne-badge-neutral"
              style={{ fontSize: "12px", padding: "4px 10px" }}
            >
              {closeRate} ({source})
            </span>
          </div>
          <p className="spyne-caption mt-2.5">
            Update your avg gross margin and close rate in{" "}
            <Link
              href="/max-2/settings"
              style={{ color: "var(--spyne-brand)", textDecoration: "underline" }}
            >
              Settings → Dealership Profile
            </Link>
            {" "}for a more accurate number.
          </p>
        </div>
      )}
    </div>
  )
}

function GapVisualization({
  potential,
  realized,
}: {
  potential: number
  realized: number
}) {
  const pct = Math.round((realized / potential) * 100)

  return (
    <div
      className="rounded-xl border p-4"
      style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-surface)" }}
    >
      <p className="spyne-subheading mb-4">The Gap</p>

      {/* Progress bar */}
      <div className="relative mb-4">
        <div
          className="h-3 rounded-full overflow-hidden"
          style={{ background: "var(--spyne-danger-subtle)", border: "1px solid var(--spyne-danger-muted)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: "var(--spyne-success)",
            }}
          />
        </div>
        <div
          className="flex items-center justify-between mt-1.5"
          style={{ fontSize: "11px" }}
        >
          <span style={{ color: "var(--spyne-success-text)", fontWeight: 600 }}>
            ${realized.toLocaleString()} realized ({pct}%)
          </span>
          <span style={{ color: "var(--spyne-danger-text)", fontWeight: 600 }}>
            ${(potential - realized).toLocaleString()} gap ({100 - pct}%)
          </span>
        </div>
      </div>

      {/* Narrative */}
      <div
        className="rounded-xl p-3.5"
        style={{
          background: "var(--spyne-brand-subtle)",
          border: "1px solid var(--spyne-brand-muted)",
        }}
      >
        <p style={{ fontSize: "13px", lineHeight: 1.55, color: "var(--spyne-text-primary)" }}>
          Vini delivered <strong>18 qualified handoffs</strong> this month.
          Your team acted on <strong>13</strong> — 9 became appointments, 6 closed.
          That's <strong>${realized.toLocaleString()} in realized gross</strong>
          {" "}and another{" "}
          <strong style={{ color: "var(--spyne-warning-text)" }}>
            ${(potential - realized).toLocaleString()} sitting in the gap.
          </strong>
        </p>
      </div>

      <p
        className="spyne-caption mt-2.5"
        style={{ color: "var(--spyne-text-muted)" }}
      >
        Large gap: coaching conversation with your team. Small gap: expansion conversation with Spyne.
      </p>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   PAGE
   ──────────────────────────────────────────────────────────── */

export default function OverviewPage() {
  const [period, setPeriod] = useState<Period>("month")
  const s = STATS[period] ?? STATS.month

  return (
    <div className="min-h-full" style={{ background: "var(--spyne-bg)" }}>

      {/* ── Page header ──────────────────────────────────────── */}
      <div
        className="px-4 md:px-6 pt-5 pb-3 sticky top-0 md:top-[49px] z-10 border-b"
        style={{
          background: "var(--spyne-bg)",
          borderColor: "var(--spyne-border)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h1 className="spyne-title">Overview</h1>
        </div>

        {/* Period filter */}
        <div className="flex items-center gap-2">
          {(["month", "quarter", "year"] as Period[]).map((p) => (
            <button
              key={p}
              className={cn("spyne-pill", period === p && "spyne-pill-active")}
              onClick={() => setPeriod(p)}
            >
              {p === "month" ? "This Month" : p === "quarter" ? "This Quarter" : "This Year"}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 md:px-6 py-5 md:py-6 space-y-5">

        {/* ── Header block — plain-language agent summary ─────── */}
        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--spyne-brand-subtle)",
            border: "1px solid var(--spyne-brand-muted)",
            borderLeft: "4px solid var(--spyne-brand)",
          }}
        >
          <div className="flex items-start gap-2 mb-2">
            <Sparkles size={15} style={{ color: "var(--spyne-brand)", marginTop: "1px", flexShrink: 0 }} />
            <p className="spyne-subheading" style={{ color: "var(--spyne-brand)" }}>
              What Vini did automatically this month
            </p>
          </div>
          <p style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--spyne-text-primary)" }}>
            Vini automatically handled <strong>{s.followupSequences} follow-up sequences</strong>,{" "}
            <strong>{s.noShowRecoveries} no-show recovery journeys</strong>, and{" "}
            <strong>{s.leadsContacted} outbound attempts</strong> — so your team only had to focus
            on <strong>{s.qualifiedHandoffs} qualified leads</strong>.
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════
            TWO-LANE SIDE-BY-SIDE (desktop) / STACKED (mobile)
            ══════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 items-start">

          {/* ── LANE 1: BUILT BY VINI ─────────────────────────── */}
          <div
            className="rounded-2xl border p-4 md:p-5 space-y-4"
            style={{ background: "var(--spyne-surface)", borderColor: "var(--spyne-border)" }}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} style={{ color: "var(--spyne-brand)" }} />
                <p className="spyne-title" style={{ fontSize: "16px" }}>Built by Vini</p>
                <span className="spyne-badge spyne-badge-brand">Agent activity</span>
              </div>
              <p className="spyne-body-sm">
                Everything here happened automatically — this is Spyne's performance.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link href="/max-2/sales/conversations" style={{ textDecoration: "none" }}>
                <MetricCard icon={<Users size={15} />} label="Leads contacted" value={s.leadsContacted} sub="Speed-to-lead + outreach" />
              </Link>
              <Link href="/max-2/sales/conversations" style={{ textDecoration: "none" }}>
                <MetricCard icon={<PhoneCall size={15} />} label="Follow-up sequences" value={s.followupSequences} sub="Team didn't lift a finger" />
              </Link>
              <Link href="/max-2/sales/conversations" style={{ textDecoration: "none" }}>
                <MetricCard icon={<BarChart2 size={15} />} label="No-show recoveries" value={s.noShowRecoveries} sub="Booked without salesperson" />
              </Link>
              <Link href="/max-2/sales/appointments" style={{ textDecoration: "none" }}>
                <MetricCard icon={<Calendar size={15} />} label="Appointments booked" value={s.appointmentsBooked} sub="Agent-to-calendar direct" />
              </Link>
            </div>

            {/* Bridge metric */}
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 border"
              style={{
                background: "var(--spyne-brand-subtle)",
                borderColor: "var(--spyne-brand-muted)",
              }}
            >
              <ArrowRight size={13} style={{ color: "var(--spyne-brand)", flexShrink: 0 }} />
              <p style={{ fontSize: "13px", color: "var(--spyne-text-primary)", fontWeight: 500 }}>
                <strong style={{ color: "var(--spyne-brand)" }}>{s.qualifiedHandoffs} qualified handoffs</strong> delivered to your team
              </p>
            </div>

            {/* Potential Gross */}
            <GrossCalculation
              handoffs={s.potentialGrossCalc.handoffs}
              avgGross={s.potentialGrossCalc.avgGross}
              closeRate={s.potentialGrossCalc.closeRate}
              source={s.potentialGrossCalc.source}
              result={s.potentialGross}
            />
          </div>

          {/* ── LANE 2: CLOSED BY YOUR TEAM ──────────────────── */}
          <div
            className="rounded-2xl border p-4 md:p-5 space-y-4"
            style={{ background: "var(--spyne-surface)", borderColor: "var(--spyne-border)" }}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users size={14} style={{ color: "var(--spyne-text-secondary)" }} />
                <p className="spyne-title" style={{ fontSize: "16px" }}>Closed by your team</p>
                <span className="spyne-badge spyne-badge-neutral">Sales performance</span>
              </div>
              <p className="spyne-body-sm">
                What your team did with the leads Vini delivered. Use this for coaching.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MetricCard icon={<CircleCheck size={15} />} label="Handoffs acted on" value={`${s.handoffsActedOn} / ${s.qualifiedHandoffs}`} sub="Of leads delivered" />
              <MetricCard icon={<Calendar size={15} />} label="Handoff → Appt" value={s.handoffToApptRate} sub="Of acted-on leads" />
              <Link href="/max-2/sales/appointments" style={{ textDecoration: "none" }}>
                <MetricCard icon={<Users size={15} />} label="Show rate" value={s.showRate} sub="Of booked appointments" />
              </Link>
              <MetricCard icon={<DollarSign size={15} />} label="Close rate" value={s.closeRateActual} sub={`vs. ${s.closeRateBenchmark} benchmark`} />
            </div>

            {/* Realized gross */}
            <div
              className="flex items-center justify-between rounded-xl px-4 py-3 border"
              style={{ background: "var(--spyne-success-subtle)", borderColor: "var(--spyne-success-muted)" }}
            >
              <p style={{ fontSize: "13px", color: "var(--spyne-success-text)", fontWeight: 500 }}>Realized Gross</p>
              <p style={{ fontSize: "20px", fontWeight: 700, color: "var(--spyne-success-text)", fontVariantNumeric: "tabular-nums" }}>
                ${s.realizedGross.toLocaleString()}
              </p>
            </div>

            {/* Salesperson breakdown */}
            <div className="spyne-card overflow-hidden">
              <div className="px-4 py-2.5 border-b" style={{ borderColor: "var(--spyne-border)" }}>
                <p className="spyne-subheading">By Salesperson</p>
              </div>
              <div className="divide-y" style={{ borderColor: "var(--spyne-border)" }}>
                {SALESPERSON_DATA.map((sp) => (
                  <div key={sp.name} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0 font-bold"
                        style={{ background: "var(--spyne-brand-subtle)", color: "var(--spyne-brand)", fontSize: "10px" }}
                      >
                        {sp.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--spyne-text-primary)" }}>{sp.name}</p>
                        <p className="spyne-caption">{sp.acted}/{sp.handoffs} acted · {sp.closed} closed</p>
                      </div>
                    </div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--spyne-text-primary)", fontVariantNumeric: "tabular-nums" }}>
                      ${sp.gross.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── The Gap — full width below ────────────────────────── */}
        <GapVisualization
          potential={s.potentialGross}
          realized={s.realizedGross}
        />

        <div className="h-4" />
      </div>
    </div>
  )
}
