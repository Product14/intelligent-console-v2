"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { STAGE_CONFIG } from "@/lib/inventory-mocks"
import { StageBadge, CampaignBadge, StatusIndicators } from "./stage-badge"
import type { VehicleSummary, VehicleStage, DashboardFilters } from "@/services/inventory/inventory.types"
import { fetchVehicleMedia } from "@/services/inventory/inventory-api"
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Zap,
  Sparkles,
  Settings2,
  ChevronRight,
  Globe,
  Info,
  ImageIcon,
  Phone,
  ArrowRight,
  Camera,
} from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

function VehicleThumbnail({ vin, alt }: { vin: string; alt: string }) {
  const [src, setSrc] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    fetchVehicleMedia(vin)
      .then((res) => {
        if (!cancelled && res.data.images.length > 0) {
          setSrc(res.data.images[0].url)
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [vin])

  if (src) {
    return <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" />
  }
  return <span className="text-[10px] text-muted-foreground font-mono">IMG</span>
}

type UpsellMode = "upsell-cloning-campaign" | "upsell-vini-call" | "upsell-real-media" | null

interface RiskTableProps {
  vehicles: VehicleSummary[]
  filters: DashboardFilters
  onFiltersChange: (filters: Partial<DashboardFilters>) => void
  onAccelerate: (vin: string) => void
  onViewPerformance?: (vin: string) => void
  upsellMode?: UpsellMode
  onUpsell?: () => void
}

type SortableColumn = "daysInStock" | "dailyBurn" | "leads" | "stage"

const stageOrder: Record<VehicleStage, number> = {
  fresh: 0,
  watch: 1,
  risk: 2,
  critical: 3,
}

export function RiskTable({ vehicles, filters, onFiltersChange, onAccelerate, onViewPerformance, upsellMode, onUpsell }: RiskTableProps) {
  const [selectedVins, setSelectedVins] = React.useState<Set<string>>(new Set())

  const filteredVehicles = React.useMemo(() => {
    let result = [...vehicles]

    if (filters.stage !== "all") {
      result = result.filter((v) => v.stage === filters.stage)
    }
    if (filters.campaignStatus !== "all") {
      result = result.filter((v) => v.campaignStatus === filters.campaignStatus)
    }
    if (filters.mediaType !== "all") {
      result = result.filter((v) => v.mediaType === filters.mediaType)
    }
    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        (v) =>
          v.vin.toLowerCase().includes(q) ||
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.trim.toLowerCase().includes(q)
      )
    }

    result.sort((a, b) => {
      const key = filters.sortBy as SortableColumn
      let cmp = 0
      if (key === "stage") {
        cmp = stageOrder[a.stage] - stageOrder[b.stage]
      } else {
        const aVal = a[key] as number
        const bVal = b[key] as number
        cmp = aVal - bVal
      }
      return filters.sortDir === "asc" ? cmp : -cmp
    })

    return result
  }, [vehicles, filters])

  const toggleSort = (col: SortableColumn) => {
    if (filters.sortBy === col) {
      onFiltersChange({ sortDir: filters.sortDir === "asc" ? "desc" : "asc" })
    } else {
      onFiltersChange({ sortBy: col, sortDir: "desc" })
    }
  }

  const toggleSelectAll = () => {
    if (selectedVins.size === filteredVehicles.length) {
      setSelectedVins(new Set())
    } else {
      setSelectedVins(new Set(filteredVehicles.map((v) => v.vin)))
    }
  }

  const toggleSelect = (vin: string) => {
    const next = new Set(selectedVins)
    if (next.has(vin)) next.delete(vin)
    else next.add(vin)
    setSelectedVins(next)
  }

  const SortHeader = ({ col, children }: { col: SortableColumn; children: React.ReactNode }) => {
    const isActive = filters.sortBy === col
    return (
      <button
        onClick={() => toggleSort(col)}
        className="flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
      >
        {children}
        {isActive ? (
          filters.sortDir === "asc" ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-40" />
        )}
      </button>
    )
  }

  const getActionButton = (vehicle: VehicleSummary) => {
    if (upsellMode === "upsell-cloning-campaign") {
      return (
        <Button
          size="sm"
          className="text-xs h-7 gap-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white"
          onClick={(e) => { e.preventDefault(); onUpsell?.() }}
        >
          <ImageIcon className="h-3 w-3" />
          Upgrade Media
        </Button>
      )
    }

    if (upsellMode === "upsell-vini-call") {
      if (vehicle.stage === "fresh") return null
      return (
        <Button
          size="sm"
          className="text-xs h-7 gap-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
          onClick={(e) => { e.preventDefault(); onUpsell?.() }}
        >
          <Phone className="h-3 w-3" />
          Activate + Vini
        </Button>
      )
    }

    if (upsellMode === "upsell-real-media" && vehicle.mediaType === "clone") {
      return (
        <Button
          size="sm"
          className="text-xs h-7 gap-1 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white"
          onClick={(e) => { e.preventDefault(); onUpsell?.() }}
        >
          <Camera className="h-3 w-3" />
          Upload Real
        </Button>
      )
    }

    switch (vehicle.stage) {
      case "fresh":
        return null
      case "watch":
        return (
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7 gap-1 border-amber-200 text-amber-700 hover:bg-amber-50"
            onClick={(e) => { e.preventDefault(); onAccelerate(vehicle.vin) }}
          >
            <Sparkles className="h-3 w-3" />
            Recommend
          </Button>
        )
      case "risk":
        return (
          <Button
            size="sm"
            className="text-xs h-7 gap-1 bg-orange-500 hover:bg-orange-600 text-white"
            onClick={(e) => { e.preventDefault(); onAccelerate(vehicle.vin) }}
          >
            <Zap className="h-3 w-3" />
            Accelerate
          </Button>
        )
      case "critical":
        return (
          <Button
            size="sm"
            className="text-xs h-7 gap-1 bg-red-500 hover:bg-red-600 text-white"
            onClick={(e) => { e.preventDefault(); onAccelerate(vehicle.vin) }}
          >
            <Settings2 className="h-3 w-3" />
            Optimize Now
          </Button>
        )
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Vehicle Inventory</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? "s" : ""} shown
              {selectedVins.size > 0 && (
                <span className="ml-2 text-foreground font-medium">
                  · {selectedVins.size} selected
                </span>
              )}
            </p>
          </div>
          {selectedVins.size > 0 && (
            <div className="flex items-center gap-2">
              {upsellMode === "upsell-real-media" ? (
                <>
                  <Button size="sm" className="text-xs h-8 gap-1 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white" onClick={() => onUpsell?.()}>
                    <Camera className="h-3 w-3" />
                    Bulk Upload Real Photos ({selectedVins.size})
                  </Button>
                </>
              ) : upsellMode === "upsell-cloning-campaign" ? (
                <>
                  <Button size="sm" className="text-xs h-8 gap-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white" onClick={() => onUpsell?.()}>
                    <ImageIcon className="h-3 w-3" />
                    Bulk Upgrade Media ({selectedVins.size})
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs h-8 gap-1 border-indigo-200 text-indigo-700 hover:bg-indigo-50" onClick={() => onUpsell?.()}>
                    <Sparkles className="h-3 w-3" />
                    Bulk Activate Campaigns
                  </Button>
                </>
              ) : upsellMode === "upsell-vini-call" ? (
                <>
                  <Button size="sm" className="text-xs h-8 gap-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white" onClick={() => onUpsell?.()}>
                    <Phone className="h-3 w-3" />
                    Bulk Add Vini Call ({selectedVins.size})
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs h-8 gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50" onClick={() => onUpsell?.()}>
                    <Zap className="h-3 w-3" />
                    Bulk Activate Campaigns
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="outline" className="text-xs h-8 gap-1">
                    <Zap className="h-3 w-3" />
                    Bulk Accelerate ({selectedVins.size})
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs h-8 gap-1">
                    <Sparkles className="h-3 w-3" />
                    Bulk Upgrade Media
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-y bg-gray-50/80">
                <th className="py-2.5 px-2 w-10">
                  <Checkbox
                    checked={selectedVins.size === filteredVehicles.length && filteredVehicles.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                <th className="py-2.5 px-2 text-left min-w-[180px]">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Vehicle</span>
                </th>
                <th className="py-2.5 px-2 pr-8 text-right whitespace-nowrap">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</span>
                </th>
                <th className="py-2.5 px-2 pl-8 text-left whitespace-nowrap">
                  <SortHeader col="daysInStock">Days</SortHeader>
                </th>
                <th className="py-2.5 px-2 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    <SortHeader col="dailyBurn">Burn/Day</SortHeader>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-muted-foreground cursor-help shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[220px]">
                        Margin Left = Sale Price − Cost − (Daily Burn × Days in Stock)
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className="py-2.5 px-2 text-right whitespace-nowrap">
                  <SortHeader col="leads">Leads</SortHeader>
                </th>
                <th className="py-2.5 px-2 text-left whitespace-nowrap">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Campaign</span>
                </th>
                <th className="py-2.5 px-2 text-left whitespace-nowrap">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</span>
                </th>
                <th className="py-2.5 px-2 text-center whitespace-nowrap">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1 justify-center">
                    <Globe className="h-3 w-3" />
                    Web Quality
                  </span>
                </th>
                <th className="py-2.5 px-2 text-right whitespace-nowrap">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredVehicles.map((vehicle) => {
                const isSelected = selectedVins.has(vehicle.vin)

                return (
                  <tr
                    key={vehicle.vin}
                    className={cn(
                      "group transition-colors hover:bg-gray-50/50",
                      isSelected && "bg-primary/5"
                    )}
                  >
                    <td className="py-2.5 px-2">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelect(vehicle.vin)}
                      />
                    </td>
                    <td className="py-2.5 px-2">
                      <Link href={`/inventory/${vehicle.vin}`} className="group/link flex items-center gap-2">
                        <div className="w-10 h-8 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          <VehicleThumbnail
                            vin={vehicle.vin}
                            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate group-hover/link:text-primary transition-colors">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {vehicle.trim} · {vehicle.vin.slice(-6)}
                          </p>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover/link:opacity-100 transition-opacity flex-shrink-0" />
                      </Link>
                    </td>
                    <td className="py-2.5 px-2 pr-8 text-right">
                      <span className="text-sm font-medium tabular-nums text-foreground">
                        ${(vehicle.acquisitionCost + vehicle.grossMargin).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 pl-8">
                      <span className={cn(
                        "text-sm font-semibold tabular-nums",
                        vehicle.daysInStock > 45 ? "text-red-600" : "text-foreground"
                      )}>
                        {vehicle.daysInStock}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <span className="text-sm font-medium tabular-nums text-foreground">
                        ${vehicle.dailyBurn}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <span className={cn(
                        "text-sm tabular-nums",
                        vehicle.leads === 0 ? "text-muted-foreground" : "text-foreground font-medium"
                      )}>
                        {vehicle.leads}
                      </span>
                    </td>
                    <td className="py-2.5 px-2">
                      {upsellMode === "upsell-real-media" && vehicle.mediaType === "clone" && vehicle.daysInStock >= 14 ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); e.preventDefault(); onUpsell?.() }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-300 cursor-pointer transition-colors"
                        >
                          <Camera className="h-3 w-3" />
                          Upload Real
                        </button>
                      ) : upsellMode === "upsell-cloning-campaign" && vehicle.campaignStatus === "none" ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); e.preventDefault(); onUpsell?.() }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 cursor-pointer transition-colors"
                        >
                          <Sparkles className="h-3 w-3" />
                          Get Cloning + Ads
                        </button>
                      ) : upsellMode === "upsell-vini-call" && vehicle.campaignStatus === "none" ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); e.preventDefault(); onUpsell?.() }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 cursor-pointer transition-colors"
                        >
                          <Phone className="h-3 w-3" />
                          Add Vini Call
                        </button>
                      ) : (
                        <CampaignBadge
                          status={vehicle.campaignStatus}
                          onActivate={vehicle.campaignStatus === "none" ? () => onAccelerate(vehicle.vin) : undefined}
                          onViewPerformance={vehicle.campaignStatus === "active" && onViewPerformance ? () => onViewPerformance(vehicle.vin) : undefined}
                          performanceCount={vehicle.campaignStatus === "active" ? Math.max(2, Math.round(vehicle.leads * 0.6 + vehicle.daysInStock * 0.15)) : undefined}
                          performanceLabel="leads"
                        />
                      )}
                    </td>
                    <td className="py-2.5 px-2">
                      <StatusIndicators
                        priceReduced={vehicle.priceReduced}
                        mediaType={vehicle.mediaType}
                        leads={vehicle.leads}
                        daysInStock={vehicle.daysInStock}
                        showCloneAge={upsellMode === "upsell-real-media"}
                      />
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap",
                        vehicle.attractionRisk === "optimized"
                          ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                          : vehicle.attractionRisk === "below-benchmark"
                            ? "text-amber-700 bg-amber-50 border-amber-200"
                            : "text-red-700 bg-red-50 border-red-200"
                      )}>
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          vehicle.attractionRisk === "optimized" ? "bg-emerald-500" :
                          vehicle.attractionRisk === "below-benchmark" ? "bg-amber-500" : "bg-red-500"
                        )} />
                        {vehicle.attractionRisk === "optimized" ? "Optimized" :
                         vehicle.attractionRisk === "below-benchmark" ? "Below Benchmark" : "Low Conversion"}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      {getActionButton(vehicle)}
                    </td>
                  </tr>
                )
              })}

              {filteredVehicles.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center">
                    <p className="text-sm text-muted-foreground">No vehicles match current filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
