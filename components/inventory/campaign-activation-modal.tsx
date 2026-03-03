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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { StageBadge } from "./stage-badge"
import type { CampaignActivation, VehicleStage } from "@/services/inventory/inventory.types"
import {
  Shield,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Users,
  Clock,
  Sparkles,
  Loader2,
  Zap,
  Rocket,
  Target,
  BarChart3,
  Calendar,
  CreditCard,
  AlertTriangle,
  Settings2,
  Camera,
  Gauge,
  ArrowDownRight,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Pencil,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Type,
  Palette,
  Image as ImageIcon,
  Phone,
  PhoneOutgoing,
  PhoneIncoming,
  Headphones,
  Bot,
  Mic,
  MessageSquare,
  CalendarClock,
} from "lucide-react"

type UpsellMode = "upsell-cloning-campaign" | "upsell-vini-call" | "upsell-real-media" | null

interface CampaignActivationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: CampaignActivation | null
  vehicleName?: string
  stage?: VehicleStage
  daysInStock?: number
  dailyBurn?: number
  upsellMode?: UpsellMode
}

type CampaignTier = "standard" | "accelerated" | "maximum"
type CampaignType = "digital" | "voice-ai" | "both"

type ViniPersonality = "friendly" | "professional" | "energetic"
type ViniCampaignMode = "outbound" | "inbound" | "both"
type ViniSchedule = "business" | "extended" | "24/7"

interface ViniConfig {
  personality: ViniPersonality
  mode: ViniCampaignMode
  dailyCalls: number
  schedule: ViniSchedule
  scriptFocus: string[]
  greeting: string
}

const viniPersonalities: { id: ViniPersonality; name: string; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: "friendly", name: "Sarah", label: "Friendly", desc: "Warm, conversational tone that builds rapport quickly", icon: <Bot className="h-5 w-5" /> },
  { id: "professional", name: "James", label: "Professional", desc: "Polished, consultative approach for premium buyers", icon: <Headphones className="h-5 w-5" /> },
  { id: "energetic", name: "Maya", label: "Energetic", desc: "High-energy, enthusiastic style that creates urgency", icon: <Mic className="h-5 w-5" /> },
]

const viniScriptOptions = [
  { id: "feature-highlights", label: "Feature Highlights" },
  { id: "price-negotiation", label: "Price Negotiation" },
  { id: "urgency", label: "Urgency & Scarcity" },
  { id: "trade-in", label: "Trade-In Value" },
  { id: "financing", label: "Financing Options" },
  { id: "comparison", label: "Competitive Comparison" },
]

interface TierConfig {
  id: CampaignTier
  name: string
  description: string
  priceRange: string
  duration: string
  leadLiftMultiplier: number
  icon: React.ReactNode
  recommended?: boolean
  color: string
  borderColor: string
  bgColor: string
}

const stageTheme: Record<Exclude<VehicleStage, "fresh">, {
  accent: string
  accentBg: string
  accentBorder: string
  accentText: string
  buttonBg: string
  buttonHover: string
  progressColor: string
  icon: React.ReactNode
}> = {
  critical: {
    accent: "text-red-600",
    accentBg: "bg-red-50",
    accentBorder: "border-red-200",
    accentText: "text-red-800",
    buttonBg: "bg-red-500",
    buttonHover: "hover:bg-red-600",
    progressColor: "bg-red-500",
    icon: <Settings2 className="h-6 w-6 text-red-600" />,
  },
  risk: {
    accent: "text-orange-600",
    accentBg: "bg-orange-50",
    accentBorder: "border-orange-200",
    accentText: "text-orange-800",
    buttonBg: "bg-orange-500",
    buttonHover: "hover:bg-orange-600",
    progressColor: "bg-orange-500",
    icon: <Zap className="h-6 w-6 text-orange-600" />,
  },
  watch: {
    accent: "text-amber-600",
    accentBg: "bg-amber-50",
    accentBorder: "border-amber-200",
    accentText: "text-amber-800",
    buttonBg: "bg-amber-500",
    buttonHover: "hover:bg-amber-600",
    progressColor: "bg-amber-500",
    icon: <Sparkles className="h-6 w-6 text-amber-600" />,
  },
}

const stageHeadings: Record<Exclude<VehicleStage, "fresh">, {
  title: string
  subtitle: string
  ctaLabel: string
  step1Title: string
  step1Desc: (margin: string) => string
  benefits: string[]
}> = {
  critical: {
    title: "Optimize Now",
    subtitle: "Emergency margin protection for this vehicle",
    ctaLabel: "Start Optimization",
    step1Title: "Urgent — Margin Depleting Fast",
    step1Desc: (margin) =>
      `Only ${margin} margin left. Every day without action accelerates losses. This optimization package combines pricing, campaign, and media strategies.`,
    benefits: [
      "AI-powered dynamic price recommendation",
      "Immediate high-priority campaign activation",
      "Auto-upgrade media to Real for maximum conversion",
      "Real-time monitoring with daily margin alerts",
    ],
  },
  risk: {
    title: "Accelerate This Vehicle",
    subtitle: "Boost visibility and protect remaining margin",
    ctaLabel: "Choose Campaign Tier",
    step1Title: "Margin Eroding — Action Recommended",
    step1Desc: (margin) =>
      `${margin} margin remaining and declining. A targeted campaign will drive qualified leads and protect your investment.`,
    benefits: [
      "Increase visibility with targeted digital ads",
      "Drive qualified leads directly to this VIN",
      "AI-optimize audience based on your market data",
      "Track performance in real-time on your dashboard",
    ],
  },
  watch: {
    title: "Recommended Actions",
    subtitle: "Proactive steps to keep this vehicle on track",
    ctaLabel: "Choose Campaign Tier",
    step1Title: "Declining Velocity Detected",
    step1Desc: (margin) =>
      `This vehicle still has ${margin} margin, but velocity is slowing. A proactive campaign now can prevent it from entering risk stage.`,
    benefits: [
      "Stay ahead of margin erosion with early activation",
      "Targeted promotion to high-intent shoppers in your DMA",
      "AI audience targeting for maximum ROI",
      "Performance tracking from day one",
    ],
  },
}

function getTiers(effectiveStage: Exclude<VehicleStage, "fresh">): TierConfig[] {
  if (effectiveStage === "critical") {
    return [
      {
        id: "accelerated",
        name: "Full Optimization",
        description: "Price adjustment + multi-channel campaign + media upgrade bundle",
        priceRange: "$349–$449",
        duration: "21 days",
        leadLiftMultiplier: 2.2,
        icon: <Settings2 className="h-5 w-5" />,
        recommended: true,
        color: "text-red-700",
        borderColor: "border-red-200",
        bgColor: "bg-red-50",
      },
      {
        id: "maximum",
        name: "Maximum Velocity",
        description: "Full-funnel blitz — search, social, display, retargeting + price + media",
        priceRange: "$599–$699",
        duration: "30 days",
        leadLiftMultiplier: 3.0,
        icon: <Rocket className="h-5 w-5" />,
        color: "text-red-800",
        borderColor: "border-red-300",
        bgColor: "bg-red-50/70",
      },
      {
        id: "standard",
        name: "Campaign Only",
        description: "Targeted social + marketplace ads without price or media changes",
        priceRange: "$149–$199",
        duration: "14 days",
        leadLiftMultiplier: 1,
        icon: <Sparkles className="h-5 w-5" />,
        color: "text-gray-700",
        borderColor: "border-gray-200",
        bgColor: "bg-gray-50",
      },
    ]
  }

  return [
    {
      id: "standard",
      name: "Standard Boost",
      description: "Targeted social + marketplace ads in your DMA",
      priceRange: "$99–$149",
      duration: "14 days",
      leadLiftMultiplier: 1,
      icon: <Sparkles className="h-5 w-5" />,
      color: effectiveStage === "risk" ? "text-orange-700" : "text-amber-700",
      borderColor: effectiveStage === "risk" ? "border-orange-200" : "border-amber-200",
      bgColor: effectiveStage === "risk" ? "bg-orange-50" : "bg-amber-50",
    },
    {
      id: "accelerated",
      name: "Acceleration Pack",
      description: "Multi-channel campaign with AI audience targeting + retargeting",
      priceRange: "$249–$349",
      duration: "21 days",
      leadLiftMultiplier: 1.8,
      icon: <Zap className="h-5 w-5" />,
      recommended: true,
      color: "text-primary",
      borderColor: "border-primary/30",
      bgColor: "bg-primary/5",
    },
    {
      id: "maximum",
      name: "Maximum Velocity",
      description: "Full-funnel blitz — search, social, display, retargeting, email drip",
      priceRange: "$499–$599",
      duration: "30 days",
      leadLiftMultiplier: 2.6,
      icon: <Rocket className="h-5 w-5" />,
      color: effectiveStage === "risk" ? "text-orange-700" : "text-amber-700",
      borderColor: effectiveStage === "risk" ? "border-orange-200" : "border-amber-200",
      bgColor: effectiveStage === "risk" ? "bg-orange-50" : "bg-amber-50",
    },
  ]
}

