"use client"

import { mockMarketGaps } from "@/lib/max-2-mocks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts"

function gapColor(gap: number) {
  if (gap > 20) return "text-red-600 font-semibold"
  if (gap >= 10) return "text-amber-600 font-semibold"
  return "text-emerald-600 font-semibold"
}

export function MarketGaps() {
  const chartData = mockMarketGaps.map((g) => ({
    segment: g.segment,
    "Market Demand": g.marketDemand,
    "Your Inventory": g.yourInventory,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Segment Gap Analysis</CardTitle>
        <p className="text-sm text-muted-foreground">
          Where market demand exceeds your current inventory
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Segment</TableHead>
              <TableHead className="text-right">Market Demand</TableHead>
              <TableHead className="text-right">Your Inventory</TableHead>
              <TableHead className="text-right">Gap</TableHead>
              <TableHead className="text-right">Avg Price</TableHead>
              <TableHead className="text-right">Monthly Opportunity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockMarketGaps.map((g) => (
              <TableRow key={g.segment}>
                <TableCell className="font-medium">{g.segment}</TableCell>
                <TableCell className="text-right tabular-nums">{g.marketDemand}</TableCell>
                <TableCell className="text-right tabular-nums">{g.yourInventory}</TableCell>
                <TableCell className={cn("text-right tabular-nums", gapColor(g.gap))}>
                  {g.gap}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  ${g.avgPrice.toLocaleString()}
                </TableCell>
                <TableCell className="text-right tabular-nums font-medium">
                  ${g.monthlyOpportunity.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="segment" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Market Demand" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Your Inventory" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
