"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getScenarioData } from "@/lib/demo-scenarios"
import { useScenario } from "@/lib/scenario-context"
import { useVehicles } from "@/hooks/use-vehicles"
import { getMockVehicleDetail } from "@/lib/inventory-mocks"
import { RealMediaUpgradeModal, CampaignActivationModal } from "@/components/inventory"
import { WebsiteContext } from "@/components/spyne-x"
import type { VehicleSummary, VehicleStage, CampaignActivation } from "@/services/inventory/inventory.types"
import { Globe, AlertTriangle, Eye, EyeOff, Camera, Loader2, ChevronRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function WebsitePage() {
  const { activeScenario } = useScenario()
  const scenarioData = React.useMemo(() => getScenarioData(activeScenario), [activeScenario])
  const { vehicles: apiVehicles, loading } = useVehicles({ page: 1, perPage: 50, query: "*" })
  const vehicles = (activeScenario === "default" && apiVehicles.length > 0) ? apiVehicles : scenarioData.vehicles

  const [mediaUpgrade, setMediaUpgrade] = React.useState<{ open: boolean; vin: string | null }>({ open: false, vin: null })
  const [campaignModal, setCampaignModal] = React.useState<{ open: boolean; data: CampaignActivation | null; vehicleName?: string; stage?: VehicleStage; daysInStock?: number; dailyBurn?: number }>({ open: false, data: null })

  const handleUpgrade = (vin: string) => setMediaUpgrade({ open: true, vin })
  const handleAccelerate = (vin: string) => {
    const v = vehicles.find(x => x.vin === vin)
    if (!v) return
    setCampaignModal({ open: true, data: { vin, marginRemaining: v.marginRemaining, estimatedLeadLift: Math.round(Math.random() * 8 + 4), estimatedLeadLiftPercent: Math.round(Math.random() * 30 + 20), estimatedMarginProtection: Math.round(Math.max(0, v.marginRemaining) * 0.6), estimatedDaysSaved: Math.round(Math.random() * 6 + 3) }, vehicleName: `${v.year} ${v.make} ${v.model}`, stage: v.stage, daysInStock: v.daysInStock, dailyBurn: v.dailyBurn })
  }
  const mediaVehicle = mediaUpgrade.vin ? getMockVehicleDetail(mediaUpgrade.vin) : null

  if (activeScenario === "default" && loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  const conversionIssues = vehicles.filter(v => v.vdpViews >= 800 && v.leads < 3)
  const visibilityIssues = vehicles.filter(v => v.vdpViews < 400 && v.daysInStock >= 5 && v.publishStatus === "published")
  const trustIssues = vehicles.filter(v => v.mediaType === "none" && v.publishStatus === "published")
  const totalAffected = new Set([...conversionIssues, ...visibilityIssues, ...trustIssues].map(v => v.vin)).size

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
          <p className="text-sm font-semibold">Website metrics are contextual, not isolated</p>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Website performance is not tracked in isolation. Each metric connects directly to a risk or opportunity bucket.
          High views with low leads indicates a conversion issue. Low views with no leads indicates a visibility issue.
          Stock photos indicate a trust issue. Each is tied to a specific vehicle with actionable remedies.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className={cn("rounded-xl border p-4", conversionIssues.length > 0 ? "bg-blue-50 border-blue-200" : "bg-white")}>
          <div className="flex items-center gap-2 mb-1">
            <Eye className="h-4 w-4 text-blue-600" />
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Conversion</p>
          </div>
          <span className="text-2xl font-bold tabular-nums text-blue-700">{conversionIssues.length}</span>
          <p className="text-[11px] text-muted-foreground mt-0.5">High views, low leads</p>
        </div>
        <div className={cn("rounded-xl border p-4", visibilityIssues.length > 0 ? "bg-amber-50 border-amber-200" : "bg-white")}>
          <div className="flex items-center gap-2 mb-1">
            <EyeOff className="h-4 w-4 text-amber-600" />
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Visibility</p>
          </div>
          <span className="text-2xl font-bold tabular-nums text-amber-700">{visibilityIssues.length}</span>
          <p className="text-[11px] text-muted-foreground mt-0.5">Not getting seen</p>
        </div>
        <div className={cn("rounded-xl border p-4", trustIssues.length > 0 ? "bg-red-50 border-red-200" : "bg-white")}>
          <div className="flex items-center gap-2 mb-1">
            <Camera className="h-4 w-4 text-red-600" />
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Trust</p>
          </div>
          <span className="text-2xl font-bold tabular-nums text-red-700">{trustIssues.length}</span>
          <p className="text-[11px] text-muted-foreground mt-0.5">Stock photos only</p>
        </div>
      </div>

      <WebsiteContext vehicles={vehicles} onUpgradeMedia={handleUpgrade} onAccelerate={handleAccelerate} />

      <RealMediaUpgradeModal open={mediaUpgrade.open} onOpenChange={o => setMediaUpgrade(s => ({ ...s, open: o }))} vehicle={mediaVehicle} />
      <CampaignActivationModal open={campaignModal.open} onOpenChange={o => setCampaignModal(s => ({ ...s, open: o }))} data={campaignModal.data} vehicleName={campaignModal.vehicleName} stage={campaignModal.stage} daysInStock={campaignModal.daysInStock} dailyBurn={campaignModal.dailyBurn} upsellMode={null} />
    </div>
  )
}
