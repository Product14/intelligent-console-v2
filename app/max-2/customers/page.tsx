"use client"

import {
  CustomerSummaryCards,
  CustomerTable,
  RecentActivity,
} from "@/components/max-2/customers"

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Every lead, every conversation, every opportunity — all in one place
        </p>
      </div>

      <CustomerSummaryCards />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <CustomerTable />
        </div>
        <div>
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
