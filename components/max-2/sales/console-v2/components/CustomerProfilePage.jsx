"use client"

import { ArrowLeft, Phone, TrendingUp, TrendingDown, Minus, ChevronRight, Calendar, Clock, Sparkles } from 'lucide-react'
import { customersData } from '../mockData'
import ConversationThread from './ConversationThread'

const STAGE_LABELS = {
  RESEARCH:    'Just Looking',
  SHOPPING:    'Comparing Options',
  EVALUATION:  'Ready to Visit',
  NEGOTIATION: 'Talking Numbers',
  CLOSING:     'Ready to Buy',
}

const STAGE_STYLE = {
  CLOSING:     { bg: 'var(--spyne-brand-subtle)',   color: 'var(--spyne-brand)',          border: 'var(--spyne-brand-muted)' },
  NEGOTIATION: { bg: 'var(--spyne-brand-subtle)',   color: 'var(--spyne-brand)',          border: 'var(--spyne-brand-muted)' },
  EVALUATION:  { bg: 'var(--spyne-warning-subtle)', color: 'var(--spyne-warning-text)',   border: 'var(--spyne-warning-muted)' },
  SHOPPING:    { bg: 'var(--spyne-border)',          color: 'var(--spyne-text-secondary)', border: 'var(--spyne-border-strong)' },
  RESEARCH:    { bg: 'var(--spyne-border)',          color: 'var(--spyne-text-secondary)', border: 'var(--spyne-border-strong)' },
}

const SOURCE_STYLE = {
  'Internet Lead': { bg: 'var(--spyne-info-subtle)',    color: 'var(--spyne-info-text)',      border: 'var(--spyne-info-muted)' },
  'Phone Lead':    { bg: 'var(--spyne-success-subtle)', color: 'var(--spyne-success-text)',   border: 'var(--spyne-success-muted)' },
  'Email Lead':    { bg: 'var(--spyne-brand-subtle)',   color: 'var(--spyne-brand)',           border: 'var(--spyne-brand-muted)' },
  'Walk-in':       { bg: 'var(--spyne-warning-subtle)', color: 'var(--spyne-warning-text)',   border: 'var(--spyne-warning-muted)' },
  'Referral':      { bg: 'var(--spyne-border)',          color: 'var(--spyne-text-secondary)', border: 'var(--spyne-border-strong)' },
}

function StageBadge({ stage }) {
  const ss = STAGE_STYLE[stage] || STAGE_STYLE.RESEARCH
  return (
    <span
      className="spyne-badge"
      style={{ background: ss.bg, color: ss.color, borderColor: ss.border, fontSize: 12, padding: '3px 10px' }}
    >
      {STAGE_LABELS[stage]}
    </span>
  )
}

function EngagementSignal({ trend, detail }) {
  const Icon  = trend === 'improving' ? TrendingUp : trend === 'cooling' ? TrendingDown : Minus
  const color = trend === 'improving' ? 'var(--spyne-success-text)' : trend === 'cooling' ? 'var(--spyne-danger-text)' : 'var(--spyne-text-muted)'
  const bg    = trend === 'improving' ? 'var(--spyne-success-subtle)' : trend === 'cooling' ? 'var(--spyne-danger-subtle)' : 'var(--spyne-border)'

  return (
    <div
      className="flex items-start gap-2 rounded-lg px-3 py-2.5"
      style={{ background: bg }}
    >
      <Icon size={13} style={{ color, flexShrink: 0, marginTop: 1 }} />
      <span style={{ fontSize: 12, color, lineHeight: 1.45 }}>{detail}</span>
    </div>
  )
}

