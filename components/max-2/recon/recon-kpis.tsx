"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { MaterialSymbol } from "@/components/max-2/material-symbol"

interface KPIItem {
  label: string
  value: string
  target: string
  status: "green" | "amber" | "red"
  icon: string
}

const kpis: KPIItem[] = [
  {
    label: "Avg Days to Frontline",
    value: "2.8d",
    target: "Target ≤ 3d",
    status: "green",
    icon: "schedule",
  },
  {
    label: "SLA Compliance",
    value: "80%",
    target: "Target 100%",
    status: "red",
    icon: "check_circle",
  },
  {
    label: "Avg Recon Cost",
    value: "$1,180",
    target: "Target $1K–$1.4K",
    status: "green",
    icon: "payments",
  },
  {
    label: "Door Rate Compliance",
    value: "88%",
    target: "Target 100%",
    status: "amber",
    icon: "speed",
  },
]

const statusIconWrap: Record<string, string> = {
  green: cn("border", spyneComponentClasses.badgeSuccess),
  amber: cn("border", spyneComponentClasses.badgeWarning),
  red: cn("border", spyneComponentClasses.badgeError),
}

const statusDot: Record<string, string> = {
  green: "bg-spyne-success",
  amber: "bg-spyne-warning",
  red: "bg-spyne-error",
}

export function ReconKPIs() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <Card key={kpi.label}>
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={cn(spyneComponentClasses.kpiIcon, statusIconWrap[kpi.status])}>
                <MaterialSymbol name={kpi.icon} size={20} className="text-spyne-text" />
              </div>
              <span className="text-xs font-medium text-spyne-text-secondary">{kpi.label}</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-xl font-semibold tabular-nums tracking-tight text-spyne-text">
                {kpi.value}
              </span>
              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full shrink-0", statusDot[kpi.status])} />
                <span className="text-xs text-spyne-text-secondary">{kpi.target}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
