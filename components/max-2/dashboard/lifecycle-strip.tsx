"use client"

import Link from "next/link"
import { mockLifecycle } from "@/lib/max-2-mocks"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

const healthDot: Record<string, string> = {
  green: "bg-emerald-500 shadow-emerald-500/40",
  yellow: "bg-amber-400 shadow-amber-400/40",
  red: "bg-red-500 shadow-red-500/40",
}

export function LifecycleStrip() {
  return (
    <div className="flex flex-wrap items-stretch gap-0">
      {mockLifecycle.map((node, i) => (
        <div key={node.stage} className="flex items-stretch">
          <Link
            href={node.href}
            className={cn(
              "group relative flex flex-col gap-2 rounded-xl border bg-card p-4 transition-all",
              "hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5",
              "w-[170px] min-h-[130px]",
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full shadow-[0_0_6px]",
                  healthDot[node.health],
                )}
              />
              <span className="text-sm font-semibold leading-tight">
                {node.label}
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-snug flex-1">
              {node.summary}
            </p>

            <div className="flex items-center gap-1.5 mt-auto">
              {node.threats > 0 && (
                <Badge
                  variant="destructive"
                  className="text-[10px] px-1.5 py-0 h-4 font-bold"
                >
                  {node.threats} threat{node.threats !== 1 && "s"}
                </Badge>
              )}
              {node.opportunities > 0 && (
                <Badge className="text-[10px] px-1.5 py-0 h-4 font-bold bg-blue-600 hover:bg-blue-700">
                  {node.opportunities} opp{node.opportunities !== 1 && "s"}
                </Badge>
              )}
            </div>
          </Link>

          {i < mockLifecycle.length - 1 && (
            <div className="flex items-center px-1 text-muted-foreground/40">
              <ChevronRight className="h-5 w-5" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
