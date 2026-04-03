"use client"

import Link from "next/link"
import { MerchandisingSummary } from "@/components/max-2/studio/merchandising-summary"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { max2Classes, spyneComponentClasses } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"

export default function StudioPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className={max2Classes.pageTitle}>
            Studio AI Overview
          </h1>
          <p className={max2Classes.pageDescription}>
            Inventory health, media quality, and what needs your attention today.
          </p>
        </div>
        <Link
          href="/max-2/studio/add"
          className={cn(
            spyneComponentClasses.btnPrimaryMd,
            "shrink-0 no-underline"
          )}
        >
          <MaterialSymbol name="add" size={20} />
          Add New Vehicle
        </Link>
      </div>

      <MerchandisingSummary />
    </div>
  )
}
