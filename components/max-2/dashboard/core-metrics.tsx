"use client"

import { mockCoreMetrics } from "@/lib/max-2-mocks"
import type { MetricStatus } from "@/services/max-2/max-2.types"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LineChart, Line, ResponsiveContainer } from "recharts"

const statusDot: Record<MetricStatus, string> = {
  above: "bg-emerald-500 shadow-emerald-500/40",
  at: "bg-amber-400 shadow-amber-400/40",
  below: "bg-red-500 shadow-red-500/40",
}

const statusLine: Record<MetricStatus, string> = {
  above: "#10b981",
  at: "#f59e0b",
  below: "#ef4444",
}

function formatValue(value: number, unit: string): string {
  if (unit === "$/day") return `$${value.toFixed(2)}`
  if (unit === "%") return `${value}%`
  if (unit === "x") return `${value}×`
  if (unit === "days") return `${value}d`
  return value.toLocaleString()
}

function formatTarget(target: number, unit: string): string {
  if (unit === "$/day") return `$${target}`
  if (unit === "%") return `${target}%`
  if (unit === "x") return `${target}×`
  if (unit === "days") return `${target}d`
  return target.toLocaleString()
}

export function CoreMetrics() {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight">Core Metrics</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {mockCoreMetrics.map((m) => {
          const sparkData = m.trend.map((v, i) => ({ i, v }))
          return (
            <Card key={m.id} className="py-4 gap-3">
              <CardContent className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full shadow-[0_0_5px] shrink-0",
                        statusDot[m.status],
                      )}
                    />
                    <span className="text-xs text-muted-foreground truncate">
                      {m.name}
                    </span>
                  </div>
                  <span className="text-2xl font-bold tracking-tight leading-none">
                    {formatValue(m.value, m.unit)}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Target: {formatTarget(m.target, m.unit)}
                  </span>
                </div>
                <div className="w-16 h-8 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparkData}>
                      <Line
                        type="monotone"
                        dataKey="v"
                        stroke={statusLine[m.status]}
                        strokeWidth={1.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
