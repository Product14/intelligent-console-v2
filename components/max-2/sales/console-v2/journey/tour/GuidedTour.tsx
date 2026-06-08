"use client";

/**
 * GuidedTour — a step-by-step spotlight coachmark that walks the user from the
 * first landing to the live console, synced to the journey stages. Portals to
 * document.body (#tour-root) so no overflow:hidden parent clips the cutout.
 * Read-only: the scrim catches clicks; Next drives the stage. CSS-only motion.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Sparkles, X, ChevronLeft, ChevronRight } from "lucide-react";
import { type Stage, STAGE_META } from "../state";
import { TOUR_STEPS, TOUR_FLAG } from "./registry";

const PRIMARY = "#4600F2";
const DIM = "rgba(15,23,42,0.55)";
type Rect = { top: number; left: number; width: number; height: number };

/* ── element-rect tracking (the bug-prone bit, isolated) ─────────────── */
function useElementRect(anchor: string | null, active: boolean) {
  const [rect, setRect] = useState<Rect | null>(null);
  const prev = useRef<Rect | null>(null);
  useEffect(() => {
    prev.current = null;
    setRect(null); // clear the prior step's spotlight while we locate the new anchor
    if (!active || !anchor) return;
    let raf = 0, tries = 0, stable = 0, scrolled = false;
    let ro: ResizeObserver | null = null;
    // Only push a new rect when it actually moved — avoids ~90 no-op re-renders/step.
    const apply = (r: Rect) => {
      const p = prev.current;
      if (p && Math.abs(p.top - r.top) < 0.5 && Math.abs(p.left - r.left) < 0.5 && Math.abs(p.width - r.width) < 0.5 && Math.abs(p.height - r.height) < 0.5) return true;
      prev.current = r; setRect(r); return false;
    };
    const measure = (): { found: boolean; unchanged: boolean } => {
      const el = document.querySelector(`[data-tour="${anchor}"]`);
      if (!el) return { found: false, unchanged: false };
      const b = el.getBoundingClientRect();
      if (b.width <= 0 || b.height <= 0) return { found: false, unchanged: false };
      return { found: true, unchanged: apply({ top: b.top, left: b.left, width: b.width, height: b.height }) };
    };
    const observe = (el: Element) => { if (!ro) { ro = new ResizeObserver(() => measure()); ro.observe(el); } };
    const loop = () => {
      const el = document.querySelector(`[data-tour="${anchor}"]`);
      if (el && !scrolled) {
        scrolled = true;
        const b = el.getBoundingClientRect();
        const inView = b.top >= 56 && b.bottom <= window.innerHeight - 8;
        if (!inView) el.scrollIntoView({ behavior: "auto", block: "center" }); // instant: no fight with the cutout transition
      }
      const res = measure();
      if (res.found) stable = res.unchanged ? stable + 1 : 0;
      // Settled for a few frames → stop polling, watch for later layout shifts.
      if (res.found && stable >= 3) { if (el) observe(el); return; }
      if (tries < 90) { tries++; raf = requestAnimationFrame(loop); }
      else if (el) observe(el);
    };
    loop();
    const onMove = () => measure();
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => { cancelAnimationFrame(raf); ro?.disconnect(); window.removeEventListener("scroll", onMove, true); window.removeEventListener("resize", onMove); };
  }, [anchor, active]);
  return rect;
}

