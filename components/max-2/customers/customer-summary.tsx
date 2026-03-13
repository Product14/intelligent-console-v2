"use client"

import { mockCustomerSummary } from "@/lib/max-2-mocks"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
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
  { key: "totalActive" as const, label: "Active Leads", icon: Users, color: "text-blue-600" },
  { key: "newThisWeek" as const, label: "New This Week", icon: UserPlus, color: "text-emerald-600" },
  { key: "appointmentsToday" as const, label: "Appointments Today", icon: Calendar, color: "text-violet-600" },
  { key: "followUpsDue" as const, label: "Follow-Ups Due", icon: Phone, warn: true },
  { key: "beBackOpportunities" as const, label: "Be-Back Opportunities", icon: RotateCcw, warn: true },
  { key: "avgResponseTime" as const, label: "Avg Response Time", icon: Clock, color: "text-cyan-600" },
  { key: "conversionRate" as const, label: "Conversion Rate", icon: TrendingUp, color: "text-emerald-600", pct: true },
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
            if (isWarn) iconColor = "text-amber-500"
            if (isDanger) iconColor = "text-red-500"

            return (
              <div
                key={stat.key}
                className={cn(
                  "flex flex-col gap-1.5 rounded-lg border p-3",
                  isWarn && "border-amber-300 bg-amber-50/50 dark:bg-amber-950/20",
                  isDanger && "border-red-300 bg-red-50/50 dark:bg-red-950/20",
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
                    isWarn && "text-amber-600",
                    isDanger && "text-red-600",
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
