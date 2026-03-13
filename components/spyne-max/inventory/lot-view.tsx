"use client"

import * as React from "react"
import { mockVehiclePricing, mockWalks } from "@/lib/spyne-max-mocks"
import type { VehiclePricing, WalkStatus } from "@/services/spyne-max/spyne-max.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { ArrowUpDown, Search, Warehouse } from "lucide-react"

const HOLDING_COST_PER_DAY = 46.44

const stageConfig: Record<string, string> = {
  fresh: "bg-emerald-100 text-emerald-800 border-emerald-200",
  watch: "bg-amber-100 text-amber-800 border-amber-200",
  risk: "bg-orange-100 text-orange-800 border-orange-200",
  critical: "bg-red-100 text-red-800 border-red-200",
}

function c2mColor(val: number) {
  if (val >= 97 && val <= 99) return "bg-emerald-100 text-emerald-800"
  if ((val >= 95 && val < 97) || (val > 99 && val <= 101))
    return "bg-amber-100 text-amber-800"
  return "bg-red-100 text-red-800"
}

function walkStatusBadge(vin: string) {
  const walks = mockWalks.filter((w) => w.vin === vin)
  const overdue = walks.find((w) => w.status === "overdue")
  if (overdue)
    return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 text-xs">Overdue</Badge>
  const dueToday = walks.find((w) => w.status === "due-today")
  if (dueToday)
    return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 text-xs">Due Today</Badge>
  const upcoming = walks.find((w) => w.status === "upcoming")
  if (upcoming)
    return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 text-xs">Upcoming</Badge>
  const completed = walks.find((w) => w.status === "completed")
  if (completed)
    return <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">Done</Badge>
  return <span className="text-xs text-muted-foreground">—</span>
}

type SortKey =
  | "vehicle"
  | "stage"
  | "daysInStock"
  | "costToMarket"
  | "marketRank"
  | "roiPerDay"
  | "dailyBurn"
  | "marginRemaining"
  | "currentAsk"

const stageOrder: Record<string, number> = { fresh: 0, watch: 1, risk: 2, critical: 3 }

function getROIPerDay(v: VehiclePricing) {
  const frontGross = v.currentAsk - v.acquisitionCost
  return v.daysInStock > 0 ? frontGross / v.daysInStock : frontGross
}

function getDailyBurn(v: VehiclePricing) {
  return HOLDING_COST_PER_DAY * v.daysInStock
}

function getMarginRemaining(v: VehiclePricing) {
  return v.currentAsk - v.acquisitionCost - getDailyBurn(v)
}

export function LotView() {
  const [sortKey, setSortKey] = React.useState<SortKey>("daysInStock")
  const [sortAsc, setSortAsc] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(key === "vehicle") }
  }

  const filtered = mockVehiclePricing.filter((v) => {
    const name = `${v.year} ${v.make} ${v.model} ${v.trim}`.toLowerCase()
    return name.includes(search.toLowerCase())
  })

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0
    switch (sortKey) {
      case "vehicle":
        cmp = `${a.year} ${a.make} ${a.model}`.localeCompare(`${b.year} ${b.make} ${b.model}`)
        break
      case "stage":
        cmp = (stageOrder[a.stage] ?? 0) - (stageOrder[b.stage] ?? 0)
        break
      case "roiPerDay":
        cmp = getROIPerDay(a) - getROIPerDay(b)
        break
      case "dailyBurn":
        cmp = getDailyBurn(a) - getDailyBurn(b)
        break
      case "marginRemaining":
        cmp = getMarginRemaining(a) - getMarginRemaining(b)
        break
      default:
        cmp = (a[sortKey] as number) - (b[sortKey] as number)
    }
    return sortAsc ? cmp : -cmp
  })

  const SortableHead = ({ label, k, className }: { label: string; k: SortKey; className?: string }) => (
    <TableHead
      className={cn("cursor-pointer select-none whitespace-nowrap", className)}
      onClick={() => handleSort(k)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown className={cn("h-3 w-3", sortKey === k ? "text-foreground" : "text-muted-foreground/50")} />
      </span>
    </TableHead>
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Warehouse className="h-4 w-4 text-primary" />
            Lot View
          </CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vehicles…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHead label="Vehicle" k="vehicle" />
              <SortableHead label="Stage" k="stage" />
              <SortableHead label="Days" k="daysInStock" />
              <SortableHead label="C2M%" k="costToMarket" />
              <SortableHead label="Rank" k="marketRank" />
              <SortableHead label="ROI/Day" k="roiPerDay" />
              <SortableHead label="Daily Burn" k="dailyBurn" />
              <SortableHead label="Margin Left" k="marginRemaining" />
              <TableHead className="whitespace-nowrap">Walk Status</TableHead>
              <SortableHead label="Ask" k="currentAsk" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((v) => {
              const roi = getROIPerDay(v)
              const burn = getDailyBurn(v)
              const margin = getMarginRemaining(v)
              return (
                <TableRow key={v.vin}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {v.year} {v.make} {v.model} {v.trim}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("capitalize text-xs", stageConfig[v.stage])}>
                      {v.stage}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{v.daysInStock}</TableCell>
                  <TableCell>
                    <Badge className={cn("font-mono text-xs", c2mColor(v.costToMarket))}>
                      {v.costToMarket.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">#{v.marketRank}/{v.totalComparables}</TableCell>
                  <TableCell className={cn("font-mono", roi < 0 ? "text-red-600" : "text-emerald-600")}>
                    ${roi.toFixed(0)}
                  </TableCell>
                  <TableCell className="font-mono text-red-600">
                    ${burn.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell className={cn("font-mono", margin < 0 ? "text-red-600 font-semibold" : "text-foreground")}>
                    ${margin.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell>{walkStatusBadge(v.vin)}</TableCell>
                  <TableCell className="font-mono">${v.currentAsk.toLocaleString()}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
