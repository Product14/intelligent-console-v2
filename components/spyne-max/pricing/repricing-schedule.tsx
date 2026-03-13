"use client"

import { mockVehiclePricing, REPRICING_RULES } from "@/lib/spyne-max-mocks"
import type { VehiclePricing, RepricingRule } from "@/services/spyne-max/spyne-max.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CalendarClock, AlertTriangle } from "lucide-react"

const zoneColors: Record<string, { bg: string; fill: string; text: string; badge: string }> = {
  hold: {
    bg: "bg-emerald-100",
    fill: "bg-emerald-500",
    text: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  "first-reprice": {
    bg: "bg-amber-100",
    fill: "bg-amber-500",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
  },
  aggressive: {
    bg: "bg-orange-100",
    fill: "bg-orange-500",
    text: "text-orange-700",
    badge: "bg-orange-100 text-orange-800 border-orange-200",
  },
  "wholesale-decision": {
    bg: "bg-red-100",
    fill: "bg-red-500",
    text: "text-red-700",
    badge: "bg-red-100 text-red-800 border-red-200",
  },
}

function getVehicleZone(days: number): RepricingRule {
  return (
    REPRICING_RULES.find(
      (r) => days >= r.dayRange[0] && days <= r.dayRange[1]
    ) ?? REPRICING_RULES[REPRICING_RULES.length - 1]
  )
}

function needsAction(v: VehiclePricing): boolean {
  const zone = getVehicleZone(v.daysInStock)
  if (zone.action === "hold") return false
  const lastReprice = v.repriceHistory[v.repriceHistory.length - 1]
  if (!lastReprice) return true
  const daysSinceReprice =
    (Date.now() - new Date(lastReprice.date).getTime()) / (1000 * 60 * 60 * 24)
  return daysSinceReprice > 10
}

function ZoneBar({ days }: { days: number }) {
  const maxDays = 60
  const zones = REPRICING_RULES.map((r) => {
    const start = r.dayRange[0]
    const end = Math.min(r.dayRange[1], maxDays)
    return { ...r, start, end, width: ((end - start + 1) / maxDays) * 100 }
  })
  const markerPct = Math.min(days / maxDays, 1) * 100

  return (
    <div className="relative h-4 flex rounded-full overflow-hidden">
      {zones.map((z) => (
        <div
          key={z.action}
          className={cn(zoneColors[z.action].fill, "h-full opacity-80")}
          style={{ width: `${z.width}%` }}
        />
      ))}
      <div
        className="absolute top-0 h-full w-0.5 bg-foreground"
        style={{ left: `${markerPct}%` }}
      >
        <div className="absolute -top-1 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-foreground border-2 border-white" />
      </div>
    </div>
  )
}

export function RepricingSchedule() {
  const sortedVehicles = [...mockVehiclePricing].sort(
    (a, b) => b.daysInStock - a.daysInStock
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarClock className="h-4 w-4 text-primary" />
          Repricing Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {REPRICING_RULES.map((r) => (
            <div key={r.action} className="flex items-center gap-1.5 text-xs">
              <div className={cn("w-3 h-3 rounded-sm", zoneColors[r.action].fill)} />
              <span className="text-muted-foreground">{r.label}</span>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {sortedVehicles.map((v) => {
            const zone = getVehicleZone(v.daysInStock)
            const urgent = needsAction(v)
            return (
              <div
                key={v.vin}
                className={cn(
                  "rounded-lg border p-3 transition-colors",
                  urgent && "border-red-300 bg-red-50/50"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {v.year} {v.make} {v.model}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn("text-xs", zoneColors[zone.action].badge)}
                    >
                      {zone.label}
                    </Badge>
                    {urgent && (
                      <span className="flex items-center gap-1 text-xs font-medium text-red-600">
                        <AlertTriangle className="h-3 w-3" />
                        Action needed
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    Day {v.daysInStock}
                  </span>
                </div>
                <ZoneBar days={v.daysInStock} />
                <p className="text-xs text-muted-foreground mt-1.5">
                  {zone.description}
                </p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
