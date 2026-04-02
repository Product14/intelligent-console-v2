"use client"

import { useState } from 'react'
import InfoTooltip from './InfoTooltip'

const TABS = [
  { id: 'todaysCallbacks', label: "Today's Callbacks" },
  { id: 'hot',             label: 'Hot'              },
  { id: 'warm',            label: 'Warm'             },
]

// Map tag names to .spyne-badge variant
const TAG_VARIANTS = {
  'Callback Requested':  'spyne-badge-info',
  'Needs human attention': 'spyne-badge-danger',
  'Follow-up needed':    'spyne-badge-warning',
}

export default function PriorityFollowUps({ followUps }) {
  const [activeTab, setActiveTab] = useState('todaysCallbacks')
  const items = followUps[activeTab] ?? []

  const tabBadge = {
    todaysCallbacks: followUps.todaysCallbacks?.length,
    hot: followUps.hot?.length,
    warm: followUps.warm?.length,
  }

  return (
    <div className="spyne-card spyne-animate-fade-in p-5 flex flex-col gap-4" style={{ animationDelay: '100ms' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="spyne-heading">Priority Follow-ups</span>
          <InfoTooltip text="High-priority leads flagged by Vini for human review. These are leads that showed strong intent signals (e.g. repeated visits, price requests, trade-in questions) but haven't yet converted to an appointment." />
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-0 -mx-5 px-5"
        style={{ borderBottom: '1px solid var(--spyne-border)' }}
      >
        {TABS.map((tab) => {
          const count = tabBadge[tab.id]
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex items-center gap-1.5 px-2.5 py-2.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap"
              style={{
                borderColor: active ? 'var(--spyne-brand)' : 'transparent',
                color: active ? 'var(--spyne-brand)' : 'var(--spyne-text-muted)',
                fontWeight: active ? 600 : 500,
                fontSize: 12,
                background: 'none',
                border: 'none',
                borderBottom: active ? `2px solid var(--spyne-brand)` : '2px solid transparent',
              }}
            >
              {tab.label}
              {count ? (
                <span
                  className="flex items-center justify-center min-w-[16px] h-[16px] px-1 font-bold"
                  style={{
                    borderRadius: 'var(--spyne-radius-pill)',
                    background: active ? 'var(--spyne-brand)' : 'var(--spyne-border-strong)',
                    color: active ? 'var(--spyne-brand-on)' : 'var(--spyne-text-secondary)',
                    fontSize: 10,
                  }}
                >
                  {count}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      {/* Lead list */}
      <div className="space-y-3 flex-1 overflow-y-auto" style={{ maxHeight: 280 }}>
        {items.map((lead) => (
          <div key={lead.id} className="flex items-start gap-2.5">
            <div
              className={`${lead.color} w-7 h-7 text-white flex items-center justify-center shrink-0`}
              style={{ borderRadius: '50%', fontSize: 11, fontWeight: 700 }}
            >
              {lead.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="spyne-label" style={{ color: 'var(--spyne-text-primary)', fontWeight: 700 }}>{lead.name}</span>
                <span className="spyne-caption shrink-0" style={{ color: 'var(--spyne-text-muted)' }}>{lead.timeAgo}</span>
              </div>
              <div className="spyne-caption mt-0.5 truncate" style={{ color: 'var(--spyne-text-secondary)', fontStyle: 'italic' }}>
                {lead.message}
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className={`spyne-badge ${TAG_VARIANTS[lead.tag] || 'spyne-badge-neutral'}`}>
                  {lead.tag}
                </span>
                {lead.scheduledTime && (
                  <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>{lead.scheduledTime}</span>
                )}
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-6 spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>
            No leads in this category
          </div>
        )}
      </div>
    </div>
  )
}