export function GuidedTour({ page, journeyStage, onStageChange }: { page: string; journeyStage: Stage; onStageChange: (s: Stage) => void }) {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [optIn, setOptIn] = useState(false);
  const [seen, setSeen] = useState(true); // assume seen until we confirm not (avoids flash)
  const [stepIndex, setStepIndex] = useState(0);
  const [nudge, setNudge] = useState(0);
  const armed = useRef(false);

  const step = TOUR_STEPS[stepIndex];
  const rect = useElementRect(active && page === "overview" ? step?.anchor : null, active);

  useEffect(() => { setMounted(true); }, []);

  // While the tour drives the stage, mute the demo stepper so two controllers
  // don't fight over journeyStage.
  useEffect(() => {
    if (active) document.body.classList.add("tour-active");
    else document.body.classList.remove("tour-active");
    return () => document.body.classList.remove("tour-active");
  }, [active]);

  // The tour scripts the connect-state so the pipeline meter visibly climbs as
  // each source is "switched on" — the payoff the copy promises. Everything
  // except Service stays on, so the locked Service-to-sales teaser still lands.
  useEffect(() => {
    const ids = !active ? [] : stepIndex >= 5 ? ["crm", "dms", "ims", "web"] : stepIndex === 4 ? ["crm", "dms"] : stepIndex === 3 ? ["crm"] : [];
    window.dispatchEvent(new CustomEvent("vini-tour-connect", { detail: { ids } }));
  }, [active, stepIndex]);

  // Auto-start once, softly, on the first cold-start landing.
  useEffect(() => {
    if (armed.current || page !== "overview") return;
    armed.current = true;
    let s = true;
    try { s = !!window.localStorage.getItem(TOUR_FLAG); } catch {}
    setSeen(s);
    if (!s && journeyStage === "new") {
      const t = setTimeout(() => setOptIn(true), 700);
      return () => clearTimeout(t);
    }
  }, [page, journeyStage]);

  const markSeen = useCallback(() => {
    try { window.localStorage.setItem(TOUR_FLAG, "1"); } catch {}
    setActive(false); setOptIn(false); setSeen(true);
  }, []);

  const goTo = useCallback((i: number) => {
    if (i < 0 || i >= TOUR_STEPS.length) return;
    const target = TOUR_STEPS[i];
    if (target.stage !== journeyStage) onStageChange(target.stage);
    setStepIndex(i);
  }, [journeyStage, onStageChange]);

  const start = useCallback(() => { setOptIn(false); setStepIndex(0); if (journeyStage !== "new") onStageChange("new"); setActive(true); }, [journeyStage, onStageChange]);
  const next = useCallback(() => { if (stepIndex >= TOUR_STEPS.length - 1) markSeen(); else goTo(stepIndex + 1); }, [stepIndex, goTo, markSeen]);
  const back = useCallback(() => goTo(stepIndex - 1), [stepIndex, goTo]);
  const restart = useCallback(() => { try { window.localStorage.removeItem(TOUR_FLAG); } catch {}; onStageChange("new"); setStepIndex(0); setSeen(false); setActive(true); }, [onStageChange]);

  // Keyboard (Enter is intentionally NOT bound here so it doesn't double-fire
  // when a popover button is focused — Tab is trapped inside the popover).
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); markSeen(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); back(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, next, back, markSeen]);

  if (!mounted || page !== "overview") return null;
  let root = document.getElementById("tour-root");
  if (!root) { root = document.createElement("div"); root.id = "tour-root"; document.body.appendChild(root); }

  return createPortal(
    <>
      {/* Restart pill (after the tour has been seen) — sits clear of the nav strip */}
      {!active && !optIn && seen && (
        <button
          onClick={restart}
          className="fixed right-5 top-[6.75rem] z-[150] inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold shadow-sm"
          style={{ background: "rgba(70,0,242,0.10)", color: PRIMARY, animation: "tour-pop-in 360ms cubic-bezier(0.34,1.56,0.64,1)" }}
        >
          <Sparkles size={13} /> Take the tour
        </button>
      )}

      {/* Soft opt-in (no dim until accepted) */}
      {optIn && !active && (
        <div className="fixed bottom-6 left-1/2 z-[191] w-[340px] max-w-[92vw] -translate-x-1/2 rounded-2xl bg-white p-4" style={{ boxShadow: "0 1px 2px rgba(15,23,42,.06), 0 8px 24px rgba(15,23,42,.12), 0 24px 60px rgba(70,0,242,.12)", border: "1px solid rgba(0,0,0,0.06)", animation: "tour-pop-in 360ms cubic-bezier(0.34,1.56,0.64,1)" }}>
          <div className="mb-1 flex items-center gap-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg" style={{ background: "rgba(70,0,242,0.10)", color: PRIMARY }}><Sparkles size={13} /></span>
            <span className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: PRIMARY }}>VINI</span>
          </div>
          <p className="text-[14px] font-semibold" style={{ color: "#111", letterSpacing: "-0.01em" }}>Take the 2-minute tour?</p>
          <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: "#6b7280" }}>See how VINI turns the data you already own into ready-to-launch campaigns — from zero to live.</p>
          <div className="mt-3 flex items-center justify-end gap-2">
            <button onClick={markSeen} className="rounded-lg px-3 py-1.5 text-[12.5px] font-semibold" style={{ color: "#6b7280" }}>No thanks</button>
            <button onClick={start} className="rounded-lg px-3.5 py-1.5 text-[12.5px] font-semibold text-white" style={{ background: PRIMARY }}>Start tour</button>
          </div>
        </div>
      )}

      {/* Active tour */}
      {active && step && (
        <>
          {/* Click-catcher scrim (read-only): clicks nudge, never dismiss */}
          <div className="fixed inset-0 z-[189]" onClick={() => setNudge((n) => n + 1)} />

          {/* Spotlight cutout — the dim is its static 9999px box-shadow; the
              keyframe only breathes the inset ring. */}
          {rect ? (
            <div
              className="fixed z-[190] rounded-[14px]"
              style={{
                top: rect.top - 8, left: rect.left - 8, width: rect.width + 16, height: rect.height + 16,
                pointerEvents: "none",
                boxShadow: `0 0 0 9999px ${DIM}, inset 0 0 0 1.5px rgba(70,0,242,0.55)`,
                animation: "tour-ring-pulse 2.4s ease-in-out infinite, tour-cutout-in 250ms cubic-bezier(0.34,1.56,0.64,1)",
                transition: "top 250ms cubic-bezier(0,0,0.2,1), left 250ms cubic-bezier(0,0,0.2,1), width 250ms cubic-bezier(0,0,0.2,1), height 250ms cubic-bezier(0,0,0.2,1)",
              }}
            />
          ) : (
            /* No anchor measured yet → still dim so the click-lock has a visual. */
            <div className="fixed inset-0 z-[190]" style={{ background: DIM, pointerEvents: "none" }} aria-hidden />
          )}

          {/* Popover — composite key so each scrim-click nudge re-runs the shake */}
          <Popover
            key={`${stepIndex}-${nudge}`}
            step={step}
            rect={rect}
            total={TOUR_STEPS.length}
            nudging={nudge > 0}
            onNext={next}
            onBack={back}
            onSkip={markSeen}
            canBack={stepIndex > 0}
          />
        </>
      )}
    </>,
    root
  );
}

