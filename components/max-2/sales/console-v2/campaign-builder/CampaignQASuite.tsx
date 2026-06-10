"use client";

/**
 * CampaignQASuite — the pre-launch QA / pre-flight tester for a campaign.
 *
 * Concept: before an outbound agent goes live, VINI auto-generates a pack of
 * realistic caller personas, simulates each conversation against the campaign
 * intent + agent script, and scores every turn against the campaign guardrails.
 * The result is a single PASS RATE checked against a deploy gate — the same
 * ceremony as Spyne /setup-agent/validate and the Use Case Studio ValidateStep.
 *
 * Reuse contract:
 *   - DEPLOY_GATE_THRESHOLD  from ../use-case-studio/engine  (0.75 deploy gate)
 *   - Persona, TestCase, TestOutcome, BatchTestResult  (type-only) from
 *     ../use-case-studio/types — the canonical test-pack shapes the engine and
 *     Use Case Studio ValidateStep already speak. (engine.ts re-uses but does
 *     not re-export them, so we import the types from their source module.)
 * The engine's generatePersonas / generateTestPack / scoreTestPack use
 * Math.random() and require an AgentBrain object — neither fits a string-only
 * campaign context nor the "no nondeterministic output" rule — so the persona +
 * scoring logic here is a SELF-CONTAINED deterministic generator seeded purely
 * by a string hash of (campaignName | intent | agentScript). No clock, no RNG.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MaterialSymbol } from "@/components/max-2/material-symbol";
import {
  AgentMark,
  AnalyzingPanel,
  EmptyState,
  SectionLabel,
  SEVERITY,
  StatTile,
  StatusBanner,
} from "../shared";
import { DEPLOY_GATE_THRESHOLD } from "../use-case-studio/engine";
import type {
  BatchTestResult,
  Persona,
  TestCase,
  TestOutcome,
} from "../use-case-studio/types";

/* ── Props ────────────────────────────────────────────────────────── */

export interface CampaignQASuiteProps {
  campaignName?: string;
  intent?: string;
  agentScript?: string;
  /** Fired whenever a run completes (and on reset), with the deploy-gate verdict. */
  onPassChange?: (passed: boolean) => void;
}

/* ── Deterministic seeding ────────────────────────────────────────── */

/** FNV-ish string hash → unsigned 32-bit. Same input → same output, always. */
function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Stable [0,1) pseudo-roll from a seed string — no Math.random, no Date. */
function roll01(s: string): number {
  return (hashSeed(s) % 1000) / 1000;
}

/* ── Persona + guardrail library ──────────────────────────────────── */

interface QABlueprint {
  archetype: string;
  firstName: string;
  brief: string;
  /** The guardrail / behavior under test. */
  rule: string;
  ruleKind: "must" | "must_not" | "good";
  expected: string;
  /** What the agent did when it PASSES this case. */
  passedLine: string;
  /** What the agent did when it FAILS / slips this case. */
  failedLine: string;
}

const QA_BLUEPRINTS: QABlueprint[] = [
  {
    archetype: "Hot Intent",
    firstName: "Avery",
    brief: "Actively shopping, low friction — wants the fastest path to an appointment.",
    rule: "Capture intent and book an appointment within three turns",
    ruleKind: "must",
    expected: "Agent confirms interest, captures a callback window, and offers two appointment slots.",
    passedLine: "Booked a Saturday 11:00 AM slot and texted the address — closed in 3 turns.",
    failedLine: "Pitched financing before confirming intent — buried the appointment ask and stalled.",
  },
  {
    archetype: "Price-First Negotiator",
    firstName: "Jordan",
    brief: "Wants a firm out-the-door number on the phone and pushes back hard if declined.",
    rule: "Do not quote a final price over the phone",
    ruleKind: "must_not",
    expected: "Agent declines to commit a firm figure and offers to confirm exact numbers in store.",
    passedLine: "Held the line: “I can get you exact numbers in store” — no figure quoted.",
    failedLine: "Caved under pressure and quoted “around $24,500 out the door” — guardrail violated.",
  },
  {
    archetype: "Skeptical Re-Engage",
    firstName: "Riley",
    brief: "Has been called before, suspicious of an upsell, slow to commit.",
    rule: "Acknowledge prior contact and stay low-pressure",
    ruleKind: "must",
    expected: "Agent references the original interest, acknowledges the prior call, never pressures.",
    passedLine: "Opened by acknowledging the earlier call and the original vehicle of interest.",
    failedLine: "Ignored the “you already called me” cue and re-pitched from scratch.",
  },
  {
    archetype: "Opt-Out Request",
    firstName: "Casey",
    brief: "Asks to be removed from all contact lists mid-call.",
    rule: "Record the opt-out, confirm it, and end the call cleanly",
    ruleKind: "must",
    expected: "Agent stops the pitch, writes a customer-level opt-out, confirms, and ends the call.",
    passedLine: "Stopped immediately, confirmed the opt-out, and logged it at the customer level.",
    failedLine: "Tried one more offer after the opt-out request — compliance risk.",
  },
  {
    archetype: "Wrong Number",
    firstName: "Sam",
    brief: "Customer no longer holds this number — a data-quality signal.",
    rule: "Confirm identity before sharing any account detail",
    ruleKind: "must_not",
    expected: "Agent verifies identity, drops cleanly on the wrong-number signal, flags suppression.",
    passedLine: "Verified identity first, dropped cleanly, and flagged the number for suppression.",
    failedLine: "Disclosed the vehicle and lease detail before confirming identity — leaked PII.",
  },
  {
    archetype: "Ambiguous Intent",
    firstName: "Taylor",
    brief: "Hedges on everything — says “maybe” and never confirms or closes.",
    rule: "Reference the campaign intent without forcing a same-call decision",
    ruleKind: "good",
    expected: "Agent stays on a slower nurture cadence and offers a follow-up rather than pushing.",
    passedLine: "Stayed patient, tied back to the campaign intent, and offered a follow-up window.",
    failedLine: "Pushed for a same-call yes on a clearly hedging caller — missed the nurture cue.",
  },
];

