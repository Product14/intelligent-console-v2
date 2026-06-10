"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import LiveCampaignBrief from "./LiveCampaignBrief";
import BuilderTour from "./BuilderTour";
import {
  AgentTurn,
  ChipOption,
  INTRO_AGENT_TEXT,
  PRDState,
  Phase,
  REVIEW_CHIPS,
  STARTER_LIBRARY,
  STARTER_TEXT_BY_ID,
  StarterDefinition,
  StarterGroup,
  analysisMessage,
  defaultsForSubUseCase,
  detectCategory,
  deriveTitle,
  getQuestions,
  getSubUseCaseLabel,
  parsePromptAnswers,
  reviewMessage,
  CRM_FIELD_PREFIX,
  SCORED_FIELDS,
  SubUseCase,
} from "./describe-engine";
import {
  type AgentCustomization,
  DEFAULT_CUSTOMIZATION,
  detectConflict,
} from "./personas";
import {
  type CampaignDetails,
  DEFAULT_DETAILS,
  FinalizeSection,
  CustomizeAgentSection,
  PersonaPickerSection,
  TestCallSection,
  CampaignDetailsSection,
  ConflictModal,
} from "./finalize-sections";
import {
  Sparkles as SparklesIcon,
  Rocket,
  Gem,
  CalendarClock,
  Anchor,
  Snowflake,
  Car,
  ShieldCheck,
  Wrench,
  Bell,
  Pin,
} from "lucide-react";
import { AgentMark, StatTile, StatusBanner, SectionLabel } from "../shared";
import CampaignQASuite from "./CampaignQASuite";

/* ────────────────────────────────────────────────────────────────── */

interface ChatMessage {
  id: string;
  role: "agent" | "user";
  text: string;
  isClarifier?: boolean;
  streaming?: boolean;
  turn?: AgentTurn;
}

function newId() {
  return `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Sentinel value a "Keep" chip carries — handled specially so the pre-filled
 *  template value is preserved rather than overwritten. */
const KEEP_VALUE = "__keep_template__";

/** Pretty one-line preview of a pre-filled PRD value for a confirm chip. */
function prettyPrefill(value: unknown): string {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "none";
  if (value == null || String(value).trim() === "") return "not set";
  return String(value);
}

/**
 * Picking a template walks the user through CONFIRMING each required detail
 * rather than silently scaffolding. For each scored field we reuse the canonical
 * question + its chips, prepend a "Keep" chip carrying the template's pre-filled
 * value, and let the user Accept or Edit before continuing.
 */
function buildConfirmTurns(sub: SubUseCase | undefined, prd: PRDState): AgentTurn[] {
  const CONFIRM_LABEL: Record<string, string> = {
    audienceSize: "Audience size",
    audienceSource: "Audience source",
    cadence: "Cadence",
    channels: "Channels",
    coreMessage: "Core offer / message",
    restrictedTopics: "Restricted topics",
    primaryKPI: "Headline KPI",
  };
  // Canonical questions (full list, ignoring already-filled) give us the edit chips.
  const base = getQuestions(sub);
  const byKey = new Map(base.map((q) => [q.fieldKey as string, q]));

  const order = ["audienceSource", "audienceSize", "channels", "cadence", "coreMessage", "restrictedTopics"];
  const turns: AgentTurn[] = [];
  for (const key of order) {
    const q = byKey.get(key);
    if (!q) continue;
    const current = (prd as Record<string, unknown>)[key];
    const keepChip: ChipOption = {
      label: `Keep — ${prettyPrefill(current)}`.slice(0, 60),
      hint: "Template default",
      value: KEEP_VALUE,
    };
    const label = CONFIRM_LABEL[key] ?? q.text;
    // For free-text fields (coreMessage), offer Keep + an inline Edit modal.
    // For chip fields, expose the canonical options as one-tap alternatives.
    const editChips: ChipOption[] =
      q.inputKind === "free_text"
        ? [{ label: "Edit", value: "edit_free", custom: { title: label, placeholder: "Rewrite the core message…", multiline: true } }]
        : (q.chips ?? []);
    // channels and restrictedTopics are multi-select fields — let the user pick
    // multiple values when editing them in the template-confirm flow. The rest
    // stay single-select so "Keep" is always one tap.
    const isMulti = key === "channels" || key === "restrictedTopics";
    turns.push({
      id: `confirm_${key}`,
      text: `**${label}** — **${prettyPrefill(current)}**. Keep, or pick another.`,
      fieldKey: key,
      inputKind: isMulti ? "multi_select" : "single_select",
      chips: [keepChip, ...editChips],
    });
  }
  return turns;
}

function useStreamedText(target: string, enabled: boolean, charsPerTick = 3, tickMs = 16) {
  const [shown, setShown] = useState(enabled ? "" : target);
  const [done, setDone] = useState(!enabled);

  useEffect(() => {
    if (!enabled) {
      setShown(target);
      setDone(true);
      return;
    }
    setShown("");
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i = Math.min(i + charsPerTick, target.length);
      setShown(target.slice(0, i));
      if (i >= target.length) {
        clearInterval(id);
        setDone(true);
      }
    }, tickMs);
    return () => clearInterval(id);
  }, [target, enabled, charsPerTick, tickMs]);

  return { shown, done };
}

function AgentAvatar() {
  return <AgentMark size={16} className="shrink-0" />;
}

function AgentBubble({ text, isClarifier, streamFinished }: { text: string; isClarifier?: boolean; streamFinished: boolean }) {
  return (
    <div className="mb-4 flex items-end gap-2.5">
      <AgentAvatar />
      <div className="max-w-[88%] rounded-2xl rounded-bl-sm border border-[var(--spyne-border)] bg-[var(--spyne-surface)] px-4 py-3 text-[13.5px] leading-[20px] text-[var(--spyne-text-secondary)] shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        {isClarifier && (
          <span className="spyne-badge spyne-badge-warning mb-2 inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
            Follow-up
          </span>
        )}
        <RichText text={text} />
        {!streamFinished && (
          <span className="ml-0.5 inline-block h-3 w-[2px] animate-pulse bg-[var(--spyne-primary)] align-middle" />
        )}
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="mb-4 flex justify-end">
      <div className="max-w-[78%] whitespace-pre-wrap break-words rounded-2xl rounded-br-sm bg-[var(--spyne-primary)] px-4 py-3 text-[13.5px] leading-[20px] text-white shadow-sm">
        {text}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="mb-4 flex items-end gap-2.5">
      <AgentAvatar />
      <div className="rounded-2xl rounded-bl-sm border border-[var(--spyne-border)] bg-[var(--spyne-surface)] px-4 py-3">
        <div className="flex h-4 items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--spyne-text-muted)]"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Minimal markdown: **bold** and \n */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**")) {
          return <strong key={i} className="font-semibold text-[var(--spyne-text-primary)]">{p.slice(2, -2)}</strong>;
        }
        return (
          <span key={i} className="whitespace-pre-wrap">{p}</span>
        );
      })}
    </>
  );
}

function StreamableAgentBubble({
  message,
  isLast,
  onStreamEnd,
}: {
  message: ChatMessage;
  isLast: boolean;
  onStreamEnd: () => void;
}) {
  const enabled = message.streaming === true && isLast;
  const { shown, done } = useStreamedText(message.text, enabled);
  useEffect(() => {
    if (done && isLast) onStreamEnd();
  }, [done, isLast, onStreamEnd]);
  return <AgentBubble text={shown} isClarifier={message.isClarifier} streamFinished={done} />;
}

/* ── Inputs ──────────────────────────────────────────────────────── */

function ChipsSingle({
  chips,
  onPick,
  disabled,
}: {
  chips: ChipOption[];
  onPick: (chip: ChipOption, customText?: string) => void;
  disabled?: boolean;
}) {
  const [customChip, setCustomChip] = useState<ChipOption | null>(null);
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <button
            key={c.value}
            onClick={() => {
              if (disabled) return;
              if (c.custom) setCustomChip(c);
              else onPick(c);
            }}
            disabled={disabled}
            className="spyne-focus-ring group flex flex-col items-start gap-0.5 rounded-lg border border-[var(--spyne-border)] bg-[var(--spyne-surface)] px-3.5 py-2 text-left transition-all hover:border-[var(--spyne-primary)] hover:bg-[var(--spyne-primary-soft)] hover:shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <span className="text-[13px] font-medium text-[var(--spyne-text-primary)] group-hover:text-[var(--spyne-primary)]">{c.label}</span>
            {c.hint && <span className="text-[10.5px] leading-tight text-[var(--spyne-text-muted)] group-hover:text-[var(--spyne-primary)]">{c.hint}</span>}
          </button>
        ))}
      </div>
      {customChip && customChip.custom && (
        <CustomValueModal
          title={customChip.custom.title}
          placeholder={customChip.custom.placeholder}
          multiline={customChip.custom.multiline}
          onClose={() => setCustomChip(null)}
          onSubmit={(text) => {
            onPick(customChip, text);
            setCustomChip(null);
          }}
        />
      )}
    </>
  );
}

function ChipsMulti({
  chips,
  onSubmit,
  disabled,
}: {
  chips: ChipOption[];
  onSubmit: (values: string[], labels: string[]) => void;
  disabled?: boolean;
}) {
  const [selected, setSelected] = useState<Map<string, string>>(new Map());
  const [customChip, setCustomChip] = useState<ChipOption | null>(null);
  const toggle = (c: ChipOption) => {
    if (disabled) return;
    if (c.custom) {
      setCustomChip(c);
      return;
    }
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(c.value)) next.delete(c.value);
      else next.set(c.value, c.label);
      return next;
    });
  };
  const submit = () => {
    if (selected.size === 0) return;
    onSubmit(Array.from(selected.keys()), Array.from(selected.values()));
  };
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {chips.map((c) => {
          const sel = selected.has(c.value);
          return (
            <button
              key={c.value}
              onClick={() => toggle(c)}
              disabled={disabled}
              className={`spyne-focus-ring rounded-lg border px-3.5 py-2 text-[13px] font-medium transition-all disabled:opacity-50 cursor-pointer ${
                sel
                  ? "border-[var(--spyne-primary)] bg-[var(--spyne-primary)] text-white"
                  : "border-[var(--spyne-border)] bg-[var(--spyne-surface)] text-[var(--spyne-text-primary)] hover:border-[var(--spyne-primary)] hover:bg-[var(--spyne-primary-soft)]"
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] text-[var(--spyne-text-muted)] tabular-nums">
          {selected.size > 0 ? `${selected.size} selected` : "Pick one or more"}
        </span>
        <button
          onClick={submit}
          disabled={disabled || selected.size === 0}
          className="spyne-btn-primary px-3.5 py-1.5 text-[12px] font-semibold disabled:opacity-30 cursor-pointer"
        >
          Continue
        </button>
      </div>
      {customChip && customChip.custom && (
        <CustomValueModal
          title={customChip.custom.title}
          placeholder={customChip.custom.placeholder}
          multiline={customChip.custom.multiline}
          onClose={() => setCustomChip(null)}
          onSubmit={(text) => {
            setSelected((prev) => {
              const next = new Map(prev);
              next.set(text, text);
              return next;
            });
            setCustomChip(null);
          }}
        />
      )}
    </>
  );
}

