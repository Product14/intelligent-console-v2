"use client"

import { MaterialSymbol } from '@/components/max-2/material-symbol'

const COLORS = ['#4F46E5', '#0D9488', '#D97706', '#7C3AED', '#0EA5E9']
const LOT_WARN = 30 // days before showing warning color

export default function HotVehiclesCard({ data }) {
  const maxLeads = Math.max(...data.map((d) => d.leads), 1)
  const maxDays  = Math.max(...data.map((d) => d.daysOnLot), 1)

  return (
    <div className="spyne-card p-5 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <MaterialSymbol name="local_fire_department" size={14} style={{ color: '#EF4444' }} />
        <div className="spyne-heading">Hot Vehicles</div>
        <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)', marginLeft: 2 }}>most leads right now</span>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {data.map((item, i) => {
          const color       = COLORS[i % COLORS.length]
          const leadPct     = Math.round((item.leads / maxLeads) * 100)
          const dayPct      = Math.round((item.daysOnLot / maxDays) * 100)
          const daysIsWarm  = item.daysOnLot > LOT_WARN
          const daysColor   = item.daysOnLot > 45 ? '#EF4444' : daysIsWarm ? '#D97706' : 'var(--spyne-text-muted)'

          return (
            <div key={item.vehicle}>
              {/* Line 1: vehicle name */}
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--spyne-text-primary)', marginBottom: 3, lineHeight: 1.2 }}>
                {item.vehicle}
              </p>

              {/* Line 2: leads + days on lot */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                  {item.leads}
                </span>
                <span style={{ fontSize: 10, color: 'var(--spyne-text-muted)', fontWeight: 500 }}>leads</span>
                <span style={{ fontSize: 10, color: 'var(--spyne-success-text)', fontWeight: 600, background: 'var(--spyne-success-subtle)', borderRadius: 'var(--spyne-radius-pill)', padding: '1px 6px', whiteSpace: 'nowrap' }}>
                  +{item.newThisWeek} this week
                </span>
                <span style={{ width: 1, height: 10, background: 'var(--spyne-border)', flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: daysColor, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                  {item.daysOnLot}
                </span>
                <span style={{ fontSize: 10, color: 'var(--spyne-text-muted)', fontWeight: 500 }}>days on lot</span>
              </div>

              {/* Dual bar: leads (top), days on lot (bottom) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ height: 4, background: 'var(--spyne-border)', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: `${leadPct}%`, background: color, borderRadius: 2, transition: 'width 400ms ease' }} />
                </div>
                <div style={{ height: 4, background: 'var(--spyne-border)', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: `${dayPct}%`, background: daysColor, borderRadius: 2, opacity: 0.6, transition: 'width 400ms ease' }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
