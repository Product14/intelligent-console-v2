"use client";

/**
 * BuilderTour — lightweight coachmark tour for the campaign builder. Spotlights
 * a few key elements (the describe box, the live brief) with an anchored popover.
 * Portals to document.body (scoped) so it layers cleanly above the builder modal.
 * Auto-starts once (localStorage-gated); Esc/arrows/Skip; CSS-only motion.
 */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Sparkles, ArrowRight, X } from "lucide-react";

type Step = { anchor: string; title: string; body: string };
type Rect = { top: number; left: number; width: number; height: number };

export default function BuilderTour({
  steps,
  storageKey = "vini-builder-tour-seen",
  enabled = true,
}: {
  steps: Step[];
  storageKey?: string;
  enabled?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const armed = useRef(false);

  useEffect(() => setMounted(true), []);

  // Auto-start once, after the builder has laid out.
  useEffect(() => {
    if (armed.current || !enabled) return;
    armed.current = true;
    let seen = true;
    try { seen = !!window.localStorage.getItem(storageKey); } catch {}
    if (!seen) {
      const t = setTimeout(() => setActive(true), 550);
      return () => clearTimeout(t);
    }
  }, [enabled, storageKey]);

  // If the builder advances past the phase where the anchors exist, end the tour.
  useEffect(() => { if (active && !enabled) setActive(false); }, [active, enabled]);

  const step = steps[i];

  // Track the active anchor's rect.
  useEffect(() => {
    if (!active || !step) { setRect(null); return; }
    let raf = 0, tries = 0;
    const measure = () => {
      const el = document.querySelector(`[data-tour-b="${step.anchor}"]`);
      if (el) {
        const b = el.getBoundingClientRect();
        if (b.width > 0 && b.height > 0) { setRect({ top: b.top, left: b.left, width: b.width, height: b.height }); return true; }
      }
      return false;
    };
    const loop = () => { if (!measure() && tries < 80) { tries++; raf = requestAnimationFrame(loop); } };
    loop();
    const onMove = () => measure();
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onMove); window.removeEventListener("scroll", onMove, true); };
  }, [active, i, step]);

  const finish = () => { try { window.localStorage.setItem(storageKey, "1"); } catch {}; setActive(false); };
  const next = () => { if (i >= steps.length - 1) finish(); else setI(i + 1); };
  const back = () => setI((n) => Math.max(0, n - 1));

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); finish(); }
      else if (e.key === "ArrowRight" || e.key === "Enter") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); back(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, i]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted || !active || !step) return null;

  const W = 304;
  const vw = window.innerWidth, vh = window.innerHeight;
  let top = vh / 2 - 90, left = vw / 2 - W / 2;
  if (rect) {
    left = Math.min(Math.max(rect.left, 12), vw - W - 12);
    const below = rect.top + rect.height + 200 < vh;
    top = below ? rect.top + rect.height + 12 : Math.max(12, rect.top - 12 - 168);
  }
  const last = i === steps.length - 1;

  return createPortal(
    <div className="console-v2-sales-root max2-spyne">
      {/* Click-to-advance scrim (the dim comes from the ring's box-shadow) */}
      <div className="fixed inset-0 z-[210]" onClick={next} />
      {rect && (
        <div
          className="fixed z-[211] rounded-xl"
          style={{
            top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12,
            pointerEvents: "none",
            boxShadow: "0 0 0 9999px rgba(15,23,42,0.4), inset 0 0 0 2px var(--spyne-primary)",
            transition: "top 200ms cubic-bezier(0,0,0.2,1), left 200ms cubic-bezier(0,0,0.2,1), width 200ms cubic-bezier(0,0,0.2,1), height 200ms cubic-bezier(0,0,0.2,1)",
          }}
        />
      )}
      <div
        role="dialog"
        aria-label={step.title}
        className="spyne-float spyne-animate-scale-in fixed z-[212] rounded-2xl p-4"
        style={{ top, left, width: W, background: "var(--spyne-surface)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={finish} aria-label="Skip tour" className="spyne-focus-ring absolute right-3 top-3 rounded p-0.5" style={{ color: "var(--spyne-text-muted)" }}>
          <X size={14} />
        </button>
        <div className="mb-1 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--spyne-primary)" }}>
          <Sparkles size={12} /> VINI
        </div>
        <p className="pr-5 text-[14px] font-bold leading-tight" style={{ color: "var(--spyne-text-primary)" }}>{step.title}</p>
        <p className="mt-1.5 text-[12.5px] leading-relaxed" style={{ color: "var(--spyne-text-secondary)" }}>{step.body}</p>
        <div className="mt-3.5 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {steps.map((_, n) => (
              <span key={n} className="rounded-full transition-all" style={{ width: n === i ? 7 : 5, height: n === i ? 7 : 5, background: n === i ? "var(--spyne-primary)" : n < i ? "color-mix(in srgb, var(--spyne-primary) 40%, transparent)" : "var(--spyne-border)" }} />
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            {i > 0 && <button onClick={back} className="spyne-focus-ring rounded-lg px-2.5 py-1.5 text-[12px] font-semibold" style={{ color: "var(--spyne-text-secondary)" }}>Back</button>}
            <button onClick={next} className="spyne-btn-primary !h-8 !text-[12px]">{last ? "Got it" : "Next"} {!last && <ArrowRight size={13} />}</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
