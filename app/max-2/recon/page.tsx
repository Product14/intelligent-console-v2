"use client"

import {
  ReconKPIs, ReconKanban, BottleneckAnalysis,
} from "@/components/max-2/recon"

export default function ReconPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inspection &amp; Recon</h1>
        <p className="text-sm text-muted-foreground">
          From lot arrival to frontline readiness
        </p>
      </div>

      <ReconKPIs />
      <ReconKanban />
      <BottleneckAnalysis />
    </div>
  )
}
