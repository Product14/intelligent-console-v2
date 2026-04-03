"use client"

import { mockServiceSummary } from "@/lib/max-2-mocks"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  Wrench, DollarSign, Star, Clock, Users, AlertTriangle,
  Gauge, CalendarCheck,
} from "lucide-react"

const metrics = [
  {
    label: "Open ROs",
    value: (d: typeof mockServiceSummary) => d.openROs,
    icon: Wrench,
    color: "text-spyne-info",
    bg: "bg-spyne-primary-soft",
  },
  {
    label: "Revenue Today",
    value: (d: typeof mockServiceSummary) => `$${d.revenueToday.toLocaleString()}`,
    icon: DollarSign,
    color: "text-spyne-success",
    bg: "spyne-row-positive",
  },
  {
    label: "Avg RO Value",
    value: (d: typeof mockServiceSummary) => `$${d.avgROValue.toLocaleString()}`,
    icon: Gauge,
    color: "text-spyne-primary",
    bg: "bg-spyne-primary-soft",
  },
  {
    label: "CSI Score",
    value: (d: typeof mockServiceSummary) => `${d.csiScore} / 5.0`,
    icon: Star,
    color: (d: typeof mockServiceSummary) => d.csiScore >= d.csiTarget ? "text-spyne-success" : "text-spyne-text",
    bg: (d: typeof mockServiceSummary) => d.csiScore >= d.csiTarget ? "spyne-row-positive" : "spyne-row-warn",
  },
  {
    label: "Tech Efficiency",
    value: (d: typeof mockServiceSummary) => `${d.techEfficiency}%`,
    icon: Users,
    color: "text-spyne-info",
    bg: "bg-spyne-primary-soft",
  },
  {
    label: "Bays Active",
    value: (d: typeof mockServiceSummary) => `${d.baysOccupied} / ${d.totalBays}`,
    icon: Clock,
    color: "text-spyne-text-secondary",
    bg: "bg-muted",
  },
  {
    label: "Appointments Today",
    value: (d: typeof mockServiceSummary) => d.appointmentsToday,
    icon: CalendarCheck,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    label: "Overdue Actions",
    value: (d: typeof mockServiceSummary) => d.overdueActions,
    icon: AlertTriangle,
    color: (d: typeof mockServiceSummary) => d.overdueActions > 0 ? "text-spyne-error" : "text-spyne-success",
    bg: (d: typeof mockServiceSummary) => d.overdueActions > 0 ? "spyne-row-error" : "spyne-row-positive",
  },
]

export function ServiceSummary() {
  const data = mockServiceSummary
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {metrics.map((m) => {
        const Icon = m.icon
        const color = typeof m.color === "function" ? m.color(data) : m.color
        const bg = typeof m.bg === "function" ? m.bg(data) : m.bg
        return (
          <Card key={m.label}>
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className={cn("rounded-full p-2", bg)}>
                <Icon className={cn("h-4 w-4", color)} />
              </div>
              <div>
                <p className="text-xl font-bold tracking-tight">{m.value(data)}</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
