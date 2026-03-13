"use client"

import {
  TimeToFrontline,
  ReconCostTracker,
  ReconBoard,
  SLATracker,
  SpeedImpactCalc,
} from "@/components/spyne-max/recon"

export default function ReconPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Recon Pipeline</h1>
        <p className="text-sm text-muted-foreground">
          How fast am I getting cars to the frontline?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TimeToFrontline />
        <ReconCostTracker />
      </div>

      <ReconBoard />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SLATracker />
        <SpeedImpactCalc />
      </div>
    </div>
  )
}
