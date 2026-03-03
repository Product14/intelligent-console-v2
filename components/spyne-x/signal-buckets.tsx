"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { VehicleSummary } from "@/services/inventory/inventory.types"
import {
  Clock, EyeOff, Wrench, Skull, Flame, TrendingDown, Eye,
  Zap, Camera, Phone, Megaphone, Sparkles, ChevronRight, X,
  Globe, Lock, AlertCircle, DollarSign,
} from "lucide-react"

interface BucketDef {
  id: string
  title: string
  subtitle: string
  icon: React.ElementType
  count: number
  marginExposure: number
  vehicles: VehicleSummary[]
  colorScheme: { bg: string; border: string; text: string; iconBg: string; accent: string }
  remedies: { label: string; icon: React.ElementType; action: "accelerate" | "upgrade" }[]
  automationHints: string[]
}

function getRootCauses(v: VehicleSummary, bucketId: string): string[] {
  const causes: string[] = []
  if (bucketId === "near-tmax") {
    const daysLeft = Math.ceil(v.marginRemaining / v.dailyBurn)
    causes.push(`Only ${daysLeft} day${daysLeft !== 1 ? "s" : ""} of margin remaining ($${v.marginRemaining.toLocaleString()})`)
  }
  if (bucketId === "dead-inventory") {
    causes.push(`Margin depleted — losing $${v.dailyBurn}/day in holding costs`)
  }
  if (v.campaignStatus === "none") causes.push("No campaign active")
  if (v.mediaType === "clone" && v.daysInStock >= 14) causes.push(`AI Instant Media for ${v.daysInStock}d — real media recommended`)
  if (v.mediaType === "none") causes.push("Stock photos only — no merchandising")
  if (v.leads === 0 && v.daysInStock >= 5) causes.push("Zero leads since go-live")
  if (v.vdpViews >= 800 && v.leads < 3) causes.push("High VDP views but weak lead conversion")
  if (v.vdpViews < 400 && v.daysInStock >= 5) causes.push("Low VDP visibility")
  if (v.publishStatus !== "published") causes.push("Not yet published to marketplace")
  return causes.slice(0, 4)
}

function getWebsiteContext(v: VehicleSummary): { type: "conversion" | "visibility" | "trust" | null; label: string } {
  if (v.vdpViews >= 800 && v.leads < 3) return { type: "conversion", label: `${v.vdpViews.toLocaleString()} views, ${v.leads} leads — conversion issue` }
  if (v.vdpViews < 400 && v.daysInStock >= 5) return { type: "visibility", label: `${v.vdpViews} views — visibility issue` }
  if (v.mediaType === "none") return { type: "trust", label: "Stock photos — trust issue" }
  return { type: null, label: "" }
}