export default function CustomerProfilePage({ customerId, onBack }) {
  const customer = customersData.find((c) => c.id === customerId)

  if (!customer) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '96px 0' }}>
        <p style={{ fontSize: 14, color: 'var(--spyne-text-muted)' }}>Customer not found.</p>
      </div>
    )
  }

  const src = SOURCE_STYLE[customer.source] || SOURCE_STYLE['Referral']

  return (
    <div className="spyne-animate-fade-in">

      {/* ── Top bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          paddingBottom: 12,
          borderBottom: '1px solid var(--spyne-border)',
        }}
      >
        <button onClick={onBack} className="spyne-btn-ghost" style={{ height: 36 }}>
          <ArrowLeft size={14} />
          All Customers
        </button>
        <a
          href={`tel:${customer.phone.replace(/\D/g, '')}`}
          className="spyne-btn-primary"
          style={{ height: 36, textDecoration: 'none' }}
        >
          <Phone size={13} />
          Call Now
        </a>
      </div>

      {/* ── Two-pane layout ── */}
      <div style={{ display: 'flex', gap: 0, alignItems: 'flex-start' }}>

        {/* LEFT PANE */}
        <div
          style={{
            width: '52%',
            paddingRight: 28,
            borderRight: '1px solid var(--spyne-border)',
            position: 'sticky',
            top: 172,
            maxHeight: 'calc(100vh - 172px)',
            overflowY: 'auto',
          }}
        >
          <div style={{ paddingBottom: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Identity */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div
                className={`${customer.avatarColor} flex items-center justify-center rounded-full text-white font-bold flex-shrink-0`}
                style={{ width: 48, height: 48, fontSize: 15 }}
              >
                {customer.initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--spyne-text-primary)', letterSpacing: '-0.018em' }}>
                  {customer.name}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
                  <a
                    href={`tel:${customer.phone.replace(/\D/g, '')}`}
                    style={{ fontSize: 12, color: 'var(--spyne-text-secondary)', textDecoration: 'none' }}
                  >
                    {customer.phone}
                  </a>
                  {customer.email && (
                    <span style={{ fontSize: 12, color: 'var(--spyne-text-muted)' }}>· {customer.email}</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  <StageBadge stage={customer.buyingStage} />
                  <span
                    className="spyne-badge"
                    style={{ background: src.bg, color: src.color, borderColor: src.border }}
                  >
                    {customer.source}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--spyne-text-muted)' }}>{customer.salesperson}</span>
                </div>
              </div>
            </div>

            {/* Engagement signal */}
            <EngagementSignal trend={customer.engagementTrend} detail={customer.engagementDetail} />

            {/* Stage progression */}
            {customer.stageHistory && customer.stageHistory.length > 1 && (
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
                  {[...customer.stageHistory].reverse().map((t, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {i > 0 && <ChevronRight size={10} style={{ color: 'var(--spyne-text-muted)' }} />}
                      <StageBadge stage={t.stage} />
                    </div>
                  ))}
                </div>
                <p
                  style={{ fontSize: 11, color: 'var(--spyne-text-muted)', marginTop: 4, fontWeight: 500 }}
                >
                  Updated {customer.stageHistory[0].timestamp} · by {customer.stageHistory[0].source}
                </p>
              </div>
            )}

            {/* Next appointment */}
            {customer.nextAppointment && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  background: 'var(--spyne-warning-subtle)',
                  border: '1px solid var(--spyne-warning-muted)',
                  borderRadius: 12,
                }}
              >
                <Calendar size={13} style={{ color: 'var(--spyne-warning)', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--spyne-warning-text)' }}>
                    {customer.nextAppointment.type}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--spyne-text-muted)' }}>
                    {customer.nextAppointment.date}
                  </p>
                </div>
              </div>
            )}

            {/* Action items */}
            {customer.actionItems && customer.actionItems.length > 0 && (
              <div
                style={{
                  padding: '12px 14px',
                  background: 'var(--spyne-surface)',
                  border: '1px solid var(--spyne-border)',
                  borderRadius: 12,
                }}
              >
                <p className="spyne-subheading" style={{ marginBottom: 8 }}>Action Items</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {customer.actionItems.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <span style={{ fontSize: 12, color: 'var(--spyne-brand)', marginTop: 1, flexShrink: 0 }}>•</span>
                      <p style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--spyne-text-secondary)' }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Buyer intent */}
            <div
              style={{
                padding: '14px 14px',
                background: 'var(--spyne-surface)',
                border: '1px solid var(--spyne-border)',
                borderRadius: 12,
              }}
            >
              <p className="spyne-subheading" style={{ marginBottom: 10 }}>Buyer Intent</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
                {customer.budget && (
                  <div>
                    <p className="spyne-caption">Budget</p>
                    <p className="spyne-label">{customer.budget}</p>
                  </div>
                )}
                <div>
                  <p className="spyne-caption">Finance type</p>
                  <p className="spyne-label">{customer.financeType}</p>
                </div>
                {customer.useCase && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <p className="spyne-caption">Use case</p>
                    <p className="spyne-label">{customer.useCase}</p>
                  </div>
                )}
              </div>
              {customer.features && customer.features.length > 0 && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--spyne-border)' }}>
                  <p className="spyne-caption" style={{ marginBottom: 6 }}>Must-haves</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {customer.features.map((f) => (
                      <span key={f} className="spyne-badge spyne-badge-neutral">{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Lead with this */}
            <div
              style={{
                padding: '14px 14px',
                background: 'var(--spyne-brand-subtle)',
                borderTop: '1px solid var(--spyne-brand-muted)',
                borderRight: '1px solid var(--spyne-brand-muted)',
                borderBottom: '1px solid var(--spyne-brand-muted)',
                borderLeft: '4px solid var(--spyne-brand)',
                borderRadius: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Sparkles size={13} style={{ color: 'var(--spyne-brand)' }} />
                <p
                  className="spyne-subheading"
                  style={{ color: 'var(--spyne-brand)', textTransform: 'uppercase' }}
                >
                  Lead with this
                </p>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--spyne-text-primary)' }}>
                {customer.conversationOpener}
              </p>
            </div>

            {/* Vehicle interest */}
            <div>
              <p className="spyne-subheading" style={{ marginBottom: 8 }}>Vehicle Interest</p>
              <div
                style={{
                  padding: '14px 14px',
                  background: 'var(--spyne-surface)',
                  border: '1px solid var(--spyne-border)',
                  borderRadius: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--spyne-text-primary)' }}>
                    {customer.vehicle}
                  </p>
                  <span className="spyne-badge spyne-badge-success" style={{ flexShrink: 0 }}>In Stock</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: 'var(--spyne-text-primary)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    ${customer.vehiclePrice.toLocaleString()}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: customer.vehicleDaysOnLot > 30 ? 'var(--spyne-warning-text)' : 'var(--spyne-text-muted)',
                      fontWeight: customer.vehicleDaysOnLot > 30 ? 600 : 400,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                    }}
                  >
                    <Clock size={11} />
                    {customer.vehicleDaysOnLot} days on lot{customer.vehicleDaysOnLot > 30 ? ' ⚠' : ''}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT PANE — conversation thread */}
        <div style={{ flex: 1, paddingLeft: 28, minWidth: 0 }}>
          <p className="spyne-subheading" style={{ marginBottom: 16 }}>Conversation History</p>
          <ConversationThread timeline={customer.timeline} />
        </div>

      </div>
    </div>
  )
}
