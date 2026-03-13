"use client"

import { mockKPIs } from "@/lib/spyne-max-mocks"
import type { DealerKPI, KPIStatus } from "@/services/spyne-max/spyne-max.types"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LineChart, Line, ResponsiveContainer } from "recharts"

const DESK_KPI_IDS = [
  "units-mtd", "turn-rate", "total-pvr", "net-to-gross",
  "holding-cost", "days-to-frontline", "aged-45-plus", "finance-penetration",
]

const statusDot: Record<KPIStatus, string> = {
  above: "bg-emerald-500",
  at: "bg-amber-400",
  below: "bg-red-500",
}

const sparkColors: Record<KPIStatus, string> = {
  above: "#10b981",
  at: "#f59e0b",
  below: "#ef4444",
}

function formatValue(kpi: DealerKPI): string {
  const v = kpi.value
  switch (kpi.unit) {
    case "$": return `$${v.toLocaleString()}`
    case "$/day": return `$${v.toFixed(2)}`
    case "%": return `${v}%`
    case "x": return `${v}×`
    case "days": return `${v} d`
    case "units": return v.toLocaleString()
    default: return String(v)
  }
}

function formatTarget(kpi: DealerKPI): string {
  const t = kpi.target
  switch (kpi.unit) {
    case "$": return `$${t.toLocaleString()}`
    case "$/day": return `$${t.toFixed(0)}`
    case "%": return `${t}%`
    case "x": return `${t}×`
    case "days": return `${t} d`
    case "units": return t.toLocaleString()
    default: return String(t)
  }
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((v, i) => ({ i, v }))
  return (
    <ResponsiveContainer width="100%" height={32}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

function KPICard({ kpi }: { kpi: DealerKPI }) {
  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground truncate pr-2">
            {kpi.name}
          </span>
          <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", statusDot[kpi.status])} />
        </div>
        <span className="text-2xl font-bold tracking-tight">{formatValue(kpi)}</span>
        <div className="text-[11px] text-muted-foreground">
          Target: {formatTarget(kpi)}
        </div>
        <Sparkline data={kpi.trend} color={sparkColors[kpi.status]} />
      </CardContent>
    </Card>
  )
}

export function DeskKPIs() {
  const deskKPIs = DESK_KPI_IDS
    .map((id) => mockKPIs.find((k) => k.id === id))
    .filter((k): k is DealerKPI => !!k)

  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Key Metrics
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {deskKPIs.map((kpi) => (
          <KPICard key={kpi.id} kpi={kpi} />
        ))}
      </div>
    </div>
  )
}
