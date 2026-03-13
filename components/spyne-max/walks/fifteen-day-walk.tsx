"use client"

import * as React from "react"
import type { LotWalk } from "@/services/spyne-max/spyne-max.types"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface FifteenDayWalkProps {
  walk: LotWalk
}

export function FifteenDayWalk({ walk }: FifteenDayWalkProps) {
  const [checked, setChecked] = React.useState<Record<string, boolean>>(
    () => Object.fromEntries(walk.checklist.map((c) => [c.id, c.completed]))
  )

  const total = walk.checklist.length
  const completedCount = Object.values(checked).filter(Boolean).length
  const progressPercent = Math.round((completedCount / total) * 100)

  const toggle = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const categories = Array.from(new Set(walk.checklist.map((c) => c.category)))

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">
            {walk.year} {walk.make} {walk.model}
          </p>
          <p className="text-xs text-muted-foreground">
            {walk.daysInStock} days in stock · Due {walk.dueDate}
          </p>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold">{completedCount}/{total}</span>
          <p className="text-xs text-muted-foreground">completed</p>
        </div>
      </div>

      <Progress value={progressPercent} className="h-2" />

      {categories.map((category) => (
        <div key={category}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {category}
          </p>
          <div className="flex flex-col gap-2">
            {walk.checklist
              .filter((c) => c.category === category)
              .map((item) => (
                <label
                  key={item.id}
                  className={cn(
                    "flex items-start gap-2.5 rounded-md px-2 py-1.5 text-sm cursor-pointer transition-colors hover:bg-muted/50",
                    checked[item.id] && "line-through text-muted-foreground"
                  )}
                >
                  <Checkbox
                    checked={checked[item.id]}
                    onCheckedChange={() => toggle(item.id)}
                    className="mt-0.5"
                  />
                  <span>{item.description}</span>
                </label>
              ))}
          </div>
        </div>
      ))}

      <p className="text-xs italic text-muted-foreground border-t pt-3">
        &ldquo;The first 15 days decide whether that car will make you money or waste it.&rdquo;
      </p>
    </div>
  )
}
