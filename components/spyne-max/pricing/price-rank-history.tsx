"use client"

import { mockVehiclePricing } from "@/lib/spyne-max-mocks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"]

function generateRankHistory() {
  const top5 = [...mockVehiclePricing]
    .sort((a, b) => b.daysInStock - a.daysInStock)
    .slice(0, 5)

  const weeks = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"]

  return weeks.map((week, wi) =>
    top5.reduce(
      (row, v) => {
        const key = `${v.year} ${v.make} ${v.model}`
        const base = v.marketRank
        const jitter = Math.round(
          Math.sin(wi * 1.2 + v.vin.charCodeAt(5)) * 3
        )
        row[key] = Math.max(1, Math.min(20, base + jitter - wi * 0.2))
        return row
      },
      { week } as Record<string, string | number>
    )
  )
}

export function PriceRankHistory() {
  const top5 = [...mockVehiclePricing]
    .sort((a, b) => b.daysInStock - a.daysInStock)
    .slice(0, 5)
  const data = generateRankHistory()
  const vehicleKeys = top5.map((v) => `${v.year} ${v.make} ${v.model}`)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4 text-primary" />
          Market Rank History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis
                reversed
                domain={[1, 20]}
                tick={{ fontSize: 12 }}
                label={{
                  value: "Rank",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 12 },
                }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  fontSize: 12,
                  border: "1px solid #e5e7eb",
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {vehicleKeys.map((key, i) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={COLORS[i]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
