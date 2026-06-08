"use client"

import { MaterialSymbol } from "@/components/max-2/material-symbol"
import InfoTooltip from "./InfoTooltip"
import { SPYNE } from "../spyne-palette"

const HOURS = ["7a", "8a", "9a", "10a", "11a", "12p", "1p", "2p", "3p", "4p", "5p", "6p"]
const CHANNEL_ICON = { call: "call", sms: "sms", email: "mail" }

/**
 * Lead Intelligence — temperature, activity status, the best time to reach each cohort,
 * and the multi-day, multi-channel sequences Vini is running.
 * Covers: hot / warm / cold, active vs inactive, best time to reach out, multi-channel sequences.
 *
 * TODO: GET /api/dealer/:dealerId/leads/intelligence?period=<range>
 */
export default function LeadIntelligenceBoard({ data }) {
  const t = data.temperature
  const tracked = t.hot + t.warm + t.cold
  const hourMax = Math.max(...data.bestTime.hours, 1)

  return (
    <div className="spyne-card flex flex-col gap-6 p-4 lg:p-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <h3 className="spyne-subheading m-0">Lead Intelligence</h3>
          <InfoTooltip text="Lead temperature, activity status, the best time to reach each cohort, and the multi-day, multi-channel sequences Vini is running." />
        </div>
        <span className="spyne-caption shrink-0 text-spyne-text-secondary">{tracked.toLocaleString()} leads tracked</span>
      </div>

      {/* temperature + activity */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <TempCell icon="local_fire_department" color={SPYNE.error} label="Hot" value={t.hot} />
        <TempCell icon="device_thermostat" color={SPYNE.orange} label="Warm" value={t.warm} />
        <TempCell icon="ac_unit" color={SPYNE.info} label="Cold" value={t.cold} />
        <TempCell icon="bolt" color={SPYNE.success} label="Active" value={data.active} />
        <TempCell icon="pause_circle" color={SPYNE.textSecondary} label="Inactive" value={data.inactive} />
      </div>

      {/* best time to reach out */}
      <div>
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <p className="spyne-label m-0 font-semibold text-spyne-text-secondary">Best time to reach out</p>
          <span className="spyne-caption text-spyne-text-secondary">Top: {data.bestTime.topWindows.join(" · ")}</span>
        </div>
        <div className="flex items-end gap-1.5" style={{ height: 68 }}>
          {data.bestTime.hours.map((h, i) => (
            <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1" style={{ height: "100%" }}>
              <div
                className="w-full rounded-t-[3px]"
                style={{
                  height: `${Math.max(6, (h / hourMax) * 100)}%`,
                  background: h >= hourMax * 0.8 ? "var(--spyne-primary)" : "color-mix(in srgb, var(--spyne-primary) 28%, white)",
                }}
                title={`${HOURS[i]} · reachability ${h}`}
              />
              <span className="text-spyne-text-secondary" style={{ fontSize: 9 }}>
                {HOURS[i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* multi-day, multi-channel sequences */}
      <div>
        <p className="spyne-label m-0 mb-2.5 font-semibold text-spyne-text-secondary">
          Active sequences · multi-day, multi-channel
        </p>
        <div className="flex flex-col gap-2.5">
          {data.sequences.map((s) => (
            <div
              key={s.name}
              className="flex items-center gap-3 rounded-[var(--spyne-radius-md)] border border-spyne-border p-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="spyne-label truncate font-semibold text-spyne-text-primary">{s.name}</span>
                  <span className="spyne-badge spyne-badge-info shrink-0">
                    Day {s.day}/{s.total}
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <div className="flex items-center">
                    {s.channels.map((c, i) => (
                      <span key={i} className="inline-flex items-center">
                        <MaterialSymbol
                          name={CHANNEL_ICON[c] || "call"}
                          size={14}
                          style={{ color: i < s.day ? "var(--spyne-primary)" : "var(--spyne-text-secondary)", opacity: i < s.day ? 1 : 0.4 }}
                        />
                        {i < s.channels.length - 1 && (
                          <MaterialSymbol name="chevron_right" size={12} style={{ color: "var(--spyne-text-secondary)", opacity: 0.5 }} />
                        )}
                      </span>
                    ))}
                  </div>
                  <span className="spyne-caption text-spyne-text-secondary">next: {s.next}</span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="spyne-number text-[18px] leading-none text-spyne-text-primary">{s.leads}</div>
                <div className="spyne-caption text-spyne-text-secondary">leads</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TempCell({ icon, color, label, value }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-[var(--spyne-radius-md)] border border-spyne-border p-3">
      <div className="flex items-center gap-1.5">
        <MaterialSymbol name={icon} size={16} style={{ color }} />
        <span className="spyne-caption text-spyne-text-secondary">{label}</span>
      </div>
      <span className="spyne-number text-[20px] leading-none" style={{ color }}>
        {value.toLocaleString()}
      </span>
    </div>
  )
}
