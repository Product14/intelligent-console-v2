"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { MerchandisingSummary } from "@/components/max-2/studio/merchandising-summary"
import { max2Classes } from "@/lib/design-system/max-2"

export default function StudioPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className={max2Classes.pageTitle}>
            Merchandising Overview
          </h1>
          <p className={max2Classes.pageDescription}>
            Inventory health, media quality, and what needs your attention today.
          </p>
        </div>
        <Link
          href="/max-2/studio/add"
          className="flex items-center gap-2 shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add New Vehicle
        </Link>
      </div>

      <MerchandisingSummary />
    </div>
  )
}
