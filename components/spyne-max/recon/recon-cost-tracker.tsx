"use client"

import { mockReconVehicles } from "@/lib/spyne-max-mocks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Wrench, Gauge } from "lucide-react"

export function ReconCostTracker() {
  const vehiclesWithCost = mockReconVehicles.filter((v) => v.reconCost > 0)
  const totalReconCost = vehiclesWithCost.reduce((s, v) => s + v.reconCost, 0)
  const units = vehiclesWithCost.length
  const costPerUnit = units > 0 ? totalReconCost / units : 0

  const costInRange = costPerUnit >= 1000 && costPerUnit <= 1400

  const vehiclesWithCompliance = mockReconVehicles.filter((v) => v.doorRateCompliance > 0)
  const avgDoorRateCompliance =
    vehiclesWithCompliance.length > 0
      ? vehiclesWithCompliance.reduce((s, v) => s + v.doorRateCompliance, 0) /
        vehiclesWithCompliance.length
      : 0
  const complianceOk = avgDoorRateCompliance >= 95

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Recon Cost per Unit</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Wrench className="h-3.5 w-3.5" />
              Cost / Unit
            </div>
            <span className={cn(
              "text-2xl font-bold",
              costInRange ? "text-emerald-600" : "text-red-600"
            )}>
              ${costPerUnit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[10px] text-muted-foreground">
              ${totalReconCost.toLocaleString()} / {units} units
            </span>
            <span className="text-[10px] text-muted-foreground">
              Target: $1,000–$1,400
            </span>
          </div>

          <div className="rounded-lg border p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Gauge className="h-3.5 w-3.5" />
              Door Rate Compliance
            </div>
            <span className={cn(
              "text-2xl font-bold",
              complianceOk ? "text-emerald-600" : "text-amber-600"
            )}>
              {avgDoorRateCompliance.toFixed(0)}%
            </span>
            <span className="text-[10px] text-muted-foreground">
              Avg (Internal Billed / Door Rate)
            </span>
            <span className="text-[10px] text-muted-foreground">
              Target: 100%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
