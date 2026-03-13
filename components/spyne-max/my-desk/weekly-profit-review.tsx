"use client"

import { useState } from "react"
import { mockDealerProfile, mockKPIs, mockVehiclePricing } from "@/lib/spyne-max-mocks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { ChevronDown, Calendar, TrendingUp, TrendingDown } from "lucide-react"

function getKPIValue(id: string) {
  return mockKPIs.find((k) => k.id === id)?.value ?? 0
}

function roiPerDay(v: typeof mockVehiclePricing[number]) {
  const frontGross = v.currentAsk - v.acquisitionCost
  return v.daysInStock > 0 ? frontGross / v.daysInStock : frontGross
}

const sortedByROI = [...mockVehiclePricing].sort((a, b) => roiPerDay(b) - roiPerDay(a))
const top5 = sortedByROI.slice(0, 5)
const bottom5 = sortedByROI.slice(-5).reverse()

const summaryMetrics = [
  { label: "Units MTD", value: getKPIValue("units-mtd"), format: (v: number) => v.toLocaleString() },
  { label: "Total PVR", value: mockDealerProfile.totalPVR, format: (v: number) => `$${v.toLocaleString()}` },
  { label: "Turn Rate", value: mockDealerProfile.turnRate, format: (v: number) => `${v}×` },
  { label: "Net-to-Gross", value: mockDealerProfile.netToGross, format: (v: number) => `${v}%` },
  { label: "Return on Sales", value: mockDealerProfile.returnOnSales, format: (v: number) => `${v}%` },
  { label: "Total Gross", value: mockDealerProfile.totalMonthlyGross, format: (v: number) => `$${v.toLocaleString()}` },
]

function VehicleRow({ v, rank, variant }: { v: typeof mockVehiclePricing[number]; rank: number; variant: "top" | "bottom" }) {
  const roi = roiPerDay(v)
  const fg = v.currentAsk - v.acquisitionCost
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-muted/40 transition-colors">
      <span className={cn(
        "text-xs font-bold w-5 text-center",
        variant === "top" ? "text-emerald-600" : "text-red-500"
      )}>
        #{rank}
      </span>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium">
          {v.year} {v.make} {v.model}
        </span>
        <span className="text-xs text-muted-foreground ml-2">{v.trim}</span>
      </div>
      <div className="text-right shrink-0">
        <div className="text-sm font-semibold">${roi.toFixed(0)}/day</div>
        <div className="text-[10px] text-muted-foreground">
          ${fg.toLocaleString()} FG · {v.daysInStock}d
        </div>
      </div>
    </div>
  )
}

export function WeeklyProfitReview() {
  const [open, setOpen] = useState(false)
  const financePen = getKPIValue("finance-penetration")
  const scPen = mockKPIs.find((k) => k.id === "service-contract")?.value ?? 0

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="shadow-sm">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors rounded-t-xl">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-500" />
              Weekly Profit Review — Monday Morning
              <Button variant="ghost" size="icon" className="ml-auto h-7 w-7">
                <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
              </Button>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="flex flex-col gap-6 pt-0">
            {/* Summary Grid */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Prior Week Summary
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {summaryMetrics.map((m) => (
                  <div key={m.label} className="rounded-lg bg-muted/40 px-3 py-2.5 text-center">
                    <div className="text-lg font-bold">{m.format(m.value)}</div>
                    <div className="text-[11px] text-muted-foreground">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 5 / Bottom 5 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    Top 5 by ROI/Day
                  </h4>
                </div>
                <div className="border rounded-lg divide-y">
                  {top5.map((v, i) => (
                    <VehicleRow key={v.vin} v={v} rank={i + 1} variant="top" />
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-red-600">
                    Bottom 5 by ROI/Day
                  </h4>
                </div>
                <div className="border rounded-lg divide-y">
                  {bottom5.map((v, i) => (
                    <VehicleRow key={v.vin} v={v} rank={i + 1} variant="bottom" />
                  ))}
                </div>
              </div>
            </div>

            {/* F&I Penetration */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                F&I Penetration Check
              </h4>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn(
                    financePen >= 70 ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-red-300 bg-red-50 text-red-700"
                  )}>
                    {financePen}%
                  </Badge>
                  <span className="text-sm text-muted-foreground">Finance Penetration</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn(
                    scPen >= 45 ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-red-300 bg-red-50 text-red-700"
                  )}>
                    {scPen}%
                  </Badge>
                  <span className="text-sm text-muted-foreground">Service Contract</span>
                </div>
              </div>
            </div>

            {/* Corrective Actions */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Corrective Actions
              </h4>
              <textarea
                placeholder="Note 2-3 corrective actions for the week ahead…"
                className="w-full rounded-lg border bg-muted/20 px-4 py-3 text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-ring/40 placeholder:text-muted-foreground/50"
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
