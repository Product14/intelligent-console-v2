"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Target } from "lucide-react"

const metrics = [
  {
    label: "TO %",
    value: 88,
    target: 90,
    targetLabel: "90%",
    isInRange: false,
    color: "text-amber-600",
    ringColor: "stroke-amber-500",
    bgColor: "stroke-amber-100",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    statusLabel: "Below Target",
  },
  {
    label: "Close %",
    value: 42,
    target: 42.5,
    targetLabel: "40–45%",
    isInRange: true,
    color: "text-emerald-600",
    ringColor: "stroke-emerald-500",
    bgColor: "stroke-emerald-100",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    statusLabel: "In Range",
  },
]

function RingGauge({
  value,
  max,
  ringColor,
  bgColor,
}: {
  value: number
  max: number
  ringColor: string
  bgColor: string
}) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(value / max, 1)
  const offset = circumference * (1 - pct)

  return (
    <svg viewBox="0 0 128 128" className="w-32 h-32">
      <circle
        cx="64"
        cy="64"
        r={radius}
        fill="none"
        strokeWidth="12"
        className={bgColor}
      />
      <circle
        cx="64"
        cy="64"
        r={radius}
        fill="none"
        strokeWidth="12"
        strokeLinecap="round"
        className={ringColor}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 64 64)"
      />
    </svg>
  )
}

export function TOandClose() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-500" />
          <CardTitle>TO &amp; Close Rate</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          {metrics.map((m) => (
            <div key={m.label} className="flex flex-col items-center gap-2">
              <div className="relative">
                <RingGauge
                  value={m.value}
                  max={100}
                  ringColor={m.ringColor}
                  bgColor={m.bgColor}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={cn("text-2xl font-bold", m.color)}>
                    {m.value}%
                  </span>
                </div>
              </div>
              <span className="font-semibold text-sm">{m.label}</span>
              <span className="text-xs text-muted-foreground">Target: {m.targetLabel}</span>
              <Badge variant="outline" className={cn("text-[10px]", m.badgeClass)}>
                {m.statusLabel}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
