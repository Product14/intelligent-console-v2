"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { VehicleSummary } from "@/services/inventory/inventory.types"
import {
  Zap, Camera, Phone, ArrowUpRight, TrendingDown, Sparkles, CheckCircle2,
  ChevronDown, ChevronUp, Lock, AlertTriangle, Globe, AlertCircle,
} from "lucide-react"

interface DailyTask {
  id: string
  vehicleVin: string
  vehicleName: string
  vehicleTrim: string
  taskType: "reduce-price" | "activate-campaign" | "assign-photographer" | "call-prospects" | "upgrade-media" | "approve-recon" | "wholesale-exit"
  description: string
  dollarImpact: number
  urgency: "critical" | "high" | "medium"
  rootCauses: string[]
  holdingCostPerDay: number
  websiteContext: string | null
}

const TASK_CONFIG: Record<DailyTask["taskType"], { icon: React.ElementType; color: string; actionLabel: string }> = {
  "reduce-price": { icon: TrendingDown, color: "text-red-500", actionLabel: "Adjust Price" },
  "activate-campaign": { icon: Zap, color: "text-emerald-500", actionLabel: "Activate" },
  "assign-photographer": { icon: Camera, color: "text-violet-500", actionLabel: "Schedule" },
  "call-prospects": { icon: Phone, color: "text-blue-500", actionLabel: "View Leads" },
  "upgrade-media": { icon: Sparkles, color: "text-amber-500", actionLabel: "Upgrade" },
  "approve-recon": { icon: CheckCircle2, color: "text-teal-500", actionLabel: "Approve" },
  "wholesale-exit": { icon: AlertTriangle, color: "text-red-600", actionLabel: "Evaluate" },
}

const URGENCY_COLORS: Record<DailyTask["urgency"], string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-amber-400",
}

function getWebsiteContext(v: VehicleSummary): string | null {
  if (v.vdpViews >= 800 && v.leads < 3) return `${v.vdpViews.toLocaleString()} views, ${v.leads} leads — conversion issue`
  if (v.vdpViews < 400 && v.daysInStock >= 5) return `${v.vdpViews} views — visibility issue`
  if (v.mediaType === "none") return "Stock photos — trust issue"
  return null
}

function getRootCauses(v: VehicleSummary): string[] {
  const causes: string[] = []
  if (v.campaignStatus === "none") causes.push("No campaign active")
  if (v.mediaType === "clone") causes.push(`AI Instant Media for ${v.daysInStock}d — upgrade recommended`)
  if (v.mediaType === "none") causes.push("Stock photos only — no merchandising")
  if (v.leads === 0 && v.daysInStock >= 5) causes.push("Zero leads after go-live")
  if (v.vdpViews >= 800 && v.leads < 3) causes.push(`${v.vdpViews.toLocaleString()} VDP views but weak conversion`)
  if (v.vdpViews < 400 && v.daysInStock >= 5) causes.push("Low visibility — few VDP views")
  if (v.priceReduced) causes.push("Price recently reduced")
  if (v.publishStatus !== "published") causes.push("Not yet published")
  return causes
}

