"use client"

import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { cn } from "@/lib/utils"
import InfoTooltip from "./InfoTooltip"

/**
 * Call Handling & Routing — how inbound calls are answered, routed and handed off.
 * Covers: calls handled, transfers to a human (handoff), overflow Vini caught when the
 * team was busy, actions pending, after-hours vs during-hours capture, and call intent.
 *
 * TODO: GET /api/dealer/:dealerId/agent/call-handling?type=inbound&period=<range>
 */
export default function CallHandlingPanel({ data }) {
  const intentMax = Math.max(...data.intents.map((i) => i.value), 1)

  return (
    <div className="spyne-card flex h-full flex-col gap-5 p-4 lg:p-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <h3 className="spyne-subheading m-0">Call Handling &amp; Routing</h3>
          <InfoTooltip text="How inbound calls are answered, routed and handed off — transfers to a human, overflow Vini caught when the team was busy, and the actions still pending." />
        </div>
        <span className="spyne-caption shrink-0 text-spyne-text-secondary">{data.period}</span>
      </div>

      {/* headline stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon="call" value={data.callsHandled} label="calls handled" />
        <Stat icon="support_agent" value={data.transferred} label="transferred to human" />
        <Stat icon="call_received" value={data.overflowCaptured} label="overflow captured" green />
        <Stat icon="pending_actions" value={data.actionsPending} label="actions pending" warn />
      </div>

      {/* during vs after hours */}
      <div className="grid grid-cols-2 gap-3">
        <HoursCell icon="light_mode" title="During hours" leads={data.duringHours.leads} appts={data.duringHours.appts} />
        <HoursCell icon="dark_mode" title="After hours" leads={data.afterHours.leads} appts={data.afterHours.appts} accent />
      </div>

      {/* call intent */}
      <div className="min-w-0">
        <p className="spyne-label m-0 mb-2.5 font-semibold text-spyne-text-secondary">Call intent</p>
        <div className="flex flex-col gap-2">
          {data.intents.map((it) => (
            <div key={it.label} className="flex items-center gap-3">
              <span className="spyne-caption w-36 shrink-0 truncate text-spyne-text-secondary">{it.label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: "var(--spyne-border)" }}>
                <div className="h-2 rounded-full" style={{ width: `${(it.value / intentMax) * 100}%`, background: it.color }} />
              </div>
              <span className="spyne-caption w-7 shrink-0 text-right font-semibold tabular-nums text-spyne-text-primary">
                {it.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Stat({ icon, value, label, green, warn }) {
  const color = green ? "var(--spyne-success)" : warn ? "var(--spyne-warning-ink)" : "var(--spyne-text-primary)"
  return (
    <div className="flex flex-col gap-2 rounded-[var(--spyne-radius-md)] border border-spyne-border bg-spyne-surface p-3.5 shadow-[var(--spyne-card-shadow)]">
      <div className="flex items-center gap-2">
        <MaterialSymbol name={icon} size={20} style={{ color: green ? "var(--spyne-success)" : "var(--spyne-text-secondary)" }} />
        <span className="spyne-number min-w-0 flex-1 text-[22px] leading-none" style={{ color }}>
          {value}
        </span>
      </div>
      <div className="spyne-caption pl-7 leading-snug text-spyne-text-secondary">{label}</div>
    </div>
  )
}

function HoursCell({ icon, title, leads, appts, accent }) {
  return (
    <div
      className="flex items-center gap-3 rounded-[var(--spyne-radius-md)] border border-spyne-border p-3.5"
      style={accent ? { background: "var(--spyne-primary-soft)" } : undefined}
    >
      <MaterialSymbol name={icon} size={22} style={{ color: accent ? "var(--spyne-primary)" : "var(--spyne-text-secondary)" }} />
      <div className="min-w-0">
        <p className="spyne-caption m-0 text-spyne-text-secondary">{title}</p>
        <p className="spyne-label m-0 font-semibold text-spyne-text-primary">
          <span className="tabular-nums">{leads}</span> leads
          <span className="font-normal text-spyne-text-secondary"> · </span>
          <span className="tabular-nums text-spyne-success">{appts}</span> appts
        </p>
      </div>
    </div>
  )
}
