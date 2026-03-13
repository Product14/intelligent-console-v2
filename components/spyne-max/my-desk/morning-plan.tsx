"use client"

import { useState, useCallback } from "react"
import { mockDailyRhythm } from "@/lib/spyne-max-mocks"
import type { DailyRhythmBlock } from "@/services/spyne-max/spyne-max.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Sunrise, Sun, Sunset } from "lucide-react"

const blockIcons: Record<DailyRhythmBlock["timeOfDay"], typeof Sunrise> = {
  morning: Sunrise,
  midday: Sun,
  "end-of-day": Sunset,
}

const blockColors: Record<DailyRhythmBlock["timeOfDay"], { accent: string; bg: string; progress: string }> = {
  morning: { accent: "text-amber-600", bg: "bg-amber-50", progress: "[&>[data-slot=progress-indicator]]:bg-amber-500" },
  midday: { accent: "text-sky-600", bg: "bg-sky-50", progress: "[&>[data-slot=progress-indicator]]:bg-sky-500" },
  "end-of-day": { accent: "text-violet-600", bg: "bg-violet-50", progress: "[&>[data-slot=progress-indicator]]:bg-violet-500" },
}

export function MorningPlan() {
  const [blocks, setBlocks] = useState(() =>
    mockDailyRhythm.map((b) => ({
      ...b,
      tasks: b.tasks.map((t) => ({ ...t })),
    }))
  )

  const toggleTask = useCallback((blockIdx: number, taskId: string) => {
    setBlocks((prev) =>
      prev.map((b, i) =>
        i !== blockIdx
          ? b
          : {
              ...b,
              tasks: b.tasks.map((t) =>
                t.id === taskId ? { ...t, completed: !t.completed } : t
              ),
            }
      )
    )
  }, [])

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Daily Rhythm</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {blocks.map((block, blockIdx) => {
          const Icon = blockIcons[block.timeOfDay]
          const colors = blockColors[block.timeOfDay]
          const done = block.tasks.filter((t) => t.completed).length
          const total = block.tasks.length
          const pct = total > 0 ? Math.round((done / total) * 100) : 0

          return (
            <div key={block.timeOfDay} className="rounded-lg border overflow-hidden">
              <div className={cn("flex items-center gap-3 px-4 py-2.5", colors.bg)}>
                <Icon className={cn("h-4 w-4", colors.accent)} />
                <div className="flex-1 min-w-0">
                  <span className={cn("text-sm font-semibold", colors.accent)}>{block.label}</span>
                  <span className="text-xs text-muted-foreground ml-2">{block.timeRange}</span>
                </div>
                <span className="text-xs font-medium text-muted-foreground">{done}/{total}</span>
              </div>
              <Progress value={pct} className={cn("h-1 rounded-none", colors.progress)} />
              <div className="divide-y">
                {block.tasks.map((task) => (
                  <label
                    key={task.id}
                    className="flex items-start gap-3 px-4 py-2.5 cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(blockIdx, task.id)}
                      className="mt-0.5"
                    />
                    <span
                      className={cn(
                        "text-sm leading-snug",
                        task.completed && "line-through text-muted-foreground"
                      )}
                    >
                      {task.description}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
