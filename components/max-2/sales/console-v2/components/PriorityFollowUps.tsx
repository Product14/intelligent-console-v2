"use client"

import { useState } from "react"
import { SpyneLineTab, SpyneLineTabBadge, SpyneLineTabStrip } from "@/components/max-2/spyne-line-tabs"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import InfoTooltip from "./InfoTooltip"

const TABS = [
  { id: "todaysCallbacks", label: "Today's Callbacks" },
  { id: "hot", label: "Hot" },
  { id: "warm", label: "Warm" },
] as const

const TAG_VARIANTS: Record<string, string> = {
  "Callback Requested": "spyne-badge-info",
  "Needs human attention": "spyne-badge-danger",
  "Follow-up needed": "spyne-badge-warning",
}

const SERVICE_PRIORITY_BADGE: Record<string, string> = {
  urgent: "spyne-badge-danger",
  high: "spyne-badge-warning",
}

type SalesLead = {
  id: number
  initials: string
  color: string
  name: string
  timeAgo: string
  message: string
  tag: string
  tagColor?: string
  scheduledTime?: string
}

type SalesFollowUps = {
  todaysCallbacks: SalesLead[]
  hot: SalesLead[]
  warm: SalesLead[]
}

export type ServicePriorityFollowUpItem = {
  id: string
  initials: string
  color: string
  name: string
  timeAgo: string
  message: string
  priority: "urgent" | "high"
}

export type PriorityFollowUpsProps =
  | { variant?: "sales"; followUps: SalesFollowUps }
  | { variant: "service"; items: ServicePriorityFollowUpItem[]; urgentCount?: number }

export default function PriorityFollowUps(props: PriorityFollowUpsProps) {
  if (props.variant === "service") {
    return (
      <ServicePriorityFollowUpsBody items={props.items} urgentCount={props.urgentCount} />
    )
  }
  return <SalesPriorityFollowUpsBody followUps={props.followUps} />
}

function ServicePriorityFollowUpsBody({
  items,
  urgentCount,
}: {
  items: ServicePriorityFollowUpItem[]
  urgentCount?: number
}) {
  return (
    <div className="spyne-card spyne-animate-fade-in flex flex-col gap-4 p-4" style={{ animationDelay: "100ms" }}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className={spyneComponentClasses.cardTitle}>Priority Follow-ups</span>
          <InfoTooltip text="Customers who need advisor action after Mark flagged no-shows, pending RO approval, or overdue service with no response." />
        </div>
        {urgentCount != null ? (
          <span className="spyne-caption shrink-0 tabular-nums text-spyne-text-secondary">{urgentCount} urgent</span>
        ) : null}
      </div>
      <div className="max-h-[280px] flex-1 space-y-3 overflow-y-auto">
        {items.map((lead) => (
          <div key={lead.id} className="flex items-start gap-2.5">
            <div
              className={`${lead.color} flex h-7 w-7 shrink-0 items-center justify-center text-white`}
              style={{ borderRadius: "50%", fontSize: 11, fontWeight: 700 }}
            >
              {lead.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="spyne-label" style={{ color: "var(--spyne-text-primary)", fontWeight: 700 }}>
                  {lead.name}
                </span>
                <span className="spyne-caption shrink-0" style={{ color: "var(--spyne-text-muted)" }}>
                  {lead.timeAgo}
                </span>
              </div>
              <div className="spyne-caption mt-0.5 truncate" style={{ color: "var(--spyne-text-secondary)" }}>
                {lead.message}
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className={`spyne-badge ${SERVICE_PRIORITY_BADGE[lead.priority] ?? "spyne-badge-neutral"}`}>
                  {lead.priority === "urgent" ? "Urgent" : "High"}
                </span>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 ? (
          <div className="py-6 text-center spyne-caption" style={{ color: "var(--spyne-text-muted)" }}>
            No priority follow-ups
          </div>
        ) : null}
      </div>
    </div>
  )
}

function SalesPriorityFollowUpsBody({ followUps }: { followUps: SalesFollowUps }) {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["id"]>("todaysCallbacks")
  const items = followUps[activeTab] ?? []

  const tabBadge = {
    todaysCallbacks: followUps.todaysCallbacks?.length,
    hot: followUps.hot?.length,
    warm: followUps.warm?.length,
  }

  return (
    <div className="spyne-card spyne-animate-fade-in flex flex-col gap-4 p-4" style={{ animationDelay: "100ms" }}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className={spyneComponentClasses.cardTitle}>Priority Follow-ups</span>
          <InfoTooltip text="High-priority leads flagged by Vini for human review. These are leads that showed strong intent signals (e.g. repeated visits, price requests, trade-in questions) but have not yet converted to an appointment." />
        </div>
      </div>
      <SpyneLineTabStrip bleed compact tight>
        {TABS.map((tab) => {
          const count = tabBadge[tab.id]
          return (
            <SpyneLineTab
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="whitespace-nowrap"
            >
              {tab.label}
              {count ? <SpyneLineTabBadge>{count}</SpyneLineTabBadge> : null}
            </SpyneLineTab>
          )
        })}
      </SpyneLineTabStrip>
      <div className="max-h-[280px] flex-1 space-y-3 overflow-y-auto">
        {items.map((lead) => (
          <div key={lead.id} className="flex items-start gap-2.5">
            <div
              className={`${lead.color} flex h-7 w-7 shrink-0 items-center justify-center text-white`}
              style={{ borderRadius: "50%", fontSize: 11, fontWeight: 700 }}
            >
              {lead.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="spyne-label" style={{ color: "var(--spyne-text-primary)", fontWeight: 700 }}>
                  {lead.name}
                </span>
                <span className="spyne-caption shrink-0" style={{ color: "var(--spyne-text-muted)" }}>
                  {lead.timeAgo}
                </span>
              </div>
              <div
                className="spyne-caption mt-0.5 truncate italic"
                style={{ color: "var(--spyne-text-secondary)" }}
              >
                {lead.message}
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className={`spyne-badge ${TAG_VARIANTS[lead.tag] ?? "spyne-badge-neutral"}`}>{lead.tag}</span>
                {lead.scheduledTime ? (
                  <span className="spyne-caption" style={{ color: "var(--spyne-text-muted)" }}>
                    {lead.scheduledTime}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 ? (
          <div className="py-6 text-center spyne-caption" style={{ color: "var(--spyne-text-muted)" }}>
            No leads in this category
          </div>
        ) : null}
      </div>
    </div>
  )
}
