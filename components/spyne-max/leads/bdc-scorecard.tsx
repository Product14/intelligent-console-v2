"use client"

import { mockBDCMetrics } from "@/lib/spyne-max-mocks"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Headphones, CalendarCheck, Clock, PhoneCall } from "lucide-react"

function MetricCard({
  label,
  value,
  target,
  unit,
  icon: Icon,
  isGood,
}: {
  label: string
  value: number
  target: string
  unit: string
  icon: typeof Clock
  isGood: boolean
}) {
  return (
    <div className={cn(
      "rounded-lg border p-4 flex flex-col gap-2",
      isGood ? "border-emerald-200 bg-emerald-50/50" : "border-red-200 bg-red-50/50"
    )}>
      <div className="flex items-center justify-between">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <Badge
          variant="outline"
          className={cn(
            "text-[10px]",
            isGood
              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
              : "bg-red-100 text-red-700 border-red-200"
          )}
        >
          {isGood ? "On Target" : "Off Target"}
        </Badge>
      </div>
      <span className="text-2xl font-bold">
        {value}{unit}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-[11px] text-muted-foreground">Target: {target}</span>
    </div>
  )
}

export function BDCScorecard() {
  const m = mockBDCMetrics
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Headphones className="h-5 w-5 text-indigo-500" />
          <CardTitle>BDC Scorecard</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <MetricCard
            label="Appointment Show Rate"
            value={m.appointmentShowRate}
            target={`${m.showRateTarget}%`}
            unit="%"
            icon={CalendarCheck}
            isGood={m.appointmentShowRate >= m.showRateTarget}
          />
          <MetricCard
            label="Avg Response Time"
            value={m.avgResponseTime}
            target={`< ${m.responseTimeTarget} min`}
            unit=" min"
            icon={Clock}
            isGood={m.avgResponseTime <= m.responseTimeTarget}
          />
          <MetricCard
            label="Contact Rate"
            value={m.contactRate}
            target="70%+"
            unit="%"
            icon={PhoneCall}
            isGood={m.contactRate >= 70}
          />
        </div>

        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-muted-foreground">Total Appts Set: </span>
            <span className="font-semibold">{m.totalAppointmentsSet}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Total Shows: </span>
            <span className="font-semibold">{m.totalShows}</span>
          </div>
        </div>

        <p className="text-sm italic text-muted-foreground border-l-2 border-indigo-300 pl-3">
          &ldquo;You don&rsquo;t have a lead problem — you have a follow-up problem.&rdquo;
        </p>
      </CardContent>
    </Card>
  )
}
