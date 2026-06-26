'use client';

/**
 * Full-viewport, card-less overlay shown while the autofill API scrapes
 * the dealership website. The form underneath stays mounted and visible
 * through a frosted-glass backdrop — the screen itself takes on the
 * "AI is thinking" state instead of a focused modal card landing on top.
 *
 * The visual elements (gradient orb, sparkles, shimmer headline, rotating
 * step, progress pills) float directly on the page, without a bordered
 * container, so the loader feels diffused across the whole screen.
 *
 * Pointer-events on the overlay are intentionally `auto` — clicks land on
 * the overlay (not the form below), which prevents accidental edits while
 * the request is in flight without needing a modal scrim.
 */

import { useEffect, useState } from 'react';

const STEPS: ReadonlyArray<string> = [
  'Reading your website…',
  'Finding department contacts…',
  'Mapping working hours…',
  'Assembling the picture…',
];

/** Cadence the step text rotates at. Tuned so a 10–20s autofill cycles
 *  through 4–8 steps — fast enough to feel alive, slow enough to read. */
const STEP_INTERVAL_MS = 2200;

export function AutofillLoader({ isOpen }: { isOpen: boolean }) {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    setStepIdx(0);
    const id = setInterval(() => {
      setStepIdx((i) => (i + 1) % STEPS.length);
    }, STEP_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      // Fixed-inset overlay — sits above the form (and any sibling chrome)
      // without a bordered card. Background is a translucent frosted layer
      // so the form's silhouette stays visible underneath.
      className="fixed inset-0 z-50"
      style={{
        background:
          'radial-gradient(60% 50% at 50% 45%, rgba(139,92,246,0.16) 0%, rgba(59,130,246,0.08) 35%, rgba(255,255,255,0.55) 70%, rgba(255,255,255,0.78) 100%)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      {/* Inline keyframes — keeps the visual self-contained. */}
      <style>{KEYFRAMES}</style>

      {/* Animated gradient edge sheen — a subtle "AI is active" affordance
          at the viewport border that doesn't compete with the central
          content. Inset-shadow trick: an inner box-shadow with a slowly
          shifting hue. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          boxShadow: 'inset 0 0 120px 12px rgba(139,92,246,0.18)',
          animation: 'autofill-edge 4s ease-in-out infinite',
        }}
      />

      {/* Centered content — no card, no border, no shadow. Items float
          directly on the frosted overlay. */}
      <div className="relative flex h-full w-full flex-col items-center justify-center gap-5 px-6 text-center">
        {/* Sparkle particles around the orb. */}
        <div className="pointer-events-none relative h-0 w-[300px]">
          <Sparkle className="absolute -left-2 -top-12" delay={0} />
          <Sparkle className="absolute -right-2 -top-14" delay={0.6} />
          <Sparkle className="absolute left-12 top-4" delay={1.1} />
          <Sparkle className="absolute right-12 top-2" delay={1.6} />
        </div>

        {/* Orb stack — three layers: outer blur halo, breathing core,
            inner highlight. */}
        <div className="relative h-28 w-28">
          <div
            className="absolute inset-0 rounded-full opacity-80"
            style={{
              background:
                'conic-gradient(from 0deg, #3b82f6, #8b5cf6, #ec4899, #f59e0b, #3b82f6)',
              filter: 'blur(22px)',
              animation: 'autofill-spin 6s linear infinite',
            }}
          />
          <div
            className="absolute inset-2 rounded-full"
            style={{
              background:
                'radial-gradient(circle at 30% 30%, #ffffff 0%, #c4b5fd 28%, #8b5cf6 58%, #4f46e5 100%)',
              animation: 'autofill-breathe 2.4s ease-in-out infinite',
              boxShadow:
                '0 12px 36px rgba(99,102,241,0.36), inset 0 -6px 14px rgba(76,29,149,0.45)',
            }}
          />
          <div
            className="absolute left-[28%] top-[22%] h-3.5 w-3.5 rounded-full bg-white/85 blur-[2px]"
            style={{ animation: 'autofill-breathe 2.4s ease-in-out infinite' }}
          />
        </div>

        {/* Shimmer headline. */}
        <div
          className="mt-1 text-xl font-semibold"
          style={{
            backgroundImage:
              'linear-gradient(90deg, #0f172a 0%, #8b5cf6 45%, #0f172a 90%)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            animation: 'autofill-shimmer 2.6s linear infinite',
          }}
        >
          Generating your departments
        </div>

        {/* Rotating step. key remount drives the fade-in each tick. */}
        <div className="h-5">
          <div
            key={stepIdx}
            className="text-sm text-black-60"
            style={{ animation: 'autofill-fade-in 0.4s ease-out' }}
          >
            {STEPS[stepIdx]}
          </div>
        </div>

        {/* Step pills. */}
        <div className="flex items-center gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: i === stepIdx ? 22 : 6,
                background:
                  i === stepIdx
                    ? 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)'
                    : 'rgba(15,23,42,0.18)',
              }}
            />
          ))}
        </div>

        <p className="mt-2 max-w-[320px] text-[11px] leading-relaxed text-black-40">
          Hang tight — this usually takes 10–20 seconds. Please keep this
          tab open while we scan your site.
        </p>
      </div>
    </div>
  );
}

function Sparkle({ className, delay }: { className?: string; delay: number }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={{
        animation: `autofill-twinkle 1.8s ease-in-out ${delay}s infinite`,
      }}
    >
      <path
        d="M12 2L13.5 9 21 12 13.5 15 12 22 10.5 15 3 12 10.5 9z"
        fill="url(#sparkle-gradient)"
      />
      <defs>
        <linearGradient id="sparkle-gradient" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const KEYFRAMES = `
  @keyframes autofill-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes autofill-breathe {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.06); }
  }
  @keyframes autofill-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  @keyframes autofill-fade-in {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes autofill-twinkle {
    0%, 100% { opacity: 0.2; transform: scale(0.7); }
    50% { opacity: 1; transform: scale(1.15); }
  }
  @keyframes autofill-edge {
    0%, 100% { box-shadow: inset 0 0 120px 12px rgba(139,92,246,0.18); }
    50%      { box-shadow: inset 0 0 180px 20px rgba(99,102,241,0.26); }
  }
`;
