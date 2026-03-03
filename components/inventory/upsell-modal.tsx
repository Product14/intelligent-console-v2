"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Sparkles,
  ImageIcon,
  Rocket,
  Phone,
  Bot,
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  ArrowRight,
  Shield,
  Zap,
  BarChart3,
  Video,
  CalendarCheck,
  Star,
  Camera,
  AlertTriangle,
} from "lucide-react"

type UpsellType = "upsell-cloning-campaign" | "upsell-vini-call" | "upsell-real-media"

interface UpsellModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: UpsellType
}

export function UpsellModal({ open, onOpenChange, type }: UpsellModalProps) {
  const [upgraded, setUpgraded] = React.useState(false)

  React.useEffect(() => {
    if (open) setUpgraded(false)
  }, [open])

  if (type === "upsell-cloning-campaign") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="p-0 overflow-hidden sm:max-w-[560px]">
          {!upgraded ? (
            <>
              {/* Header gradient */}
              <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-6 pt-6 pb-5 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/15 backdrop-blur-sm">
                    <Sparkles className="h-5 w-5" />
                    <span className="text-white/40 text-lg font-light">+</span>
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20">
                    Upgrade Available
                  </span>
                </div>
                <DialogHeader className="space-y-1.5 text-left">
                  <DialogTitle className="text-xl font-bold text-white">
                    Unlock AI Media Cloning & Campaigns
                  </DialogTitle>
                  <DialogDescription className="text-white/70 text-sm">
                    You're on the <span className="font-semibold text-white">Images Only</span> plan.
                    Upgrade to dramatically increase leads, engagement, and turn speed.
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="px-6 pb-6 pt-5 space-y-5">
                {/* What you're missing */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Features you're missing
                  </p>
                  <div className="space-y-3">
                    <FeatureCard
                      icon={<Sparkles className="h-5 w-5 text-violet-600" />}
                      iconBg="bg-violet-50"
                      title="AI Media Cloning"
                      description="Auto-generate studio-quality photos from a single image. Goes live in minutes, not days."
                      stats={[
                        { label: "Lead increase", value: "3×", color: "text-violet-700" },
                        { label: "CTR boost", value: "+180%", color: "text-violet-700" },
                      ]}
                    />
                    <FeatureCard
                      icon={<Rocket className="h-5 w-5 text-indigo-600" />}
                      iconBg="bg-indigo-50"
                      title="Campaign Activation"
                      description="Targeted social, search & display ads that drive qualified buyers directly to your VINs."
                      stats={[
                        { label: "Faster turns", value: "28%", color: "text-indigo-700" },
                        { label: "Margin protected", value: "22%", color: "text-indigo-700" },
                      ]}
                    />
                    <FeatureCard
                      icon={<Shield className="h-5 w-5 text-purple-600" />}
                      iconBg="bg-purple-50"
                      title="Velocity Dashboard"
                      description="Real-time margin tracking, AI-powered risk scoring, and automated acceleration recommendations."
                      stats={[
                        { label: "Avg velocity score", value: "85+", color: "text-purple-700" },
                        { label: "Capital saved", value: "$248K/mo", color: "text-purple-700" },
                      ]}
                    />
                  </div>
                </div>

                {/* Impact comparison */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-gray-50 border text-center">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Your current plan</p>
                    <p className="text-2xl font-bold text-gray-400">Images Only</p>
                    <p className="text-xs text-muted-foreground mt-1">Basic stock photos</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200 text-center">
                    <p className="text-[10px] font-medium text-indigo-600 uppercase tracking-wider mb-1">With upgrade</p>
                    <p className="text-2xl font-bold text-indigo-700">Cloning + Ads</p>
                    <p className="text-xs text-indigo-500 mt-1">3× leads, 28% faster turns</p>
                  </div>
                </div>

                {/* Social proof */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <Star className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  <p className="text-xs text-amber-800">
                    <span className="font-semibold">2,400+ dealers</span> upgraded this quarter — avg. ROI of <span className="font-bold">4.2× within 30 days</span>.
                  </p>
                </div>

                {/* CTA */}
                <Button
                  className="w-full h-12 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg"
                  onClick={() => setUpgraded(true)}
                >
                  Upgrade to Cloning + Campaigns
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <p className="text-[10px] text-center text-muted-foreground">
                  No long-term commitment · Activate instantly · Cancel anytime
                </p>
              </div>
            </>
          ) : (
            <UpgradeSuccess
              type="cloning-campaign"
              onClose={() => onOpenChange(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    )
  }

  if (type === "upsell-real-media") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="p-0 overflow-hidden sm:max-w-[560px]">
          {!upgraded ? (
            <>
              {/* Header gradient */}
              <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 px-6 pt-6 pb-5 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/15 backdrop-blur-sm">
                    <Camera className="h-5 w-5" />
                    <span className="text-white/40 text-lg font-light">→</span>
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20">
                    Trust Warning
                  </span>
                </div>
                <DialogHeader className="space-y-1.5 text-left">
                  <DialogTitle className="text-xl font-bold text-white">
                    Your Cloned Images Are Reducing Trust
                  </DialogTitle>
                  <DialogDescription className="text-white/70 text-sm">
                    AI-generated stock photos lose effectiveness after <span className="font-semibold text-white">14 days</span>.
                    Buyers can tell — and they bounce. Real photos build credibility and close deals faster.
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="px-6 pb-6 pt-5 space-y-5">
                {/* The trust problem */}
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="h-4 w-4 text-rose-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-rose-800">Why cloned images hurt over time</p>
                      <p className="text-xs text-rose-600 mt-0.5 leading-relaxed">
                        AI-generated photos are great for day-one listings, but buyers researching for 2+ weeks start comparing
                        your stock-looking images to competitors' real photos. This leads to lower CTR, fewer leads, and longer time on lot.
                      </p>
                    </div>
                  </div>
                </div>

                {/* What upgrading gives you */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Why real photos win
                  </p>
                  <div className="space-y-3">
                    <FeatureCard
                      icon={<Camera className="h-5 w-5 text-rose-600" />}
                      iconBg="bg-rose-50"
                      title="Authentic Vehicle Photos"
                      description="Real photos show the actual vehicle condition, color accuracy, and unique features — building instant buyer trust."
                      stats={[
                        { label: "More leads", value: "+24%", color: "text-rose-700" },
                        { label: "Higher CTR", value: "+38%", color: "text-rose-700" },
                      ]}
                    />
                    <FeatureCard
                      icon={<Users className="h-5 w-5 text-pink-600" />}
                      iconBg="bg-pink-50"
                      title="Buyer Trust & Engagement"
                      description="Shoppers spend 3.2× more time on listings with real photos and are 2× more likely to submit a lead."
                      stats={[
                        { label: "Engagement", value: "3.2×", color: "text-pink-700" },
                        { label: "Lead quality", value: "+45%", color: "text-pink-700" },
                      ]}
                    />
                    <FeatureCard
                      icon={<Clock className="h-5 w-5 text-fuchsia-600" />}
                      iconBg="bg-fuchsia-50"
                      title="Faster Inventory Turns"
                      description="Vehicles with real photos sell 18% faster on average — protecting margin and reducing holding costs."
                      stats={[
                        { label: "Faster turn", value: "18%", color: "text-fuchsia-700" },
                        { label: "Margin saved", value: "$680/VIN", color: "text-fuchsia-700" },
                      ]}
                    />
                  </div>
                </div>

                {/* Impact comparison */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-gray-50 border text-center">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Current state</p>
                    <p className="text-2xl font-bold text-gray-400">AI Clones</p>
                    <p className="text-xs text-muted-foreground mt-1">Aging, lower trust</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 text-center">
                    <p className="text-[10px] font-medium text-rose-600 uppercase tracking-wider mb-1">After upgrade</p>
                    <p className="text-2xl font-bold text-rose-700">Real Photos</p>
                    <p className="text-xs text-rose-500 mt-1">+24% leads, 18% faster</p>
                  </div>
                </div>

                {/* Social proof */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <Star className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  <p className="text-xs text-amber-800">
                    <span className="font-semibold">3,100+ vehicles</span> upgraded from clones to real photos this month — avg. <span className="font-bold">+6 leads per VIN within 7 days</span>.
                  </p>
                </div>

                {/* CTA */}
                <Button
                  className="w-full h-12 text-sm font-semibold bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-lg"
                  onClick={() => setUpgraded(true)}
                >
                  Upload Real Photos Now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <p className="text-[10px] text-center text-muted-foreground">
                  Upload from desktop or use the Spyne mobile app to shoot on-lot
                </p>
              </div>
            </>
          ) : (
            <UpgradeSuccess
              type="real-media"
              onClose={() => onOpenChange(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden sm:max-w-[560px]">
        {!upgraded ? (
          <>
            {/* Header gradient */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-6 pt-6 pb-5 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/15 backdrop-blur-sm">
                  <Phone className="h-5 w-5" />
                  <span className="text-white/40 text-lg font-light">+</span>
                  <Video className="h-5 w-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20">
                  New Feature
                </span>
              </div>
              <DialogHeader className="space-y-1.5 text-left">
                <DialogTitle className="text-xl font-bold text-white">
                  Add Vini AI Calls to Your Campaigns
                </DialogTitle>
                <DialogDescription className="text-white/70 text-sm">
                  You're on the <span className="font-semibold text-white">Studio Only</span> plan.
                  Your media is great — now supercharge it with AI voice outreach.
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="px-6 pb-6 pt-5 space-y-5">
              {/* What you're missing */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Features you're missing
                </p>
                <div className="space-y-3">
                  <FeatureCard
                    icon={<Bot className="h-5 w-5 text-emerald-600" />}
                    iconBg="bg-emerald-50"
                    title="Vini AI Voice Agent"
                    description="AI-powered outbound & inbound calling that engages leads, handles objections, and books appointments 24/7."
                    stats={[
                      { label: "More appointments", value: "+42%", color: "text-emerald-700" },
                      { label: "Lead-to-visit", value: "2.4×", color: "text-emerald-700" },
                    ]}
                  />
                  <FeatureCard
                    icon={<Zap className="h-5 w-5 text-teal-600" />}
                    iconBg="bg-teal-50"
                    title="Campaign + Voice Combo"
                    description="Digital ads warm up prospects, then Vini follows up with personalized calls — 47% better conversion together."
                    stats={[
                      { label: "Better CPA", value: "56%", color: "text-teal-700" },
                      { label: "Touchpoints", value: "3.1×", color: "text-teal-700" },
                    ]}
                  />
                  <FeatureCard
                    icon={<CalendarCheck className="h-5 w-5 text-cyan-600" />}
                    iconBg="bg-cyan-50"
                    title="Auto Appointment Booking"
                    description="Vini books test drives and showroom visits directly into your CRM — no manual follow-up needed."
                    stats={[
                      { label: "Show rate", value: "78%", color: "text-cyan-700" },
                      { label: "Time saved", value: "12h/wk", color: "text-cyan-700" },
                    ]}
                  />
                </div>
              </div>

              {/* Impact comparison */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-gray-50 border text-center">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Your current plan</p>
                  <p className="text-2xl font-bold text-gray-400">Studio Only</p>
                  <p className="text-xs text-muted-foreground mt-1">Great media, no outreach</p>
                </div>
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 text-center">
                  <p className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider mb-1">With Vini</p>
                  <p className="text-2xl font-bold text-emerald-700">Studio + Vini</p>
                  <p className="text-xs text-emerald-500 mt-1">42% more appointments</p>
                </div>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                <Star className="h-4 w-4 text-amber-500 flex-shrink-0" />
                <p className="text-xs text-amber-800">
                  <span className="font-semibold">1,800+ dealers</span> added Vini this quarter — avg. <span className="font-bold">+38 appointments/month</span> per dealership.
                </p>
              </div>

              {/* CTA */}
              <Button
                className="w-full h-12 text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
                onClick={() => setUpgraded(true)}
              >
                Add Vini AI Calls
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <p className="text-[10px] text-center text-muted-foreground">
                No long-term commitment · Activate in 2 hours · Cancel anytime
              </p>
            </div>
          </>
        ) : (
          <UpgradeSuccess
            type="vini-call"
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function FeatureCard({
  icon,
  iconBg,
  title,
  description,
  stats,
}: {
  icon: React.ReactNode
  iconBg: string
  title: string
  description: string
  stats: { label: string; value: string; color: string }[]
}) {
  return (
    <div className="flex gap-3 p-3.5 rounded-xl border bg-white hover:shadow-sm transition-shadow">
      <div className={cn("p-2 rounded-lg flex-shrink-0 self-start", iconBg)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
        <div className="flex items-center gap-4 mt-2">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span className={cn("text-xs font-bold", s.color)}>{s.value}</span>
              <span className="text-[10px] text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function UpgradeSuccess({
  type,
  onClose,
}: {
  type: "cloning-campaign" | "vini-call" | "real-media"
  onClose: () => void
}) {
  const isCloning = type === "cloning-campaign"
  const isRealMedia = type === "real-media"

  const colorClass = isRealMedia ? "rose" : isCloning ? "violet" : "emerald"
  const bgClass = isRealMedia ? "bg-rose-50" : isCloning ? "bg-violet-50" : "bg-emerald-50"
  const borderClass = isRealMedia ? "border-rose-100" : isCloning ? "border-violet-100" : "border-emerald-100"
  const iconColor = isRealMedia ? "text-rose-600" : isCloning ? "text-violet-600" : "text-emerald-600"
  const headingColor = isRealMedia ? "text-rose-800" : isCloning ? "text-violet-800" : "text-emerald-800"
  const checkColor = isRealMedia ? "text-rose-400" : isCloning ? "text-violet-400" : "text-emerald-400"
  const textColor = isRealMedia ? "text-rose-700" : isCloning ? "text-violet-700" : "text-emerald-700"
  const btnClass = isRealMedia ? "bg-rose-600 hover:bg-rose-700" : isCloning ? "bg-violet-600 hover:bg-violet-700" : "bg-emerald-600 hover:bg-emerald-700"

  return (
    <div className="p-8 space-y-6 text-center">
      <div className={cn("mx-auto w-16 h-16 rounded-full flex items-center justify-center", bgClass)}>
        <CheckCircle2 className={cn("h-8 w-8", iconColor)} />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold">
          {isRealMedia ? "Upload Started!" : isCloning ? "Upgrade Activated!" : "Vini AI Calls Activated!"}
        </h3>
        <p className="text-muted-foreground text-sm">
          {isRealMedia
            ? "Your real photos will replace the cloned images. Expect a lead boost within 48 hours."
            : isCloning
              ? "AI Media Cloning and Campaign tools are now enabled for your account."
              : "Vini AI voice agent is being configured and will start calling within 2 hours."
          }
        </p>
      </div>

      <div className={cn("p-4 rounded-xl border text-left space-y-2", bgClass, borderClass)}>
        <p className={cn("text-xs font-semibold uppercase tracking-wider", headingColor)}>
          What happens next
        </p>
        <div className="space-y-1.5">
          {(isRealMedia
            ? [
                "Upload real photos via desktop or the Spyne mobile app",
                "AI auto-enhances your photos — background removal, color correction, consistency",
                "New photos go live on all channels within minutes of upload",
                "Expect +24% leads and +38% CTR within 7 days of switching",
              ]
            : isCloning
              ? [
                  "AI Media Cloning is now processing your inventory — studio photos in minutes",
                  "Campaign tools are unlocked — activate campaigns from any vehicle row",
                  "Velocity Dashboard features fully enabled with real-time analytics",
                  "Your account manager will reach out within 24 hours for onboarding",
                ]
              : [
                  "Vini is learning your inventory, pricing, and dealership details",
                  "Voice campaigns will be available to activate within 2 hours",
                  "All appointments auto-sync to your CRM — no manual work needed",
                  "Your account manager will reach out to optimize your Vini script",
                ]
          ).map((item) => (
            <div key={item} className="flex items-start gap-2">
              <CheckCircle2 className={cn("h-3.5 w-3.5 mt-0.5 flex-shrink-0", checkColor)} />
              <span className={cn("text-xs", textColor)}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <Button
        className={cn("w-full h-11 text-white", btnClass)}
        onClick={onClose}
      >
        Got It — Let's Go
      </Button>
    </div>
  )
}
