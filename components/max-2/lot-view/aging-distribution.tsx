"use client"

import { mockLotVehicles } from "@/lib/max-2-mocks"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Bucket {
  label: string
  min: number
  max: number
  color: string
  barColor: string
}

const buckets: Bucket[] = [
  { label: "0–15 days", min: 0, max: 15, color: "text-emerald-700", barColor: "bg-emerald-500" },
  { label: "16–30 days", min: 16, max: 30, color: "text-emerald-600", barColor: "bg-emerald-400" },
  { label: "31–45 days", min: 31, max: 45, color: "text-amber-600", barColor: "bg-amber-400" },
  { label: "46–60 days", min: 46, max: 60, color: "text-red-600", barColor: "bg-red-400" },
  { label: "60+ days", min: 61, max: Infinity, color: "text-red-700", barColor: "bg-red-600" },
]

export function AgingDistribution() {
  const total = mockLotVehicles.length

  const counts = buckets.map((b) => {
    const count = mockLotVehicles.filter(
      (v) => v.daysInStock >= b.min && v.daysInStock <= b.max,
    ).length
    return { ...b, count, pct: total > 0 ? (count / total) * 100 : 0 }
  })

  const maxCount = Math.max(...counts.map((c) => c.count), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aging Distribution</CardTitle>
        <CardDescription>Inventory breakdown by days in stock</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {counts.map((bucket) => (
            <div key={bucket.label} className="flex items-center gap-4">
              <span className="text-xs font-medium text-muted-foreground w-[80px] shrink-0">
                {bucket.label}
              </span>
              <div className="flex-1 h-7 bg-muted/40 rounded-md overflow-hidden relative">
                <div
                  className={cn("h-full rounded-md transition-all", bucket.barColor)}
                  style={{ width: `${(bucket.count / maxCount) * 100}%` }}
                />
              </div>
              <div className="flex items-center gap-2 shrink-0 w-[90px] justify-end">
                <span className={cn("text-sm font-bold", bucket.color)}>
                  {bucket.count}
                </span>
                <span className="text-xs text-muted-foreground w-[40px] text-right">
                  {bucket.pct.toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
          <span>Total inventory: <strong className="text-foreground">{total}</strong> units</span>
          <span>
            Fresh (≤30d):{" "}
            <strong className="text-emerald-600">
              {counts[0].count + counts[1].count}
            </strong>
            {" · "}
            Aging (31+d):{" "}
            <strong className="text-red-600">
              {counts[2].count + counts[3].count + counts[4].count}
            </strong>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
