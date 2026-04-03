"use client"

import * as React from "react"
import type { MerchandisingVehicle, MediaStatus, PublishStatus } from "@/services/max-2/max-2.types"
import { cn } from "@/lib/utils"
import {
  SpyneFilterSheet,
  SpyneFilterFacetSection,
  type SpyneFilterFacetRow,
} from "@/components/max-2/inventory-filter-panel"
import {
  Max2InventoryListHeader,
  type InventoryVehicleType,
} from "@/components/max-2/inventory-list-header"
import { SpyneChip, SpyneMetricChip, SpyneRemovableFilterChip } from "@/components/max-2/spyne-ui"
import {
  applyMerchandisingFilters,
  merchandisingDefaultFilters,
  merchandisingFiltersActive,
  merchandisingTransmissionFromVin,
  inMerchAgeBucket,
  type MerchandisingInventoryFilters,
  type MerchAgeBucket,
  type MerchPriceBucket,
  type MerchScoreBucket,
} from "@/lib/merchandising-inventory-filter-apply"

export type { InventoryVehicleType }
export type InventoryFilters = MerchandisingInventoryFilters
export const defaultFilters = merchandisingDefaultFilters

export function applyFilters(
  vehicles: MerchandisingVehicle[],
  filters: MerchandisingInventoryFilters
): MerchandisingVehicle[] {
  return applyMerchandisingFilters(vehicles, filters)
}

const validMediaStatuses = new Set(["real-photos", "clone-photos", "stock-photos", "no-photos"])
const validPublishStatuses = new Set(["live", "pending", "not-published"])

