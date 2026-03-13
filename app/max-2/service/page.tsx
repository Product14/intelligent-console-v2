"use client"

import {
  BuyOpportunities,
  PainPoints,
  AcquisitionPipeline,
} from "@/components/max-2/service"

export default function ServicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Service</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Service-to-buy opportunities, customer intelligence, and acquisition hooks
        </p>
      </div>

      <BuyOpportunities />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PainPoints />
        <AcquisitionPipeline />
      </div>
    </div>
  )
}
