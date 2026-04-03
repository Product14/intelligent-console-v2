"use client"

import React, { useState } from 'react'
import { Search, Phone, MessageSquare, LayoutList, Columns, AlertTriangle, FileText } from 'lucide-react'
import { customersData, serviceLeadsData } from '../mockData'
import { SERVICE_CONSOLE_TAB_CONTENT } from '@/lib/max-2/service-console-tab-content'
import CustomerOverviewPanel from './CustomerOverviewPanel'
import { SpyneSegmentedButton, SpyneSegmentedControl } from '@/components/max-2/spyne-toolbar-controls'
import { max2Classes, spyneSalesLayout } from '@/lib/design-system/max-2'
import { cn } from '@/lib/utils'
import { CHART_SERIES, SPYNE, SPYNE_SOFT_BG } from '../spyne-palette'

const STAGE_LABELS = {
  RESEARCH:    'Just Looking',
  SHOPPING:    'Comparing Options',
  EVALUATION:  'Ready to Visit',
  NEGOTIATION: 'Talking Numbers',
  CLOSING:     'Ready to Buy',
}

/** Semantic badge variants — fills from `.max2-spyne .spyne-badge-*` (design system) */
const STAGE_BADGE_CLASS = {
  CLOSING:     'spyne-badge-brand',
  NEGOTIATION: 'spyne-badge-brand',
  EVALUATION:  'spyne-badge-warning',
  SHOPPING:    'spyne-badge-neutral',
  RESEARCH:    'spyne-badge-neutral',
}

const SOURCE_BADGE_CLASS = {
  'Internet Lead': 'spyne-badge-info',
  'Phone Lead':    'spyne-badge-success',
  'Email Lead':    'spyne-badge-brand',
  'Walk-in':       'spyne-badge-warning',
  'Referral':      'spyne-badge-neutral',
  'Online Scheduler': 'spyne-badge-info',
  'Service Campaign': 'spyne-badge-brand',
}

const TEMP_CONFIG = {
  HOT:  { color: SPYNE.error, label: 'Hot' },
  WARM: { color: SPYNE.warningInk, label: 'Warm' },
  COLD: { color: SPYNE.textSecondary, label: 'Cold' },
}
const TEMP_ORDER = { HOT: 0, WARM: 1, COLD: 2 }

const FILTERS = [
  { id: 'all',             label: 'All' },
  { id: 'appointment_set', label: 'Appointment Set' },
  { id: 'qualified',       label: 'Qualified' },
  { id: 'cooling',         label: 'Cooling' },
  { id: 'in_progress',     label: 'In Progress' },
  { id: 'needs_attention', label: 'Needs Attention' },
]

const COLS = ['Customer', 'Stage', 'Temperature', 'Vehicle', 'Last Interaction ↓', 'Salesperson', 'Next Appt', '']

const SERVICE_COLS = ['Guest', 'Lead status', 'Temperature', 'Vehicle / RO', 'Last interaction ↓', 'Advisor', 'Next appt', '']

// Swimlane columns — 5 pipeline stages
const SWIMLANE_COLS = [
  { key: 'NEW',               label: 'New Leads',         color: SPYNE.textSecondary, bg: SPYNE_SOFT_BG.neutral },
  { key: 'ENGAGED',           label: 'Engaged Leads',     color: SPYNE.info, bg: SPYNE_SOFT_BG.info },
  { key: 'QUALIFIED',         label: 'Qualified',         color: SPYNE.warningInk, bg: SPYNE_SOFT_BG.warning },
  { key: 'APPOINTMENT_BOOKED', label: 'Appointment Booked', color: SPYNE.primary, bg: SPYNE_SOFT_BG.primary },
  { key: 'STORE_VISIT',       label: 'Store Visit',       color: SPYNE.success, bg: SPYNE_SOFT_BG.success },
]

// Simple hash for avatar background
function avatarBg(name) {
  const colors = CHART_SERIES
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % colors.length
  return colors[h]
}

