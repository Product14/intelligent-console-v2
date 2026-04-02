"use client"

import { useState } from 'react'
import { Search, Phone, MessageSquare, LayoutList, Columns } from 'lucide-react'
import { customersData } from '../mockData'
import CustomerOverviewPanel from './CustomerOverviewPanel'

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

const FILTERS = [
  { id: 'all',             label: 'All' },
  { id: 'appointment_set', label: 'Appointment Set' },
  { id: 'qualified',       label: 'Qualified' },
  { id: 'cooling',         label: 'Cooling' },
  { id: 'in_progress',     label: 'In Progress' },
]

const COLS = ['Customer', 'Stage', 'Vehicle', 'Last Interaction ↓', 'Salesperson', 'Next Appt', '']

// Swimlane columns — 5 pipeline stages
const SWIMLANE_COLS = [
  { key: 'NEW',               label: 'New Leads',         color: '#94A3B8', bg: '#F8FAFC' },
  { key: 'ENGAGED',           label: 'Engaged Leads',     color: '#0EA5E9', bg: '#F0F9FF' },
  { key: 'QUALIFIED',         label: 'Qualified',         color: '#F59E0B', bg: '#FFFBEB' },
  { key: 'APPOINTMENT_BOOKED', label: 'Appointment Booked', color: '#4F46E5', bg: '#EEF2FF' },
  { key: 'STORE_VISIT',       label: 'Store Visit',       color: '#10B981', bg: '#ECFDF5' },
]

