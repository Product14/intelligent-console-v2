"use client"

import { cn } from "@/lib/utils"
import { STAGE_CONFIG } from "@/lib/inventory-mocks"
import type { VehicleStage, CampaignStatus, MediaType } from "@/services/inventory/inventory.types"
import { Zap, Camera, TrendingDown, Megaphone, Clock, CheckCircle2, CircleDashed, Sparkles, ArrowUp } from "lucide-react"

interface StageBadgeProps {
  stage: VehicleStage
  size?: "sm" | "md" | "lg"
  showDot?: boolean
}

export function StageBadge({ stage, size = "md", showDot = true }: StageBadgeProps) {
  const config = STAGE_CONFIG[stage]
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold border",
        config.bgColor,
        config.borderColor,
        config.textColor,
        sizeClasses[size]
      )}
    >
      {showDot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", config.dotColor)} />
      )}
      {config.label}
    </span>
  )
}

interface MediaBadgeProps {
  mediaType: MediaType
  daysInStock: number
  size?: "sm" | "md"
}

export function MediaBadge({ mediaType, daysInStock, size = "md" }: MediaBadgeProps) {
  const needsUpgrade = mediaType === "clone" && daysInStock >= 14
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  }

  if (mediaType === "real") {
    return (
      <div className="group relative inline-flex">
        <span className={cn(
          "inline-flex items-center gap-1.5 rounded-full font-semibold border",
          "bg-emerald-50 border-emerald-200 text-emerald-700",
          sizeClasses[size]
        )}>
          <Camera className="h-3 w-3" />
          Real Media
        </span>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2.5 bg-foreground text-background text-[11px] leading-snug rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg w-48">
          <p className="font-semibold mb-1">Real Media</p>
          <p className="text-background/70">Higher engagement · Unlocks boost · Campaign multiplier active</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-foreground" />
        </div>
      </div>
    )
  }

  if (mediaType === "clone") {
    return (
      <div className="group relative inline-flex">
        <span className={cn(
          "inline-flex items-center gap-1.5 rounded-full font-semibold border",
          needsUpgrade
            ? "bg-amber-50 border-amber-200 text-amber-700"
            : "bg-violet-50 border-violet-200 text-violet-700",
          sizeClasses[size]
        )}>
          <Sparkles className="h-3 w-3" />
          {needsUpgrade ? "Upgrade Recommended" : "AI Instant"}
        </span>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2.5 bg-foreground text-background text-[11px] leading-snug rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg w-52">
          <p className="font-semibold mb-1">AI Instant Media</p>
          <p className="text-background/70 mb-1.5">Live in minutes. Upgrade for maximum performance.</p>
          <p className="text-emerald-300 font-medium">Vehicles with Real Media close 18% faster and generate 24% more leads.</p>
          {needsUpgrade && (
            <p className="text-amber-300 font-medium mt-1">Recommended upgrade before Day 20 to protect margin.</p>
          )}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-foreground" />
        </div>
      </div>
    )
  }

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full font-medium border",
      "bg-gray-50 border-gray-200 text-gray-500",
      sizeClasses[size]
    )}>
      No Media
    </span>
  )
}

interface CampaignBadgeProps {
  status: CampaignStatus
  onActivate?: () => void
  onViewPerformance?: () => void
  /** Numeric performance indicator shown on active badges (e.g. leads, appointments) */
  performanceCount?: number
  performanceLabel?: string
}

export function CampaignBadge({ status, onActivate, onViewPerformance, performanceCount, performanceLabel }: CampaignBadgeProps) {
  const configs: Record<CampaignStatus, { label: string; className: string; icon: React.ReactNode }> = {
    none: {
      label: "Create",
      className: "bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 hover:border-primary/30 cursor-pointer transition-colors",
      icon: <Megaphone className="h-3 w-3" />,
    },
    active: {
      label: "Active",
      className: "bg-blue-50 text-blue-700 border-blue-200",
      icon: <Megaphone className="h-3 w-3" />,
    },
    scheduled: {
      label: "Scheduled",
      className: "bg-violet-50 text-violet-700 border-violet-200",
      icon: <Clock className="h-3 w-3" />,
    },
    completed: {
      label: "Completed",
      className: "bg-gray-50 text-gray-600 border-gray-200",
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
  }

  const config = configs[status]

  if (status === "none" && onActivate) {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); onActivate() }}
        className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border", config.className)}
      >
        {config.icon}
        {config.label}
      </button>
    )
  }

  if (status === "active" && onViewPerformance) {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); onViewPerformance() }}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border cursor-pointer transition-colors",
          "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300"
        )}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
        </span>
        {config.label}
        {performanceCount !== undefined && performanceCount > 0 && (
          <>
            <span className="text-blue-300">·</span>
            <span className="text-emerald-600 font-bold">{performanceCount}</span>
            {performanceLabel && <span className="text-blue-500 font-normal text-[10px]">{performanceLabel}</span>}
          </>
        )}
        <ArrowUp className="h-2.5 w-2.5 rotate-45" />
      </button>
    )
  }

  if (status === "active" && performanceCount !== undefined && performanceCount > 0) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", config.className)}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
        </span>
        {config.label}
        <span className="text-blue-300">·</span>
        <span className="text-emerald-600 font-bold">{performanceCount}</span>
        {performanceLabel && <span className="text-blue-500 font-normal text-[10px]">{performanceLabel}</span>}
      </span>
    )
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", config.className)}>
      {config.icon}
      {config.label}
    </span>
  )
}

interface StatusIndicatorsProps {
  priceReduced: boolean
  mediaType: MediaType
  leads: number
  daysInStock?: number
  showCloneAge?: boolean
}

export function StatusIndicators({
  priceReduced,
  mediaType: _mediaType,
  leads,
  daysInStock: _daysInStock,
  showCloneAge: _showCloneAge,
}: StatusIndicatorsProps) {
  return (
    <div className="flex items-center gap-1.5">
      {priceReduced && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-50 text-orange-600 border border-orange-200">
          <TrendingDown className="h-2.5 w-2.5" />
          Price Cut
        </span>
      )}
      {leads === 0 && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-50 text-gray-500 border border-gray-200">
          No Leads
        </span>
      )}
      {leads >= 10 && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">
          <Zap className="h-2.5 w-2.5" />
          High Interest
        </span>
      )}
    </div>
  )
}