function generateTasks(vehicles: VehicleSummary[]): DailyTask[] {
  const tasks: DailyTask[] = []

  vehicles
    .filter(v => v.marginRemaining <= 0)
    .sort((a, b) => a.marginRemaining - b.marginRemaining)
    .forEach(v => {
      tasks.push({
        id: `wholesale-${v.vin}`,
        vehicleVin: v.vin,
        vehicleName: `${v.year} ${v.make} ${v.model}`,
        vehicleTrim: v.trim,
        taskType: "wholesale-exit",
        description: `Evaluate wholesale exit — margin depleted, losing $${v.dailyBurn}/day`,
        dollarImpact: Math.abs(v.marginRemaining) + v.dailyBurn * 5,
        urgency: "critical",
        rootCauses: getRootCauses(v),
        holdingCostPerDay: v.dailyBurn,
        websiteContext: getWebsiteContext(v),
      })
    })

  vehicles
    .filter(v => v.marginRemaining > 0 && v.marginRemaining / v.dailyBurn <= 5)
    .sort((a, b) => (a.marginRemaining / a.dailyBurn) - (b.marginRemaining / b.dailyBurn))
    .forEach(v => {
      tasks.push({
        id: `price-${v.vin}`,
        vehicleVin: v.vin,
        vehicleName: `${v.year} ${v.make} ${v.model}`,
        vehicleTrim: v.trim,
        taskType: "reduce-price",
        description: `Reduce price to protect $${v.marginRemaining.toLocaleString()} margin`,
        dollarImpact: v.marginRemaining,
        urgency: "critical",
        rootCauses: getRootCauses(v),
        holdingCostPerDay: v.dailyBurn,
        websiteContext: getWebsiteContext(v),
      })
    })

  vehicles
    .filter(v => (v.leads >= 10 || v.vdpViews >= 2000) && v.campaignStatus === "none")
    .sort((a, b) => b.leads - a.leads)
    .forEach(v => {
      tasks.push({
        id: `campaign-${v.vin}`,
        vehicleVin: v.vin,
        vehicleName: `${v.year} ${v.make} ${v.model}`,
        vehicleTrim: v.trim,
        taskType: "activate-campaign",
        description: `Activate Hot Pack — ${v.leads} leads, ${v.vdpViews.toLocaleString()} views`,
        dollarImpact: Math.round(v.marginRemaining * 0.3),
        urgency: "high",
        rootCauses: getRootCauses(v),
        holdingCostPerDay: v.dailyBurn,
        websiteContext: getWebsiteContext(v),
      })
    })

  vehicles
    .filter(v => v.mediaType === "clone" && v.daysInStock >= 14 && v.marginRemaining > 0)
    .sort((a, b) => b.daysInStock - a.daysInStock)
    .forEach(v => {
      tasks.push({
        id: `photo-${v.vin}`,
        vehicleVin: v.vin,
        vehicleName: `${v.year} ${v.make} ${v.model}`,
        vehicleTrim: v.trim,
        taskType: "assign-photographer",
        description: `Assign photographer — AI Instant Media for ${v.daysInStock}d, upgrade before Day 20`,
        dollarImpact: Math.round(v.dailyBurn * 4),
        urgency: v.daysInStock >= 20 ? "high" : "medium",
        rootCauses: getRootCauses(v),
        holdingCostPerDay: v.dailyBurn,
        websiteContext: getWebsiteContext(v),
      })
    })

  vehicles
    .filter(v => v.priceReduced && v.leads >= 1)
    .sort((a, b) => b.leads - a.leads)
    .forEach(v => {
      tasks.push({
        id: `call-${v.vin}`,
        vehicleVin: v.vin,
        vehicleName: `${v.year} ${v.make} ${v.model}`,
        vehicleTrim: v.trim,
        taskType: "call-prospects",
        description: `Call ${v.leads} hot prospect${v.leads > 1 ? "s" : ""} — price just dropped`,
        dollarImpact: Math.round(v.marginRemaining > 0 ? v.marginRemaining * 0.25 : v.dailyBurn * 5),
        urgency: "high",
        rootCauses: getRootCauses(v),
        holdingCostPerDay: v.dailyBurn,
        websiteContext: getWebsiteContext(v),
      })
    })

  vehicles
    .filter(v => v.vdpViews >= 800 && v.leads < 3 && v.marginRemaining > 0)
    .sort((a, b) => b.vdpViews - a.vdpViews)
    .forEach(v => {
      tasks.push({
        id: `media-${v.vin}`,
        vehicleVin: v.vin,
        vehicleName: `${v.year} ${v.make} ${v.model}`,
        vehicleTrim: v.trim,
        taskType: "upgrade-media",
        description: `Upgrade media — ${v.vdpViews.toLocaleString()} views but only ${v.leads} leads`,
        dollarImpact: Math.round(v.dailyBurn * 5),
        urgency: "medium",
        rootCauses: getRootCauses(v),
        holdingCostPerDay: v.dailyBurn,
        websiteContext: getWebsiteContext(v),
      })
    })

  const urgencyOrder = { critical: 0, high: 1, medium: 2 }
  tasks.sort((a, b) => {
    if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
    return b.dollarImpact - a.dollarImpact
  })

  const seen = new Set<string>()
  const unique: DailyTask[] = []
  for (const task of tasks) {
    if (!seen.has(task.vehicleVin)) {
      seen.add(task.vehicleVin)
      unique.push(task)
    }
  }
  return unique.slice(0, 5)
}

interface DailyTaskEngineProps {
  vehicles: VehicleSummary[]
  onAccelerate: (vin: string) => void
  onUpgradeMedia: (vin: string) => void
}

