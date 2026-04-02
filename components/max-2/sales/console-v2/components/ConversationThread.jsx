"use client"

import { useState } from 'react'
import { Phone, PhoneOff, Calendar, Sparkles, ChevronDown, Info } from 'lucide-react'

/* ── SMS Bubble ─────────────────────────────────────────────────────── */
function SmsBubble({ entry }) {
  const isAgent = entry.agent
  return (
    <div className={`flex ${isAgent ? 'justify-end' : 'justify-start'} mb-3`}>
      <div style={{ maxWidth: '76%' }}>
        <div
          className="px-3 py-2"
          style={{
            background: isAgent ? 'var(--spyne-brand)' : 'var(--spyne-border)',
            color: isAgent ? '#fff' : 'var(--spyne-text-primary)',
            borderRadius: isAgent ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {entry.body}
        </div>
        <p
          style={{
            fontSize: 10,
            color: 'var(--spyne-text-muted)',
            textAlign: isAgent ? 'right' : 'left',
            marginTop: 3,
          }}
        >
          {isAgent ? `Vini AI · ${entry.timestamp}` : entry.timestamp}
        </p>
      </div>
    </div>
  )
}

/* ── Call Card (expandable) ─────────────────────────────────────────── */
function CallCard({ entry }) {
  const [expanded, setExpanded] = useState(false)
  const connected = entry.callOutcome === 'connected'
  const Icon      = connected ? Phone : PhoneOff
  const iconColor = connected ? 'var(--spyne-success-text)' : 'var(--spyne-danger-text)'
  const iconBg    = connected ? 'var(--spyne-success-subtle)' : 'var(--spyne-danger-subtle)'
  const direction = entry.agent ? 'Outbound' : 'Inbound'
  const outcome   =
    entry.callOutcome === 'connected' ? 'Connected' :
    entry.callOutcome === 'no_answer' ? 'No answer' : 'Voicemail'

  return (
    <div
      className="rounded-xl border mb-3"
      style={{ borderColor: 'var(--spyne-border)', background: 'var(--spyne-surface)' }}
    >
      <button
        className="w-full flex items-center gap-3 p-3 cursor-pointer"
        style={{ background: 'none', border: 'none', textAlign: 'left' }}
        onClick={() => setExpanded((v) => !v)}
      >
        <div
          className="flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0"
          style={{ background: iconBg, color: iconColor }}
        >
          <Icon size={13} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--spyne-text-primary)' }}>
              {direction} call · {outcome}
            </span>
            {entry.duration && (
              <span style={{ fontSize: 11, color: 'var(--spyne-text-muted)' }}>· {entry.duration}</span>
            )}
            {entry.agent && (
              <span
                className="spyne-badge"
                style={{
                  fontSize: 10,
                  padding: '1px 6px',
                  background: 'var(--spyne-brand-subtle)',
                  color: 'var(--spyne-brand)',
                  borderColor: 'var(--spyne-brand-muted)',
                }}
              >
                Vini AI
              </span>
            )}
          </div>
          <p
            className="mt-0.5 truncate"
            style={{ fontSize: 12, color: 'var(--spyne-text-secondary)', lineHeight: 1.4 }}
          >
            {entry.body}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span style={{ fontSize: 10, color: 'var(--spyne-text-muted)', whiteSpace: 'nowrap' }}>
            {entry.timestamp}
          </span>
          <ChevronDown
            size={13}
            style={{
              color: 'var(--spyne-text-muted)',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 150ms',
            }}
          />
        </div>
      </button>

      {expanded && entry.transcript && (
        <div
          className="mx-3 mb-3 p-3 rounded-lg"
          style={{ background: 'var(--spyne-bg)' }}
        >
          {entry.transcript.map((line, i) => (
            <p
              key={i}
              style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--spyne-text-secondary)', marginBottom: i < entry.transcript.length - 1 ? 6 : 0 }}
            >
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Stage Change Pill (centered inline) ────────────────────────────── */
function StageChangePill({ entry }) {
  const text =
    entry.fromStage && entry.toStage
      ? `${entry.fromStage} → ${entry.toStage}`
      : entry.body
  return (
    <div
      className="flex items-center justify-center gap-1.5 mb-3"
      style={{
        background: 'var(--spyne-brand-subtle)',
        borderRadius: 6,
        padding: '5px 10px',
      }}
    >
      <Info size={11} style={{ color: 'var(--spyne-brand)', flexShrink: 0 }} />
      <span style={{ fontSize: 11, color: 'var(--spyne-text-muted)' }}>
        {entry.title || 'Stage changed'} ·{' '}
      </span>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--spyne-brand)' }}>{text}</span>
      <span style={{ color: 'var(--spyne-brand-muted)', fontSize: 11 }}>·</span>
      <span style={{ fontSize: 11, color: 'var(--spyne-text-muted)' }}>{entry.timestamp}</span>
    </div>
  )
}

/* ── Appointment Chip ───────────────────────────────────────────────── */
function AppointmentChip({ entry }) {
  return (
    <div
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg border mb-3"
      style={{ background: 'var(--spyne-warning-subtle)', borderColor: 'var(--spyne-warning-muted)' }}
    >
      <Calendar size={13} style={{ color: 'var(--spyne-warning)', flexShrink: 0 }} />
      <div className="flex-1 min-w-0">
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--spyne-warning-text)' }}>
          {entry.title || 'Appointment'}
        </span>
        {entry.body && (
          <span style={{ fontSize: 12, color: 'var(--spyne-warning-text)', opacity: 0.8 }}>
            {' '}· {entry.body}
          </span>
        )}
      </div>
      <span style={{ fontSize: 10, color: 'var(--spyne-text-muted)', whiteSpace: 'nowrap' }}>
        {entry.timestamp}
      </span>
    </div>
  )
}

/* ── Agent Action Chip ──────────────────────────────────────────────── */
function AgentActionChip({ entry }) {
  return (
    <div
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg border mb-3"
      style={{ background: 'var(--spyne-brand-subtle)', borderColor: 'var(--spyne-brand-muted)' }}
    >
      <Sparkles size={13} style={{ color: 'var(--spyne-brand)', flexShrink: 0 }} />
      <p className="flex-1" style={{ fontSize: 12, color: 'var(--spyne-brand)' }}>{entry.body}</p>
      <span style={{ fontSize: 10, color: 'var(--spyne-text-muted)', whiteSpace: 'nowrap' }}>
        {entry.timestamp}
      </span>
    </div>
  )
}

/* ── Main export ────────────────────────────────────────────────────── */
export default function ConversationThread({ timeline }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="flex items-center justify-center py-10">
        <p style={{ fontSize: 13, color: 'var(--spyne-text-muted)' }}>No conversation history yet.</p>
      </div>
    )
  }

  const sorted = [...timeline].sort((a, b) => b.sortKey - a.sortKey)

  return (
    <div>
      {sorted.map((entry) => {
        switch (entry.type) {
          case 'sms':          return <SmsBubble       key={entry.id} entry={entry} />
          case 'call':         return <CallCard         key={entry.id} entry={entry} />
          case 'stage_change': return <StageChangePill key={entry.id} entry={entry} />
          case 'appointment':  return <AppointmentChip key={entry.id} entry={entry} />
          case 'agent_action': return <AgentActionChip key={entry.id} entry={entry} />
          default:             return null
        }
      })}
    </div>
  )
}