function computeBuckets(vehicles: VehicleSummary[]): { risk: BucketDef[]; opportunity: BucketDef[] } {
  const nearTMax = vehicles.filter(v => v.marginRemaining > 0 && v.marginRemaining / v.dailyBurn <= 5)
  const noLeads = vehicles.filter(v => v.daysInStock >= 5 && v.leads === 0 && v.publishStatus === "published")
  const opDelay = vehicles.filter(v => (v.mediaType === "clone" && v.daysInStock >= 20) || v.mediaType === "none" || v.publishStatus !== "published")
  const deadInv = vehicles.filter(v => v.marginRemaining <= 0)

  const hotVehicles = vehicles.filter(v => v.leads >= 10 || v.vdpViews >= 2000)
  const priceDrop = vehicles.filter(v => v.priceReduced)
  const highTraffic = vehicles.filter(v => v.vdpViews >= 800 && v.leads < 3)

  return {
    risk: [
      {
        id: "near-tmax", title: "Near T-Max", subtitle: "Breaching target time-to-sell", icon: Clock,
        count: nearTMax.length, marginExposure: nearTMax.reduce((s, v) => s + v.marginRemaining, 0), vehicles: nearTMax,
        colorScheme: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", iconBg: "bg-red-100", accent: "border-l-red-500" },
        remedies: [
          { label: "Reduce Price", icon: TrendingDown, action: "accelerate" },
          { label: "Activate Campaign", icon: Zap, action: "accelerate" },
          { label: "Wholesale Exit", icon: Skull, action: "accelerate" },
        ],
        automationHints: ["Auto-reduce price at T-Max threshold", "Auto-activate campaign"],
      },
      {
        id: "no-leads", title: "No Leads After Go-Live", subtitle: "5+ days, zero demand signal", icon: EyeOff,
        count: noLeads.length, marginExposure: noLeads.reduce((s, v) => s + Math.max(0, v.marginRemaining), 0), vehicles: noLeads,
        colorScheme: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", iconBg: "bg-orange-100", accent: "border-l-orange-500" },
        remedies: [
          { label: "Market Price Compare", icon: DollarSign, action: "accelerate" },
          { label: "Activate Campaign", icon: Megaphone, action: "accelerate" },
          { label: "Upgrade Media", icon: Camera, action: "upgrade" },
        ],
        automationHints: ["Auto-activate campaign after 5d with 0 leads", "Auto-notify BDC"],
      },
      {
        id: "op-delay", title: "Operational Delay", subtitle: "Preparation & media blockers", icon: Wrench,
        count: opDelay.length, marginExposure: opDelay.reduce((s, v) => s + Math.max(0, v.marginRemaining), 0), vehicles: opDelay,
        colorScheme: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", iconBg: "bg-amber-100", accent: "border-l-amber-500" },
        remedies: [
          { label: "Assign Photographer", icon: Camera, action: "upgrade" },
          { label: "Push to Publish", icon: Sparkles, action: "accelerate" },
        ],
        automationHints: ["Auto-schedule photographer on VIN add", "Auto-push publish after media ready"],
      },
      {
        id: "dead-inventory", title: "Dead Inventory", subtitle: "Beyond margin recovery", icon: Skull,
        count: deadInv.length, marginExposure: deadInv.reduce((s, v) => s + v.marginRemaining, 0), vehicles: deadInv,
        colorScheme: { bg: "bg-red-50/70", border: "border-red-300", text: "text-red-800", iconBg: "bg-red-200", accent: "border-l-red-700" },
        remedies: [
          { label: "Wholesale Exit", icon: Skull, action: "accelerate" },
          { label: "Dealer Trade", icon: Sparkles, action: "accelerate" },
        ],
        automationHints: ["Auto-flag wholesale when margin hits $0", "Auto-suggest neighbor dealers"],
      },
    ],
    opportunity: [
      {
        id: "hot-vehicles", title: "Hot Vehicles", subtitle: "High demand signals", icon: Flame,
        count: hotVehicles.length, marginExposure: 0, vehicles: hotVehicles,
        colorScheme: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", iconBg: "bg-emerald-100", accent: "border-l-emerald-500" },
        remedies: [
          { label: "Hot Pack Campaign", icon: Zap, action: "accelerate" },
          { label: "Notify BDC", icon: Phone, action: "accelerate" },
          { label: "Urgency Banner", icon: Flame, action: "accelerate" },
        ],
        automationHints: ["Auto-enable Hot Pack on lead spike", "Auto-update Vini script"],
      },
      {
        id: "price-drop", title: "Price Drop Trigger", subtitle: "Re-engage price-sensitive prospects", icon: TrendingDown,
        count: priceDrop.length, marginExposure: 0, vehicles: priceDrop,
        colorScheme: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", iconBg: "bg-blue-100", accent: "border-l-blue-500" },
        remedies: [
          { label: "Outbound Prospects", icon: Phone, action: "accelerate" },
          { label: "Activate Campaign", icon: Megaphone, action: "accelerate" },
        ],
        automationHints: ["Auto-outbound on price drop", "Auto-update Vini messaging"],
      },
      {
        id: "high-traffic-low-conv", title: "High Traffic, Low Conversion", subtitle: "Conversion problem detected", icon: Eye,
        count: highTraffic.length, marginExposure: 0, vehicles: highTraffic,
        colorScheme: { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700", iconBg: "bg-cyan-100", accent: "border-l-cyan-500" },
        remedies: [
          { label: "Upgrade Media", icon: Camera, action: "upgrade" },
          { label: "Price Optimization", icon: TrendingDown, action: "accelerate" },
          { label: "Campaign Boost", icon: Zap, action: "accelerate" },
        ],
        automationHints: ["Auto-flag conversion issues", "Auto-suggest media upgrade"],
      },
    ],
  }
}

interface SignalBucketsProps {
  vehicles: VehicleSummary[]
  onAccelerate: (vin: string) => void
  onUpgradeMedia: (vin: string) => void
}

export function SignalBuckets({ vehicles, onAccelerate, onUpgradeMedia }: SignalBucketsProps) {
  const { risk, opportunity } = React.useMemo(() => computeBuckets(vehicles), [vehicles])
  const [expanded, setExpanded] = React.useState<string | null>(null)

  const allBuckets = [...risk, ...opportunity]
  const expandedBucket = allBuckets.find(b => b.id === expanded)

  const totalRisk = risk.reduce((s, b) => s + b.count, 0)
  const totalOpp = opportunity.reduce((s, b) => s + b.count, 0)

  const renderBucketCard = (bucket: BucketDef) => {
    const Icon = bucket.icon
    const isActive = expanded === bucket.id
    return (
      <button
        key={bucket.id}
        onClick={() => bucket.count > 0 && setExpanded(isActive ? null : bucket.id)}
        disabled={bucket.count === 0}
        className={cn(
          "text-left rounded-xl border-l-4 border bg-white p-4 transition-all",
          bucket.colorScheme.accent,
          isActive ? cn(bucket.colorScheme.border, "ring-2 ring-offset-1", bucket.colorScheme.border.replace("border-", "ring-")) : "border-gray-100",
          bucket.count === 0 ? "opacity-40 cursor-default" : "cursor-pointer hover:shadow-sm"
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <div className={cn("p-1.5 rounded-lg", bucket.colorScheme.iconBg)}>
            <Icon className={cn("h-4 w-4", bucket.colorScheme.text)} />
          </div>
          <span className={cn("text-2xl font-extrabold tabular-nums", bucket.colorScheme.text)}>{bucket.count}</span>
        </div>
        <p className="text-sm font-semibold text-foreground leading-tight">{bucket.title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{bucket.subtitle}</p>
        {bucket.count > 0 && bucket.marginExposure !== 0 && (
          <p className={cn("text-xs font-semibold mt-2 tabular-nums", bucket.colorScheme.text)}>
            {bucket.marginExposure < 0 ? `-$${Math.abs(bucket.marginExposure).toLocaleString()}` : `$${bucket.marginExposure.toLocaleString()}`} exposed
          </p>
        )}
      </button>
    )
  }

  return (
    <div className="space-y-6">
      {/* Risk */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Risk Signals</h3>
          {totalRisk > 0 && <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">{totalRisk}</span>}
        </div>
        <div className="grid grid-cols-4 gap-3">{risk.map(renderBucketCard)}</div>
      </div>

      {/* Opportunity */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Opportunity Signals</h3>
          {totalOpp > 0 && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">{totalOpp}</span>}
        </div>
        <div className="grid grid-cols-3 gap-3">{opportunity.map(renderBucketCard)}</div>
      </div>

      {/* Expanded Detail */}
      {expandedBucket && expandedBucket.vehicles.length > 0 && (
        <div className={cn("rounded-xl border bg-white overflow-hidden", expandedBucket.colorScheme.border)}>
          <div className={cn("px-5 py-3 flex items-center justify-between", expandedBucket.colorScheme.bg)}>
            <div className="flex items-center gap-2">
              {React.createElement(expandedBucket.icon, { className: cn("h-4 w-4", expandedBucket.colorScheme.text) })}
              <h4 className={cn("text-sm font-bold", expandedBucket.colorScheme.text)}>{expandedBucket.title}</h4>
              <span className="text-xs text-muted-foreground">· {expandedBucket.vehicles.length} vehicle{expandedBucket.vehicles.length !== 1 ? "s" : ""}</span>
            </div>
            <button onClick={() => setExpanded(null)} className="p-1 rounded-md hover:bg-black/5 transition-colors">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div className="divide-y">
            {expandedBucket.vehicles.slice(0, 10).map(vehicle => {
              const daysToLive = vehicle.marginRemaining > 0 ? Math.ceil(vehicle.marginRemaining / vehicle.dailyBurn) : 0
              const rootCauses = getRootCauses(vehicle, expandedBucket.id)
              const webCtx = getWebsiteContext(vehicle)

              return (
                <div key={vehicle.vin} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <Link href={`/inventory/${vehicle.vin}`} className="text-sm font-semibold hover:text-primary transition-colors">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                        <span className="text-muted-foreground font-normal ml-1.5">{vehicle.trim}</span>
                      </Link>

                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs text-muted-foreground">{vehicle.daysInStock}d in stock</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs">
                          {vehicle.marginRemaining <= 0
                            ? <span className="text-red-600 font-semibold">Margin depleted</span>
                            : <span className="text-muted-foreground">${vehicle.marginRemaining.toLocaleString()} margin · {daysToLive}d left</span>}
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{vehicle.leads} leads</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs font-medium text-amber-600">${vehicle.dailyBurn}/day holding</span>
                      </div>

                      {/* Root causes */}
                      {rootCauses.length > 0 && (
                        <div className="mt-2 space-y-0.5">
                          {rootCauses.map((cause, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <AlertCircle className="h-3 w-3 text-muted-foreground/50 flex-shrink-0" />
                              <span className="text-[11px] text-muted-foreground">{cause}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Website context */}
                      {webCtx.type && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Globe className="h-3 w-3 text-muted-foreground/50" />
                          <span className="text-[11px] text-muted-foreground">{webCtx.label}</span>
                        </div>
                      )}

                      {/* Projected loss for dead inventory */}
                      {expandedBucket.id === "dead-inventory" && (
                        <div className="mt-2 px-3 py-2 rounded-lg bg-red-50/50 border border-red-100">
                          <p className="text-[11px] font-medium text-red-700">
                            Projected additional holding loss: ${(vehicle.dailyBurn * 10).toLocaleString()} over next 10 days
                          </p>
                          <p className="text-[10px] text-red-600/70 mt-0.5">
                            Wholesale exit or dealer trade recommended to minimize loss.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5 flex-shrink-0 items-end">
                      {expandedBucket.remedies.map(remedy => {
                        const RIcon = remedy.icon
                        return (
                          <Button
                            key={remedy.label}
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 gap-1 w-full justify-start"
                            onClick={() => remedy.action === "accelerate" ? onAccelerate(vehicle.vin) : onUpgradeMedia(vehicle.vin)}
                          >
                            <RIcon className="h-3 w-3" />
                            {remedy.label}
                          </Button>
                        )
                      })}
                      <Link href={`/inventory/${vehicle.vin}`} className="mt-1">
                        <Button size="sm" variant="ghost" className="text-xs h-6 gap-1 text-muted-foreground">
                          View detail <ChevronRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Automation Toggles */}
          <div className="px-5 py-3 border-t bg-gray-50/70">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-3.5 w-3.5 text-muted-foreground/50" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Automation · Coming Soon
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {expandedBucket.automationHints.map((hint, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white border border-gray-200 text-muted-foreground/50"
                >
                  <span className="w-3 h-3 rounded border border-gray-300 flex-shrink-0" />
                  {hint}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground/40 mt-2">
              Unlock Acceleration Pack to enable automated workflows →
            </p>
          </div>

          {expandedBucket.vehicles.length > 10 && (
            <div className="px-5 py-3 border-t text-center">
              <Link href="/spyne-x/risk-opportunity" className="text-xs font-medium text-primary hover:underline">
                View all {expandedBucket.vehicles.length} vehicles →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
