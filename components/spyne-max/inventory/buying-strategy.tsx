"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { ShoppingCart, Lightbulb } from "lucide-react"

interface AcquisitionSource {
  source: string
  units: number
  avgCost: number
  avgGross: number
  avgC2M: number
}

const sources: AcquisitionSource[] = [
  { source: "Auction", units: 45, avgCost: 22000, avgGross: 1800, avgC2M: 97.2 },
  { source: "Trade-In", units: 30, avgCost: 19000, avgGross: 2200, avgC2M: 98.5 },
  { source: "Wholesale", units: 15, avgCost: 24000, avgGross: 1400, avgC2M: 95.8 },
  { source: "Direct Purchase", units: 10, avgCost: 26000, avgGross: 1600, avgC2M: 96.1 },
]

export function BuyingStrategy() {
  const bestSource = sources.reduce((best, s) => (s.avgGross > best.avgGross ? s : best), sources[0])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShoppingCart className="h-4 w-4 text-primary" />
          Buying Strategy
        </CardTitle>
        <CardDescription>Source breakdown and acquisition scorecard</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Units</TableHead>
                <TableHead className="text-right">Avg Cost</TableHead>
                <TableHead className="text-right">Avg Gross</TableHead>
                <TableHead className="text-right">Avg C2M%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((s) => (
                <TableRow
                  key={s.source}
                  className={cn(s.source === bestSource.source && "bg-emerald-50")}
                >
                  <TableCell className="font-medium">
                    <span className="flex items-center gap-2">
                      {s.source}
                      {s.source === bestSource.source && (
                        <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                          Best
                        </Badge>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono">{s.units}</TableCell>
                  <TableCell className="text-right font-mono">
                    ${s.avgCost.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    ${s.avgGross.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono">{s.avgC2M}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <Lightbulb className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Buying Rule:</span>{" "}
            Buy where the market is deep and your store is light. Focus acquisition
            on segments with the biggest inventory-to-demand gap.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
