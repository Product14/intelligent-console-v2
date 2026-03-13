"use client"

import * as React from "react"
import { mockSalesChannels } from "@/lib/spyne-max-mocks"
import type { SalesChannel } from "@/services/spyne-max/spyne-max.types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Monitor, Phone, Footprints, ChevronDown, ChevronUp } from "lucide-react"

const channelIcon: Record<string, typeof Monitor> = {
  internet: Monitor,
  phone: Phone,
  "walk-in": Footprints,
}

function inRange(value: number, range: [number, number]) {
  return value >= range[0] && value <= range[1]
}

function ChannelCard({ channel }: { channel: SalesChannel }) {
  const [expanded, setExpanded] = React.useState(false)
  const Icon = channelIcon[channel.channel] ?? Monitor
  const isInTarget = inRange(channel.conversionRate, channel.targetRange)

  return (
    <Card className={cn(
      "flex-1 min-w-[200px]",
      isInTarget ? "border-emerald-200" : "border-red-200"
    )}>
      <CardContent className="p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <span className="font-semibold text-sm">{channel.label}</span>
        </div>

        <div className="text-center py-2">
          <span className={cn(
            "text-4xl font-bold",
            isInTarget ? "text-emerald-600" : "text-red-600"
          )}>
            {channel.conversionRate}%
          </span>
          <p className="text-xs text-muted-foreground mt-1">
            Target: {channel.targetRange[0]}–{channel.targetRange[1]}%
          </p>
        </div>

        <Badge
          variant="outline"
          className={cn(
            "self-start text-xs",
            isInTarget
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-red-50 text-red-700 border-red-200"
          )}
        >
          {isInTarget ? "In Range" : "Out of Range"}
        </Badge>

        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Weakness:</span> {channel.primaryWeakness}
        </p>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between text-xs"
          onClick={() => setExpanded(!expanded)}
        >
          Process Steps
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>

        {expanded && (
          <ol className="text-xs text-muted-foreground space-y-1.5 pl-4 list-decimal">
            {channel.processSteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}

export function ChannelConversion() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Channel Conversion</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          {mockSalesChannels.map((ch) => (
            <ChannelCard key={ch.channel} channel={ch} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