export function filtersFromSearchParams(
  params: URLSearchParams
): MerchandisingInventoryFilters {
  const f = { ...merchandisingDefaultFilters }

  const media = params.get("mediaStatus")
  if (media && validMediaStatuses.has(media)) f.mediaStatuses = [media as MediaStatus]

  const publish = params.get("publishStatus")
  if (publish && validPublishStatuses.has(publish)) f.publishStatuses = [publish as PublishStatus]

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

function facetRows(
  vehicles: MerchandisingVehicle[],
  idFn: (v: MerchandisingVehicle) => string,
  labelFn: (id: string) => string = (id) => id
): SpyneFilterFacetRow[] {
  const m = new Map<string, number>()
  for (const v of vehicles) {
    const id = idFn(v)
    m.set(id, (m.get(id) ?? 0) + 1)
  }
  return [...m.entries()].map(([id, count]) => ({
    id,
    label: labelFn(id),
    count,
  }))
}

const mediaLabels: Record<MediaStatus, string> = {
  "real-photos": "Real photos",
  "clone-photos": "Clone photos",
  "stock-photos": "Stock photos",
  "no-photos": "No photos",
}

const publishLabels: Record<PublishStatus, string> = {
  live: "Live",
  pending: "Pending",
  "not-published": "Draft",
}

const ageBucketDefs: { id: MerchAgeBucket; label: string }[] = [
  { id: "0-30", label: "0-30 Days" },
  { id: "31-89", label: "31-89 Days" },
  { id: "90+", label: "90+ Days" },
]

const priceBucketDefs: { id: MerchPriceBucket; label: string }[] = [
  { id: "u20", label: "Under $20K" },
  { id: "20-30", label: "$20K – $30K" },
  { id: "30-40", label: "$30K – $40K" },
  { id: "40+", label: "$40K+" },
]

const scoreBucketDefs: { id: MerchScoreBucket; label: string }[] = [
  { id: "low", label: "Low (<50)" },
  { id: "mid", label: "Medium (50–79)" },
  { id: "high", label: "High (80+)" },
]

const MERCH_SEARCH_HINT_ROTATION: string[] = [
  "Search by VIN…",
  "Search by make or model…",
  "Search by trim…",
]

interface InventoryFilterBarProps {
  filters: MerchandisingInventoryFilters
  onFiltersChange: (filters: MerchandisingInventoryFilters) => void
  allVehicles: MerchandisingVehicle[]
  tabCounts: { all: number; new: number; used: number }
}

export function InventoryFilterBar({
  filters,
  onFiltersChange,
  allVehicles,
  tabCounts,
}: InventoryFilterBarProps) {
  const [viewInput, setViewInput] = React.useState(false)
  const [filtersSheetOpen, setFiltersSheetOpen] = React.useState(false)

  const update = (partial: Partial<MerchandisingInventoryFilters>) => {
    onFiltersChange({ ...filters, ...partial })
  }

  const hasActiveFilters = merchandisingFiltersActive(filters)

  const tabScoped = React.useMemo(() => {
    let v = [...allVehicles]
    if (filters.vehicleType === "new") v = v.filter((x) => x.isNew)
    else if (filters.vehicleType === "used") v = v.filter((x) => !x.isNew)
    return v
  }, [allVehicles, filters.vehicleType])

  const makeRows = React.useMemo(
    () => facetRows(tabScoped, (v) => v.make),
    [tabScoped]
  )
  const modelRows = React.useMemo(
    () => facetRows(tabScoped, (v) => v.model),
    [tabScoped]
  )
  const yearRows = React.useMemo(
    () => facetRows(tabScoped, (v) => String(v.year)),
    [tabScoped]
  )
  const trimRows = React.useMemo(
    () => facetRows(tabScoped, (v) => v.trim),
    [tabScoped]
  )
  const transmissionRows = React.useMemo((): SpyneFilterFacetRow[] => {
    let manual = 0
    let auto = 0
    for (const v of tabScoped) {
      if (merchandisingTransmissionFromVin(v.vin) === "manual") manual++
      else auto++
    }
    return [
      { id: "manual", label: "Manual", count: manual },
      { id: "automatic", label: "Automatic", count: auto },
    ]
  }, [tabScoped])

  const ageBucketRows = React.useMemo(
    () =>
      ageBucketDefs.map((b) => ({
        id: b.id,
        label: b.label,
        count: tabScoped.filter((v) => inMerchAgeBucket(v.daysInStock, b.id)).length,
      })),
    [tabScoped]
  )

  const mediaRows = React.useMemo((): SpyneFilterFacetRow[] => {
    const order: MediaStatus[] = ["real-photos", "clone-photos", "stock-photos", "no-photos"]
    return order.map((id) => ({
      id,
      label: mediaLabels[id],
      count: tabScoped.filter((v) => v.mediaStatus === id).length,
    }))
  }, [tabScoped])

  const publishRows = React.useMemo((): SpyneFilterFacetRow[] => {
    const order: PublishStatus[] = ["live", "pending", "not-published"]
    return order.map((id) => ({
      id,
      label: publishLabels[id],
      count: tabScoped.filter((v) => v.publishStatus === id).length,
    }))
  }, [tabScoped])

  const priceRows = React.useMemo(
    () =>
      priceBucketDefs.map((b) => ({
        id: b.id,
        label: b.label,
        count: tabScoped.filter((v) => {
          if (b.id === "u20") return v.price < 20000
          if (b.id === "20-30") return v.price >= 20000 && v.price < 30000
          if (b.id === "30-40") return v.price >= 30000 && v.price < 40000
          return v.price >= 40000
        }).length,
      })),
    [tabScoped]
  )

  const scoreRows = React.useMemo(
    () =>
      scoreBucketDefs.map((b) => ({
        id: b.id,
        label: b.label,
        count: tabScoped.filter((v) => {
          if (b.id === "low") return v.listingScore < 50
          if (b.id === "mid") return v.listingScore >= 50 && v.listingScore < 80
          return v.listingScore >= 80
        }).length,
      })),
    [tabScoped]
  )

  const certifiedCount = tabScoped.filter((v) => v.listingScore >= 80).length
  const wholesaleCount = tabScoped.filter((v) => v.publishStatus === "not-published").length
  const retailCount = tabScoped.filter((v) => v.publishStatus === "live").length
  const recentsCount = tabScoped.filter((v) => v.daysInStock <= 7).length
  const age40Count = tabScoped.filter((v) => v.daysInStock > 40).length

  const chipCertified =
    filters.scoreBuckets.includes("high") && filters.scoreBuckets.length === 1
  const chipWholesale =
    filters.publishStatuses.length === 1 && filters.publishStatuses[0] === "not-published"
  const chipRetail = filters.publishStatuses.length === 1 && filters.publishStatuses[0] === "live"
  const chipRecents =
    filters.ageBuckets.length === 0 &&
    filters.ageMax === 7 &&
    filters.ageMin === null
  const chipAge40 =
    filters.ageBuckets.length === 0 && filters.ageMin === 41 && filters.ageMax === null

  const toggleCertified = () => {
    if (chipCertified) update({ scoreBuckets: [] })
    else update({ scoreBuckets: ["high"], scoreMin: null })
  }
  const toggleWholesale = () => {
    if (chipWholesale) update({ publishStatuses: [] })
    else update({ publishStatuses: ["not-published"] })
  }
  const toggleRetail = () => {
    if (chipRetail) update({ publishStatuses: [] })
    else update({ publishStatuses: ["live"] })
  }
  const toggleRecents = () => {
    if (chipRecents) update({ ageMax: null, ageMin: null })
    else update({ ageMax: 7, ageMin: null, ageBuckets: [] })
  }
  const toggleAge40 = () => {
    if (chipAge40) update({ ageMin: null })
    else update({ ageMin: 41, ageMax: null, ageBuckets: [] })
  }

  const toggleString = (key: "makes" | "models" | "trims", id: string) => {
    const arr = filters[key]
    update({
      [key]: arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id],
    })
  }

  const toggleYear = (id: string) => {
    const y = Number(id)
    update({
      years: filters.years.includes(y) ? filters.years.filter((x) => x !== y) : [...filters.years, y],
    })
  }

  const toggleTransmission = (id: string) => {
    const t = id as "manual" | "automatic"
    update({
      transmissions: filters.transmissions.includes(t)
        ? filters.transmissions.filter((x) => x !== t)
        : [...filters.transmissions, t],
    })
  }

  const toggleAgeBucket = (id: string) => {
    const b = id as MerchAgeBucket
    update({
      ageBuckets: filters.ageBuckets.includes(b)
        ? filters.ageBuckets.filter((x) => x !== b)
        : [...filters.ageBuckets, b],
      ageMin: null,
      ageMax: null,
    })
  }

  const toggleMedia = (id: string) => {
    const m = id as MediaStatus
    update({
      mediaStatuses: filters.mediaStatuses.includes(m)
        ? filters.mediaStatuses.filter((x) => x !== m)
        : [...filters.mediaStatuses, m],
    })
  }

  const togglePublish = (id: string) => {
    const p = id as PublishStatus
    update({
      publishStatuses: filters.publishStatuses.includes(p)
        ? filters.publishStatuses.filter((x) => x !== p)
        : [...filters.publishStatuses, p],
    })
  }

  const togglePriceBucket = (id: string) => {
    const b = id as MerchPriceBucket
    update({
      priceBuckets: filters.priceBuckets.includes(b)
        ? filters.priceBuckets.filter((x) => x !== b)
        : [...filters.priceBuckets, b],
      priceMin: null,
      priceMax: null,
    })
  }

  const toggleScoreBucket = (id: string) => {
    const b = id as MerchScoreBucket
    update({
      scoreBuckets: filters.scoreBuckets.includes(b)
        ? filters.scoreBuckets.filter((x) => x !== b)
        : [...filters.scoreBuckets, b],
      scoreMin: null,
    })
  }

  const selectedMakes = new Set(filters.makes)
  const selectedModels = new Set(filters.models)
  const selectedYears = new Set(filters.years.map(String))
  const selectedTrims = new Set(filters.trims)
  const selectedTransmissions = new Set(filters.transmissions)
  const selectedAgeBuckets = new Set(filters.ageBuckets)
  const selectedMedia = new Set(filters.mediaStatuses)
  const selectedPublish = new Set(filters.publishStatuses)
  const selectedPrice = new Set(filters.priceBuckets)
  const selectedScore = new Set(filters.scoreBuckets)

  return (
    <div className="space-y-4" data-view-input={viewInput ? "true" : "false"}>
      <Max2InventoryListHeader
        vehicleType={filters.vehicleType}
        onVehicleTypeChange={(t) => update({ vehicleType: t as InventoryVehicleType })}
        counts={tabCounts}
        searchPlaceholder="Search"
        searchHintRotation={MERCH_SEARCH_HINT_ROTATION}
        searchValue={filters.search}
        onSearchChange={(search) => update({ search })}
        viewInput={{ checked: viewInput, onCheckedChange: setViewInput }}
        onApplyFiltersClick={() => setFiltersSheetOpen(true)}
        addVehicleHref="/max-2/studio/add"
        addVehicleLabel="Add Vehicle"
        quickChips={
          <>
            <SpyneMetricChip
              label="Certified"
              count={certifiedCount}
              active={chipCertified}
              onClick={toggleCertified}
            />
            <SpyneMetricChip
              label="Wholesale"
              count={wholesaleCount}
              active={chipWholesale}
              onClick={toggleWholesale}
            />
            <SpyneMetricChip
              label="Retail"
              count={retailCount}
              active={chipRetail}
              onClick={toggleRetail}
            />
            <SpyneMetricChip
              label="Recents"
              count={recentsCount}
              active={chipRecents}
              onClick={toggleRecents}
            />
            <SpyneMetricChip
              label="Age >40 days"
              count={age40Count}
              active={chipAge40}
              onClick={toggleAge40}
            />
          </>
        }
      />

      <SpyneFilterSheet
        open={filtersSheetOpen}
        onOpenChange={setFiltersSheetOpen}
        onClearFilters={() => onFiltersChange(merchandisingDefaultFilters)}
        onShowResults={() => setFiltersSheetOpen(false)}
        clearLabel="Clear Filters"
        applyLabel="Show Vehicles"
      >
        <SpyneFilterFacetSection
          title="Make"
          rows={makeRows}
          selectedIds={selectedMakes}
          onToggle={(id) => toggleString("makes", id)}
        />
        <SpyneFilterFacetSection
          title="Model"
          rows={modelRows}
          selectedIds={selectedModels}
          onToggle={(id) => toggleString("models", id)}
        />
        <SpyneFilterFacetSection
          title="Year"
          rows={yearRows}
          selectedIds={selectedYears}
          onToggle={toggleYear}
        />
        <SpyneFilterFacetSection
          title="Trim"
          rows={trimRows}
          selectedIds={selectedTrims}
          onToggle={(id) => toggleString("trims", id)}
        />
        <SpyneFilterFacetSection
          title="Transmission"
          rows={transmissionRows}
          selectedIds={selectedTransmissions}
          onToggle={toggleTransmission}
        />
        <SpyneFilterFacetSection
          title="Age"
          rows={ageBucketRows}
          selectedIds={selectedAgeBuckets}
          onToggle={toggleAgeBucket}
        />
        <SpyneFilterFacetSection
          title="Media"
          rows={mediaRows}
          selectedIds={selectedMedia}
          onToggle={toggleMedia}
        />
        <SpyneFilterFacetSection
          title="Publish status"
          rows={publishRows}
          selectedIds={selectedPublish}
          onToggle={togglePublish}
        />
        <SpyneFilterFacetSection
          title="Price"
          rows={priceRows}
          selectedIds={selectedPrice}
          onToggle={togglePriceBucket}
        />
        <SpyneFilterFacetSection
          title="Listing score"
          rows={scoreRows}
          selectedIds={selectedScore}
          onToggle={toggleScoreBucket}
        />
      </SpyneFilterSheet>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-medium uppercase tracking-wider text-spyne-text-secondary">
            Filtered by
          </span>
          {filters.makes.map((m) => (
            <RemovableChip key={m} label={`Make: ${m}`} onRemove={() => toggleString("makes", m)} />
          ))}
          {filters.models.map((m) => (
            <RemovableChip key={m} label={`Model: ${m}`} onRemove={() => toggleString("models", m)} />
          ))}
          {filters.years.map((y) => (
            <RemovableChip
              key={y}
              label={`Year: ${y}`}
              onRemove={() => toggleYear(String(y))}
            />
          ))}
          {filters.trims.map((t) => (
            <RemovableChip key={t} label={`Trim: ${t}`} onRemove={() => toggleString("trims", t)} />
          ))}
          {filters.transmissions.map((t) => (
            <RemovableChip
              key={t}
              label={t === "manual" ? "Transmission: Manual" : "Transmission: Automatic"}
              onRemove={() => toggleTransmission(t)}
            />
          ))}
          {filters.ageBuckets.map((b) => (
            <RemovableChip
              key={b}
              label={`Age: ${b}`}
              onRemove={() => toggleAgeBucket(b)}
            />
          ))}
          {filters.mediaStatuses.map((m) => (
            <RemovableChip
              key={m}
              label={`Media: ${mediaLabels[m]}`}
              onRemove={() => toggleMedia(m)}
            />
          ))}
          {filters.publishStatuses.map((p) => (
            <RemovableChip
              key={p}
              label={`Status: ${publishLabels[p]}`}
              onRemove={() => togglePublish(p)}
            />
          ))}
          {filters.priceBuckets.map((p) => (
            <RemovableChip
              key={p}
              label={`Price: ${priceBucketDefs.find((d) => d.id === p)?.label ?? p}`}
              onRemove={() => togglePriceBucket(p)}
            />
          ))}
          {filters.scoreBuckets.map((s) => (
            <RemovableChip
              key={s}
              label={`Score: ${scoreBucketDefs.find((d) => d.id === s)?.label ?? s}`}
              onRemove={() => toggleScoreBucket(s)}
            />
          ))}
          {filters.ageMin !== null && (
            <RemovableChip label={`Age ≥ ${filters.ageMin}d`} onRemove={() => update({ ageMin: null })} />
          )}
          {filters.ageMax !== null && (
            <RemovableChip label={`Age ≤ ${filters.ageMax}d`} onRemove={() => update({ ageMax: null })} />
          )}
          {filters.priceMin !== null && (
            <RemovableChip
              label={`Price ≥ $${filters.priceMin.toLocaleString()}`}
              onRemove={() => update({ priceMin: null })}
            />
          )}
          {filters.priceMax !== null && (
            <RemovableChip
              label={`Price ≤ $${filters.priceMax.toLocaleString()}`}
              onRemove={() => update({ priceMax: null })}
            />
          )}
          {filters.scoreMin !== null && (
            <RemovableChip
              label={`Score ≥ ${filters.scoreMin}`}
              onRemove={() => update({ scoreMin: null })}
            />
          )}
          <SpyneChip
            as="button"
            type="button"
            variant="outline"
            tone="neutral"
            compact
            className="text-spyne-text-secondary hover:text-spyne-text"
            onClick={() => onFiltersChange(merchandisingDefaultFilters)}
          >
            Clear all
          </SpyneChip>
        </div>
      )}
    </div>
  )
}

function RemovableChip({
  label,
  onRemove,
}: {
  label: string
  onRemove: () => void
}) {
  return <SpyneRemovableFilterChip label={label} onRemove={onRemove} />
}
