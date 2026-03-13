"use client"

import * as React from "react"
import { mockCompetitors } from "@/lib/spyne-max-mocks"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { Trophy, AlertTriangle } from "lucide-react"

export function CompetitorBoard() {
  const sorted = [...mockCompetitors].sort((a, b) => b.estimatedVolume - a.estimatedVolume)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-4 w-4 text-primary" />
          Competitor Board
        </CardTitle>
        <CardDescription>Top 10 competitor profiles by estimated volume</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Rank</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Est. Volume</TableHead>
              <TableHead className="text-right">Avg Price</TableHead>
              <TableHead className="text-right">Day Supply</TableHead>
              <TableHead className="text-right">Bounce Rate</TableHead>
              <TableHead>Top Segments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.slice(0, 10).map((comp, i) => {
              const highBounce = comp.bounceRate > 55
              return (
                <TableRow key={comp.name} className={cn(highBounce && "bg-amber-50/50")}>
                  <TableCell className="font-mono text-center">{i + 1}</TableCell>
                  <TableCell className="font-medium whitespace-nowrap">
                    {comp.name}
                  </TableCell>
                  <TableCell className="text-right font-mono">{comp.estimatedVolume}</TableCell>
                  <TableCell className="text-right font-mono">
                    ${comp.avgPrice.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono">{comp.daySupply}</TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      "font-mono",
                      highBounce ? "text-amber-700 font-semibold" : "text-foreground"
                    )}>
                      {comp.bounceRate}%
                    </span>
                    {highBounce && (
                      <AlertTriangle className="inline ml-1.5 h-3.5 w-3.5 text-amber-600" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {comp.topSegments.map((seg) => (
                        <Badge key={seg} variant="outline" className="text-xs">
                          {seg}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        <p className="text-xs text-muted-foreground mt-3 italic">
          A competitor&apos;s bad engagement is your best lead source.
        </p>
      </CardContent>
    </Card>
  )
}
