"use client"

import { MaterialSymbol } from "@/components/max-2/material-symbol"

interface AgentData {
  name: string
  role: string
  status: string
  liveSince: string
  todayCalls: number
  todayRouted: number
  lastCallRelative: string
  avatarLetter: string
}

const SECTION_LABEL_STYLE: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--spyne-text-muted)",
}

function StatCell({ value, label, accent }: { value: number | string; label: string; accent?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className="tabular-nums"
        style={{
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
          color: accent ? "var(--spyne-brand)" : "var(--spyne-text-primary)",
        }}
      >
        {value}
      </span>
      <span style={{ fontSize: 11, color: "var(--spyne-text-muted)" }}>{label}</span>
    </div>
  )
}

export function ReceptionistAgentCard({ agent }: { agent: AgentData }) {
  const isOnline = agent.status === "Live"
  return (
    <div className="spyne-card spyne-animate-fade-in flex flex-col overflow-hidden">
      {/* Agent header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="relative shrink-0">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-full text-base font-bold text-white"
            style={{
              background: "linear-gradient(135deg, var(--spyne-brand), color-mix(in srgb, var(--spyne-brand) 65%, black))",
              border: isOnline ? "2.5px solid var(--spyne-success)" : "2px solid var(--spyne-border)",
            }}
          >
            {agent.avatarLetter}
          </div>
          <span
            className="absolute bottom-0 right-0 h-3 w-3 rounded-full"
            style={{
              background: isOnline ? "var(--spyne-success)" : "var(--spyne-text-muted)",
              border: "2px solid var(--spyne-surface)",
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--spyne-text-primary)" }}>{agent.name}</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--spyne-text-muted)", marginTop: 1 }}>{agent.role}</div>
        </div>
      </div>

      <div className="border-t border-spyne-border" />

      <div className="flex flex-1 flex-col gap-3 px-4 py-3">
        <div style={SECTION_LABEL_STYLE}>Today&apos;s Activity</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <StatCell value={agent.todayCalls} label="calls so far" />
          <StatCell value={agent.todayRouted} label="routed successfully" accent />
        </div>
        <div className="mt-1 rounded-md bg-spyne-surface-hover px-2.5 py-2 text-[11px] text-spyne-text-muted">
          <strong className="text-spyne-text-primary">On track</strong> — typical Tuesday handles 10–14 by now.
        </div>
      </div>

      <div className="border-t border-spyne-border px-4 py-3 text-[12px]" style={{ color: "var(--spyne-text-muted)" }}>
        <div>
          Last call <strong style={{ color: "var(--spyne-text-primary)", fontWeight: 600 }}>· {agent.lastCallRelative}</strong>
        </div>
        <div className="mt-1">
          Status <strong style={{ color: "var(--spyne-success)", fontWeight: 600 }}>· {agent.status}</strong> since {agent.liveSince}
        </div>
      </div>
    </div>
  )
}
