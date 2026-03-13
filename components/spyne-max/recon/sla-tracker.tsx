"use client"

import { mockReconVehicles, getReconStageStats } from "@/lib/spyne-max-mocks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ShieldCheck, AlertTriangle } from "lucide-react"

const SLA_TARGET_DAYS = 3

export function SLATracker() {
  const total = mockReconVehicles.length
  const onTrack = mockReconVehicles.filter((v) => !v.slaBreach).length
  const compliancePercent = Math.round((onTrack / total) * 100)
  const breachVehicles = mockReconVehicles.filter((v) => v.slaBreach)

  const stageStats = getReconStageStats()
  const bottleneck = [...stageStats]
    .filter((s) => s.count > 0)
    .sort((a, b) => b.avgDays - a.avgDays)[0]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">SLA Compliance</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex items-center justify-center h-16 w-16 rounded-full",
            compliancePercent >= 80 ? "bg-emerald-100" : "bg-red-100"
          )}>
            <ShieldCheck className={cn(
              "h-7 w-7",
              compliancePercent >= 80 ? "text-emerald-600" : "text-red-600"
            )} />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className={cn(
                "text-3xl font-bold",
                compliancePercent >= 80 ? "text-emerald-600" : "text-red-600"
              )}>
                {compliancePercent}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              hitting {SLA_TARGET_DAYS}-day target ({onTrack}/{total} units)
            </p>
          </div>
        </div>

        {breachVehicles.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-red-600 mb-2 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Currently Breaching SLA
            </p>
            <div className="flex flex-col gap-1.5">
              {breachVehicles.map((v) => (
                <div
                  key={v.vin}
                  className="flex items-center justify-between rounded-md bg-red-50 px-3 py-1.5 text-xs"
                >
                  <span className="font-medium">
                    {v.year} {v.make} {v.model}
                  </span>
                  <Badge variant="destructive" className="text-[10px]">
                    {v.daysInRecon.toFixed(1)}d
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {bottleneck && (
          <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
            <p className="text-xs font-semibold text-amber-700">Bottleneck Stage</p>
            <p className="text-sm font-bold text-amber-900 mt-0.5">
              {bottleneck.label}
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              {bottleneck.avgDays.toFixed(1)} avg days · {bottleneck.count} units · {bottleneck.breachCount} breach
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
