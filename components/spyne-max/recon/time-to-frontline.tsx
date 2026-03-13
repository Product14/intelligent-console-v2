"use client"

import { mockDealerProfile } from "@/lib/spyne-max-mocks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingDown } from "lucide-react"
import { ResponsiveContainer, LineChart, Line, YAxis } from "recharts"

const TREND_DATA = [4.2, 3.8, 3.5, 3.1, 2.9, 2.8].map((value, i) => ({
  idx: i,
  value,
}))

const TARGET = 3

export function TimeToFrontline() {
  const current = mockDealerProfile.avgReconDays
  const hitsTarget = current <= TARGET

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Time to Frontline</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-end gap-3">
          <span className={cn(
            "text-4xl font-bold tracking-tight",
            hitsTarget ? "text-emerald-600" : "text-red-600"
          )}>
            {current}
          </span>
          <span className="text-lg text-muted-foreground mb-1">days</span>
          <div className={cn(
            "flex items-center gap-1 ml-auto text-sm font-medium",
            hitsTarget ? "text-emerald-600" : "text-red-600"
          )}>
            <TrendingDown className="h-4 w-4" />
            {hitsTarget ? "On Target" : "Over Target"}
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Target: ≤ {TARGET} days
        </div>

        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={TREND_DATA}>
              <YAxis domain={[2, 5]} hide />
              <Line
                type="monotone"
                dataKey="value"
                stroke={hitsTarget ? "#059669" : "#dc2626"}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs italic text-muted-foreground border-t pt-3">
          &ldquo;The longer it takes to hit the frontline, the more profit leaks from your store.&rdquo;
        </p>
      </CardContent>
    </Card>
  )
}
