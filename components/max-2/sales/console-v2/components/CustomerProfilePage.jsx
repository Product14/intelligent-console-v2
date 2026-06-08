"use client"

import { useState } from 'react'
import { MaterialSymbol } from '@/components/max-2/material-symbol'
import { max2Classes, spyneSalesLayout } from '@/lib/design-system/max-2'
import { cn } from '@/lib/utils'
import { customersData, serviceLeadsData } from '../mockData'
import { SERVICE_CONSOLE_TAB_CONTENT } from '@/lib/max-2/service-console-tab-content'
import ConversationThread from './ConversationThread'
import { CustomerIntelligencePanel } from './CustomerIntelligencePanel'

const STAGE_LABELS = {
  RESEARCH: 'Just Looking',
  SHOPPING: 'Comparing Options',
  EVALUATION: 'Ready to Visit',
  NEGOTIATION: 'Talking Numbers',
  CLOSING: 'Ready to Buy',
}
const STAGE_BADGE_CLASS = {
  CLOSING: 'spyne-badge-brand', NEGOTIATION: 'spyne-badge-brand',
  EVALUATION: 'spyne-badge-warning', SHOPPING: 'spyne-badge-neutral', RESEARCH: 'spyne-badge-neutral',
}
const SOURCE_BADGE_CLASS = {
  'Internet Lead': 'spyne-badge-info', 'Phone Lead': 'spyne-badge-success', 'Email Lead': 'spyne-badge-brand',
  'Walk-in': 'spyne-badge-warning', 'Referral': 'spyne-badge-neutral', 'Online Scheduler': 'spyne-badge-info', 'Service Campaign': 'spyne-badge-brand',
}
const TEMP_META = {
  HOT: { label: 'Hot', color: 'var(--spyne-danger-text)', bg: 'var(--spyne-danger-subtle)' },
  WARM: { label: 'Warm', color: 'var(--spyne-warning-text)', bg: 'var(--spyne-warning-subtle)' },
  COLD: { label: 'Cold', color: 'var(--spyne-info-text)', bg: 'var(--spyne-info-subtle)' },
}
const SRC_CAMPAIGN = {
  'Internet Lead': 'Speed to Lead — Internet Leads',
  'Phone Lead': 'Inbound Phone Follow-up',
  'Email Lead': 'Email Nurture Drip',
  'Walk-in': 'Showroom Follow-up',
  'Referral': 'Referral Welcome',
}

function deriveChannels(timeline = []) {
  let call = 0, sms = 0, email = 0
  for (const t of timeline) {
    if (t.type === 'call') call++
    else if (t.type === 'sms') sms++
    else if (t.type === 'email') email++
  }
  return { call, sms, email, total: call + sms + email }
}

function deriveCampaign(c) {
  const name = SRC_CAMPAIGN[c.source] ?? 'Lead Follow-up'
  const totalDays = 14
  const dayN = Math.min(totalDays, Math.max(1, c.touchCount ?? 3))
  const outcome =
    c.outcome === 'appointment_set' ? 'Appointment booked' :
    c.swimlaneStage === 'STORE_VISIT' ? 'Store visit' :
    c.outcome === 'qualified' ? 'Qualified lead' :
    c.buyingStage === 'CLOSING' ? 'Ready to buy' : null
  const met = Boolean(outcome)
  return { name, dayN, totalDays, status: met ? 'ended' : 'active', outcome, met }
}

function StageBadge({ stage, labelOverride }) {
  const cls = STAGE_BADGE_CLASS[stage] || STAGE_BADGE_CLASS.RESEARCH
  return <span className={cn('spyne-badge', cls)}>{labelOverride || STAGE_LABELS[stage]}</span>
}

