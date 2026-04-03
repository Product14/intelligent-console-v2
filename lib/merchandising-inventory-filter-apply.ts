import type { MerchandisingVehicle, MediaStatus, PublishStatus } from "@/services/max-2/max-2.types"

/** Mirrors `InventoryVehicleType` from `inventory-list-header` (avoid circular imports). */
export type MerchInventoryVehicleType = "all" | "new" | "used"

export type MerchAgeBucket = "0-30" | "31-89" | "90+"
export type MerchPriceBucket = "u20" | "20-30" | "30-40" | "40+"
export type MerchScoreBucket = "low" | "mid" | "high"

export interface MerchandisingInventoryFilters {
  search: string
  vehicleType: MerchInventoryVehicleType
  makes: string[]
  models: string[]
  years: number[]
  trims: string[]
  transmissions: ("manual" | "automatic")[]
  ageBuckets: MerchAgeBucket[]
  mediaStatuses: MediaStatus[]
  publishStatuses: PublishStatus[]
  priceBuckets: MerchPriceBucket[]
  scoreBuckets: MerchScoreBucket[]
  ageMin: number | null
  ageMax: number | null
  priceMin: number | null
  priceMax: number | null
  scoreMin: number | null
}

export const merchandisingDefaultFilters: MerchandisingInventoryFilters = {
  search: "",
  vehicleType: "all",
  makes: [],
  models: [],
  years: [],
  trims: [],
  transmissions: [],
  ageBuckets: [],
  mediaStatuses: [],
  publishStatuses: [],
  priceBuckets: [],
  scoreBuckets: [],
  ageMin: null,
  ageMax: null,
  priceMin: null,
  priceMax: null,
  scoreMin: null,
}

export function merchandisingTransmissionFromVin(vin: string): "manual" | "automatic" {
  let h = 0
  for (let i = 0; i < vin.length; i++) {
    h = (h + vin.charCodeAt(i) * (i + 1)) % 101
  }
  return h < 26 ? "manual" : "automatic"
}

export function inMerchAgeBucket(days: number, b: MerchAgeBucket): boolean {
  if (b === "0-30") return days >= 0 && days <= 30
  if (b === "31-89") return days >= 31 && days <= 89
  return days >= 90
}

function inMerchPriceBucket(price: number, b: MerchPriceBucket): boolean {
  if (b === "u20") return price < 20000
  if (b === "20-30") return price >= 20000 && price < 30000
  if (b === "30-40") return price >= 30000 && price < 40000
  return price >= 40000
}

function inMerchScoreBucket(score: number, b: MerchScoreBucket): boolean {
  if (b === "low") return score < 50
  if (b === "mid") return score >= 50 && score < 80
  return score >= 80
}

export function applyMerchandisingFilters(
  vehicles: MerchandisingVehicle[],
  filters: MerchandisingInventoryFilters
): MerchandisingVehicle[] {
  let result = [...vehicles]

  if (filters.vehicleType === "new") result = result.filter((v) => v.isNew)
  else if (filters.vehicleType === "used") result = result.filter((v) => !v.isNew)

  if (filters.makes.length > 0) result = result.filter((v) => filters.makes.includes(v.make))
  if (filters.models.length > 0) result = result.filter((v) => filters.models.includes(v.model))
  if (filters.years.length > 0) result = result.filter((v) => filters.years.includes(v.year))
  if (filters.trims.length > 0) result = result.filter((v) => filters.trims.includes(v.trim))
  if (filters.transmissions.length > 0) {
    result = result.filter((v) =>
      filters.transmissions.includes(merchandisingTransmissionFromVin(v.vin))
    )
  }

  if (filters.ageBuckets.length > 0) {
    result = result.filter((v) =>
      filters.ageBuckets.some((b) => inMerchAgeBucket(v.daysInStock, b))
    )
  } else {
    if (filters.ageMin !== null) result = result.filter((v) => v.daysInStock >= filters.ageMin!)
    if (filters.ageMax !== null) result = result.filter((v) => v.daysInStock <= filters.ageMax!)
  }

  if (filters.mediaStatuses.length > 0) {
    result = result.filter((v) => filters.mediaStatuses.includes(v.mediaStatus))
  }
  if (filters.publishStatuses.length > 0) {
    result = result.filter((v) => filters.publishStatuses.includes(v.publishStatus))
  }

  if (filters.priceBuckets.length > 0) {
    result = result.filter((v) =>
      filters.priceBuckets.some((b) => inMerchPriceBucket(v.price, b))
    )
  } else {
    if (filters.priceMin !== null) result = result.filter((v) => v.price >= filters.priceMin!)
    if (filters.priceMax !== null) result = result.filter((v) => v.price <= filters.priceMax!)
  }

  if (filters.scoreBuckets.length > 0) {
    result = result.filter((v) =>
      filters.scoreBuckets.some((b) => inMerchScoreBucket(v.listingScore, b))
    )
  } else if (filters.scoreMin !== null) {
    result = result.filter((v) => v.listingScore >= filters.scoreMin!)
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

  return result
}

export function merchandisingFiltersActive(f: MerchandisingInventoryFilters): boolean {
  return (
    f.makes.length > 0 ||
    f.models.length > 0 ||
    f.years.length > 0 ||
    f.trims.length > 0 ||
    f.transmissions.length > 0 ||
    f.ageBuckets.length > 0 ||
    f.mediaStatuses.length > 0 ||
    f.publishStatuses.length > 0 ||
    f.priceBuckets.length > 0 ||
    f.scoreBuckets.length > 0 ||
    f.ageMin !== null ||
    f.ageMax !== null ||
    f.priceMin !== null ||
    f.priceMax !== null ||
    f.scoreMin !== null
  )
}
