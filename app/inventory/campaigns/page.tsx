"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { StageBadge, CampaignBadge, AIPageSummary } from "@/components/inventory"
import {
  Megaphone,
  Settings2,
  Zap,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Pause,
  Play,
  BarChart3,
  Globe,
  Phone,
  Bot,
  Rocket,
  Search,
  MoreHorizontal,
  Calendar,
  Eye,
} from "lucide-react"
import Link from "next/link"
import { useScenario } from "@/lib/scenario-context"
import { getScenarioData, type ScenarioId } from "@/lib/demo-scenarios"
import type { VehicleSummary, VehicleStage, CampaignStatus } from "@/services/inventory/inventory.types"

type CampaignEntry = {
  id: string
  vehicleName: string
  vin: string
  stage: VehicleStage
  type: "digital" | "voice-ai" | "both"
  tier: string
  status: "active" | "paused" | "completed" | "scheduled"
  startDate: string
  duration: string
  spend: number
  budget: number
  leads: number
  appointments: number
  marginProtected: number
  roi: number
}

function generateCampaigns(vehicles: VehicleSummary[], scenario: ScenarioId): CampaignEntry[] {
  const activeVehicles = vehicles.filter((v) => v.campaignStatus === "active")
  const completedVehicles = vehicles
    .filter((v) => v.campaignStatus === "completed" || v.campaignStatus === "scheduled")
    .slice(0, 3)

  const isImagesOnly = scenario === "images-only"
  const isStudioOnly = scenario === "studio-only"

  if (isImagesOnly || isStudioOnly) {
    return []
  }

  const today = new Date()
  const campaigns: CampaignEntry[] = []

  activeVehicles.forEach((v, i) => {
    const daysAgo = Math.floor(Math.random() * 14) + 3
    const start = new Date(today)
    start.setDate(start.getDate() - daysAgo)
    const types: CampaignEntry["type"][] = ["digital", "voice-ai", "both"]
    const tiers = ["Standard Boost", "Acceleration Pack", "Maximum Velocity", "Full Optimization"]
    const spend = Math.round(80 + Math.random() * 320)
    const budget = Math.round(spend * (1.4 + Math.random() * 0.8))
    const leads = Math.max(2, Math.round(v.leads * 0.6 + Math.random() * 8))
    const appts = Math.round(leads * 0.3 + Math.random() * 2)

    campaigns.push({
      id: `camp-${v.vin.slice(-6)}-${i}`,
      vehicleName: `${v.year} ${v.make} ${v.model}`,
      vin: v.vin,
      stage: v.stage,
      type: types[i % 3],
      tier: tiers[i % tiers.length],
      status: "active",
      startDate: start.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      duration: `${daysAgo}d / 21d`,
      spend,
      budget,
      leads,
      appointments: appts,
      marginProtected: Math.round(leads * 120 + appts * 280),
      roi: Math.round((leads * 120 + appts * 280) / spend * 100),
    })
  })

  completedVehicles.forEach((v, i) => {
    const daysAgo = Math.floor(Math.random() * 20) + 14
    const start = new Date(today)
    start.setDate(start.getDate() - daysAgo)
    const spend = Math.round(200 + Math.random() * 400)
    const leads = Math.round(8 + Math.random() * 12)
    const appts = Math.round(leads * 0.35)
    const status = v.campaignStatus === "scheduled" ? "scheduled" : "completed"

    campaigns.push({
      id: `camp-hist-${v.vin.slice(-6)}-${i}`,
      vehicleName: `${v.year} ${v.make} ${v.model}`,
      vin: v.vin,
      stage: v.stage,
      type: i % 2 === 0 ? "digital" : "both",
      tier: i % 2 === 0 ? "Standard Boost" : "Acceleration Pack",
      status: status as CampaignEntry["status"],
      startDate: start.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      duration: status === "scheduled" ? "Starts in 2d" : "21d",
      spend: status === "scheduled" ? 0 : spend,
      budget: Math.round(spend * 1.2) || 299,
      leads: status === "scheduled" ? 0 : leads,
      appointments: status === "scheduled" ? 0 : appts,
      marginProtected: status === "scheduled" ? 0 : Math.round(leads * 120 + appts * 280),
      roi: status === "scheduled" ? 0 : Math.round((leads * 120 + appts * 280) / spend * 100),
    })
  })

  return campaigns
}

