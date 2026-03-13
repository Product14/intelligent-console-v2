"use client"

import { mockWalkCompliance } from "@/lib/spyne-max-mocks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ClipboardCheck } from "lucide-react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts"

export function WalkCompliance() {
  const fifteenTotal = mockWalkCompliance.reduce((s, w) => s + w.fifteenDayTotal, 0)
  const fifteenCompleted = mockWalkCompliance.reduce((s, w) => s + w.fifteenDayCompleted, 0)
  const fifteenPercent = fifteenTotal > 0 ? Math.round((fifteenCompleted / fifteenTotal) * 100) : 0

  const fortyFiveTotal = mockWalkCompliance.reduce((s, w) => s + w.fortyFiveDayTotal, 0)
  const fortyFiveCompleted = mockWalkCompliance.reduce((s, w) => s + w.fortyFiveDayCompleted, 0)
  const fortyFivePercent = fortyFiveTotal > 0 ? Math.round((fortyFiveCompleted / fortyFiveTotal) * 100) : 0

  const chartData = mockWalkCompliance.map((w) => ({
    week: w.week,
    "15d Total": w.fifteenDayTotal,
    "15d Done": w.fifteenDayCompleted,
    "45d Total": w.fortyFiveDayTotal,
    "45d Done": w.fortyFiveDayCompleted,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5" />
          Walk Compliance
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border p-4 text-center">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              15-Day Compliance
            </p>
            <span className={cn(
              "text-3xl font-bold",
              fifteenPercent >= 80 ? "text-emerald-600" : "text-red-600"
            )}>
              {fifteenPercent}%
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              {fifteenCompleted}/{fifteenTotal} completed on time
            </p>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              45-Day Compliance
            </p>
            <span className={cn(
              "text-3xl font-bold",
              fortyFivePercent >= 80 ? "text-emerald-600" : "text-red-600"
            )}>
              {fortyFivePercent}%
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              {fortyFiveCompleted}/{fortyFiveTotal} completed on time
            </p>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={2} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="15d Total" fill="#93c5fd" radius={[2, 2, 0, 0]} />
              <Bar dataKey="15d Done" fill="#2563eb" radius={[2, 2, 0, 0]} />
              <Bar dataKey="45d Total" fill="#fca5a5" radius={[2, 2, 0, 0]} />
              <Bar dataKey="45d Done" fill="#dc2626" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
