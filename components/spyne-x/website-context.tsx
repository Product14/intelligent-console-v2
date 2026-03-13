"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { VehicleSummary } from "@/services/inventory/inventory.types"
import { Globe, Eye, EyeOff, Camera, TrendingDown, AlertCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type IssueType = "conversion" | "visibility" | "trust"

interface WebsiteIssue {
  vehicle: VehicleSummary
  type: IssueType
  label: string
  detail: string
  remedy: string
}

const ISSUE_CONFIG: Record<IssueType, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  conversion: { icon: Eye, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  visibility: { icon: EyeOff, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  trust: { icon: Camera, color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
}

function analyzeWebsiteIssues(vehicles: VehicleSummary[]): WebsiteIssue[] {
  const issues: WebsiteIssue[] = []

  for (const v of vehicles) {
    if (v.vdpViews >= 800 && v.leads < 3) {
      issues.push({
        vehicle: v,
        type: "conversion",
        label: "High views, low leads",
        detail: `${v.vdpViews.toLocaleString()} VDP views but only ${v.leads} leads — visitors are looking but not converting`,
        remedy: "Upgrade media quality, optimize pricing, or add urgency banner",
      })
    } else if (v.vdpViews < 400 && v.daysInStock >= 5 && v.publishStatus === "published") {
      issues.push({
        vehicle: v,
        type: "visibility",
        label: "Low visibility",
        detail: `Only ${v.vdpViews} VDP views after ${v.daysInStock} days — not appearing in enough searches`,
        remedy: "Activate campaign, check competitive pricing, improve SEO keywords",
      })
    } else if (v.mediaType === "none" && v.publishStatus === "published") {
      issues.push({
        vehicle: v,
        type: "trust",
        label: "Stock photos",
        detail: "Using stock photos — shoppers less likely to engage with generic imagery",
        remedy: "Schedule real photography or activate AI Instant Media",
      })
    }
  }

  return issues.sort((a, b) => {
    const typeOrder: Record<IssueType, number> = { conversion: 0, visibility: 1, trust: 2 }
    return typeOrder[a.type] - typeOrder[b.type]
  })
}

interface WebsiteContextProps {
  vehicles: VehicleSummary[]
  onUpgradeMedia: (vin: string) => void
  onAccelerate: (vin: string) => void
  compact?: boolean
}

export function WebsiteContext({ vehicles, onUpgradeMedia, onAccelerate, compact = false }: WebsiteContextProps) {
  const issues = React.useMemo(() => analyzeWebsiteIssues(vehicles), [vehicles])

  const conversionCount = issues.filter(i => i.type === "conversion").length
  const visibilityCount = issues.filter(i => i.type === "visibility").length
  const trustCount = issues.filter(i => i.type === "trust").length

  if (issues.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-5">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-bold tracking-tight">Website Intelligence</h3>
        </div>
        <p className="text-xs text-muted-foreground">No website-related issues detected. All vehicles performing within expected ranges.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-bold tracking-tight">Website Intelligence</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Website metrics connected to Time-to-Sell — only showing vehicles with actionable issues
        </p>

        <div className="flex items-center gap-3 mt-3">
          {conversionCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <Eye className="h-3 w-3" />{conversionCount} conversion
            </span>
          )}
          {visibilityCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <EyeOff className="h-3 w-3" />{visibilityCount} visibility
            </span>
          )}
          {trustCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
              <Camera className="h-3 w-3" />{trustCount} trust
            </span>
          )}
        </div>
      </div>

      <div className="divide-y">
        {issues.slice(0, compact ? 5 : 15).map(issue => {
          const config = ISSUE_CONFIG[issue.type]
          const Icon = config.icon
          return (
            <div key={`${issue.type}-${issue.vehicle.vin}`} className="px-5 py-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold", config.bg, config.color, config.border, "border")}>
                      <Icon className="h-2.5 w-2.5" />
                      {issue.label}
                    </span>
                    <Link href={`/inventory/${issue.vehicle.vin}`} className="text-sm font-medium hover:text-primary transition-colors">
                      {issue.vehicle.year} {issue.vehicle.make} {issue.vehicle.model}
                    </Link>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{issue.detail}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/50" />
                    <span className="text-[11px] text-muted-foreground">{issue.remedy}</span>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  {issue.type === "trust" || issue.type === "conversion" ? (
                    <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => onUpgradeMedia(issue.vehicle.vin)}>
                      Upgrade
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => onAccelerate(issue.vehicle.vin)}>
                      Accelerate
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {issues.length > (compact ? 5 : 15) && (
        <div className="px-5 py-3 border-t text-center">
          <Link href="/spyne-x/website" className="text-xs font-medium text-primary hover:underline">
            View all {issues.length} website issues
          </Link>
        </div>
      )}
    </div>
  )
}
