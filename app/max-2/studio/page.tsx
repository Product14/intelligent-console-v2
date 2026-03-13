"use client"

import { MediaOverview, VehicleMediaTable, ListingScoreChart } from "@/components/max-2/studio"

export default function StudioPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Merchandising &amp; Syndication
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Photos, media, publishing &mdash; are your cars showing their best online?
        </p>
      </div>

      <MediaOverview />
      <VehicleMediaTable />
      <ListingScoreChart />
    </div>
  )
}
