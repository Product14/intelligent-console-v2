"use client"

import { useState } from 'react'
import { MaterialSymbol } from '@/components/max-2/material-symbol'
import { spyneComponentClasses } from '@/lib/design-system/max-2'
import InfoTooltip from './InfoTooltip'

export default function UpcomingAppointments({ appointments, variant = 'sales' }) {
  const [activeTab, setActiveTab] = useState('today')
  const isService = variant === 'service'
  const items = isService ? (appointments.today ?? []) : (appointments[activeTab] ?? [])
  const todayCount = appointments.today?.length ?? 0

  return (
    <div className="spyne-card spyne-animate-fade-in p-4 flex flex-col gap-4" style={{ animationDelay: '50ms' }}>
      {/* Header */}
      <div className={`flex items-center gap-1.5 ${isService ? 'justify-between' : ''}`}>
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={spyneComponentClasses.cardTitle}>
            {isService ? "Today's Appointments" : 'Upcoming Appointments'}
          </span>
          <InfoTooltip
            text={
              isService
                ? "AI-booked drive appointments for today, confirmed by Mark from inbound calls and follow-ups."
                : "AI-booked appointments scheduled for today and tomorrow. These are confirmed visits from leads Vini qualified and converted, no salesperson involvement required."
            }
          />
        </div>
        {isService ? (
          <span className="spyne-caption shrink-0 tabular-nums text-spyne-text-secondary">
            {todayCount} today
          </span>
        ) : null}
      </div>

      {/* Tab toggle */}
      {!isService ? (
        <div className="flex gap-1">
          {['today', 'tomorrow'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`spyne-pill ${activeTab === tab ? 'spyne-pill-active' : ''}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      ) : null}

      {/* List */}
      <div className="space-y-1 flex-1">
        {items.map((appt) => (
          <div
            key={appt.id}
            className="flex items-start justify-between gap-3 py-2"
            style={{ borderBottom: '1px solid var(--spyne-border)' }}
          >
            {isService ? (
              <>
                <span className="spyne-caption w-[4.25rem] shrink-0 font-semibold tabular-nums text-spyne-text-secondary">
                  {appt.timeStart}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="spyne-label truncate" style={{ color: 'var(--spyne-text-primary)', fontWeight: 600 }}>
                    {appt.customer}
                  </div>
                  <div className="spyne-caption truncate" style={{ color: 'var(--spyne-text-muted)' }}>
                    {appt.vehicle}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="min-w-0 flex-1">
                  <div className="spyne-label truncate" style={{ color: 'var(--spyne-text-primary)', fontWeight: 600 }}>
                    {appt.customer}
                  </div>
                  <div className="spyne-caption truncate" style={{ color: 'var(--spyne-text-muted)' }}>
                    {appt.vehicle}
                  </div>
                </div>
                <div className="ml-2 flex shrink-0 items-center gap-2">
                  <span className="spyne-caption whitespace-nowrap text-spyne-text-secondary">
                    {appt.timeStart} – {appt.timeEnd}
                  </span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Footer link */}
      <button className="flex items-center gap-1 cursor-pointer" style={{ background: 'none', border: 'none', padding: 0 }}>
        <span className="spyne-label" style={{ color: 'var(--spyne-brand)', fontWeight: 600 }}>View all appointments</span>
        <MaterialSymbol name="arrow_forward" size={11} style={{ color: 'var(--spyne-brand)' }} />
      </button>
    </div>
  )
}
