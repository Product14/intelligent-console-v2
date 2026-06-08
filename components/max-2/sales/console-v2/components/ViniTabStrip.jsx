"use client";

/**
 * ViniTabStrip — a compact, consistent AI-native banner for every Sales tab.
 *
 * One line that says "here's what matters on this tab and what to do about it."
 * Tailored per tab (the insight + actions differ), but visually identical
 * everywhere so the console reads as one agent-driven surface, not a stack of
 * unrelated dashboards.
 */

import { Sparkles, ArrowRight } from "lucide-react";

export default function ViniTabStrip({ insight, actions = [], tone = "default" }) {
  const accent = tone === "warn" ? "#b45309" : "#4600F2";
  const bg = tone === "warn" ? "rgba(245,158,11,0.08)" : "rgba(70,0,242,0.06)";
  const ring = tone === "warn" ? "rgba(245,158,11,0.25)" : "rgba(70,0,242,0.18)";

  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl px-3.5 py-2.5"
      style={{ background: bg, boxShadow: `inset 0 0 0 1px ${ring}` }}
    >
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg"
        style={{ background: accent, color: "#fff" }}
      >
        <Sparkles size={12} />
      </span>
      <p className="min-w-0 flex-1 text-[12.5px] font-medium leading-snug text-[#374151]">
        <span className="font-bold" style={{ color: accent }}>VINI · </span>
        {insight}
      </p>
      {actions.length > 0 && (
        <div className="flex shrink-0 items-center gap-1.5">
          {actions.map((a, i) => (
            <button
              key={a.label}
              onClick={a.onClick}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold transition-colors"
              style={
                i === 0
                  ? { background: accent, color: "#fff" }
                  : { background: "transparent", color: accent, boxShadow: `inset 0 0 0 1px ${ring}` }
              }
            >
              {a.label}
              {i === 0 && <ArrowRight size={12} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
