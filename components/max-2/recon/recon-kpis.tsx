"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Clock, CheckCircle2, DollarSign, Gauge } from "lucide-react"

interface KPIItem {
  label: string
  value: string
  target: string
  status: "green" | "amber" | "red"
  icon: React.ReactNode
}

const kpis: KPIItem[] = [
  {
    label: "Avg Days to Frontline",
    value: "2.8d",
    target: "Target ≤ 3d",
    status: "green",
    icon: <Clock className="h-4 w-4" />,
  },
  {
    label: "SLA Compliance",
    value: "80%",
    target: "Target 100%",
    status: "red",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  {
    label: "Avg Recon Cost",
    value: "$1,180",
    target: "Target $1K–$1.4K",
    status: "green",
    icon: <DollarSign className="h-4 w-4" />,
  },
  {
    label: "Door Rate Compliance",
    value: "88%",
    target: "Target 100%",
    status: "amber",
    icon: <Gauge className="h-4 w-4" />,
  },
]

const statusBg: Record<string, string> = {
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
}

const statusDot: Record<string, string> = {
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
}

export function ReconKPIs() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <Card key={kpi.label}>
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("rounded-md p-1.5", statusBg[kpi.status])}>
                {kpi.icon}
              </div>
              <span className="text-xs font-medium text-muted-foreground">{kpi.label}</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold tracking-tight">{kpi.value}</span>
              <div className="flex items-center gap-1.5">
                <span className={cn("h-2 w-2 rounded-full", statusDot[kpi.status])} />
                <span className="text-[11px] text-muted-foreground">{kpi.target}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
