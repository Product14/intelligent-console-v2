"use client"

import * as React from "react"
import { mockLotVehicles } from "@/lib/max-2-mocks"
import type { LotStatus, PricingPosition } from "@/services/max-2/max-2.types"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"

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

const fmt$ = (n: number) => `$${n.toLocaleString()}`
const fmtMi = (n: number) => `${(n / 1000).toFixed(1)}k`

export function LotVehicleTable() {
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [pricingFilter, setPricingFilter] = React.useState<string>("all")

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase()
    return [...mockLotVehicles]
      .filter((v) => {
        if (q && ![v.make, v.model, v.stockNumber].some((f) => f.toLowerCase().includes(q)))
          return false
        if (statusFilter !== "all" && v.lotStatus !== statusFilter) return false
        if (pricingFilter !== "all" && v.pricingPosition !== pricingFilter) return false
        return true
      })
      .sort((a, b) => b.daysInStock - a.daysInStock)
  }, [search, statusFilter, pricingFilter])

  return (
    <Card className="shadow-none gap-0">
      <CardHeader className="pb-4">
        <CardTitle>Lot Inventory</CardTitle>
        <CardDescription>
          Full vehicle list - filter by status, pricing, or keyword
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-1">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search make, model, stock #…"
              className="pl-9 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[170px] h-9">
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
          <Select value={pricingFilter} onValueChange={setPricingFilter}>
            <SelectTrigger className="w-[170px] h-9">
              <SelectValue placeholder="Pricing" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pricing</SelectItem>
              <SelectItem value="below-market">Below Market</SelectItem>
              <SelectItem value="at-market">At Market</SelectItem>
              <SelectItem value="above-market">Above Market</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 pr-4 text-xs font-semibold text-muted-foreground whitespace-nowrap">Stock #</th>
                <th className="pb-3 pr-4 text-xs font-semibold text-muted-foreground">Vehicle</th>
                <th className="pb-3 pr-4 text-xs font-semibold text-muted-foreground">Color</th>
                <th className="pb-3 pr-4 text-xs font-semibold text-muted-foreground text-right">Mileage</th>
                <th className="pb-3 pr-4 text-xs font-semibold text-muted-foreground text-right">List Price</th>
                <th className="pb-3 pr-4 text-xs font-semibold text-muted-foreground text-right">C2M%</th>
                <th className="pb-3 pr-4 text-xs font-semibold text-muted-foreground text-right">Days</th>
                <th className="pb-3 pr-4 text-xs font-semibold text-muted-foreground">Status</th>
                <th className="pb-3 pr-4 text-xs font-semibold text-muted-foreground text-right">Photos</th>
                <th className="pb-3 pr-4 text-xs font-semibold text-muted-foreground text-right">VDPs</th>
                <th className="pb-3 pr-4 text-xs font-semibold text-muted-foreground text-right">Leads</th>
                <th className="pb-3 pr-4 text-xs font-semibold text-muted-foreground text-right whitespace-nowrap">Holding Cost</th>
                <th className="pb-3 text-xs font-semibold text-muted-foreground">Location</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => {
                const sb = statusBadge[v.lotStatus]
                const pb = pricingBadge[v.pricingPosition]
                const isAged = v.daysInStock >= 45
                const isNoLead = v.leads === 0 && v.daysInStock > 5

                return (
                  <tr
                    key={v.vin}
                    className={cn(
                      "border-b last:border-0",
                      isAged ? "bg-red-50/50" : isNoLead ? "bg-amber-50/40" : "",
                    )}
                  >
                    <td className="py-3.5 pr-4 text-xs text-muted-foreground tabular-nums">{v.stockNumber}</td>
                    <td className="py-3.5 pr-4 font-medium whitespace-nowrap">
                      {v.year} {v.make} {v.model} {v.trim}
                    </td>
                    <td className="py-3.5 pr-4 text-muted-foreground whitespace-nowrap">{v.color}</td>
                    <td className="py-3.5 pr-4 text-right tabular-nums">{fmtMi(v.mileage)}</td>
                    <td className="py-3.5 pr-4 text-right tabular-nums">{fmt$(v.listPrice)}</td>
                    <td className="py-3.5 pr-4 text-right">
                      <Badge variant="outline" className={cn("text-[11px]", pb.className)}>
                        {v.costToMarketPct.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className={cn("py-3.5 pr-4 text-right tabular-nums font-semibold", isAged && "text-red-600")}>
                      {v.daysInStock}
                    </td>
                    <td className="py-3.5 pr-4">
                      <Badge variant="outline" className={sb.className}>
                        {sb.label}
                      </Badge>
                    </td>
                    <td className="py-3.5 pr-4 text-right tabular-nums">{v.photoCount}</td>
                    <td className="py-3.5 pr-4 text-right tabular-nums">{v.vdpViews}</td>
                    <td className={cn("py-3.5 pr-4 text-right tabular-nums", v.leads === 0 && "text-muted-foreground")}>
                      {v.leads}
                    </td>
                    <td className={cn(
                      "py-3.5 pr-4 text-right tabular-nums font-semibold",
                      v.totalHoldingCost >= 2000 ? "text-red-600" : v.totalHoldingCost >= 1000 ? "text-amber-600" : "text-muted-foreground",
                    )}>
                      {fmt$(v.totalHoldingCost)}
                    </td>
                    <td className="py-3.5 text-xs text-muted-foreground whitespace-nowrap">{v.location}</td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={13} className="py-8 text-center text-muted-foreground">
                    No vehicles match your filters.
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
