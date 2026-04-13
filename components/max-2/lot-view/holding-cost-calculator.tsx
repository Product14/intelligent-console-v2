"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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

// ─── Component ─────────────────────────────────────────────────────────────

export function HoldingCostCalculator({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: () => void
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg p-0 gap-0 rounded-2xl !flex flex-col overflow-hidden max-h-[90vh]">

        {/* ── Header ── */}
        <div className="shrink-0 px-6 pt-6 pb-4">
          <DialogTitle className="text-base font-semibold text-spyne-text">
            Holding Cost Calculator
          </DialogTitle>
          <DialogDescription className="text-xs text-spyne-text-secondary mt-0.5">
            5-step formula used by every US used car manager
          </DialogDescription>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-spyne-border">

          {/* Step 1 */}
          <StepRow n={1} label="Annual Fixed Cost">
            <TooltipInp prefix="$" value={s.ytdTotal} set={(v) => upd("ytdTotal", v)} hint="All dept. expenses year-to-date" />
            <Op>−</Op>
            <TooltipInp prefix="$" value={s.ytdVariable} set={(v) => upd("ytdVariable", v)} hint="Commissions, recon, variable costs" />
            <Eq />
            <Res value={step1_fixedCost > 0 ? fmt0(step1_fixedCost) : "—"} />
          </StepRow>

          {/* Step 2 */}
          <StepRow n={2} label="Monthly Fixed Cost">
            <Comp value={step1_fixedCost > 0 ? fmt0(step1_fixedCost) : "—"} />
            <Op>÷</Op>
            <Const value="12" label="months" />
            <Eq />
            <Res value={step2_monthlyFixed > 0 ? `${fmt0(step2_monthlyFixed)}/mo` : "—"} muted />
          </StepRow>

          {/* Step 3 */}
          <StepRow n={3} label="Avg Units in Stock">
            <TooltipInp suffix="units" value={s.monthlySales} set={(v) => upd("monthlySales", v)} hint="Average units sold per month" />
            <Op>×</Op>
            <Const value="1.33" label="" />
            <Eq />
            <Res value={step3_avgUnits > 0 ? `${fmtN(step3_avgUnits)} units` : "—"} muted />
          </StepRow>

          {/* Step 4 */}
          <StepRow n={4} label="Cost Per Unit / Month">
            <Comp value={step2_monthlyFixed > 0 ? fmt0(step2_monthlyFixed) : "—"} />
            <Op>÷</Op>
            <Comp value={step3_avgUnits > 0 ? fmtN(step3_avgUnits) : "—"} />
            <Eq />
            <Res value={step4_costPerUnitMonth > 0 ? `${fmt0(step4_costPerUnitMonth)}/unit` : "—"} muted />
          </StepRow>

          {/* Step 5 */}
          <StepRow n={5} label="Daily Holding Cost">
            <Comp value={step4_costPerUnitMonth > 0 ? fmt0(step4_costPerUnitMonth) : "—"} />
            <Op>÷</Op>
            <TooltipInp suffix="days" value={s.daysOpen} set={(v) => upd("daysOpen", v)} hint="Typically 26–27 selling days" />
            <Eq />
            <Res value={step5_dailyHoldingCost > 0 ? fmt2(step5_dailyHoldingCost) : "—"} highlight />
          </StepRow>

        </div>

        {/* ── Result footer ── */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-t border-spyne-border">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-spyne-error">
            Daily Holding Cost / Car
          </p>
          <p className="text-xl font-bold tabular-nums text-spyne-error">
            {step5_dailyHoldingCost > 0 ? fmt2(step5_dailyHoldingCost) : "—"}
            <span className="text-sm font-normal text-spyne-error/70 ml-1">/car/day</span>
          </p>
        </div>

        {/* ── Save footer ── */}
        {onSave && (
          <div className="shrink-0 border-t border-spyne-border bg-muted/30 px-6 py-3.5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-spyne-border bg-white px-4 py-2 text-sm font-medium text-spyne-text hover:bg-muted/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={step5_dailyHoldingCost <= 0}
              onClick={() => { onSave(); onOpenChange(false) }}
              className="rounded-lg bg-spyne-primary px-5 py-2 text-sm font-semibold text-white hover:bg-spyne-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save & Apply
            </button>
          </div>
        )}

      </DialogContent>
    </Dialog>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────

function StepRow({ n, label, children }: { n: number; label: string; children: React.ReactNode }) {
  return (
    <div className="px-6 py-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="h-5 w-5 rounded-full bg-spyne-primary/10 text-spyne-primary text-[10px] font-bold flex items-center justify-center shrink-0">
          {n}
        </span>
        <p className="text-xs font-semibold uppercase tracking-wider text-spyne-text-secondary">{label}</p>
      </div>
      <div className="flex items-center gap-2">
        {children}
      </div>
    </div>
  )
}

function TooltipInp({ prefix, suffix, value, set, hint }: {
  prefix?: string; suffix?: string; value: string
  set: (v: string) => void; hint?: string
}) {
  return (
    <TooltipProvider delayDuration={100}>
      <div className="relative flex-1 min-w-0">
        <div className="flex items-stretch h-10 rounded-lg border border-spyne-border bg-white overflow-hidden focus-within:ring-2 focus-within:ring-spyne-primary/30 transition-shadow">
          {prefix && (
            <span className="flex items-center px-2.5 text-sm font-medium text-spyne-text-secondary bg-muted/40 border-r shrink-0">{prefix}</span>
          )}
          <input
            type="number"
            value={value}
            onChange={(e) => set(e.target.value)}
            className="flex-1 min-w-0 px-2.5 text-sm font-medium bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          {suffix && (
            <span className="flex items-center px-2.5 text-xs text-spyne-text-secondary bg-muted/40 border-l shrink-0 whitespace-nowrap">{suffix}</span>
          )}
          {hint && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center px-2 cursor-default shrink-0 text-spyne-text-secondary hover:text-spyne-text transition-colors">
                  <span className="inline-flex items-center justify-center h-3.5 w-3.5 rounded-full border border-current text-[8px] font-bold">i</span>
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[180px] text-xs">{hint}</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}

function Comp({ value }: { value: string }) {
  return (
    <div className="h-10 flex-1 min-w-0 rounded-lg bg-muted/40 border border-spyne-border flex items-center px-3">
      <span className="text-sm tabular-nums text-spyne-text-secondary truncate">{value}</span>
    </div>
  )
}

function Const({ value, label }: { value: string; label: string }) {
  return (
    <div className="h-10 rounded-lg bg-muted/20 border border-spyne-border flex items-center justify-center px-3 shrink-0 gap-1">
      <span className="text-sm font-semibold">{value}</span>
      {label && <span className="text-xs text-spyne-text-secondary">{label}</span>}
    </div>
  )
}

function Op({ children }: { children: React.ReactNode }) {
  return <span className="text-sm font-medium text-spyne-text-secondary shrink-0 w-5 text-center">{children}</span>
}

function Eq() {
  return <span className="text-sm font-medium text-spyne-text-secondary shrink-0">=</span>
}

function Res({ value, highlight, muted }: { value: string; highlight?: boolean; muted?: boolean }) {
  return (
    <div className={cn(
      "h-10 rounded-lg px-3 flex items-center justify-end shrink-0 w-[130px] border",
      highlight ? "bg-spyne-primary/5 border-spyne-primary/20" : "bg-muted/30 border-spyne-border",
    )}>
      <span className={cn(
        "text-sm font-bold tabular-nums",
        highlight ? "text-spyne-primary" : muted ? "text-spyne-text/70" : "text-spyne-text",
      )}>
        {value}
      </span>
    </div>
  )
}
