"use client"

import { mockMerchandisingVehicles } from "@/lib/max-2-mocks"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

export function ListingPerformance() {
  const sorted = [...mockMerchandisingVehicles]
    .filter((v) => v.publishStatus === "live")
    .sort((a, b) => b.vdpViews - a.vdpViews)

  const top5 = sorted.slice(0, 5)
  const bottom5 = sorted.slice(-5).reverse()

  function VehicleRow({
    v,
    variant,
  }: {
    v: (typeof sorted)[number]
    variant: "top" | "bottom"
  }) {
    return (
      <div className="flex items-center gap-3 py-2.5 border-b last:border-0">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {v.year} {v.make} {v.model}
          </p>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
            <span>{v.vdpViews} VDPs</span>
            <span>Score: {v.listingScore}</span>
          </div>
        </div>
        <div
          className={cn(
            "text-xs font-semibold px-2 py-0.5 rounded-full",
            variant === "top"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-700",
          )}
        >
          {v.vdpViews} views
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listing Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-semibold text-emerald-700">
                Top Performers
              </h3>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/30 p-3">
              {top5.map((v) => (
                <VehicleRow key={v.vin} v={v} variant="top" />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <h3 className="text-sm font-semibold text-red-700">
                Needs Attention
              </h3>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50/30 p-3">
              {bottom5.map((v) => (
                <VehicleRow key={v.vin} v={v} variant="bottom" />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
