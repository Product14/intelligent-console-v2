"use client"

import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { mockLotVehicles } from "@/lib/max-2-mocks"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import type { LotVehicle } from "@/services/max-2/max-2.types"
import { SpyneDarkTooltipPanel } from "@/components/max-2/spyne-ui"
import {
  SpyneRoiKpiDispositionPanel,
  SpyneRoiKpiMetricCell,
  SpyneRoiKpiStrip,
} from "@/components/max-2/spyne-roi-kpi-strip"

const fmt$ = (n: number) => `$${n.toLocaleString()}`

/** Aggregate resolutions aligned with Lot View Action Items (issue buckets). */
function lotHoldingResolutionLines(vehicles: LotVehicle[]): string[] {
  const front = (v: LotVehicle) => v.lotStatus === "frontline"
  const notSold = (v: LotVehicle) => v.lotStatus !== "sold-pending"

  const exitNow = vehicles.filter((v) => notSold(v) && v.daysInStock > 60).length
  const liquidate = vehicles.filter((v) => notSold(v) && v.daysInStock >= 46 && v.daysInStock <= 60).length
  const reprice = vehicles.filter((v) => front(v) && v.daysInStock >= 31 && v.daysInStock <= 45).length
  const smart = vehicles.filter((v) => front(v) && v.leads === 0 && v.daysInStock >= 10).length
  const highHold = vehicles.filter((v) => v.totalHoldingCost >= 1500).length

  const lines: string[] = []
  if (exitNow > 0) lines.push(`Exit now: wholesale or auction (${exitNow} units)`)
  if (liquidate > 0) lines.push(`Liquidate: deep reprice or wholesale (${liquidate} units)`)
  if (reprice > 0) lines.push(`Reprice to market (${reprice} in 31–45 day window)`)
  if (smart > 0) lines.push(`Run Smart Campaign (${smart} frontline, low leads)`)
  if (highHold > 0) lines.push(`High holding cost: prioritize sale or reprice (${highHold} units)`)
  if (lines.length === 0) {
    lines.push("Holding within target: monitor aged inventory weekly")
  }
  return lines.slice(0, 5)
}

const ACTIVE_STATUSES = ["frontline", "wholesale-candidate", "sold-pending"]

type Status = "good" | "watch" | "bad"

export function LotKPIStrip({ showHoldingCost = true }: { showHoldingCost?: boolean }) {
  const activeVehicles = mockLotVehicles.filter((v) =>
    ACTIVE_STATUSES.includes(v.lotStatus),
  )
  const total = activeVehicles.length
  const frontlineCount = activeVehicles.filter((v) => v.lotStatus === "frontline").length
  const wholesaleCount = activeVehicles.filter((v) => v.lotStatus === "wholesale-candidate").length

  const mtdCost = activeVehicles.reduce((sum, v) => sum + v.totalHoldingCost, 0)
  const dailyCost = activeVehicles.reduce((sum, v) => sum + v.holdingCostPerDay, 0)
  const totalGrossMargin = activeVehicles.reduce((sum, v) => sum + v.estimatedFrontGross, 0)

  const avgDays =
    activeVehicles.filter((v) => v.lotStatus !== "sold-pending").length > 0
      ? activeVehicles
          .filter((v) => v.lotStatus !== "sold-pending")
          .reduce((s, v) => s + v.daysInStock, 0) /
        activeVehicles.filter((v) => v.lotStatus !== "sold-pending").length
      : 0

  const frontlinePct = total > 0 ? frontlineCount / total : 0
  const daysStatus: Status = avgDays < 20 ? "good" : avgDays < 30 ? "watch" : "bad"
  const readyStatus: Status = frontlinePct >= 0.55 ? "good" : frontlinePct >= 0.4 ? "watch" : "bad"
  const aged45 = activeVehicles.filter(
    (v) => v.daysInStock >= 45 && v.lotStatus !== "sold-pending",
  ).length

  const cols = showHoldingCost ? "lg:grid-cols-5" : "lg:grid-cols-4"

  return (
    <SpyneRoiKpiStrip gridClassName={`grid grid-cols-1 sm:grid-cols-2 ${cols} divide-y lg:divide-y-0 lg:divide-x`}>
      <SpyneRoiKpiMetricCell
        label="Total Units"
        value={String(total)}
        status="good"
        sub={`${frontlineCount} frontline · ${wholesaleCount} wholesale`}
      />

      <SpyneRoiKpiMetricCell
        label="Frontline Ready"
        value={String(frontlineCount)}
        status={readyStatus}
        sub={`${(frontlinePct * 100).toFixed(0)}% of lot available`}
      />

      <SpyneRoiKpiDispositionPanel vehicles={activeVehicles} />

      <SpyneRoiKpiMetricCell
        label="Avg Days in Stock"
        value={`${avgDays.toFixed(1)}d`}
        status={daysStatus}
        sub={aged45 > 0 ? `${aged45} cars past 45-day mark` : "All within healthy range"}
      />

      {showHoldingCost && (
        <TooltipPrimitive.Provider delayDuration={250}>
          <TooltipPrimitive.Root>
            <TooltipPrimitive.Trigger asChild>
              <div className="min-w-0 w-full cursor-default rounded-md outline-none focus-visible:ring-2 focus-visible:ring-spyne-primary/25">
                <SpyneRoiKpiMetricCell
                  label="Holding cost"
                  value={fmt$(mtdCost)}
                  status="watch"
                  sub={`${fmt$(dailyCost)}/day · ${fmt$(totalGrossMargin)} est. gross`}
                  valueClassName="text-spyne-error"
                />
              </div>
            </TooltipPrimitive.Trigger>
            <TooltipPrimitive.Portal>
              <TooltipPrimitive.Content
                side="top"
                align="center"
                sideOffset={8}
                className={spyneComponentClasses.darkTooltipRadixContent}
              >
                <SpyneDarkTooltipPanel
                  title="Suggested actions"
                  lines={lotHoldingResolutionLines(activeVehicles)}
                />
                <TooltipPrimitive.Arrow className={spyneComponentClasses.darkTooltipArrow} width={14} height={7} />
              </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
          </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
      )}
    </SpyneRoiKpiStrip>
  )
}
