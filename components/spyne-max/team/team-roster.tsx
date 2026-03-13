"use client"

import { mockTeamMembers } from "@/lib/spyne-max-mocks"
import type { TeamMember } from "@/services/spyne-max/spyne-max.types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Users, TrendingUp, TrendingDown, Minus } from "lucide-react"

const trendConfig: Record<TeamMember["trend"], { icon: typeof TrendingUp; className: string }> = {
  up: { icon: TrendingUp, className: "text-emerald-600" },
  flat: { icon: Minus, className: "text-gray-400" },
  down: { icon: TrendingDown, className: "text-red-500" },
}

function formatMetrics(member: TeamMember) {
  return member.metrics.map((m) => {
    const prefix = m.unit === "$" ? "$" : ""
    const suffix = m.unit === "%" ? "%" : m.unit === "x" ? "×" : m.unit === "days" ? "d" : ""
    return `${m.name}: ${prefix}${m.current}${suffix} / ${prefix}${m.target}${suffix}`
  }).join(" · ")
}

export function TeamRoster() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          <CardTitle>Team Roster</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 font-medium text-muted-foreground">Name</th>
                <th className="pb-3 font-medium text-muted-foreground">Role</th>
                <th className="pb-3 font-medium text-muted-foreground hidden sm:table-cell">Hire Date</th>
                <th className="pb-3 font-medium text-muted-foreground">Key Metrics</th>
                <th className="pb-3 font-medium text-muted-foreground text-center">Trend</th>
              </tr>
            </thead>
            <tbody>
              {mockTeamMembers.map((member) => {
                const trend = trendConfig[member.trend]
                const TrendIcon = trend.icon
                return (
                  <tr key={member.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 font-medium">{member.name}</td>
                    <td className="py-3 text-muted-foreground">{member.roleLabel}</td>
                    <td className="py-3 text-muted-foreground hidden sm:table-cell">
                      {new Date(member.hireDate).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 text-xs font-mono">{formatMetrics(member)}</td>
                    <td className="py-3 text-center">
                      <TrendIcon className={cn("h-4 w-4 mx-auto", trend.className)} />
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
