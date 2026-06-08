"use client"

import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { Sparkles, ArrowRight, X } from "lucide-react"
import { useState } from "react"

/**
 * VINI AI Insights — top-of-page strip that frames the agent as a colleague,
 * not a tool. Each card is an observation + a one-click action.
 *
 * The differentiator vs. Pam / generic dashboards: the AI tells you what to do,
 * not just what happened.
 */

const DEFAULT_INSIGHTS = [
  {
    id: "ev-cluster",
    icon: "trending_up",
    accent: "#6366f1",
    accentBg: "#f5f3ff",
    title: "14 leads asked about EV inventory this week",
    body: "All 14 mentioned 2024 RAV4 Prime or Tesla Y — we don't have either on the lot. Want me to enable a notify-when-available campaign?",
    actionLabel: "Launch EV waitlist",
    actionTarget: "campaigns",
  },
  {
    id: "no-show",
    icon: "event_busy",
    accent: "#dc2626",
    accentBg: "#fef2f2",
    title: "5 appointments no-showed yesterday",
    body: "All 5 were booked >5 days out. Same-day follow-up converts 38% better than next-day. Want me to send recovery SMS now?",
    actionLabel: "Send recovery SMS",
    actionTarget: "appointments",
  },
  {
    id: "dormant-spike",
    icon: "schedule",
    accent: "#0891b2",
    accentBg: "#ecfeff",
    title: "Dormant pool grew by 47 leads in 7 days",
    body: "Avg last-contact: 38 days. Lease-end candidates make up 60% of the pool. A targeted lease-end campaign typically books 12% of these.",
    actionLabel: "Build lease-end campaign",
    actionTarget: "campaigns",
  },
]

export default function ViniInsightsStrip({ onAction }) {
  const [dismissed, setDismissed] = useState([])
  const visible = DEFAULT_INSIGHTS.filter((i) => !dismissed.includes(i.id))

  if (visible.length === 0) return null

  return (
    <section className="rounded-2xl border border-[#e9e5fb] bg-gradient-to-br from-[#fbfaff] via-[#f8f6ff] to-white overflow-hidden">
      <header className="flex items-center justify-between px-5 py-3 border-b border-[#ece8f9]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-[#111]">VINI noticed a few things today</p>
            <p className="text-[11px] text-[#6b7280] leading-tight">{visible.length} insight{visible.length === 1 ? "" : "s"} · updated just now</p>
          </div>
        </div>
        <button className="text-[11px] font-medium text-[#6b7280] hover:text-[#111] transition-colors">
          View all
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-[#ece8f9]">
        {visible.map((insight) => (
          <article key={insight.id} className="relative px-4 py-4 flex flex-col gap-2.5 group">
            <button
              onClick={() => setDismissed((p) => [...p, insight.id])}
              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-[#f3f4f6]"
              aria-label="Dismiss"
            >
              <X size={11} className="text-[#9ca3af]" />
            </button>

            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: insight.accentBg }}
              >
                <MaterialSymbol name={insight.icon} size={15} style={{ color: insight.accent }} />
              </div>
              <p className="text-[12.5px] font-semibold text-[#111] leading-snug pr-4">{insight.title}</p>
            </div>

            <p className="text-[11.5px] text-[#4b5563] leading-snug">{insight.body}</p>

            <button
              onClick={() => onAction?.(insight.actionTarget, insight.id)}
              className="self-start mt-1 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition-colors hover:opacity-90"
              style={{ background: insight.accent, color: "white" }}
            >
              {insight.actionLabel}
              <ArrowRight size={10} strokeWidth={2.5} />
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}
