"use client"

import * as React from "react"
import { mockWalks } from "@/lib/spyne-max-mocks"
import type { LotWalk, WalkStatus } from "@/services/spyne-max/spyne-max.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp, Calendar } from "lucide-react"
import { FifteenDayWalk } from "./fifteen-day-walk"
import { FortyFiveDayWalk } from "./forty-five-day-walk"

const STATUS_ORDER: WalkStatus[] = ["overdue", "due-today", "upcoming", "completed"]

const STATUS_CONFIG: Record<WalkStatus, { label: string; className: string }> = {
  overdue: { label: "Overdue", className: "bg-red-100 text-red-700 border-red-200" },
  "due-today": { label: "Due Today", className: "bg-amber-100 text-amber-700 border-amber-200" },
  upcoming: { label: "Upcoming", className: "bg-blue-100 text-blue-700 border-blue-200" },
  completed: { label: "Completed", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
}

function sortWalks(walks: LotWalk[]): LotWalk[] {
  return [...walks].sort(
    (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
  )
}

function WalkCard({ walk }: { walk: LotWalk }) {
  const [expanded, setExpanded] = React.useState(false)
  const config = STATUS_CONFIG[walk.status]

  return (
    <div
      className={cn(
        "rounded-lg border bg-white transition-shadow",
        walk.status === "overdue" && "border-red-300 ring-1 ring-red-100"
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/30 transition-colors rounded-t-lg"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {walk.year} {walk.make} {walk.model}
          </p>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span>{walk.daysInStock}d in stock</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {walk.dueDate}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <Badge variant="outline" className={cn("text-[10px]", config.className)}>
            {config.label}
          </Badge>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t">
          {walk.walkType === "15-day" ? (
            <FifteenDayWalk walk={walk} />
          ) : (
            <FortyFiveDayWalk walk={walk} />
          )}
        </div>
      )}
    </div>
  )
}

export function WalkBoard() {
  const fifteenDay = sortWalks(mockWalks.filter((w) => w.walkType === "15-day"))
  const fortyFiveDay = sortWalks(mockWalks.filter((w) => w.walkType === "45-day"))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            15-Day Walks
            <Badge variant="secondary" className="text-xs">
              {fifteenDay.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {fifteenDay.map((walk) => (
            <WalkCard key={`${walk.vin}-${walk.walkType}`} walk={walk} />
          ))}
          {fifteenDay.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No 15-day walks scheduled
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            45-Day Walks
            <Badge variant="secondary" className="text-xs">
              {fortyFiveDay.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {fortyFiveDay.map((walk) => (
            <WalkCard key={`${walk.vin}-${walk.walkType}`} walk={walk} />
          ))}
          {fortyFiveDay.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No 45-day walks scheduled
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
