"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { STORE_GRADE_THRESHOLDS, mockDealerProfile, getStoreGrade } from "@/lib/spyne-max-mocks"
import { cn } from "@/lib/utils"
import { Trophy, Star, Target, AlertTriangle } from "lucide-react"
import type { StoreGrade } from "@/services/spyne-max/spyne-max.types"

const gradeConfig: Record<StoreGrade, { icon: typeof Trophy; color: string; bg: string; border: string; badge: string }> = {
  elite: { icon: Trophy, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-300", badge: "bg-amber-100 text-amber-700 border-amber-300" },
  strong: { icon: Star, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-300", badge: "bg-emerald-100 text-emerald-700 border-emerald-300" },
  average: { icon: Target, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-300", badge: "bg-blue-100 text-blue-700 border-blue-300" },
  weak: { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", border: "border-red-300", badge: "bg-red-100 text-red-700 border-red-300" },
}

export function BenchmarkLadder() {
  const currentGrade = getStoreGrade(
    mockDealerProfile.totalPVR,
    mockDealerProfile.netToGross,
    mockDealerProfile.returnOnSales
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <CardTitle>Where You Stand</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">Benchmark ladder — 4 tiers of dealership performance</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {STORE_GRADE_THRESHOLDS.map((tier) => {
            const config = gradeConfig[tier.grade]
            const Icon = config.icon
            const isActive = tier.grade === currentGrade

            return (
              <div
                key={tier.grade}
                className={cn(
                  "relative rounded-lg border p-4 transition-all",
                  isActive
                    ? cn(config.bg, config.border, "border-2 shadow-sm")
                    : "border-muted bg-background"
                )}
              >
                {isActive && (
                  <div className="absolute -left-px top-1/2 -translate-y-1/2 -translate-x-1/2">
                    <div className={cn("h-6 w-6 rounded-full border-2 flex items-center justify-center bg-white", config.border)}>
                      <div className={cn("h-3 w-3 rounded-full", config.bg.replace("50", "500"))} />
                    </div>
                  </div>
                )}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", isActive ? config.color : "text-muted-foreground")} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn("font-semibold", isActive ? config.color : "text-foreground")}>
                          {tier.label}
                        </span>
                        {isActive && (
                          <Badge className={cn("text-xs", config.badge)}>You are here</Badge>
                        )}
                      </div>
                      <p className={cn("text-xs mt-1", isActive ? "text-foreground/70" : "text-muted-foreground")}>
                        {tier.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 space-y-0.5">
                    <div className="text-xs text-muted-foreground">PVR ${tier.totalPVR.toLocaleString()}+</div>
                    <div className="text-xs text-muted-foreground">N2G {tier.netToGross}%+</div>
                    <div className="text-xs text-muted-foreground">ROS {tier.returnOnSales}%+</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
