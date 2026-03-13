"use client"

import { mockServiceLaneOpps } from "@/lib/max-2-mocks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Wrench, User } from "lucide-react"

export function ServiceLaneOpps() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Service-Lane Acquisitions</CardTitle>
        <p className="text-sm text-muted-foreground">
          Customers in your service drive with vehicles you can acquire
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {mockServiceLaneOpps.map((opp) => (
            <div
              key={opp.id}
              className="rounded-lg border bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-sm">{opp.customerName}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{opp.currentVehicle}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Wrench className="h-3 w-3" />
                    RO: ${opp.roAmount.toLocaleString()}
                  </div>
                  <p className="text-sm italic text-muted-foreground mt-2">
                    &ldquo;{opp.buySignal}&rdquo;
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-xs text-muted-foreground">Est. Equity</span>
                  <span className="flex items-center gap-0.5 text-xl font-bold text-emerald-600">
                    <DollarSign className="h-4 w-4" />
                    {opp.estimatedEquity.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
