"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { mockMerchandisingVehicles } from "@/lib/max-2-mocks"
import { VehicleMediaTable } from "@/components/max-2/studio/vehicle-media-table"
import {
  InventoryFilterBar,
  applyFilters,
  filtersFromSearchParams,
} from "@/components/max-2/studio/inventory-filters"
import {
  applyMerchMediaIssueToSearchParams,
  merchandisingFiltersActive,
  type MerchandisingInventoryFilters,
} from "@/lib/merchandising-inventory-filter-apply"
import { max2Classes, max2Layout } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"

function InventoryContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [filters, setFilters] = React.useState(() =>
    filtersFromSearchParams(searchParams)
  )
  const filtersRef = React.useRef(filters)
  filtersRef.current = filters

  React.useEffect(() => {
    setFilters(filtersFromSearchParams(searchParams))
  }, [searchParams])

  const handleFiltersChange = React.useCallback(
    (next: MerchandisingInventoryFilters) => {
      const prevIssue = filtersRef.current.mediaIssue
      setFilters(next)
      if (!merchandisingFiltersActive(next)) {
        router.replace(pathname, { scroll: false })
        return
      }
      if (prevIssue === next.mediaIssue) return
      const params = applyMerchMediaIssueToSearchParams(searchParams, next.mediaIssue)
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  const allVehicles = mockMerchandisingVehicles
  const filtered = applyFilters(allVehicles, filters)

  const tabCounts = {
    all: allVehicles.length,
    new: allVehicles.filter((v) => v.isNew).length,
    used: allVehicles.filter((v) => !v.isNew).length,
  }

  return (
    <div className={cn(max2Layout.pageStack)}>
      <div>
        <h1 className={max2Classes.pageTitle}>Active Inventory</h1>
        <p className={max2Classes.pageDescription}>
          Search, filter, and fix media and publishing issues across your merchandising pipeline.
        </p>
      </div>

      <InventoryFilterBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        allVehicles={allVehicles}
        tabCounts={tabCounts}
      />

      <VehicleMediaTable vehicles={filtered} />
    </div>
  )
}

export default function ActiveInventoryPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex flex-col gap-4">
          <p className="text-sm text-spyne-text-secondary">Loading inventory…</p>
        </div>
      }
    >
      <InventoryContent />
    </React.Suspense>
  )
}
