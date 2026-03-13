"use client"

import { mockTradeInOpps } from "@/lib/max-2-mocks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export function TradeInOpps() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Trade-In Opportunities</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Vehicle Offered</TableHead>
              <TableHead className="text-right">Est. ACV</TableHead>
              <TableHead className="text-right">Est. Front Gross</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Days Old</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockTradeInOpps.map((t) => (
              <TableRow
                key={t.id}
                className={cn(t.daysOld <= 1 && "bg-emerald-50")}
              >
                <TableCell className="font-medium">{t.customerName}</TableCell>
                <TableCell>{t.vehicleOffered}</TableCell>
                <TableCell className="text-right tabular-nums">
                  ${t.estimatedACV.toLocaleString()}
                </TableCell>
                <TableCell className="text-right tabular-nums font-medium text-emerald-600">
                  ${t.estimatedFrontGross.toLocaleString()}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{t.source}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {t.daysOld === 0 ? (
                    <span className="font-semibold text-emerald-600">Today</span>
                  ) : (
                    <span>{t.daysOld}d</span>
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