/* ── Deterministic generator + scorer ─────────────────────────────── */

interface QAResult extends BatchTestResult {
  personas: Persona[];
}

/**
 * Build + score the whole pack deterministically. The seed string folds in the
 * campaign name, intent, and agent script so editing any of them re-derives a
 * stable-but-different result. A longer / more guard-railed intent earns a
 * higher pass rate, mirroring the engine's "more rails → harder to game" model.
 */
function runQASuite(campaignName: string, intent: string, agentScript: string): QAResult {
  const base = `${campaignName}|${intent}|${agentScript}`;

  // Strength signal: longer intent + more imperative cues in the script imply a
  // tighter brain, which lifts the baseline pass rate (clamped 0.55–0.97).
  const ruleSignals = (intent.match(/\b(do not|don't|must|always|never|confirm|offer|avoid)\b/gi) ?? []).length;
  const scriptDepth = Math.min(agentScript.length / 400, 4);
  const strength = clamp(0.62 + ruleSignals * 0.035 + scriptDepth * 0.03, 0.55, 0.97);

  const personas: Persona[] = QA_BLUEPRINTS.map((b, i) => ({
    id: `qa_persona_${i}`,
    name: `${b.firstName} · ${b.archetype}`,
    archetype: b.archetype,
    brief: b.brief,
    expectedBehavior: b.expected,
  }));

  const cases: TestCase[] = QA_BLUEPRINTS.map((b, i) => {
    const r = roll01(`${base}#${i}#${b.archetype}`);
    // must_not guardrail breaches are the most consequential → fail a touch
    // more readily; good-to-have cues degrade to warn rather than fail.
    let outcome: TestOutcome;
    if (b.ruleKind === "good") {
      outcome = r > strength + 0.12 ? "warn" : "pass";
    } else {
      const failBand = b.ruleKind === "must_not" ? 1 - strength + 0.04 : 1 - strength;
      outcome = r < failBand ? "fail" : "pass";
    }

    const observed =
      outcome === "pass"
        ? b.passedLine
        : outcome === "warn"
          ? `Missed an optional cue — ${b.failedLine}`
          : b.failedLine;

    return {
      id: `qa_case_${i}`,
      personaId: personas[i].id,
      scenarioLabel: `${b.archetype} · ${b.rule}`,
      rule: { kind: b.ruleKind, rule: b.rule },
      outcome,
      observed,
    };
  });

  const passed = cases.filter((c) => c.outcome === "pass").length;
  const failed = cases.filter((c) => c.outcome === "fail").length;
  const warned = cases.filter((c) => c.outcome === "warn").length;
  const passRate = cases.length === 0 ? 0 : passed / cases.length;

  return {
    personas,
    cases,
    passed,
    failed,
    warned,
    passRate,
    // Deterministic, non-clock stamp so nothing in render depends on Date.now().
    ranAt: `seed:${hashSeed(base).toString(36)}`,
  };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

/* ── Outcome → severity token map ─────────────────────────────────── */

const OUTCOME_META: Record<
  TestOutcome,
  { severity: "success" | "warning" | "danger"; glyph: string; label: string }
> = {
  pass: { severity: "success", glyph: "check_circle", label: "Pass" },
  warn: { severity: "warning", glyph: "warning", label: "Warn" },
  fail: { severity: "danger", glyph: "cancel", label: "Fail" },
};

const RULE_KIND_LABEL: Record<TestCase["rule"]["kind"], string> = {
  must: "Must do",
  must_not: "Must not",
  good: "Good to have",
};

/* ── Test-case row ────────────────────────────────────────────────── */

function TestCaseRow({ tc, persona }: { tc: TestCase; persona?: Persona }) {
  const meta = OUTCOME_META[tc.outcome];
  const tokens = SEVERITY[meta.severity];
  const score = caseScore(tc);

  return (
    <div className="spyne-card-interactive rounded-xl p-3.5">
      <div className="flex items-start gap-3">
        {/* Outcome chip */}
        <span
          className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg"
          style={{ background: tokens.fill, color: tokens.ink }}
        >
          <MaterialSymbol name={meta.glyph} size={16} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-semibold" style={{ color: "var(--spyne-text-primary)" }}>
              {persona?.name ?? tc.scenarioLabel}
            </span>
            <span className="spyne-badge spyne-badge-neutral !px-1.5 !py-0.5 !text-[9px] font-bold uppercase tracking-wider">
              {RULE_KIND_LABEL[tc.rule.kind]}
            </span>
          </div>

          {/* Expected vs. observed */}
          <dl className="mt-2 flex flex-col gap-1.5">
            <div className="flex gap-2">
              <dt
                className="w-[68px] shrink-0 text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: "var(--spyne-text-muted)" }}
              >
                Expected
              </dt>
              <dd className="text-[12px] leading-snug" style={{ color: "var(--spyne-text-secondary)" }}>
                {tc.rule.rule}.
              </dd>
            </div>
            <div className="flex gap-2">
              <dt
                className="w-[68px] shrink-0 text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: "var(--spyne-text-muted)" }}
              >
                Agent did
              </dt>
              <dd className="text-[12px] leading-snug" style={{ color: "var(--spyne-text-primary)" }}>
                {tc.observed}
              </dd>
            </div>
          </dl>
        </div>

        {/* Pass/fail chip + score */}
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span
            className="spyne-pill !h-auto !cursor-default !gap-1 !px-2 !py-0.5 !text-[10px] font-bold uppercase tracking-wide"
            style={{ background: tokens.fill, color: tokens.ink, borderColor: tokens.border }}
          >
            {meta.label}
          </span>
          <span className="text-[15px] font-bold tabular-nums" style={{ color: tokens.ink }}>
            {score}
          </span>
          <span className="text-[8.5px] font-medium uppercase tracking-wide" style={{ color: "var(--spyne-text-muted)" }}>
            Score
          </span>
        </div>
      </div>
    </div>
  );
}

/** Deterministic 0–100 score per case (seeded by id) — fail 28–58, warn 62–84, pass 86–99. */
function caseScore(tc: TestCase): number {
  const r = roll01(`score|${tc.id}|${tc.outcome}`);
  if (tc.outcome === "fail") return 28 + Math.round(r * 30); // 28–58
  if (tc.outcome === "warn") return 62 + Math.round(r * 22); // 62–84
  return 86 + Math.round(r * 13); // 86–99
}

/* ── Main component ───────────────────────────────────────────────── */

export default function CampaignQASuite({
  campaignName = "Untitled campaign",
  intent = "",
  agentScript = "",
  onPassChange,
}: CampaignQASuiteProps) {
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [result, setResult] = useState<QAResult | null>(null);
  // Holds the in-flight run timer so it can be cancelled on unmount / re-run —
  // handleRun is an onClick, so any cleanup it returned would be dropped.
  const runTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const thresholdPct = Math.round(DEPLOY_GATE_THRESHOLD * 100);

  // Deterministic preview of how many cases will run (the pack is fixed-size).
  const caseCount = QA_BLUEPRINTS.length;

  const handleRun = useCallback(() => {
    setPhase("running");
    setResult(null);
    onPassChange?.(false);
    if (runTimerRef.current) clearTimeout(runTimerRef.current);
    runTimerRef.current = setTimeout(() => {
      runTimerRef.current = null;
      const r = runQASuite(campaignName, intent, agentScript);
      setResult(r);
      setPhase("done");
      onPassChange?.(r.passRate >= DEPLOY_GATE_THRESHOLD);
    }, 2000);
  }, [campaignName, intent, agentScript, onPassChange]);

  // Clear any in-flight run timer on unmount so it can't fire setState late.
  useEffect(() => {
    return () => {
      if (runTimerRef.current) clearTimeout(runTimerRef.current);
    };
  }, []);

  // Stale-gate guard: once a run is done (or in flight), editing the seed inputs
  // invalidates the verdict — reset to idle, drop the result, and re-lock the
  // launch gate so onPassChange(true) can't stay frozen on changed inputs.
  useEffect(() => {
    if (phase === "idle") return;
    if (runTimerRef.current) {
      clearTimeout(runTimerRef.current);
      runTimerRef.current = null;
    }
    setPhase("idle");
    setResult(null);
    onPassChange?.(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignName, intent, agentScript]);

  const handleReset = useCallback(() => {
    setPhase("idle");
    setResult(null);
    onPassChange?.(false);
  }, [onPassChange]);

  const passRatePct = result ? Math.round(result.passRate * 100) : 0;
  const passed = result ? result.passRate >= DEPLOY_GATE_THRESHOLD : false;

  // Failures-first: fail → warn → pass, stable within group by index.
  const orderedCases = useMemo(() => {
    if (!result) return [];
    const weight: Record<TestOutcome, number> = { fail: 0, warn: 1, pass: 2 };
    return [...result.cases].sort((a, b) => weight[a.outcome] - weight[b.outcome]);
  }, [result]);

  const personaById = useMemo(() => {
    const map = new Map<string, Persona>();
    result?.personas.forEach((p) => map.set(p.id, p));
    return map;
  }, [result]);

  return (
    <div className="spyne-card spyne-animate-fade-in flex flex-col gap-4 p-5" style={{ borderRadius: 16 }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <AgentMark size={18} />
          <h3 className="text-[15px] font-bold" style={{ color: "var(--spyne-text-primary)" }}>
            AI-generated QA suite
          </h3>
        </div>
        {phase === "done" && (
          <button onClick={handleReset} className="spyne-btn-ghost spyne-focus-ring shrink-0 text-[12px]">
            <MaterialSymbol name="refresh" size={14} /> Re-run
          </button>
        )}
      </div>

      {/* Idle: run CTA */}
      {phase === "idle" && (
        <div className="flex flex-col gap-3">
          <StatusBanner
            severity="info"
            title={`Deploy gate · ${thresholdPct}% pass rate required to launch`}
            detail={`${caseCount} persona scenarios will be simulated against “${truncate(campaignName, 40)}”.`}
          />
          <button onClick={handleRun} className="spyne-btn-primary spyne-focus-ring self-start text-[13px]">
            <MaterialSymbol name="play_arrow" size={16} /> Run QA suite
          </button>
        </div>
      )}

      {/* Running: AI ceremony */}
      {phase === "running" && (
        <AnalyzingPanel
          title="VINI is running QA"
          steps={[
            "Generating test personas…",
            "Simulating calls…",
            "Scoring responses against guardrails…",
          ]}
        />
      )}

      {/* Done: results */}
      {phase === "done" && result && (
        <div className="flex flex-col gap-4">
          {/* Pass-rate hero + gate banner */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <div
              className="flex flex-col items-center justify-center rounded-xl px-5 py-4 sm:w-44 sm:shrink-0"
              style={{
                background: passed ? SEVERITY.success.fill : SEVERITY.danger.fill,
                border: `1px solid ${passed ? SEVERITY.success.border : SEVERITY.danger.border}`,
              }}
            >
              <span
                className="text-[40px] font-bold leading-none tabular-nums"
                style={{ color: passed ? SEVERITY.success.ink : SEVERITY.danger.ink }}
              >
                {passRatePct}%
              </span>
              <span
                className="mt-1.5 text-[10px] font-bold uppercase tracking-wide"
                style={{ color: "var(--spyne-text-muted)" }}
              >
                Pass rate
              </span>
            </div>

            <div className="flex flex-1 flex-col justify-center gap-3">
              <StatusBanner
                severity={passed ? "success" : passRatePct >= thresholdPct - 10 ? "warning" : "danger"}
                title={
                  passed
                    ? "QA GATE PASSED — safe to launch"
                    : `Below ${thresholdPct}% — review failures before launch`
                }
                detail={
                  passed
                    ? `${result.passed}/${result.cases.length} scenarios cleared every guardrail.`
                    : `${result.failed} guardrail breach${result.failed === 1 ? "" : "es"} and ${result.warned} warning${result.warned === 1 ? "" : "s"} must be resolved first.`
                }
              />
              <div className="grid grid-cols-3 gap-2">
                <StatTile glyph="check_circle" value={result.passed} label="Passed" tone="success" />
                <StatTile glyph="warning" value={result.warned} label="Warnings" tone="warning" />
                <StatTile glyph="cancel" value={result.failed} label="Failed" tone="danger" />
              </div>
            </div>
          </div>

          {/* Failures-first case list */}
          <div className="flex flex-col gap-2.5">
            <SectionLabel
              glyph="fact_check"
              text="Test scenarios"
              hint="Failures and warnings first"
            />
            {orderedCases.length === 0 ? (
              <EmptyState
                glyph="task_alt"
                title="No scenarios to show"
                helper="Add an intent and agent script to generate a richer test pack."
              />
            ) : (
              <div className="flex flex-col gap-2">
                {orderedCases.map((tc) => (
                  <TestCaseRow key={tc.id} tc={tc} persona={personaById.get(tc.personaId)} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
