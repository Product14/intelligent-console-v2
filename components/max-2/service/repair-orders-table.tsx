"use client"

import { mockRepairOrders } from "@/lib/max-2-mocks"
import type { ROStatus } from "@/services/max-2/max-2.types"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { AlertCircle, Clock } from "lucide-react"

const statusConfig: Record<ROStatus, { label: string; className: string }> = {
  open: { label: "Open", className: cn("border", spyneComponentClasses.badgeInfo) },
  "in-progress": { label: "In Progress", className: cn("border", spyneComponentClasses.badgeSuccess) },
  "waiting-parts": { label: "Waiting Parts", className: cn("border", spyneComponentClasses.badgeWarning) },
  "waiting-approval": { label: "Waiting Approval", className: cn("border", spyneComponentClasses.badgeError) },
  completed: { label: "Completed", className: cn("border", spyneComponentClasses.badgeSuccess) },
  invoiced: { label: "Invoiced", className: cn("border", spyneComponentClasses.badgeNeutral) },
}

export function RepairOrdersTable() {
  const activeROs = mockRepairOrders.filter(
    (ro) => ro.status !== "invoiced"
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Repair Orders</CardTitle>
            <CardDescription>
              {activeROs.length} active ROs &middot; {mockRepairOrders.filter(r => r.isWaiter && r.status !== "completed" && r.status !== "invoiced").length} waiters
            </CardDescription>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              Today&apos;s labor: <span className="font-semibold text-foreground">${mockRepairOrders.reduce((s, r) => s + r.laborTotal, 0).toLocaleString()}</span>
            </span>
            <span className="text-muted-foreground">
              Parts: <span className="font-semibold text-foreground">${mockRepairOrders.reduce((s, r) => s + r.partsTotal, 0).toLocaleString()}</span>
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>RO #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Advisor</TableHead>
              <TableHead>Tech</TableHead>
              <TableHead>Bay</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Promised</TableHead>
              <TableHead className="text-right">Estimate</TableHead>
              <TableHead>Complaints</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockRepairOrders.map((ro) => {
              const status = statusConfig[ro.status]
              return (
                <TableRow key={ro.id} className={cn(ro.hasConcern && spyneComponentClasses.rowError)}>
                  <TableCell className="font-mono text-xs font-semibold">
                    <div className="flex items-center gap-1.5">
                      {ro.roNumber}
                      {ro.isWaiter && (
                        <Clock className="h-3 w-3 text-spyne-warning" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-sm">{ro.customerName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">
                    {ro.vehicle}
                  </TableCell>
                  <TableCell className="text-xs">{ro.advisor}</TableCell>
                  <TableCell className="text-xs">{ro.technician}</TableCell>
                  <TableCell className="text-xs">{ro.bay ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-xs", status.className)}>
                      {ro.hasConcern && <AlertCircle className="h-3 w-3 mr-1" />}
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{ro.promisedTime}</TableCell>
                  <TableCell className="text-right font-semibold">
                    ${ro.totalEstimate.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px]">
                    {ro.complaints.join(", ")}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
