"use client"

import * as React from "react"
import { mockChecklists } from "@/lib/spyne-max-mocks"
import type { AccountabilityChecklist } from "@/services/spyne-max/spyne-max.types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { CalendarDays, Clock } from "lucide-react"

const frequencyConfig: Record<string, { label: string; color: string; badgeClass: string }> = {
  daily: { label: "Daily", color: "text-emerald-600", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  weekly: { label: "Weekly", color: "text-blue-600", badgeClass: "bg-blue-50 text-blue-700 border-blue-200" },
  monthly: { label: "Monthly", color: "text-violet-600", badgeClass: "bg-violet-50 text-violet-700 border-violet-200" },
}

function ChecklistSection({ checklist }: { checklist: AccountabilityChecklist }) {
  const [items, setItems] = React.useState(checklist.items)
  const completed = items.filter((i) => i.completed).length
  const total = items.length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
  const cfg = frequencyConfig[checklist.frequency]

  function toggle(id: string) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i))
    )
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("text-xs", cfg.badgeClass)}>
            {cfg.label}
          </Badge>
          <span className="font-semibold text-sm">{checklist.label}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {checklist.duration}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Progress value={pct} className="h-2 flex-1" />
        <span className="text-xs font-medium text-muted-foreground">{completed}/{total}</span>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex items-start gap-2 cursor-pointer group"
          >
            <Checkbox
              checked={item.completed}
              onCheckedChange={() => toggle(item.id)}
              className="mt-0.5"
            />
            <span className={cn(
              "text-sm leading-snug",
              item.completed && "line-through text-muted-foreground"
            )}>
              {item.description}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

export function DailyRhythmTracker() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-emerald-500" />
          <div>
            <CardTitle>Daily Rhythm Tracker</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Meetings that drive process execution
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {mockChecklists.map((cl) => (
            <ChecklistSection key={cl.frequency} checklist={cl} />
          ))}
        </div>
        <p className="text-sm italic text-muted-foreground border-l-2 border-emerald-300 pl-3">
          &ldquo;Never cancel these. When you do, you send the message that structure is optional.&rdquo;
        </p>
      </CardContent>
    </Card>
  )
}
