"use client"

import * as React from "react"
import type { MerchandisingVehicle, MediaStatus, PublishStatus } from "@/services/max-2/max-2.types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Search, X, SlidersHorizontal } from "lucide-react"

type VehicleType = "all" | "new" | "used"

export interface InventoryFilters {
  search: string
  vehicleType: VehicleType
  mediaStatus: MediaStatus | "all"
  publishStatus: PublishStatus | "all"
  ageMin: number | null
  ageMax: number | null
  priceMin: number | null
  priceMax: number | null
  scoreMin: number | null
}

export const defaultFilters: InventoryFilters = {
  search: "",
  vehicleType: "all",
  mediaStatus: "all",
  publishStatus: "all",
  ageMin: null,
  ageMax: null,
  priceMin: null,
  priceMax: null,
  scoreMin: null,
}

const validMediaStatuses = new Set(["real-photos", "clone-photos", "stock-photos", "no-photos"])
const validPublishStatuses = new Set(["live", "pending", "not-published"])

export function filtersFromSearchParams(
  params: URLSearchParams
): InventoryFilters {
  const f = { ...defaultFilters }

  const media = params.get("mediaStatus")
  if (media && validMediaStatuses.has(media)) f.mediaStatus = media as MediaStatus

  const publish = params.get("publishStatus")
  if (publish && validPublishStatuses.has(publish)) f.publishStatus = publish as PublishStatus

  const ageMin = params.get("ageMin")
  if (ageMin) f.ageMin = Number(ageMin) || null

  const ageMax = params.get("ageMax")
  if (ageMax) f.ageMax = Number(ageMax) || null

  const scoreMin = params.get("scoreMin")
  if (scoreMin) f.scoreMin = Number(scoreMin) ?? null

  const search = params.get("search")
  if (search) f.search = search

  return f
}

export function applyFilters(
  vehicles: MerchandisingVehicle[],
  filters: InventoryFilters
): MerchandisingVehicle[] {
  let result = [...vehicles]

  if (filters.vehicleType === "new") result = result.filter((v) => v.isNew)
  else if (filters.vehicleType === "used") result = result.filter((v) => !v.isNew)

  if (filters.mediaStatus !== "all") result = result.filter((v) => v.mediaStatus === filters.mediaStatus)
  if (filters.publishStatus !== "all") result = result.filter((v) => v.publishStatus === filters.publishStatus)
  if (filters.ageMin !== null) result = result.filter((v) => v.daysInStock >= filters.ageMin!)
  if (filters.ageMax !== null) result = result.filter((v) => v.daysInStock <= filters.ageMax!)
  if (filters.priceMin !== null) result = result.filter((v) => v.price >= filters.priceMin!)
  if (filters.priceMax !== null) result = result.filter((v) => v.price <= filters.priceMax!)
  if (filters.scoreMin !== null) result = result.filter((v) => v.listingScore >= filters.scoreMin!)

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

  return result
}

interface InventoryTabBarProps {
  activeType: VehicleType
  onTypeChange: (t: VehicleType) => void
  counts: { all: number; new: number; used: number }
}

