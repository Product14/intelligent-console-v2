"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { mockLotVehicles } from "@/lib/max-2-mocks"
import { cn } from "@/lib/utils"

// ─── Types ─────────────────────────────────────────────────────────────────

interface CalcState {
  ytdTotal:    string   // Step 1a — YTD Total Used Expense
  ytdVariable: string   // Step 1b — YTD Variable Expense
  monthlySales:string   // Step 3  — Monthly Sales (units)
  daysOpen:    string   // Step 5  — Days Open per Month
}

const DEFAULTS: CalcState = {
  ytdTotal:     "2500000",
  ytdVariable:  "500000",
  monthlySales: "100",
  daysOpen:     "27",
}

// Dealer-size presets — chosen so each hits a realistic daily rate
const PRESETS = [
  { label: "Small",    ytdTotal: "1200000", ytdVariable: "200000", monthlySales: "60",  daysOpen: "26" },
  { label: "Mid-Size", ytdTotal: "2500000", ytdVariable: "500000", monthlySales: "100", daysOpen: "27" },
  { label: "Large",    ytdTotal: "5500000", ytdVariable: "1500000",monthlySales: "220", daysOpen: "27" },
]

const fmt0  = (n: number) => `$${Math.round(n).toLocaleString()}`
const fmt2  = (n: number) => `$${n.toFixed(2)}`
const fmtN  = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 1 })

// Active lot vehicles (frontline + wholesale only)
const ACTIVE = mockLotVehicles.filter(
  (v) => v.lotStatus === "frontline" || v.lotStatus === "wholesale-candidate",
)

// ─── Component ─────────────────────────────────────────────────────────────

