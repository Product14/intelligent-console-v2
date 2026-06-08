"use client";

/**
 * ViniDailyBrief — the AI-native front door for the Sales Overview.
 *
 * One hero that answers "what should I do right now?" instead of making the
 * user read seven stacked dashboards. Three parts, per the PRD's console vision:
 *   1. A greeting + the single highest-priority action VINI surfaced today.
 *   2. A command bar — ask VINI in plain English; it routes you to the work.
 *   3. The 4 daily-report health tiles at a glance: ROI, pipeline funnel,
 *      action items / missed opportunities, and agent quality (green/amber/red).
 */

import { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  Wand2,
  Phone,
  CalendarCheck,
  ListChecks,
  Activity,
  DollarSign,
} from "lucide-react";

export interface FunnelStage {
  label: string;
  value: string;
}

export interface ViniDailyBriefProps {
  userName: string;
  periodLabel: string;
  /** The single most important thing to do right now. */
  topPriority: { headline: string; detail: string; cta: string; target: string };
  /** Calls → Leads → Appointments → Deals. */
  funnel: FunnelStage[];
  /** Revenue attributed to AI-touched leads this period. */
  roi: { value: string; deltaLabel: string; deltaDir: "up" | "down" | "flat" };
  /** Open action items / missed opportunities. */
  actionItems: { count: number; label: string };
  /** Agent quality health. */
  agentHealth: { status: "green" | "amber" | "red"; label: string };
  onNavigate: (page: string) => void;
}

const HEALTH_COLOR: Record<string, string> = { green: "#16a34a", amber: "#d97706", red: "#dc2626" };

/** Tiny keyword router so the command bar feels like it understands intent. */
function routeFor(text: string): string {
  const t = text.toLowerCase();
  if (/campaign|launch|outbound|re-?engage|equity|lease/.test(t)) return "campaigns";
  if (/appointment|appt|book|reschedul|no-?show|test drive/.test(t)) return "appointments";
  if (/action|task|follow ?up|to-?do|queue/.test(t)) return "action-items";
  if (/lead|customer|guest|pipeline|cold|hot/.test(t)) return "customers";
  return "campaigns";
}

export default function ViniDailyBrief({
  userName,
  periodLabel,
  topPriority,
  funnel,
  roi,
  actionItems,
  agentHealth,
  onNavigate,
}: ViniDailyBriefProps) {
  const [ask, setAsk] = useState("");

  const submit = () => {
    const t = ask.trim();
    onNavigate(t ? routeFor(t) : "campaigns");
    setAsk("");
  };

  const roiArrow = roi.deltaDir === "up" ? "▲" : roi.deltaDir === "down" ? "▼" : "•";
  const roiColor = roi.deltaDir === "up" ? "#bbf7d0" : roi.deltaDir === "down" ? "#fecaca" : "#e5e7eb";

  return (
    <section
      data-tour="daily-brief"
      className="relative overflow-hidden rounded-2xl text-white shadow-lg"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #312e81 100%)" }}
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #22d3ee 0%, transparent 70%)" }} />

      <div className="relative grid grid-cols-1 gap-5 p-5 lg:grid-cols-[1.4fr_1fr]">
        {/* Left — greeting, priority, command bar */}
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/15">
              <Sparkles size={13} />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#a5b4fc]">VINI · Daily Brief</span>
          </div>
          <h1 className="text-[20px] font-bold leading-tight tracking-tight">Good to see you, {userName}</h1>
          <p className="mt-0.5 text-[12px] text-white/55">Sales overview · {periodLabel}</p>

          {/* Top priority */}
          <div className="mt-3.5 rounded-xl bg-white/[0.07] p-3 ring-1 ring-white/10">
            <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#fcd34d]">Start here</p>
            <p className="mt-1 text-[13.5px] font-semibold leading-snug">{topPriority.headline}</p>
            <p className="mt-0.5 text-[11.5px] leading-snug text-white/65">{topPriority.detail}</p>
            <button
              onClick={() => onNavigate(topPriority.target)}
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[12px] font-semibold text-[#1e1b4b] transition-colors hover:bg-[#ede9fe]"
            >
              {topPriority.cta} <ArrowRight size={13} />
            </button>
          </div>

          {/* Command bar */}
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/95 p-1.5 shadow-md focus-within:ring-2 focus-within:ring-[#a78bfa]">
            <Wand2 size={15} className="ml-2 shrink-0 text-[#6366f1]" />
            <input
              value={ask}
              onChange={(e) => setAsk(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Ask VINI — e.g. launch a campaign for aging SUVs…"
              className="min-w-0 flex-1 bg-transparent px-1 py-1.5 text-[12.5px] text-[#111] outline-none placeholder:text-[#9ca3af]"
            />
            <button onClick={submit} className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#4600F2] px-3 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-[#3a00cc]">
              Go <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Right — 4 daily-report health tiles */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* ROI */}
          <HealthTile icon={DollarSign} label="ROI · AI-attributed" onClick={() => onNavigate("campaigns")}>
            <p className="text-[18px] font-bold leading-none tracking-tight">{roi.value}</p>
            <p className="mt-1 text-[10.5px] font-semibold" style={{ color: roiColor }}>
              {roiArrow} {roi.deltaLabel}
            </p>
          </HealthTile>

          {/* Pipeline funnel */}
          <HealthTile icon={Phone} label="Pipeline today" onClick={() => onNavigate("customers")}>
            <div className="flex items-center gap-1">
              {funnel.map((s, i) => (
                <div key={s.label} className="flex items-center gap-1">
                  <div className="flex flex-col items-center">
                    <span className="text-[13px] font-bold leading-none tabular-nums">{s.value}</span>
                    <span className="mt-0.5 text-[8px] uppercase tracking-wide text-white/45">{s.label}</span>
                  </div>
                  {i < funnel.length - 1 && <span className="text-white/30">›</span>}
                </div>
              ))}
            </div>
          </HealthTile>

          {/* Action items */}
          <HealthTile icon={ListChecks} label="Needs attention" onClick={() => onNavigate("action-items")}>
            <p className="text-[18px] font-bold leading-none tabular-nums">{actionItems.count}</p>
            <p className="mt-1 text-[10.5px] text-white/55">{actionItems.label}</p>
          </HealthTile>

          {/* Agent quality */}
          <HealthTile icon={Activity} label="Agent quality" onClick={() => onNavigate("campaigns")}>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: HEALTH_COLOR[agentHealth.status] }} />
              <span className="text-[13px] font-bold capitalize leading-none">{agentHealth.status}</span>
            </div>
            <p className="mt-1 text-[10.5px] text-white/55">{agentHealth.label}</p>
          </HealthTile>
        </div>
      </div>
    </section>
  );
}

function HealthTile({
  icon: Icon,
  label,
  children,
  onClick,
}: {
  icon: any;
  label: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col rounded-xl bg-white/[0.07] p-2.5 text-left ring-1 ring-white/10 transition-colors hover:bg-white/[0.12]"
    >
      <div className="mb-1.5 flex items-center gap-1.5 text-white/55">
        <Icon size={11} />
        <span className="text-[9.5px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      {children}
    </button>
  );
}