// Simple hash for avatar background
function avatarBg(name) {
  const colors = ['#4F46E5','#0D9488','#D97706','#7C3AED','#0EA5E9','#10B981','#EF4444','#F59E0B']
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

function SwimlaneCard({ customer, onViewProfile }) {
  const bg = avatarBg(customer.name)
  const src = SOURCE_STYLE[customer.source] || SOURCE_STYLE['Referral']

  return (
    <div
      className="spyne-card-interactive p-3 flex flex-col gap-2"
      style={{ cursor: 'pointer' }}
      onClick={() => onViewProfile && onViewProfile(customer.id)}
    >
      {/* Name + avatar */}
      <div className="flex items-center gap-2">
        <div
          className="flex items-center justify-center rounded-full shrink-0 text-white font-bold"
          style={{ width: 28, height: 28, fontSize: 10, background: bg }}
        >
          {customer.initials}
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--spyne-text-primary)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {customer.name}
        </span>
      </div>

      {/* Source badge */}
      <span className="spyne-badge" style={{ fontSize: 10, padding: '1px 6px', background: src.bg, color: src.color, borderColor: src.border, width: 'fit-content' }}>
        {customer.source}
      </span>

      {/* Vehicle */}
      <div style={{ fontSize: 11, color: 'var(--spyne-text-secondary)', fontWeight: 500, lineHeight: 1.3 }}>
        {customer.vehicle}
      </div>

      {/* Budget */}
      <div style={{ fontSize: 11, color: 'var(--spyne-text-muted)' }}>
        Budget: <span style={{ color: 'var(--spyne-text-primary)', fontWeight: 600 }}>{customer.budget}</span>
      </div>

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

function SwimlaneView({ data, onViewProfile }) {
  return (
    <div>
      <FunnelBar data={data} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, alignItems: 'start' }}>
        {SWIMLANE_COLS.map((col) => {
          const cards = data.filter(c => c.swimlaneStage === col.key)
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
                    No leads
                  </div>
                ) : (
                  cards.map((c) => (
                    <SwimlaneCard key={c.id} customer={c} onViewProfile={onViewProfile} />
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

export default function CustomerListingPage({ onViewProfile }) {
  const [search,     setSearch]     = useState('')
  const [filter,     setFilter]     = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const [tooltipId,  setTooltipId]  = useState(null)
  const [view,       setView]       = useState('swimlane')

  const sorted = [...customersData].sort((a, b) => b.lastInteractedTs - a.lastInteractedTs)

  const filtered = sorted.filter((c) => {
    const q = search.toLowerCase()
    const matchSearch =
      c.name.toLowerCase().includes(q) ||
      c.vehicle.toLowerCase().includes(q) ||
      c.salesperson.toLowerCase().includes(q)
    const matchFilter =
      filter === 'all' ||
      (filter === 'cooling' && c.engagementTrend === 'cooling') ||
      c.outcome === filter
    return matchSearch && matchFilter
  })

  const selectedCustomer = customersData.find((c) => c.id === selectedId) ?? null
  const visibleCols = COLS

  return (
    <>

      {/* ── Left: content ── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Page header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="spyne-title" style={{ color: 'var(--spyne-text-primary)' }}>Leads</h1>
            <p className="spyne-body-sm mt-0.5" style={{ color: 'var(--spyne-text-muted)' }}>
              {customersData.length} total · {view === 'swimlane' ? 'pipeline view' : 'sorted by most recent interaction'}
            </p>
          </div>

          {/* View toggle */}
          <div className="flex" style={{ border: '1px solid var(--spyne-border)', borderRadius: 'var(--spyne-radius-md)', overflow: 'hidden' }}>
            <button
              onClick={() => setView('swimlane')}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '0 12px', height: 32, fontSize: 12, border: 'none', cursor: 'pointer',
                background: view === 'swimlane' ? 'var(--spyne-brand-subtle)' : 'var(--spyne-surface)',
                color: view === 'swimlane' ? 'var(--spyne-brand)' : 'var(--spyne-text-muted)',
                fontWeight: view === 'swimlane' ? 600 : 500, fontFamily: 'inherit',
                borderRight: '1px solid var(--spyne-border)',
              }}
            >
              <Columns size={12} />Pipeline
            </button>
            <button
              onClick={() => setView('table')}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '0 12px', height: 32, fontSize: 12, border: 'none', cursor: 'pointer',
                background: view === 'table' ? 'var(--spyne-brand-subtle)' : 'var(--spyne-surface)',
                color: view === 'table' ? 'var(--spyne-brand)' : 'var(--spyne-text-muted)',
                fontWeight: view === 'table' ? 600 : 500, fontFamily: 'inherit',
              }}
            >
              <LayoutList size={12} />Table
            </button>
          </div>
        </div>

        {/* Search + filters */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-shrink-0" style={{ width: 240 }}>
            <Search
              size={13}
              className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: 10, color: 'var(--spyne-text-muted)' }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, vehicle, salesperson…"
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
          <SwimlaneView data={filtered} onViewProfile={(id) => setSelectedId(id)} />
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
                          color: col === 'Last Interaction ↓' ? 'var(--spyne-brand)' : 'var(--spyne-text-muted)',
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => {
                    const ss     = STAGE_STYLE[c.buyingStage] || STAGE_STYLE.RESEARCH
                    const src    = SOURCE_STYLE[c.source]     || SOURCE_STYLE['Referral']
                    const active = selectedId === c.id

                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedId(active ? null : c.id)}
                        style={{
                          borderBottom: '1px solid var(--spyne-border)',
                          background: active ? 'var(--spyne-brand-subtle)' : 'var(--spyne-surface)',
                          cursor: 'pointer', transition: 'background 150ms',
                        }}
                        onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--spyne-bg)' }}
                        onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'var(--spyne-surface)' }}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div
                              className={`${c.avatarColor} flex items-center justify-center rounded-full text-white font-bold flex-shrink-0`}
                              style={{ width: 32, height: 32, fontSize: 11 }}
                            >
                              {c.initials}
                            </div>
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--spyne-text-primary)' }}>{c.name}</p>
                              <span className="spyne-badge" style={{ marginTop: 2, display: 'inline-flex', fontSize: 10, padding: '1px 6px', background: src.bg, color: src.color, borderColor: src.border }}>
                                {c.source}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span className="spyne-badge" style={{ background: ss.bg, color: ss.color, borderColor: ss.border }}>
                            {STAGE_LABELS[c.buyingStage]}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', minWidth: 160 }}>
                          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--spyne-text-primary)' }}>{c.vehicle}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                            <span style={{ fontSize: 11, color: 'var(--spyne-text-muted)', fontVariantNumeric: 'tabular-nums' }}>${c.vehiclePrice.toLocaleString()}</span>
                            {c.vehicleDaysOnLot > 30 && (
                              <span style={{ fontSize: 11, color: 'var(--spyne-warning-text)', fontWeight: 600 }}>⚠ {c.vehicleDaysOnLot}d on lot</span>
                            )}
                          </div>
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
                          </div>
                        </td>
                      </tr>
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

      {/* ── Overlay panel ── */}
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
    </>
  )
}