export function InventoryTabBar({ activeType, onTypeChange, counts }: InventoryTabBarProps) {
  const tabs: { id: VehicleType; label: string; count: number }[] = [
    { id: "all", label: "All", count: counts.all },
    { id: "new", label: "New", count: counts.new },
    { id: "used", label: "Pre-Owned", count: counts.used },
  ]

  return (
    <div className="inline-flex gap-0.5 bg-muted rounded-lg p-0.5">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTypeChange(tab.id)}
          className={cn(
            "px-3.5 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1.5",
            activeType === tab.id
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
          <span className={cn(
            "text-[11px] tabular-nums",
            activeType === tab.id ? "text-muted-foreground" : "text-muted-foreground/50"
          )}>
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  )
}

const mediaStatusOptions: { id: MediaStatus | "all"; label: string }[] = [
  { id: "all", label: "All Media" },
  { id: "real-photos", label: "Real" },
  { id: "clone-photos", label: "Clone" },
  { id: "stock-photos", label: "Stock" },
  { id: "no-photos", label: "None" },
]

const publishStatusOptions: { id: PublishStatus | "all"; label: string }[] = [
  { id: "all", label: "All Status" },
  { id: "live", label: "Live" },
  { id: "pending", label: "Pending" },
  { id: "not-published", label: "Draft" },
]

interface InventoryFilterBarProps {
  filters: InventoryFilters
  onFiltersChange: (filters: InventoryFilters) => void
  allVehicles: MerchandisingVehicle[]
}

export function InventoryFilterBar({ filters, onFiltersChange, allVehicles }: InventoryFilterBarProps) {
  const [showAdvanced, setShowAdvanced] = React.useState(false)

  const update = (partial: Partial<InventoryFilters>) => {
    onFiltersChange({ ...filters, ...partial })
  }

  const hasActiveFilters =
    filters.mediaStatus !== "all" ||
    filters.publishStatus !== "all" ||
    filters.ageMin !== null ||
    filters.ageMax !== null ||
    filters.priceMin !== null ||
    filters.priceMax !== null ||
    filters.scoreMin !== null

  const needPhotos = allVehicles.filter(
    (v) => v.mediaStatus === "no-photos" || v.mediaStatus === "stock-photos"
  ).length
  const lowScore = allVehicles.filter((v) => v.listingScore < 50).length
  const aged45 = allVehicles.filter((v) => v.daysInStock > 45).length
  const noDesc = allVehicles.filter((v) => !v.hasDescription).length

  const shortcuts = [
    {
      label: `${needPhotos} need photos`,
      count: needPhotos,
      color: "text-red-700 bg-red-50 border-red-200",
      onClick: () => update({ mediaStatus: filters.mediaStatus === "no-photos" ? "all" : "no-photos" }),
      active: filters.mediaStatus === "no-photos",
    },
    {
      label: `${lowScore} low score`,
      count: lowScore,
      color: "text-amber-700 bg-amber-50 border-amber-200",
      onClick: () => update({ scoreMin: filters.scoreMin === null ? 0 : null, ...(filters.scoreMin === null ? {} : { scoreMin: null }) }),
      active: filters.scoreMin !== null,
    },
    {
      label: `${aged45} aged 45+`,
      count: aged45,
      color: "text-orange-700 bg-orange-50 border-orange-200",
      onClick: () => update({ ageMin: filters.ageMin === 45 ? null : 45 }),
      active: filters.ageMin === 45,
    },
    {
      label: `${noDesc} no desc`,
      count: noDesc,
      color: "text-violet-700 bg-violet-50 border-violet-200",
      onClick: () => {},
      active: false,
    },
  ].filter((s) => s.count > 0)

  return (
    <div className="space-y-3">
      {/* Main row: search + shortcuts + filters button */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search VIN, make, model…"
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            className="pl-8 h-8 text-sm"
          />
        </div>

        {/* Quick metric shortcuts */}
        {shortcuts.map((sc) => (
          <button
            key={sc.label}
            onClick={sc.onClick}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border transition-colors",
              sc.active ? "ring-2 ring-primary/20 border-primary" : sc.color
            )}
          >
            {sc.label}
          </button>
        ))}

        <div className="h-4 w-px bg-border" />

        {/* Filter pills — media status */}
        <div className="flex gap-0.5">
          {mediaStatusOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => update({ mediaStatus: opt.id })}
              className={cn(
                "px-2 py-0.5 text-[11px] font-medium rounded-full border transition-colors",
                filters.mediaStatus === opt.id
                  ? "bg-foreground text-background border-foreground"
                  : "text-muted-foreground border-transparent hover:bg-muted"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Filter pills — publish status */}
        <div className="flex gap-0.5">
          {publishStatusOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => update({ publishStatus: opt.id })}
              className={cn(
                "px-2 py-0.5 text-[11px] font-medium rounded-full border transition-colors",
                filters.publishStatus === opt.id
                  ? "bg-foreground text-background border-foreground"
                  : "text-muted-foreground border-transparent hover:bg-muted"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 h-7 text-xs"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <SlidersHorizontal className="h-3 w-3" />
          More
        </Button>

        {hasActiveFilters && (
          <button
            className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
            onClick={() => onFiltersChange(defaultFilters)}
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Filtered by</span>
          {filters.mediaStatus !== "all" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-foreground/5 border px-2.5 py-1 text-[11px] font-medium text-foreground">
              Media: {mediaStatusOptions.find((o) => o.id === filters.mediaStatus)?.label}
              <button type="button" onClick={() => update({ mediaStatus: "all" })} className="ml-0.5 hover:text-red-500 transition-colors"><X className="h-3 w-3" /></button>
            </span>
          )}
          {filters.publishStatus !== "all" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-foreground/5 border px-2.5 py-1 text-[11px] font-medium text-foreground">
              Status: {publishStatusOptions.find((o) => o.id === filters.publishStatus)?.label}
              <button type="button" onClick={() => update({ publishStatus: "all" })} className="ml-0.5 hover:text-red-500 transition-colors"><X className="h-3 w-3" /></button>
            </span>
          )}
          {filters.ageMin !== null && (
            <span className="inline-flex items-center gap-1 rounded-full bg-foreground/5 border px-2.5 py-1 text-[11px] font-medium text-foreground">
              Age ≥ {filters.ageMin}d
              <button type="button" onClick={() => update({ ageMin: null })} className="ml-0.5 hover:text-red-500 transition-colors"><X className="h-3 w-3" /></button>
            </span>
          )}
          {filters.ageMax !== null && (
            <span className="inline-flex items-center gap-1 rounded-full bg-foreground/5 border px-2.5 py-1 text-[11px] font-medium text-foreground">
              Age ≤ {filters.ageMax}d
              <button type="button" onClick={() => update({ ageMax: null })} className="ml-0.5 hover:text-red-500 transition-colors"><X className="h-3 w-3" /></button>
            </span>
          )}
          {filters.priceMin !== null && (
            <span className="inline-flex items-center gap-1 rounded-full bg-foreground/5 border px-2.5 py-1 text-[11px] font-medium text-foreground">
              Price ≥ ${filters.priceMin.toLocaleString()}
              <button type="button" onClick={() => update({ priceMin: null })} className="ml-0.5 hover:text-red-500 transition-colors"><X className="h-3 w-3" /></button>
            </span>
          )}
          {filters.priceMax !== null && (
            <span className="inline-flex items-center gap-1 rounded-full bg-foreground/5 border px-2.5 py-1 text-[11px] font-medium text-foreground">
              Price ≤ ${filters.priceMax.toLocaleString()}
              <button type="button" onClick={() => update({ priceMax: null })} className="ml-0.5 hover:text-red-500 transition-colors"><X className="h-3 w-3" /></button>
            </span>
          )}
          {filters.scoreMin !== null && (
            <span className="inline-flex items-center gap-1 rounded-full bg-foreground/5 border px-2.5 py-1 text-[11px] font-medium text-foreground">
              Score ≥ {filters.scoreMin}
              <button type="button" onClick={() => update({ scoreMin: null })} className="ml-0.5 hover:text-red-500 transition-colors"><X className="h-3 w-3" /></button>
            </span>
          )}
        </div>
      )}

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="rounded-lg border bg-muted/20 p-3 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1 block">
              Age (days)
            </label>
            <div className="flex gap-1.5">
              <Input
                type="number" placeholder="Min"
                value={filters.ageMin ?? ""}
                onChange={(e) => update({ ageMin: e.target.value ? Number(e.target.value) : null })}
                className="h-7 text-xs"
              />
              <Input
                type="number" placeholder="Max"
                value={filters.ageMax ?? ""}
                onChange={(e) => update({ ageMax: e.target.value ? Number(e.target.value) : null })}
                className="h-7 text-xs"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1 block">
              Price ($)
            </label>
            <div className="flex gap-1.5">
              <Input
                type="number" placeholder="Min"
                value={filters.priceMin ?? ""}
                onChange={(e) => update({ priceMin: e.target.value ? Number(e.target.value) : null })}
                className="h-7 text-xs"
              />
              <Input
                type="number" placeholder="Max"
                value={filters.priceMax ?? ""}
                onChange={(e) => update({ priceMax: e.target.value ? Number(e.target.value) : null })}
                className="h-7 text-xs"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1 block">
              Min Score
            </label>
            <Input
              type="number" placeholder="e.g. 50"
              value={filters.scoreMin ?? ""}
              onChange={(e) => update({ scoreMin: e.target.value ? Number(e.target.value) : null })}
              className="h-7 text-xs"
            />
          </div>
        </div>
      )}
    </div>
  )
}
