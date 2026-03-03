"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getScenarioData } from "@/lib/demo-scenarios"
import { useScenario } from "@/lib/scenario-context"
import { useVehicles } from "@/hooks/use-vehicles"
import type { VehicleSummary } from "@/services/inventory/inventory.types"
import { Globe, AlertTriangle, Eye, EyeOff, Camera, Loader2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WebsiteIssue {
  type: "conversion" | "visibility" | "trust"
  label: string
  description: string
  icon: React.ElementType
  color: { bg: string; border: string; text: string; iconBg: string }
  vehicles: VehicleSummary[]
  remedy: string
}

function computeWebsiteIssues(vehicles: VehicleSummary[]): WebsiteIssue[] {
  const conversion = vehicles.filter(v => v.vdpViews >= 800 && v.leads < 3)
  const visibility = vehicles.filter(v => v.vdpViews < 400 && v.daysInStock >= 5)
  const trust = vehicles.filter(v => v.mediaType === "none")

  return [
    {
      type: "conversion", label: "High Views, Low Leads", description: "These vehicles attract traffic but fail to convert.",
      icon: Eye, color: { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700", iconBg: "bg-cyan-100" },
      vehicles: conversion, remedy: "Upgrade media, optimize price, improve CTA placement",
    },
    {
      type: "visibility", label: "Low Visibility", description: "These vehicles are not getting seen.",
      icon: EyeOff, color: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", iconBg: "bg-orange-100" },
      vehicles: visibility, remedy: "Activate campaign, improve SEO, boost VDP traffic",
    },
    {
      type: "trust", label: "Trust Issue — Stock Photos", description: "Using stock photos reduces shopper trust and conversion.",
      icon: Camera, color: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", iconBg: "bg-amber-100" },
      vehicles: trust, remedy: "Upload real photos or activate AI Instant Media",
    },
  ]
}

export default function WebsitePage() {
  const { activeScenario } = useScenario()
  const scenarioData = React.useMemo(() => getScenarioData(activeScenario), [activeScenario])
  const { vehicles: apiVehicles, loading } = useVehicles({ page: 1, perPage: 50, query: "*" })
  const vehicles = (activeScenario === "default" && apiVehicles.length > 0) ? apiVehicles : scenarioData.vehicles
  const issues = React.useMemo(() => computeWebsiteIssues(vehicles), [vehicles])

  if (activeScenario === "default" && loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  const totalAffected = issues.reduce((s, i) => s + i.vehicles.length, 0)

  return (
    <div className="space-y-0">
      <div className="border-b bg-white -mx-6 -mt-6 px-6 py-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white"><Globe className="h-5 w-5" /></div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Website Intelligence</h1>
            <p className="text-sm text-muted-foreground">Website performance connected to Time-to-Sell · {totalAffected} vehicles with issues</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-5 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <p className="text-sm font-semibold">Website metrics are shown contextually</p>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Website performance is not tracked in isolation. Each metric connects directly to a risk or opportunity bucket.
          High views with low leads indicates a conversion issue. Low views with no leads indicates a visibility issue.
          Stock photos indicate a trust issue. Each is tied to a specific vehicle and remedy.
        </p>
      </div>

      <div className="space-y-4">
        {issues.map(issue => {
          const Icon = issue.icon
          if (issue.vehicles.length === 0) return null
          return (
            <div key={issue.type} className={cn("rounded-xl border overflow-hidden", issue.color.border)}>
              <div className={cn("px-5 py-3.5 flex items-center justify-between", issue.color.bg)}>
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", issue.color.iconBg)}><Icon className={cn("h-4 w-4", issue.color.text)} /></div>
                  <div>
                    <h3 className={cn("text-sm font-bold", issue.color.text)}>{issue.label}</h3>
                    <p className="text-xs text-muted-foreground">{issue.description}</p>
                  </div>
                </div>
                <span className={cn("text-2xl font-extrabold tabular-nums", issue.color.text)}>{issue.vehicles.length}</span>
              </div>
              <div className="px-5 py-2.5 border-b bg-gray-50/50">
                <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Remedy:</span> {issue.remedy}</p>
              </div>
              <div className="divide-y">
                {issue.vehicles.slice(0, 5).map(v => (
                  <div key={v.vin} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <Link href={`/inventory/${v.vin}`} className="text-sm font-medium hover:text-primary transition-colors">
                        {v.year} {v.make} {v.model}
                      </Link>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                        <span>{v.vdpViews.toLocaleString()} VDP views</span><span>·</span>
                        <span>{v.leads} leads</span><span>·</span>
                        <span>{v.daysInStock}d in stock</span>
                        {v.mediaType === "clone" && <><span>·</span><span className="text-violet-600 font-medium">AI Instant Media</span></>}
                      </div>
                    </div>
                    <Link href={`/inventory/${v.vin}`}><Button size="sm" variant="ghost" className="h-7 w-7 p-0"><ChevronRight className="h-3.5 w-3.5" /></Button></Link>
                  </div>
                ))}
              </div>
              {issue.vehicles.length > 5 && (
                <div className="px-5 py-2.5 border-t text-center bg-gray-50/30">
                  <span className="text-xs text-muted-foreground">+{issue.vehicles.length - 5} more vehicles</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
