"use client"

import * as React from "react"
import { mockMarketShareByZip } from "@/lib/spyne-max-mocks"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { MapPin } from "lucide-react"

function penetrationColor(pct: number) {
  if (pct >= 12) return "bg-emerald-100 text-emerald-800"
  if (pct >= 9) return "bg-amber-100 text-amber-800"
  return "bg-red-100 text-red-800"
}

export function MarketShareByZip() {
  const totalSales = mockMarketShareByZip.reduce((s, z) => s + z.yourSales, 0)
  const totalMarketVol = mockMarketShareByZip.reduce((s, z) => s + z.marketVolume, 0)
  const avgPenetration = totalMarketVol > 0
    ? ((totalSales / totalMarketVol) * 100).toFixed(1)
    : "0"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="h-4 w-4 text-primary" />
          Market Share by Zip
        </CardTitle>
        <CardDescription>Local market penetration by area</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zip</TableHead>
                <TableHead>Area</TableHead>
                <TableHead className="text-right">Mkt Vol</TableHead>
                <TableHead className="text-right">Your Sales</TableHead>
                <TableHead className="text-right">Penetration</TableHead>
                <TableHead>Top Competitors</TableHead>
                <TableHead className="text-right">Growth Target</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockMarketShareByZip.map((z) => (
                <TableRow key={z.zip}>
                  <TableCell className="font-mono">{z.zip}</TableCell>
                  <TableCell className="font-medium">{z.area}</TableCell>
                  <TableCell className="text-right font-mono">{z.marketVolume}</TableCell>
                  <TableCell className="text-right font-mono">{z.yourSales}</TableCell>
                  <TableCell className="text-right">
                    <Badge className={cn("font-mono text-xs", penetrationColor(z.penetration))}>
                      {z.penetration}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {z.topCompetitors.join(", ")}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-emerald-600 font-semibold">
                    {z.growthTarget}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex gap-6 rounded-lg border bg-muted/50 px-4 py-3">
          <div>
            <p className="text-xs text-muted-foreground">Total Sales</p>
            <p className="text-lg font-bold">{totalSales}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Avg Penetration</p>
            <p className="text-lg font-bold">{avgPenetration}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
