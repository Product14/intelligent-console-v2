"use client"

import {
  CustomerSummaryCards,
  CustomerTable,
  RecentActivity,
} from "@/components/max-2/customers"
import { max2Classes } from "@/lib/design-system/max-2"

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className={max2Classes.pageTitle}>Customers</h1>
        <p className={max2Classes.pageDescription}>
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
