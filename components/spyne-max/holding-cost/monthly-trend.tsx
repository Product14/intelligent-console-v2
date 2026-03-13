"use client"

import { mockHoldingCostTrend } from "@/lib/spyne-max-mocks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity } from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from "recharts"

export function MonthlyTrend() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4 text-primary" />
          Holding Cost Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={mockHoldingCostTrend}
              margin={{ top: 10, right: 20, bottom: 5, left: 0 }}
            >
              <defs>
                <linearGradient id="holdingGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis
                domain={[38, 52]}
                tick={{ fontSize: 12 }}
                tickFormatter={(v: number) => `$${v}`}
              />
              <Tooltip
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Holding Cost/Day"]}
                contentStyle={{
                  borderRadius: 8,
                  fontSize: 12,
                  border: "1px solid #e5e7eb",
                }}
              />
              <ReferenceArea
                y1={40}
                y2={50}
                fill="#10b981"
                fillOpacity={0.08}
                label={{
                  value: "Target: $40–$50",
                  position: "insideTopRight",
                  fontSize: 11,
                  fill: "#6b7280",
                }}
              />
              <ReferenceLine y={45} stroke="#10b981" strokeDasharray="4 4" strokeWidth={1} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#holdingGrad)"
                dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
