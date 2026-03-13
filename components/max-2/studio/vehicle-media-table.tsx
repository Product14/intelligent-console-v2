"use client"

import * as React from "react"
import { mockMerchandisingVehicles } from "@/lib/max-2-mocks"
import type { MerchandisingVehicle, MediaStatus, PublishStatus } from "@/services/max-2/max-2.types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Check, X, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

const mediaBadge: Record<MediaStatus, { label: string; className: string }> = {
  "real-photos": { label: "Real", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  "clone-photos": { label: "Clone", className: "bg-amber-100 text-amber-700 border-amber-200" },
  "stock-photos": { label: "Stock", className: "bg-red-100 text-red-700 border-red-200" },
  "no-photos": { label: "None", className: "bg-gray-100 text-gray-500 border-gray-200" },
}

const publishBadge: Record<PublishStatus, { label: string; className: string }> = {
  live: { label: "Live", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  pending: { label: "Pending", className: "bg-amber-100 text-amber-700 border-amber-200" },
  "not-published": { label: "Not Published", className: "bg-red-100 text-red-700 border-red-200" },
}

type SortKey = "listingScore" | "vdpViews" | "daysInStock"

function rowBg(v: MerchandisingVehicle) {
  if (v.mediaStatus === "no-photos") return "bg-red-50/60"
  if (v.mediaStatus === "stock-photos") return "bg-amber-50/60"
  return ""
}

export function VehicleMediaTable() {
  const [sortKey, setSortKey] = React.useState<SortKey>("listingScore")
  const [sortAsc, setSortAsc] = React.useState(false)

  const sorted = [...mockMerchandisingVehicles].sort((a, b) => {
    const diff = a[sortKey] - b[sortKey]
    return sortAsc ? diff : -diff
  })

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(false)
    }
  }

  function SortButton({ label, field }: { label: string; field: SortKey }) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
        onClick={() => toggleSort(field)}
      >
        {label}
        <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Media Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 font-medium text-muted-foreground">Vehicle</th>
                <th className="pb-3 font-medium text-muted-foreground">Media</th>
                <th className="pb-3 font-medium text-muted-foreground text-right">Photos</th>
                <th className="pb-3 font-medium text-muted-foreground text-center">360°</th>
                <th className="pb-3 font-medium text-muted-foreground text-center">Video</th>
                <th className="pb-3 font-medium text-muted-foreground">Publish</th>
                <th className="pb-3"><SortButton label="Score" field="listingScore" /></th>
                <th className="pb-3"><SortButton label="Days" field="daysInStock" /></th>
                <th className="pb-3"><SortButton label="VDPs" field="vdpViews" /></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((v) => {
                const mb = mediaBadge[v.mediaStatus]
                const pb = publishBadge[v.publishStatus]
                return (
                  <tr key={v.vin} className={cn("border-b last:border-0", rowBg(v))}>
                    <td className="py-3 font-medium whitespace-nowrap">
                      {v.year} {v.make} {v.model}
                    </td>
                    <td className="py-3">
                      <Badge variant="outline" className={mb.className}>
                        {mb.label}
                      </Badge>
                    </td>
                    <td className="py-3 text-right font-mono">{v.photoCount}</td>
                    <td className="py-3 text-center">
                      {v.has360 ? (
                        <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 text-center">
                      {v.hasVideo ? (
                        <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                      )}
                    </td>
                    <td className="py-3">
                      <Badge variant="outline" className={pb.className}>
                        {pb.label}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <Progress
                          value={v.listingScore}
                          className={cn(
                            "h-2 flex-1",
                            v.listingScore < 50 && "[&>div]:bg-red-500",
                          )}
                        />
                        <span
                          className={cn(
                            "text-xs font-mono font-semibold w-7 text-right",
                            v.listingScore < 50 && "text-red-600",
                          )}
                        >
                          {v.listingScore}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-right font-mono">{v.daysInStock}</td>
                    <td className="py-3 text-right font-mono">{v.vdpViews}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
