"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { VehicleSummary } from "@/services/inventory/inventory.types"
import { Skull, DollarSign, TrendingDown, AlertTriangle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface WholesaleCandidate {
  vehicle: VehicleSummary
  daysOverdue: number
  totalLoss: number
  projectedAdditionalLoss: number
  recommendation: "wholesale" | "dealer-trade" | "loss-leader"
  reasoning: string
}

function analyzeWholesaleCandidates(vehicles: VehicleSummary[]): WholesaleCandidate[] {
  return vehicles
    .filter(v => v.marginRemaining <= 0)
    .map(v => {
      const daysOverdue = v.daysInStock - 45
      const totalLoss = Math.abs(v.marginRemaining)
      const projectedLoss = v.dailyBurn * 10
      const recommendation: WholesaleCandidate["recommendation"] =
        totalLoss > 2000 ? "wholesale"
        : totalLoss > 500 ? "dealer-trade"
        : "loss-leader"
      const reasoning =
        recommendation === "wholesale" ? `Losing $${v.dailyBurn}/day with $${totalLoss.toLocaleString()} already lost. Wholesale exit minimizes further bleed.`
        : recommendation === "dealer-trade" ? `Moderate loss at $${totalLoss.toLocaleString()}. Dealer trade may recover partial value.`
        : `Small loss at $${totalLoss.toLocaleString()}. Consider loss-leader pricing to drive lot traffic.`

      return { vehicle: v, daysOverdue: Math.max(0, daysOverdue), totalLoss, projectedAdditionalLoss: projectedLoss, recommendation, reasoning }
    })
    .sort((a, b) => b.totalLoss - a.totalLoss)
}

const REC_CONFIG: Record<WholesaleCandidate["recommendation"], { label: string; color: string; bg: string }> = {
  wholesale: { label: "Wholesale Exit", color: "text-red-700", bg: "bg-red-50" },
  "dealer-trade": { label: "Dealer Trade", color: "text-orange-700", bg: "bg-orange-50" },
  "loss-leader": { label: "Loss Leader", color: "text-amber-700", bg: "bg-amber-50" },
}

interface WholesaleAdvisorProps {
  vehicles: VehicleSummary[]
  onAccelerate: (vin: string) => void
}

export function WholesaleAdvisor({ vehicles, onAccelerate }: WholesaleAdvisorProps) {
  const candidates = React.useMemo(() => analyzeWholesaleCandidates(vehicles), [vehicles])

  if (candidates.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-5">
        <div className="flex items-center gap-2 mb-2">
          <Skull className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-bold tracking-tight">Wholesale Exit Intelligence</h3>
        </div>
        <p className="text-xs text-muted-foreground">No vehicles currently beyond margin recovery. Keep monitoring.</p>
      </div>
    )
  }

  const totalLoss = candidates.reduce((s, c) => s + c.totalLoss, 0)
  const totalProjected = candidates.reduce((s, c) => s + c.projectedAdditionalLoss, 0)

  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Skull className="h-4 w-4 text-red-600" />
              <h3 className="text-sm font-bold tracking-tight">Wholesale Exit Intelligence</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              {candidates.length} vehicle{candidates.length !== 1 ? "s" : ""} beyond margin recovery
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold tabular-nums text-red-600">-${totalLoss.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">total loss</p>
          </div>
        </div>

        <div className="mt-3 px-3 py-2 rounded-lg bg-red-50/50 border border-red-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
            <p className="text-[11px] text-red-700">
              Projected additional loss if held 10 more days: <span className="font-bold">${totalProjected.toLocaleString()}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y">
        {candidates.map(candidate => {
          const config = REC_CONFIG[candidate.recommendation]
          return (
            <div key={candidate.vehicle.vin} className="px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/inventory/${candidate.vehicle.vin}`} className="text-sm font-semibold hover:text-primary transition-colors">
                      {candidate.vehicle.year} {candidate.vehicle.make} {candidate.vehicle.model}
                      <span className="text-muted-foreground font-normal ml-1.5">{candidate.vehicle.trim}</span>
                    </Link>
                    <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-semibold", config.bg, config.color)}>
                      {config.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                    <span>{candidate.vehicle.daysInStock}d in stock</span>
                    <span>·</span>
                    <span className="text-red-600 font-semibold">-${candidate.totalLoss.toLocaleString()} loss</span>
                    <span>·</span>
                    <span className="text-amber-600">${candidate.vehicle.dailyBurn}/day burn</span>
                  </div>

                  <div className="flex items-start gap-1.5 mt-2">
                    <ArrowRight className="h-3 w-3 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{candidate.reasoning}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <Button size="sm" variant="outline" className="text-xs h-7 gap-1" onClick={() => onAccelerate(candidate.vehicle.vin)}>
                    <Skull className="h-3 w-3" />
                    Exit Strategy
                  </Button>
                  <div className="text-right">
                    <p className="text-xs text-red-600 font-semibold tabular-nums">+${candidate.projectedAdditionalLoss.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">10d projected</p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
