"use client"

import * as React from "react"
import {
  mockHoldingCostInputs,
  calculateHoldingCost,
} from "@/lib/spyne-max-mocks"
import type { HoldingCostInputs } from "@/services/spyne-max/spyne-max.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Calculator, ArrowRight, ChevronRight } from "lucide-react"

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
const fmtDec = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 })

function StepCard({
  step,
  title,
  formula,
  inputs,
  result,
  resultLabel,
  formatResult,
  active,
}: {
  step: number
  title: string
  formula: string
  inputs: { label: string; value: number; onChange: (v: number) => void; prefix?: string }[]
  result: number
  resultLabel: string
  formatResult: (v: number) => string
  active?: boolean
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all",
        active ? "border-primary bg-primary/5 shadow-sm" : "bg-muted/30"
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
            active ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20 text-muted-foreground"
          )}
        >
          {step}
        </span>
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3 font-mono">{formula}</p>
      <div className="grid gap-3">
        {inputs.map((inp) => (
          <div key={inp.label} className="flex items-center gap-2">
            <Label className="text-xs w-36 shrink-0">{inp.label}</Label>
            <div className="relative flex-1">
              {inp.prefix && (
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {inp.prefix}
                </span>
              )}
              <Input
                type="number"
                value={inp.value}
                onChange={(e) => inp.onChange(Number(e.target.value) || 0)}
                className={cn("h-8 text-sm font-mono", inp.prefix && "pl-6")}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t">
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{resultLabel}:</span>
        <span className={cn("text-sm font-bold font-mono", active && "text-primary")}>
          {formatResult(result)}
        </span>
      </div>
    </div>
  )
}

export function CostCalculator() {
  const [inputs, setInputs] = React.useState<HoldingCostInputs>(mockHoldingCostInputs)

  const update = (key: keyof HoldingCostInputs, val: number) =>
    setInputs((prev) => ({ ...prev, [key]: val }))

  const result = calculateHoldingCost(inputs)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="h-4 w-4 text-primary" />
          Holding Cost Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <StepCard
            step={1}
            title="Isolate Fixed Cost"
            formula="YTD Total − YTD Variable = Fixed"
            inputs={[
              {
                label: "YTD Total Expense",
                value: inputs.ytdTotalUsedExpense,
                onChange: (v) => update("ytdTotalUsedExpense", v),
                prefix: "$",
              },
              {
                label: "YTD Variable",
                value: inputs.ytdVariableExpense,
                onChange: (v) => update("ytdVariableExpense", v),
                prefix: "$",
              },
            ]}
            result={result.fixedCost}
            resultLabel="Fixed Cost"
            formatResult={fmt}
          />

          <StepCard
            step={2}
            title="Monthly Fixed"
            formula="Fixed Cost ÷ Months = Avg Monthly"
            inputs={[
              {
                label: "Months Elapsed",
                value: inputs.monthsElapsed,
                onChange: (v) => update("monthsElapsed", v),
              },
            ]}
            result={result.avgFixedPerMonth}
            resultLabel="Avg Fixed/Month"
            formatResult={fmt}
          />

          <StepCard
            step={3}
            title="Avg Units in Stock"
            formula="Monthly Sales × 1.33 = Units"
            inputs={[
              {
                label: "Monthly Sales",
                value: inputs.avgMonthlySales,
                onChange: (v) => update("avgMonthlySales", v),
              },
            ]}
            result={result.avgUnitsInStock}
            resultLabel="Avg Units"
            formatResult={(v) => v.toFixed(0)}
          />

          <StepCard
            step={4}
            title="Per Unit / Month"
            formula="Monthly Fixed ÷ Units = $/Unit/Mo"
            inputs={[]}
            result={result.perUnitPerMonth}
            resultLabel="Per Unit/Month"
            formatResult={fmt}
          />

          <StepCard
            step={5}
            title="Holding Cost / Day"
            formula="Per Unit/Mo ÷ Days Open = $/Day"
            active
            inputs={[
              {
                label: "Days Open/Month",
                value: inputs.daysOpenPerMonth,
                onChange: (v) => update("daysOpenPerMonth", v),
              },
            ]}
            result={result.holdingCostPerDay}
            resultLabel="Holding Cost/Day"
            formatResult={fmtDec}
          />
        </div>

        <div className="rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Every day a car sits on your lot costs you
            </p>
            <p className="text-3xl font-bold text-primary tracking-tight mt-1">
              {fmtDec(result.holdingCostPerDay)}
              <span className="text-base font-normal text-muted-foreground ml-1">/day</span>
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <span>{fmt(result.fixedCost)}</span>
            <ArrowRight className="h-3 w-3" />
            <span>{fmt(result.avgFixedPerMonth)}/mo</span>
            <ArrowRight className="h-3 w-3" />
            <span>{fmt(result.perUnitPerMonth)}/unit</span>
            <ArrowRight className="h-3 w-3" />
            <span className="font-bold text-primary">{fmtDec(result.holdingCostPerDay)}/day</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
