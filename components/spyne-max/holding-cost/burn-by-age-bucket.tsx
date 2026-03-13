"use client"

import { mockBurnBuckets } from "@/lib/spyne-max-mocks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Layers } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

const stageStyle: Record<string, { bg: string; text: string; badge: string; fill: string }> = {
  fresh: { bg: "bg-emerald-50", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-800", fill: "#10b981" },
  watch: { bg: "bg-amber-50", text: "text-amber-700", badge: "bg-amber-100 text-amber-800", fill: "#f59e0b" },
  risk: { bg: "bg-orange-50", text: "text-orange-700", badge: "bg-orange-100 text-orange-800", fill: "#f97316" },
  critical: { bg: "bg-red-50", text: "text-red-700", badge: "bg-red-100 text-red-800", fill: "#ef4444" },
}

export function BurnByAgeBucket() {
  const chartData = mockBurnBuckets.map((b) => ({
    name: b.label.split("(")[0].trim(),
    burn: b.totalBurn,
    stage: b.stage,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Layers className="h-4 w-4 text-primary" />
          Burn by Age Bucket
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {mockBurnBuckets.map((b) => {
            const s = stageStyle[b.stage]
            return (
              <div
                key={b.stage}
                className={cn("rounded-lg border p-3", s.bg)}
              >
                <Badge className={cn("text-xs mb-2", s.badge)}>
                  {b.label}
                </Badge>
                <div className="space-y-1">
                  <p className={cn("text-lg font-bold", s.text)}>
                    ${b.totalBurn.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {b.count} units · Avg {b.avgDaysInBucket}d
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 20, bottom: 0, left: 10 }}
            >
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11 }}
                width={70}
              />
              <Tooltip
                formatter={(value: number) => [`$${value.toLocaleString()}`, "Total Burn"]}
                contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e5e7eb" }}
              />
              <Bar dataKey="burn" radius={[0, 6, 6, 0]} barSize={28}>
                {chartData.map((entry) => (
                  <Cell key={entry.stage} fill={stageStyle[entry.stage].fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