export default function CustomerProfilePage({ customerId, onBack, department = 'sales' }) {
  const isService = department === 'service'
  const roster = isService ? serviceLeadsData : customersData
  const customer = roster.find((c) => c.id === customerId)

  const [driver, setDriver] = useState('ai') // 'ai' | 'human'
  const [convoExpanded, setConvoExpanded] = useState(false)
  const [intelOpen, setIntelOpen] = useState(false)

  if (!customer) {
    return (
      <div className="flex min-h-[240px] items-center justify-center py-16">
        <p className="spyne-body text-spyne-text-secondary">
          {isService ? SERVICE_CONSOLE_TAB_CONTENT.customerProfile.notFound : 'Lead not found.'}
        </p>
      </div>
    )
  }

  const srcCls = SOURCE_BADGE_CLASS[customer.source] || SOURCE_BADGE_CLASS.Referral
  const temp = TEMP_META[customer.temperature] || TEMP_META.WARM
  const channels = deriveChannels(customer.timeline)
  const campaign = deriveCampaign(customer)
  const phoneHref = `tel:${(customer.phone || '').replace(/\D/g, '')}`
  const summary = customer.lastInteractionSummary || customer.conversationOpener

  return (
    <div className={cn('spyne-animate-fade-in', spyneSalesLayout.pageStack)}>
      {/* Back */}
      <button type="button" onClick={onBack} className="spyne-btn-ghost w-fit">
        <MaterialSymbol name="arrow_back" size={16} />
        {isService ? SERVICE_CONSOLE_TAB_CONTENT.customerProfile.backToList : 'All Leads'}
      </button>

      {/* ── Hero header ── */}
      <div className="spyne-card p-4">
        <div className="flex flex-wrap items-start gap-3">
          <div className={cn(customer.avatarColor, 'flex items-center justify-center rounded-full font-bold text-white')} style={{ width: 52, height: 52, fontSize: 17, flexShrink: 0 }}>
            {customer.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className={max2Classes.pageTitle}>{customer.name}</h1>
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide" style={{ background: temp.bg, color: temp.color }}>
                <span className="size-1.5 rounded-full" style={{ background: temp.color }} /> {temp.label}
              </span>
              <StageBadge stage={customer.buyingStage} labelOverride={isService ? customer.serviceStageLabel : undefined} />
              <span className={cn('spyne-badge', srcCls)}>{customer.source}</span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]" style={{ color: 'var(--spyne-text-secondary)' }}>
              <a href={phoneHref} className="no-underline" style={{ color: 'var(--spyne-text-secondary)' }}>{customer.phone}</a>
              {customer.email && <span style={{ color: 'var(--spyne-text-muted)' }}>· {customer.email}</span>}
              <span style={{ color: 'var(--spyne-text-muted)' }}>· {customer.salesperson}</span>
              <span style={{ color: 'var(--spyne-text-muted)' }}>· last touch {customer.lastContact}</span>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
            <a href={phoneHref} className="spyne-btn-primary no-underline"><MaterialSymbol name="phone" size={16} /> Call</a>
            <button className="spyne-btn-secondary"><MaterialSymbol name="sms" size={16} /> Message</button>
            <button className="spyne-btn-secondary"><MaterialSymbol name="event" size={16} /> Schedule</button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.55fr_1fr]">
        {/* LEFT — conversation */}
        <div className="min-w-0">
          <ConversationPanel
            customer={customer}
            channels={channels}
            driver={driver}
            onDriver={setDriver}
            expanded={convoExpanded}
            onToggleExpand={() => setConvoExpanded((v) => !v)}
          />
        </div>

        {/* RIGHT — context */}
        <div className="flex min-w-0 flex-col gap-3">
          {/* Lead summary */}
          <ContextCard icon="auto_awesome" title="Lead summary" accent>
            <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--spyne-text-primary)' }}>{summary}</p>
            {customer.lastSignal && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium" style={{ color: 'var(--spyne-success-text)' }}>
                <MaterialSymbol name="trending_up" size={14} /> {customer.lastSignal}
              </div>
            )}
          </ContextCard>

          {/* Channel activity */}
          <ContextCard icon="forum" title="Channel activity">
            <div className="grid grid-cols-3 gap-2">
              <ChannelStatBig icon="phone" n={channels.call} label="Calls" />
              <ChannelStatBig icon="sms" n={channels.sms} label="Texts" />
              <ChannelStatBig icon="mail" n={channels.email} label="Emails" />
            </div>
            <p className="mt-2 text-[11px]" style={{ color: 'var(--spyne-text-muted)' }}>
              {customer.touchCount ?? channels.total} total touches · last contact {customer.lastContact}
            </p>
          </ContextCard>

          {/* Campaign */}
          <ContextCard icon="campaign" title="Campaign">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold" style={{ color: 'var(--spyne-text-primary)' }}>{campaign.name}</p>
                <p className="mt-0.5 text-[11px]" style={{ color: 'var(--spyne-text-muted)' }}>
                  {campaign.status === 'ended' ? `Campaign ended · day ${campaign.dayN} of ${campaign.totalDays}` : `Day ${campaign.dayN} of ${campaign.totalDays} · running`}
                </p>
              </div>
              <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={campaign.status === 'ended' ? { background: 'var(--spyne-success-subtle)', color: 'var(--spyne-success-text)' } : { background: 'var(--spyne-info-subtle)', color: 'var(--spyne-info-text)' }}>
                {campaign.status === 'ended' ? 'Ended' : 'Active'}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 rounded-lg px-2 py-1.5" style={{ background: campaign.met ? 'var(--spyne-success-subtle)' : 'var(--spyne-page-bg)' }}>
              <span className="inline-flex" style={{ color: campaign.met ? 'var(--spyne-success-text)' : 'var(--spyne-text-muted)' }}><MaterialSymbol name={campaign.met ? 'check_circle' : 'radio_button_unchecked'} size={16} /></span>
              <span className="text-[11.5px] font-medium" style={{ color: campaign.met ? 'var(--spyne-success-text)' : 'var(--spyne-text-secondary)' }}>
                {campaign.met ? `Outcome met — ${campaign.outcome}` : 'Outcome not yet met'}
              </span>
            </div>
          </ContextCard>

          {/* Action items */}
          <ContextCard icon="checklist" title="Action items" count={customer.actionItems?.length ?? 0}>
            {customer.actionItems && customer.actionItems.length > 0 ? (
              <ul className="flex flex-col gap-1.5">
                {customer.actionItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] leading-snug" style={{ color: 'var(--spyne-text-secondary)' }}>
                    <span className="mt-1 size-1.5 shrink-0 rounded-full" style={{ background: 'var(--spyne-brand)' }} />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[12px]" style={{ color: 'var(--spyne-text-muted)' }}>No open action items — Vini is on track.</p>
            )}
          </ContextCard>

          {/* At a glance */}
          <ContextCard icon="directions_car" title="At a glance">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              <Glance label="Vehicle" value={customer.vehicle} />
              <Glance label="Price" value={customer.vehiclePrice != null ? `$${customer.vehiclePrice.toLocaleString()}` : '—'} />
              <Glance label="Budget" value={customer.budget || '—'} />
              <Glance label="Finance" value={customer.financeType || '—'} />
              {customer.nextAppointment && <Glance label="Next appt" value={`${customer.nextAppointment.type ?? 'TBD'} · ${customer.nextAppointment.date ?? 'TBD'}`} span />}
            </div>
          </ContextCard>

          {/* Full intelligence (collapsible) */}
          {!isService && (
            <div className="spyne-card overflow-hidden p-0">
              <button onClick={() => setIntelOpen((v) => !v)} className="spyne-focus-ring flex w-full items-center gap-2 px-3.5 py-3 text-left transition-colors hover:bg-[var(--spyne-page-bg)]">
                <span className="inline-flex" style={{ color: 'var(--spyne-brand)' }}><MaterialSymbol name="psychology" size={16} /></span>
                <span className="text-[12.5px] font-bold" style={{ color: 'var(--spyne-text-primary)' }}>Full customer intelligence</span>
                <span className="ml-auto inline-flex" style={{ color: 'var(--spyne-text-muted)' }}><MaterialSymbol name={intelOpen ? 'expand_less' : 'expand_more'} size={20} /></span>
              </button>
              {intelOpen && <div className="border-t border-spyne-border p-3.5"><CustomerIntelligencePanel customer={customer} /></div>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Conversation panel (the centerpiece) ────────────────────────── */

function ConversationPanel({ customer, channels, driver, onDriver, expanded, onToggleExpand }) {
  const isHuman = driver === 'human'
  return (
    <div className="spyne-card flex flex-col p-0">
      {/* Header: channel activity + driver control */}
      <div className="flex flex-wrap items-center gap-3 border-b border-spyne-border px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex" style={{ color: 'var(--spyne-brand)' }}><MaterialSymbol name="forum" size={16} /></span>
          <span className="text-[13.5px] font-bold" style={{ color: 'var(--spyne-text-primary)' }}>Conversation</span>
          <span className="text-[11px]" style={{ color: 'var(--spyne-text-muted)' }}>· {customer.touchCount ?? channels.total} touches</span>
        </div>

        {/* Driver toggle */}
        <div className="ml-auto flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10.5px] font-bold uppercase tracking-wide" style={isHuman ? { background: 'var(--spyne-warning-subtle)', color: 'var(--spyne-warning-text)' } : { background: 'var(--spyne-brand-subtle)', color: 'var(--spyne-brand)' }}>
            <span className="size-1.5 rounded-full" style={{ background: isHuman ? 'var(--spyne-warning-text)' : 'var(--spyne-brand)' }} />
            {isHuman ? 'You’re handling it' : 'Vini AI is handling it'}
          </span>
          {isHuman ? (
            <button onClick={() => onDriver('ai')} className="spyne-btn-secondary !h-8 !text-[11.5px]"><MaterialSymbol name="smart_toy" size={16} /> Give back to Vini</button>
          ) : (
            <button onClick={() => onDriver('human')} className="spyne-btn-primary !h-8 !text-[11.5px]"><MaterialSymbol name="pan_tool" size={16} /> Take over</button>
          )}
        </div>
      </div>

      {/* Takeover banner */}
      {isHuman && (
        <div role="status" aria-live="polite" className="flex items-center gap-2 border-b border-spyne-border px-4 py-2" style={{ background: 'var(--spyne-warning-subtle)' }}>
          <span className="inline-flex" style={{ color: 'var(--spyne-warning-text)' }}><MaterialSymbol name="info" size={14} /></span>
          <p className="text-[11.5px]" style={{ color: 'var(--spyne-warning-text)' }}>You’ve taken over — Vini paused outreach to this lead. Give it back when you’re done so automation resumes.</p>
        </div>
      )}

      {/* Thread (collapsible) */}
      <div className="relative px-4 py-3">
        <div className="overflow-hidden transition-all" style={{ maxHeight: expanded ? 'none' : 360 }}>
          <ConversationThread timeline={customer.timeline} />
        </div>
        {!expanded && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16" style={{ background: 'linear-gradient(to bottom, transparent, var(--spyne-card-bg))' }} />
        )}
      </div>
      <div className="border-t border-spyne-border px-4 py-2 text-center">
        <button onClick={onToggleExpand} className="spyne-focus-ring inline-flex items-center gap-1 rounded text-[12px] font-semibold" style={{ color: 'var(--spyne-brand)' }}>
          {expanded ? 'Collapse' : `Expand full conversation history${customer.timeline?.length ? ` (${customer.timeline.length})` : ''}`}
          <MaterialSymbol name={expanded ? 'expand_less' : 'expand_more'} size={14} />
        </button>
      </div>

      {/* Human compose (only when taken over) */}
      {isHuman && (
        <div className="flex items-center gap-2 border-t border-spyne-border p-3">
          <input placeholder="Reply to the lead…" className="spyne-input h-9 flex-1" style={{ fontSize: 12.5 }} />
          <button className="spyne-btn-primary"><MaterialSymbol name="send" size={16} /> Send</button>
        </div>
      )}
    </div>
  )
}

function ChannelStatBig({ icon, n, label }) {
  return (
    <div className="flex flex-col items-center rounded-lg py-2" style={{ background: 'var(--spyne-page-bg)' }}>
      <span className="inline-flex" style={{ color: 'var(--spyne-brand)' }}><MaterialSymbol name={icon} size={16} /></span>
      <span className="mt-1 text-[16px] font-bold leading-none tabular-nums" style={{ color: 'var(--spyne-text-primary)' }}>{n}</span>
      <span className="mt-0.5 text-[10px] uppercase tracking-wide" style={{ color: 'var(--spyne-text-muted)' }}>{label}</span>
    </div>
  )
}

/* ── Small parts ─────────────────────────────────────────────────── */

function ContextCard({ icon, title, count, accent, children }) {
  return (
    <div className="spyne-card p-3.5" style={accent ? { borderLeft: '3px solid var(--spyne-brand)' } : undefined}>
      <div className="mb-2 flex items-center gap-1.5">
        <span className="inline-flex" style={{ color: accent ? 'var(--spyne-brand)' : 'var(--spyne-text-muted)' }}><MaterialSymbol name={icon} size={14} /></span>
        <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: accent ? 'var(--spyne-brand)' : 'var(--spyne-text-secondary)' }}>{title}</span>
        {count != null && (
          <span className="ml-auto inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold" style={{ background: 'var(--spyne-page-bg)', color: 'var(--spyne-text-secondary)' }}>{count}</span>
        )}
      </div>
      {children}
    </div>
  )
}

function Glance({ label, value, span }) {
  return (
    <div style={span ? { gridColumn: '1 / -1' } : undefined}>
      <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--spyne-text-muted)' }}>{label}</p>
      <p className="mt-0.5 text-[12.5px] font-semibold" style={{ color: 'var(--spyne-text-primary)' }}>{value}</p>
    </div>
  )
}
