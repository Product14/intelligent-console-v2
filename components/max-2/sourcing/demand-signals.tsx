"use client"

import { mockDemandSignals } from "@/lib/max-2-mocks"
import type { DemandSignal } from "@/services/max-2/max-2.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

const urgencyColor: Record<DemandSignal["urgency"], string> = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-emerald-100 text-emerald-700 border-emerald-200",
}

const sourceVariant: Record<string, string> = {
  "Sales Calls": "bg-blue-100 text-blue-700 border-blue-200",
  "Website Inquiry": "bg-violet-100 text-violet-700 border-violet-200",
  "Market Intel": "bg-cyan-100 text-cyan-700 border-cyan-200",
}

export function DemandSignals() {
  const sorted = [...mockDemandSignals].sort((a, b) => b.requestCount - a.requestCount)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Demand Signals</CardTitle>
        <p className="text-sm text-muted-foreground">
          What customers are asking for — from calls, inquiries, and market data
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Requests</TableHead>
              <TableHead className="text-right">Avg Budget</TableHead>
              <TableHead>Urgency</TableHead>
              <TableHead>In Stock?</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((s) => (
              <TableRow
                key={s.id}
                className={cn(!s.inStock && "bg-amber-50")}
              >
                <TableCell className="font-medium">{s.vehicleDescription}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn("text-[11px]", sourceVariant[s.sourceLabel])}
                  >
                    {s.sourceLabel}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">{s.requestCount}</TableCell>
                <TableCell className="text-right tabular-nums">
                  ${s.avgBudget.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn("text-[11px] capitalize", urgencyColor[s.urgency])}
                  >
                    {s.urgency}
                  </Badge>
                </TableCell>
                <TableCell>
                  {s.inStock ? (
                    <span className="text-emerald-600 font-medium text-sm">Yes</span>
                  ) : (
                    <span className="text-amber-600 font-medium text-sm">Not in stock</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
