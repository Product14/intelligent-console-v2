"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { mockFrontEndHealth } from "@/lib/spyne-max-mocks"
import { cn } from "@/lib/utils"
import { CheckCircle2, XCircle, Minus, TrendingUp } from "lucide-react"
import type { KPIStatus } from "@/services/spyne-max/spyne-max.types"

const statusConfig: Record<KPIStatus, { icon: typeof CheckCircle2; className: string; label: string }> = {
  above: { icon: CheckCircle2, className: "text-emerald-600", label: "Good" },
  at: { icon: Minus, className: "text-amber-500", label: "At Target" },
  below: { icon: XCircle, className: "text-red-500", label: "Below" },
}

export function FrontEndHealth() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          <CardTitle>Front-End Health</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 font-medium text-muted-foreground">Metric</th>
                <th className="pb-3 font-medium text-muted-foreground hidden sm:table-cell">Formula</th>
                <th className="pb-3 font-medium text-muted-foreground text-right">Current</th>
                <th className="pb-3 font-medium text-muted-foreground text-right">Target</th>
                <th className="pb-3 font-medium text-muted-foreground text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockFrontEndHealth.map((metric) => {
                const config = statusConfig[metric.status]
                const Icon = config.icon
                return (
                  <tr key={metric.name} className="border-b last:border-0">
                    <td className="py-3 font-medium">{metric.name}</td>
                    <td className="py-3 text-muted-foreground text-xs hidden sm:table-cell">{metric.formula}</td>
                    <td className="py-3 text-right font-mono">
                      {typeof metric.current === "number" && metric.unit === "$" && "$"}
                      {metric.current.toLocaleString()}
                      {metric.unit === "%" && "%"}
                      {metric.unit === "x" && "×"}
                      {metric.unit === "days" && " days"}
                      {metric.unit === "$/day" && "/day"}
                    </td>
                    <td className="py-3 text-right text-muted-foreground">{metric.target}</td>
                    <td className="py-3 text-center">
                      <Icon className={cn("h-4 w-4 mx-auto", config.className)} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
