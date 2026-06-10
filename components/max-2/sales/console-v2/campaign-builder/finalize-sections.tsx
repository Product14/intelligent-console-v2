"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  RotateCcw,
  Check,
} from "lucide-react";
import {
  AgentCustomization,
  DEFAULT_CUSTOMIZATION,
  Persona,
  PERSONA_LIBRARY,
  TranscriptLine,
  buildSampleTranscript,
  findPersona,
  getInitials,
  type ConflictResult,
} from "./personas";
import { SpyneSwitch } from "../shared";

/* ════════════════════════════════════════════════════════════════════
   Section shell
   ════════════════════════════════════════════════════════════════════ */

export function FinalizeSection({
  num,
  title,
  subtitle,
  status,
  children,
}: {
  num: number;
  title: string;
  subtitle?: string;
  status: "pending" | "done" | "active";
  children: React.ReactNode;
}) {
  return (
    <section className="spyne-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--spyne-border)] px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full font-bold text-[13px]"
            style={
              status === "done"
                ? { background: "var(--spyne-success-subtle)", color: "var(--spyne-success-text)" }
                : status === "active"
                  ? { background: "var(--spyne-primary)", color: "#fff" }
                  : { background: "var(--spyne-surface-hover)", color: "var(--spyne-text-secondary)" }
            }
          >
            {status === "done" ? <CheckCircle2 size={14} /> : num}
          </div>
          <div className="flex flex-col">
            <p className="text-[14px] font-bold text-[var(--spyne-text-primary)] leading-tight">{title}</p>
            {subtitle && <p className="text-[11.5px] text-[var(--spyne-text-muted)] leading-tight">{subtitle}</p>}
          </div>
        </div>
        {status === "done" && <span className="spyne-badge spyne-badge-success">Complete</span>}
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════
   1. Customize agent brain (toggles + quick-edit)
   ════════════════════════════════════════════════════════════════════ */

export interface CustomizeProps {
  customization: AgentCustomization;
  onChange: (c: AgentCustomization) => void;
}

const TRADE_IN_OPTIONS = [
  { value: "collect", label: "Collect details, hand off to rep" },
  { value: "estimate", label: "Quote estimated range with confidence" },
  { value: "defer", label: "Defer to in-store appraisal" },
] as const;

const FINANCING_OPTIONS = [
  { value: "collect", label: "Collect interest, hand off to F&I" },
  { value: "softpull", label: "Offer soft credit pull / pre-qual" },
  { value: "defer", label: "Defer entirely until in-store" },
] as const;

const DISCOUNT_OPTIONS = [
  { value: "yes", label: "Yes — agent can quote published incentives" },
  { value: "manager_approval", label: "Manager approval required" },
  { value: "no", label: "Never — refer to in-store conversation" },
] as const;

const LANGUAGE_OPTIONS = [
  { value: "english", label: "English only" },
  { value: "spanish", label: "Spanish only" },
  { value: "hindi", label: "Hindi only" },
  { value: "auto", label: "Auto-detect (EN/ES/HI)" },
] as const;

export function CustomizeAgentSection({ customization, onChange }: CustomizeProps) {
  function patch<K extends keyof AgentCustomization>(k: K, v: AgentCustomization[K]) {
    onChange({ ...customization, [k]: v });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <RadioGroup
        label="Trade-in handling"
        value={customization.tradeIn}
        options={TRADE_IN_OPTIONS}
        onChange={(v) => patch("tradeIn", v as AgentCustomization["tradeIn"])}
      />
      <RadioGroup
        label="Financing handling"
        value={customization.financing}
        options={FINANCING_OPTIONS}
        onChange={(v) => patch("financing", v as AgentCustomization["financing"])}
      />
      <RadioGroup
        label="Discount / incentive handling"
        value={customization.discount}
        options={DISCOUNT_OPTIONS}
        onChange={(v) => patch("discount", v as AgentCustomization["discount"])}
      />
      <RadioGroup
        label="Languages"
        value={customization.language}
        options={LANGUAGE_OPTIONS}
        onChange={(v) => patch("language", v as AgentCustomization["language"])}
      />

      <div className="md:col-span-2 rounded-xl border border-[var(--spyne-border)] bg-[var(--spyne-surface-hover)] px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-[12.5px] font-bold text-[var(--spyne-text-primary)]">Upsell on connected calls</p>
          <p className="text-[11px] text-[var(--spyne-text-secondary)] mt-0.5 leading-snug">
            If a connected call resolves quickly, agent offers a relevant adjacent product (warranty, accessory, service plan).
          </p>
        </div>
        <SpyneSwitch
          checked={customization.upsell}
          onChange={(v) => patch("upsell", v)}
          label="Upsell on connected calls"
        />
      </div>
    </div>
  );
}

function RadioGroup({
  label,
  hint,
  value,
  options,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="rounded-xl border border-[var(--spyne-border)] bg-[var(--spyne-surface-hover)] px-4 py-3">
      <p className="text-[12.5px] font-bold text-[var(--spyne-text-primary)]">{label}</p>
      {hint && <p className="text-[11px] text-[var(--spyne-text-secondary)] mt-0.5 leading-snug">{hint}</p>}
      <div className="mt-2.5 flex flex-col gap-1.5">
        {options.map((o) => (
          <label key={o.value} className="flex items-center gap-2 cursor-pointer group">
            <span
              className="flex items-center justify-center w-4 h-4 rounded-full border-2 transition-colors shrink-0"
              style={{ borderColor: value === o.value ? "var(--spyne-primary)" : "var(--spyne-border)" }}
            >
              {value === o.value && (
                <span className="w-2 h-2 rounded-full" style={{ background: "var(--spyne-primary)" }} />
              )}
            </span>
            <input
              type="radio"
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            <span className="text-[12px] text-[var(--spyne-text-secondary)]">{o.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   2. Persona picker
   ════════════════════════════════════════════════════════════════════ */

export function PersonaPickerSection({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {PERSONA_LIBRARY.map((p) => {
        const isSelected = p.id === selectedId;
        return (
          <PersonaCard key={p.id} persona={p} isSelected={isSelected} onSelect={() => onSelect(p.id)} />
        );
      })}
    </div>
  );
}

function PersonaCard({ persona, isSelected, onSelect }: { persona: Persona; isSelected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="relative flex flex-col gap-2.5 rounded-2xl bg-[var(--spyne-surface)] p-3.5 text-left transition-all cursor-pointer"
      style={{
        border: isSelected ? "2px solid var(--spyne-primary)" : "1px solid var(--spyne-border)",
        transform: isSelected ? "translateY(-2px)" : undefined,
        boxShadow: isSelected ? "var(--spyne-card-shadow)" : undefined,
        transitionTimingFunction: "var(--spyne-ease-out)",
        transitionDuration: "var(--spyne-duration-base)",
      }}
    >
      {persona.recommended && (
        <span className="absolute -left-1 top-3 z-10 rounded-r-lg rounded-tl-lg bg-[var(--spyne-text-primary)] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-white shadow">
          Recommended
        </span>
      )}

      {/* Avatar tile */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden" style={{ background: `linear-gradient(135deg, ${persona.accent_hex}33, ${persona.accent_hex}aa)` }}>
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <span className="text-[44px] font-bold drop-shadow-md">{getInitials(persona.name)}</span>
        </div>
        {/* Subtle wave pattern */}
        <svg className="absolute bottom-0 left-0 right-0" viewBox="0 0 200 40" preserveAspectRatio="none" height="32">
          <path d="M0,20 Q50,0 100,20 T200,20 L200,40 L0,40 Z" fill="white" opacity="0.15" />
        </svg>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[14px] font-bold text-[var(--spyne-text-primary)] leading-tight">{persona.name}</p>
          <span className="spyne-badge spyne-badge-brand">{persona.accent}</span>
        </div>
        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-[var(--spyne-text-secondary)] mt-0.5">{persona.role}</p>
        <p className="text-[11.5px] text-[var(--spyne-text-secondary)] mt-1.5 leading-snug line-clamp-2">{persona.blurb}</p>
        <div className="mt-1.5 flex items-center gap-1">
          {persona.languages.map((l) => (
            <span key={l} className="rounded-lg bg-[var(--spyne-surface-hover)] px-1.5 py-0.5 text-[9.5px] font-semibold text-[var(--spyne-text-secondary)] uppercase">
              {l}
            </span>
          ))}
        </div>
      </div>

      {isSelected && (
        <span className="absolute right-2 top-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-white" style={{ background: "var(--spyne-primary)" }}>
          <Check size={11} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════════
   3. Test call section (live transcript simulation)
   ════════════════════════════════════════════════════════════════════ */

export interface TestCallProps {
  personaId: string | null;
  subUseCase: string;
  title: string;
  dealer?: string;
  onComplete: () => void;
  onSkip: () => void;
}

export function TestCallSection({ personaId, subUseCase, title, dealer, onComplete, onSkip }: TestCallProps) {
  type CallState = "idle" | "calling" | "complete";
  const [state, setState] = useState<CallState>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [visibleLines, setVisibleLines] = useState<TranscriptLine[]>([]);

  const persona = personaId ? findPersona(personaId) : null;
  const personaName = persona?.name ?? "Vini";

  const transcript = useMemo(
    () => buildSampleTranscript({ subUseCase, title, dealer, personaName }),
    [subUseCase, title, dealer, personaName]
  );
  const totalCallMs = transcript[transcript.length - 1].at + 2500;

  useEffect(() => {
    if (state !== "calling") return;
    const start = Date.now();
    const id = window.setInterval(() => {
      const e = Date.now() - start;
      setElapsedMs(e);
      setVisibleLines(transcript.filter((l) => l.at <= e));
      if (e >= totalCallMs) {
        window.clearInterval(id);
        setState("complete");
      }
    }, 120);
    return () => window.clearInterval(id);
  }, [state, transcript, totalCallMs]);

  function startCall() {
    setState("calling");
    setElapsedMs(0);
    setVisibleLines([]);
  }

  function rerun() {
    setState("idle");
    setElapsedMs(0);
    setVisibleLines([]);
  }

  const elapsedSec = Math.floor(elapsedMs / 1000);
  const callLabel = `${Math.floor(elapsedSec / 60)}:${String(elapsedSec % 60).padStart(2, "0")}`;

  if (state === "idle") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-[12.5px] text-[var(--spyne-text-secondary)] leading-snug">
          Hear {personaName} run a sample script before launch.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={startCall}
            disabled={!persona}
            className="spyne-btn-primary inline-flex items-center gap-1.5 disabled:opacity-30"
          >
            <PhoneCall size={12} />
            Start test call
          </button>
          <button
            onClick={onSkip}
            className="spyne-focus-ring rounded-lg text-[12px] font-medium text-[var(--spyne-text-secondary)] hover:text-[var(--spyne-text-primary)] cursor-pointer"
          >
            Skip — I'm happy with the script
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
      {/* Caller card */}
      <div className="flex flex-col items-center gap-3 rounded-xl border border-[#1e293b] bg-gradient-to-br from-[#0F1E36] to-[#16294A] p-4 text-white">
        <div className="relative h-20 w-20">
          <div
            className={`absolute inset-0 rounded-full ${persona ? `bg-gradient-to-br ${persona.bgGradient}` : ""} shadow-lg`}
            style={persona ? undefined : { background: "var(--spyne-primary)" }}
          />
          {state === "calling" && (
            <span
              className="absolute inset-0 animate-ping rounded-full border-2 opacity-50"
              style={{ borderColor: persona?.accent_hex ?? "var(--spyne-primary)" }}
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center text-[28px] font-bold">
            {getInitials(personaName)}
          </div>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <p className="text-[14px] font-bold">{personaName} · AI Agent</p>
          <p className="text-[10.5px] text-white/70 line-clamp-2 text-center">{title}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${state === "calling" ? "animate-pulse" : ""}`}
            style={{ background: "var(--spyne-success-text)" }}
          />
          <span className="text-[11px] font-semibold">{state === "calling" ? "Live" : "Call ended"}</span>
          <span className="mx-1 text-white/30">·</span>
          <span className="text-[11px] tabular-nums text-white/80">{callLabel}</span>
        </div>
        {state === "calling" && (
          <div className="mt-1 flex h-6 items-end gap-0.5">
            {Array.from({ length: 14 }).map((_, i) => (
              <span
                key={i}
                className="spyne-waveform-bar w-0.5 rounded-full"
                style={{ height: "100%", background: "var(--spyne-info-text)", animationDelay: `${(i % 5) * 90}ms` }}
              />
            ))}
          </div>
        )}
        {state === "complete" && (
          <div className="mt-1 flex items-center gap-1.5 rounded-full px-2 py-1" style={{ background: "var(--spyne-success-subtle)" }}>
            <Check size={11} strokeWidth={3} style={{ color: "var(--spyne-success-text)" }} />
            <span className="text-[10px] font-bold" style={{ color: "var(--spyne-success-text)" }}>PASSED</span>
          </div>
        )}
      </div>

      {/* Transcript + scorecard */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 rounded-xl border border-[var(--spyne-border)] bg-[var(--spyne-surface-hover)] p-3 max-h-[320px] overflow-y-auto">
          {visibleLines.map((line, i) => (
            <div key={i} className={`flex ${line.speaker === "agent" ? "" : "justify-end"}`}>
              <div
                className={`max-w-[80%] rounded-xl px-3 py-2 text-[12px] leading-snug ${
                  line.speaker === "agent"
                    ? "rounded-bl-sm bg-[var(--spyne-surface)] border border-[var(--spyne-border)] text-[var(--spyne-text-secondary)]"
                    : "rounded-br-sm text-white"
                }`}
                style={line.speaker === "agent" ? undefined : { background: "var(--spyne-primary)" }}
              >
                <span className="block text-[9px] font-bold uppercase tracking-wider opacity-60 mb-0.5">
                  {line.speaker === "agent" ? personaName : "Customer"}
                </span>
                {line.text}
              </div>
            </div>
          ))}
          {visibleLines.length === 0 && (
            <p className="py-4 text-center text-[11.5px] text-[var(--spyne-text-muted)]">Connecting…</p>
          )}
        </div>

        {state === "complete" && (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg border px-3 py-2" style={{ background: "var(--spyne-success-subtle)", borderColor: "var(--spyne-success-subtle)" }}>
                <p className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--spyne-success-text)]">AI Quality</p>
                <p className="text-[18px] font-bold tabular-nums text-[var(--spyne-success-text)]">8.4</p>
              </div>
              <div className="rounded-lg border px-3 py-2" style={{ background: "var(--spyne-info-subtle)", borderColor: "var(--spyne-info-subtle)" }}>
                <p className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--spyne-info-text)]">Outcome</p>
                <p className="text-[11.5px] font-bold text-[var(--spyne-info-text)] leading-tight mt-0.5">
                  {subUseCase === "equity_mining" || subUseCase === "lease_end"
                    ? "Appointment booked"
                    : subUseCase === "recall"
                      ? "Service slot booked"
                      : "Polite close"}
                </p>
              </div>
              <div className="rounded-lg border px-3 py-2" style={{ background: "var(--spyne-primary-soft)", borderColor: "var(--spyne-primary-soft)" }}>
                <p className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--spyne-primary)]">Restricted topics</p>
                <p className="text-[11.5px] font-bold text-[var(--spyne-primary)] leading-tight mt-0.5">All deferred ✓</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                onClick={rerun}
                className="spyne-btn-secondary inline-flex items-center gap-1.5"
              >
                <RotateCcw size={11} />
                Re-run
              </button>
              <button
                onClick={onComplete}
                className="spyne-focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-[14px] font-semibold text-white cursor-pointer"
                style={{ background: "var(--spyne-success-text)" }}
              >
                <Check size={11} strokeWidth={3} />
                Mark passed
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   4. Campaign details form
   ════════════════════════════════════════════════════════════════════ */

export interface CampaignDetails {
  name: string;
  category: "sales" | "service";
  subType: string;
  startDate: string;
  endDate: string;
  callingHoursStart: string;
  callingHoursEnd: string;
  timezone: string;
  maxAttempts: number;
  retryDelayHours: number;
  /** One-time vs recurring schedule. */
  isRecurring: boolean;
  /** Cadence of the recurrence when isRecurring — "weekly" | "monthly". */
  recurringInterval: "weekly" | "monthly";
}

export const DEFAULT_DETAILS: CampaignDetails = {
  name: "",
  category: "sales",
  subType: "lead_generation",
  startDate: "",
  endDate: "",
  callingHoursStart: "09:00",
  callingHoursEnd: "17:00",
  timezone: "America/Chicago",
  maxAttempts: 3,
  retryDelayHours: 24,
  isRecurring: false,
  recurringInterval: "weekly",
};

const SUB_TYPES: Record<string, { value: string; label: string }[]> = {
  sales: [
    { value: "appointment_setting", label: "Appointment Setting" },
    { value: "lead_generation", label: "Lead Generation" },
    { value: "follow_up", label: "Follow Up" },
    { value: "lease_end", label: "Lease End" },
    { value: "equity_mining", label: "Equity Mining" },
    { value: "save_the_deal", label: "Save the Deal" },
  ],
  service: [
    { value: "recall", label: "Recall" },
    { value: "service_reminder", label: "Service Reminder" },
    { value: "declined_services", label: "Declined Service Recovery" },
  ],
};

export function CampaignDetailsSection({
  details,
  onChange,
}: {
  details: CampaignDetails;
  onChange: (d: CampaignDetails) => void;
}) {
  function patch<K extends keyof CampaignDetails>(k: K, v: CampaignDetails[K]) {
    onChange({ ...details, [k]: v });
  }

  const subs = SUB_TYPES[details.category] ?? [];

  return (
    <div className="flex flex-col gap-3">
      {/* Name with counter */}
      <div className="rounded-xl border border-[var(--spyne-border)] bg-[var(--spyne-surface)] px-4 py-3">
        <label className="text-[12.5px] font-bold text-[var(--spyne-text-primary)] flex items-center gap-1">
          Campaign name <span className="text-[var(--spyne-danger-text)]">*</span>
        </label>
        <div className="relative mt-1.5">
          <input
            value={details.name}
            onChange={(e) => patch("name", e.target.value)}
            placeholder="e.g. Q3 Lease-End Winback"
            maxLength={50}
            className="spyne-focus-ring w-full rounded-lg border border-[var(--spyne-border)] bg-[var(--spyne-surface)] px-3 py-2 pr-14 text-[12.5px] text-[var(--spyne-text-primary)] placeholder:text-[var(--spyne-text-muted)] outline-none"
          />
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10.5px] tabular-nums"
            style={{
              color:
                details.name.length > 45
                  ? "var(--spyne-danger-text)"
                  : details.name.length > 35
                    ? "var(--spyne-warning-ink)"
                    : "var(--spyne-text-muted)",
            }}
          >
            {details.name.length}/50
          </span>
        </div>
      </div>

      {/* Type cards */}
      <div className="grid grid-cols-2 gap-2">
        {(["sales", "service"] as const).map((cat) => {
          const active = details.category === cat;
          const accent = cat === "sales" ? "var(--spyne-primary)" : "var(--spyne-danger-text)";
          const accentBg = cat === "sales" ? "var(--spyne-primary-soft)" : "var(--spyne-danger-subtle)";
          return (
            <button
              key={cat}
              onClick={() => patch("category", cat)}
              className="spyne-focus-ring flex items-start gap-2.5 rounded-xl border-2 p-3 text-left cursor-pointer transition-all"
              style={{
                borderColor: active ? accent : "var(--spyne-border)",
                background: active ? accentBg : "var(--spyne-surface)",
                boxShadow: active ? "var(--spyne-card-shadow)" : undefined,
              }}
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: accentBg }}
              >
                {cat === "sales" ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-[13px] font-bold capitalize" style={{ color: active ? accent : "var(--spyne-text-primary)" }}>{cat}</p>
                <p className="text-[10.5px] text-[var(--spyne-text-secondary)] leading-tight mt-0.5">
                  {cat === "sales" ? "Outreach + conversion" : "Reminders + recalls"}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Sub-type chips */}
      <div className="rounded-xl border border-[var(--spyne-border)] bg-[var(--spyne-surface)] px-4 py-3">
        <label className="text-[12.5px] font-bold text-[var(--spyne-text-primary)]">Sub-type</label>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {subs.map((s) => {
            const active = details.subType === s.value;
            return (
              <button
                key={s.value}
                onClick={() => patch("subType", s.value)}
                className={active ? "spyne-pill spyne-pill-active" : "spyne-pill"}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Schedule */}
      <div className="rounded-xl border border-[var(--spyne-border)] bg-[var(--spyne-surface)] px-4 py-3">
        <label className="text-[12.5px] font-bold text-[var(--spyne-text-primary)]">Schedule</label>
        <div className="mt-2 grid grid-cols-2 gap-2.5">
          <Field label="Start date">
            <input
              type="date"
              value={details.startDate}
              onChange={(e) => patch("startDate", e.target.value)}
              className="spyne-focus-ring w-full rounded-lg border border-[var(--spyne-border)] bg-[var(--spyne-surface)] px-2 py-1.5 text-[12px] text-[var(--spyne-text-primary)] outline-none"
            />
          </Field>
          <Field label="End date">
            <input
              type="date"
              value={details.endDate}
              onChange={(e) => patch("endDate", e.target.value)}
              className="spyne-focus-ring w-full rounded-lg border border-[var(--spyne-border)] bg-[var(--spyne-surface)] px-2 py-1.5 text-[12px] text-[var(--spyne-text-primary)] outline-none"
            />
          </Field>
          <Field label="Calling hours start">
            <input
              type="time"
              value={details.callingHoursStart}
              onChange={(e) => patch("callingHoursStart", e.target.value)}
              className="spyne-focus-ring w-full rounded-lg border border-[var(--spyne-border)] bg-[var(--spyne-surface)] px-2 py-1.5 text-[12px] text-[var(--spyne-text-primary)] outline-none"
            />
          </Field>
          <Field label="Calling hours end">
            <input
              type="time"
              value={details.callingHoursEnd}
              onChange={(e) => patch("callingHoursEnd", e.target.value)}
              className="spyne-focus-ring w-full rounded-lg border border-[var(--spyne-border)] bg-[var(--spyne-surface)] px-2 py-1.5 text-[12px] text-[var(--spyne-text-primary)] outline-none"
            />
          </Field>
          <Field label="Timezone">
            <select
              value={details.timezone}
              onChange={(e) => patch("timezone", e.target.value)}
              className="spyne-focus-ring w-full rounded-lg border border-[var(--spyne-border)] bg-[var(--spyne-surface)] px-2 py-1.5 text-[12px] text-[var(--spyne-text-primary)] outline-none cursor-pointer"
            >
              <option value="America/New_York">Eastern (ET)</option>
              <option value="America/Chicago">Central (CT)</option>
              <option value="America/Denver">Mountain (MT)</option>
              <option value="America/Los_Angeles">Pacific (PT)</option>
              <option value="America/Phoenix">Arizona (AZ)</option>
            </select>
          </Field>
        </div>
      </div>

      {/* Frequency — one-time vs recurring */}
      <div className="rounded-xl border border-[var(--spyne-border)] bg-[var(--spyne-surface)] px-4 py-3">
        <label className="text-[12.5px] font-bold text-[var(--spyne-text-primary)]">Frequency</label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {([
            { value: false, label: "One-time", hint: "Runs once over the schedule above" },
            { value: true, label: "Recurring", hint: "Re-enrolls matching leads on a cadence" },
          ] as const).map((opt) => {
            const active = details.isRecurring === opt.value;
            return (
              <button
                key={String(opt.value)}
                onClick={() => patch("isRecurring", opt.value)}
                className="spyne-focus-ring flex items-start gap-2.5 rounded-xl border-2 p-3 text-left cursor-pointer transition-all"
                style={{
                  borderColor: active ? "var(--spyne-primary)" : "var(--spyne-border)",
                  background: active ? "var(--spyne-primary-soft)" : "var(--spyne-surface)",
                  boxShadow: active ? "var(--spyne-card-shadow)" : undefined,
                }}
              >
                <span
                  className="flex items-center justify-center w-4 h-4 mt-0.5 rounded-full border-2 transition-colors shrink-0"
                  style={{ borderColor: active ? "var(--spyne-primary)" : "var(--spyne-border)" }}
                >
                  {active && <span className="w-2 h-2 rounded-full" style={{ background: "var(--spyne-primary)" }} />}
                </span>
                <span>
                  <span className="block text-[12.5px] font-bold" style={{ color: active ? "var(--spyne-primary)" : "var(--spyne-text-primary)" }}>{opt.label}</span>
                  <span className="block text-[10.5px] leading-tight mt-0.5" style={{ color: "var(--spyne-text-secondary)" }}>{opt.hint}</span>
                </span>
              </button>
            );
          })}
        </div>
        {details.isRecurring && (
          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--spyne-text-muted)" }}>Repeat</span>
            {(["weekly", "monthly"] as const).map((iv) => {
              const active = details.recurringInterval === iv;
              return (
                <button
                  key={iv}
                  onClick={() => patch("recurringInterval", iv)}
                  className={active ? "spyne-pill spyne-pill-active" : "spyne-pill"}
                  style={{ textTransform: "capitalize" }}
                >
                  {iv}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Cadence */}
      <div className="rounded-xl border border-[var(--spyne-border)] bg-[var(--spyne-surface)] px-4 py-3">
        <label className="text-[12.5px] font-bold text-[var(--spyne-text-primary)]">Cadence</label>
        <div className="mt-2 grid grid-cols-2 gap-2.5">
          <Field label="Max attempts per touch">
            <input
              type="number"
              min={1}
              value={details.maxAttempts}
              onChange={(e) => patch("maxAttempts", parseInt(e.target.value) || 1)}
              className="spyne-focus-ring w-full rounded-lg border border-[var(--spyne-border)] bg-[var(--spyne-surface)] px-2 py-1.5 text-[12px] text-[var(--spyne-text-primary)] tabular-nums outline-none"
            />
          </Field>
          <Field label="Retry delay (hours)">
            <input
              type="number"
              min={1}
              value={details.retryDelayHours}
              onChange={(e) => patch("retryDelayHours", parseInt(e.target.value) || 1)}
              className="spyne-focus-ring w-full rounded-lg border border-[var(--spyne-border)] bg-[var(--spyne-surface)] px-2 py-1.5 text-[12px] text-[var(--spyne-text-primary)] tabular-nums outline-none"
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--spyne-text-muted)]">{label}</span>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   5. Conflict modal
   ════════════════════════════════════════════════════════════════════ */

export function ConflictModal({
  conflict,
  totalCount,
  onRemoveConflicts,
  onProceed,
  onCancel,
  conflictsRemoved,
}: {
  conflict: ConflictResult;
  totalCount: number;
  onRemoveConflicts: () => void;
  onProceed: () => void;
  onCancel: () => void;
  conflictsRemoved: boolean;
}) {
  const cleanCount = totalCount - conflict.conflictedCount;
  const pct = totalCount > 0 ? Math.round((conflict.conflictedCount / totalCount) * 100) : 0;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="spyne-float w-full max-w-[460px] rounded-2xl bg-[var(--spyne-surface)] overflow-hidden">
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--spyne-warning-subtle)" }}>
              <AlertTriangle size={18} style={{ color: "var(--spyne-warning-ink)" }} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[var(--spyne-text-primary)]">Conflict detected</h2>
              <p className="text-[12px] text-[var(--spyne-text-secondary)] mt-1 leading-snug">
                Some contacts overlap with an active campaign at this rooftop.
              </p>
            </div>
          </div>

          <div className="rounded-xl border p-3 flex items-center gap-2.5" style={{ borderColor: "var(--spyne-warning-subtle)", background: "var(--spyne-warning-subtle)" }}>
            <span className="h-1.5 w-1.5 rounded-full animate-pulse shrink-0" style={{ background: "var(--spyne-warning-ink)" }} />
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--spyne-warning-ink)]">Active campaign</p>
              <p className="text-[12.5px] font-semibold text-[var(--spyne-text-primary)] truncate">{conflict.conflictingCampaignName}</p>
            </div>
          </div>

          {!conflictsRemoved ? (
            <div className="rounded-xl border border-[var(--spyne-border)] bg-[var(--spyne-surface-hover)] p-3 flex flex-col gap-2">
              <div className="flex justify-between text-[11.5px]">
                <span className="text-[var(--spyne-text-secondary)]">Total audience</span>
                <span className="font-bold text-[var(--spyne-text-primary)] tabular-nums">{totalCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11.5px]">
                <span className="font-semibold text-[var(--spyne-warning-ink)]">Conflicted</span>
                <span className="font-bold text-[var(--spyne-warning-ink)] tabular-nums">{conflict.conflictedCount.toLocaleString()}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[var(--spyne-border)] overflow-hidden">
                <div className="h-full" style={{ width: `${pct}%`, background: "var(--spyne-warning-ink)" }} />
              </div>
              <p className="text-[10.5px] text-[var(--spyne-text-secondary)] tabular-nums">
                {pct}% of your contacts will receive duplicate outreach if you proceed without resolving.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border p-3 flex items-center gap-2.5" style={{ borderColor: "var(--spyne-success-subtle)", background: "var(--spyne-success-subtle)" }}>
              <CheckCircle2 size={16} style={{ color: "var(--spyne-success-text)" }} />
              <div>
                <p className="text-[12px] font-bold text-[var(--spyne-success-text)]">Conflicts removed</p>
                <p className="text-[11px] text-[var(--spyne-success-text)]">
                  Proceeding with <strong className="tabular-nums">{cleanCount.toLocaleString()}</strong> clean contacts.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              onClick={onCancel}
              className="spyne-btn-secondary"
            >
              Cancel
            </button>
            <div className="flex gap-2">
              {!conflictsRemoved && (
                <button
                  onClick={onRemoveConflicts}
                  className="spyne-focus-ring inline-flex h-9 items-center rounded-lg border bg-[var(--spyne-surface)] px-3.5 text-[14px] font-semibold text-[var(--spyne-warning-ink)] cursor-pointer transition-colors"
                  style={{ borderColor: "var(--spyne-warning-ink)" }}
                >
                  Remove conflicts
                </button>
              )}
              <button
                onClick={onProceed}
                className="spyne-focus-ring inline-flex h-9 items-center rounded-lg px-3.5 text-[14px] font-semibold text-white cursor-pointer"
                style={{ background: "var(--spyne-primary)" }}
              >
                Proceed anyway
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
