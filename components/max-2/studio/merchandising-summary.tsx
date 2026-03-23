"use client"

import Link from "next/link"
import { mockMerchandisingSummary, mockMerchandisingVehicles } from "@/lib/max-2-mocks"
import { cn } from "@/lib/utils"
import {
  Clock, Globe, Camera, AlertTriangle, FileText, Eye,
  ArrowRight, ImageOff, Tag,
} from "lucide-react"

export function MerchandisingSummary() {
  const s = mockMerchandisingSummary
  const vehicles = mockMerchandisingVehicles

  const needRealPhotos = vehicles.filter(
    (v) => v.mediaStatus !== "real-photos"
  ).length
  const aged30Plus = vehicles.filter((v) => v.daysInStock >= 30).length
  const missingDesc = vehicles.filter((v) => !v.hasDescription).length
  const notPublished = vehicles.filter(
    (v) => v.publishStatus !== "live"
  ).length
  const preliminaryPhotos = vehicles.filter(
    (v) => v.photoCount > 0 && v.photoCount < 8
  ).length

  const actions = [
    {
      count: needRealPhotos,
      label: "need real photos",
      severity: "critical" as const,
      icon: Camera,
      href: "/max-2/studio/inventory?media=needs-real",
    },
    {
      count: aged30Plus,
      label: "aged 30+ days — review pricing",
      severity: "critical" as const,
      icon: Tag,
      href: "/max-2/studio/inventory?age=30",
    },
    {
      count: notPublished,
      label: "not yet published",
      severity: "warning" as const,
      icon: Eye,
      href: "/max-2/studio/inventory?status=unpublished",
    },
    {
      count: missingDesc,
      label: "missing descriptions",
      severity: "warning" as const,
      icon: FileText,
      href: "/max-2/studio/inventory?desc=missing",
    },
    {
      count: preliminaryPhotos,
      label: "with < 8 photos — schedule shoot",
      severity: "warning" as const,
      icon: ImageOff,
      href: "/max-2/studio/inventory?photos=low",
    },
  ]
    .filter((a) => a.count > 0)
    .sort((a, b) => {
      if (a.severity === "critical" && b.severity !== "critical") return -1
      if (a.severity !== "critical" && b.severity === "critical") return 1
      return b.count - a.count
    })
    .slice(0, 4)

  const mediaSegments = [
    { key: "real", count: s.realPhotos, color: "bg-emerald-500", label: "Real" },
    { key: "clone", count: s.clonePhotosNeedReal, color: "bg-amber-400", label: "Clone" },
    { key: "stock", count: s.noPhotos + s.preliminaryPhotoshoot, color: "bg-red-400", label: "Stock/None" },
  ]

  const ageSegments = [
    { key: "0-4", count: s.age0to4, color: "bg-emerald-500", label: "0–4d" },
    { key: "5-30", count: s.age5to30, color: "bg-blue-400", label: "5–30d" },
    { key: "31-45", count: s.age31to45, color: "bg-amber-400", label: "31–45d" },
    { key: "45+", count: s.age45Plus, color: "bg-red-400", label: "45+d" },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* ── Section 1: North Star Metrics ── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Days to Frontline — primary hero (3/5 width) */}
        <div className="md:col-span-3 rounded-xl border bg-white p-5 min-h-[140px] flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Days to Frontline
            </span>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <span
                className={cn(
                  "text-5xl font-bold tabular-nums tracking-tight",
                  s.avgDaysToFrontline <= 3
                    ? "text-emerald-600"
                    : s.avgDaysToFrontline <= 5
                      ? "text-amber-600"
                      : "text-red-600"
                )}
              >
                {s.avgDaysToFrontline}
              </span>
              <span className="text-lg text-muted-foreground ml-1.5">days</span>
            </div>
            <div className="text-right mb-1">
              <p className="text-xs text-muted-foreground">
                Target: <span className="font-semibold text-foreground">4 days</span>
              </p>
              <p className={cn(
                "text-xs font-medium mt-0.5",
                s.avgDaysToFrontline <= 4 ? "text-emerald-600" : "text-amber-600"
              )}>
                {s.avgDaysToFrontline <= 4 ? "On target" : `${(s.avgDaysToFrontline - 4).toFixed(1)} days over`}
              </p>
            </div>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                s.avgDaysToFrontline <= 3
                  ? "bg-emerald-500"
                  : s.avgDaysToFrontline <= 5
                    ? "bg-amber-500"
                    : "bg-red-500"
              )}
              style={{ width: `${Math.min((4 / Math.max(s.avgDaysToFrontline, 1)) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Website Score — secondary hero (2/5 width) */}
        <div className="md:col-span-2 rounded-xl border bg-white p-5 min-h-[140px] flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Globe className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Website Score
            </span>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <span
                className={cn(
                  "text-5xl font-bold tabular-nums tracking-tight",
                  s.websiteScore >= 7.5
                    ? "text-emerald-600"
                    : s.websiteScore >= 5
                      ? "text-amber-600"
                      : "text-red-600"
                )}
              >
                {s.websiteScore}
              </span>
              <span className="text-lg text-muted-foreground ml-1">/10</span>
            </div>
            <div className="text-right mb-1">
              <p className="text-xs text-muted-foreground">
                Industry avg: <span className="font-semibold text-foreground">6.5</span>
              </p>
              <p className={cn(
                "text-xs font-medium mt-0.5",
                s.websiteScore >= 6.5 ? "text-emerald-600" : "text-red-600"
              )}>
                {s.websiteScore >= 6.5
                  ? `+${(s.websiteScore - 6.5).toFixed(1)} above avg`
                  : `${(6.5 - s.websiteScore).toFixed(1)} below avg`}
              </p>
            </div>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                s.websiteScore >= 7.5
                  ? "bg-emerald-500"
                  : s.websiteScore >= 5
                    ? "bg-amber-500"
                    : "bg-red-500"
              )}
              style={{ width: `${(s.websiteScore / 10) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Section 2: Actions Required ── */}
      {actions.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
            Actions Required
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {actions.map((action) => {
              const Icon = action.icon
              const isCritical = action.severity === "critical"
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg border p-3 transition-colors",
                    isCritical
                      ? "border-red-200 bg-red-50/60 hover:bg-red-50"
                      : "border-amber-200 bg-amber-50/60 hover:bg-amber-50"
                  )}
                >
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                    isCritical ? "bg-red-100" : "bg-amber-100"
                  )}>
                    <Icon className={cn(
                      "h-4 w-4",
                      isCritical ? "text-red-600" : "text-amber-600"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={cn(
                      "text-lg font-bold tabular-nums",
                      isCritical ? "text-red-700" : "text-amber-700"
                    )}>
                      {action.count}
                    </span>
                    <p className="text-xs text-muted-foreground leading-tight truncate">
                      {action.label}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0" />
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Section 3: Inventory Composition ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Media Readiness */}
        <div className="rounded-lg border bg-white p-4">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-3">
            Media Readiness
          </p>
          <div className="flex h-2.5 rounded-full overflow-hidden bg-muted mb-4">
            {mediaSegments.map((seg) => (
              <div
                key={seg.key}
                className={cn("transition-all", seg.color)}
                style={{ width: `${(seg.count / s.totalVehicles) * 100}%` }}
              />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {mediaSegments.map((seg) => (
              <div key={seg.key} className={cn("rounded-md border-l-[3px] pl-2.5 py-1", seg.color.replace("bg-", "border-"))}>
                <p className="text-lg font-bold tabular-nums leading-none">{seg.count}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{seg.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Age Distribution */}
        <div className="rounded-lg border bg-white p-4">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-3">
            Age Distribution
          </p>
          <div className="flex h-2.5 rounded-full overflow-hidden bg-muted mb-4">
            {ageSegments.map((seg) => (
              <div
                key={seg.key}
                className={cn("transition-all", seg.color)}
                style={{ width: `${(seg.count / s.totalVehicles) * 100}%` }}
              />
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {ageSegments.map((seg) => (
              <div key={seg.key} className={cn("rounded-md border-l-[3px] pl-2 py-1", seg.color.replace("bg-", "border-"))}>
                <p className="text-lg font-bold tabular-nums leading-none">{seg.count}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{seg.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Split */}
        <div className="rounded-lg border bg-white p-4">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-3">
            Inventory
          </p>
          <div className="flex items-end gap-1 mb-4">
            <span className="text-3xl font-bold tabular-nums leading-none">{s.totalVehicles}</span>
            <span className="text-sm text-muted-foreground mb-0.5">vehicles</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md border-l-[3px] border-blue-500 pl-2.5 py-1">
              <p className="text-lg font-bold tabular-nums leading-none text-blue-600">{s.newVehicles}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">New</p>
            </div>
            <div className="rounded-md border-l-[3px] border-slate-400 pl-2.5 py-1">
              <p className="text-lg font-bold tabular-nums leading-none">{s.usedVehicles}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Pre-Owned</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
