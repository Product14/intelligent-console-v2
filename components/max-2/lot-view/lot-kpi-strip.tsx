"use client"

import { mockLotVehicles } from "@/lib/max-2-mocks"
import {
  SpyneRoiKpiDispositionPanel,
  SpyneRoiKpiMetricCell,
  SpyneRoiKpiStrip,
} from "@/components/max-2/spyne-roi-kpi-strip"

const fmt$ = (n: number) => `$${n.toLocaleString()}`

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
        <SpyneRoiKpiMetricCell
          label="MTD Holding Cost"
          value={fmt$(mtdCost)}
          status="watch"
          sub={`${fmt$(dailyCost)}/day burn rate`}
          valueClassName="text-spyne-error"
        />
      )}
    </SpyneRoiKpiStrip>
  )
}
