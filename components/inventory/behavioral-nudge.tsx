"use client"

import { cn } from "@/lib/utils"
import { X, TrendingUp, Lightbulb, Zap, Camera } from "lucide-react"

interface BehavioralNudgeProps {
  type: "campaign-activation" | "media-upgrade" | "performance" | "upsell-cloning-campaign" | "upsell-vini-call" | "upsell-real-media"
  onDismiss: () => void
}

const nudges: Record<string, { icon: React.ReactNode; bg: string; border: string; textColor: string; message: string; stat: string }> = {
  "campaign-activation": {
    icon: <Zap className="h-4 w-4 text-blue-600" />,
    bg: "bg-blue-50",
    border: "border-blue-100",
    textColor: "text-blue-800",
    message: "Dealers with 80%+ campaign activation rate protect",
    stat: "22% more margin on average",
  },
  "media-upgrade": {
    icon: <TrendingUp className="h-4 w-4 text-violet-600" />,
    bg: "bg-violet-50",
    border: "border-violet-100",
    textColor: "text-violet-800",
    message: "Dealers who upgrade to Real Media before Day 15 see",
    stat: "18% faster turns and 24% more leads",
  },
  "performance": {
    icon: <Lightbulb className="h-4 w-4 text-amber-600" />,
    bg: "bg-amber-50",
    border: "border-amber-100",
    textColor: "text-amber-800",
    message: "Top-performing dealers on Velocity OS average",
    stat: "16 days to live vs. 24 day market average",
  },
  "upsell-cloning-campaign": {
    icon: <TrendingUp className="h-4 w-4 text-indigo-600" />,
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    textColor: "text-indigo-800",
    message: "Upgrade to AI Media Cloning + Campaigns — dealers who activate both see",
    stat: "3× more leads and 28% faster turns vs. images-only plans",
  },
  "upsell-vini-call": {
    icon: <Zap className="h-4 w-4 text-emerald-600" />,
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    textColor: "text-emerald-800",
    message: "Add Vini AI Call to your campaigns — dealers using Vini close",
    stat: "42% more appointments and 2.4× higher lead-to-visit conversion",
  },
  "upsell-real-media": {
    icon: <Camera className="h-4 w-4 text-rose-600" />,
    bg: "bg-rose-50",
    border: "border-rose-100",
    textColor: "text-rose-800",
    message: "Your cloned images are aging — stock-style photos reduce buyer trust. Dealers who switch to real photos see",
    stat: "24% more leads and 18% faster turns",
  },
}

export function BehavioralNudge({ type, onDismiss }: BehavioralNudgeProps) {
  const config = nudges[type]
  if (!config) return null

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl border",
      config.bg,
      config.border
    )}>
      <div className="flex-shrink-0">
        {config.icon}
      </div>
      <p className={cn("text-xs leading-relaxed flex-1", config.textColor)}>
        {config.message}{" "}
        <span className="font-bold">{config.stat}</span>.
      </p>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 p-1 rounded-md hover:bg-white/50 transition-colors"
      >
        <X className="h-3 w-3 text-muted-foreground" />
      </button>
    </div>
  )
}
