"use client"

import { TrendingUp, Minus } from 'lucide-react'

export default function MetricsBar({ metrics }) {
  return (
    <div className="spyne-card overflow-hidden">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 spyne-stagger">
        {metrics.map((metric, i) => (
          <div
            key={i}
            className="px-5 py-4 flex flex-col gap-1 spyne-animate-fade-in"
            style={{
              borderRight: i < metrics.length - 1 ? '1px solid var(--spyne-border)' : 'none',
              borderBottom: '1px solid transparent',
              background: metric.highlight ? 'var(--spyne-brand-subtle)' : 'transparent',
            }}
          >
            <div
              className="spyne-subheading truncate"
              style={{ color: metric.highlight ? 'var(--spyne-brand)' : undefined }}
            >
              {metric.label}
            </div>
            <div
              className="spyne-number"
              style={{ color: metric.highlight ? 'var(--spyne-brand)' : 'var(--spyne-text-primary)' }}
            >
              {metric.value}
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {metric.delta ? (
                <>
                  {metric.deltaDir === 'up' ? (
                    <TrendingUp size={11} style={{ color: 'var(--spyne-success)', flexShrink: 0 }} />
                  ) : (
                    <Minus size={11} style={{ color: 'var(--spyne-text-muted)', flexShrink: 0 }} />
                  )}
                  <span
                    className="spyne-caption"
                    style={{
                      color: metric.deltaDir === 'up' ? 'var(--spyne-success-text)' : 'var(--spyne-text-muted)',
                      fontWeight: 700,
                    }}
                  >
                    {metric.delta}
                  </span>
                  <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>vs last period</span>
                </>
              ) : (
                <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>{metric.note}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
