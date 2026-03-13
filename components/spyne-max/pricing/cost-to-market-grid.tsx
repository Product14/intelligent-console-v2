"use client"

import * as React from "react"
import { mockVehiclePricing } from "@/lib/spyne-max-mocks"
import type { VehiclePricing } from "@/services/spyne-max/spyne-max.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { ArrowUpDown, Tag } from "lucide-react"

type SortKey = keyof Pick<
  VehiclePricing,
  "costToMarket" | "marketRank" | "daysAtCurrentPrice" | "daysInStock" | "currentAsk" | "marketAvg"
> | "vehicle"

function c2mColor(val: number) {
  if (val >= 97 && val <= 99) return "bg-emerald-100 text-emerald-800"
  if ((val >= 95 && val < 97) || (val > 99 && val <= 101))
    return "bg-amber-100 text-amber-800"
  return "bg-red-100 text-red-800"
}

const stageConfig: Record<string, string> = {
  fresh: "bg-emerald-100 text-emerald-800 border-emerald-200",
  watch: "bg-amber-100 text-amber-800 border-amber-200",
  risk: "bg-orange-100 text-orange-800 border-orange-200",
  critical: "bg-red-100 text-red-800 border-red-200",
}

export function CostToMarketGrid() {
  const [sortKey, setSortKey] = React.useState<SortKey>("costToMarket")
  const [sortAsc, setSortAsc] = React.useState(false)

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(key === "vehicle")
    }
  }

  const sorted = [...mockVehiclePricing].sort((a, b) => {
    let cmp = 0
    if (sortKey === "vehicle") {
      cmp = `${a.year} ${a.make} ${a.model}`.localeCompare(
        `${b.year} ${b.make} ${b.model}`
      )
    } else {
      cmp = (a[sortKey] as number) - (b[sortKey] as number)
    }
    return sortAsc ? cmp : -cmp
  })

  const SortableHead = ({
    label,
    sortKeyName,
    className,
  }: {
    label: string
    sortKeyName: SortKey
    className?: string
  }) => (
    <TableHead
      className={cn("cursor-pointer select-none whitespace-nowrap", className)}
      onClick={() => handleSort(sortKeyName)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown className={cn(
          "h-3 w-3",
          sortKey === sortKeyName ? "text-foreground" : "text-muted-foreground/50"
        )} />
      </span>
    </TableHead>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Tag className="h-4 w-4 text-primary" />
          Cost-to-Market Grid
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHead label="Vehicle" sortKeyName="vehicle" />
              <SortableHead label="C2M%" sortKeyName="costToMarket" />
              <SortableHead label="Rank" sortKeyName="marketRank" />
              <SortableHead label="Days @ Price" sortKeyName="daysAtCurrentPrice" />
              <SortableHead label="Days in Stock" sortKeyName="daysInStock" />
              <SortableHead label="Ask" sortKeyName="currentAsk" />
              <SortableHead label="Market Avg" sortKeyName="marketAvg" />
              <TableHead>Stage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((v) => (
              <TableRow key={v.vin}>
                <TableCell className="font-medium whitespace-nowrap">
                  {v.year} {v.make} {v.model}
                </TableCell>
                <TableCell>
                  <Badge className={cn("font-mono text-xs", c2mColor(v.costToMarket))}>
                    {v.costToMarket.toFixed(1)}%
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  #{v.marketRank}/{v.totalComparables}
                </TableCell>
                <TableCell className="text-center">{v.daysAtCurrentPrice}d</TableCell>
                <TableCell className="text-center">{v.daysInStock}d</TableCell>
                <TableCell className="font-mono">
                  ${v.currentAsk.toLocaleString()}
                </TableCell>
                <TableCell className="font-mono text-muted-foreground">
                  ${v.marketAvg.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn("capitalize text-xs", stageConfig[v.stage])}
                  >
                    {v.stage}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
