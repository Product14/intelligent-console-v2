"use client"

import {
  LeadFunnel,
  VehicleInquiries,
  FollowUpOpportunities,
  DemandNotInStock,
} from "@/components/max-2/sales"

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sales</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Demand capture — leads, inquiries, and close opportunities
        </p>
      </div>

      <LeadFunnel />
      <VehicleInquiries />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FollowUpOpportunities />
        <DemandNotInStock />
      </div>
    </div>
  )
}
