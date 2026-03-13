"use client"

import { mockManagerScorecards } from "@/lib/spyne-max-mocks"
import type { KPIStatus } from "@/services/spyne-max/spyne-max.types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { UserCircle } from "lucide-react"

const statusConfig: Record<KPIStatus, { label: string; className: string }> = {
  above: { label: "Above", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  at: { label: "At Target", className: "bg-amber-50 text-amber-700 border-amber-200" },
  below: { label: "Below", className: "bg-red-50 text-red-700 border-red-200" },
}

export function ManagerScorecards() {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Manager Scorecards
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {mockManagerScorecards.map((card) => (
          <Card key={card.role}>
            <CardContent className="p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold text-sm">{card.name}</p>
                  <p className="text-xs text-muted-foreground">{card.roleLabel}</p>
                </div>
              </div>

              <div className="space-y-2">
                {card.metrics.map((m) => {
                  const cfg = statusConfig[m.status]
                  return (
                    <div key={m.name} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{m.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold">
                          {m.unit === "$" && "$"}{m.current}{m.unit === "%" && "%"}{m.unit === "x" && "×"}{m.unit === "days" && " d"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          / {m.unit === "$" && "$"}{m.target}{m.unit === "%" && "%"}{m.unit === "x" && "×"}{m.unit === "days" && " d"}
                        </span>
                        <Badge variant="outline" className={cn("text-[10px] px-1.5", cfg.className)}>
                          {cfg.label}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-sm italic text-muted-foreground border-l-2 border-violet-300 pl-3">
        &ldquo;When every manager owns their metric, the GM doesn&rsquo;t have to chase anyone.&rdquo;
      </p>
    </div>
  )
}