function FreeTextInput({
  placeholder,
  onSubmit,
  disabled,
  initialValue,
}: {
  placeholder?: string;
  onSubmit: (text: string) => void;
  disabled?: boolean;
  initialValue?: string;
}) {
  const [value, setValue] = useState(initialValue ?? "");
  const submit = () => {
    const v = value.trim();
    if (!v) return;
    onSubmit(v);
    setValue("");
  };
  return (
    <div className="flex flex-col gap-2">
      <textarea
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
        }}
        placeholder={placeholder ?? "Type your answer…"}
        rows={2}
        disabled={disabled}
        className="spyne-focus-ring w-full resize-none rounded-lg border border-[var(--spyne-border)] bg-[var(--spyne-surface)] px-3.5 py-2.5 text-[13px] text-[var(--spyne-text-primary)] placeholder-[var(--spyne-text-muted)] outline-none transition-colors focus:border-[var(--spyne-primary)] disabled:opacity-50"
      />
      <div className="flex items-center justify-end gap-2">
        <span className="text-[11px] text-[var(--spyne-text-muted)]">⌘↵ to send</span>
        <button
          onClick={submit}
          disabled={disabled || !value.trim()}
          className="spyne-btn-primary px-3.5 py-1.5 text-[12px] font-semibold disabled:opacity-30 cursor-pointer"
        >
          Send
        </button>
      </div>
    </div>
  );
}

function CustomValueModal({
  title,
  placeholder,
  multiline,
  onClose,
  onSubmit,
}: {
  title: string;
  placeholder?: string;
  multiline?: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
}) {
  const [value, setValue] = useState("");
  const submit = () => {
    if (!value.trim()) return;
    onSubmit(value.trim());
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="spyne-float w-full max-w-[440px] rounded-2xl bg-[var(--spyne-surface)] p-5" onClick={(e) => e.stopPropagation()}>
        <p className="mb-3 text-[15px] font-bold text-[var(--spyne-text-primary)]">{title}</p>
        {multiline ? (
          <textarea
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="spyne-focus-ring w-full resize-none rounded-lg border border-[var(--spyne-border)] bg-[var(--spyne-page-bg)] px-3 py-2 text-[13px] text-[var(--spyne-text-primary)] placeholder-[var(--spyne-text-muted)] outline-none focus:border-[var(--spyne-primary)] focus:bg-[var(--spyne-surface)]"
          />
        ) : (
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            className="spyne-focus-ring w-full rounded-lg border border-[var(--spyne-border)] bg-[var(--spyne-page-bg)] px-3 py-2 text-[13px] text-[var(--spyne-text-primary)] placeholder-[var(--spyne-text-muted)] outline-none focus:border-[var(--spyne-primary)] focus:bg-[var(--spyne-surface)]"
          />
        )}
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="spyne-btn-secondary px-3 py-1.5 text-[12px] font-medium">Cancel</button>
          <button onClick={submit} disabled={!value.trim()} className="spyne-btn-primary px-3.5 py-1.5 text-[12px] font-semibold disabled:opacity-30">Add</button>
        </div>
      </div>
    </div>
  );
}

