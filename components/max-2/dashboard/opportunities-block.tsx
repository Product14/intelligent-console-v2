"use client"

import { useState } from "react"
import Link from "next/link"
import { mockOpportunities } from "@/lib/max-2-mocks"
import type { Opportunity } from "@/services/max-2/max-2.types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { TrendingUp, ArrowRight, ChevronRight, ChevronDown } from "lucide-react"

const sorted = [...mockOpportunities].sort((a, b) => {
  if (a.impact === "high" && b.impact !== "high") return -1
  if (a.impact !== "high" && b.impact === "high") return 1
  return 0
})

function OpportunityCard({ opp }: { opp: Opportunity }) {
  const [open, setOpen] = useState(false)
  const isHigh = opp.impact === "high"

  return (
    <div
      className={cn(
        "rounded-lg border transition-all",
        isHigh
          ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30"
          : "border-emerald-100 bg-card dark:border-emerald-900/50",
        "border-l-[3px]",
        isHigh ? "border-l-emerald-500" : "border-l-emerald-300",
      )}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-3 text-left group"
      >
        <Badge className="text-xs font-bold px-2 py-0.5 shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white border-0">
          {opp.count}
        </Badge>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold truncate">{opp.label}</span>
            {isHigh && (
              <Badge className="text-[10px] px-1.5 py-0 h-4 bg-emerald-600 hover:bg-emerald-700 text-white border-0">
                High Impact
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {opp.description}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {open ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {open && opp.items && opp.items.length > 0 && (
        <div className="px-3 pb-3 space-y-1.5">
          <div className="border-t border-emerald-200/60 dark:border-emerald-900/40 pt-2">
            {opp.items.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-2 py-1.5 text-xs"
              >
                <span className="font-medium shrink-0">{item.title}</span>
                <span className="text-muted-foreground ml-auto text-right">
                  {item.detail}
                </span>
              </div>
            ))}
          </div>
          <Link
            href={opp.href}
            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            View all & take action
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  )
}

export function OpportunitiesBlock() {
  return (
    <Card className="py-5 gap-4">
      <CardHeader className="pb-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-emerald-100 dark:bg-emerald-950">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <CardTitle className="text-base">Opportunities</CardTitle>
            <CardDescription className="text-xs">
              Upside — growth & acceleration
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {sorted.map((o) => (
          <OpportunityCard key={o.id} opp={o} />
        ))}
      </CardContent>
    </Card>
  )
}
