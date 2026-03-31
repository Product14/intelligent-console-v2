"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { MerchandisingSummary } from "@/components/max-2/studio/merchandising-summary"

export default function StudioPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto py-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Merchandising Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
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
