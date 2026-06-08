"use client";

/**
 * DemoStateStepper — a dev-only control so stakeholders can walk the console
 * 0→end on one route (/max-2/sales). Steps the onboardingState; every step is a
 * real screen, not a slide. MUST be feature-flagged off in production so a real
 * rooftop can't skip real integration.
 */

import { ChevronLeft, ChevronRight, FlaskConical } from "lucide-react";
import { type Stage, STAGES, STAGE_META } from "./state";

export function DemoStateStepper({ stage, onStage }: { stage: Stage; onStage: (s: Stage) => void }) {
  const idx = STAGES.indexOf(stage);
  const pct = Math.round((idx / (STAGES.length - 1)) * 100);

  return (
    <div data-tour-suppress className="fixed bottom-4 left-1/2 z-[180] -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-full border px-2 py-1.5 shadow-lg" style={{ background: "var(--spyne-text-primary)", borderColor: "rgba(255,255,255,0.12)" }}>
        <span className="inline-flex items-center gap-1 pl-1 pr-1 text-[10px] font-bold uppercase tracking-wider text-white/60">
          <FlaskConical size={12} /> Demo
        </span>
        <button
          onClick={() => idx > 0 && onStage(STAGES[idx - 1])}
          disabled={idx === 0}
          className="flex size-6 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 disabled:opacity-30"
          aria-label="Previous stage"
        >
          <ChevronLeft size={15} />
        </button>
        <div className="flex items-center gap-1">
          {STAGES.map((s, i) => {
            const active = s === stage;
            const done = i < idx;
            return (
              <button
                key={s}
                onClick={() => onStage(s)}
                title={STAGE_META[s].caption}
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors"
                style={active ? { background: "#fff", color: "var(--spyne-text-primary)" } : { color: done ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.45)" }}
              >
                <span className="flex size-4 items-center justify-center rounded-full text-[8.5px] font-bold" style={active ? { background: "var(--spyne-primary)", color: "#fff" } : { background: "rgba(255,255,255,0.14)", color: "inherit" }}>{i}</span>
                {STAGE_META[s].label}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => idx < STAGES.length - 1 && onStage(STAGES[idx + 1])}
          disabled={idx === STAGES.length - 1}
          className="flex size-6 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 disabled:opacity-30"
          aria-label="Next stage"
        >
          <ChevronRight size={15} />
        </button>
        <span className="pl-1 pr-1.5 text-[10px] font-semibold tabular-nums text-white/55">{pct}%</span>
      </div>
    </div>
  );
}
