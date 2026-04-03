"use client"

import { mockCustomerSummary } from "@/lib/max-2-mocks"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import {
  Users,
  UserPlus,
  Calendar,
  Phone,
  RotateCcw,
  Clock,
  TrendingUp,
  UserMinus,
} from "lucide-react"

const stats = [
  { key: "totalActive" as const, label: "Active Leads", icon: Users, color: "text-spyne-info" },
  { key: "newThisWeek" as const, label: "New This Week", icon: UserPlus, color: "text-spyne-success" },
  { key: "appointmentsToday" as const, label: "Appointments Today", icon: Calendar, color: "text-spyne-primary" },
  { key: "followUpsDue" as const, label: "Follow-Ups Due", icon: Phone, warn: true },
  { key: "beBackOpportunities" as const, label: "Be-Back Opportunities", icon: RotateCcw, warn: true },
  { key: "avgResponseTime" as const, label: "Avg Response Time", icon: Clock, color: "text-spyne-info" },
  { key: "conversionRate" as const, label: "Conversion Rate", icon: TrendingUp, color: "text-spyne-success", pct: true },
  { key: "lostThisMonth" as const, label: "Lost This Month", icon: UserMinus, danger: true },
] as const

export function CustomerSummaryCards() {
  const s = mockCustomerSummary

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Customers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            const raw = s[stat.key]
            const value = "pct" in stat && stat.pct ? `${raw}%` : String(raw)

            const isWarn = "warn" in stat && stat.warn && typeof raw === "number" && raw > 0
            const isDanger = "danger" in stat && stat.danger && typeof raw === "number" && raw > 0

            let iconColor = "color" in stat ? stat.color : "text-muted-foreground"
            if (isWarn) iconColor = "text-spyne-warning"
            if (isDanger) iconColor = "text-spyne-error"

            return (
              <div
                key={stat.key}
                className={cn(
                  "flex flex-col gap-1.5 rounded-lg border p-3",
                  isWarn && cn("border-spyne-border", spyneComponentClasses.rowWarn),
                  isDanger && cn("border-spyne-border", spyneComponentClasses.rowError),
                )}
              >
                <div className="flex items-center gap-1.5">
                  <Icon className={cn("h-4 w-4 shrink-0", iconColor)} />
                  <span className="text-xs text-muted-foreground truncate">
                    {stat.label}
                  </span>
                </div>
                <span
                  className={cn(
                    "text-2xl font-bold tracking-tight leading-none",
                    isWarn && "text-spyne-text",
                    isDanger && "text-spyne-error",
                  )}
                >
                  {value}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
