"use client"

import {
  ServiceSummary,
  RepairOrdersTable,
  ServiceBayStatus,
  ServiceAppointments,
  ServiceActionItems,
  ServiceReports,
  BuyOpportunities,
  PainPoints,
  AcquisitionPipeline,
} from "@/components/max-2/service"
import { max2Classes } from "@/lib/design-system/max-2"

export default function ServicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className={max2Classes.pageTitle}>Service</h1>
        <p className={max2Classes.pageDescription}>
          Service operations — ROs, bays, appointments, and performance
        </p>
      </div>

      <ServiceSummary />

      <RepairOrdersTable />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ServiceBayStatus />
        <ServiceAppointments />
      </div>

      <ServiceActionItems />

      <ServiceReports />

      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-4">Service-to-Sales Opportunities</h2>
        <BuyOpportunities />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <PainPoints />
          <AcquisitionPipeline />
        </div>
      </div>
    </div>
  )
}
