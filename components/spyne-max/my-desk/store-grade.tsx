"use client"

import { getStoreGrade, STORE_GRADE_THRESHOLDS, mockDealerProfile } from "@/lib/spyne-max-mocks"
import type { StoreGrade } from "@/services/spyne-max/spyne-max.types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Shield, DollarSign, Percent, TrendingUp } from "lucide-react"

const gradeConfig: Record<StoreGrade, { color: string; ring: string; bg: string; text: string; badge: string }> = {
  elite: { color: "stroke-emerald-500", ring: "text-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  strong: { color: "stroke-blue-500", ring: "text-blue-500", bg: "bg-blue-50", text: "text-blue-700", badge: "bg-blue-100 text-blue-800 border-blue-200" },
  average: { color: "stroke-amber-500", ring: "text-amber-500", bg: "bg-amber-50", text: "text-amber-700", badge: "bg-amber-100 text-amber-800 border-amber-200" },
  weak: { color: "stroke-red-500", ring: "text-red-500", bg: "bg-red-50", text: "text-red-700", badge: "bg-red-100 text-red-800 border-red-200" },
}

const gradeScore: Record<StoreGrade, number> = { elite: 100, strong: 75, average: 50, weak: 25 }

function GradeRing({ grade }: { grade: StoreGrade }) {
  const config = gradeConfig[grade]
  const pct = gradeScore[grade]
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 120 120" className="-rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" strokeWidth="10" className="stroke-muted/30" />
        <circle
          cx="60" cy="60" r={radius} fill="none" strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(config.color, "transition-all duration-700")}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Shield className={cn("h-5 w-5 mb-0.5", config.ring)} />
        <span className={cn("text-lg font-bold tracking-tight", config.text)}>
          {pct}%
        </span>
      </div>
    </div>
  )
}

export function StoreGrade() {
  const { totalPVR, netToGross, returnOnSales } = mockDealerProfile
  const grade = getStoreGrade(totalPVR, netToGross, returnOnSales)
  const threshold = STORE_GRADE_THRESHOLDS.find((t) => t.grade === grade)!
  const config = gradeConfig[grade]

  const metrics = [
    { label: "Total PVR", value: `$${totalPVR.toLocaleString()}`, target: `$${threshold.totalPVR.toLocaleString()}`, icon: DollarSign },
    { label: "Net-to-Gross", value: `${netToGross}%`, target: `${threshold.netToGross}%`, icon: Percent },
    { label: "Return on Sales", value: `${returnOnSales}%`, target: `${threshold.returnOnSales}%`, icon: TrendingUp },
  ]

  return (
    <Card className={cn("overflow-hidden", config.bg, "border-0 shadow-md")}>
      <CardContent className="flex flex-col items-center gap-4 pt-6 pb-5">
        <GradeRing grade={grade} />
        <div className="text-center">
          <Badge className={cn("text-sm font-semibold px-4 py-1", config.badge)}>
            {threshold.label}
          </Badge>
          <p className="text-xs text-muted-foreground mt-2">{threshold.description}</p>
        </div>
        <div className="w-full grid grid-cols-3 gap-3 pt-2 border-t border-black/5">
          {metrics.map((m) => (
            <div key={m.label} className="flex flex-col items-center text-center gap-0.5">
              <m.icon className={cn("h-3.5 w-3.5", config.ring)} />
              <span className="text-sm font-bold">{m.value}</span>
              <span className="text-[10px] text-muted-foreground leading-tight">{m.label}</span>
              <span className="text-[10px] text-muted-foreground/70">Target: {m.target}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
