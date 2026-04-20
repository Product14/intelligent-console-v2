"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { writePersistedHoldingState } from "@/lib/holding-cost-config"
import { HoldingCostChatCalculator } from "@/components/max-2/lot-view/holding-cost-chat-calculator"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { holdingCostFigma as HC } from "@/lib/holding-cost-figma-tokens"
import { cn } from "@/lib/utils"

/** @deprecated Import from `@/lib/holding-cost-config` */
export {
  HOLDING_COST_CONFIGURED_LS_KEY,
  HOLDING_COST_DAILY_RATE_LS_KEY,
} from "@/lib/holding-cost-config"

/** Figma `5585:54611` — gradient panel, radius 14 */
function WhyThisMattersCard() {
  return (
    <div
      className="overflow-hidden rounded-[14px] p-4"
      style={{ background: "linear-gradient(90deg, rgba(70,0,242,0.1) 0%, rgba(76,191,255,0.1) 100%)" }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <MaterialSymbol name="smart_toy" size={20} className="shrink-0 text-[#0A0A0A]" />
          <p
            className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-base font-semibold leading-5 text-[#0A0A0A]"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
          >
            Why this matters - Every extra day in stock = money lost
          </p>
        </div>
        {/* AI POWERED badge — opacity-0 per Figma (layout placeholder) */}
        <div className="flex shrink-0 items-center gap-1.5 opacity-0" aria-hidden>
          <MaterialSymbol name="auto_awesome" size={14} className="text-[#8F8F8F]" />
          <span
            className="text-xs font-medium uppercase"
            style={{
              color: HC.aiBadgeInk,
              letterSpacing: "0.12em",
              fontFamily: "Inter, system-ui, sans-serif",
            }}
          >
            AI POWERED
          </span>
        </div>
      </div>
      <ul
        className="mt-4 list-disc space-y-0 pl-5 text-sm font-medium leading-7 text-black/40"
        style={{ fontFamily: "Inter, system-ui, sans-serif" }}
      >
        <li>Your holding cost directly impacts how much profit you lose as inventory ages.</li>
        <li className="text-black/90">
          In your dashboard, you&apos;ll see how holding costs stack up across ageing buckets —
          helping you identify which cars to reprice, liquidate, or exit faster.
        </li>
      </ul>
    </div>
  )
}

export function HoldingCostSetupModals(
  props: {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (dailyRate: number) => void
    /** When true the modal opens directly on the chat calculator, skipping the form. */
    startInChat?: boolean
    /** @deprecated Figma `5585:54497` supplies copy; props kept for call-site compatibility */
    firstRunEyebrow?: string
    /** @deprecated Figma `5585:54497` supplies copy; props kept for call-site compatibility */
    firstRunSubtitle?: string
  },
) {
  const { open, onOpenChange, onSave } = props
  const [showChat, setShowChat] = React.useState(props.startInChat ?? false)
  const [directRate, setDirectRate] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Reset chat/form state every time the modal opens
  React.useEffect(() => {
    if (open) {
      setShowChat(props.startInChat ?? false)
      setDirectRate("")
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const persistAndClose = (dailyRate: number) => {
    writePersistedHoldingState(dailyRate)
    onSave(dailyRate)
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton
          animation="fade"
          closeButtonClassName="text-[#4600F2] opacity-90 hover:opacity-100 data-[state=open]:text-[#4600F2]"
          onOpenAutoFocus={(e) => {
            e.preventDefault()
            inputRef.current?.focus()
          }}
          className={cn(
            "flex w-full max-w-[min(665px,calc(100%-2rem))] flex-col gap-0 overflow-hidden rounded-2xl border p-0 shadow-2xl sm:max-w-[665px]",
            showChat
              ? "h-[min(92vh,680px)]"   /* fixed height → flex-1 scroll area works */
              : "max-h-[min(92vh,800px)]", /* form: natural height, capped */
          )}
          style={{ backgroundColor: HC.surface, borderColor: HC.border }}
        >
          {/* Figma 5585:54498 — thin spectrum bar on top edge */}
          <div
            className="h-[3px] w-full shrink-0 rounded-t-2xl"
            style={{ background: HC.topBarGradient }}
            aria-hidden
          />

          {showChat ? (
            /* ── Chat view — replaces the form entirely ── */
            <div className="relative min-h-0 flex-1 overflow-hidden">
              <HoldingCostChatCalculator
                onSave={(dailyRate) => {
                  if (!Number.isFinite(dailyRate) || dailyRate <= 0) return
                  persistAndClose(dailyRate)
                }}
                onBack={() => setShowChat(false)}
              />
            </div>
          ) : (
            /* ── Form view (default) ── */
            <div className="relative min-h-0 flex-1 overflow-y-auto px-8 pb-8 pt-8">
              {/* soft spectrum glow */}
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[180px]"
                aria-hidden
                style={{
                  background:
                    "radial-gradient(ellipse 100% 100% at 50% -10%, rgba(237,137,57,0.10) 0%, rgba(232,62,84,0.07) 30%, rgba(182,81,215,0.05) 55%, rgba(91,191,246,0.03) 75%, transparent 100%)",
                }}
              />

              {/* faded savings icon */}
              <span
                className="material-symbols-outlined pointer-events-none absolute right-6 top-6 select-none"
                aria-hidden
                style={{
                  fontSize: "140px",
                  backgroundImage:
                    "linear-gradient(135deg, #ED8939 0%, #E83E54 28%, #B651D7 52%, #7F6AF2 72%, #5BBFF6 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  opacity: 0.18,
                  transform: "scaleX(-1)",
                  lineHeight: 1,
                }}
              >
                savings
              </span>

              {/* Eyebrow */}
              <p
                className="relative inline-block bg-clip-text text-lg font-semibold leading-7 text-transparent [-webkit-background-clip:text] [background-clip:text]"
                style={{
                  backgroundImage: HC.titleGradient,
                  fontFamily: "Inter, system-ui, sans-serif",
                  letterSpacing: "-0.02em",
                }}
              >
                Let&apos;s set up your holding cost
              </p>

              <div className="mt-3.5 space-y-2">
                <DialogTitle
                  className="max-w-[410px] text-[31.5px] font-semibold leading-[42px] tracking-[-0.02em] text-black"
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  How much does each car cost you per day?
                </DialogTitle>
                <DialogDescription
                  className="text-sm font-medium leading-5 text-black/40"
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  Every extra day in stock = money lost
                </DialogDescription>
              </div>

              <div className="mt-6 w-full max-w-[418px] space-y-4">
                <div>
                  <label
                    htmlFor="holding-cost-daily-rate"
                    className="mb-2 block text-sm font-medium leading-5 tracking-[-0.02em] text-black"
                    style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                  >
                    Holding cost ($ / car / day)
                  </label>
                  <div
                    className="flex h-14 items-center overflow-hidden rounded-xl border-2 bg-[#FAFAFA] pl-4 pr-3 transition-shadow focus-within:ring-2 focus-within:ring-[#4600F2]/20"
                    style={{ borderColor: HC.primary }}
                  >
                    <span
                      className="select-none text-2xl font-semibold leading-10 text-black/30"
                      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                    >
                      $
                    </span>
                    <input
                      id="holding-cost-daily-rate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={directRate}
                      onChange={(e) => setDirectRate(e.target.value)}
                      placeholder=""
                      className="min-w-0 flex-1 border-0 bg-transparent pl-2 text-2xl font-semibold leading-10 text-black outline-none [appearance:textfield] placeholder:text-black/30 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      ref={inputRef}
                      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                    />
                  </div>
                </div>

                <div
                  className="flex h-8 items-center justify-between gap-3 rounded-lg px-3"
                  style={{ backgroundColor: HC.purpleMutedFill }}
                >
                  <span
                    className="text-xs font-semibold leading-5 text-black"
                    style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                  >
                    Not sure? We&apos;ll calculate it for you
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowChat(true)}
                    className="shrink-0 text-xs font-semibold leading-5"
                    style={{ color: HC.primary, fontFamily: "Inter, system-ui, sans-serif" }}
                  >
                    Let&apos;s calculate →
                  </button>
                </div>

                <button
                  type="button"
                  disabled={!directRate || parseFloat(directRate) <= 0}
                  onClick={() => {
                    const n = parseFloat(directRate)
                    if (!Number.isFinite(n) || n <= 0) return
                    persistAndClose(n)
                  }}
                  className={cn(
                    "flex h-12 w-full items-center justify-center gap-3 rounded-xl text-base font-semibold text-white transition-[filter]",
                    "hover:enabled:brightness-110 disabled:cursor-not-allowed disabled:opacity-50",
                  )}
                  style={{
                    backgroundColor: HC.primary,
                    fontFamily: "Inter, system-ui, sans-serif",
                  }}
                >
                  Calculate impact
                  <MaterialSymbol name="arrow_forward" size={20} />
                </button>
              </div>

              <div className="mt-8">
                <WhyThisMattersCard />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
