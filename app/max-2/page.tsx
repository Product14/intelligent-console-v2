"use client"

import {
  LifecycleStrip,
  CoreMetrics,
  ThreatsBlock,
  OpportunitiesBlock,
  InsightsBlock,
} from "@/components/max-2/dashboard"
import { max2Classes } from "@/lib/design-system/max-2"

export default function Max2DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className={max2Classes.pageTitle}>
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