function FunnelBar({ data }) {
  const counts = SWIMLANE_COLS.map(col => ({
    ...col,
    count: data.filter(c => c.swimlaneStage === col.key).length,
  }))
  const max = Math.max(...counts.map(c => c.count), 1)

  return (
    <div className="spyne-card p-4 mb-4">
      <div className="flex items-end gap-0 h-full">
        {counts.map((col, i) => (
          <div key={col.key} className="flex-1 flex flex-col items-center gap-1.5">
            {/* Bar */}
            <div className="w-full flex items-end justify-center" style={{ height: 32 }}>
              <div
                style={{
                  width: '85%',
                  height: Math.max(6, (col.count / max) * 32),
                  background: col.color,
                  borderRadius: '3px 3px 0 0',
                  opacity: 0.85,
                  transition: 'height 300ms ease',
                }}
              />
            </div>
            {/* Count */}
            <span style={{ fontSize: 18, fontWeight: 700, color: col.color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
              {col.count}
            </span>
            {/* Label */}
            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--spyne-text-muted)', textAlign: 'center', lineHeight: 1.3 }}>
              {col.label}
            </span>
            {/* Arrow connector */}
            {i < counts.length - 1 && (
              <div style={{ position: 'absolute' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function SwimlaneCard({ customer, onViewProfile, isService = false }) {
  const bg = avatarBg(customer.name)
  const srcCls = SOURCE_BADGE_CLASS[customer.source] || SOURCE_BADGE_CLASS.Referral
  const temp = TEMP_CONFIG[customer.temperature]
  const statusLabel = isService && customer.serviceStageLabel ? customer.serviceStageLabel : null

  return (
    <div
      className="spyne-card-interactive p-3 flex flex-col gap-2"
      style={{ cursor: 'pointer', position: 'relative' }}
      onClick={() => onViewProfile && onViewProfile(customer.id)}
    >
      {/* Needs Attention badge */}
      {customer.needsAttention && (
        <div
          title={customer.attentionReason}
          style={{ position: 'absolute', top: 8, right: 8 }}
        >
          <AlertTriangle size={13} style={{ color: SPYNE.warningInk }} />
        </div>
      )}

      {/* Name + avatar */}
      <div className="flex items-center gap-2">
        <div
          className="flex items-center justify-center rounded-full shrink-0 text-white font-bold"
          style={{ width: 28, height: 28, fontSize: 10, background: bg }}
        >
          {customer.initials}
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--spyne-text-primary)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: customer.needsAttention ? 16 : 0 }}>
          {customer.name}
        </span>
      </div>

      {/* Temperature dot + label */}
      {temp && (
        <div className="flex items-center gap-1.5">
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: temp.color, display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontSize: 10, fontWeight: 600, color: temp.color }}>{temp.label}</span>
        </div>
      )}

      {/* Source badge */}
      <span className={cn('spyne-badge w-fit', srcCls)}>
        {customer.source}
      </span>

      {statusLabel && (
        <span className={cn('spyne-badge w-fit spyne-badge-neutral')}>
          {statusLabel}
        </span>
      )}

      {/* Vehicle */}
      <div style={{ fontSize: 11, color: 'var(--spyne-text-secondary)', fontWeight: 500, lineHeight: 1.3 }}>
        {customer.vehicle}
      </div>

      {/* Budget or RO summary */}
      {isService ? (
        customer.roSummary && (
          <div style={{ fontSize: 11, color: 'var(--spyne-text-muted)' }}>
            RO: <span style={{ color: 'var(--spyne-text-primary)', fontWeight: 600 }}>{customer.roSummary}</span>
          </div>
        )
      ) : (
        <div style={{ fontSize: 11, color: 'var(--spyne-text-muted)' }}>
          Budget: <span style={{ color: 'var(--spyne-text-primary)', fontWeight: 600 }}>{customer.budget}</span>
        </div>
      )}

      {/* Notes preview */}
      {customer.notes && (
        <div style={{ fontSize: 10, color: 'var(--spyne-text-muted)', lineHeight: 1.4, borderTop: '1px solid var(--spyne-border)', paddingTop: 6, marginTop: 2 }}>
          {customer.notes.length > 60 ? customer.notes.slice(0, 60) + '…' : customer.notes}
        </div>
      )}

      {/* Footer: date + salesperson */}
      <div className="flex items-center justify-between" style={{ marginTop: 2 }}>
        <span style={{ fontSize: 10, color: 'var(--spyne-text-muted)' }}>{customer.lastContact}</span>
        <span
          style={{
            fontSize: 10, fontWeight: 600, color: 'var(--spyne-text-secondary)',
            background: 'var(--spyne-bg)', border: '1px solid var(--spyne-border)',
            borderRadius: 'var(--spyne-radius-sm)', padding: '1px 6px',
          }}
        >
          {customer.salesperson}
        </span>
      </div>
    </div>
  )
}

function SwimlaneView({ data, onViewProfile, emptyColumnLabel = 'No leads', isService = false }) {
  return (
    <div className="min-w-0 overflow-x-auto">
      <div
        style={{
          display: 'grid',
          width: 'max(100%, 1048px)',
          gridTemplateColumns: 'repeat(5, minmax(200px, 1fr))',
          gap: 12,
          alignItems: 'start',
        }}
      >
        {SWIMLANE_COLS.map((col) => {
          const cards = data
            .filter(c => c.swimlaneStage === col.key)
            .sort((a, b) => {
              const tDiff = (TEMP_ORDER[a.temperature] ?? 3) - (TEMP_ORDER[b.temperature] ?? 3)
              if (tDiff !== 0) return tDiff
              return b.lastInteractedTs - a.lastInteractedTs
            })
          return (
            <div key={col.key}>
              {/* Column header */}
              <div
                className="flex items-center justify-between px-3 py-2 mb-2 rounded-lg"
                style={{ background: col.bg, border: `1px solid ${col.color}22`, borderTop: `3px solid ${col.color}` }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: col.color }}>{col.label}</span>
                <span
                  style={{
                    minWidth: 18, height: 18, borderRadius: 'var(--spyne-radius-pill)',
                    padding: '0 5px', background: col.color, color: '#fff',
                    fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {cards.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2">
                {cards.length === 0 ? (
                  <div style={{ fontSize: 11, color: 'var(--spyne-text-muted)', textAlign: 'center', padding: '16px 8px' }}>
                    {emptyColumnLabel}
                  </div>
                ) : (
                  cards.map((c) => (
                    <SwimlaneCard key={c.id} customer={c} onViewProfile={onViewProfile} isService={isService} />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function CustomerListingPage({ onViewProfile, department = 'sales' }) {
  const isService = department === 'service'
  const roster = isService ? serviceLeadsData : customersData

  const [search,       setSearch]       = useState('')
  const [filter,       setFilter]       = useState('all')
  const [selectedId,   setSelectedId]   = useState(null)
  const [tooltipId,    setTooltipId]    = useState(null)
  const [view,         setView]         = useState(isService ? 'table' : 'swimlane')
  const [expandedNote, setExpandedNote] = useState(null) // customer id with note open
  const [editedNotes,  setEditedNotes]  = useState({})   // local edits: { [id]: string }

  const sorted = [...roster].sort((a, b) => b.lastInteractedTs - a.lastInteractedTs)

  const filtered = sorted.filter((c) => {
    const q = search.toLowerCase()
    const roQ = (c.roSummary && c.roSummary.toLowerCase()) || ''
    const stageQ = (c.serviceStageLabel && c.serviceStageLabel.toLowerCase()) || ''
    const matchSearch =
      c.name.toLowerCase().includes(q) ||
      c.vehicle.toLowerCase().includes(q) ||
      c.salesperson.toLowerCase().includes(q) ||
      (isService && (roQ.includes(q) || stageQ.includes(q)))
    const matchFilter =
      filter === 'all' ||
      (filter === 'cooling' && c.engagementTrend === 'cooling') ||
      (filter === 'needs_attention' && c.needsAttention) ||
      c.outcome === filter
    return matchSearch && matchFilter
  })

  function getNoteText(c) {
    return editedNotes[c.id] !== undefined ? editedNotes[c.id] : (c.notes ?? '')
  }

  const selectedCustomer = roster.find((c) => c.id === selectedId) ?? null
  const visibleCols = (isService ? SERVICE_COLS : COLS).map((c) =>
    isService && c === 'Advisor' ? SERVICE_CONSOLE_TAB_CONTENT.customers.columnAdvisor : c,
  )

  return (
    <div className="relative min-w-0 spyne-animate-fade-in">
      <div className={spyneSalesLayout.pageStack}>
        {/* Sticky page header — matches Sales Overview / Appointments */}
        <div
          className={cn(
            'sticky z-[30] -mx-max2-page bg-spyne-page px-max2-page pt-6 pb-3 -mt-6',
            'top-[6rem] lg:top-10',
          )}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className={max2Classes.pageTitle}>
                {isService ? SERVICE_CONSOLE_TAB_CONTENT.customers.pageTitle : 'Leads'}
              </h1>
              <p className={`${max2Classes.pageDescription} mt-0.5`}>
                {roster.length} total ·{' '}
                {view === 'swimlane'
                  ? isService
                    ? SERVICE_CONSOLE_TAB_CONTENT.customers.pageDescriptionPipeline
                    : 'pipeline view'
                  : isService
                    ? SERVICE_CONSOLE_TAB_CONTENT.customers.pageDescriptionTable
                    : 'sorted by most recent interaction'}
              </p>
            </div>
            <SpyneSegmentedControl
              aria-label={isService ? SERVICE_CONSOLE_TAB_CONTENT.customers.viewAriaLabel : 'Leads view'}
              className="shrink-0"
            >
              <SpyneSegmentedButton active={view === 'swimlane'} onClick={() => setView('swimlane')}>
                <Columns size={14} strokeWidth={2} aria-hidden />
                Pipeline
              </SpyneSegmentedButton>
              <SpyneSegmentedButton active={view === 'table'} onClick={() => setView('table')}>
                <LayoutList size={14} strokeWidth={2} aria-hidden />
                Table
              </SpyneSegmentedButton>
            </SpyneSegmentedControl>
          </div>
        </div>

        <div className="min-w-0 space-y-6">
        {/* Search + filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-shrink-0" style={{ width: 240 }}>
            <Search
              size={13}
              className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: 10, color: 'var(--spyne-text-muted)' }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                isService
                  ? SERVICE_CONSOLE_TAB_CONTENT.customers.searchPlaceholder
                  : 'Search name, vehicle, salesperson…'
              }
              className="spyne-input w-full"
              style={{ paddingLeft: 30, fontSize: 12 }}
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`spyne-pill ${filter === f.id ? 'spyne-pill-active' : ''}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Swimlane view */}
        {view === 'swimlane' && (
          <SwimlaneView
            data={filtered}
            onViewProfile={(id) => setSelectedId(id)}
            emptyColumnLabel={isService ? SERVICE_CONSOLE_TAB_CONTENT.customers.swimlaneEmpty : 'No leads'}
            isService={isService}
          />
        )}

        {/* Table view */}
        {view === 'table' && (
          <div className="spyne-card overflow-hidden">
            <div className="overflow-x-auto">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--spyne-border)', background: 'var(--spyne-bg)' }}>
                    {visibleCols.map((col) => (
                      <th
                        key={col}
                        style={{
                          textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 600,
                          letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                          color: /last interaction/i.test(col) ? 'var(--spyne-brand)' : 'var(--spyne-text-muted)',
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => {
                    const stageCls = STAGE_BADGE_CLASS[c.buyingStage] || STAGE_BADGE_CLASS.RESEARCH
                    const srcCls   = SOURCE_BADGE_CLASS[c.source]     || SOURCE_BADGE_CLASS.Referral
                    const temp   = TEMP_CONFIG[c.temperature]
                    const active = selectedId === c.id
                    const hasNote = c.notes || editedNotes[c.id]
                    const noteOpen = expandedNote === c.id
                    const leadStatusLabel = isService && c.serviceStageLabel ? c.serviceStageLabel : STAGE_LABELS[c.buyingStage]

                    return (
                      <React.Fragment key={c.id}>
                      <tr
                        onClick={() => setSelectedId(active ? null : c.id)}
                        style={{
                          borderBottom: noteOpen ? 'none' : '1px solid var(--spyne-border)',
                          background: active ? 'var(--spyne-brand-subtle)' : 'var(--spyne-surface)',
                          cursor: 'pointer', transition: 'background 150ms',
                        }}
                        onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--spyne-bg)' }}
                        onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'var(--spyne-surface)' }}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div
                              className="flex items-center justify-center rounded-full text-white font-bold flex-shrink-0"
                              style={{ width: 32, height: 32, fontSize: 11, background: avatarBg(c.name) }}
                            >
                              {c.initials}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--spyne-text-primary)' }}>{c.name}</p>
                                {c.needsAttention && (
                                  <span title={c.attentionReason} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: '50%', background: SPYNE_SOFT_BG.warning, flexShrink: 0 }}>
                                    <AlertTriangle size={9} style={{ color: SPYNE.warningInk }} />
                                  </span>
                                )}
                              </div>
                              <span className={cn('spyne-badge mt-0.5 inline-flex', srcCls)}>
                                {c.source}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span className={cn('spyne-badge', stageCls)}>
                            {leadStatusLabel}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {temp && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <span style={{ width: 8, height: 8, borderRadius: '50%', background: temp.color, display: 'inline-block', flexShrink: 0 }} />
                              <span style={{ fontSize: 12, fontWeight: 600, color: temp.color }}>{temp.label}</span>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px', minWidth: 160 }}>
                          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--spyne-text-primary)' }}>{c.vehicle}</p>
                          {isService ? (
                            c.roSummary && (
                              <p style={{ fontSize: 11, color: 'var(--spyne-text-muted)', marginTop: 2, lineHeight: 1.35 }}>
                                {c.roSummary}
                              </p>
                            )
                          ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                            <span style={{ fontSize: 11, color: 'var(--spyne-text-muted)', fontVariantNumeric: 'tabular-nums' }}>${c.vehiclePrice.toLocaleString()}</span>
                            {c.vehicleDaysOnLot > 30 && (
                              <span style={{ fontSize: 11, color: 'var(--spyne-warning-text)', fontWeight: 600 }}>⚠ {c.vehicleDaysOnLot}d on lot</span>
                            )}
                          </div>
                          )}
                        </td>
                        <td
                          style={{ padding: '12px 16px', minWidth: 180, position: 'relative' }}
                          onMouseEnter={() => setTooltipId(c.id)}
                          onMouseLeave={() => setTooltipId(null)}
                        >
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--spyne-text-primary)' }}>{c.lastContact}</p>
                          <p style={{ fontSize: 11, color: 'var(--spyne-text-muted)', marginTop: 2, maxWidth: 200, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            {c.lastInteractionSummary}
                          </p>
                          {tooltipId === c.id && (
                            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50, width: 280, background: 'var(--spyne-text-primary)', color: '#fff', borderRadius: 10, padding: '10px 14px', fontSize: 12, lineHeight: 1.6, boxShadow: 'var(--spyne-shadow-lg)', pointerEvents: 'none' }}>
                              <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{c.lastInteracted}</p>
                              {c.lastInteractionSummary}
                            </div>
                          )}
                        </td>
                        {!selectedCustomer && (
                          <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                            <p style={{ fontSize: 13, color: 'var(--spyne-text-secondary)' }}>{c.salesperson}</p>
                          </td>
                        )}
                        {!selectedCustomer && (
                          <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                            {c.nextAppointment ? (
                              <div>
                                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--spyne-warning-text)' }}>{c.nextAppointment.date}</p>
                                <p style={{ fontSize: 11, color: 'var(--spyne-text-muted)' }}>{c.nextAppointment.type}</p>
                              </div>
                            ) : (
                              <span style={{ fontSize: 12, color: 'var(--spyne-text-muted)' }}>—</span>
                            )}
                          </td>
                        )}
                        <td style={{ padding: '12px 16px' }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <a href={`tel:${c.phone.replace(/\D/g, '')}`} className="spyne-btn-ghost" style={{ padding: '4px 8px', height: 28 }} aria-label={`Call ${c.name}`}>
                              <Phone size={12} />
                            </a>
                            <button className="spyne-btn-ghost" style={{ padding: '4px 8px', height: 28 }} aria-label={`Message ${c.name}`}>
                              <MessageSquare size={12} />
                            </button>
                            <button
                              className="spyne-btn-ghost"
                              style={{ padding: '4px 8px', height: 28, color: hasNote ? 'var(--spyne-brand)' : 'var(--spyne-text-muted)' }}
                              aria-label={`Notes for ${c.name}`}
                              onClick={(e) => { e.stopPropagation(); setExpandedNote(noteOpen ? null : c.id) }}
                            >
                              <FileText size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {noteOpen && (
                        <tr key={`${c.id}-note`} style={{ borderBottom: '1px solid var(--spyne-border)', background: active ? 'var(--spyne-brand-subtle)' : 'var(--spyne-bg)' }}>
                          <td colSpan={visibleCols.length} style={{ padding: '0 16px 12px 58px' }}>
                            <textarea
                              value={getNoteText(c)}
                              onChange={(e) => setEditedNotes(n => ({ ...n, [c.id]: e.target.value }))}
                              placeholder="Add a note…"
                              rows={2}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                width: '100%', resize: 'vertical', fontSize: 12, lineHeight: 1.5,
                                padding: '8px 10px', borderRadius: 'var(--spyne-radius-md)',
                                border: '1px solid var(--spyne-border)', background: 'var(--spyne-surface)',
                                color: 'var(--spyne-text-primary)', fontFamily: 'inherit', outline: 'none',
                              }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                              <button
                                className="spyne-btn-primary"
                                style={{ height: 28, fontSize: 12, padding: '0 12px' }}
                                onClick={(e) => { e.stopPropagation(); setExpandedNote(null) }}
                              >
                                Save
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                      </React.Fragment>
                    )
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={visibleCols.length} style={{ padding: '48px 16px', textAlign: 'center' }}>
                        <p style={{ fontSize: 13, color: 'var(--spyne-text-muted)' }}>No customers match your search or filter.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </div>
      </div>

      {selectedCustomer && (
        <CustomerOverviewPanel
          customer={selectedCustomer}
          onClose={() => setSelectedId(null)}
          onViewProfile={() => {
            setSelectedId(null)
            onViewProfile(selectedCustomer.id)
          }}
        />
      )}
    </div>
  )
}
