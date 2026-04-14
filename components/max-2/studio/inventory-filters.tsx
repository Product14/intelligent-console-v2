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
import { SpyneMetricChip, SpyneRemovableFilterChip } from "@/components/max-2/spyne-ui"
import {
  applyMerchandisingFilters,
  MERCH_LOT_FOCUS_LABELS,
  MERCH_MEDIA_ISSUE_LABELS,
  merchandisingDefaultFilters,
  merchandisingRemovableFilterRowVisible,
  merchandisingTransmissionFromVin,
  inMerchAgeBucket,
  parseMerchLotFocusFromSearchParams,
  parseMerchMediaIssueFromSearchParams,
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

const validLotPriceRangeKeys = new Set([
  "under-15k",
  "15k-25k",
  "25k-35k",
  "35k-50k",
  "50k+",
])

const lotPriceRangeChipLabel: Record<string, string> = {
  "under-15k": "Under $15K",
  "15k-25k": "$15K – $25K",
  "25k-35k": "$25K – $35K",
  "35k-50k": "$35K – $50K",
  "50k+": "$50K+",
}

export function filtersFromSearchParams(
  params: URLSearchParams
): MerchandisingInventoryFilters {
  const f = { ...merchandisingDefaultFilters }

  const vehicleType = params.get("vehicleType")
  if (vehicleType === "new" || vehicleType === "used") {
    f.vehicleType = vehicleType
  }

  /** Same as overview links: `media`, `mediaStatus`, and shorthand values. */
  const mediaRaw = params.get("mediaStatus") ?? params.get("media")
  if (mediaRaw === "needs-real") {
    f.needsRealPhotosOnly = true
  } else if (mediaRaw === "cgi") {
    f.mediaStatuses = ["clone-photos"]
  } else if (mediaRaw && validMediaStatuses.has(mediaRaw)) {
    f.mediaStatuses = [mediaRaw as MediaStatus]
  }

  const publishRaw = params.get("publishStatus") ?? params.get("status")
  if (publishRaw === "unpublished") {
    f.publishStatuses = ["pending", "not-published"]
  } else if (publishRaw && validPublishStatuses.has(publishRaw)) {
    f.publishStatuses = [publishRaw as PublishStatus]
  }

  const ageMinParam = params.get("ageMin")
  const ageMaxParam = params.get("ageMax")
  const ageShorthand = params.get("age")
  const parseAgeInt = (s: string | null): number | null => {
    if (s === null || s === "") return null
    const n = Number(s)
    return Number.isFinite(n) ? n : null
  }
  if (ageMinParam !== null) f.ageMin = parseAgeInt(ageMinParam)
  else if (ageShorthand === "30") {
    f.ageMin = 30
    f.ageMax = null
  }
  if (ageMaxParam !== null) f.ageMax = parseAgeInt(ageMaxParam)

  const scoreMin = params.get("scoreMin")
  if (scoreMin) f.scoreMin = Number(scoreMin) ?? null

  const search = params.get("search")
  if (search) f.search = search

  const vin = params.get("vin")
  if (vin && !f.search) f.search = vin

  if (params.get("desc") === "missing") {
    f.missingDescriptionOnly = true
  }

  f.mediaIssue = parseMerchMediaIssueFromSearchParams(params)

  f.merchFocus = parseMerchLotFocusFromSearchParams(params)

  const bodyType = params.get("bodyType")
  if (bodyType) f.merchBodyType = bodyType

  const priceRange = params.get("priceRange")
  if (priceRange && validLotPriceRangeKeys.has(priceRange)) {
    f.lotPriceRangeKey = priceRange
  }

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
  "not-published": "Not published",
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

  const hasActiveFilters = merchandisingRemovableFilterRowVisible(filters)

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

  const chipCertified =
    filters.scoreBuckets.includes("high") && filters.scoreBuckets.length === 1

  const inReviewCount = tabScoped.filter((v) => v.publishStatus === "pending").length
  const failedCount = tabScoped.filter((v) => v.listingScore < 50).length
  const ageOver30Count = tabScoped.filter((v) => v.daysInStock > 30).length
  const odometerMissingCount = tabScoped.filter((v) => v.odometer <= 0).length
  const priceMissingCount = tabScoped.filter((v) => v.price <= 0).length

  const chipInReview =
    filters.publishStatuses.length === 1 && filters.publishStatuses[0] === "pending"
  const chipFailed =
    filters.scoreBuckets.length === 1 && filters.scoreBuckets[0] === "low"
  const chipAge30 =
    filters.ageBuckets.length === 0 &&
    filters.ageMin === 31 &&
    filters.ageMax === null
  const chipOdometerMissing = filters.missingOdometerOnly
  const chipPriceMissing = filters.missingPriceOnly

  const toggleCertified = () => {
    if (chipCertified) update({ scoreBuckets: [] })
    else update({ scoreBuckets: ["high"], scoreMin: null })
  }

  const toggleInReview = () => {
    if (chipInReview) update({ publishStatuses: [] })
    else update({ publishStatuses: ["pending"] })
  }

  const toggleFailed = () => {
    if (chipFailed) update({ scoreBuckets: [], scoreMin: null })
    else update({ scoreBuckets: ["low"], scoreMin: null })
  }

  const toggleAge30 = () => {
    if (chipAge30) update({ ageMin: null })
    else update({ ageMin: 31, ageMax: null, ageBuckets: [] })
  }

  const toggleOdometerMissing = () => {
    update({ missingOdometerOnly: !filters.missingOdometerOnly })
  }

  const togglePriceMissing = () => {
    update({ missingPriceOnly: !filters.missingPriceOnly })
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

        onApplyFiltersClick={() => setFiltersSheetOpen(true)}
        addVehicleHref="/max-2/studio/add"
        addVehicleLabel="Add vehicle(s)"
        soldInventoryHref="/max-2/studio/sold-inventory"
        quickChips={
          <>
            <SpyneMetricChip
              className="shrink-0"
              label="Certified"
              count={certifiedCount}
              active={chipCertified}
              onClick={toggleCertified}
            />
            <SpyneMetricChip
              className="shrink-0"
              label="In Review"
              count={inReviewCount}
              active={chipInReview}
              onClick={toggleInReview}
            />
            <SpyneMetricChip
              className="shrink-0"
              label="Failed"
              count={failedCount}
              active={chipFailed}
              onClick={toggleFailed}
            />
            <SpyneMetricChip
              className="shrink-0"
              label="Age > 30 days"
              count={ageOver30Count}
              active={chipAge30}
              onClick={toggleAge30}
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
        <div className="flex w-full min-w-0 items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {filters.search.trim() !== "" && (
            <RemovableChip
              label={`Search: ${filters.search.trim()}`}
              onRemove={() => update({ search: "" })}
            />
          )}
          {filters.vehicleType !== "all" && (
            <RemovableChip
              label={filters.vehicleType === "new" ? "Type: New" : "Type: Used"}
              onRemove={() => update({ vehicleType: "all" })}
            />
          )}
          {filters.mediaIssue && (
            <RemovableChip
              label={MERCH_MEDIA_ISSUE_LABELS[filters.mediaIssue]}
              onRemove={() => update({ mediaIssue: null })}
            />
          )}
          {filters.needsRealPhotosOnly && (
            <RemovableChip
              label="Needs real photos"
              onRemove={() => update({ needsRealPhotosOnly: false })}
            />
          )}
          {filters.missingDescriptionOnly && (
            <RemovableChip
              label="Description missing"
              onRemove={() => update({ missingDescriptionOnly: false })}
            />
          )}
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
          {filters.missingOdometerOnly && (
            <RemovableChip
              label="Odometer missing"
              onRemove={() => update({ missingOdometerOnly: false })}
            />
          )}
          {filters.missingPriceOnly && (
            <RemovableChip
              label="Price missing"
              onRemove={() => update({ missingPriceOnly: false })}
            />
          )}
          {filters.merchFocus && (
            <RemovableChip
              label={MERCH_LOT_FOCUS_LABELS[filters.merchFocus]}
              onRemove={() => update({ merchFocus: null })}
            />
          )}
          {filters.merchBodyType && (
            <RemovableChip
              label={`Body: ${filters.merchBodyType}`}
              onRemove={() => update({ merchBodyType: null })}
            />
          )}
          {filters.lotPriceRangeKey && (
            <RemovableChip
              label={`Price: ${lotPriceRangeChipLabel[filters.lotPriceRangeKey] ?? filters.lotPriceRangeKey}`}
              onRemove={() => update({ lotPriceRangeKey: null })}
            />
          )}
          </div>
          <button
            type="button"
            className="shrink-0 text-sm font-medium text-spyne-primary hover:text-spyne-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spyne-primary"
            onClick={() => onFiltersChange(merchandisingDefaultFilters)}
          >
            Clear all
          </button>
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
