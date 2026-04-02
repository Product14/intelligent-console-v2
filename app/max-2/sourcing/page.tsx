"use client"

import {
  DemandSignals, MarketGaps, ServiceLaneOpps, TradeInOpps,
} from "@/components/max-2/sourcing"
import { max2Classes } from "@/lib/design-system/max-2"

export default function SourcingPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className={max2Classes.pageTitle}>Sourcing</h1>
        <p className={max2Classes.pageDescription}>
          Demand + acquisition opportunities — buy what your market is asking for
        </p>
      </div>

      <DemandSignals />
      <MarketGaps />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ServiceLaneOpps />
        <TradeInOpps />
      </div>
    </div>
  )
}
