"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  CampaignActivationModal,
  RealMediaUpgradeModal,
} from "@/components/inventory"
import { getMockVehicleDetail, mockCapitalOverview } from "@/lib/inventory-mocks"
import { getScenarioData } from "@/lib/demo-scenarios"
import { useScenario } from "@/lib/scenario-context"
import type { VehicleStage, VehicleSummary, CampaignActivation } from "@/services/inventory/inventory.types"
import { useVehicles } from "@/hooks/use-vehicles"
import {
  AlertTriangle, Clock, EyeOff, Wrench, Skull, Flame, TrendingDown, Eye,
  ChevronRight, Globe, Loader2, Zap, Camera, Phone, Megaphone, Sparkles,
  DollarSign, Lock, AlertCircle,
} from "lucide-react"

interface BucketDef {
  id: string
  title: string
  subtitle: string
  icon: React.ElementType
  vehicles: VehicleSummary[]
  colorScheme: { bg: string; border: string; text: string; iconBg: string }
  remedies: { label: string; icon: React.ElementType; action: "accelerate" | "upgrade" }[]
  automationHints: string[]
}

function computeAllBuckets(vehicles: VehicleSummary[]): { risk: BucketDef[]; opp: BucketDef[] } {
  return {
    risk: [
      {
        id: "near-tmax", title: "Near T-Max Risk", subtitle: "Breaching target time-to-sell", icon: Clock,
        vehicles: vehicles.filter(v => v.marginRemaining > 0 && v.marginRemaining / v.dailyBurn <= 5),
        colorScheme: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", iconBg: "bg-red-100" },
        remedies: [
          { label: "Reduce Price", icon: TrendingDown, action: "accelerate" },
          { label: "Activate Campaign", icon: Zap, action: "accelerate" },
          { label: "Wholesale Exit", icon: Skull, action: "accelerate" },
        ],
        automationHints: ["Auto-reduce price at T-Max", "Auto-activate campaign"],
      },
      {
        id: "no-leads", title: "No Leads After Go-Live", subtitle: "5+ days, zero demand", icon: EyeOff,
        vehicles: vehicles.filter(v => v.daysInStock >= 5 && v.leads === 0 && v.publishStatus === "published"),
        colorScheme: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", iconBg: "bg-orange-100" },
        remedies: [
          { label: "Market Price Compare", icon: DollarSign, action: "accelerate" },
          { label: "Activate Campaign", icon: Megaphone, action: "accelerate" },
          { label: "Upgrade Media", icon: Camera, action: "upgrade" },
        ],
        automationHints: ["Auto-campaign after 5d 0 leads", "Auto-notify BDC"],
      },
      {
        id: "op-delay", title: "Operational Delay", subtitle: "Preparation blockers", icon: Wrench,
        vehicles: vehicles.filter(v => (v.mediaType === "clone" && v.daysInStock >= 20) || v.mediaType === "none" || v.publishStatus !== "published"),
        colorScheme: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", iconBg: "bg-amber-100" },
        remedies: [
          { label: "Assign Photographer", icon: Camera, action: "upgrade" },
          { label: "Push to Publish", icon: Sparkles, action: "accelerate" },
        ],
        automationHints: ["Auto-schedule photographer", "Auto-push publish"],
      },
      {
        id: "dead-inventory", title: "Dead Inventory", subtitle: "Margin eroded beyond recovery", icon: Skull,
        vehicles: vehicles.filter(v => v.marginRemaining <= 0),
        colorScheme: { bg: "bg-red-50/70", border: "border-red-300", text: "text-red-800", iconBg: "bg-red-200" },
        remedies: [
          { label: "Wholesale Exit", icon: Skull, action: "accelerate" },
          { label: "Dealer Trade", icon: Sparkles, action: "accelerate" },
        ],
        automationHints: ["Auto-flag wholesale at $0 margin"],
      },
    ],
    opp: [
      {
        id: "hot-vehicles", title: "Hot Vehicles", subtitle: "High demand signals", icon: Flame,
        vehicles: vehicles.filter(v => v.leads >= 10 || v.vdpViews >= 2000),
        colorScheme: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", iconBg: "bg-emerald-100" },
        remedies: [
          { label: "Hot Pack", icon: Zap, action: "accelerate" },
          { label: "Notify BDC", icon: Phone, action: "accelerate" },
          { label: "Urgency Banner", icon: Flame, action: "accelerate" },
        ],
        automationHints: ["Auto-Hot Pack on spike", "Auto-update Vini"],
      },
      {
        id: "price-drop", title: "Price Drop Trigger", subtitle: "Re-engage prospects", icon: TrendingDown,
        vehicles: vehicles.filter(v => v.priceReduced),
        colorScheme: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", iconBg: "bg-blue-100" },
        remedies: [
          { label: "Outbound Prospects", icon: Phone, action: "accelerate" },
          { label: "Activate Campaign", icon: Megaphone, action: "accelerate" },
        ],
        automationHints: ["Auto-outbound on price drop"],
      },
      {
        id: "high-traffic", title: "High Traffic, Low Conversion", subtitle: "Conversion problem", icon: Eye,
        vehicles: vehicles.filter(v => v.vdpViews >= 800 && v.leads < 3),
        colorScheme: { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700", iconBg: "bg-cyan-100" },
        remedies: [
          { label: "Upgrade Media", icon: Camera, action: "upgrade" },
          { label: "Price Optimization", icon: TrendingDown, action: "accelerate" },
          { label: "Campaign Boost", icon: Zap, action: "accelerate" },
        ],
        automationHints: ["Auto-flag conversion issues"],
      },
    ],
  }
}

function BucketSection({ bucket, onAccelerate, onUpgradeMedia }: {
  bucket: BucketDef
  onAccelerate: (vin: string) => void
  onUpgradeMedia: (vin: string) => void
}) {
  if (bucket.vehicles.length === 0) return null
  const Icon = bucket.icon
  const marginExp = bucket.vehicles.reduce((s, v) => s + Math.max(0, v.marginRemaining), 0)
  const marginLoss = bucket.vehicles.reduce((s, v) => s + Math.min(0, v.marginRemaining), 0)

  return (
    <div className={cn("rounded-xl border overflow-hidden", bucket.colorScheme.border)}>
      <div className={cn("px-5 py-3.5 flex items-center justify-between", bucket.colorScheme.bg)}>
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", bucket.colorScheme.iconBg)}>
            <Icon className={cn("h-4 w-4", bucket.colorScheme.text)} />
          </div>
          <div>
            <h3 className={cn("text-sm font-bold", bucket.colorScheme.text)}>{bucket.title}</h3>
            <p className="text-xs text-muted-foreground">{bucket.subtitle}</p>
          </div>
        </div>
        <div className="text-right">
          <span className={cn("text-2xl font-extrabold tabular-nums", bucket.colorScheme.text)}>{bucket.vehicles.length}</span>
          {(marginExp > 0 || marginLoss < 0) && (
            <p className="text-[10px] text-muted-foreground">
              {marginLoss < 0 ? `-$${Math.abs(marginLoss).toLocaleString()} lost` : `$${marginExp.toLocaleString()} at risk`}
            </p>
          )}
        </div>
      </div>
      <div className="divide-y">
        {bucket.vehicles.map(v => {
          const dtl = v.marginRemaining > 0 ? Math.ceil(v.marginRemaining / v.dailyBurn) : 0
          const web = v.vdpViews >= 800 && v.leads < 3 ? "conversion" : v.vdpViews < 400 && v.daysInStock >= 5 ? "visibility" : v.mediaType === "none" ? "trust" : null
          const causes: string[] = []
          if (v.campaignStatus === "none") causes.push("No campaign")
          if (v.mediaType === "clone" && v.daysInStock >= 14) causes.push(`AI Instant ${v.daysInStock}d`)
          if (v.leads === 0 && v.daysInStock >= 5) causes.push("Zero leads")
          if (v.vdpViews >= 800 && v.leads < 3) causes.push("Weak conversion")
          return (
            <div key={v.vin} className="px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Link href={`/inventory/${v.vin}`} className="text-sm font-semibold hover:text-primary transition-colors">
                    {v.year} {v.make} {v.model} <span className="font-normal text-muted-foreground">{v.trim}</span>
                  </Link>
                  <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-muted-foreground">
                    <span>{v.daysInStock}d in stock</span><span>·</span>
                    {v.marginRemaining <= 0 ? <span className="text-red-600 font-semibold">Margin depleted</span> : <span>${v.marginRemaining.toLocaleString()} margin · {dtl}d left</span>}
                    <span>·</span><span>{v.leads} leads</span><span>·</span>
                    <span className="font-medium text-amber-600">${v.dailyBurn}/day</span>
                  </div>
                  {causes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {causes.map((c, i) => (
                        <span key={i} className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                          <AlertCircle className="h-2.5 w-2.5" />{c}
                        </span>
                      ))}
                    </div>
                  )}
                  {web && (
                    <div className="flex items-center gap-1 mt-1">
                      <Globe className="h-3 w-3 text-muted-foreground/50" />
                      <span className="text-[11px] text-muted-foreground">
                        {web === "conversion" ? `${v.vdpViews.toLocaleString()} views, ${v.leads} leads — conversion issue`
                         : web === "visibility" ? `${v.vdpViews} views — visibility issue`
                         : "Stock photos — trust issue"}
                      </span>
                    </div>
                  )}
                  {bucket.id === "dead-inventory" && (
                    <div className="mt-2 px-3 py-2 rounded-lg bg-red-50/50 border border-red-100">
                      <p className="text-[11px] font-medium text-red-700">Projected 10-day loss: ${(v.dailyBurn * 10).toLocaleString()}</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0 items-end">
                  {bucket.remedies.map(r => {
                    const RI = r.icon
                    return (
                      <Button key={r.label} size="sm" variant="outline" className="text-xs h-7 gap-1 w-full justify-start"
                        onClick={() => r.action === "accelerate" ? onAccelerate(v.vin) : onUpgradeMedia(v.vin)}>
                        <RI className="h-3 w-3" />{r.label}
                      </Button>
                    )
                  })}
                  <Link href={`/inventory/${v.vin}`}><Button size="sm" variant="ghost" className="text-xs h-6 gap-1 text-muted-foreground">Detail <ChevronRight className="h-3 w-3" /></Button></Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="px-5 py-3 border-t bg-gray-50/70">
        <div className="flex items-center gap-2">
          <Lock className="h-3 w-3 text-muted-foreground/50" />
          <span className="text-[10px] text-muted-foreground/50 font-medium">
            Automation: {bucket.automationHints.join(" · ")} — Unlock with Acceleration Pack
          </span>
        </div>
      </div>
    </div>
  )
}

export default function RiskOpportunityPage() {
  const { activeScenario, scenarioConfig } = useScenario()
  const scenarioData = React.useMemo(() => getScenarioData(activeScenario), [activeScenario])
  const { vehicles: apiVehicles, loading: apiLoading } = useVehicles({ page: 1, perPage: 50, query: "*" })
  const vehicles = (activeScenario === "default" && apiVehicles.length > 0) ? apiVehicles : scenarioData.vehicles

  const { risk, opp } = React.useMemo(() => computeAllBuckets(vehicles), [vehicles])

  const [campaignModal, setCampaignModal] = React.useState<{ open: boolean; data: CampaignActivation | null; vehicleName?: string; stage?: VehicleStage; daysInStock?: number; dailyBurn?: number }>({ open: false, data: null })
  const [mediaUpgrade, setMediaUpgrade] = React.useState<{ open: boolean; vin: string | null }>({ open: false, vin: null })

  const handleAccelerate = (vin: string) => {
    const v = vehicles.find(x => x.vin === vin)
    if (!v) return
    setCampaignModal({
      open: true, data: { vin, marginRemaining: v.marginRemaining, estimatedLeadLift: Math.round(Math.random() * 8 + 4), estimatedLeadLiftPercent: Math.round(Math.random() * 30 + 20), estimatedMarginProtection: Math.round(Math.max(0, v.marginRemaining) * 0.6), estimatedDaysSaved: Math.round(Math.random() * 6 + 3) },
      vehicleName: `${v.year} ${v.make} ${v.model}`, stage: v.stage, daysInStock: v.daysInStock, dailyBurn: v.dailyBurn,
    })
  }
  const handleUpgrade = (vin: string) => setMediaUpgrade({ open: true, vin })
  const mediaVehicle = mediaUpgrade.vin ? getMockVehicleDetail(mediaUpgrade.vin) : null

  if (activeScenario === "default" && apiLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  const totalRisk = risk.reduce((s, b) => s + b.vehicles.length, 0)
  const totalRiskExposure = risk.reduce((s, b) => s + b.vehicles.reduce((ss, v) => ss + Math.max(0, v.marginRemaining), 0), 0)

  return (
    <div className="space-y-0">
      <div className="border-b bg-white -mx-6 -mt-6 px-6 py-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-red-600 to-orange-600 text-white"><AlertTriangle className="h-5 w-5" /></div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Risk & Opportunity</h1>
            <p className="text-sm text-muted-foreground">${totalRiskExposure.toLocaleString()} margin at risk · {totalRisk} flagged vehicles</p>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Risk Signals</h2>
        {risk.map(b => <BucketSection key={b.id} bucket={b} onAccelerate={handleAccelerate} onUpgradeMedia={handleUpgrade} />)}
      </div>
      <div className="space-y-4 mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Opportunity Signals</h2>
        {opp.map(b => <BucketSection key={b.id} bucket={b} onAccelerate={handleAccelerate} onUpgradeMedia={handleUpgrade} />)}
      </div>
      <CampaignActivationModal open={campaignModal.open} onOpenChange={open => setCampaignModal(s => ({ ...s, open }))} data={campaignModal.data} vehicleName={campaignModal.vehicleName} stage={campaignModal.stage} daysInStock={campaignModal.daysInStock} dailyBurn={campaignModal.dailyBurn} upsellMode={null} />
      <RealMediaUpgradeModal open={mediaUpgrade.open} onOpenChange={open => setMediaUpgrade(s => ({ ...s, open }))} vehicle={mediaVehicle} />
    </div>
  )
}
