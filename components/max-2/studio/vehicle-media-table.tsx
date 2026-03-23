"use client"

import * as React from "react"
import { mockMerchandisingVehicles } from "@/lib/max-2-mocks"
import type { MerchandisingVehicle, MediaStatus, PublishStatus } from "@/services/max-2/max-2.types"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ArrowUpDown, AlertTriangle, Image as ImageIcon, RotateCw, Video } from "lucide-react"
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
  "not-published": { label: "Draft", className: "bg-gray-100 text-gray-500 border-gray-200" },
}

type SortKey = "listingScore" | "vdpViews" | "daysInStock" | "price"

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price)
}

interface VehicleMediaTableProps {
  vehicles?: MerchandisingVehicle[]
  title?: string
}

export function VehicleMediaTable({
  vehicles,
  title = "Vehicles",
}: VehicleMediaTableProps) {
  const [sortKey, setSortKey] = React.useState<SortKey>("listingScore")
  const [sortAsc, setSortAsc] = React.useState(false)

  const data = vehicles ?? mockMerchandisingVehicles

  const sorted = [...data].sort((a, b) => {
    const diff = a[sortKey] - b[sortKey]
    return sortAsc ? diff : -diff
  })

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(false) }
  }

  function TH({ label, field }: { label: string; field?: SortKey }) {
    if (!field) {
      return (
        <th className="pb-2.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </th>
      )
    }
    return (
      <th className="pb-2.5">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 h-6 px-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground"
          onClick={() => toggleSort(field)}
        >
          {label}
          <ArrowUpDown className="ml-1 h-2.5 w-2.5" />
        </Button>
      </th>
    )
  }

  return (
    <div className="rounded-lg border bg-white">
      <div className="px-4 py-3 border-b">
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="pb-2.5 pl-4 w-14" />
              <TH label="Vehicle" />
              <TH label="Media" />
              <TH label="Status" />
              <TH label="Score" field="listingScore" />
              <TH label="Age" field="daysInStock" />
              <TH label="Views" field="vdpViews" />
              <TH label="Price" field="price" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((v) => {
              const mb = mediaBadge[v.mediaStatus]
              const pb = publishBadge[v.publishStatus]
              const hasIssue =
                v.mediaStatus === "no-photos" ||
                v.mediaStatus === "stock-photos" ||
                v.listingScore < 50

              return (
                <tr
                  key={v.vin}
                  className={cn(
                    "border-b last:border-0 transition-colors hover:bg-muted/30",
                    hasIssue && "bg-red-50/40"
                  )}
                >
                  {/* Thumbnail */}
                  <td className="py-2.5 pl-4">
                    {v.thumbnailUrl ? (
                      <img
                        src={v.thumbnailUrl}
                        alt={`${v.year} ${v.make} ${v.model}`}
                        className="h-8 w-12 rounded object-cover"
                      />
                    ) : (
                      <div className="h-8 w-12 rounded bg-muted flex items-center justify-center">
                        <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    )}
                  </td>

                  {/* Vehicle name + trim + missing desc indicator */}
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium whitespace-nowrap">
                        {v.year} {v.make} {v.model}
                      </span>
                      {!v.hasDescription && (
                        <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{v.trim}</p>
                  </td>

                  {/* Media — combined badge + count + capabilities */}
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", mb.className)}>
                        {mb.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {v.photoCount}
                      </span>
                      {v.has360 && <RotateCw className="h-3 w-3 text-blue-500" />}
                      {v.hasVideo && <Video className="h-3 w-3 text-violet-500" />}
                    </div>
                  </td>

                  {/* Publish status */}
                  <td className="py-2.5">
                    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", pb.className)}>
                      {pb.label}
                    </Badge>
                  </td>

                  {/* Score — number only, color-coded */}
                  <td className="py-2.5">
                    <span
                      className={cn(
                        "text-sm font-semibold tabular-nums",
                        v.listingScore >= 75
                          ? "text-emerald-600"
                          : v.listingScore >= 50
                            ? "text-amber-600"
                            : "text-red-600"
                      )}
                    >
                      {v.listingScore}
                    </span>
                  </td>

                  {/* Age */}
                  <td className="py-2.5">
                    <span
                      className={cn(
                        "text-sm tabular-nums",
                        v.daysInStock >= 45 && "text-red-600 font-semibold",
                        v.daysInStock >= 30 &&
                          v.daysInStock < 45 &&
                          "text-amber-600 font-semibold"
                      )}
                    >
                      {v.daysInStock}d
                    </span>
                  </td>

                  {/* Views */}
                  <td className="py-2.5 text-sm tabular-nums text-muted-foreground">
                    {v.vdpViews}
                  </td>

                  {/* Price */}
                  <td className="py-2.5 pr-4 text-sm tabular-nums">
                    {formatPrice(v.price)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
