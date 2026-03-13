"use client"

import {
  LifecycleStrip,
  CoreMetrics,
  ThreatsBlock,
  OpportunitiesBlock,
  InsightsBlock,
} from "@/components/max-2/dashboard"

export default function Max2DashboardPage() {
  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight">
        What needs my attention
      </h1>

      <LifecycleStrip />

      <CoreMetrics />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ThreatsBlock />
        <OpportunitiesBlock />
      </div>

      <InsightsBlock />
    </div>
  )
}
