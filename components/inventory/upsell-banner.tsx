"use client"

import { cn } from "@/lib/utils"
import { X, Sparkles, Phone, ArrowRight, ImageIcon, Video, Camera, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

type UpsellType = "upsell-cloning-campaign" | "upsell-vini-call" | "upsell-real-media"

interface UpsellBannerProps {
  type: UpsellType
  onDismiss: () => void
  onUpgrade: () => void
}

const upsells: Record<
  UpsellType,
  {
    gradient: string
    border: string
    icon1: React.ReactNode
    icon2: React.ReactNode
    headline: string
    subtitle: string
    features: { label: string; stat: string }[]
    ctaLabel: string
    ctaClass: string
  }
> = {
  "upsell-cloning-campaign": {
    gradient: "from-indigo-600 via-violet-600 to-purple-600",
    border: "border-indigo-200",
    icon1: <Sparkles className="h-5 w-5" />,
    icon2: <ImageIcon className="h-5 w-5" />,
    headline: "Unlock AI Media Cloning & Campaigns",
    subtitle:
      "You're on the Images Only plan. Dealers who upgrade to Media Cloning + Campaigns see dramatically better results.",
    features: [
      { label: "AI Media Cloning", stat: "3× more leads vs stock images" },
      { label: "Campaign Activation", stat: "28% faster inventory turns" },
      { label: "Combined Impact", stat: "22% more margin protected" },
    ],
    ctaLabel: "Upgrade to Media + Campaigns",
    ctaClass: "bg-white text-indigo-700 hover:bg-indigo-50",
  },
  "upsell-vini-call": {
    gradient: "from-emerald-600 via-teal-600 to-cyan-600",
    border: "border-emerald-200",
    icon1: <Phone className="h-5 w-5" />,
    icon2: <Video className="h-5 w-5" />,
    headline: "Supercharge Campaigns with Vini AI Calls",
    subtitle:
      "You're on the Studio Only plan. Add Vini AI Call to your campaigns and convert more leads into showroom visits.",
    features: [
      { label: "Vini AI Calls", stat: "42% more appointments booked" },
      { label: "Lead Follow-up", stat: "2.4× higher lead-to-visit rate" },
      { label: "Campaign ROI", stat: "56% better cost-per-acquisition" },
    ],
    ctaLabel: "Add Vini Call to Campaigns",
    ctaClass: "bg-white text-emerald-700 hover:bg-emerald-50",
  },
  "upsell-real-media": {
    gradient: "from-rose-600 via-pink-600 to-fuchsia-600",
    border: "border-rose-200",
    icon1: <Camera className="h-5 w-5" />,
    icon2: <AlertTriangle className="h-5 w-5" />,
    headline: "Your Cloned Images Are Hurting Trust",
    subtitle:
      "AI-generated photos lose effectiveness after 14 days. Buyers notice — and bounce. Upload real photos to regain credibility.",
    features: [
      { label: "Real Photos", stat: "24% more leads vs aged clones" },
      { label: "Buyer Trust", stat: "3.2× higher engagement" },
      { label: "Turn Speed", stat: "18% faster inventory turns" },
    ],
    ctaLabel: "Upload Real Media Now",
    ctaClass: "bg-white text-rose-700 hover:bg-rose-50",
  },
}

export function UpsellBanner({ type, onDismiss, onUpgrade }: UpsellBannerProps) {
  const config = upsells[type]
  if (!config) return null

  return (
    <div
      className={cn(
        "relative -mx-6 px-6 py-4 bg-gradient-to-r text-white overflow-hidden",
        config.gradient
      )}
    >
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ij48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnYtNGgydjRoNHYyaC00djRoLTJ2LTR6bS0yMi0yaC0ydi00aDJ2LTRoMnY0aDR2MmgtNHY0aC0ydi00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

      <div className="relative flex items-center gap-6">
        <div className="flex items-center gap-2 p-3 rounded-xl bg-white/15 backdrop-blur-sm flex-shrink-0">
          {config.icon1}
          <span className="text-white/40 text-lg font-light">+</span>
          {config.icon2}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-sm font-bold tracking-tight">
              {config.headline}
            </h3>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-white/20">
              Upgrade
            </span>
          </div>
          <p className="text-xs text-white/70 mb-2">{config.subtitle}</p>
          <div className="flex items-center gap-4">
            {config.features.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-1.5 text-[11px]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white/60 flex-shrink-0" />
                <span className="text-white/60">{f.label}:</span>
                <span className="font-semibold">{f.stat}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button size="sm" className={cn("h-9 gap-1.5 text-xs font-semibold shadow-lg", config.ctaClass)} onClick={onUpgrade}>
            {config.ctaLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg hover:bg-white/15 transition-colors"
          >
            <X className="h-4 w-4 text-white/60" />
          </button>
        </div>
      </div>
    </div>
  )
}
