"use client"

import {
  ReconKPIs, ReconKanban, BottleneckAnalysis,
} from "@/components/max-2/recon"
import { max2Classes } from "@/lib/design-system/max-2"

export default function ReconPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className={max2Classes.pageTitle}>Inspection &amp; Recon</h1>
        <p className={max2Classes.pageDescription}>
          From lot arrival to frontline readiness
        </p>
      </div>

      <ReconKPIs />
      <ReconKanban />
      <BottleneckAnalysis />
    </div>
  )
}
