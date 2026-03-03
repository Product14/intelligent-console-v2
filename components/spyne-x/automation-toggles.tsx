"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Lock, Zap, Phone, Camera, Megaphone, AlertTriangle, TrendingDown } from "lucide-react"

interface AutomationRule {
  id: string
  label: string
  description: string
  icon: React.ElementType
  category: "risk" | "opportunity"
}

const AUTOMATION_RULES: AutomationRule[] = [
  {
    id: "auto-campaign-tmax",
    label: "Auto-activate campaign at T-Max threshold",
    description: "When a vehicle enters Near T-Max, automatically activate an acceleration campaign.",
    icon: Zap,
    category: "risk",
  },
  {
    id: "auto-campaign-no-leads",
    label: "Auto-activate campaign after 5d with 0 leads",
    description: "If no leads after 5 days on lot, system activates a campaign to drive visibility.",
    icon: Megaphone,
    category: "risk",
  },
  {
    id: "auto-bdc-notify",
    label: "Auto-notify BDC on hot vehicle detection",
    description: "When a vehicle shows lead spike or VDP spike, instantly alert the BDC team.",
    icon: Phone,
    category: "opportunity",
  },
  {
    id: "auto-hot-pack",
    label: "Auto-enable Hot Pack on lead spike",
    description: "Run Hot Pack campaign automatically when a vehicle exceeds 10 leads.",
    icon: Zap,
    category: "opportunity",
  },
  {
    id: "auto-outbound-price-drop",
    label: "Auto-outbound on price reduction",
    description: "Trigger outbound campaign to price-sensitive leads when price is reduced.",
    icon: TrendingDown,
    category: "opportunity",
  },
  {
    id: "auto-photographer",
    label: "Auto-schedule photographer after VIN add",
    description: "On new VIN addition, automatically schedule real media capture.",
    icon: Camera,
    category: "risk",
  },
  {
    id: "auto-wholesale-flag",
    label: "Auto-flag wholesale when margin depleted",
    description: "Automatically flag vehicles for wholesale exit when margin hits $0.",
    icon: AlertTriangle,
    category: "risk",
  },
  {
    id: "auto-vini-update",
    label: "Auto-update Vini script on price change",
    description: "When vehicle price changes, automatically update Vini call scripts.",
    icon: Phone,
    category: "opportunity",
  },
]

export function AutomationToggles() {
  const riskRules = AUTOMATION_RULES.filter(r => r.category === "risk")
  const oppRules = AUTOMATION_RULES.filter(r => r.category === "opportunity")

  const renderRule = (rule: AutomationRule) => {
    const Icon = rule.icon
    return (
      <div key={rule.id} className="flex items-start gap-3 p-3 rounded-lg border bg-gray-50/30 opacity-60">
        <div className="p-1.5 rounded-lg bg-white border mt-0.5">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{rule.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{rule.description}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 mt-1">
          <div className="w-9 h-5 rounded-full bg-gray-200 relative">
            <div className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/5">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight">Automation Rules</h2>
            <p className="text-sm text-muted-foreground">Configure automated workflows for risk and opportunity signals.</p>
          </div>
        </div>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mb-6">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold text-primary">Automation available with Acceleration Pack</p>
          </div>
          <p className="text-xs text-primary/70 mt-1">
            Enable automated campaign activation, BDC notifications, media scheduling, and wholesale flagging.
            Contact your Spyne representative to unlock.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Risk Automation</h3>
            <div className="space-y-2">{riskRules.map(renderRule)}</div>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Opportunity Automation</h3>
            <div className="space-y-2">{oppRules.map(renderRule)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
