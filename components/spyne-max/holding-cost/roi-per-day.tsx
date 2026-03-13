"use client"

import { mockVehiclePricing } from "@/lib/spyne-max-mocks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Target } from "lucide-react"

export function ROIPerDay() {
  const withROI = mockVehiclePricing
    .map((v) => ({
      ...v,
      roiPerDay: v.daysInStock > 0 ? v.targetGross / v.daysInStock : 0,
      name: `${v.year} ${v.make} ${v.model}`,
    }))
    .sort((a, b) => b.roiPerDay - a.roiPerDay)

  const top5 = withROI.slice(0, 5)
  const bottom5 = withROI.slice(-5).reverse()

  const VehicleRow = ({
    vehicle,
    rank,
    type,
  }: {
    vehicle: (typeof withROI)[0]
    rank: number
    type: "top" | "bottom"
  }) => {
    const isTop = type === "top"
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border p-3 transition-colors",
          isTop ? "bg-emerald-50/50 border-emerald-100" : "bg-red-50/50 border-red-100"
        )}
      >
        <span
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0",
            isTop
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-700"
          )}
        >
          {rank}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{vehicle.name}</p>
          <p className="text-xs text-muted-foreground">
            {vehicle.daysInStock}d in stock · ${vehicle.targetGross.toLocaleString()} gross
          </p>
        </div>
        <div className="text-right shrink-0">
          <p
            className={cn(
              "text-sm font-bold font-mono",
              isTop ? "text-emerald-700" : "text-red-700"
            )}
          >
            ${vehicle.roiPerDay.toFixed(0)}
          </p>
          <p className="text-[10px] text-muted-foreground">per day</p>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-4 w-4 text-primary" />
          ROI per Day
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700">
              Top 5 — Best Performers
            </span>
          </div>
          <div className="space-y-2">
            {top5.map((v, i) => (
              <VehicleRow key={v.vin} vehicle={v} rank={i + 1} type="top" />
            ))}
          </div>
        </div>

        <div className="border-t" />

        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingDown className="h-3.5 w-3.5 text-red-600" />
            <span className="text-xs font-semibold text-red-700">
              Bottom 5 — Profit Destroyers
            </span>
          </div>
          <div className="space-y-2">
            {bottom5.map((v, i) => (
              <VehicleRow key={v.vin} vehicle={v} rank={i + 1} type="bottom" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
