"use client"

import * as React from "react"
import { mockLotVehicles } from "@/lib/max-2-mocks"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { ChevronDown, DollarSign } from "lucide-react"

const ACTIVE = mockLotVehicles.filter(
  (v) => v.lotStatus === "frontline" || v.lotStatus === "wholesale-candidate",
)
const VEHICLE_COUNT = ACTIVE.length

// Always use en-US to avoid locale-specific number formatting
const fmt0 = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`
const fmt2 = (n: number) => `$${n.toFixed(2)}`
const fmtN = (n: number, d = 0) =>
  n.toLocaleString("en-US", { maximumFractionDigits: d })

interface State {
  ytdTotal:       string
  ytdVariable:    string
  monthlySales:   string
  turnoverFactor: string
  daysOpen:       string
}

const DEFAULTS: State = {
  ytdTotal:       "2500000",
  ytdVariable:    "500000",
  monthlySales:   "100",
  turnoverFactor: "1.33",
  daysOpen:       "27",
}

export function LotHoldingCostWidget() {
  const [s, setS] = React.useState<State>(DEFAULTS)
  const upd = (k: keyof State, v: string) => setS((p) => ({ ...p, [k]: v }))

  const ytdTotal      = parseFloat(s.ytdTotal)      || 0
  const ytdVariable   = parseFloat(s.ytdVariable)   || 0
  const monthlySales  = parseFloat(s.monthlySales)  || 0
  const turnover      = parseFloat(s.turnoverFactor)|| 1.33
  const daysOpen      = Math.max(parseFloat(s.daysOpen) || 1, 1)

  const fixedCost        = ytdTotal - ytdVariable
  const monthlyFixed     = fixedCost / 12
  const avgUnits         = monthlySales * turnover
  const costPerUnit      = avgUnits > 0 ? monthlyFixed / avgUnits : 0
  const dailyRate        = costPerUnit / daysOpen

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "group flex flex-col items-end rounded-xl border bg-card px-4 py-2",
            "hover:bg-muted/40 transition-colors",
            "data-[state=open]:bg-muted/40 data-[state=open]:border-primary/30",
          )}
        >
          <div className="flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Holding Cost
            </span>
            <ChevronDown className="h-3 w-3 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform duration-150" />
          </div>
          <p className="text-base font-bold tracking-tight text-red-700 tabular-nums mt-0.5">
            {fmt2(dailyRate)}
            <span className="text-xs font-medium text-muted-foreground ml-1">/car/day</span>
          </p>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        collisionPadding={16}
        className="w-[520px] p-0 rounded-xl overflow-hidden border"
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b bg-muted/20">
          <p className="text-sm font-semibold">Holding Cost Calculator</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            5-step formula used by every US used car manager
          </p>
        </div>

        {/* Steps */}
        <div className="divide-y">

          {/* Step 1 */}
          <Step n={1} label="Annual Fixed Cost">
            <Inp prefix="$" value={s.ytdTotal}    set={(v) => upd("ytdTotal", v)}    placeholder="YTD Total Expense" />
            <Op>−</Op>
            <Inp prefix="$" value={s.ytdVariable} set={(v) => upd("ytdVariable", v)} placeholder="YTD Variable Expense" />
            <Eq />
            <Res value={fixedCost > 0 ? fmt0(fixedCost) : "—"} />
          </Step>

          {/* Step 2 */}
          <Step n={2} label="Monthly Fixed Cost">
            <Comp value={fixedCost > 0 ? fmt0(fixedCost) : "—"} />
            <Op>÷</Op>
            <Const value="12" label="months" />
            <Eq />
            <Res value={monthlyFixed > 0 ? `${fmt0(monthlyFixed)}/mo` : "—"} muted />
          </Step>

          {/* Step 3 */}
          <Step n={3} label="Avg Units in Stock">
            <Inp suffix="units" value={s.monthlySales}   set={(v) => upd("monthlySales", v)}   placeholder="Monthly Sales" />
            <Op>×</Op>
            <Inp suffix="" value={s.turnoverFactor} set={(v) => upd("turnoverFactor", v)} placeholder="Factor" step="0.01" />
            <Eq />
            <Res value={avgUnits > 0 ? `${fmtN(avgUnits, 1)} units` : "—"} muted />
          </Step>

          {/* Step 4 */}
          <Step n={4} label="Cost Per Unit / Month">
            <Comp value={monthlyFixed > 0 ? fmt0(monthlyFixed) : "—"} />
            <Op>÷</Op>
            <Comp value={avgUnits > 0 ? fmtN(avgUnits, 1) : "—"} />
            <Eq />
            <Res value={costPerUnit > 0 ? `${fmt0(costPerUnit)}/unit` : "—"} muted />
          </Step>

          {/* Step 5 */}
          <Step n={5} label="Daily Holding Cost">
            <Comp value={costPerUnit > 0 ? fmt0(costPerUnit) : "—"} />
            <Op>÷</Op>
            <Inp suffix="days" value={s.daysOpen} set={(v) => upd("daysOpen", v)} placeholder="Days open" />
            <Eq />
            <Res value={dailyRate > 0 ? fmt2(dailyRate) : "—"} highlight />
          </Step>

        </div>

        {/* Result */}
        <div className="px-5 py-3.5 bg-red-50 border-t border-red-100 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-red-400">
            Daily holding cost / car
          </p>
          <p className="text-xl font-bold tabular-nums text-red-700">
            {fmt2(dailyRate)}
            <span className="text-sm font-normal text-red-400 ml-1">/car/day</span>
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function Step({ n, label, children }: { n: number; label: string; children: React.ReactNode }) {
  return (
    <div className="px-5 py-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
          {n}
        </span>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
      </div>
      <div className="flex items-center gap-2 pl-7">
        {children}
      </div>
    </div>
  )
}

function Inp({ prefix, suffix, value, set, placeholder, step = "1" }: {
  prefix?: string; suffix?: string; value: string
  set: (v: string) => void; placeholder?: string; step?: string
}) {
  return (
    <div className="flex items-stretch h-8 flex-1 min-w-0 rounded-lg border bg-white overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 transition-shadow">
      {prefix && (
        <span className="flex items-center px-2 text-xs text-muted-foreground bg-muted/50 border-r shrink-0">{prefix}</span>
      )}
      <input
        type="number"
        value={value}
        onChange={(e) => set(e.target.value)}
        placeholder={placeholder}
        step={step}
        className="flex-1 min-w-0 px-2 text-xs font-medium tabular-nums bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      {suffix && (
        <span className="flex items-center px-2 text-[10px] text-muted-foreground bg-muted/50 border-l shrink-0">{suffix}</span>
      )}
    </div>
  )
}

function Comp({ value }: { value: string }) {
  return (
    <div className="h-8 flex-1 min-w-0 rounded-lg bg-muted/40 border flex items-center px-2.5">
      <span className="text-xs tabular-nums text-muted-foreground truncate">{value}</span>
    </div>
  )
}

function Const({ value, label }: { value: string; label: string }) {
  return (
    <div className="h-8 rounded-lg bg-muted/20 border flex items-center justify-center px-3 shrink-0">
      <span className="text-xs font-semibold">{value}</span>
      <span className="text-[10px] text-muted-foreground ml-1">{label}</span>
    </div>
  )
}

function Op({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-sm font-medium text-muted-foreground shrink-0 w-5 text-center">{children}</span>
  )
}

function Eq() {
  return <span className="text-sm font-medium text-muted-foreground shrink-0">=</span>
}

function Res({ value, highlight, muted }: { value: string; highlight?: boolean; muted?: boolean }) {
  return (
    <div className={cn(
      "h-8 rounded-lg px-3 flex items-center justify-end shrink-0 w-[120px]",
      highlight ? "bg-primary/5 border border-primary/20" : "bg-muted/30 border",
    )}>
      <span className={cn(
        "text-sm font-bold tabular-nums",
        highlight ? "text-primary" : muted ? "text-foreground/70" : "text-foreground",
      )}>
        {value}
      </span>
    </div>
  )
}
