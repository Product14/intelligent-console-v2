"use client"

import { mockVehiclePricing, mockDealerProfile } from "@/lib/spyne-max-mocks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Crosshair, Percent, Clock } from "lucide-react"

function ArcGauge({
  value,
  min,
  max,
  targetMin,
  targetMax,
  label,
  format,
}: {
  value: number
  min: number
  max: number
  targetMin: number
  targetMax: number
  label: string
  format: (v: number) => string
}) {
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)))
  const inRange = value >= targetMin && value <= targetMax
  const close =
    !inRange &&
    (Math.abs(value - targetMin) <= (targetMax - targetMin) * 0.5 ||
      Math.abs(value - targetMax) <= (targetMax - targetMin) * 0.5)
  const color = inRange ? "text-emerald-500" : close ? "text-amber-500" : "text-red-500"
  const stroke = inRange ? "stroke-emerald-500" : close ? "stroke-amber-500" : "stroke-red-500"
  const bg = inRange ? "bg-emerald-50" : close ? "bg-amber-50" : "bg-red-50"

  const radius = 54
  const circumference = Math.PI * radius
  const offset = circumference - pct * circumference

  return (
    <div className={cn("flex flex-col items-center gap-3 rounded-xl p-5", bg)}>
      <div className="relative flex items-center justify-center">
        <svg width="130" height="75" viewBox="0 0 120 70">
          <path
            d="M 6 64 A 54 54 0 0 1 114 64"
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            className="stroke-black/10"
          />
          <path
            d="M 6 64 A 54 54 0 0 1 114 64"
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn(stroke, "transition-all duration-700")}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span className={cn("text-xl font-bold", color)}>{format(value)}</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">
          Target: {format(targetMin)}–{format(targetMax)}
        </p>
      </div>
    </div>
  )
}

export function PricingTriangle() {
  const vehicles = mockVehiclePricing
  const avgC2M =
    vehicles.reduce((s, v) => s + v.costToMarket, 0) / vehicles.length
  const avgRank =
    vehicles.reduce((s, v) => s + v.marketRank, 0) / vehicles.length
  const freshCount = vehicles.filter((v) => v.daysInStock <= 15).length
  const freshPct = (freshCount / vehicles.length) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Crosshair className="h-4 w-4 text-primary" />
          Pricing Triangle
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ArcGauge
            value={Math.round(avgRank * 10) / 10}
            min={1}
            max={20}
            targetMin={1}
            targetMax={5}
            label="Avg Market Rank"
            format={(v) => `#${v.toFixed(1)}`}
          />
          <ArcGauge
            value={avgC2M}
            min={90}
            max={105}
            targetMin={97}
            targetMax={99}
            label="Avg Cost-to-Market %"
            format={(v) => `${v.toFixed(1)}%`}
          />
          <ArcGauge
            value={freshPct}
            min={0}
            max={100}
            targetMin={40}
            targetMax={100}
            label="Fresh Inventory (0-15d)"
            format={(v) => `${v.toFixed(0)}%`}
          />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center text-xs text-muted-foreground">
          <p>
            {mockDealerProfile.monthlyRetailUnits} units ·{" "}
            {vehicles.length} priced
          </p>
          <p>
            Current {avgC2M.toFixed(1)}% vs 97–99% target
          </p>
          <p>
            {freshCount} of {vehicles.length} under 15 days
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
