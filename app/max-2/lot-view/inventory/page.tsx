"use client"

import * as React from "react"
import { mockLotVehicles } from "@/lib/max-2-mocks"
import type { LotStatus, PricingPosition } from "@/services/max-2/max-2.types"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Search, RotateCcw, ArrowUpDown, ArrowUp, ArrowDown, X } from "lucide-react"
import { useSearchParams } from "next/navigation"

// ── Configs ───────────────────────────────────────────────────────────────

const statusBadge: Record<LotStatus, { label: string; className: string }> = {
  frontline: { label: "Frontline", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  "in-recon": { label: "In Recon", className: "bg-amber-100 text-amber-700 border-amber-200" },
  arriving: { label: "Arriving", className: "bg-blue-100 text-blue-700 border-blue-200" },
  "wholesale-candidate": { label: "Wholesale", className: "bg-red-100 text-red-700 border-red-200" },
  "sold-pending": { label: "Sold Pending", className: "bg-gray-100 text-gray-500 border-gray-200" },
}

const pricingBadge: Record<PricingPosition, { label: string; className: string }> = {
  "below-market": { label: "Below", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  "at-market": { label: "At Mkt", className: "bg-gray-100 text-gray-600 border-gray-200" },
  "above-market": { label: "Above", className: "bg-red-100 text-red-700 border-red-200" },
}

const MODEL_TO_BODY: Record<string, string> = {
  "F-150": "Truck", "Silverado": "Truck",
  "RAV4": "SUV", "Q5": "SUV", "CX-5": "SUV", "Equinox": "SUV",
  "Sportage": "SUV", "Tucson": "SUV", "Forester": "SUV",
  "3 Series": "Sedan", "Altima": "Sedan", "Sonata": "Sedan",
  "Corolla": "Sedan", "Civic": "Sedan", "Camry": "Sedan",
}

const fmt$ = (n: number) => `$${n.toLocaleString()}`

type SortField = "daysInStock" | "listPrice" | "totalHoldingCost"
type SortDir = "asc" | "desc"

function LotInventoryContent() {
  const searchParams = useSearchParams()

  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>(searchParams.get("status") || "all")
  const [pricingFilter, setPricingFilter] = React.useState<string>("all")
  const [makeFilter, setMakeFilter] = React.useState<string>("all")
  const [bodyTypeFilter, setBodyTypeFilter] = React.useState<string>("all")
  const [ageFilter, setAgeFilter] = React.useState<string>(searchParams.get("age") || "all")
  const [priceRange, setPriceRange] = React.useState<string>("all")
  const [leadFilter, setLeadFilter] = React.useState<string>(searchParams.get("leads") || "all")
  const [photoFilter, setPhotoFilter] = React.useState<string>(searchParams.get("photos") || "all")
  const [sortField, setSortField] = React.useState<SortField>("daysInStock")
  const [sortDir, setSortDir] = React.useState<SortDir>("desc")

  const makes = React.useMemo(
    () => [...new Set(mockLotVehicles.map((v) => v.make))].sort(),
    [],
  )

  const bodyTypes = React.useMemo(
    () => [...new Set(Object.values(MODEL_TO_BODY))].sort(),
    [],
  )

  const hasActiveFilters =
    search !== "" ||
    statusFilter !== "all" ||
    pricingFilter !== "all" ||
    makeFilter !== "all" ||
    bodyTypeFilter !== "all" ||
    ageFilter !== "all" ||
    priceRange !== "all" ||
    leadFilter !== "all" ||
    photoFilter !== "all"

  const resetFilters = () => {
    setSearch("")
    setStatusFilter("all")
    setPricingFilter("all")
    setMakeFilter("all")
    setBodyTypeFilter("all")
    setAgeFilter("all")
    setPriceRange("all")
    setLeadFilter("all")
    setPhotoFilter("all")
  }

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("desc")
    }
  }

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase()
    return [...mockLotVehicles]
      .filter((v) => {
        if (q && ![v.make, v.model, v.stockNumber, v.vin, v.trim, v.color].some((f) => f.toLowerCase().includes(q)))
          return false
        if (statusFilter !== "all" && v.lotStatus !== statusFilter) return false
        if (pricingFilter !== "all" && v.pricingPosition !== pricingFilter) return false
        if (makeFilter !== "all" && v.make !== makeFilter) return false
        if (bodyTypeFilter !== "all" && MODEL_TO_BODY[v.model] !== bodyTypeFilter) return false

        // Age filter
        if (ageFilter === "0-15" && v.daysInStock > 15) return false
        if (ageFilter === "16-30" && (v.daysInStock < 16 || v.daysInStock > 30)) return false
        if (ageFilter === "31-45" && (v.daysInStock < 31 || v.daysInStock > 45)) return false
        if (ageFilter === "45+" && v.daysInStock < 45) return false

        // Price range filter
        if (priceRange === "under-15k" && v.listPrice >= 15000) return false
        if (priceRange === "15k-25k" && (v.listPrice < 15000 || v.listPrice >= 25000)) return false
        if (priceRange === "25k-35k" && (v.listPrice < 25000 || v.listPrice >= 35000)) return false
        if (priceRange === "35k-50k" && (v.listPrice < 35000 || v.listPrice >= 50000)) return false
        if (priceRange === "50k+" && v.listPrice < 50000) return false

        // Lead filter
        if (leadFilter === "has-leads" && v.leads === 0) return false
        if (leadFilter === "no-leads" && v.leads > 0) return false

        // Photo filter
        if (photoFilter === "no-real-photos" && v.hasRealPhotos) return false
        if (photoFilter === "has-real-photos" && !v.hasRealPhotos) return false
        if (photoFilter === "missing" && v.hasRealPhotos && v.photoCount > 0) return false

        return true
      })
      .sort((a, b) => {
        const aVal = a[sortField]
        const bVal = b[sortField]
        return sortDir === "asc" ? aVal - bVal : bVal - aVal
      })
  }, [search, statusFilter, pricingFilter, makeFilter, bodyTypeFilter, ageFilter, priceRange, leadFilter, photoFilter, sortField, sortDir])

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />
    return sortDir === "asc"
      ? <ArrowUp className="h-3 w-3 ml-1 text-[#4600f2]" />
      : <ArrowDown className="h-3 w-3 ml-1 text-[#4600f2]" />
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Lot Inventory</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Complete vehicle inventory with advanced filtering and sorting
        </p>
      </div>

      <Card className="shadow-none gap-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Vehicles</CardTitle>
              <CardDescription>
                {filtered.length} of {mockLotVehicles.length} vehicles
              </CardDescription>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={resetFilters}>
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Filters
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-1">
          {/* Filter bar */}
          <div className="flex flex-col gap-3 mb-5">
            {/* Row 1: Search + primary filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search VIN, make, model, stock #…"
                  className="pl-9 h-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="h-5 w-px bg-border mx-1 hidden sm:block" />

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-[140px]">
                  <SelectValue placeholder="Lot Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="frontline">Frontline</SelectItem>
                  <SelectItem value="wholesale-candidate">Wholesale</SelectItem>
                  <SelectItem value="in-recon">In Recon</SelectItem>
                  <SelectItem value="arriving">Arriving</SelectItem>
                  <SelectItem value="sold-pending">Sold Pending</SelectItem>
                </SelectContent>
              </Select>

              <Select value={makeFilter} onValueChange={setMakeFilter}>
                <SelectTrigger className="h-9 w-[130px]">
                  <SelectValue placeholder="Make" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Makes</SelectItem>
                  {makes.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={bodyTypeFilter} onValueChange={setBodyTypeFilter}>
                <SelectTrigger className="h-9 w-[140px]">
                  <SelectValue placeholder="Body Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Body Types</SelectItem>
                  {bodyTypes.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={pricingFilter} onValueChange={setPricingFilter}>
                <SelectTrigger className="h-9 w-[130px]">
                  <SelectValue placeholder="Pricing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pricing</SelectItem>
                  <SelectItem value="below-market">Below Market</SelectItem>
                  <SelectItem value="at-market">At Market</SelectItem>
                  <SelectItem value="above-market">Above Market</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="h-9 w-[130px]">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under-15k">Under $15K</SelectItem>
                  <SelectItem value="15k-25k">$15K – $25K</SelectItem>
                  <SelectItem value="25k-35k">$25K – $35K</SelectItem>
                  <SelectItem value="35k-50k">$35K – $50K</SelectItem>
                  <SelectItem value="50k+">$50K+</SelectItem>
                </SelectContent>
              </Select>

              <Select value={ageFilter} onValueChange={setAgeFilter}>
                <SelectTrigger className="h-9 w-[120px]">
                  <SelectValue placeholder="Age" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ages</SelectItem>
                  <SelectItem value="0-15">0–15 days</SelectItem>
                  <SelectItem value="16-30">16–30 days</SelectItem>
                  <SelectItem value="31-45">31–45 days</SelectItem>
                  <SelectItem value="45+">45+ days</SelectItem>
                </SelectContent>
              </Select>

              <Select value={leadFilter} onValueChange={setLeadFilter}>
                <SelectTrigger className="h-9 w-[120px]">
                  <SelectValue placeholder="Leads" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leads</SelectItem>
                  <SelectItem value="has-leads">Has Leads</SelectItem>
                  <SelectItem value="no-leads">No Leads</SelectItem>
                </SelectContent>
              </Select>

              <Select value={photoFilter} onValueChange={setPhotoFilter}>
                <SelectTrigger className="h-9 w-[130px]">
                  <SelectValue placeholder="Photos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Photos</SelectItem>
                  <SelectItem value="has-real-photos">Real Photos</SelectItem>
                  <SelectItem value="no-real-photos">No Real Photos</SelectItem>
                  <SelectItem value="missing">No / Stock Photos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5 mb-4">
              <span className="text-xs text-muted-foreground mr-1">Filtered by:</span>
              {search && (
                <button onClick={() => setSearch("")} className="inline-flex items-center gap-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 px-2.5 py-1 text-xs font-medium hover:bg-violet-100 transition-colors">
                  &ldquo;{search}&rdquo;
                  <X className="h-3 w-3" />
                </button>
              )}
              {statusFilter !== "all" && (
                <button onClick={() => setStatusFilter("all")} className="inline-flex items-center gap-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 px-2.5 py-1 text-xs font-medium hover:bg-violet-100 transition-colors">
                  {statusBadge[statusFilter as LotStatus]?.label ?? statusFilter}
                  <X className="h-3 w-3" />
                </button>
              )}
              {makeFilter !== "all" && (
                <button onClick={() => setMakeFilter("all")} className="inline-flex items-center gap-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 px-2.5 py-1 text-xs font-medium hover:bg-violet-100 transition-colors">
                  {makeFilter}
                  <X className="h-3 w-3" />
                </button>
              )}
              {bodyTypeFilter !== "all" && (
                <button onClick={() => setBodyTypeFilter("all")} className="inline-flex items-center gap-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 px-2.5 py-1 text-xs font-medium hover:bg-violet-100 transition-colors">
                  {bodyTypeFilter}
                  <X className="h-3 w-3" />
                </button>
              )}
              {pricingFilter !== "all" && (
                <button onClick={() => setPricingFilter("all")} className="inline-flex items-center gap-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 px-2.5 py-1 text-xs font-medium hover:bg-violet-100 transition-colors">
                  {pricingBadge[pricingFilter as PricingPosition]?.label ?? pricingFilter}
                  <X className="h-3 w-3" />
                </button>
              )}
              {priceRange !== "all" && (
                <button onClick={() => setPriceRange("all")} className="inline-flex items-center gap-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 px-2.5 py-1 text-xs font-medium hover:bg-violet-100 transition-colors">
                  {priceRange === "under-15k" ? "Under $15K" : priceRange === "50k+" ? "$50K+" : `$${priceRange.replace("k", "K").replace("-", " – $")}`}
                  <X className="h-3 w-3" />
                </button>
              )}
              {ageFilter !== "all" && (
                <button onClick={() => setAgeFilter("all")} className="inline-flex items-center gap-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 px-2.5 py-1 text-xs font-medium hover:bg-violet-100 transition-colors">
                  {ageFilter === "45+" ? "45+ days" : `${ageFilter} days`}
                  <X className="h-3 w-3" />
                </button>
              )}
              {leadFilter !== "all" && (
                <button onClick={() => setLeadFilter("all")} className="inline-flex items-center gap-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 px-2.5 py-1 text-xs font-medium hover:bg-violet-100 transition-colors">
                  {leadFilter === "no-leads" ? "No Leads" : "Has Leads"}
                  <X className="h-3 w-3" />
                </button>
              )}
              {photoFilter !== "all" && (
                <button onClick={() => setPhotoFilter("all")} className="inline-flex items-center gap-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 px-2.5 py-1 text-xs font-medium hover:bg-violet-100 transition-colors">
                  {photoFilter === "no-real-photos" ? "No Real Photos" : photoFilter === "missing" ? "No / Stock Photos" : "Real Photos"}
                  <X className="h-3 w-3" />
                </button>
              )}
              <button onClick={resetFilters} className="inline-flex items-center gap-1 rounded-full text-muted-foreground px-2 py-1 text-xs hover:text-foreground transition-colors">
                Clear all
              </button>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 pr-4 text-xs font-semibold text-muted-foreground whitespace-nowrap">Stock #</th>
                  <th className="pb-3 pr-4 text-xs font-semibold text-muted-foreground">Vehicle</th>
                  <th className="pb-3 pr-4 text-xs font-semibold text-muted-foreground">Color</th>
                  <th className="pb-3 pr-4 text-xs font-semibold text-muted-foreground cursor-pointer select-none text-right whitespace-nowrap" onClick={() => toggleSort("listPrice")}>
                    <span className="inline-flex items-center">List Price<SortIcon field="listPrice" /></span>
                  </th>
                  <th className="pb-3 pr-4 text-xs font-semibold text-muted-foreground cursor-pointer select-none text-right" onClick={() => toggleSort("daysInStock")}>
                    <span className="inline-flex items-center">Days<SortIcon field="daysInStock" /></span>
                  </th>
                  <th className="pb-3 pr-4 text-xs font-semibold text-muted-foreground">Status</th>
                  <th className="pb-3 pr-4 text-xs font-semibold text-muted-foreground cursor-pointer select-none text-right whitespace-nowrap" onClick={() => toggleSort("totalHoldingCost")}>
                    <span className="inline-flex items-center">Holding Cost<SortIcon field="totalHoldingCost" /></span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => {
                  const sb = statusBadge[v.lotStatus]
                  const isAged = v.daysInStock >= 45

                  return (
                    <tr
                      key={v.vin}
                      className={cn("border-b last:border-0", isAged && "bg-red-50/50")}
                    >
                      <td className="py-3.5 pr-4 text-xs text-muted-foreground tabular-nums">{v.stockNumber}</td>
                      <td className="py-3.5 pr-4 font-medium whitespace-nowrap">
                        {v.year} {v.make} {v.model} {v.trim}
                      </td>
                      <td className="py-3.5 pr-4 text-muted-foreground whitespace-nowrap">{v.color}</td>
                      <td className="py-3.5 pr-4 text-right tabular-nums">{fmt$(v.listPrice)}</td>
                      <td className={cn("py-3.5 pr-4 text-right tabular-nums font-semibold", isAged && "text-red-600")}>
                        {v.daysInStock}
                      </td>
                      <td className="py-3.5 pr-4">
                        <Badge variant="outline" className={sb.className}>
                          {sb.label}
                        </Badge>
                      </td>
                      <td className={cn(
                        "py-3.5 pr-4 text-right tabular-nums font-semibold",
                        v.totalHoldingCost >= 2000 ? "text-red-600" : v.totalHoldingCost >= 1000 ? "text-amber-600" : "text-muted-foreground",
                      )}>
                        {fmt$(v.totalHoldingCost)}
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No vehicles match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LotInventoryPage() {
  return (
    <React.Suspense fallback={null}>
      <LotInventoryContent />
    </React.Suspense>
  )
}
