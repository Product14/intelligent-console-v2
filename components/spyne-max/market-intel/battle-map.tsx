"use client"

import * as React from "react"
import { mockMarketSegments } from "@/lib/spyne-max-mocks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { Map } from "lucide-react"

function gapColor(gap: number) {
  if (gap > 15) return "text-emerald-700 font-bold"
  if (gap > 0) return "text-emerald-600"
  if (gap < -15) return "text-red-700 font-bold"
  if (gap < 0) return "text-red-600"
  return ""
}

function gapBg(gap: number) {
  if (gap > 15) return "bg-emerald-50"
  if (gap < -15) return "bg-red-50"
  return ""
}

export function BattleMap() {
  const totalMarketVol = mockMarketSegments.reduce((s, seg) => s + seg.marketVolume, 0)
  const totalYourVol = mockMarketSegments.reduce((s, seg) => s + seg.yourVolume, 0)
  const overallShare = totalYourVol > 0 ? ((totalYourVol / totalMarketVol) * 100).toFixed(1) : "0"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Map className="h-4 w-4 text-primary" />
          Battle Map
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Segment</TableHead>
              <TableHead className="text-right">Market Vol</TableHead>
              <TableHead className="text-right">Your Vol</TableHead>
              <TableHead className="text-right">Share %</TableHead>
              <TableHead className="text-right">Avg Price</TableHead>
              <TableHead className="text-right">Your Day Supply</TableHead>
              <TableHead className="text-right">Gap (units)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockMarketSegments.map((seg) => (
              <TableRow key={seg.segment} className={gapBg(seg.gap)}>
                <TableCell className="font-medium">{seg.segment}</TableCell>
                <TableCell className="text-right font-mono">{seg.marketVolume}</TableCell>
                <TableCell className="text-right font-mono">{seg.yourVolume}</TableCell>
                <TableCell className="text-right font-mono">{seg.marketShare}%</TableCell>
                <TableCell className="text-right font-mono">
                  ${seg.avgPrice.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-mono">{seg.yourDaySupply}</TableCell>
                <TableCell className={cn("text-right font-mono", gapColor(seg.gap))}>
                  {seg.gap > 0 ? "+" : ""}{seg.gap}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="font-semibold">Total</TableCell>
              <TableCell className="text-right font-mono font-semibold">{totalMarketVol}</TableCell>
              <TableCell className="text-right font-mono font-semibold">{totalYourVol}</TableCell>
              <TableCell className="text-right font-mono font-semibold">{overallShare}%</TableCell>
              <TableCell />
              <TableCell />
              <TableCell />
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  )
}
