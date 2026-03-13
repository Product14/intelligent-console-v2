"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { mockNetToGrossTrend } from "@/lib/spyne-max-mocks"
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, ReferenceLine, Tooltip } from "recharts"
import { Activity } from "lucide-react"

export function NetToGrossTrend() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-emerald-500" />
          <CardTitle>Net-to-Gross Trend</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">6-month N2G% trend — 30% target</p>
      </CardHeader>
      <CardContent>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockNetToGrossTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="n2gGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                domain={[20, 35]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                formatter={(value: number) => [`${value}%`, "N2G"]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid hsl(var(--border))",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              />
              <ReferenceLine
                y={30}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="6 4"
                strokeWidth={1.5}
                label={{
                  value: "30% Target",
                  position: "right",
                  fontSize: 11,
                  fill: "hsl(var(--muted-foreground))",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(160, 60%, 45%)"
                strokeWidth={2.5}
                fill="url(#n2gGradient)"
                dot={{ r: 4, fill: "hsl(160, 60%, 45%)", strokeWidth: 2, stroke: "white" }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
