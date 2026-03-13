"use client"

import { mockReconVehicles, getReconStageStats } from "@/lib/spyne-max-mocks"
import type { ReconStage } from "@/services/spyne-max/spyne-max.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Clock, AlertTriangle } from "lucide-react"

const STAGE_ORDER: ReconStage[] = ["inspection", "mechanical", "body", "detail", "photo", "online"]

export function ReconBoard() {
  const stageStats = getReconStageStats()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recon Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {STAGE_ORDER.map((stage) => {
            const stats = stageStats.find((s) => s.stage === stage)!
            const vehicles = mockReconVehicles.filter((v) => v.currentStage === stage)

            return (
              <div key={stage} className="flex flex-col gap-2">
                <div className="rounded-lg bg-muted/50 px-3 py-2">
                  <p className="text-sm font-semibold">{stats.label}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{stats.count} units</span>
                    <span>·</span>
                    <span>{stats.avgDays.toFixed(1)}d avg</span>
                  </div>
                  {stats.breachCount > 0 && (
                    <Badge variant="destructive" className="mt-1 text-[10px]">
                      <AlertTriangle className="h-3 w-3" />
                      {stats.breachCount} breach
                    </Badge>
                  )}
                </div>

                <div className="flex flex-col gap-2 min-h-[120px]">
                  {vehicles.map((vehicle) => (
                    <div
                      key={vehicle.vin}
                      className={cn(
                        "rounded-lg border bg-white p-2.5 text-xs shadow-sm transition-colors",
                        vehicle.slaBreach && "border-red-400 ring-1 ring-red-200"
                      )}
                    >
                      <p className="font-medium truncate">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {vehicle.daysInRecon.toFixed(1)}d
                        </span>
                        <Badge
                          variant={vehicle.slaBreach ? "destructive" : "secondary"}
                          className={cn(
                            "text-[10px]",
                            !vehicle.slaBreach && "bg-emerald-100 text-emerald-700 border-emerald-200"
                          )}
                        >
                          {vehicle.slaBreach ? "BREACH" : "On Track"}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mt-1 truncate">
                        {vehicle.assignedTo}
                      </p>
                    </div>
                  ))}
                  {vehicles.length === 0 && (
                    <div className="flex items-center justify-center h-20 text-xs text-muted-foreground border border-dashed rounded-lg">
                      No vehicles
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
