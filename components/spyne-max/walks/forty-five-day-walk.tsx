"use client"

import * as React from "react"
import type { LotWalk } from "@/services/spyne-max/spyne-max.types"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { DollarSign } from "lucide-react"

const ACTION_OPTIONS = [
  { value: "reprice", label: "Reprice 2-3% below market + feature in email blast" },
  { value: "auction", label: "Move to auction this week" },
  { value: "trade-walk", label: "Offer as trade-walk to incoming customers" },
  { value: "fire-sale", label: "Fire-sale online with aggressive pricing" },
]

interface FortyFiveDayWalkProps {
  walk: LotWalk
}

export function FortyFiveDayWalk({ walk }: FortyFiveDayWalkProps) {
  const [checked, setChecked] = React.useState<Record<string, boolean>>(
    () => Object.fromEntries(walk.checklist.map((c) => [c.id, c.completed]))
  )
  const [selectedAction, setSelectedAction] = React.useState<string>("")

  const nonActionItems = walk.checklist.filter((c) => c.category !== "Action")
  const total = nonActionItems.length + 1
  const completedCount =
    nonActionItems.filter((c) => checked[c.id]).length + (selectedAction ? 1 : 0)
  const progressPercent = Math.round((completedCount / total) * 100)

  const toggle = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const categories = Array.from(
    new Set(walk.checklist.filter((c) => c.category !== "Action").map((c) => c.category))
  )

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
        {walk.roiPerDay != null && (
          <Badge variant="outline" className="flex items-center gap-1 text-sm font-bold">
            <DollarSign className="h-3.5 w-3.5" />
            {walk.roiPerDay}/day ROI
          </Badge>
        )}
      </div>

      <Progress value={progressPercent} className="h-2" />
      <p className="text-xs text-muted-foreground text-right">
        {completedCount}/{total} completed
      </p>

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

      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Action Decision
        </p>
        <RadioGroup value={selectedAction} onValueChange={setSelectedAction}>
          {ACTION_OPTIONS.map((opt) => (
            <div
              key={opt.value}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 border transition-colors cursor-pointer",
                selectedAction === opt.value
                  ? "border-primary bg-primary/5"
                  : "border-transparent hover:bg-muted/50"
              )}
            >
              <RadioGroupItem value={opt.value} id={opt.value} />
              <Label htmlFor={opt.value} className="text-sm cursor-pointer flex-1">
                {opt.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <p className="text-xs italic text-muted-foreground border-t pt-3">
        &ldquo;By Day 45, there&apos;s no gray area. Every car is either going to move or cost you net.&rdquo;
      </p>
    </div>
  )
}