export function CampaignActivationModal({
  open, onOpenChange, data, vehicleName, stage, daysInStock, dailyBurn, upsellMode,
}: CampaignActivationModalProps) {
  const effectiveStage: Exclude<VehicleStage, "fresh"> = stage === "critical" ? "critical" : stage === "risk" ? "risk" : "watch"
  const theme = stageTheme[effectiveStage]
  const headings = stageHeadings[effectiveStage]
  const tiers = getTiers(effectiveStage)

  const [step, setStep] = React.useState(1)
  const defaultTier = effectiveStage === "critical" ? "accelerated" : "accelerated"
  const [selectedTier, setSelectedTier] = React.useState<CampaignTier>(defaultTier)
  const [isActivating, setIsActivating] = React.useState(false)
  const [campaignType, setCampaignType] = React.useState<CampaignType>("digital")
  const [viniConfig, setViniConfig] = React.useState<ViniConfig>({
    personality: "friendly",
    mode: "both",
    dailyCalls: 25,
    schedule: "business",
    scriptFocus: ["feature-highlights", "urgency"],
    greeting: "",
  })

  const [overlay, setOverlay] = React.useState({
    content: "Special Offer",
    font: "Inter",
    align: "center" as "left" | "center" | "right",
    bold: true,
    italic: false,
    underline: false,
    strikethrough: false,
    textColor: "#ffffff",
    bgColor: "#032670",
    position: "bottom" as "top" | "bottom",
    opacity: 90,
  })
  const [activeTemplate, setActiveTemplate] = React.useState(0)
  const [previewIdx, setPreviewIdx] = React.useState(0)

  const overlayTemplates = [
    { label: "Discount", content: "Discount Overlay", bgColor: "#032670", textColor: "#ffffff" },
    { label: "Urgency", content: "Limited Time Only", bgColor: "#dc2626", textColor: "#ffffff" },
    { label: "New Price", content: "Price Reduced", bgColor: "#059669", textColor: "#ffffff" },
    { label: "Highlight", content: "Featured Vehicle", bgColor: "#7c3aed", textColor: "#ffffff" },
  ]

  const demoImages = [
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80",
    "https://images.unsplash.com/photo-1542362567-b07e54358753?w=600&q=80",
  ]

  React.useEffect(() => {
    if (open) {
      setStep(1)
      setSelectedTier(defaultTier)
      setCampaignType("digital")
      setViniConfig({
        personality: "friendly",
        mode: "both",
        dailyCalls: 25,
        schedule: "business",
        scriptFocus: ["feature-highlights", "urgency"],
        greeting: "",
      })
      setOverlay({
        content: "Special Offer",
        font: "Inter",
        align: "center",
        bold: true,
        italic: false,
        underline: false,
        strikethrough: false,
        textColor: "#ffffff",
        bgColor: "#032670",
        position: "bottom",
        opacity: 90,
      })
      setActiveTemplate(0)
      setPreviewIdx(0)
    }
  }, [open, defaultTier])

  if (!data) return null

  const tier = tiers.find((t) => t.id === selectedTier)!
  const adjustedLeadLift = Math.round(data.estimatedLeadLift * tier.leadLiftMultiplier)
  const adjustedMargin = Math.round(data.estimatedMarginProtection * tier.leadLiftMultiplier)
  const adjustedDays = Math.round(data.estimatedDaysSaved * (tier.leadLiftMultiplier * 0.7 + 0.3))

  const handleActivate = () => {
    setIsActivating(true)
    const successStep = campaignType === "voice-ai" ? 5 : 5
    setTimeout(() => {
      setIsActivating(false)
      setStep(successStep)
    }, 1800)
  }

  const hasDigital = campaignType === "digital" || campaignType === "both"
  const hasVoiceAI = campaignType === "voice-ai" || campaignType === "both"

  const viniPersonality = viniPersonalities.find(p => p.id === viniConfig.personality)!
  const viniExpectedCalls = viniConfig.dailyCalls * (tier.duration ? parseInt(tier.duration) : 14)
  const viniExpectedAppointments = Math.round(viniExpectedCalls * 0.12)
  const viniMarginProtected = Math.round(data ? data.estimatedMarginProtection * 1.4 : 0)
  const viniDaysSaved = Math.round(data ? data.estimatedDaysSaved * 1.2 : 0)

  const applyTemplate = (idx: number) => {
    setActiveTemplate(idx)
    const t = overlayTemplates[idx]
    setOverlay((prev) => ({ ...prev, content: t.content, bgColor: t.bgColor, textColor: t.textColor }))
  }

  const totalSteps = 5

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("p-0 overflow-hidden transition-all", step === 3 ? "sm:max-w-[820px]" : "sm:max-w-[540px]")}>
        {/* Progress bar */}
        <div className="flex h-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 transition-all duration-300",
                i < step ? theme.progressColor : "bg-gray-100"
              )}
            />
          ))}
        </div>

        <div className="p-6">
          {/* ── Step 1: Vehicle context — stage-specific ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className={cn("mx-auto w-12 h-12 rounded-full flex items-center justify-center", theme.accentBg)}>
                  {theme.icon}
                </div>
                <DialogHeader className="space-y-2">
                  <DialogTitle className="text-xl font-bold">{headings.title}</DialogTitle>
                  <DialogDescription className="text-base">
                    {headings.subtitle}
                  </DialogDescription>
                </DialogHeader>
              </div>

              {/* Vehicle card */}
              {vehicleName && (
                <div className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border",
                  effectiveStage === "critical" ? "bg-red-50/50 border-red-200" :
                  effectiveStage === "risk" ? "bg-orange-50/50 border-orange-200" :
                  "bg-gray-50 border-gray-200"
                )}>
                  <div className="w-14 h-10 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-[8px] text-gray-500 font-mono">IMG</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold truncate">{vehicleName}</p>
                      {stage && <StageBadge stage={stage} size="sm" />}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {daysInStock}d in stock · ${dailyBurn}/day burn · ${data.marginRemaining.toLocaleString()} margin left
                    </p>
                  </div>
                </div>
              )}

              {/* Upsell: Images Only Plan — Media Cloning + Campaign */}
              {upsellMode === "upsell-cloning-campaign" && (
                <div className="rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 overflow-hidden">
                  <div className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                    <span className="text-xs font-bold text-white tracking-wide">UPGRADE RECOMMENDED</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-sm font-bold text-indigo-900">Unlock AI Media Cloning + Campaigns</p>
                      <p className="text-xs text-indigo-600 mt-0.5">
                        You're on the Images Only plan. Upgrade to get AI-generated studio-quality media and targeted campaign activation.
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 rounded-lg bg-white/70 border border-indigo-100 text-center">
                        <ImageIcon className="h-3.5 w-3.5 text-indigo-500 mx-auto mb-1" />
                        <p className="text-[10px] font-bold text-indigo-800">AI Cloning</p>
                        <p className="text-[9px] text-indigo-500">3× more leads</p>
                      </div>
                      <div className="p-2 rounded-lg bg-white/70 border border-indigo-100 text-center">
                        <Rocket className="h-3.5 w-3.5 text-violet-500 mx-auto mb-1" />
                        <p className="text-[10px] font-bold text-indigo-800">Campaigns</p>
                        <p className="text-[9px] text-indigo-500">28% faster turns</p>
                      </div>
                      <div className="p-2 rounded-lg bg-white/70 border border-indigo-100 text-center">
                        <Shield className="h-3.5 w-3.5 text-purple-500 mx-auto mb-1" />
                        <p className="text-[10px] font-bold text-indigo-800">Margin</p>
                        <p className="text-[9px] text-indigo-500">22% protected</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="w-full h-8 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white"
                      onClick={() => setStep(2)}
                    >
                      Upgrade & Activate Campaign
                      <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Stage-specific alert for critical */}
              {effectiveStage === "critical" && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0 animate-pulse" />
                    <div>
                      <p className="text-sm font-semibold text-red-800">
                        {headings.step1Title}
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        {headings.step1Desc(`$${data.marginRemaining.toLocaleString()}`)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stage-specific alert for risk */}
              {effectiveStage === "risk" && (
                <div className="p-3 rounded-xl bg-orange-50 border border-orange-200">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-orange-800">
                        {headings.step1Title}
                      </p>
                      <p className="text-xs text-orange-600 mt-1">
                        {headings.step1Desc(`$${data.marginRemaining.toLocaleString()}`)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stage-specific info for watch */}
              {effectiveStage === "watch" && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="flex items-start gap-2.5">
                    <Gauge className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">
                        {headings.step1Title}
                      </p>
                      <p className="text-xs text-amber-600 mt-1">
                        {headings.step1Desc(`$${data.marginRemaining.toLocaleString()}`)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Optimization package breakdown (critical only) */}
              {effectiveStage === "critical" && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-center">
                    <DollarSign className="h-4 w-4 text-red-500 mx-auto mb-1" />
                    <p className="text-[11px] font-bold text-red-800">Price Optimize</p>
                    <p className="text-[10px] text-red-600">AI recommendation</p>
                  </div>
                  <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-center">
                    <Zap className="h-4 w-4 text-red-500 mx-auto mb-1" />
                    <p className="text-[11px] font-bold text-red-800">Campaign Blitz</p>
                    <p className="text-[10px] text-red-600">High-priority ads</p>
                  </div>
                  <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-center">
                    <Camera className="h-4 w-4 text-red-500 mx-auto mb-1" />
                    <p className="text-[11px] font-bold text-red-800">Media Upgrade</p>
                    <p className="text-[10px] text-red-600">Real photos</p>
                  </div>
                </div>
              )}

              {/* Benefits list (risk & watch) */}
              {effectiveStage !== "critical" && (
                <div className="p-4 rounded-xl bg-gray-50 border space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    {effectiveStage === "risk" ? "Campaign acceleration will:" : "A proactive campaign will:"}
                  </p>
                  <ul className="space-y-2">
                    {headings.benefits.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                className={cn("w-full h-11", theme.buttonBg, theme.buttonHover, "text-white")}
                onClick={() => setStep(2)}
              >
                {headings.ctaLabel}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {/* ── Step 2: Campaign type + Tier / VINI config ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className={cn("mx-auto w-12 h-12 rounded-full flex items-center justify-center", theme.accentBg)}>
                  <Target className={cn("h-6 w-6", theme.accent)} />
                </div>
                <DialogHeader className="space-y-2">
                  <DialogTitle className="text-xl font-bold">
                    {effectiveStage === "critical" ? "Choose Optimization Package" : "Choose Campaign Type"}
                  </DialogTitle>
                  <DialogDescription>
                    {effectiveStage === "critical"
                      ? "Select the level of intervention for this vehicle"
                      : "Select how you want to reach buyers for this vehicle"
                    }
                  </DialogDescription>
                </DialogHeader>
              </div>

              {/* Campaign type toggle */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setCampaignType("digital")}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center",
                    campaignType === "digital"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className={cn("p-1.5 rounded-lg", campaignType === "digital" ? "bg-primary/10" : "bg-gray-50")}>
                    <Rocket className={cn("h-4 w-4", campaignType === "digital" ? "text-primary" : "text-muted-foreground")} />
                  </div>
                  <div>
                    <p className={cn("text-sm font-bold", campaignType === "digital" ? "text-primary" : "text-foreground")}>Digital Ads</p>
                    <p className="text-[10px] text-muted-foreground">Social, search & display</p>
                  </div>
                </button>
                <button
                  onClick={() => setCampaignType("voice-ai")}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center",
                    campaignType === "voice-ai"
                      ? "border-violet-500 bg-violet-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className={cn("p-1.5 rounded-lg", campaignType === "voice-ai" ? "bg-violet-100" : "bg-gray-50")}>
                    <Phone className={cn("h-4 w-4", campaignType === "voice-ai" ? "text-violet-600" : "text-muted-foreground")} />
                  </div>
                  <div>
                    <p className={cn("text-sm font-bold", campaignType === "voice-ai" ? "text-violet-700" : "text-foreground")}>Voice AI</p>
                    <p className="text-[10px] text-muted-foreground">VINI calls</p>
                  </div>
                </button>
                <button
                  onClick={() => setCampaignType("both")}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center relative",
                    campaignType === "both"
                      ? "border-emerald-500 bg-emerald-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  {campaignType !== "both" && (
                    <span className="absolute -top-2 right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500 text-white">BEST</span>
                  )}
                  <div className={cn("p-1.5 rounded-lg", campaignType === "both" ? "bg-emerald-100" : "bg-gray-50")}>
                    <Zap className={cn("h-4 w-4", campaignType === "both" ? "text-emerald-600" : "text-muted-foreground")} />
                  </div>
                  <div>
                    <p className={cn("text-sm font-bold", campaignType === "both" ? "text-emerald-700" : "text-foreground")}>Both</p>
                    <p className="text-[10px] text-muted-foreground">Ads + VINI</p>
                  </div>
                </button>
              </div>

              {/* Upsell: Studio Only Plan — Vini Call on Campaigns */}
              {upsellMode === "upsell-vini-call" && (
                <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 overflow-hidden">
                  <div className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-white" />
                    <span className="text-xs font-bold text-white tracking-wide">NEW — VINI AI CALLS</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-sm font-bold text-emerald-900">Add Vini AI Call to Your Campaigns</p>
                      <p className="text-xs text-emerald-600 mt-0.5">
                        Your studio media is great — now supercharge it with AI-powered voice outreach that books appointments automatically.
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 rounded-lg bg-white/70 border border-emerald-100 text-center">
                        <Phone className="h-3.5 w-3.5 text-emerald-500 mx-auto mb-1" />
                        <p className="text-[10px] font-bold text-emerald-800">AI Calls</p>
                        <p className="text-[9px] text-emerald-500">42% more appts</p>
                      </div>
                      <div className="p-2 rounded-lg bg-white/70 border border-emerald-100 text-center">
                        <Users className="h-3.5 w-3.5 text-teal-500 mx-auto mb-1" />
                        <p className="text-[10px] font-bold text-emerald-800">Conversion</p>
                        <p className="text-[9px] text-emerald-500">2.4× visit rate</p>
                      </div>
                      <div className="p-2 rounded-lg bg-white/70 border border-emerald-100 text-center">
                        <DollarSign className="h-3.5 w-3.5 text-cyan-500 mx-auto mb-1" />
                        <p className="text-[10px] font-bold text-emerald-800">ROI</p>
                        <p className="text-[9px] text-emerald-500">56% better CPA</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-emerald-500 text-center">
                      Select <span className="font-bold">Voice AI</span> or <span className="font-bold">Both</span> above to add Vini to your campaign
                    </p>
                  </div>
                </div>
              )}

              {/* Digital: Tier selection */}
              {hasDigital && (
                <div className="space-y-2.5">
                  {tiers.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTier(t.id)}
                      className={cn(
                        "w-full text-left p-4 rounded-xl border-2 transition-all",
                        selectedTier === t.id
                          ? `${t.bgColor} ${t.borderColor} shadow-sm`
                          : "bg-white border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-2 rounded-lg flex-shrink-0",
                          selectedTier === t.id ? t.bgColor : "bg-gray-50"
                        )}>
                          <span className={selectedTier === t.id ? t.color : "text-muted-foreground"}>
                            {t.icon}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className={cn("text-sm font-bold", selectedTier === t.id ? t.color : "text-foreground")}>
                              {t.name}
                            </p>
                            {t.recommended && (
                              <span className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold text-white",
                                effectiveStage === "critical" ? "bg-red-500" :
                                effectiveStage === "risk" ? "bg-orange-500" : "bg-primary"
                              )}>
                                RECOMMENDED
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{t.description}</p>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <CreditCard className="h-3 w-3" />
                              {t.priceRange}
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {t.duration}
                            </span>
                            <span className="flex items-center gap-1 font-semibold text-emerald-600">
                              <TrendingUp className="h-3 w-3" />
                              {t.leadLiftMultiplier}x lead lift
                            </span>
                          </div>
                        </div>
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1",
                          selectedTier === t.id
                            ? cn(
                                "bg-primary border-primary",
                                effectiveStage === "critical" && "bg-red-500 border-red-500",
                                effectiveStage === "risk" && "bg-orange-500 border-orange-500",
                                effectiveStage === "watch" && "bg-amber-500 border-amber-500"
                              )
                            : "border-gray-300"
                        )}>
                          {selectedTier === t.id && (
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Divider when both selected */}
              {campaignType === "both" && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs font-medium text-muted-foreground">+ Voice AI (VINI)</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
              )}

              {/* Voice AI: VINI configuration */}
              {hasVoiceAI && (
                <div className="space-y-4">
                  {/* Agent personality */}
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground mb-2 block">VINI Agent Personality</Label>
                    <div className="space-y-2">
                      {viniPersonalities.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setViniConfig(c => ({ ...c, personality: p.id }))}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                            viniConfig.personality === p.id
                              ? "border-violet-300 bg-violet-50 shadow-sm"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          <div className={cn(
                            "p-2 rounded-lg flex-shrink-0",
                            viniConfig.personality === p.id ? "bg-violet-100" : "bg-gray-50"
                          )}>
                            <span className={viniConfig.personality === p.id ? "text-violet-600" : "text-muted-foreground"}>
                              {p.icon}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-sm font-bold", viniConfig.personality === p.id ? "text-violet-700" : "text-foreground")}>
                              {p.name} <span className="font-normal text-muted-foreground">· {p.label}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">{p.desc}</p>
                          </div>
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                            viniConfig.personality === p.id
                              ? "bg-violet-500 border-violet-500"
                              : "border-gray-300"
                          )}>
                            {viniConfig.personality === p.id && <CheckCircle2 className="h-3 w-3 text-white" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Campaign mode */}
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground mb-2 block">Campaign Mode</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { id: "outbound" as const, label: "Outbound", desc: "Call prospects", icon: <PhoneOutgoing className="h-4 w-4" /> },
                        { id: "inbound" as const, label: "Inbound", desc: "Handle inquiries", icon: <PhoneIncoming className="h-4 w-4" /> },
                        { id: "both" as const, label: "Both", desc: "Full coverage", icon: <Phone className="h-4 w-4" /> },
                      ]).map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setViniConfig(c => ({ ...c, mode: m.id }))}
                          className={cn(
                            "p-3 rounded-xl border-2 text-center transition-all",
                            viniConfig.mode === m.id
                              ? "border-violet-300 bg-violet-50"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          <span className={cn("mx-auto block w-fit mb-1", viniConfig.mode === m.id ? "text-violet-600" : "text-muted-foreground")}>
                            {m.icon}
                          </span>
                          <p className={cn("text-xs font-bold", viniConfig.mode === m.id ? "text-violet-700" : "text-foreground")}>{m.label}</p>
                          <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Daily call volume */}
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Daily Call Volume <span className="text-violet-600 font-bold">{viniConfig.dailyCalls} calls/day</span>
                    </Label>
                    <Slider
                      value={[viniConfig.dailyCalls]}
                      onValueChange={([v]) => setViniConfig(c => ({ ...c, dailyCalls: v }))}
                      min={5}
                      max={100}
                      step={5}
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>5/day</span>
                      <span>100/day</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 h-11 gap-2" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  className={cn(
                    "flex-1 h-11 text-white",
                    campaignType === "voice-ai"
                      ? "bg-violet-600 hover:bg-violet-700"
                      : campaignType === "both"
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : cn(theme.buttonBg, theme.buttonHover)
                  )}
                  onClick={() => setStep(3)}
                >
                  {campaignType === "digital" ? "Customize Creative" : campaignType === "voice-ai" ? "Configure Script" : "Customize Campaign"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 3: Creative Editor (Digital) / Script Config (Voice AI) / Both ── */}
          {step === 3 && campaignType === "voice-ai" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-full flex items-center justify-center bg-violet-50">
                  <MessageSquare className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <DialogHeader className="space-y-0 text-left">
                    <DialogTitle className="text-lg font-bold">Configure VINI Script</DialogTitle>
                    <DialogDescription className="text-sm">
                      Set the schedule, talking points, and greeting for your voice campaign
                    </DialogDescription>
                  </DialogHeader>
                </div>
              </div>

              {/* Schedule */}
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-2 block">Calling Schedule</Label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: "business" as const, label: "Business Hours", desc: "9 AM – 6 PM", icon: <Clock className="h-4 w-4" /> },
                    { id: "extended" as const, label: "Extended", desc: "8 AM – 9 PM", icon: <CalendarClock className="h-4 w-4" /> },
                    { id: "24/7" as const, label: "24/7", desc: "Always on", icon: <Headphones className="h-4 w-4" /> },
                  ]).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setViniConfig(c => ({ ...c, schedule: s.id }))}
                      className={cn(
                        "p-3 rounded-xl border-2 text-center transition-all",
                        viniConfig.schedule === s.id
                          ? "border-violet-300 bg-violet-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <span className={cn("mx-auto block w-fit mb-1", viniConfig.schedule === s.id ? "text-violet-600" : "text-muted-foreground")}>
                        {s.icon}
                      </span>
                      <p className={cn("text-xs font-bold", viniConfig.schedule === s.id ? "text-violet-700" : "text-foreground")}>{s.label}</p>
                      <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Script focus chips */}
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-2 block">Script Talking Points</Label>
                <div className="flex flex-wrap gap-2">
                  {viniScriptOptions.map((opt) => {
                    const selected = viniConfig.scriptFocus.includes(opt.id)
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setViniConfig(c => ({
                          ...c,
                          scriptFocus: selected
                            ? c.scriptFocus.filter(f => f !== opt.id)
                            : [...c.scriptFocus, opt.id]
                        }))}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                          selected
                            ? "border-violet-300 bg-violet-50 text-violet-700"
                            : "border-gray-200 text-muted-foreground hover:border-gray-300"
                        )}
                      >
                        {selected && <CheckCircle2 className="h-3 w-3 inline mr-1" />}
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Custom greeting */}
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Custom Opening Line <span className="text-muted-foreground/60">(optional)</span>
                </Label>
                <Input
                  value={viniConfig.greeting}
                  onChange={(e) => setViniConfig(c => ({ ...c, greeting: e.target.value }))}
                  placeholder={`Hi, this is ${viniPersonality.name} from your dealership...`}
                  className="h-9 text-sm"
                />
              </div>

              {/* VINI preview card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5 text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-violet-800">VINI · {viniPersonality.name}</p>
                    <p className="text-xs text-violet-600 mt-0.5">
                      {viniConfig.greeting || `"Hi, this is ${viniPersonality.name}. I'm reaching out about the ${vehicleName || "vehicle"} — are you still in the market?"`}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-violet-500">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {viniConfig.dailyCalls} calls/day
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {viniConfig.schedule === "business" ? "9AM–6PM" : viniConfig.schedule === "extended" ? "8AM–9PM" : "24/7"}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {viniConfig.scriptFocus.length} topics
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <Button variant="outline" className="flex-1 h-10 gap-2" onClick={() => setStep(2)}>
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  className="flex-1 h-10 bg-violet-600 hover:bg-violet-700 text-white"
                  onClick={() => setStep(4)}
                >
                  Preview Impact
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Both — Creative editor + VINI script */}
          {step === 3 && campaignType === "both" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-full flex items-center justify-center bg-emerald-50">
                  <Zap className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <DialogHeader className="space-y-0 text-left">
                    <DialogTitle className="text-lg font-bold">Customize Campaign</DialogTitle>
                    <DialogDescription className="text-sm">
                      Configure your ad creative and VINI voice script
                    </DialogDescription>
                  </DialogHeader>
                </div>
              </div>

              {/* Ad creative compact preview */}
              <div className="p-3 rounded-xl border bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <Palette className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-bold text-foreground">Ad Creative</span>
                </div>
                <div className="flex gap-3">
                  <div className="relative w-28 h-20 rounded-lg overflow-hidden border bg-gray-100 flex-shrink-0">
                    <img
                      src={demoImages[0]}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute left-0 right-0 bottom-0 px-2 py-1"
                      style={{ backgroundColor: overlay.bgColor, opacity: overlay.opacity / 100 }}
                    >
                      <p className="text-[8px] font-bold tracking-wide" style={{ color: overlay.textColor, textAlign: overlay.align }}>
                        {overlay.content.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <Label className="text-[10px] font-medium text-muted-foreground mb-1 block">Banner Text</Label>
                      <Input
                        value={overlay.content}
                        onChange={(e) => setOverlay((p) => ({ ...p, content: e.target.value }))}
                        className="h-7 text-xs"
                      />
                    </div>
                    <div className="flex gap-2">
                      {overlayTemplates.map((t, i) => (
                        <button
                          key={i}
                          onClick={() => applyTemplate(i)}
                          className={cn(
                            "px-2 py-1 rounded text-[10px] font-medium border transition-all",
                            activeTemplate === i
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-gray-200 text-muted-foreground hover:border-gray-300"
                          )}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs font-medium text-muted-foreground">VINI Voice Script</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* VINI script config (compact) */}
              <div className="space-y-3">
                {/* Schedule */}
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Calling Schedule</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { id: "business" as const, label: "Business", desc: "9AM–6PM" },
                      { id: "extended" as const, label: "Extended", desc: "8AM–9PM" },
                      { id: "24/7" as const, label: "24/7", desc: "Always on" },
                    ]).map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setViniConfig(c => ({ ...c, schedule: s.id }))}
                        className={cn(
                          "p-2 rounded-lg border text-center transition-all",
                          viniConfig.schedule === s.id
                            ? "border-violet-300 bg-violet-50"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <p className={cn("text-xs font-bold", viniConfig.schedule === s.id ? "text-violet-700" : "text-foreground")}>{s.label}</p>
                        <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Script focus chips */}
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Talking Points</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {viniScriptOptions.map((opt) => {
                      const selected = viniConfig.scriptFocus.includes(opt.id)
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setViniConfig(c => ({
                            ...c,
                            scriptFocus: selected
                              ? c.scriptFocus.filter(f => f !== opt.id)
                              : [...c.scriptFocus, opt.id]
                          }))}
                          className={cn(
                            "px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all",
                            selected
                              ? "border-violet-300 bg-violet-50 text-violet-700"
                              : "border-gray-200 text-muted-foreground hover:border-gray-300"
                          )}
                        >
                          {selected && <CheckCircle2 className="h-2.5 w-2.5 inline mr-0.5" />}
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <Button variant="outline" className="flex-1 h-10 gap-2" onClick={() => setStep(2)}>
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => setStep(4)}
                >
                  Preview Impact
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && campaignType === "digital" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-1">
                <div className={cn("w-9 h-9 rounded-full flex items-center justify-center", theme.accentBg)}>
                  <Palette className={cn("h-4 w-4", theme.accent)} />
                </div>
                <div>
                  <DialogHeader className="space-y-0 text-left">
                    <DialogTitle className="text-lg font-bold">Edit Campaign Creative</DialogTitle>
                    <DialogDescription className="text-sm">
                      Customize the overlay banner for your campaign images
                    </DialogDescription>
                  </DialogHeader>
                </div>
              </div>

              <div className="flex gap-5">
                {/* Left: Controls */}
                <div className="w-[280px] flex-shrink-0 space-y-4">
                  {/* Template selector */}
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Editing for:</Label>
                    <div className="flex gap-1.5">
                      {overlayTemplates.map((t, i) => (
                        <button
                          key={i}
                          onClick={() => applyTemplate(i)}
                          className={cn(
                            "px-2.5 py-1.5 rounded-md text-[11px] font-medium border transition-all",
                            activeTemplate === i
                              ? "border-primary bg-primary/5 text-primary shadow-sm"
                              : "border-gray-200 text-muted-foreground hover:border-gray-300"
                          )}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Content</Label>
                    <Input
                      value={overlay.content}
                      onChange={(e) => setOverlay((p) => ({ ...p, content: e.target.value }))}
                      className="h-9 text-sm"
                    />
                  </div>

                  {/* Font + formatting */}
                  <div>
                    <div className="flex items-center gap-2">
                      <Select value={overlay.font} onValueChange={(v) => setOverlay((p) => ({ ...p, font: v }))}>
                        <SelectTrigger className="w-[100px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Arial">Arial</SelectItem>
                          <SelectItem value="Georgia">Georgia</SelectItem>
                          <SelectItem value="Mono">Mono</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="flex items-center border rounded-md overflow-hidden">
                        {([
                          { key: "left", icon: <AlignLeft className="h-3.5 w-3.5" /> },
                          { key: "center", icon: <AlignCenter className="h-3.5 w-3.5" /> },
                          { key: "right", icon: <AlignRight className="h-3.5 w-3.5" /> },
                        ] as const).map((a) => (
                          <button
                            key={a.key}
                            onClick={() => setOverlay((p) => ({ ...p, align: a.key }))}
                            className={cn(
                              "p-1.5 transition-colors",
                              overlay.align === a.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-gray-100"
                            )}
                          >
                            {a.icon}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center border rounded-md overflow-hidden">
                        {([
                          { key: "bold" as const, icon: <Bold className="h-3.5 w-3.5" /> },
                          { key: "italic" as const, icon: <Italic className="h-3.5 w-3.5" /> },
                          { key: "underline" as const, icon: <Underline className="h-3.5 w-3.5" /> },
                          { key: "strikethrough" as const, icon: <Strikethrough className="h-3.5 w-3.5" /> },
                        ]).map((f) => (
                          <button
                            key={f.key}
                            onClick={() => setOverlay((p) => ({ ...p, [f.key]: !p[f.key] }))}
                            className={cn(
                              "p-1.5 transition-colors",
                              overlay[f.key] ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-gray-100"
                            )}
                          >
                            {f.icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Text Color</Label>
                      <div className="flex items-center gap-2 border rounded-md px-2 py-1.5">
                        <input
                          type="color"
                          value={overlay.textColor}
                          onChange={(e) => setOverlay((p) => ({ ...p, textColor: e.target.value }))}
                          className="w-6 h-6 rounded border-0 cursor-pointer p-0"
                        />
                        <span className="text-xs text-muted-foreground font-mono">{overlay.textColor}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">BG Color</Label>
                      <div className="flex items-center gap-2 border rounded-md px-2 py-1.5">
                        <input
                          type="color"
                          value={overlay.bgColor}
                          onChange={(e) => setOverlay((p) => ({ ...p, bgColor: e.target.value }))}
                          className="w-6 h-6 rounded border-0 cursor-pointer p-0"
                        />
                        <span className="text-xs text-muted-foreground font-mono">{overlay.bgColor}</span>
                      </div>
                    </div>
                  </div>

                  {/* Position + Opacity */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Banner Position</Label>
                      <Select value={overlay.position} onValueChange={(v: "top" | "bottom") => setOverlay((p) => ({ ...p, position: v }))}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top">Top</SelectItem>
                          <SelectItem value="bottom">Bottom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        Opacity <span className="text-muted-foreground/60">{overlay.opacity}%</span>
                      </Label>
                      <Slider
                        value={[overlay.opacity]}
                        onValueChange={([v]) => setOverlay((p) => ({ ...p, opacity: v }))}
                        min={20}
                        max={100}
                        step={5}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  {/* Apply to images */}
                  <div className="pt-1 border-t">
                    <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Apply to Image Positions</Label>
                    <div className="flex gap-1.5">
                      {demoImages.map((src, i) => (
                        <button
                          key={i}
                          className={cn(
                            "w-14 h-10 rounded-md border-2 overflow-hidden transition-all",
                            previewIdx === i ? "border-primary shadow-sm" : "border-gray-200 opacity-60 hover:opacity-100"
                          )}
                          onClick={() => setPreviewIdx(i)}
                        >
                          <img src={src} alt={`Position ${i + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Live Preview */}
                <div className="flex-1 min-w-0">
                  <div className="relative rounded-xl overflow-hidden border bg-gray-100 aspect-[4/3]">
                    {/* Edit badge */}
                    <button className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-md shadow-sm border text-xs font-medium hover:bg-gray-50 transition-colors">
                      <Pencil className="h-3 w-3" />
                      Edit
                    </button>

                    {/* Nav arrows */}
                    <button
                      onClick={() => setPreviewIdx((i) => (i === 0 ? demoImages.length - 1 : i - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setPreviewIdx((i) => (i === demoImages.length - 1 ? 0 : i + 1))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow hover:bg-white transition-colors"
                    >
                      <ChevronRightIcon className="h-4 w-4" />
                    </button>

                    {/* Vehicle image */}
                    <img
                      src={demoImages[previewIdx]}
                      alt="Vehicle preview"
                      className="w-full h-full object-cover"
                    />

                    {/* Banner overlay */}
                    <div
                      className={cn("absolute left-0 right-0 px-4 py-3", overlay.position === "top" ? "top-0" : "bottom-0")}
                      style={{
                        backgroundColor: overlay.bgColor,
                        opacity: overlay.opacity / 100,
                      }}
                    >
                      <p
                        className="text-sm tracking-wide"
                        style={{
                          color: overlay.textColor,
                          fontFamily: overlay.font === "Mono" ? "monospace" : overlay.font,
                          textAlign: overlay.align,
                          fontWeight: overlay.bold ? 700 : 400,
                          fontStyle: overlay.italic ? "italic" : "normal",
                          textDecoration: [
                            overlay.underline ? "underline" : "",
                            overlay.strikethrough ? "line-through" : "",
                          ].filter(Boolean).join(" ") || "none",
                        }}
                      >
                        {overlay.content.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* Thumbnail strip */}
                  <div className="flex items-center gap-2 mt-3 justify-center">
                    {demoImages.map((src, i) => (
                      <button
                        key={i}
                        onClick={() => setPreviewIdx(i)}
                        className={cn(
                          "relative w-16 h-11 rounded-md overflow-hidden border-2 transition-all",
                          previewIdx === i ? "border-primary shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                        )}
                      >
                        <img src={src} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                        {previewIdx === i && (
                          <div className="absolute inset-0 bg-primary/10" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <Button variant="outline" className="flex-1 h-10 gap-2" onClick={() => setStep(2)}>
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  className={cn("flex-1 h-10", theme.buttonBg, theme.buttonHover, "text-white")}
                  onClick={() => setStep(4)}
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 4: Expected impact — Both ── */}
          {step === 4 && campaignType === "both" && (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-emerald-600" />
                </div>
                <DialogHeader className="space-y-2">
                  <DialogTitle className="text-xl font-bold">Combined Impact</DialogTitle>
                  <DialogDescription>
                    Projected results with <span className="font-semibold text-foreground">{tier.name}</span> + <span className="font-semibold text-foreground">VINI · {viniPersonality.name}</span>
                  </DialogDescription>
                </DialogHeader>
              </div>

              {/* Config summaries side by side */}
              <div className="grid grid-cols-2 gap-2">
                <div className={cn("p-3 rounded-xl border flex items-center gap-2.5", tier.bgColor, tier.borderColor)}>
                  <span className={tier.color}>{tier.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-xs font-bold", tier.color)}>{tier.name}</p>
                    <p className="text-[10px] text-muted-foreground">{tier.priceRange} · {tier.duration}</p>
                  </div>
                  <button onClick={() => setStep(2)} className="text-[10px] text-primary font-medium hover:underline">Edit</button>
                </div>
                <div className="p-3 rounded-xl border border-violet-200 bg-violet-50 flex items-center gap-2.5">
                  <Bot className="h-4 w-4 text-violet-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-violet-700">VINI · {viniPersonality.name}</p>
                    <p className="text-[10px] text-violet-600">{viniConfig.dailyCalls}/day · {viniConfig.schedule === "business" ? "9–6" : viniConfig.schedule === "extended" ? "8–9" : "24/7"}</p>
                  </div>
                  <button onClick={() => setStep(2)} className="text-[10px] text-violet-600 font-medium hover:underline">Edit</button>
                </div>
              </div>

              {/* Combined impact metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-center">
                  <Users className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-800">+{adjustedLeadLift + viniExpectedAppointments}</p>
                  <p className="text-[11px] text-blue-600 mt-0.5">Total Leads & Appts</p>
                  <p className="text-[9px] text-blue-400 mt-0.5">{adjustedLeadLift} ads + {viniExpectedAppointments} VINI</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                  <DollarSign className="h-5 w-5 text-emerald-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-emerald-800">
                    ${(adjustedMargin + viniMarginProtected).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-emerald-600 mt-0.5">Total Margin Protected</p>
                  <p className="text-[9px] text-emerald-400 mt-0.5">${adjustedMargin.toLocaleString()} ads + ${viniMarginProtected.toLocaleString()} VINI</p>
                </div>
                <div className="p-4 rounded-xl bg-violet-50 border border-violet-100 text-center">
                  <Phone className="h-5 w-5 text-violet-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-violet-800">{viniConfig.dailyCalls * 14}</p>
                  <p className="text-[11px] text-violet-600 mt-0.5">VINI Calls</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-center">
                  <Clock className="h-5 w-5 text-amber-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-amber-800">{Math.max(adjustedDays, viniDaysSaved)}d</p>
                  <p className="text-[11px] text-amber-600 mt-0.5">Faster Turn</p>
                </div>
              </div>

              {/* Combined advantage callout */}
              <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-violet-50 border border-emerald-200 flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold text-emerald-800">Multi-channel advantage:</span>{" "}
                  <span className="text-emerald-700">
                    Combining digital ads with VINI voice outreach creates 3.1x more touchpoints. Prospects who see an ad and receive a call convert 47% better.
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 h-11 gap-2" onClick={() => setStep(3)}>
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleActivate}
                  disabled={isActivating}
                >
                  {isActivating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Activating...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Launch Both Campaigns
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 4: Expected impact — Voice AI only ── */}
          {step === 4 && campaignType === "voice-ai" && (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-violet-600" />
                </div>
                <DialogHeader className="space-y-2">
                  <DialogTitle className="text-xl font-bold">Expected Impact</DialogTitle>
                  <DialogDescription>
                    Projected results with <span className="font-semibold text-foreground">VINI Voice AI · {viniPersonality.name}</span>
                  </DialogDescription>
                </DialogHeader>
              </div>

              {/* VINI config summary */}
              <div className="p-3 rounded-xl border border-violet-200 bg-violet-50 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-violet-800">VINI · {viniPersonality.name}</p>
                  <p className="text-xs text-violet-600">
                    {viniConfig.mode === "both" ? "Outbound + Inbound" : viniConfig.mode === "outbound" ? "Outbound Only" : "Inbound Only"} · {viniConfig.dailyCalls} calls/day · {viniConfig.schedule === "business" ? "Business Hours" : viniConfig.schedule === "extended" ? "Extended Hours" : "24/7"}
                  </p>
                </div>
                <button onClick={() => setStep(2)} className="text-xs text-violet-600 font-medium hover:underline">
                  Change
                </button>
              </div>

              {/* Impact metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-violet-50 border border-violet-100 text-center">
                  <Phone className="h-5 w-5 text-violet-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-violet-800">{viniConfig.dailyCalls * 14}</p>
                  <p className="text-[11px] text-violet-600 mt-0.5">Total Calls (14 days)</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-center">
                  <Calendar className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-800">{viniExpectedAppointments}</p>
                  <p className="text-[11px] text-blue-600 mt-0.5">Expected Appointments</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                  <DollarSign className="h-5 w-5 text-emerald-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-emerald-800">${viniMarginProtected.toLocaleString()}</p>
                  <p className="text-[11px] text-emerald-600 mt-0.5">Margin Protected</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-center">
                  <Clock className="h-5 w-5 text-amber-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-amber-800">{viniDaysSaved}d</p>
                  <p className="text-[11px] text-amber-600 mt-0.5">Faster Turn</p>
                </div>
              </div>

              {/* VINI advantage callout */}
              <div className="p-3 rounded-lg bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-violet-500 flex-shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold text-violet-800">VINI advantage:</span>{" "}
                  <span className="text-violet-600">
                    Voice AI campaigns convert 2.4x better than cold digital ads. VINI handles objections in real-time and books appointments directly.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-gray-50 border text-xs text-muted-foreground">
                <p>
                  Based on VINI performance across similar vehicles in your DMA. Voice campaign activates within 2 hours of confirmation.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 h-11 gap-2" onClick={() => setStep(3)}>
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  className="flex-1 h-11 bg-violet-600 hover:bg-violet-700 text-white"
                  onClick={handleActivate}
                  disabled={isActivating}
                >
                  {isActivating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Activating VINI...
                    </>
                  ) : (
                    <>
                      <Phone className="h-4 w-4 mr-2" />
                      Launch Voice Campaign
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === 4 && campaignType === "digital" && (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-emerald-600" />
                </div>
                <DialogHeader className="space-y-2">
                  <DialogTitle className="text-xl font-bold">Expected Impact</DialogTitle>
                  <DialogDescription>
                    Projected results with <span className="font-semibold text-foreground">{tier.name}</span>
                  </DialogDescription>
                </DialogHeader>
              </div>

              {/* Selected tier + creative summary */}
              <div className="flex gap-2">
                <div className={cn("flex-1 p-3 rounded-xl border flex items-center gap-3", tier.bgColor, tier.borderColor)}>
                  <span className={tier.color}>{tier.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-bold", tier.color)}>{tier.name}</p>
                    <p className="text-xs text-muted-foreground">{tier.priceRange} · {tier.duration}</p>
                  </div>
                  <button onClick={() => setStep(2)} className="text-xs text-primary font-medium hover:underline">
                    Change
                  </button>
                </div>
                <div className="p-3 rounded-xl border bg-gray-50 border-gray-200 flex items-center gap-2.5">
                  <div
                    className="w-8 h-6 rounded flex items-center justify-center text-[6px] font-bold tracking-wider"
                    style={{ backgroundColor: overlay.bgColor, color: overlay.textColor }}
                  >
                    Aa
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate max-w-[90px]">{overlay.content}</p>
                    <p className="text-[10px] text-muted-foreground">Creative</p>
                  </div>
                  <button onClick={() => setStep(3)} className="text-xs text-primary font-medium hover:underline">
                    Edit
                  </button>
                </div>
              </div>

              {/* Impact metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-center">
                  <Users className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-800">+{adjustedLeadLift}</p>
                  <p className="text-[11px] text-blue-600 mt-0.5">Additional Leads</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                  <DollarSign className="h-5 w-5 text-emerald-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-emerald-800">
                    ${adjustedMargin.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-emerald-600 mt-0.5">Margin Protected</p>
                </div>
                <div className="p-4 rounded-xl bg-violet-50 border border-violet-100 text-center">
                  <Clock className="h-5 w-5 text-violet-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-violet-800">{adjustedDays}d</p>
                  <p className="text-[11px] text-violet-600 mt-0.5">Faster Turn</p>
                </div>
              </div>

              {/* Critical-specific daily savings callout */}
              {effectiveStage === "critical" && dailyBurn && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 flex items-center gap-3">
                  <ArrowDownRight className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <div className="text-xs">
                    <span className="font-semibold text-red-800">Stop the bleeding:</span>{" "}
                    <span className="text-red-600">
                      Currently losing ${dailyBurn}/day. This package is projected to save ${(dailyBurn * adjustedDays).toLocaleString()} in holding costs.
                    </span>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-lg bg-gray-50 border text-xs text-muted-foreground">
                <p>
                  Based on performance of similar vehicles in your DMA.{" "}
                  {effectiveStage === "critical"
                    ? "Optimization activates within 4 hours of confirmation — priority processing."
                    : "Campaign activates within 24 hours of confirmation."
                  }
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 h-11 gap-2" onClick={() => setStep(3)}>
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  className={cn(
                    "flex-1 h-11",
                    effectiveStage === "critical"
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-emerald-600 hover:bg-emerald-700",
                    "text-white"
                  )}
                  onClick={handleActivate}
                  disabled={isActivating}
                >
                  {isActivating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {effectiveStage === "critical" ? "Optimizing..." : "Activating..."}
                    </>
                  ) : (
                    <>
                      {effectiveStage === "critical"
                        ? <Settings2 className="h-4 w-4 mr-2" />
                        : <Sparkles className="h-4 w-4 mr-2" />
                      }
                      {effectiveStage === "critical" ? "Confirm & Optimize" : "Confirm & Activate"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 5: Success — Both ── */}
          {step === 5 && campaignType === "both" && (
            <div className="space-y-6 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Dual Campaign Activated</h3>
                <p className="text-muted-foreground">
                  Your <span className="font-semibold text-foreground">{tier.name}</span> digital campaign and <span className="font-semibold text-foreground">VINI · {viniPersonality.name}</span> voice campaign are being configured.
                </p>
              </div>

              {vehicleName && (
                <div className="p-3 rounded-xl bg-gray-50 border flex items-center gap-3 text-left">
                  <div className="w-10 h-7 rounded bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{vehicleName}</p>
                    {stage && <StageBadge stage={stage} size="sm" />}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-gray-50 border text-center">
                  <p className="text-lg font-bold">+{adjustedLeadLift + viniExpectedAppointments}</p>
                  <p className="text-[10px] text-muted-foreground">Leads & Appointments</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 border text-center">
                  <p className="text-lg font-bold">${(adjustedMargin + viniMarginProtected).toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">Margin Protected</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 border text-center">
                  <p className="text-lg font-bold">{viniConfig.dailyCalls * 14}</p>
                  <p className="text-[10px] text-muted-foreground">VINI Calls</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 border text-center">
                  <p className="text-lg font-bold">{Math.max(adjustedDays, viniDaysSaved)}d</p>
                  <p className="text-[10px] text-muted-foreground">Faster Turn</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-left space-y-2">
                <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">What happens next</p>
                <div className="space-y-1.5">
                  {[
                    `Digital ${tier.name} campaign goes live within ${effectiveStage === "critical" ? "4 hours" : "24 hours"}`,
                    `VINI (${viniPersonality.name}) starts ${viniConfig.mode === "outbound" ? "outbound" : viniConfig.mode === "inbound" ? "inbound" : "outbound + inbound"} calls within 2 hours`,
                    "Both channels coordinate — ad-warmed prospects get priority VINI outreach",
                    "All appointments auto-synced to your CRM from both channels",
                    "Unified analytics on your dashboard — track combined ROI in real-time",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-emerald-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Track combined performance from the VIN detail page, Acceleration Center, and ROI Dashboard.
              </p>

              <Button className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </div>
          )}

          {/* ── Step 5: Success — Voice AI ── */}
          {step === 5 && campaignType === "voice-ai" && (
            <div className="space-y-6 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-violet-50 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-violet-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">VINI Campaign Activated</h3>
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">VINI · {viniPersonality.name}</span> is being configured and will start calling within <span className="font-semibold text-foreground">2 hours</span>.
                </p>
              </div>

              {vehicleName && (
                <div className="p-3 rounded-xl bg-gray-50 border flex items-center gap-3 text-left">
                  <div className="w-10 h-7 rounded bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-violet-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{vehicleName}</p>
                    {stage && <StageBadge stage={stage} size="sm" />}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-gray-50 border text-center">
                  <p className="text-lg font-bold">{viniConfig.dailyCalls * 14}</p>
                  <p className="text-[10px] text-muted-foreground">Total Calls</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 border text-center">
                  <p className="text-lg font-bold">{viniExpectedAppointments}</p>
                  <p className="text-[10px] text-muted-foreground">Expected Appts</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 border text-center">
                  <p className="text-lg font-bold">${viniMarginProtected.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">Margin Protected</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 border text-center">
                  <p className="text-lg font-bold">{viniDaysSaved}d</p>
                  <p className="text-[10px] text-muted-foreground">Faster Turn</p>
                </div>
              </div>

              {/* VINI next steps */}
              <div className="p-4 rounded-xl bg-violet-50 border border-violet-100 text-left space-y-2">
                <p className="text-xs font-semibold text-violet-800 uppercase tracking-wider">What happens next</p>
                <div className="space-y-1.5">
                  {[
                    `VINI (${viniPersonality.name}) is trained on this vehicle's features and pricing`,
                    `${viniConfig.mode === "outbound" ? "Outbound" : viniConfig.mode === "inbound" ? "Inbound" : "Outbound + inbound"} calling begins within 2 hours`,
                    `Schedule: ${viniConfig.schedule === "business" ? "9 AM – 6 PM" : viniConfig.schedule === "extended" ? "8 AM – 9 PM" : "24/7"} · ${viniConfig.dailyCalls} calls/day`,
                    "All appointments auto-synced to your CRM",
                    "Real-time call transcripts and analytics on your dashboard",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-violet-400 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-violet-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Track VINI call performance in real-time from the VIN detail page and ROI Dashboard.
              </p>

              <Button className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </div>
          )}

          {/* ── Step 5: Success — Digital (stage-specific) ── */}
          {step === 5 && campaignType === "digital" && (
            <div className="space-y-6 text-center">
              <div className={cn(
                "mx-auto w-16 h-16 rounded-full flex items-center justify-center",
                effectiveStage === "critical" ? "bg-red-50" : "bg-emerald-50"
              )}>
                <CheckCircle2 className={cn(
                  "h-8 w-8",
                  effectiveStage === "critical" ? "text-red-500" : "text-emerald-600"
                )} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">
                  {effectiveStage === "critical"
                    ? "Optimization Activated"
                    : effectiveStage === "risk"
                      ? "Campaign Activated"
                      : "Campaign Scheduled"
                  }
                </h3>
                <p className="text-muted-foreground">
                  {effectiveStage === "critical" ? (
                    <>
                      Your <span className="font-semibold text-foreground">{tier.name}</span> optimization
                      is being fast-tracked and will be live within <span className="font-semibold text-foreground">4 hours</span>.
                    </>
                  ) : effectiveStage === "risk" ? (
                    <>
                      Your <span className="font-semibold text-foreground">{tier.name}</span> campaign
                      is being configured and will be live within 24 hours.
                    </>
                  ) : (
                    <>
                      Your <span className="font-semibold text-foreground">{tier.name}</span> campaign
                      has been scheduled. We&apos;ll notify you when it goes live.
                    </>
                  )}
                </p>
              </div>

              {vehicleName && (
                <div className="p-3 rounded-xl bg-gray-50 border flex items-center gap-3 text-left">
                  <div className="w-10 h-7 rounded bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-[7px] text-gray-500 font-mono">IMG</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{vehicleName}</p>
                    {stage && <StageBadge stage={stage} size="sm" />}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-gray-50 border text-center">
                  <p className="text-lg font-bold">+{adjustedLeadLift}</p>
                  <p className="text-[10px] text-muted-foreground">Expected Leads</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 border text-center">
                  <p className="text-lg font-bold">${adjustedMargin.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">Margin Protected</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 border text-center">
                  <p className="text-lg font-bold">{adjustedDays}d</p>
                  <p className="text-[10px] text-muted-foreground">Faster Turn</p>
                </div>
              </div>

              {/* Critical-specific next steps */}
              {effectiveStage === "critical" && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-left space-y-2">
                  <p className="text-xs font-semibold text-red-800 uppercase tracking-wider">What happens next</p>
                  <div className="space-y-1.5">
                    {[
                      "AI analyzes comparable market pricing and recommends adjustment",
                      "Campaign goes live on priority channels within 4 hours",
                      "Media auto-upgraded to Real if not already",
                      "Daily margin alerts enabled for this VIN",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-red-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Track performance in real-time from the VIN detail page and Acceleration Center.
              </p>

              <Button className="w-full h-11" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