const STARTER_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  equity_mining: Gem,
  lease_end: CalendarClock,
  save_the_deal: Anchor,
  aged_lead: Snowflake,
  test_drive_followup: Car,
  service_recall: ShieldCheck,
  declined_services: Wrench,
  service_reminder: Bell,
};

function IntroInput({
  onSubmitText,
  onPickStarter,
  onPickDeployedUseCase,
  deployedUseCases = [],
  disabled,
  initialValue = "",
}: {
  onSubmitText: (text: string) => void;
  onPickStarter: (id: string) => void;
  onPickDeployedUseCase?: (id: string) => void;
  deployedUseCases?: DeployedUseCaseSeed[];
  disabled?: boolean;
  initialValue?: string;
}) {
  const [value, setValue] = useState(initialValue);
  const [showAll, setShowAll] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  // When drafted from an Opportunity, the prompt arrives pre-filled — focus and
  // SELECT it so the user can instantly edit or just hit Describe & build.
  useEffect(() => {
    const ta = taRef.current;
    if (ta && initialValue.trim()) { ta.focus(); ta.select(); }
  }, []);
  const submit = () => {
    if (!value.trim()) return;
    onSubmitText(value.trim());
    setValue("");
  };
  const grouped: Record<StarterGroup, StarterDefinition[]> = {
    sales: STARTER_LIBRARY.filter((s) => s.group === "sales"),
    service: STARTER_LIBRARY.filter((s) => s.group === "service"),
    lifecycle: STARTER_LIBRARY.filter((s) => s.group === "lifecycle"),
  };
  const allStarters = STARTER_LIBRARY;
  const popular = showAll
    ? allStarters
    : [grouped.sales[0], grouped.sales[1], grouped.sales[2], grouped.service[0]].filter(Boolean);

  return (
    <div className="flex flex-col gap-4">
      {/* Prompt box */}
      <div data-tour-b="describe" className="rounded-2xl border border-[var(--spyne-border)] bg-[var(--spyne-surface)] p-1 shadow-[0_1px_2px_rgba(0,0,0,0.03)] focus-within:border-[var(--spyne-primary)] transition-colors">
        <textarea
          ref={taRef}
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(); }}
          placeholder="Describe your campaign — e.g. Run a lease-end outreach for customers maturing in 60-90 days, voice + SMS, low-pressure tone."
          rows={2}
          disabled={disabled}
          className="w-full resize-none rounded-xl bg-transparent px-3.5 py-2.5 text-[14px] leading-[20px] text-[var(--spyne-text-primary)] placeholder-[var(--spyne-text-muted)] outline-none disabled:opacity-50"
        />
        <div className="flex items-center justify-between px-2.5 pb-1.5 pt-0.5">
          <span className="text-[10.5px] text-[var(--spyne-text-muted)]">⌘↵ to send</span>
          <button
            onClick={submit}
            disabled={disabled || !value.trim()}
            className="spyne-btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-semibold disabled:opacity-30 cursor-pointer"
          >
            <SparklesIcon size={11} />
            Describe & build
          </button>
        </div>
      </div>

      {/* Templates */}
      {/* Deployed Use Cases (from the Use Case Studio) — the parent surface */}
      {deployedUseCases.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <span className="text-[10.5px] font-bold uppercase tracking-widest text-[var(--spyne-primary)]">Your deployed use cases</span>
            <span className="rounded-full bg-[var(--spyne-primary-soft)] px-1.5 py-0.5 text-[9.5px] font-bold tabular-nums text-[var(--spyne-primary)]">
              {deployedUseCases.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {deployedUseCases.map((uc) => (
              <button
                key={uc.id}
                disabled={disabled}
                onClick={() => onPickDeployedUseCase?.(uc.id)}
                className="spyne-card-interactive spyne-focus-ring group relative flex items-start gap-2.5 rounded-xl border border-[var(--spyne-primary)]/40 bg-[var(--spyne-primary-soft)] px-3 py-2.5 text-left disabled:opacity-50 cursor-pointer hover:border-[var(--spyne-primary)]"
              >
                <AgentMark size={16} className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="text-[12.5px] font-bold text-[var(--spyne-text-primary)] leading-tight group-hover:text-[var(--spyne-primary)]">{uc.name}</p>
                    {uc.passRate !== undefined && (
                      <span className="spyne-badge spyne-badge-success px-1 py-0.5 text-[9px] font-bold tabular-nums">
                        {Math.round(uc.passRate * 100)}%
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[10.5px] leading-tight text-[var(--spyne-text-secondary)] line-clamp-2">{uc.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[10.5px] font-bold uppercase tracking-widest text-[var(--spyne-text-muted)]">
              {showAll ? "All templates" : "Popular starters"}
            </span>
            <span className="rounded-full bg-[var(--spyne-surface-hover)] px-1.5 py-0.5 text-[9.5px] font-bold tabular-nums text-[var(--spyne-text-secondary)]">
              {showAll ? allStarters.length : popular.length}
            </span>
          </div>
          <button
            onClick={() => setShowAll((s) => !s)}
            className="spyne-focus-ring rounded-lg text-[11px] font-semibold text-[var(--spyne-primary)] hover:underline cursor-pointer"
          >
            {showAll ? "Show popular only" : `See all ${allStarters.length}`}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(showAll ? allStarters : popular).map((s) => {
            const Icon = STARTER_ICONS[s.id] ?? SparklesIcon;
            return (
              <button
                key={s.id}
                disabled={disabled}
                onClick={() => onPickStarter(s.id)}
                className="spyne-card-interactive spyne-focus-ring group relative flex items-start gap-2.5 rounded-xl border border-[var(--spyne-border)] bg-[var(--spyne-surface)] px-3 py-2.5 text-left disabled:opacity-50 cursor-pointer hover:border-[var(--spyne-primary)]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--spyne-primary-soft)] text-[var(--spyne-primary)]">
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-bold text-[var(--spyne-text-primary)] leading-tight group-hover:text-[var(--spyne-primary)]">{s.label}</p>
                  <p className="mt-0.5 text-[10.5px] leading-tight text-[var(--spyne-text-secondary)]">{s.hint}</p>
                </div>
                <span className="absolute right-2 top-2 text-[8.5px] font-bold uppercase tracking-wider text-[var(--spyne-primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                  Use →
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────── */

export interface SavedAudienceSeed {
  id: string;
  name: string;
  count: number;
  summary?: string;
}

export interface DeployedUseCaseSeed {
  id: string;
  name: string;
  description: string;
  category: "sales" | "service";
  subType: string;
  channels: string[];
  passRate?: number;
}

export interface DescribeCampaignBuilderProps {
  onClose: () => void;
  onComplete?: (prd: PRDState) => void;
  /** Pre-fill the brief — e.g. when launching from a saved audience. */
  initialPrd?: PRDState;
  /** A prompt typed at the command bar — auto-starts the describe flow on open. */
  initialPrompt?: string;
  /** Available saved audiences — surfaced as chips at the audience source question. */
  savedAudiences?: SavedAudienceSeed[];
  /** Deployed Use Cases from the Use Case Studio — surfaced on the intro screen. */
  deployedUseCases?: DeployedUseCaseSeed[];
  /** Take the user to the visual audience builder, seeded from typed text. */
  onBuildAudience?: (seedText: string) => void;
}

export default function DescribeCampaignBuilder({
  onClose,
  onComplete,
  initialPrd,
  initialPrompt,
  savedAudiences = [],
  deployedUseCases = [],
  onBuildAudience,
}: DescribeCampaignBuilderProps) {
  const [prd, setPrd] = useState<PRDState>(initialPrd ?? {});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [phase, setPhase] = useState<Phase | "finalize">("intro");
  const [questionsBranch, setQuestionsBranch] = useState<AgentTurn[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [lastStreamDone, setLastStreamDone] = useState(false);

  // ── Finalize state ─────────────────────────────────────────────────
  const [customization, setCustomization] = useState<AgentCustomization>(DEFAULT_CUSTOMIZATION);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>("vini");
  const [testCallPassed, setTestCallPassed] = useState(false);
  const [qaPassed, setQaPassed] = useState(false);
  const [details, setDetails] = useState<CampaignDetails>(DEFAULT_DETAILS);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictsRemoved, setConflictsRemoved] = useState(false);

  const chatScrollRef = useRef<HTMLDivElement>(null);

  const didInit = useRef(false);
  useEffect(() => {
    // Guard React StrictMode's dev double-invoke (and any remount) so the intro
    // and the auto-described prompt are seeded exactly once, not twice.
    if (didInit.current) return;
    didInit.current = true;
    setMessages([
      {
        id: newId(),
        role: "agent",
        text: INTRO_AGENT_TEXT,
        streaming: false,
        turn: { id: "intro", text: INTRO_AGENT_TEXT, fieldKey: "_intro", inputKind: "free_text" },
      },
    ]);
    setLastStreamDone(true);
    // initialPrompt is NOT auto-submitted — it pre-fills + selects the intro box
    // (IntroInput initialValue) so the user lands here, reviews/edits, then sends.
  }, []);

  useEffect(() => {
    if (!chatScrollRef.current) return;
    chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  function pushAgent(text: string, opts: { turn?: AgentTurn; isClarifier?: boolean; streaming?: boolean; delayMs?: number } = {}) {
    const id = newId();
    setIsTyping(true);
    setLastStreamDone(false);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, {
        id,
        role: "agent",
        text,
        isClarifier: opts.isClarifier,
        streaming: opts.streaming ?? true,
        turn: opts.turn,
      }]);
    }, opts.delayMs ?? 600);
  }

  function pushUser(text: string) {
    setMessages((prev) => [...prev, { id: newId(), role: "user", text }]);
  }

  function presentTurn(turn: AgentTurn, delay = 600) {
    pushAgent(turn.text, { turn, streaming: true, delayMs: delay });
  }

  function startWithDescription(text: string, opts?: { fromStarter?: boolean }) {
    pushUser(text);
    setPhase("analyzing");
    setIsTyping(true);
    setTimeout(() => {
      const detected = detectCategory(text);
      // Picking a starter template pre-fills the full brief (the user confirms
      // each value). A typed prompt instead seeds only the structural
      // scaffolding (compliance, trigger latency, skills…) and fills the six
      // "scored" fields ONLY from what the prompt actually said — whatever it
      // left out becomes a question. That's the "ask only what wasn't answered"
      // flow the user described for free-text input.
      const seeded = defaultsForSubUseCase(detected.subUseCase);
      const parsed = parsePromptAnswers(text);
      if (!opts?.fromStarter) {
        for (const k of SCORED_FIELDS) {
          if (parsed[k] === undefined) delete (seeded as Record<string, unknown>)[k];
        }
      }
      const newPrd: PRDState = {
        ...prd,
        ...seeded,
        ...parsed,
        category: detected.category,
        subUseCase: detected.subUseCase,
        summary: text.slice(0, 220),
        title: deriveTitle({ subUseCase: detected.subUseCase }),
      };
      setPrd(newPrd);
      setIsTyping(false);

      // Picking a template doesn't silently scaffold — VINI walks the user
      // through CONFIRMING each required detail (audience, channels, cadence,
      // message, compliance) pre-filled from the template, with Keep / Edit.
      if (opts?.fromStarter) {
        const confirmTurns = buildConfirmTurns(detected.subUseCase, newPrd);
        pushAgent(
          `Loaded the **${getSubUseCaseLabel(detected.subUseCase)}** template. Confirm each detail — keep what fits, edit what doesn't.`,
          { streaming: true }
        );
        setQuestionsBranch(confirmTurns);
        setQuestionIndex(0);
        setPhase("questions");
        if (confirmTurns.length > 0) {
          setTimeout(() => presentTurn(confirmTurns[0], 700), 1500);
        } else {
          setTimeout(() => {
            setPhase("review");
            pushAgent(reviewMessage(newPrd), {
              turn: { id: "review", text: "", fieldKey: "_review", inputKind: "single_select", chips: REVIEW_CHIPS },
              streaming: true,
              delayMs: 600,
            });
          }, 1500);
        }
        return;
      }

      pushAgent(analysisMessage(newPrd), { streaming: true });

      // Pass the current PRD so already-answered questions (e.g. when a saved
      // audience is pre-attached) are skipped automatically.
      const branch = getQuestions(detected.subUseCase, newPrd);
      setQuestionsBranch(branch);
      setQuestionIndex(0);
      setPhase("questions");
      if (branch.length > 0) {
        setTimeout(() => presentTurn(branch[0], 700), 1500);
      } else {
        // Nothing left to ask — go straight to review.
        setTimeout(() => {
          setPhase("review");
          pushAgent(reviewMessage(newPrd), {
            turn: { id: "review", text: "", fieldKey: "_review", inputKind: "single_select", chips: REVIEW_CHIPS },
            streaming: true,
            delayMs: 600,
          });
        }, 1500);
      }
    }, 900);
  }

  function onPickStarter(id: string) {
    const text = STARTER_TEXT_BY_ID[id];
    if (text) startWithDescription(text, { fromStarter: true });
  }

  function advanceToNextQuestion(updatedPrd: PRDState, currentIndex: number) {
    // Re-derive the branch from the latest PRD so a chip that filled multiple
    // fields (e.g. "Pick saved audience" populating both audienceSize and
    // audienceSource) removes those questions from the queue.
    const reshaped = getQuestions(updatedPrd.subUseCase, updatedPrd);
    const currentTurn = questionsBranch[currentIndex];
    // Find where the just-answered question's fieldKey lives in the reshaped list.
    // It might be absent now (got filled) — in that case advance from the same idx.
    let nextIndex = currentIndex + 1;
    if (currentTurn) {
      const stillThere = reshaped.findIndex((q) => q.id === currentTurn.id);
      if (stillThere >= 0) nextIndex = stillThere + 1;
    }
    setQuestionsBranch(reshaped);
    const next = reshaped[nextIndex];
    if (next) {
      setQuestionIndex(nextIndex);
      presentTurn(next, 600);
      return;
    }
    setPhase("review");
    pushAgent(reviewMessage(updatedPrd), {
      turn: { id: "review", text: "", fieldKey: "_review", inputKind: "single_select", chips: REVIEW_CHIPS },
      streaming: true,
      delayMs: 700,
    });
  }

  // Advance through the (static) template-confirm branch without reshaping — the
  // confirm queue is fixed, unlike the normal "ask only what's missing" branch.
  function advanceConfirm(updatedPrd: PRDState, currentIndex: number) {
    const nextIndex = currentIndex + 1;
    const next = questionsBranch[nextIndex];
    if (next) {
      setQuestionIndex(nextIndex);
      presentTurn(next, 600);
      return;
    }
    setPhase("review");
    pushAgent(reviewMessage(updatedPrd), {
      turn: { id: "review", text: "", fieldKey: "_review", inputKind: "single_select", chips: REVIEW_CHIPS },
      streaming: true,
      delayMs: 700,
    });
  }

  function handleAnswer(turn: AgentTurn, rawValue: string | string[], displayLabel: string) {
    pushUser(displayLabel);
    const updated: PRDState = { ...prd };

    // Template-confirm path: "Keep" preserves the pre-filled value; anything
    // else overwrites it. Advances through the static confirm queue.
    if (typeof turn.id === "string" && turn.id.startsWith("confirm_")) {
      if (rawValue !== KEEP_VALUE) {
        const key = turn.fieldKey as string;
        const wasArray = Array.isArray((prd as Record<string, unknown>)[key]);
        // Array-typed fields (channels, restrictedTopics) must stay arrays even
        // when the user edits to a single picked value.
        (updated as Record<string, unknown>)[key] =
          wasArray && !Array.isArray(rawValue) ? [rawValue] : rawValue;
        setPrd(updated);
      }
      advanceConfirm(updated, questionIndex);
      return;
    }

    // Special path: picking a saved audience from the audienceSource step.
    if (
      turn.fieldKey === "audienceSource" &&
      typeof rawValue === "string" &&
      rawValue.startsWith("saved:")
    ) {
      const id = rawValue.slice("saved:".length);
      const audience = savedAudiences.find((a) => a.id === id);
      if (audience) {
        updated.savedAudienceId = audience.id;
        updated.savedAudienceName = audience.name;
        updated.savedAudienceCount = audience.count;
        updated.audienceSource = `Saved: ${audience.name}`;
        updated.audienceSize = `${audience.count.toLocaleString()} leads`;
        setPrd(updated);
        advanceToNextQuestion(updated, questionIndex);
        return;
      }
    }

    if (Array.isArray(rawValue)) {
      (updated as Record<string, unknown>)[turn.fieldKey as string] = rawValue;
    } else {
      (updated as Record<string, unknown>)[turn.fieldKey as string] = rawValue;
    }
    setPrd(updated);
    advanceToNextQuestion(updated, questionIndex);
  }

  function handleReviewChip(value: string) {
    if (value === "launch") {
      pushUser("Launch campaign");
      // Transition into finalize — customize / persona / test call / campaign details.
      const seededName = prd.title || "AI Outbound Campaign";
      const seededCategory: "sales" | "service" = prd.category === "service_ob" ? "service" : "sales";
      const seededSubType = prd.subUseCase ?? (seededCategory === "sales" ? "lead_generation" : "service_reminder");
      setDetails((prev) => ({
        ...prev,
        name: prev.name || seededName,
        category: seededCategory,
        subType: seededSubType,
      }));
      setPhase("finalize");
      return;
    }
    if (value === "save") {
      pushUser("Save as draft");
      onComplete?.(prd);
      return;
    }
    if (value === "restart") {
      setPrd({});
      setQuestionsBranch([]);
      setQuestionIndex(0);
      setPhase("intro");
      setMessages([
        { id: newId(), role: "agent", text: INTRO_AGENT_TEXT, streaming: false, turn: { id: "intro", text: INTRO_AGENT_TEXT, fieldKey: "_intro", inputKind: "free_text" } },
      ]);
      setLastStreamDone(true);
      return;
    }
    if (value === "refine") {
      pushUser("Refine a section");
      pushAgent("What should change? e.g. 'cadence: 7 touches over 30 days'.", {
        turn: { id: "refine", text: "", fieldKey: "_refine", inputKind: "free_text" },
        streaming: true,
        delayMs: 500,
      });
    }
  }

  // Take the LATEST agent message — if it has no turn (e.g. the transient
  // analysis bubble), the input area renders nothing. This prevents stale
  // intro inputs from re-appearing during phase transitions.
  const lastAgentMessage = [...messages].reverse().find((m) => m.role === "agent");
  const activeTurn = lastAgentMessage?.turn;
  const disabled = !lastStreamDone || isTyping;

  const builderTourSteps = useRef([
    { anchor: "describe", title: "Describe it in plain English", body: "We pre-filled this from your opportunity — edit it, or just hit Describe & build and VINI takes over." },
    { anchor: "brief", title: "Your brief fills in live", body: "As you answer, VINI completes this brief and flags what's still missing before you can launch." },
  ]).current;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[var(--spyne-page-bg)]">
      {/* Coachmarks — auto-start once when the builder opens on the intro */}
      <BuilderTour enabled={phase === "intro"} steps={builderTourSteps} />
      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-[var(--spyne-border)] bg-[var(--spyne-surface)] px-6 py-3.5">
        <div className="flex items-center gap-3">
          <AgentMark size={18} className="shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--spyne-primary)]">Campaign Builder</span>
            <span className="text-[15px] font-semibold text-[var(--spyne-text-primary)] leading-tight">
              {phase === "intro" ? "Tell me what you want to launch" :
               phase === "analyzing" ? "Detecting your campaign…" :
               phase === "questions" ? "A few more questions" :
               phase === "review" ? "Ready to launch" : ""}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-1.5 rounded-full border border-[var(--spyne-border)] bg-[var(--spyne-surface)] px-2 py-1 text-[10.5px] text-[var(--spyne-text-secondary)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--spyne-success-text)]" />
            Auto-saving draft
          </span>
          <button
            onClick={onClose}
            className="spyne-focus-ring rounded-full border border-[var(--spyne-border)] bg-[var(--spyne-surface)] p-1.5 hover:bg-[var(--spyne-surface-hover)]"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--spyne-text-secondary)]">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Finalize phase — full-width scrolling multi-section view */}
      {phase === "finalize" ? (
        <FinalizePhase
          prd={prd}
          customization={customization}
          onCustomization={setCustomization}
          selectedPersonaId={selectedPersonaId}
          onSelectPersona={setSelectedPersonaId}
          testCallPassed={testCallPassed}
          onTestCallPassed={() => setTestCallPassed(true)}
          qaPassed={qaPassed}
          onQaPassed={setQaPassed}
          details={details}
          onDetails={setDetails}
          showConflictModal={showConflictModal}
          onShowConflict={setShowConflictModal}
          conflictsRemoved={conflictsRemoved}
          onRemoveConflicts={() => setConflictsRemoved(true)}
          onLaunch={(force = false) => {
            const audienceCount = prd.savedAudienceCount ?? 500;
            const conflict = detectConflict(audienceCount);
            if (!force && conflict.conflicted && !conflictsRemoved) {
              setShowConflictModal(true);
              return;
            }
            const finalPrd = {
              ...prd,
              title: details.name,
              category: details.category === "service" ? "service_ob" : "sales_ob",
            } as PRDState & { isRecurring?: boolean; recurringInterval?: string };
            // Carry the recurring choice through to CampaignsPage's adapter so a
            // created recurring campaign shows the recurring badge in the roster.
            finalPrd.isRecurring = details.isRecurring;
            finalPrd.recurringInterval = details.isRecurring ? details.recurringInterval : undefined;
            onComplete?.(finalPrd);
          }}
          onBackToReview={() => setPhase("review")}
        />
      ) : (
      /* Two-pane main */
      <main className="flex flex-1 min-h-0 gap-4 overflow-hidden p-4">
        {/* LEFT — chat */}
        <section className="spyne-card flex flex-1 min-h-0 flex-col overflow-hidden">
          <div ref={chatScrollRef} className="min-h-0 flex-1 overflow-y-auto p-5">
            {prd.savedAudienceName && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-[var(--spyne-primary)]/40 bg-[var(--spyne-primary-soft)] px-3 py-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--spyne-primary)] text-white">
                  <Pin size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--spyne-primary)]">Audience attached</p>
                  <p className="text-[12.5px] font-semibold text-[var(--spyne-text-primary)] truncate">
                    {prd.savedAudienceName}
                    {prd.savedAudienceCount !== undefined && (
                      <span className="ml-1.5 text-[11px] font-medium text-[var(--spyne-text-secondary)] tabular-nums">
                        · {prd.savedAudienceCount.toLocaleString()} leads
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
            {messages.map((msg, idx) => {
              const isLast = idx === messages.length - 1;
              if (msg.role === "agent") {
                return (
                  <StreamableAgentBubble
                    key={msg.id}
                    message={msg}
                    isLast={isLast}
                    onStreamEnd={() => isLast && setLastStreamDone(true)}
                  />
                );
              }
              return <UserBubble key={msg.id} text={msg.text} />;
            })}
            {isTyping && <TypingIndicator />}
          </div>

          <div className="shrink-0 max-h-[55%] overflow-y-auto border-t border-[var(--spyne-border)] bg-[var(--spyne-page-bg)] p-4">
            {(() => {
              if (!activeTurn) return null;

              if (activeTurn.fieldKey === "_intro") {
                return (
                  <IntroInput
                    initialValue={initialPrompt ?? ""}
                    onSubmitText={startWithDescription}
                    onPickStarter={onPickStarter}
                    onPickDeployedUseCase={(id) => {
                      const uc = deployedUseCases.find((u) => u.id === id);
                      if (uc) {
                        // Pre-fill PRD from the deployed Use Case + jump into analysis with the
                        // Use Case's intent text. The Use Case is the "function definition" —
                        // the campaign just executes it.
                        const seedText = `Run a campaign using the deployed use case "${uc.name}". ${uc.description}`;
                        startWithDescription(seedText);
                      }
                    }}
                    deployedUseCases={deployedUseCases}
                    disabled={disabled}
                  />
                );
              }

              if (activeTurn.fieldKey === "_review") {
                return (
                  <div className="flex flex-wrap gap-2">
                    {(activeTurn.chips ?? REVIEW_CHIPS).map((c) => (
                      <button
                        key={c.value}
                        onClick={() => !disabled && handleReviewChip(c.value)}
                        disabled={disabled}
                        className={`text-[13px] font-semibold cursor-pointer disabled:opacity-50 ${
                          c.value === "launch"
                            ? "spyne-btn-primary"
                            : c.value === "save"
                              ? "spyne-btn-secondary"
                              : c.value === "restart"
                                ? "spyne-btn-secondary"
                                : "spyne-focus-ring rounded-lg border border-[var(--spyne-primary)] bg-[var(--spyne-surface)] px-4 py-2 text-[var(--spyne-primary)] transition-colors hover:bg-[var(--spyne-primary-soft)]"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                );
              }

              if (activeTurn.fieldKey === "_refine") {
                return (
                  <FreeTextInput
                    placeholder="Tell me what to change…"
                    disabled={disabled}
                    onSubmit={(t) => {
                      pushUser(t);
                      pushAgent("Noted. Anything else?", {
                        turn: { id: "review", text: "", fieldKey: "_review", inputKind: "single_select", chips: REVIEW_CHIPS },
                        streaming: true,
                        delayMs: 500,
                      });
                    }}
                  />
                );
              }

              if (activeTurn.inputKind === "single_select") {
                // Inject saved-audience chips at the audience source step.
                let chips = activeTurn.chips ?? [];
                if (activeTurn.fieldKey === "audienceSource" && savedAudiences.length > 0) {
                  const savedChips: ChipOption[] = savedAudiences.map((a) => ({
                    label: a.name,
                    hint: `${a.count.toLocaleString()} leads`,
                    value: `saved:${a.id}`,
                  }));
                  chips = [...savedChips, ...chips];
                }
                // At any audience step, offer a path into the VISUAL audience
                // builder, seeded from what's been described so far.
                const isAudienceStep =
                  activeTurn.fieldKey === "audienceSource" ||
                  activeTurn.fieldKey === "audienceSize";
                return (
                  <div className="flex flex-col gap-2.5">
                    <ChipsSingle
                      chips={chips}
                      disabled={disabled}
                      onPick={(c, customText) => {
                        const value = customText ?? c.value;
                        const label = customText ?? c.label;
                        handleAnswer(activeTurn, value, label);
                      }}
                    />
                    {isAudienceStep && onBuildAudience && (
                      <button
                        onClick={() => !disabled && onBuildAudience(prd.summary ?? prd.audienceSize ?? prd.title ?? "")}
                        disabled={disabled}
                        className="spyne-focus-ring inline-flex w-fit items-center gap-1.5 rounded-lg border border-[var(--spyne-primary)] bg-[var(--spyne-surface)] px-3 py-1.5 text-[12px] font-semibold text-[var(--spyne-primary)] transition-colors hover:bg-[var(--spyne-primary-soft)] disabled:opacity-50 cursor-pointer"
                      >
                        <Pin size={12} /> Build audience visually →
                      </button>
                    )}
                  </div>
                );
              }

              if (activeTurn.inputKind === "multi_select") {
                return (
                  <ChipsMulti
                    chips={activeTurn.chips ?? []}
                    disabled={disabled}
                    onSubmit={(values, labels) =>
                      handleAnswer(activeTurn, values, labels.join(", "))
                    }
                  />
                );
              }

              return (
                <FreeTextInput
                  placeholder="Type your answer…"
                  disabled={disabled}
                  onSubmit={(t) => handleAnswer(activeTurn, t, t)}
                />
              );
            })()}
          </div>
        </section>

        {/* RIGHT — live brief */}
        <section data-tour-b="brief" className="spyne-card hidden w-[42%] min-h-0 shrink-0 flex-col overflow-hidden p-3 md:flex">
          <LiveCampaignBrief
            prd={prd}
            onResolveField={(key, resolution) => {
              // Apply the user's resolution choice. CRM-column keys route into
              // crmFieldMap; everything else writes the top-level PRD field.
              // "set"/"multi" write a picked value directly; csv/crm wrap the
              // source; suppress marks the field resolved-by-suppression so the
              // brief stops flagging it.
              const resolvedValue = (): string => {
                switch (resolution.kind) {
                  case "csv": return `CSV: ${resolution.value}`;
                  case "crm": return `CRM: ${resolution.value}`;
                  case "suppress": return "Suppressed (missing field)";
                  default: return resolution.value ?? "";
                }
              };
              setPrd((prev) => {
                const next = { ...prev } as Record<string, unknown>;
                if (key.startsWith(CRM_FIELD_PREFIX)) {
                  const col = key.slice(CRM_FIELD_PREFIX.length);
                  next.crmFieldMap = { ...(prev.crmFieldMap ?? {}), [col]: resolvedValue() };
                } else if (resolution.kind === "multi") {
                  next[key] = resolution.values ?? [];
                } else {
                  next[key] = resolvedValue();
                }
                return next as PRDState;
              });
            }}
          />
        </section>
      </main>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────
   Finalize phase — multi-section scrolling page with sticky launch bar
   ──────────────────────────────────────────────────────────────────── */

function FinalizePhase({
  prd,
  customization,
  onCustomization,
  selectedPersonaId,
  onSelectPersona,
  testCallPassed,
  onTestCallPassed,
  qaPassed,
  onQaPassed,
  details,
  onDetails,
  showConflictModal,
  onShowConflict,
  conflictsRemoved,
  onRemoveConflicts,
  onLaunch,
  onBackToReview,
}: {
  prd: PRDState;
  customization: AgentCustomization;
  onCustomization: (c: AgentCustomization) => void;
  selectedPersonaId: string | null;
  onSelectPersona: (id: string) => void;
  testCallPassed: boolean;
  onTestCallPassed: () => void;
  qaPassed: boolean;
  onQaPassed: (passed: boolean) => void;
  details: CampaignDetails;
  onDetails: (d: CampaignDetails) => void;
  showConflictModal: boolean;
  onShowConflict: (v: boolean) => void;
  conflictsRemoved: boolean;
  onRemoveConflicts: () => void;
  onLaunch: (force?: boolean) => void;
  onBackToReview: () => void;
}) {
  const audienceCount = prd.savedAudienceCount ?? 500;
  const subUseCase = prd.subUseCase ?? "follow_up";
  const conflict = detectConflict(audienceCount);

  // Compact agent-script string for the QA suite — deterministic, derived from
  // the brief the user just built (core message + customization + guardrails).
  const qaAgentScript = [
    prd.coreMessage ?? "",
    `Channels: ${(prd.channels ?? []).join(", ")}`,
    `Trade-in: ${customization.tradeIn}. Financing: ${customization.financing}. Discount: ${customization.discount}.`,
    (prd.restrictedTopics ?? []).length > 0
      ? `Must not discuss: ${(prd.restrictedTopics ?? []).join(", ")}.`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const customizationDone = true; // toggles always have a value
  const personaDone = selectedPersonaId !== null;
  const detailsDone = details.name.trim().length > 0;
  // Launch unlocks once the required sections are complete. The QA suite is a
  // strong, visible pre-launch recommendation (surfaced in the bar below) but
  // not a hard lock, so a deterministic sub-threshold seed can't trap the flow.
  const canLaunch = customizationDone && personaDone && detailsDone;

  return (
    <>
      <main className="flex flex-1 min-h-0 flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 bg-[var(--spyne-page-bg)]">
          <div className="mx-auto max-w-[920px] space-y-3.5">
            {/* Top banner */}
            <div className="rounded-2xl border border-[var(--spyne-border)] bg-[var(--spyne-primary-soft)] p-4">
              <div className="flex items-start gap-3">
                <AgentMark size={16} className="shrink-0" />
                <div className="flex-1">
                  <p className="text-[14px] font-bold text-[var(--spyne-text-primary)]">Finalize the campaign</p>
                </div>
                <button
                  onClick={onBackToReview}
                  className="spyne-btn-secondary px-2.5 py-1.5 text-[11.5px] font-semibold cursor-pointer shrink-0"
                >
                  ← Back to chat
                </button>
              </div>
            </div>

            <FinalizeSection
              num={1}
              title="Customize the agent brain"
              subtitle="How it handles trade-in, financing, discounts, and language."
              status={customizationDone ? "done" : "active"}
            >
              <CustomizeAgentSection
                customization={customization}
                onChange={onCustomization}
              />
            </FinalizeSection>

            <FinalizeSection
              num={2}
              title="Pick the AI persona"
              subtitle="The voice and accent customers will hear."
              status={personaDone ? "done" : "active"}
            >
              <PersonaPickerSection
                selectedId={selectedPersonaId}
                onSelect={onSelectPersona}
              />
            </FinalizeSection>

            <FinalizeSection
              num={3}
              title="Test call with this agent"
              subtitle="Sample call on a synthetic lead — transcript, quality score, topics audit."
              status={testCallPassed ? "done" : "active"}
            >
              <TestCallSection
                personaId={selectedPersonaId}
                subUseCase={subUseCase}
                title={details.name || prd.title || "Outbound campaign"}
                dealer="Mega Dealer"
                onComplete={onTestCallPassed}
                onSkip={onTestCallPassed}
              />
            </FinalizeSection>

            <FinalizeSection
              num={4}
              title="Campaign details"
              status={detailsDone ? "done" : "active"}
            >
              <CampaignDetailsSection details={details} onChange={onDetails} />
            </FinalizeSection>

            <FinalizeSection
              num={5}
              title="QA gate"
              subtitle="Simulated callers test booking, objections, opt-outs, and compliance."
              status={qaPassed ? "done" : "active"}
            >
              <CampaignQASuite
                campaignName={details.name || prd.title || "Outbound campaign"}
                intent={prd.summary || prd.coreMessage || ""}
                agentScript={qaAgentScript}
                onPassChange={onQaPassed}
              />
            </FinalizeSection>

            <FinalizeSection
              num={6}
              title="Pre-launch intelligence"
              subtitle="Lead-pool quality, pickup confidence, and best send window."
              status="active"
            >
              <PreLaunchReviewSection prd={prd} audienceCount={audienceCount} />
            </FinalizeSection>

            {/* Conflict pre-warning (inline, before modal) */}
            {conflict.conflicted && !conflictsRemoved && (
              <div className="rounded-2xl border border-[var(--spyne-warning-subtle)] bg-[var(--spyne-warning-subtle)] p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--spyne-surface)] flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--spyne-warning-ink)]">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-bold text-[var(--spyne-warning-ink)]">
                    Conflict with "{conflict.conflictingCampaignName}"
                  </p>
                  <p className="text-[11.5px] text-[var(--spyne-warning-ink)] mt-0.5 leading-snug tabular-nums">
                    {conflict.conflictedCount.toLocaleString()} of your {audienceCount.toLocaleString()} leads are already in an active campaign. Resolve before launch.
                  </p>
                </div>
                <button
                  onClick={() => onShowConflict(true)}
                  className="spyne-btn-primary px-2.5 py-1.5 text-[11px] font-semibold cursor-pointer shrink-0"
                >
                  Resolve
                </button>
              </div>
            )}

            <div className="h-8" />
          </div>
        </div>

        {/* Sticky bottom launch bar */}
        <div className="shrink-0 border-t border-[var(--spyne-border)] bg-[var(--spyne-surface)] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11.5px] text-[var(--spyne-text-secondary)]">
            <SparklesIcon size={11} className="text-[var(--spyne-primary)]" />
            <span>
              {!canLaunch
                ? <span>Complete the sections above to launch.</span>
                : qaPassed
                  ? <><strong className="text-[var(--spyne-text-primary)]">Ready to launch</strong> — QA gate passed.</>
                  : <span><strong className="text-[var(--spyne-warning-ink)]">Ready to launch</strong> — run QA first (recommended).</span>}
            </span>
          </div>
          <button
            onClick={() => onLaunch()}
            disabled={!canLaunch}
            className="spyne-btn-primary inline-flex items-center gap-1.5 px-5 py-2.5 text-[13px] font-bold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <Rocket size={13} />
            Launch campaign
          </button>
        </div>
      </main>

      {/* Conflict modal */}
      {showConflictModal && (
        <ConflictModal
          conflict={conflict}
          totalCount={audienceCount}
          conflictsRemoved={conflictsRemoved}
          onRemoveConflicts={() => onRemoveConflicts()}
          onProceed={() => { onShowConflict(false); onLaunch(true); }}
          onCancel={() => onShowConflict(false)}
        />
      )}
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────
   Pre-launch intelligence — VINI's read on the audience, folded into the
   create flow as a review step (replaces the old disconnected modal).
   All numbers are deterministic, derived from the audience count + brief
   so they're stable across renders (no clock, no RNG).
   ──────────────────────────────────────────────────────────────────── */

function plHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function PreLaunchReviewSection({ prd, audienceCount }: { prd: PRDState; audienceCount: number }) {
  const seed = plHash(`${prd.title ?? ""}|${prd.subUseCase ?? ""}|${prd.coreMessage ?? ""}|${audienceCount}`);

  // Lead-pool quality split — deterministic high/medium/low buckets.
  const total = Math.max(8, audienceCount);
  const highShare = 0.2 + (seed % 18) / 100; // 0.20–0.37
  const lowShare = 0.1 + ((seed >> 5) % 12) / 100; // 0.10–0.21
  const high = Math.round(total * highShare);
  const low = Math.round(total * lowShare);
  const medium = Math.max(0, total - high - low);
  const flagged = Math.max(1, Math.round(total * (0.02 + ((seed >> 9) % 5) / 100)));

  // Pickup confidence distribution.
  const avgConfidence = 48 + ((seed >> 3) % 28); // 48–75%
  const pickupHigh = Math.round(total * (0.22 + ((seed >> 7) % 14) / 100));
  const pickupLow = Math.round(total * (0.12 + ((seed >> 11) % 12) / 100));
  const pickupMedium = Math.max(0, total - pickupHigh - pickupLow);

  // Best-window uplift — deterministic projected lift.
  const uplift = 18 + (seed % 12); // 18–29%

  return (
    <div className="flex flex-col gap-4">
      {/* Lead Pool Quality */}
      <div className="spyne-card overflow-hidden" style={{ borderRadius: 12 }}>
        <div className="border-b border-[var(--spyne-border)] px-4 py-3">
          <SectionLabel glyph="groups" text="Lead pool quality" chip />
        </div>
        <div className="p-4">
          <div className="grid grid-cols-4 gap-2">
            <StatTile glyph="database" value={total.toLocaleString()} label="Total" />
            <StatTile glyph="trending_up" value={high.toLocaleString()} label="High" tone="success" />
            <StatTile glyph="remove" value={medium.toLocaleString()} label="Medium" />
            <StatTile glyph="trending_down" value={low.toLocaleString()} label="Low" tone="danger" />
          </div>
          {/* Quality bar */}
          <div className="mt-3 flex h-2.5 overflow-hidden rounded-full" style={{ background: "var(--spyne-border)" }}>
            <div style={{ width: `${(high / total) * 100}%`, background: "var(--spyne-success-text)" }} />
            <div style={{ width: `${(medium / total) * 100}%`, background: "var(--spyne-border-strong)" }} />
            <div style={{ width: `${(low / total) * 100}%`, background: "var(--spyne-danger-text)" }} />
          </div>
          <p className="mt-2.5 inline-flex items-center gap-1.5 text-[11.5px]" style={{ color: "var(--spyne-text-secondary)" }}>
            <AlertTriangleGlyph />
            <span className="tabular-nums">{flagged.toLocaleString()}</span> leads flagged for review
          </p>
        </div>
      </div>

      {/* Pickup confidence distribution */}
      <div className="spyne-card overflow-hidden" style={{ borderRadius: 12 }}>
        <div className="border-b border-[var(--spyne-border)] px-4 py-3">
          <SectionLabel glyph="call" text="Pickup confidence distribution" chip />
        </div>
        <div className="grid grid-cols-4 gap-2 p-4">
          <StatTile glyph="percent" value={`${avgConfidence}%`} label="Avg confidence" tone="brand" />
          <StatTile glyph="check_circle" value={pickupHigh.toLocaleString()} label="High >75%" tone="success" />
          <StatTile glyph="remove" value={pickupMedium.toLocaleString()} label="Medium" />
          <StatTile glyph="cancel" value={pickupLow.toLocaleString()} label="Low <50%" tone="danger" />
        </div>
      </div>

      {/* Best-window recommendation */}
      <StatusBanner
        severity="info"
        glyph="schedule"
        title="Schedule Voice steps for Tue–Thu, 6–8pm"
        detail={`Projected +${uplift}% pickup rate vs. default timing for this audience.`}
      />
    </div>
  );
}

function AlertTriangleGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--spyne-warning-ink)" }}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