/* ── Popover ─────────────────────────────────────────────────────────── */

function Popover({ step, rect, total, nudging, onNext, onBack, onSkip, canBack }: {
  step: (typeof TOUR_STEPS)[number]; rect: Rect | null;
  total: number; nudging: boolean; onNext: () => void; onBack: () => void; onSkip: () => void; canBack: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [cardH, setCardH] = useState(220);
  // Measure the real card height so vertical clamping is exact.
  useLayoutEffect(() => { if (ref.current) setCardH(ref.current.offsetHeight); });
  // Focus the card for keyboard/SR when the step changes.
  useEffect(() => { ref.current?.focus(); }, [step.n]);

  const W = 332;
  const GAP = 14;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  let top = vh / 2 - cardH / 2, left = vw / 2 - W / 2;
  if (rect) {
    left = Math.min(Math.max(rect.left + rect.width / 2 - W / 2, 12), Math.max(12, vw - W - 12));
    const roomBelow = vh - (rect.top + rect.height) - GAP;
    const roomAbove = rect.top - GAP;
    const placeBelow = roomBelow >= cardH || roomBelow >= roomAbove;
    top = placeBelow ? rect.top + rect.height + GAP : rect.top - GAP - cardH;
    top = Math.min(Math.max(top, 12), Math.max(12, vh - cardH - 12)); // never clip off-screen
  }
  const lastStep = step.n === total - 1;

  // Trap Tab within the dialog so focus can't leak to the click-locked page.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const f = ref.current?.querySelectorAll<HTMLButtonElement>("button");
    if (!f || !f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={step.title}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      className="fixed z-[191] outline-none"
      style={{
        top, left, width: W, maxWidth: "92vw",
        animation: nudging ? "tour-nudge 0.45s cubic-bezier(0.34,1.56,0.64,1)" : "tour-pop-in 320ms cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      <div className="relative rounded-2xl bg-white p-4" style={{ boxShadow: "0 1px 2px rgba(15,23,42,.06), 0 8px 24px rgba(15,23,42,.10), 0 24px 60px rgba(70,0,242,.10)", border: "1px solid rgba(0,0,0,0.06)" }}>
        <button onClick={onSkip} className="absolute right-3 top-3 rounded p-0.5 text-[11px] font-semibold" style={{ color: "#9ca3af" }} aria-label="Skip tour"><X size={14} /></button>
        <div className="mb-1.5 flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: PRIMARY }}>{STAGE_META[step.stage].label}</span>
        </div>
        <p className="pr-5 text-[14.5px] font-semibold leading-tight" style={{ color: "#111", letterSpacing: "-0.01em" }}>{step.title}</p>
        <p className="mt-1.5 text-[12.5px] leading-relaxed" aria-live="polite" style={{ color: "#4b5563" }}>{step.body}</p>

        <div className="mt-3.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1">
              {Array.from({ length: total }).map((_, i) => (
                <span key={i} className="rounded-full transition-all" style={{ width: i === step.n ? 7 : 5, height: i === step.n ? 7 : 5, background: i === step.n ? PRIMARY : i < step.n ? "rgba(70,0,242,0.4)" : "#e5e7eb" }} />
              ))}
            </div>
            <span className="ml-1 text-[10.5px]" style={{ color: "#9ca3af" }}>{step.n + 1} of {total}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {canBack && <button onClick={onBack} className="inline-flex items-center gap-0.5 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold" style={{ color: "#6b7280" }}><ChevronLeft size={13} /> Back</button>}
            <button onClick={onNext} className="inline-flex items-center gap-1 rounded-lg px-3.5 py-1.5 text-[12px] font-semibold text-white" style={{ background: PRIMARY }}>
              {lastStep ? "Finish" : "Next"} {!lastStep && <ChevronRight size={13} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
