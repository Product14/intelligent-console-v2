"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getScenarioData } from "@/lib/demo-scenarios"
import { useScenario } from "@/lib/scenario-context"
import { useVehicles } from "@/hooks/use-vehicles"
import { CampaignActivationModal } from "@/components/inventory"
import type { VehicleStage, CampaignActivation } from "@/services/inventory/inventory.types"
import { Rocket, Loader2, Zap, Megaphone, ChevronRight, Clock, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AccelerationPage() {
  const { activeScenario } = useScenario()
  const scenarioData = React.useMemo(() => getScenarioData(activeScenario), [activeScenario])
  const { vehicles: apiVehicles, loading } = useVehicles({ page: 1, perPage: 50, query: "*" })
  const vehicles = (activeScenario === "default" && apiVehicles.length > 0) ? apiVehicles : scenarioData.vehicles

  const [campaignModal, setCampaignModal] = React.useState<{ open: boolean; data: CampaignActivation | null; vehicleName?: string; stage?: VehicleStage; daysInStock?: number; dailyBurn?: number }>({ open: false, data: null })

  const handleAccelerate = (vin: string) => {
    const v = vehicles.find(x => x.vin === vin)
    if (!v) return
    setCampaignModal({ open: true, data: { vin, marginRemaining: v.marginRemaining, estimatedLeadLift: Math.round(Math.random() * 8 + 4), estimatedLeadLiftPercent: Math.round(Math.random() * 30 + 20), estimatedMarginProtection: Math.round(Math.max(0, v.marginRemaining) * 0.6), estimatedDaysSaved: Math.round(Math.random() * 6 + 3) }, vehicleName: `${v.year} ${v.make} ${v.model}`, stage: v.stage, daysInStock: v.daysInStock, dailyBurn: v.dailyBurn })
  }

  if (activeScenario === "default" && loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  const noCampaign = vehicles.filter(v => v.campaignStatus === "none" && (v.stage === "risk" || v.stage === "critical" || v.stage === "watch"))
  const activeCampaigns = vehicles.filter(v => v.campaignStatus === "active")
  const potentialSaved = noCampaign.reduce((s, v) => s + Math.round(v.dailyBurn * 5), 0)

  return (
    <div className="space-y-0">
      <div className="border-b bg-white -mx-6 -mt-6 px-6 py-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white"><Rocket className="h-5 w-5" /></div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Acceleration Center</h1>
            <p className="text-sm text-muted-foreground">{activeCampaigns.length} active campaigns · {noCampaign.length} vehicles eligible for acceleration</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-2 mb-2"><Megaphone className="h-4 w-4 text-blue-500" /><p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Active Campaigns</p></div>
          <span className="text-3xl font-extrabold tabular-nums text-blue-600">{activeCampaigns.length}</span>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-2 mb-2"><Clock className="h-4 w-4 text-amber-500" /><p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Eligible for Accel.</p></div>
          <span className="text-3xl font-extrabold tabular-nums text-amber-600">{noCampaign.length}</span>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-2 mb-2"><TrendingDown className="h-4 w-4 text-red-500" /><p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Potential 5-Day Save</p></div>
          <span className="text-3xl font-extrabold tabular-nums text-emerald-600">${potentialSaved.toLocaleString()}</span>
        </div>
      </div>

      {/* Vehicles needing acceleration */}
      {noCampaign.length > 0 && (
        <div className="rounded-xl border bg-white overflow-hidden">
          <div className="px-5 py-3 border-b bg-gray-50/50">
            <h3 className="text-sm font-bold">Vehicles Without Campaigns</h3>
            <p className="text-xs text-muted-foreground">Sorted by urgency — highest daily burn first</p>
          </div>
          <div className="divide-y">
            {noCampaign.sort((a, b) => b.dailyBurn - a.dailyBurn).slice(0, 10).map(v => (
              <div key={v.vin} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <Link href={`/inventory/${v.vin}`} className="text-sm font-medium hover:text-primary transition-colors">
                    {v.year} {v.make} {v.model}
                  </Link>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                    <span>{v.daysInStock}d</span><span>·</span>
                    <span>${v.dailyBurn}/day burn</span><span>·</span>
                    <span>{v.leads} leads</span><span>·</span>
                    <span className={cn(v.stage === "critical" ? "text-red-600 font-medium" : v.stage === "risk" ? "text-orange-600 font-medium" : "")}>{v.stage}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" className="text-xs h-7 gap-1" onClick={() => handleAccelerate(v.vin)}>
                    <Zap className="h-3 w-3" /> Accelerate
                  </Button>
                  <Link href={`/inventory/${v.vin}`}><Button size="sm" variant="ghost" className="h-7 w-7 p-0"><ChevronRight className="h-3.5 w-3.5" /></Button></Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <CampaignActivationModal open={campaignModal.open} onOpenChange={o => setCampaignModal(s => ({ ...s, open: o }))} data={campaignModal.data} vehicleName={campaignModal.vehicleName} stage={campaignModal.stage} daysInStock={campaignModal.daysInStock} dailyBurn={campaignModal.dailyBurn} upsellMode={null} />
    </div>
  )
}
