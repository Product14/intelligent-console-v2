"use client"

import { useRouter } from "next/navigation"
import { mockLotVehicles } from "@/lib/max-2-mocks"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { CheckCircle2, ChevronRight, AlertTriangle, EyeOff, Megaphone } from "lucide-react"

type Priority = "critical" | "high" | "medium"

interface ActionItem {
  id: string
  priority: Priority
  title: string
  icon: React.ReactNode
  vehicles: { name: string; days: number; stock: string }[]
  impact: string
  count: number
  filterParams: Record<string, string>
}

const P: Record<Priority, { border: string; badge: string; impact: string; iconColor: string }> = {
  critical: { border: "border-l-spyne-error",   badge: "spyne-row-error text-spyne-error border border-spyne-border",     impact: "text-spyne-error",   iconColor: "text-spyne-error" },
  high:     { border: "border-l-spyne-warning", badge: "spyne-row-warn text-spyne-text border border-spyne-border", impact: "text-spyne-text", iconColor: "text-spyne-warning" },
  medium:   { border: "border-l-spyne-warning", badge: "spyne-row-warn text-spyne-text border border-spyne-border", impact: "text-spyne-text", iconColor: "text-spyne-warning" },
}

const MAX_VEHICLES = 2

const ON_LOT = ["frontline", "wholesale-candidate", "sold-pending"]

const aged45Cars   = mockLotVehicles.filter((v) => ON_LOT.includes(v.lotStatus) && v.daysInStock >= 45 && v.lotStatus !== "sold-pending")
const noLeadsCars  = mockLotVehicles.filter((v) => v.leads === 0 && v.daysInStock > 5 && v.lotStatus === "frontline")
const lowEngagementCars = mockLotVehicles.filter((v) => v.lotStatus === "frontline" && v.leads === 0 && v.daysInStock >= 10)

const ALL_ACTIONS = ([
  {
    id: "aged",
    priority: "critical" as Priority,
    title: "Reprice or Liquidate",
    icon: <AlertTriangle className="h-4 w-4" />,
    vehicles: aged45Cars
      .sort((a, b) => b.daysInStock - a.daysInStock)
      .slice(0, MAX_VEHICLES)
      .map((v) => ({ name: `${v.year} ${v.make} ${v.model}`, days: v.daysInStock, stock: v.stockNumber })),
    impact: `$${(aged45Cars.reduce((s, v) => s + v.holdingCostPerDay, 0) * 7).toLocaleString()} more lost in 7 days if no action`,
    count: aged45Cars.length,
    filterParams: { focus: "aged-45" },
  },
  {
    id: "leads",
    priority: "critical" as Priority,
    title: "Fix Pricing or Visibility",
    icon: <EyeOff className="h-4 w-4" />,
    vehicles: noLeadsCars
      .sort((a, b) => b.daysInStock - a.daysInStock)
      .slice(0, MAX_VEHICLES)
      .map((v) => ({ name: `${v.year} ${v.make} ${v.model}`, days: v.daysInStock, stock: v.stockNumber })),
    impact: `${noLeadsCars.length} frontline cars generating zero lead revenue`,
    count: noLeadsCars.length,
    filterParams: { focus: "no-leads" },
  },
  {
    id: "campaigns",
    priority: "high" as Priority,
    title: "Run Smart Campaigns",
    icon: <Megaphone className="h-4 w-4" />,
    vehicles: lowEngagementCars
      .sort((a, b) => b.daysInStock - a.daysInStock)
      .slice(0, MAX_VEHICLES)
      .map((v) => ({ name: `${v.year} ${v.make} ${v.model}`, days: v.daysInStock, stock: v.stockNumber })),
    impact: "Targeted ads can boost VDP views by up to 4× on stale units",
    count: lowEngagementCars.length,
    filterParams: { focus: "smart-campaign" },
  },
] as ActionItem[]).filter((a) => a.count > 0)

export function LotActions() {
  const router = useRouter()

  const handleActionClick = (action: ActionItem) => {
    const params = new URLSearchParams(action.filterParams)
    router.push(`/max-2/studio/inventory?${params.toString()}`)
  }

  return (
    <Card className="shadow-none gap-0">
      <CardHeader className="pb-4">
        <CardTitle>Actions</CardTitle>
        <CardDescription>Sorted by revenue impact</CardDescription>
      </CardHeader>

      <CardContent className="pt-1">
        {ALL_ACTIONS.length === 0 ? (
          <div className="flex items-center gap-2 py-4 text-sm text-spyne-success">
            <CheckCircle2 className="h-4 w-4" />
            No urgent actions - lot is performing well
          </div>
        ) : (
          <div className="space-y-2.5">
            {ALL_ACTIONS.map((action) => {
              const cfg = P[action.priority]
              const remaining = action.count - action.vehicles.length
              return (
                <div
                  key={action.id}
                  onClick={() => handleActionClick(action)}
                  className={cn(
                    "rounded-xl border border-l-[3px] bg-spyne-surface px-4 py-3.5 cursor-pointer transition-all duration-150 hover:bg-muted/40 hover:shadow-sm active:scale-[0.99] group",
                    cfg.border,
                  )}
                >
                  {/* Header row: icon + title + count badge + chevron */}
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <span className={cn("shrink-0", cfg.iconColor)}>{action.icon}</span>
                    <span className="text-sm font-semibold">{action.title}</span>
                    <span className={cn("ml-auto rounded-full px-2.5 py-0.5 text-[10px] font-bold shrink-0", cfg.badge)}>
                      {action.count}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
                  </div>

                  {/* Top vehicles */}
                  <div className="space-y-1 mb-2.5">
                    {action.vehicles.map((v) => (
                      <div key={v.stock} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground truncate">{v.name}</span>
                        <span className="text-muted-foreground/70 tabular-nums shrink-0 ml-3">{v.days}d</span>
                      </div>
                    ))}
                    {remaining > 0 && (
                      <span className="text-[11px] text-muted-foreground/60">+{remaining} more</span>
                    )}
                  </div>

                  {/* Impact */}
                  <p className={cn("text-xs font-medium", cfg.impact)}>
                    {action.impact}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
