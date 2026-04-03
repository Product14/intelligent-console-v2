"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { mockMerchandisingSummary, mockMerchandisingVehicles } from "@/lib/max-2-mocks"
import { cn } from "@/lib/utils"
import { spyneComponentClasses, spyneConsoleTokens } from "@/lib/design-system/max-2"
import {
  SpyneChip,
  SpyneMediaStatusChip,
  SpynePublishStatusChip,
  SpyneSeverityChip,
} from "@/components/max-2/spyne-ui"
import { Max2ActionTab, Max2ActionTabStrip } from "@/components/max-2/max2-action-tab"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import {
  Clock, Globe, Camera, FileText, Eye,
  ArrowRight, ImageOff, Tag, ExternalLink,
  TrendingUp,
  Sun, Video, Images, AlertTriangle, Zap, Sparkles,
  ChevronRight, Crown, Megaphone, BookOpen, Copy, Check,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { MerchandisingVehicle, MediaStatus, PublishStatus } from "@/services/max-2/max-2.types"
import { RotateCw, Video as VideoIcon, Image as ImageIcon, AlertTriangle as AlertIcon } from "lucide-react"

function fmtPrice(p: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(p)
}

function VehicleTable({ vehicles, issueBadge }: { vehicles: MerchandisingVehicle[]; issueBadge?: (v: MerchandisingVehicle) => React.ReactNode }) {
  if (vehicles.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No vehicles in this category.</p>
  }
  const TH = ({ children, right }: { children: React.ReactNode; right?: boolean }) => (
    <th className={cn("py-3 px-4 text-xs font-semibold uppercase tracking-wider text-spyne-text-secondary whitespace-nowrap bg-muted", right && "text-right")}>
      {children}
    </th>
  )
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b">
            <TH><span className="sr-only">Thumb</span></TH>
            <TH>Vehicle</TH>
            <TH>Media</TH>
            <TH>Status</TH>
            <TH>Score</TH>
            <TH>Age</TH>
            <TH>Views</TH>
            {issueBadge && <TH>Issue</TH>}
            <TH right>Price</TH>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {vehicles.map((v) => {
            const hasIssue = v.mediaStatus === "no-photos" || v.mediaStatus === "stock-photos" || v.listingScore < 50
            return (
              <tr key={v.vin} className={cn("transition-colors hover:bg-muted", hasIssue && spyneComponentClasses.rowError)}>
                {/* Thumb */}
                <td className="py-3 px-4 w-16">
                  {v.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.thumbnailUrl} alt="" className="h-9 w-13 rounded object-cover" />
                  ) : (
                    <div className="h-9 w-13 rounded bg-muted flex items-center justify-center">
                      <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  )}
                </td>
                {/* Vehicle */}
                <td className="py-3 px-4 min-w-[160px]">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">{v.year} {v.make} {v.model}</span>
                    {!v.hasDescription && <AlertIcon className="h-3 w-3 text-spyne-warning shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{v.trim}</p>
                </td>
                {/* Media */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <SpyneMediaStatusChip mediaStatus={v.mediaStatus} compact className="shrink-0" />
                    <span className="text-xs text-muted-foreground tabular-nums">{v.photoCount}</span>
                    {v.has360 && <RotateCw className="h-3 w-3 text-spyne-info shrink-0" />}
                    {v.hasVideo && <VideoIcon className="h-3 w-3 text-primary shrink-0" />}
                  </div>
                </td>
                {/* Status */}
                <td className="py-3 px-4">
                  <SpynePublishStatusChip publishStatus={v.publishStatus} compact />
                </td>
                {/* Score */}
                <td className="py-3 px-4">
                  <span className={cn("text-sm font-semibold tabular-nums", v.listingScore >= 75 ? "text-spyne-success" : v.listingScore >= 50 ? "text-spyne-text" : "text-spyne-error")}>
                    {v.listingScore}
                  </span>
                </td>
                {/* Age */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className={cn("text-sm tabular-nums", v.daysInStock >= 45 ? "text-spyne-error font-semibold" : v.daysInStock >= 30 ? "text-spyne-text font-semibold" : "")}>
                    {v.daysInStock}d
                  </span>
                </td>
                {/* Views */}
                <td className="py-3 px-4 text-sm tabular-nums text-muted-foreground">{v.vdpViews}</td>
                {/* Issue */}
                {issueBadge && <td className="py-3 px-4 whitespace-nowrap">{issueBadge(v)}</td>}
                {/* Price */}
                <td className="py-3 px-4 text-sm font-medium tabular-nums text-right whitespace-nowrap">{fmtPrice(v.price)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function VehicleListModal({
  open,
  onClose,
  title,
  description,
  vehicles,
  inventoryHref,
}: {
  open: boolean
  onClose: () => void
  title: string
  description: string
  vehicles: MerchandisingVehicle[]
  inventoryHref: string
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground leading-snug">{description}</p>
          <div className="rounded-lg border overflow-hidden max-h-[420px] overflow-y-auto">
            <VehicleTable vehicles={vehicles} />
          </div>
          <Link
            href={inventoryHref}
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full rounded-lg border border-primary bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
          >
            See these vehicles in Active Inventory
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}

type InsightVinStat = { label: string; value: number }

function InsightVinModal({
  open,
  onClose,
  title,
  description,
  stats,
  vehicles,
  inventoryHref,
}: {
  open: boolean
  onClose: () => void
  title: string
  description: string
  stats: InsightVinStat[]
  vehicles: MerchandisingVehicle[]
  inventoryHref: string
}) {
  const cols =
    stats.length >= 3 ? "sm:grid-cols-3" : stats.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-1"
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {stats.length > 0 && (
            <div className={cn("grid grid-cols-1 gap-2", cols)}>
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg border bg-muted/20 px-3 py-3 text-center"
                >
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {s.label}
                  </p>
                  <p className="text-2xl font-bold tabular-nums tracking-tight mt-1">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          )}
          <p className="text-sm text-muted-foreground leading-snug">{description}</p>
          <div>
            <p className="text-xs font-semibold text-foreground mb-2">Affected VINs</p>
            <div className="rounded-lg border overflow-hidden max-h-[min(50vh,380px)] overflow-y-auto">
              <VehicleTable vehicles={vehicles} />
            </div>
          </div>
          <Link
            href={inventoryHref}
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full rounded-lg border border-primary bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
          >
            View in inventory
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}

type TrainingGuideSection = { heading: string; bullets: string[] }

function PhotographerTrainingModal({
  open,
  onClose,
  title,
  badInput,
  improvement,
  sections,
}: {
  open: boolean
  onClose: () => void
  title: string
  badInput: string
  improvement: string
  sections: TrainingGuideSection[]
}) {
  const [copied, setCopied] = useState(false)

  const plainText = useCallback(() => {
    const body = sections
      .map((s) => `${s.heading}\n${s.bullets.map((b) => `• ${b}`).join("\n")}`)
      .join("\n\n")
    return `Training note: ${title}\n\nIssue we saw: ${badInput}\nHow we fixed it: ${improvement}\n\n--- Photographer checklist ---\n\n${body}`
  }, [title, badInput, improvement, sections])

  const handleCopy = () => {
    void navigator.clipboard.writeText(plainText())
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[min(90vh,640px)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <BookOpen className="h-4 w-4 text-primary shrink-0" />
            Training guide for photographer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</p>
            <div className="mt-3 rounded-lg border bg-muted/30 p-3 space-y-2 text-sm">
              <p>
                <span className="font-semibold text-spyne-text">Bad input: </span>
                <span className="text-muted-foreground">{badInput}</span>
              </p>
              <p>
                <span className="font-semibold text-spyne-success">Made better: </span>
                <span className="text-muted-foreground">{improvement}</span>
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Send this checklist</p>
            {sections.map((sec) => (
              <div key={sec.heading} className="rounded-lg border p-3">
                <p className="text-sm font-semibold">{sec.heading}</p>
                <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                  {sec.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="text-primary shrink-0">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied to clipboard" : "Copy for email / SMS"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DaysToFrontlineModal({
  open,
  onClose,
  value,
  actions,
}: {
  open: boolean
  onClose: () => void
  value: number
  actions: { count: number; label: string; severity: "critical" | "warning"; icon: React.ElementType; href: string }[]
}) {
  const isOnTarget = value <= 4

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <Clock className="h-4 w-4 text-primary" />
            Days to Frontline
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Status pill + definition */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Arrival → fully listed online with real photos &amp; description.
            </p>
            <SpyneChip
              variant="outline"
              tone={isOnTarget ? "success" : "warning"}
              compact
              className="ml-3 shrink-0"
            >
              {isOnTarget ? "On target" : `${(value - 4).toFixed(1)}d over`}
            </SpyneChip>
          </div>

          {/* Benchmarks row */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Current", val: `${value}d`, color: isOnTarget ? "text-spyne-success" : "text-spyne-text" },
              { label: "Target", val: "4d", color: "text-foreground" },
              { label: "Industry avg", val: "5–7d", color: "text-muted-foreground" },
            ].map((b) => (
              <div key={b.label} className="rounded-lg bg-muted/50 py-2 px-1">
                <p className={cn("text-lg font-bold tabular-nums", b.color)}>{b.val}</p>
                <p className="text-[11px] text-muted-foreground">{b.label}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          {actions.length > 0 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground pt-1">Actions required</p>
              <div className="space-y-1.5">
                {actions.map((action) => {
                  const Icon = action.icon
                  const isCritical = action.severity === "critical"
                  return (
                    <Link
                      key={action.label}
                      href={action.href}
                      onClick={onClose}
                      className={cn(
                        "group flex items-center gap-2.5 rounded-lg border px-3 py-2 transition-colors",
                        isCritical
                          ? cn("border-spyne-border", spyneComponentClasses.rowError, "hover:opacity-95")
                          : cn("border-spyne-border", spyneComponentClasses.rowWarn, "hover:opacity-95")
                      )}
                    >
                      <Icon className={cn("h-3.5 w-3.5 shrink-0", isCritical ? "text-spyne-error" : "text-spyne-warning")} />
                      <span className={cn("text-sm font-bold tabular-nums w-5 shrink-0", isCritical ? "text-spyne-error" : "text-spyne-text")}>
                        {action.count}
                      </span>
                      <span className="text-sm text-muted-foreground flex-1 truncate">{action.label}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0" />
                    </Link>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ScoreGauge({ score, color, label }: { score: number; color: string; label: string }) {
  const vw = 160, vh = 85
  const cx = 80, cy = 80, r = 58, sw = 10
  const pct = Math.min(score / 10, 0.9999)
  const angleMath = Math.PI * (1 - pct)
  const ex = cx + r * Math.cos(angleMath)
  const ey = cy - r * Math.sin(angleMath)
  const bgArc = `M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx + r} ${cy}`
  const valArc = pct > 0 ? `M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${ex} ${ey}` : null
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: 110, height: 72 }}>
        <svg viewBox={`0 0 ${vw} ${vh}`} width="110" height="72" style={{ overflow: "visible" }}>
          <path d={bgArc} fill="none" stroke={spyneConsoleTokens.border} strokeWidth={sw} strokeLinecap="round" />
          {valArc && <path d={valArc} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" />}
          {valArc && <circle cx={ex} cy={ey} r={sw / 2 + 2} fill={color} />}
        </svg>
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
          <span className="text-2xl font-bold tabular-nums leading-none" style={{ color }}>{score}</span>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  )
}

function WebsiteScoreModal({
  open,
  onClose,
  score,
  vehicles,
  summary,
}: {
  open: boolean
  onClose: () => void
  score: number
  vehicles: MerchandisingVehicle[]
  summary: typeof mockMerchandisingSummary
}) {
  const photosPresent = parseFloat(((summary.realPhotos / summary.totalVehicles) * 10).toFixed(1))
  const heroUniformity = parseFloat((((summary.totalVehicles - vehicles.filter(v => v.wrongHeroAngle).length) / summary.totalVehicles) * 10).toFixed(1))
  const bgUniformity = 6.0

  const potentialBoost = 1.8
  const potentialScore = parseFloat(Math.min(10, score + potentialBoost).toFixed(1))

  const subScores = [
    { label: "Photos Present",        desc: "Very few vehicles have real images",              val: photosPresent },
    { label: "Hero Image Uniformity", desc: "Hero angles need to be correct",                  val: heroUniformity },
    { label: "Background Uniformity", desc: "Mixed backgrounds present across website",         val: bgUniformity },
  ]

  const suggestions = [
    "Standardize vehicle photo backgrounds by choosing one approach (either studio-style or outdoor) and reprocessing the outliers to match.",
    "Enforce a single hero image angle rule (for example: front-left 3/4 view) at upload or processing time.",
    "Reorder image sets so the standardized hero angle always appears first on every vehicle card.",
    "Reprocess existing listings that break background or hero-angle consistency to visually align the grid.",
  ]

  const actionItems = [
    { label: "No Photos",    count: vehicles.filter(v => v.mediaStatus === "no-photos").length,   href: "/max-2/studio/inventory?media=no-photos",  Icon: ImageOff },
    { label: "CGI Photos",   count: vehicles.filter(v => v.mediaStatus === "clone-photos").length, href: "/max-2/studio/inventory?media=cgi",          Icon: Images   },
    { label: "< 8 Photos",   count: vehicles.filter(v => v.photoCount > 0 && v.photoCount < 8).length, href: "/max-2/studio/inventory?photos=low",    Icon: Camera   },
    { label: "Wrong Angle",  count: vehicles.filter(v => v.wrongHeroAngle).length,                 href: "/max-2/studio/inventory?issue=hero",         Icon: AlertTriangle },
  ]

  const barColor = (val: number) =>
    val >= 7 ? spyneConsoleTokens.success : val >= 5 ? spyneConsoleTokens.warning : spyneConsoleTokens.error

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Improve your media score</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* ── Score gauges ── */}
          <div className="rounded-lg bg-gradient-to-b from-muted/40 to-spyne-surface border border-spyne-border flex items-center justify-center gap-6 py-5 px-6">
            <ScoreGauge score={score} color={spyneConsoleTokens.warning} label="Your Score" />
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-sm font-semibold text-spyne-success">+{potentialBoost.toFixed(0)} Potential Boost</span>
              <div className="flex items-center gap-1 text-muted-foreground">
                <div className="h-px w-10 bg-muted-foreground/30" />
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
            <ScoreGauge score={potentialScore} color={spyneConsoleTokens.success} label="Potential Score" />
          </div>

          {/* ── Insights ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Insights</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/5 text-primary border border-primary/20 tracking-wide">
                  ✦ AI POWERED
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground">Last synced 12 hours ago ↻</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {subScores.map((item) => (
                <div key={item.label} className="rounded-lg border p-3.5 flex flex-col gap-2.5">
                  <div>
                    <p className="text-xs font-semibold leading-tight">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{item.desc}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-auto">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${(item.val / 10) * 100}%`, backgroundColor: barColor(item.val) }} />
                    </div>
                    <span className="text-xs font-semibold tabular-nums shrink-0" style={{ color: barColor(item.val) }}>
                      {item.val}/10
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Suggestions ── */}
          <div className="rounded-lg bg-primary/5 border border-primary/10 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary shrink-0" />
              <p className="text-sm font-semibold text-primary">Suggestions to boost score</p>
            </div>
            <ul className="space-y-2">
              {suggestions.map((sug, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground leading-snug">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  {sug}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Actions Required ── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-spyne-error shrink-0" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-spyne-error">Actions Required</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {actionItems.map((item) => {
                const Icon = item.Icon
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center justify-between rounded-lg border px-4 py-3 hover:bg-muted/30 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-sm font-semibold text-spyne-error tabular-nums">{item.count}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* ── Website link ── */}
          <a
            href="https://www.dealership.com/inventory"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 hover:bg-primary/10 transition-colors group"
          >
            <div className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-sm font-medium text-primary">View live inventory page</span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-primary/60 group-hover:text-primary transition-colors shrink-0" />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function MerchandisingSummary() {
  const router = useRouter()
  const s = mockMerchandisingSummary
  const vehicles = mockMerchandisingVehicles

  const [frontlineModalOpen, setFrontlineModalOpen] = useState(false)
  const [websiteScoreModalOpen, setWebsiteScoreModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [opportunityListModal, setOpportunityListModal] = useState<null | { title: string; description: string; vehicles: MerchandisingVehicle[]; href: string }>(null)
  const [trainingModal, setTrainingModal] = useState<null | {
    title: string
    badInput: string
    improvement: string
    sections: TrainingGuideSection[]
  }>(null)
  const [insightVinModal, setInsightVinModal] = useState<null | {
    title: string
    description: string
    stats: InsightVinStat[]
    vehicles: MerchandisingVehicle[]
    inventoryHref: string
  }>(null)
  const [proPlanModalOpen, setProPlanModalOpen] = useState(false)

  const needRealPhotos = vehicles.filter(
    (v) => v.mediaStatus !== "real-photos"
  ).length
  const aged30Plus = vehicles.filter((v) => v.daysInStock >= 30).length
  const missingDesc = vehicles.filter((v) => !v.hasDescription).length
  const notPublished = vehicles.filter(
    (v) => v.publishStatus !== "live"
  ).length
  const preliminaryPhotos = vehicles.filter(
    (v) => v.photoCount > 0 && v.photoCount < 8
  ).length

  const actions = [
    {
      count: needRealPhotos,
      label: "need real photos",
      severity: "critical" as const,
      icon: Camera,
      href: "/max-2/studio/inventory?media=needs-real",
    },
    {
      count: aged30Plus,
      label: "aged 30+ days - review pricing",
      severity: "critical" as const,
      icon: Tag,
      href: "/max-2/studio/inventory?age=30",
    },
    {
      count: notPublished,
      label: "not yet published",
      severity: "warning" as const,
      icon: Eye,
      href: "/max-2/studio/inventory?status=unpublished",
    },
    {
      count: missingDesc,
      label: "missing descriptions",
      severity: "warning" as const,
      icon: FileText,
      href: "/max-2/studio/inventory?desc=missing",
    },
    {
      count: preliminaryPhotos,
      label: "with < 8 photos - schedule shoot",
      severity: "warning" as const,
      icon: ImageOff,
      href: "/max-2/studio/inventory?photos=low",
    },
  ]
    .filter((a) => a.count > 0)
    .sort((a, b) => {
      if (a.severity === "critical" && b.severity !== "critical") return -1
      if (a.severity !== "critical" && b.severity === "critical") return 1
      return b.count - a.count
    })
    .slice(0, 4)

  return (
    <div className="flex flex-col gap-7">
      {/* ── Section 1: ROI Metrics ── */}
      {(() => {
        const metrics = [
          {
            label: "Days to Frontline",
            value: `${s.avgDaysToFrontline}`,
            unit: "days",
            sub: s.avgDaysToFrontline <= 4 ? "On target · goal 4d" : `${(s.avgDaysToFrontline - 4).toFixed(1)}d over · goal 4d`,
            subColor: s.avgDaysToFrontline <= 4 ? "text-spyne-success" : "text-spyne-text",
            dot: s.avgDaysToFrontline <= 4 ? "bg-spyne-success" : s.avgDaysToFrontline <= 5 ? "bg-spyne-warning" : "bg-spyne-error",
            barPct: Math.min((4 / Math.max(s.avgDaysToFrontline, 1)) * 100, 100),
            barColor: s.avgDaysToFrontline <= 3 ? "bg-spyne-success" : s.avgDaysToFrontline <= 5 ? "bg-spyne-warning" : "bg-spyne-error",
            hint: needRealPhotos > 0 ? `${needRealPhotos} vehicles on stock photos slow publish` : undefined,
            hintIcon: AlertTriangle,
            onClick: () => setFrontlineModalOpen(true),
          },
          {
            label: "Media Score",
            value: `${s.websiteScore}`,
            unit: "/10",
            sub: s.websiteScore >= 6.5 ? `+${(s.websiteScore - 6.5).toFixed(1)} above avg` : `${(6.5 - s.websiteScore).toFixed(1)} below avg`,
            subColor: s.websiteScore >= 6.5 ? "text-spyne-success" : "text-spyne-error",
            dot: s.websiteScore >= 7.5 ? "bg-spyne-success" : s.websiteScore >= 5 ? "bg-spyne-warning" : "bg-spyne-error",
            barPct: (s.websiteScore / 10) * 100,
            barColor: s.websiteScore >= 7.5 ? "bg-spyne-success" : s.websiteScore >= 5 ? "bg-spyne-warning" : "bg-spyne-error",
            hint: missingDesc > 0 ? `Write ${missingDesc} descriptions for +0.5 pts` : undefined,
            hintIcon: TrendingUp,
            onClick: () => setWebsiteScoreModalOpen(true),
          },
        ]

        return (
          <div className="rounded-lg border bg-card shadow-none overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x">
              {metrics.map((m2) => {
                const HintIcon = m2.hintIcon
                return (
                  <button
                    type="button"
                    key={m2.label}
                    onClick={m2.onClick}
                    className="flex flex-col text-left cursor-pointer hover:bg-muted/30 transition-colors group"
                  >
                    <div className="px-5 py-4 flex flex-col gap-2.5 flex-1">
                      {/* Label row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", m2.dot)} />
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{m2.label}</span>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0" />
                      </div>
                      {/* Value */}
                      <div>
                        <p className="text-3xl font-bold tabular-nums tracking-tight leading-none">
                          {m2.value}
                          {m2.unit && <span className="text-sm font-normal text-muted-foreground ml-1">{m2.unit}</span>}
                        </p>
                        <p className={cn("text-[11px] mt-1", m2.subColor)}>{m2.sub}</p>
                      </div>
                      {/* Bar */}
                      <div className="h-1 rounded-full bg-muted overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", m2.barColor)} style={{ width: `${m2.barPct}%` }} />
                      </div>
                    </div>
                    {/* Hint footer */}
                    {m2.hint && (
                      <div className="px-5 py-2.5 bg-muted/30 border-t flex items-center gap-1.5">
                        <HintIcon className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                        <p className="text-[11px] text-muted-foreground truncate">{m2.hint}</p>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })()}

      {/* ── Section 2: Action Items (tabbed) ── */}
      {(() => {
        const tabDefs: {
          key: string
          label: string
          icon: React.ReactNode
          filter: (v: (typeof vehicles)[0]) => boolean
          href: string
        }[] = [
          {
            key: "no-photos",
            label: "No Photos",
            icon: (
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="3" width="14" height="10" rx="1.5" />
                <line x1="1" y1="3" x2="15" y2="13" strokeLinecap="round" />
              </svg>
            ),
            filter: (v) => v.mediaStatus === "no-photos",
            href: "/max-2/studio/inventory?media=no-photos",
          },
          {
            key: "cgi",
            label: "CGI Photos",
            icon: <MaterialSymbol name="auto_awesome" size={24} />,
            filter: (v) => v.mediaStatus === "clone-photos",
            href: "/max-2/studio/inventory?media=cgi",
          },
          {
            key: "less8",
            label: "Less <8 Photos",
            icon: <MaterialSymbol name="photo_size_select_small" size={24} />,
            filter: (v) => v.photoCount > 0 && v.photoCount < 8,
            href: "/max-2/studio/inventory?photos=low",
          },
          {
            key: "hero",
            label: "Wrong Hero Angle",
            icon: <MaterialSymbol name="crop_rotate" size={24} />,
            filter: (v) => v.wrongHeroAngle,
            href: "/max-2/studio/inventory?issue=hero",
          },
          {
            key: "no360",
            label: "No 360 Spin",
            icon: <MaterialSymbol name="3d_rotation" size={24} />,
            filter: (v) => !v.has360,
            href: "/max-2/studio/inventory?issue=no360",
          },
          {
            key: "incomplete",
            label: "Incomplete PhotoSet",
            icon: <MaterialSymbol name="burst_mode" size={24} />,
            filter: (v) => v.incompletePhotoSet,
            href: "/max-2/studio/inventory?issue=incomplete",
          },
        ]

        const tab = tabDefs[activeTab]
        const matched = vehicles.filter(tab.filter)
        const shown = matched.slice(0, 5)
        const hasMore = matched.length > 5

        return (
          <div>
            <div className="mb-3">
              <h2 className="text-sm font-semibold tracking-tight">Action Items</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Vehicles grouped by media issue - click a tab to review and fix</p>
            </div>
          <div className="rounded-lg border bg-card shadow-none overflow-hidden">
            <Max2ActionTabStrip className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
              {tabDefs.map((t, i) => {
                const count = vehicles.filter(t.filter).length
                return (
                  <Max2ActionTab
                    key={t.key}
                    icon={t.icon}
                    title={t.label}
                    count={count}
                    selected={activeTab === i}
                    onClick={() => setActiveTab(i)}
                  />
                )
              })}
            </Max2ActionTabStrip>

            {/* Vehicle list */}
            <div>
              <VehicleTable
                vehicles={shown}
                issueBadge={(v) => {
                  const badges: Record<string, React.ReactNode> = {
                    "no-photos":  <SpyneSeverityChip severity="error" compact>No photos</SpyneSeverityChip>,
                    "cgi":        <SpyneSeverityChip severity="warning" compact>CGI</SpyneSeverityChip>,
                    "less8":      <SpyneSeverityChip severity="warning" compact>{v.photoCount} photos</SpyneSeverityChip>,
                    "hero":       <SpyneSeverityChip severity="warning" compact>Wrong angle</SpyneSeverityChip>,
                    "no360":      <SpyneChip variant="outline" tone="neutral" compact>No 360°</SpyneChip>,
                    "incomplete": <SpyneSeverityChip severity="warning" compact>Incomplete</SpyneSeverityChip>,
                  }
                  return badges[tab.key] ?? null
                }}
              />
              {hasMore && (
                <div className="px-5 py-4 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <p className="text-xs text-muted-foreground tabular-nums">
                    Showing 5 of {matched.length} vehicles
                  </p>
                  <Link
                    href={tab.href}
                    className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline sm:ml-auto"
                  >
                    View more
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
          </div>
        )
      })()}

      {/* ── Section 3: Insights & Opportunities ── */}
      {(() => {
        const sunGlareVehicles = vehicles.filter((v) => v.hasSunGlare)
        const walkaroundVehicles = vehicles.filter((v) => v.missingWalkaroundVideo)
        const lowPhotoVehicles = vehicles.filter((v) => v.photoCount >= 1 && v.photoCount <= 15)
        const under8Vehicles = vehicles.filter((v) => v.photoCount > 0 && v.photoCount < 8)
        const notPublishedVehicles = vehicles.filter((v) => v.publishStatus !== "live")

        const sunGlareN = sunGlareVehicles.length
        const sunGlareFixed =
          sunGlareN > 0 ? Math.min(sunGlareN, Math.round((sunGlareN * 8) / 12)) : 0
        const sunGlarePending = Math.max(0, sunGlareN - sunGlareFixed)

        const insights = [
          {
            id: "sun-glare",
            icon: Sun,
            label: `${sunGlareN} vehicles have sun glare in photos. We were able to fix ${sunGlareFixed} of them automatically.`,
            modalTitle: "Sun glare",
            modalDescription:
              "Counts are by VIN. Auto-fixed units had recoverable frames in processing; pending units may need a re-shoot.",
            modalStats: [
              { label: "VINs affected", value: sunGlareN },
              { label: "Auto-fixed", value: sunGlareFixed },
              { label: "Pending", value: sunGlarePending },
            ] satisfies InsightVinStat[],
            modalVehicles: sunGlareVehicles,
            inventoryHref: "/max-2/studio/inventory?issue=glare",
            badInput: "Shooting into direct sun left blown highlights on glass and paint; detail was lost in post.",
            improvement:
              "We applied glare-aware correction on flagged frames and queued the rest for a quick re-shoot at a better angle.",
            count: sunGlareN,
            countLabel: "affected",
            severity: "warning" as const,
            sections: [
              {
                heading: "Shoot position",
                bullets: [
                  "Keep the sun behind you or at 45° — never straight into the lens for hero shots.",
                  "If the lot forces backlight, bracket exposure or use a polarizer on exterior glass.",
                ],
              },
              {
                heading: "Time of day",
                bullets: [
                  "Schedule north-facing rows in early morning; south-facing rows after 3pm when possible.",
                  "Avoid noon for dark paint — hotspots are hardest to recover then.",
                ],
              },
            ] satisfies TrainingGuideSection[],
          },
          {
            id: "walkaround-360",
            icon: Video,
            label: `${walkaroundVehicles.length} vehicles are missing a correct walk-around video for 360.`,
            modalTitle: "Walk-around for 360",
            modalDescription:
              "These VINs need a full, steady perimeter capture to complete 360 processing.",
            modalStats: [{ label: "VINs affected", value: walkaroundVehicles.length }] satisfies InsightVinStat[],
            modalVehicles: walkaroundVehicles,
            inventoryHref: "/max-2/studio/inventory?issue=no360",
            badInput: "Clips were too short, shaky, or skipped the full vehicle perimeter, so the 360 pipeline could not align frames.",
            improvement: "We re-ran capture guidance in-app and queued re-shoots only where the path was incomplete.",
            count: walkaroundVehicles.length,
            countLabel: "vehicles",
            severity: "warning" as const,
            sections: [
              {
                heading: "Capture path",
                bullets: [
                  "Walk a full 360° at consistent distance (one car length) and steady height.",
                  "Start and end at the same point so the seam blends in processing.",
                ],
              },
              {
                heading: "Camera settings",
                bullets: [
                  "Lock exposure for the whole lap — no auto ISO ramping mid-walk.",
                  "Hold 1080p or higher; avoid digital zoom while moving.",
                ],
              },
            ] satisfies TrainingGuideSection[],
          },
          {
            id: "photo-count-industry",
            icon: Images,
            label: `${lowPhotoVehicles.length} vehicles carry 10–15 photos, below the industry average of 25 photos per vehicle.`,
            modalTitle: "Photo count vs industry",
            modalDescription:
              "Industry benchmark is about 25 photos per vehicle. The VINs listed are in the 10–15 photo range.",
            modalStats: [{ label: "VINs in range", value: lowPhotoVehicles.length }] satisfies InsightVinStat[],
            modalVehicles: lowPhotoVehicles,
            inventoryHref: "/max-2/studio/inventory?issue=incomplete",
            badInput: "Sets stopped after basics (front, rear, dash) without full exterior walk, interior detail, and feature shots.",
            improvement: "We templated a 25-shot checklist per vehicle and auto-flagged anything under 20 before publish.",
            count: lowPhotoVehicles.length,
            countLabel: "vehicles",
            severity: "warning" as const,
            sections: [
              {
                heading: "Minimum set",
                bullets: [
                  "Exterior: 3/4 front, 3/4 rear, straight sides, wheels, bed/trunk if applicable.",
                  "Interior: dash, seats, rear seat, cargo, infotainment, odometer, VIN plate.",
                ],
              },
              {
                heading: "Dealer standards",
                bullets: [
                  "Duplicate angles only if trim-specific (e.g. sunroof open/closed).",
                  "Upload full resolution — no aggressive in-camera crop.",
                ],
              },
            ] satisfies TrainingGuideSection[],
          },
          {
            id: "under-8-exterior",
            icon: AlertTriangle,
            label: `${under8Vehicles.length} vehicles carry fewer than 8 exterior images.`,
            modalTitle: "Under 8 exterior images",
            modalDescription:
              "Exterior coverage under eight images limits listing quality. Each row is a VIN in that state.",
            modalStats: [{ label: "VINs affected", value: under8Vehicles.length }] satisfies InsightVinStat[],
            modalVehicles: under8Vehicles,
            inventoryHref: "/max-2/studio/inventory?photos=low",
            badInput: "Exteriors were rushed or partial, leaving gaps in the buyer’s visual walk-around.",
            improvement: "We blocked go-live on under-8 sets for new units and surfaced a same-day re-shoot task.",
            count: under8Vehicles.length,
            countLabel: "vehicles",
            severity: "critical" as const,
            sections: [
              {
                heading: "Exterior pass",
                bullets: [
                  "Count to 8 before leaving the vehicle: four corners + straight profile both sides minimum.",
                  "Include one tight front badge and one clean rear with plate frame visible.",
                ],
              },
              {
                heading: "QC before upload",
                bullets: [
                  "Scroll the filmstrip in Spyne — if any angle is blurry, re-take before sync.",
                  "Confirm first image is the approved hero angle for the store.",
                ],
              },
            ] satisfies TrainingGuideSection[],
          },
        ]

        const smartCampaignVehicles = vehicles.filter(
          (v) => v.listingScore < 70 || v.daysInStock >= 21
        )

        const opportunities = [
          {
            icon: Crown,
            title: "Pro Plan",
            desc: "Full-stack media, priority QA, and automation so every VDP ships complete.",
            benefit: "Best for high volume stores",
            rank: 1 as const,
            proIncludes: [
              "Unlimited AI background & window mask",
              "Priority processing queue & same-day fixes",
              "360° + video add-ons bundled",
              "Dedicated success manager + monthly shoot audits",
            ],
            count: undefined as number | undefined,
            countLabel: undefined as string | undefined,
            modalVehicles: [] as MerchandisingVehicle[],
            href: "/max-2/studio",
            gradient: "from-spyne-primary via-spyne-primary to-spyne-primary",
            accent: "ring-spyne-primary/25",
          },
          {
            icon: Zap,
            title: "Instant Media",
            desc: "Publish the moment processing finishes — no manual gate on ready listings.",
            benefit: "Faster time-to-live",
            rank: 2 as const,
            proIncludes: [] as string[],
            count: notPublishedVehicles.length,
            countLabel: "not yet live",
            modalVehicles: notPublishedVehicles,
            href: "/max-2/studio/inventory?publishStatus=not-published",
            gradient: "from-spyne-warning to-spyne-warning",
            accent: "ring-spyne-warning/40",
          },
          {
            icon: Megaphone,
            title: "Smart Campaign",
            desc: "Auto-boost underperforming VDPs with the right creative and budget rules.",
            benefit: "Lift leads on aged & weak listings",
            rank: 3 as const,
            proIncludes: [] as string[],
            count: smartCampaignVehicles.length,
            countLabel: "eligible units",
            modalVehicles: smartCampaignVehicles,
            href: "/max-2/studio/inventory?ageMin=21",
            gradient: "from-spyne-success to-spyne-success",
            accent: "ring-spyne-success/30",
          },
        ]

        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Insights */}
            <div className="rounded-lg border bg-card shadow-none overflow-hidden">
              <div className="px-5 pt-4 pb-3 border-b bg-muted/20">
                <p className="text-sm font-semibold tracking-tight">Insights</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Capture and media signals from your inventory.
                </p>
              </div>
              <div className="p-3 sm:p-4 space-y-3">
                {insights.map((item) => {
                  const Icon = item.icon
                  const isCritical = item.severity === "critical"
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        setInsightVinModal({
                          title: item.modalTitle,
                          description: item.modalDescription,
                          stats: item.modalStats,
                          vehicles: item.modalVehicles,
                          inventoryHref: item.inventoryHref,
                        })
                      }
                      className={cn(
                        "w-full text-left rounded-lg border px-4 py-3.5 transition-colors",
                        "hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-2",
                        isCritical
                          ? cn("border-spyne-border border-l-[3px] border-l-spyne-error", spyneComponentClasses.rowError)
                          : cn("border-spyne-border border-l-[3px] border-l-spyne-warning", spyneComponentClasses.rowWarn)
                      )}
                    >
                      <div className="flex gap-3">
                        <div
                          className={cn(
                            "h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border border-spyne-border",
                            isCritical ? spyneComponentClasses.rowError : spyneComponentClasses.rowWarn
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-4 w-4",
                              isCritical ? "text-spyne-error" : "text-spyne-warning"
                            )}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-foreground leading-snug">
                              {item.label}
                            </p>
                            <SpyneChip
                              variant="outline"
                              tone={isCritical ? "error" : "warning"}
                              compact
                              className="shrink-0 tabular-nums"
                            >
                              {item.count}
                            </SpyneChip>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            Affected VINs — tap for counts and list
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/35 mt-1 self-start" />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Opportunities */}
            <div className="rounded-lg border bg-card shadow-none overflow-hidden">
              <div className="px-5 pt-4 pb-3 border-b">
                <p className="text-sm font-semibold tracking-tight">Opportunities</p>
                <p className="text-xs text-muted-foreground mt-0.5">Recommended actions ranked by impact</p>
              </div>
              <div className="divide-y">
                {opportunities.map((opp) => {
                  const Icon = opp.icon
                  const isPro = opp.title === "Pro Plan"
                  return (
                    <button
                      key={opp.title}
                      type="button"
                      onClick={() =>
                        isPro
                          ? setProPlanModalOpen(true)
                          : router.push(opp.href)
                      }
                      className="w-full group text-left hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 px-5 py-3.5">
                        <div
                          className={cn(
                            "h-9 w-9 rounded-lg flex items-center justify-center shrink-0 text-white bg-gradient-to-br",
                            opp.gradient
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-[13px] font-semibold leading-tight">{opp.title}</p>
                            {isPro && (
                              <SpyneChip variant="soft" tone="primary" compact className="font-bold uppercase tracking-wider">
                                Recommended
                              </SpyneChip>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{opp.benefit}</p>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0">
                          {!isPro && opp.count != null && (
                            <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                              {opp.count}
                            </span>
                          )}
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                      {isPro && opp.proIncludes.length > 0 && (
                        <div className="px-5 pb-3.5 -mt-1 pl-[4.25rem]">
                          <div className="flex flex-wrap gap-x-3 gap-y-1">
                            {opp.proIncludes.slice(0, 4).map((line) => (
                              <span key={line} className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <span className="h-1 w-1 rounded-full bg-spyne-primary shrink-0" />
                                {line}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })()}

      {opportunityListModal && (
        <VehicleListModal
          open={!!opportunityListModal}
          onClose={() => setOpportunityListModal(null)}
          title={opportunityListModal.title}
          description={opportunityListModal.description}
          vehicles={opportunityListModal.vehicles}
          inventoryHref={opportunityListModal.href}
        />
      )}

      {insightVinModal && (
        <InsightVinModal
          open={!!insightVinModal}
          onClose={() => setInsightVinModal(null)}
          title={insightVinModal.title}
          description={insightVinModal.description}
          stats={insightVinModal.stats}
          vehicles={insightVinModal.vehicles}
          inventoryHref={insightVinModal.inventoryHref}
        />
      )}

      {trainingModal && (
        <PhotographerTrainingModal
          open={!!trainingModal}
          onClose={() => setTrainingModal(null)}
          title={trainingModal.title}
          badInput={trainingModal.badInput}
          improvement={trainingModal.improvement}
          sections={trainingModal.sections}
        />
      )}

      <Dialog open={proPlanModalOpen} onOpenChange={setProPlanModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
              <Crown className="h-4 w-4 text-primary" />
              Pro Plan — what you get
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground leading-snug">
            Pro bundles everything your lot needs to keep VDPs complete, on-brand, and fast — without tying up your team on manual fixes.
          </p>
          <ul className="mt-3 space-y-2.5 text-sm">
            {[
              "Unlimited AI background replacement and window masking",
              "Priority processing queue with same-day turnaround on flagged units",
              "360° exterior spin and vehicle video included in the bundle",
              "Dedicated success manager plus monthly photographer and QA audits",
              "API-ready workflows for DMS and website partners",
            ].map((line) => (
              <li key={line} className="flex gap-2">
                <Check className="h-4 w-4 text-spyne-success shrink-0 mt-0.5" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/max-2/studio"
            onClick={() => setProPlanModalOpen(false)}
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors mt-2"
          >
            Talk to sales about Pro
            <ArrowRight className="h-4 w-4" />
          </Link>
        </DialogContent>
      </Dialog>

      {/* Modals */}
      <DaysToFrontlineModal
        open={frontlineModalOpen}
        onClose={() => setFrontlineModalOpen(false)}
        value={s.avgDaysToFrontline}
        actions={actions}
      />
      <WebsiteScoreModal
        open={websiteScoreModalOpen}
        onClose={() => setWebsiteScoreModalOpen(false)}
        score={s.websiteScore}
        vehicles={vehicles}
        summary={s}
      />
    </div>
  )
}
