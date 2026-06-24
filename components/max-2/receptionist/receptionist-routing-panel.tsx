"use client"

import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"

type Tone = "primary" | "success" | "warning" | "info" | "neutral"

const toneClass: Record<Tone, string> = {
  primary: "bg-spyne-brand",
  success: "bg-spyne-success",
  warning: "bg-[var(--spyne-warning)]",
  info: "bg-spyne-info",
  neutral: "bg-spyne-text-muted",
}

export function ReceptionistRoutingPanel({
  rateLabel,
  rateCaption,
  deltaLabel,
  segments,
  className,
}: {
  rateLabel: string
  rateCaption: string
  deltaLabel: string
  segments: { label: string; value: number; tone: Tone }[]
  className?: string
}) {
  const total = segments.reduce((acc, s) => acc + s.value, 0) || 1
  return (
    <div className={cn("spyne-card flex h-full min-h-0 flex-col gap-4 p-4", className)}>
      <div className="flex items-center justify-between gap-1.5">
        <h3 className={cn(spyneComponentClasses.cardTitle, "m-0")}>Where calls went</h3>
        <span className="text-[11px] font-semibold text-spyne-text-muted tabular-nums">{segments.reduce((s, x) => s + x.value, 0)} calls</span>
      </div>

      <div className="flex h-2 overflow-hidden rounded-full">
        {segments.map((s) => (
          <div key={s.label} className={toneClass[s.tone]} style={{ flex: s.value }} />
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {segments.map((s) => {
          const total = segments.reduce((sum, x) => sum + x.value, 0)
          const pct = total ? Math.round((s.value / total) * 100) : 0
          return (
            <div key={s.label} className="flex items-center text-[13px]">
              <div className={cn("mr-2.5 h-2 w-2 rounded-full", toneClass[s.tone])} />
              <span className="flex-1">{s.label}</span>
              <span className="tabular-nums font-semibold mr-2">{s.value}</span>
              <span className="tabular-nums text-[11px] text-spyne-text-muted w-9 text-right">{pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
