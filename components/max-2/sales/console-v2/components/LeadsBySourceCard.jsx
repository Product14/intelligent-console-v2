"use client"

import InfoTooltip from './InfoTooltip'

export default function LeadsBySourceCard({ data }) {
  const { sources, funnel } = data

  return (
    <div className="spyne-card p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <div className="spyne-heading">Leads by Source</div>
          <InfoTooltip text="Breaks down all inbound leads by originating channel. The funnel shows how each source converts from first contact through to a sold vehicle — helping you see which channels drive the highest-quality traffic." />
        </div>
      </div>

      {/* Source stat strip */}
      <div className="grid grid-cols-4 gap-2.5 mb-4">
        {sources.map((s) => (
          <div
            key={s.key}
            className="rounded-lg p-3 text-center"
            style={{ background: s.color + '10', borderTop: `3px solid ${s.color}` }}
          >
            <div className="spyne-number" style={{ color: s.color, fontSize: 22, lineHeight: 1.1 }}>
              {s.count.toLocaleString()}
            </div>
            <div className="spyne-label mt-0.5" style={{ color: 'var(--spyne-text-primary)' }}>
              {s.label}
            </div>
            <div className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>
              {s.pct}% of total
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--spyne-border)', marginBottom: 12 }} />

      {/* Funnel table — rows = sources, cols = funnel stages */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
          <thead>
            <tr style={{ borderBottom: '1.5px solid var(--spyne-border)' }}>
              <th style={thStyle}>Source</th>
              {funnel.map((col) => (
                <th
                  key={col.metric}
                  style={{
                    ...thStyle,
                    textAlign: 'center',
                    color: col.highlight ? 'var(--spyne-brand)' : undefined,
                  }}
                >
                  {col.metric}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sources.map((s, i) => (
              <tr
                key={s.key}
                style={{ background: i % 2 !== 0 ? 'var(--spyne-bg)' : 'transparent' }}
              >
                <td style={{ ...tdRowLabel, color: s.color }}>
                  {s.label}
                </td>
                {funnel.map((col) => {
                  const cell = col[s.key]
                  const isHighlight = col.highlight
                  const isNull = !cell || cell.count == null
                  return (
                    <td
                      key={col.metric}
                      style={{ ...tdCell, color: isNull ? 'var(--spyne-text-muted)' : isHighlight ? 'var(--spyne-brand)' : 'var(--spyne-text-primary)' }}
                    >
                      {isNull ? (
                        <span style={{ fontWeight: 400 }}>—</span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                          <span style={{ fontWeight: 700, fontSize: 13 }}>{cell.count.toLocaleString()}</span>
                          {cell.rate && (
                            <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--spyne-text-muted)' }}>
                              {cell.rate}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const thStyle = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.6px',
  color: 'var(--spyne-text-muted)',
  textAlign: 'left',
  padding: '0 10px 8px 0',
}

const tdRowLabel = {
  fontSize: 12,
  fontWeight: 700,
  padding: '8px 10px 8px 0',
}

const tdCell = {
  fontSize: 13,
  textAlign: 'center',
  padding: '8px 10px',
}
