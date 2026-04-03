"use client"

import {
  LotKPIStrip,
  LotBodyAnalysis,
  LotIssueBuckets,
  LotHoldingCostWidget,
} from "@/components/max-2/lot-view"
import { max2Classes } from "@/lib/design-system/max-2"

export default function LotViewPage() {
  return (
    <div className="flex flex-col gap-6">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className={max2Classes.pageTitle}>Lot View</h1>
          <p className={max2Classes.pageDescription}>
            Inventory control panel - aged stock, holding cost, and what to do
            today
          </p>
        </div>

        {/* Holding Cost dropdown widget */}
        <LotHoldingCostWidget />
      </div>

      {/* ── 1. ROI / lot KPI metrics ── */}
      <LotKPIStrip />

      {/* ── 2. Inventory analysis (ageing · body type · ASP) ── */}
      <LotBodyAnalysis />

      {/* ── 3. Action Items (Issue Buckets + Vehicle Table) ── */}
      <LotIssueBuckets />

</div>
  )
}