export function HoldingCostCalculator({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [s, setS] = React.useState<CalcState>(DEFAULTS)
  const upd = (k: keyof CalcState, v: string) => setS((p) => ({ ...p, [k]: v }))

  // ── 5-Step Formula ────────────────────────────────────────────────────
  const ytdTotal    = parseFloat(s.ytdTotal)    || 0
  const ytdVariable = parseFloat(s.ytdVariable) || 0
  const monthlySales= parseFloat(s.monthlySales)|| 0
  const daysOpen    = Math.max(parseFloat(s.daysOpen) || 1, 1)

  const step1_fixedCost       = ytdTotal - ytdVariable                   // Step 1
  const step2_monthlyFixed    = step1_fixedCost / 12                     // Step 2
  const step3_avgUnits        = monthlySales * 1.33                      // Step 3
  const step4_costPerUnitMonth= step3_avgUnits > 0
    ? step2_monthlyFixed / step3_avgUnits : 0                            // Step 4
  const step5_dailyHoldingCost= step4_costPerUnitMonth / daysOpen        // Step 5

  // ── Active Inventory Impact ───────────────────────────────────────────
  const totalAccumulated = ACTIVE.reduce(
    (sum, v) => sum + step5_dailyHoldingCost * v.daysInStock, 0,
  )
  const dailyBurn = ACTIVE.length * step5_dailyHoldingCost

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[90vw] max-w-5xl p-0 gap-0 rounded-2xl flex flex-col overflow-hidden"
        style={{ height: "88vh" }}
      >
        {/* ── Header ── */}
        <div className="shrink-0 border-b bg-white">
          <DialogHeader className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-violet-100 p-2 text-violet-600 shrink-0">
                <CalcSVG />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">
                  Holding Cost Calculator
                </DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  Industry-standard 5-step formula used by Used Car Managers
                </DialogDescription>
              </div>
            </div>

            {/* Dealer-size presets */}
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Dealer Size
              </span>
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setS(p)}
                  className="rounded-full border px-3 py-0.5 text-xs font-medium hover:bg-muted transition-colors"
                >
                  {p.label}
                </button>
              ))}
              <button
                onClick={() => setS(DEFAULTS)}
                className="rounded-full border px-3 py-0.5 text-xs text-muted-foreground hover:bg-muted transition-colors"
              >
                Reset
              </button>
            </div>
          </DialogHeader>
        </div>

        {/* ── Body: 2-column grid ── */}
        <div
          className="flex-1 min-h-0 overflow-hidden"
          style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 340px" }}
        >
          {/* LEFT — 5-Step Inputs ── */}
          <div className="overflow-y-auto border-r p-6 space-y-1">

            {/* Formula header */}
            <div className="rounded-xl bg-violet-50 border border-violet-200 px-4 py-3 mb-5">
              <p className="text-xs font-semibold text-violet-800 mb-1">
                5-Step Holding Cost Formula
              </p>
              <p className="text-[11px] text-violet-700 leading-relaxed font-mono">
                (YTD Fixed ÷ 12) ÷ (Monthly Sales × 1.33) ÷ Days Open
              </p>
            </div>

            {/* Step 1 */}
            <Step n={1} title="Determine Annual Fixed Cost">
              <div className="grid grid-cols-2 gap-3">
                <Field label="YTD Total Used Expense" hint="All dept. expenses year-to-date">
                  <Inp prefix="$" value={s.ytdTotal}    set={(v) => upd("ytdTotal", v)}    placeholder="2,500,000" />
                </Field>
                <Field label="YTD Variable Expense" hint="Commissions, recon, variable costs">
                  <Inp prefix="$" value={s.ytdVariable} set={(v) => upd("ytdVariable", v)} placeholder="500,000" />
                </Field>
              </div>
              <Result
                formula="YTD Total − YTD Variable"
                value={fmt0(step1_fixedCost)}
                label="Annual Fixed Cost"
                ok={step1_fixedCost > 0}
              />
            </Step>

            <StepDivider />

            {/* Step 2 */}
            <Step n={2} title="Monthly Fixed Cost">
              <Result
                formula="Fixed Cost ÷ 12"
                value={fmt0(step2_monthlyFixed)}
                label="Monthly Fixed Cost"
                ok={step2_monthlyFixed > 0}
                auto
              />
            </Step>

            <StepDivider />

            {/* Step 3 */}
            <Step n={3} title="Average Units in Stock">
              <Field label="Monthly Sales (units)" hint="Average units sold per month">
                <Inp suffix="units / mo" value={s.monthlySales} set={(v) => upd("monthlySales", v)} placeholder="100" />
              </Field>
              <Result
                formula="Monthly Sales × 1.33"
                value={fmtN(step3_avgUnits)}
                label="Avg Units in Stock"
                ok={step3_avgUnits > 0}
              />
            </Step>

            <StepDivider />

            {/* Step 4 */}
            <Step n={4} title="Cost Per Unit / Month">
              <Result
                formula="Monthly Fixed ÷ Avg Units in Stock"
                value={fmt0(step4_costPerUnitMonth)}
                label="Cost Per Unit / Month"
                ok={step4_costPerUnitMonth > 0}
                auto
              />
            </Step>

            <StepDivider />

            {/* Step 5 */}
            <Step n={5} title="Daily Holding Cost per Car">
              <Field label="Days Open per Month" hint="Typically 26–27 selling days">
                <Inp suffix="days" value={s.daysOpen} set={(v) => upd("daysOpen", v)} placeholder="27" />
              </Field>
              <Result
                formula="Cost Per Unit/Month ÷ Days Open"
                value={fmt2(step5_dailyHoldingCost)}
                label="Daily Holding Cost"
                ok={step5_dailyHoldingCost > 0}
                highlight
              />
            </Step>

          </div>

          {/* RIGHT — Results ── */}
          <div className="overflow-y-auto bg-muted/20 p-5 space-y-4">

            {/* Hero daily rate */}
            <div className="rounded-2xl overflow-hidden border shadow-sm">
              <div
                className="px-5 py-5 text-white text-center"
                style={{ background: "linear-gradient(135deg,#6d28d9 0%,#7c3aed 50%,#9333ea 100%)" }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest opacity-70 mb-1">
                  Daily Holding Cost per Car
                </p>
                <p className="text-5xl font-bold tracking-tight tabular-nums">
                  {fmt2(step5_dailyHoldingCost)}
                </p>
                <p className="text-sm opacity-60 mt-1">per vehicle, per day</p>
              </div>
              <div className="grid grid-cols-2 divide-x bg-card">
                <div className="py-3 text-center">
                  <p className="text-lg font-bold tabular-nums">{fmt0(step4_costPerUnitMonth)}</p>
                  <p className="text-[11px] text-muted-foreground">per unit / month</p>
                </div>
                <div className="py-3 text-center">
                  <p className="text-lg font-bold tabular-nums">{fmt0(step5_dailyHoldingCost * 30)}</p>
                  <p className="text-[11px] text-muted-foreground">30-day cost</p>
                </div>
              </div>
            </div>

            {/* Formula recap */}
            <div className="rounded-xl bg-card border shadow-sm p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Formula Recap
              </p>
              <div className="space-y-2">
                {[
                  { step: "1", label: "Annual Fixed Cost",     value: fmt0(step1_fixedCost)         },
                  { step: "2", label: "Monthly Fixed Cost",    value: fmt0(step2_monthlyFixed)       },
                  { step: "3", label: "Avg Units in Stock",    value: fmtN(step3_avgUnits) + " cars" },
                  { step: "4", label: "Cost / Unit / Month",   value: fmt0(step4_costPerUnitMonth)   },
                  { step: "5", label: "Daily Holding Cost",    value: fmt2(step5_dailyHoldingCost), bold: true },
                ].map((row) => (
                  <div
                    key={row.step}
                    className={cn(
                      "flex items-center justify-between text-sm py-1",
                      row.bold ? "border-t pt-2 mt-1" : "",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full bg-violet-100 text-violet-700 text-[9px] font-bold flex items-center justify-center shrink-0">
                        {row.step}
                      </span>
                      <span className={cn("text-muted-foreground", row.bold && "text-foreground font-semibold")}>
                        {row.label}
                      </span>
                    </div>
                    <span className={cn("font-semibold tabular-nums", row.bold && "text-violet-700")}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active inventory impact */}
            <div className="rounded-xl bg-card border shadow-sm p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Active Inventory ({ACTIVE.length} cars)
              </p>

              <div className="space-y-2.5 mb-3">
                <div className="flex justify-between items-baseline text-sm">
                  <span className="text-muted-foreground">Total accumulated cost</span>
                  <span className="font-bold text-red-700 tabular-nums text-base">
                    {fmt0(totalAccumulated)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-sm">
                  <span className="text-muted-foreground">Ongoing daily burn</span>
                  <span className="font-semibold tabular-nums">{fmt0(dailyBurn)}/day</span>
                </div>
                <div className="flex justify-between items-baseline text-sm">
                  <span className="text-muted-foreground">Projected this month</span>
                  <span className="font-semibold tabular-nums">{fmt0(dailyBurn * daysOpen)}/mo</span>
                </div>
              </div>

              {/* Per-vehicle breakdown */}
              <div className="border-t pt-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  Per Vehicle
                </p>
                <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                  {[...ACTIVE]
                    .sort((a, b) => b.daysInStock - a.daysInStock)
                    .map((v) => {
                      const accrued = step5_dailyHoldingCost * v.daysInStock
                      return (
                        <div
                          key={v.vin}
                          className="flex items-center justify-between text-xs py-1 border-b last:border-0"
                        >
                          <div className="min-w-0">
                            <p className="font-medium truncate">
                              {v.year} {v.make} {v.model}
                            </p>
                            <p className="text-muted-foreground">{v.daysInStock}d in stock</p>
                          </div>
                          <span className={cn(
                            "font-semibold tabular-nums shrink-0 ml-2",
                            v.daysInStock >= 45 ? "text-red-600" : v.daysInStock >= 31 ? "text-amber-600" : "text-foreground",
                          )}>
                            {fmt0(accrued)}
                          </span>
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>

            {/* Break-even note */}
            {step5_dailyHoldingCost > 0 && (
              <div className="rounded-xl border-l-[3px] border-l-violet-500 bg-violet-50/80 px-4 py-3.5">
                <p className="text-xs font-semibold text-violet-700 mb-1">Key Takeaway</p>
                <p className="text-sm text-violet-800 leading-relaxed">
                  Every car on your lot costs you{" "}
                  <strong>{fmt2(step5_dailyHoldingCost)}/day</strong>. Your{" "}
                  {ACTIVE.length} active units have already accumulated{" "}
                  <strong>{fmt0(totalAccumulated)}</strong> in holding costs
                  that must be recovered through gross profit.
                </p>
              </div>
            )}

          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="pt-1 pb-3">
      <div className="flex items-center gap-2.5 mb-3">
        <span className="h-6 w-6 rounded-full bg-violet-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
          {n}
        </span>
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <div className="pl-8 space-y-2.5">{children}</div>
    </div>
  )
}

function StepDivider() {
  return (
    <div className="flex items-center gap-2 py-1 pl-2.5">
      <div className="w-[1px] h-4 bg-violet-200 ml-[9px]" />
    </div>
  )
}

function Result({
  formula, value, label, ok, auto, highlight,
}: {
  formula: string
  value: string
  label: string
  ok: boolean
  auto?: boolean
  highlight?: boolean
}) {
  return (
    <div className={cn(
      "rounded-lg border px-3 py-2.5 flex items-center justify-between",
      highlight ? "bg-violet-50 border-violet-200" : "bg-muted/40 border-border",
    )}>
      <div>
        <p className={cn("text-[10px] font-mono text-muted-foreground/70 mb-0.5")}>{formula}</p>
        <p className="text-xs font-medium text-muted-foreground">
          {label}
          {auto && <span className="ml-1.5 text-[9px] bg-muted rounded px-1 py-0.5 text-muted-foreground/60">auto</span>}
        </p>
      </div>
      <p className={cn(
        "text-base font-bold tabular-nums",
        !ok ? "text-muted-foreground/40" : highlight ? "text-violet-700" : "text-foreground",
      )}>
        {ok ? value : "—"}
      </p>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-foreground leading-none mb-0.5">{label}</p>
      {hint && <p className="text-[11px] text-muted-foreground mb-1.5">{hint}</p>}
      {!hint && <div className="mb-1.5" />}
      {children}
    </div>
  )
}

function Inp({
  prefix, suffix, value, set, placeholder, step = "1",
}: {
  prefix?: string; suffix?: string; value: string
  set: (v: string) => void; placeholder?: string; step?: string
}) {
  return (
    <div className="flex items-stretch h-9 rounded-lg border bg-background overflow-hidden focus-within:ring-2 focus-within:ring-violet-400/40 transition-shadow">
      {prefix && (
        <span className="flex items-center px-2.5 text-sm font-medium text-muted-foreground bg-muted/50 border-r shrink-0">
          {prefix}
        </span>
      )}
      <input
        type="number"
        value={value}
        onChange={(e) => set(e.target.value)}
        placeholder={placeholder}
        step={step}
        className="flex-1 min-w-0 px-2.5 text-sm font-medium bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      {suffix && (
        <span className="flex items-center px-2.5 text-xs text-muted-foreground bg-muted/50 border-l shrink-0 whitespace-nowrap">
          {suffix}
        </span>
      )}
    </div>
  )
}

function CalcSVG() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="16" height="20" x="4" y="2" rx="2" />
      <line x1="8" x2="16" y1="6" y2="6" />
      <line x1="16" x2="16" y1="14" y2="18" />
      <path d="M8 14h.01" /><path d="M12 14h.01" />
      <path d="M8 18h.01" /><path d="M12 18h.01" />
    </svg>
  )
}