export function DailyTaskEngine({ vehicles, onAccelerate, onUpgradeMedia }: DailyTaskEngineProps) {
  const tasks = React.useMemo(() => generateTasks(vehicles), [vehicles])
  const [completed, setCompleted] = React.useState<Set<string>>(new Set())
  const [expandedTask, setExpandedTask] = React.useState<string | null>(null)

  const toggleComplete = (id: string) => {
    setCompleted(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const handleAction = (task: DailyTask) => {
    if (["activate-campaign", "reduce-price", "wholesale-exit", "approve-recon", "call-prospects"].includes(task.taskType)) {
      onAccelerate(task.vehicleVin)
    } else {
      onUpgradeMedia(task.vehicleVin)
    }
  }

  const totalImpact = tasks.reduce((s, t) => s + t.dollarImpact, 0)
  const completedCount = completed.size

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight">All Clear Today</h2>
            <p className="text-sm text-muted-foreground">No critical actions. Lot is performing within target.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-white">
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold tracking-tight">Your Highest Impact Actions Today</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {completedCount > 0 && <span className="text-emerald-600 font-medium">{completedCount} done · </span>}
              ${totalImpact.toLocaleString()} total margin impact
            </p>
          </div>
          {completedCount === tasks.length && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              All Complete
            </span>
          )}
        </div>
      </div>

      <div className="divide-y">
        {tasks.map((task, idx) => {
          const config = TASK_CONFIG[task.taskType]
          const Icon = config.icon
          const isComplete = completed.has(task.id)
          const isExpanded = expandedTask === task.id

          return (
            <div key={task.id}>
              <div className={cn(
                "flex items-center gap-4 px-5 py-3.5 transition-all",
                isComplete ? "opacity-50 bg-gray-50/50" : "hover:bg-gray-50/30"
              )}>
                <Checkbox
                  checked={isComplete}
                  onCheckedChange={() => toggleComplete(task.id)}
                  className="h-5 w-5 rounded-full"
                />

                <span className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  isComplete ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-500"
                )}>
                  {isComplete ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
                </span>

                <div className={cn("p-1.5 rounded-lg", isComplete ? "bg-gray-100" : "bg-gray-50")}>
                  <Icon className={cn("h-4 w-4", isComplete ? "text-gray-400" : config.color)} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", isComplete ? "bg-gray-300" : URGENCY_COLORS[task.urgency])} />
                    <p className={cn("text-sm font-medium truncate", isComplete && "line-through text-muted-foreground")}>
                      {task.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Link
                      href={`/inventory/${task.vehicleVin}`}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      {task.vehicleName} · {task.vehicleTrim}
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-right mr-1">
                    <span className={cn("text-sm font-semibold tabular-nums", isComplete ? "text-muted-foreground" : "text-foreground")}>
                      ${task.dollarImpact.toLocaleString()}
                    </span>
                    <p className="text-[10px] text-muted-foreground">impact</p>
                  </div>

                  {!isComplete && (
                    <>
                      <Button size="sm" variant="outline" className="text-xs h-7 gap-1" onClick={() => handleAction(task)}>
                        {config.actionLabel}
                        <ArrowUpRight className="h-3 w-3" />
                      </Button>
                      <button
                        onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                        className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {isExpanded && !isComplete && (
                <div className="px-5 pb-4 pt-0 ml-[72px]">
                  <div className="rounded-lg border bg-gray-50/50 p-4 space-y-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Why This Matters</p>
                      <div className="space-y-1">
                        {task.rootCauses.map((cause, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <AlertCircle className="h-3 w-3 text-red-400/70 flex-shrink-0" />
                            <span className="text-xs text-muted-foreground">{cause}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {task.websiteContext && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50/50 border border-blue-100">
                        <Globe className="h-3 w-3 text-blue-500 flex-shrink-0" />
                        <span className="text-[11px] text-blue-700">{task.websiteContext}</span>
                      </div>
                    )}

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Financial Impact</p>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground">
                          Holding cost: <span className="font-semibold text-foreground">${task.holdingCostPerDay}/day</span>
                        </span>
                        <span className="text-xs text-muted-foreground">
                          5-day projected loss: <span className="font-semibold text-red-600">${(task.holdingCostPerDay * 5).toLocaleString()}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Button size="sm" className="text-xs h-7 gap-1" onClick={() => handleAction(task)}>
                        <Icon className="h-3 w-3" />
                        {config.actionLabel}
                      </Button>
                      {task.taskType !== "wholesale-exit" && (
                        <Button size="sm" variant="outline" className="text-xs h-7 gap-1" onClick={() => onAccelerate(task.vehicleVin)}>
                          <Zap className="h-3 w-3" />
                          Full Acceleration
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 border-t pt-2">
                      <Lock className="h-3 w-3 text-muted-foreground/50" />
                      <span className="text-[11px] text-muted-foreground/60">
                        Unlock Acceleration Pack to automate this action
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