const typeIcons: Record<CampaignEntry["type"], React.ReactNode> = {
  digital: <Rocket className="h-3.5 w-3.5" />,
  "voice-ai": <Phone className="h-3.5 w-3.5" />,
  both: <Zap className="h-3.5 w-3.5" />,
}

const typeLabels: Record<CampaignEntry["type"], string> = {
  digital: "Digital Ads",
  "voice-ai": "Vini AI",
  both: "Ads + Vini",
}

const statusConfig: Record<CampaignEntry["status"], { label: string; className: string; icon: React.ReactNode }> = {
  active: {
    label: "Active",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <Play className="h-3 w-3" />,
  },
  paused: {
    label: "Paused",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <Pause className="h-3 w-3" />,
  },
  completed: {
    label: "Completed",
    className: "bg-gray-50 text-gray-600 border-gray-200",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  scheduled: {
    label: "Scheduled",
    className: "bg-violet-50 text-violet-700 border-violet-200",
    icon: <Clock className="h-3 w-3" />,
  },
}

export default function CampaignsPage() {
  const { activeScenario, scenarioConfig } = useScenario()

  const vehicles = React.useMemo(
    () => getScenarioData(activeScenario).vehicles,
    [activeScenario]
  )

  const campaigns = React.useMemo(
    () => generateCampaigns(vehicles, activeScenario),
    [vehicles, activeScenario]
  )

  const isUpsellScenario =
    scenarioConfig.nudgeType === "upsell-cloning-campaign" ||
    scenarioConfig.nudgeType === "upsell-vini-call"

  const activeCampaigns = campaigns.filter((c) => c.status === "active")
  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0)
  const totalLeads = campaigns.reduce((s, c) => s + c.leads, 0)
  const totalMargin = campaigns.reduce((s, c) => s + c.marginProtected, 0)
  const avgRoi = activeCampaigns.length > 0
    ? Math.round(activeCampaigns.reduce((s, c) => s + c.roi, 0) / activeCampaigns.length)
    : 0

  const [settingsTab, setSettingsTab] = React.useState<"channels" | "budget" | "targeting">("channels")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Campaigns</h1>
            <p className="text-sm text-muted-foreground">
              Campaign settings, active campaigns, and performance history
            </p>
          </div>
        </div>
      </div>

      <AIPageSummary
        summary={
          isUpsellScenario
            ? scenarioConfig.nudgeType === "upsell-cloning-campaign"
              ? "You're on the Images Only plan — campaigns are not yet activated. Upgrade to Media Cloning + Campaigns to start driving targeted leads to your inventory and protecting margin."
              : "You have great studio media but no campaigns running. Add Vini AI Calls to your campaign toolkit to automatically follow up with leads and book 42% more appointments."
            : `${activeCampaigns.length} active campaigns generating ${totalLeads} leads and protecting $${totalMargin.toLocaleString()} in margin. Average campaign ROI is ${avgRoi}% — consider activating campaigns on ${vehicles.filter((v) => v.campaignStatus === "none" && v.stage !== "fresh").length} more at-risk vehicles.`
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Active Campaigns",
            value: activeCampaigns.length.toString(),
            delta: isUpsellScenario ? "Upgrade to activate" : `${campaigns.length} total`,
            icon: <Megaphone className="h-4 w-4 text-blue-500" />,
            bg: "bg-blue-50",
            dimmed: isUpsellScenario,
          },
          {
            label: "Total Leads",
            value: isUpsellScenario ? "—" : totalLeads.toString(),
            delta: isUpsellScenario ? "No campaigns yet" : "from campaigns",
            icon: <Users className="h-4 w-4 text-violet-500" />,
            bg: "bg-violet-50",
            dimmed: isUpsellScenario,
          },
          {
            label: "Margin Protected",
            value: isUpsellScenario ? "—" : `$${totalMargin.toLocaleString()}`,
            delta: isUpsellScenario ? "Upgrade to protect" : "this month",
            icon: <DollarSign className="h-4 w-4 text-emerald-500" />,
            bg: "bg-emerald-50",
            dimmed: isUpsellScenario,
          },
          {
            label: "Avg Campaign ROI",
            value: isUpsellScenario ? "—" : `${avgRoi}%`,
            delta: isUpsellScenario ? "Potential: 340%+" : "avg return",
            icon: <TrendingUp className="h-4 w-4 text-amber-500" />,
            bg: "bg-amber-50",
            dimmed: isUpsellScenario,
          },
        ].map((kpi) => (
          <Card key={kpi.label} className={kpi.dimmed ? "opacity-60" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  {kpi.label}
                </span>
                <div className={cn("p-1.5 rounded-lg", kpi.bg)}>{kpi.icon}</div>
              </div>
              <p className="text-2xl font-bold">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{kpi.delta}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-6">
        {/* Left: Recent Campaigns */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                Recent Campaigns
              </CardTitle>
              {!isUpsellScenario && campaigns.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isUpsellScenario ? (
              <div className="py-16 text-center px-8">
                <div className={cn(
                  "mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4",
                  scenarioConfig.nudgeType === "upsell-cloning-campaign"
                    ? "bg-indigo-50"
                    : "bg-emerald-50"
                )}>
                  {scenarioConfig.nudgeType === "upsell-cloning-campaign" ? (
                    <Megaphone className="h-7 w-7 text-indigo-400" />
                  ) : (
                    <Phone className="h-7 w-7 text-emerald-400" />
                  )}
                </div>
                <h3 className="text-lg font-bold mb-1">
                  {scenarioConfig.nudgeType === "upsell-cloning-campaign"
                    ? "No Campaigns Yet"
                    : "Add Vini AI Calls"
                  }
                </h3>
                <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
                  {scenarioConfig.nudgeType === "upsell-cloning-campaign"
                    ? "Upgrade to Media Cloning + Campaigns to start running targeted ads that drive qualified leads and protect your margin."
                    : "Your campaigns are digital-only. Add Vini AI voice outreach to automatically follow up with leads and book appointments."
                  }
                </p>
                <div className="flex items-center justify-center gap-3 mb-5">
                  {(scenarioConfig.nudgeType === "upsell-cloning-campaign"
                    ? [
                        { icon: <Rocket className="h-4 w-4" />, label: "Targeted Ads", stat: "28% faster turns" },
                        { icon: <Users className="h-4 w-4" />, label: "Lead Generation", stat: "3× more leads" },
                        { icon: <DollarSign className="h-4 w-4" />, label: "Margin Protection", stat: "22% saved" },
                      ]
                    : [
                        { icon: <Phone className="h-4 w-4" />, label: "AI Voice Calls", stat: "42% more appts" },
                        { icon: <Bot className="h-4 w-4" />, label: "Auto Follow-up", stat: "2.4× visit rate" },
                        { icon: <DollarSign className="h-4 w-4" />, label: "Better ROI", stat: "56% less CPA" },
                      ]
                  ).map((f) => (
                    <div
                      key={f.label}
                      className={cn(
                        "p-3 rounded-xl border text-center min-w-[100px]",
                        scenarioConfig.nudgeType === "upsell-cloning-campaign"
                          ? "bg-indigo-50/50 border-indigo-100"
                          : "bg-emerald-50/50 border-emerald-100"
                      )}
                    >
                      <span className={cn(
                        "block mx-auto w-fit mb-1",
                        scenarioConfig.nudgeType === "upsell-cloning-campaign" ? "text-indigo-500" : "text-emerald-500"
                      )}>
                        {f.icon}
                      </span>
                      <p className="text-[10px] font-bold text-foreground">{f.label}</p>
                      <p className={cn(
                        "text-[10px]",
                        scenarioConfig.nudgeType === "upsell-cloning-campaign" ? "text-indigo-500" : "text-emerald-500"
                      )}>
                        {f.stat}
                      </p>
                    </div>
                  ))}
                </div>
                <Button
                  className={cn(
                    "h-10 px-6 text-sm font-semibold text-white",
                    scenarioConfig.nudgeType === "upsell-cloning-campaign"
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
                      : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  )}
                >
                  {scenarioConfig.nudgeType === "upsell-cloning-campaign"
                    ? "Upgrade to Campaigns"
                    : "Add Vini AI Calls"
                  }
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="py-16 text-center">
                <Megaphone className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No campaigns yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Activate a campaign from any vehicle to get started
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-y bg-gray-50/80">
                      <th className="py-2.5 px-4 text-left">
                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                          Vehicle
                        </span>
                      </th>
                      <th className="py-2.5 px-3 text-left">
                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                          Type
                        </span>
                      </th>
                      <th className="py-2.5 px-3 text-left">
                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                          Status
                        </span>
                      </th>
                      <th className="py-2.5 px-3 text-right">
                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                          Spend
                        </span>
                      </th>
                      <th className="py-2.5 px-3 text-right">
                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                          Leads
                        </span>
                      </th>
                      <th className="py-2.5 px-3 text-right">
                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                          Appts
                        </span>
                      </th>
                      <th className="py-2.5 px-3 text-right">
                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                          ROI
                        </span>
                      </th>
                      <th className="py-2.5 px-3 text-right">
                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                          Action
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {campaigns.map((c) => {
                      const sc = statusConfig[c.status]
                      return (
                        <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-2.5 px-4">
                            <Link href={`/inventory/${c.vin}`} className="group flex items-center gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                  {c.vehicleName}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <StageBadge stage={c.stage} size="sm" />
                                  <span className="text-[10px] text-muted-foreground">
                                    {c.tier} · {c.startDate}
                                  </span>
                                </div>
                              </div>
                            </Link>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                              c.type === "both"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : c.type === "voice-ai"
                                  ? "bg-violet-50 text-violet-700 border-violet-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                            )}>
                              {typeIcons[c.type]}
                              {typeLabels[c.type]}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                              sc.className
                            )}>
                              {sc.icon}
                              {sc.label}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div>
                              <span className="text-sm font-medium tabular-nums">
                                ${c.spend.toLocaleString()}
                              </span>
                              <p className="text-[10px] text-muted-foreground">
                                of ${c.budget.toLocaleString()}
                              </p>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="text-sm font-semibold tabular-nums">{c.leads}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="text-sm tabular-nums">{c.appointments}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className={cn(
                              "text-sm font-bold tabular-nums",
                              c.roi >= 300 ? "text-emerald-600" : c.roi >= 150 ? "text-blue-600" : "text-foreground"
                            )}>
                              {c.roi > 0 ? `${c.roi}%` : "—"}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {c.status === "active" ? (
                              <Button size="sm" variant="outline" className="text-xs h-7 gap-1">
                                <Eye className="h-3 w-3" />
                                View
                              </Button>
                            ) : c.status === "scheduled" ? (
                              <Button size="sm" variant="outline" className="text-xs h-7 gap-1">
                                <Settings2 className="h-3 w-3" />
                                Edit
                              </Button>
                            ) : (
                              <Button size="sm" variant="ghost" className="text-xs h-7 gap-1 text-muted-foreground">
                                <BarChart3 className="h-3 w-3" />
                                Report
                              </Button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Campaign Settings */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-muted-foreground" />
                Campaign Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Settings tabs */}
              <div className="flex gap-1 p-1 rounded-lg bg-gray-100">
                {([
                  { id: "channels" as const, label: "Channels" },
                  { id: "budget" as const, label: "Budget" },
                  { id: "targeting" as const, label: "Targeting" },
                ]).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSettingsTab(tab.id)}
                    className={cn(
                      "flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                      settingsTab === tab.id
                        ? "bg-white shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {settingsTab === "channels" && (
                <div className="space-y-4">
                  <SettingRow
                    icon={<Globe className="h-4 w-4 text-blue-500" />}
                    label="Social & Display Ads"
                    description="Facebook, Instagram, Google Display"
                    defaultChecked={true}
                  />
                  <SettingRow
                    icon={<Search className="h-4 w-4 text-emerald-500" />}
                    label="Search Ads"
                    description="Google Search, Bing Ads"
                    defaultChecked={true}
                  />
                  <SettingRow
                    icon={<Phone className="h-4 w-4 text-violet-500" />}
                    label="Vini AI Calls"
                    description="Outbound + inbound voice AI"
                    defaultChecked={!isUpsellScenario}
                    disabled={scenarioConfig.nudgeType === "upsell-cloning-campaign"}
                    upsellLabel={scenarioConfig.nudgeType === "upsell-cloning-campaign" ? "Upgrade required" : scenarioConfig.nudgeType === "upsell-vini-call" ? "Add Vini" : undefined}
                  />
                  <SettingRow
                    icon={<Bot className="h-4 w-4 text-teal-500" />}
                    label="Retargeting"
                    description="Re-engage website visitors"
                    defaultChecked={true}
                  />
                </div>
              )}

              {settingsTab === "budget" && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Default Campaign Budget
                    </Label>
                    <Select defaultValue="249">
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="99">$99 – $149 (Standard)</SelectItem>
                        <SelectItem value="249">$249 – $349 (Acceleration)</SelectItem>
                        <SelectItem value="499">$499 – $599 (Maximum)</SelectItem>
                        <SelectItem value="custom">Custom Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Monthly Spending Cap
                    </Label>
                    <Select defaultValue="5000">
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2000">$2,000 / month</SelectItem>
                        <SelectItem value="5000">$5,000 / month</SelectItem>
                        <SelectItem value="10000">$10,000 / month</SelectItem>
                        <SelectItem value="none">No cap</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Auto-Activate on Risk Stage
                    </Label>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="text-sm font-medium">Auto-campaign for risk vehicles</p>
                        <p className="text-xs text-muted-foreground">Activate when a vehicle enters risk stage</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === "targeting" && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Target Audience Radius
                    </Label>
                    <Select defaultValue="25">
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 miles</SelectItem>
                        <SelectItem value="25">25 miles</SelectItem>
                        <SelectItem value="50">50 miles</SelectItem>
                        <SelectItem value="100">100 miles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      AI Audience Targeting
                    </Label>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="text-sm font-medium">Smart targeting</p>
                        <p className="text-xs text-muted-foreground">AI selects high-intent audiences in your DMA</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Competitor Conquesting
                    </Label>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="text-sm font-medium">Target competitor shoppers</p>
                        <p className="text-xs text-muted-foreground">Show ads to users browsing competing dealers</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          {!isUpsellScenario && activeCampaigns.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                  Active Campaign Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {[
                  {
                    label: "Digital Ads",
                    count: campaigns.filter((c) => c.type === "digital" && c.status === "active").length,
                    color: "bg-blue-500",
                  },
                  {
                    label: "Vini AI Calls",
                    count: campaigns.filter((c) => c.type === "voice-ai" && c.status === "active").length,
                    color: "bg-violet-500",
                  },
                  {
                    label: "Ads + Vini",
                    count: campaigns.filter((c) => c.type === "both" && c.status === "active").length,
                    color: "bg-emerald-500",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn("w-2 h-2 rounded-full", item.color)} />
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                    </div>
                    <span className="text-xs font-bold">{item.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function SettingRow({
  icon,
  label,
  description,
  defaultChecked,
  disabled,
  upsellLabel,
}: {
  icon: React.ReactNode
  label: string
  description: string
  defaultChecked: boolean
  disabled?: boolean
  upsellLabel?: string
}) {
  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg border",
      disabled && "opacity-60"
    )}>
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-[11px] text-muted-foreground">{description}</p>
        </div>
      </div>
      {upsellLabel ? (
        <span className={cn(
          "text-[10px] font-semibold px-2 py-0.5 rounded-full",
          upsellLabel === "Add Vini"
            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
            : "bg-gray-100 text-muted-foreground"
        )}>
          {upsellLabel}
        </span>
      ) : (
        <Switch defaultChecked={defaultChecked} disabled={disabled} />
      )}
    </div>
  )
}
