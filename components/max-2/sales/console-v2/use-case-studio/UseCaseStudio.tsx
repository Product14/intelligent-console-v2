"use client";

import { useState } from "react";
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Plus,
  Trash2,
  MessageSquare,
  Phone,
  Mail,
  Play,
  Rocket,
  ArrowRight,
} from "lucide-react";
import { MaterialSymbol } from "@/components/max-2/material-symbol";
import { AnalyzingPanel, AgentMark } from "../shared";
import {
  type AgentBrain,
  type Channel,
  type DefaultCadence,
  type Persona,
  type Tone,
  type UseCase,
  type WorkflowTouch,
} from "./types";
import {
  DEPLOY_GATE_THRESHOLD,
  USE_CASE_STARTERS,
  canDeploy,
  generatePersonas,
  makeDraftUseCase,
  scoreTestPack,
  type UseCaseStarter,
} from "./engine";

const CHANNEL_ICON: Record<Channel, typeof Phone> = {
  voice: Phone,
  sms: MessageSquare,
  email: Mail,
};

const TONE_OPTIONS: Tone[] = [
  "Friendly, professional",
  "Warm, low-pressure",
  "Direct, time-sensitive",
  "Formal, compliance-grade",
  "Empathetic, customer-first",
];

type StepId = "describe" | "brain" | "workflow" | "cadence" | "personas" | "validate" | "deploy";

const STEPS: { id: StepId; label: string; glyph: string }[] = [
  { id: "describe", label: "Describe", glyph: "auto_awesome" },
  { id: "brain",    label: "Agent brain", glyph: "shield" },
  { id: "workflow", label: "Workflow", glyph: "account_tree" },
  { id: "cadence",  label: "Channels + cadence", glyph: "fork_right" },
  { id: "personas", label: "Personas", glyph: "group" },
  { id: "validate", label: "Batch test", glyph: "play_arrow" },
  { id: "deploy",   label: "Deploy", glyph: "rocket_launch" },
];

export interface UseCaseStudioProps {
  onClose: () => void;
  onDeploy: (uc: UseCase) => void;
  onSaveDraft?: (uc: UseCase) => void;
  initialUseCase?: UseCase;
}

export default function UseCaseStudio({ onClose, onDeploy, onSaveDraft, initialUseCase }: UseCaseStudioProps) {
  const [uc, setUc] = useState<UseCase>(initialUseCase ?? makeDraftUseCase());
  const [step, setStep] = useState<StepId>(initialUseCase ? "brain" : "describe");
  const [running, setRunning] = useState(false);

  const patch = (p: Partial<UseCase>) => setUc((prev) => ({ ...prev, ...p, updatedAt: new Date().toISOString() }));
  const patchBrain = (p: Partial<AgentBrain>) => setUc((prev) => ({ ...prev, agentBrain: { ...prev.agentBrain, ...p } }));

  function goTo(next: StepId) { setStep(next); }
  function goNext() {
    const idx = STEPS.findIndex((s) => s.id === step);
    if (idx >= 0 && idx < STEPS.length - 1) setStep(STEPS[idx + 1].id);
  }
  function goPrev() {
    const idx = STEPS.findIndex((s) => s.id === step);
    if (idx > 0) setStep(STEPS[idx - 1].id);
  }

  function handlePickStarter(s: UseCaseStarter) {
    const draft = makeDraftUseCase(s);
    setUc(draft);
    setStep("brain");
  }

  function handleRunBatch() {
    setRunning(true);
    setUc((prev) => ({ ...prev, status: "testing" }));
    // Mock a 3-stage run: generating cases → running → scoring
    setTimeout(() => {
      const personas = uc.personas.length > 0 ? uc.personas : generatePersonas(uc.intent);
      const result = scoreTestPack(uc.agentBrain, personas);
      setUc((prev) => ({
        ...prev,
        personas,
        batchResult: result,
      }));
      setRunning(false);
    }, 2200);
  }

  function handleDeploy() {
    if (!canDeploy(uc)) return;
    const deployed: UseCase = { ...uc, status: "deployed", updatedAt: new Date().toISOString() };
    onDeploy(deployed);
  }

  // Steps lock once the batch has been validated (the PRD's "pinned promptVersionId" idea)
  const locked = uc.status === "deployed";

  return (
    <div className="flex h-full flex-col overflow-hidden" style={{ background: "var(--spyne-page-bg)" }}>
      {/* Header */}
      <header className="shrink-0 border-b px-6 py-3.5" style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-surface)" }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <AgentMark size={18} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: "var(--spyne-primary)" }}>Use Case Studio</span>
                <span className="spyne-badge spyne-badge-brand text-[9px] uppercase tracking-wider">
                  Parent surface
                </span>
                {uc.status === "deployed" && (
                  <span className="spyne-badge spyne-badge-success text-[9px] uppercase tracking-wider">
                    Deployed
                  </span>
                )}
              </div>
              <input
                value={uc.name}
                onChange={(e) => patch({ name: e.target.value })}
                placeholder="Name this use case…"
                className="spyne-focus-ring w-full bg-transparent text-[16px] font-bold outline-none"
                style={{ color: "var(--spyne-text-primary)" }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onSaveDraft && uc.status !== "deployed" && (
              <button
                onClick={() => onSaveDraft(uc)}
                className="spyne-btn-secondary text-[11.5px]"
              >
                Save draft
              </button>
            )}
            <button
              onClick={onClose}
              className="spyne-focus-ring rounded-lg border p-1.5"
              style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-surface)" }}
              aria-label="Close"
            >
              <X size={14} style={{ color: "var(--spyne-text-secondary)" }} />
            </button>
          </div>
        </div>

        {/* Step bar */}
        <div className="spyne-line-tab-strip spyne-line-tab-strip--compact mt-3 overflow-x-auto border-b-0">
          {STEPS.map((s, i) => {
            const isActive = s.id === step;
            const isPast = STEPS.findIndex((x) => x.id === step) > i;
            return (
              <button
                key={s.id}
                onClick={() => goTo(s.id)}
                disabled={locked}
                className="spyne-line-tab spyne-focus-ring whitespace-nowrap"
                aria-selected={isActive}
                style={isPast && !isActive ? { color: "var(--spyne-success-text)" } : undefined}
              >
                <MaterialSymbol name={isPast ? "check_circle" : s.glyph} size={14} />
                <span className="tabular-nums">{i + 1}. {s.label}</span>
                {i < STEPS.length - 1 && !isActive && (
                  <ChevronRight size={11} style={{ color: "var(--spyne-text-muted)" }} />
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
        <div className="mx-auto max-w-[920px] space-y-4">
          {step === "describe" && (
            <DescribeStep uc={uc} onPatch={patch} onPickStarter={handlePickStarter} />
          )}
          {step === "brain" && (
            <BrainStep brain={uc.agentBrain} onPatch={patchBrain} />
          )}
          {step === "workflow" && (
            <WorkflowStep workflow={uc.workflow} onPatch={(workflow) => patch({ workflow })} />
          )}
          {step === "cadence" && (
            <CadenceStep
              channels={uc.channels}
              onChannels={(channels) => patch({ channels })}
              cadence={uc.cadence}
              onCadence={(cadence) => patch({ cadence })}
            />
          )}
          {step === "personas" && (
            <PersonasStep
              personas={uc.personas}
              intent={uc.intent}
              onGenerate={() => patch({ personas: generatePersonas(uc.intent) })}
            />
          )}
          {step === "validate" && (
            <ValidateStep
              uc={uc}
              running={running}
              onRun={handleRunBatch}
            />
          )}
          {step === "deploy" && (
            <DeployStep uc={uc} onDeploy={handleDeploy} />
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="shrink-0 border-t px-6 py-3 flex items-center justify-between" style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-surface)" }}>
        <button
          onClick={goPrev}
          disabled={step === STEPS[0].id}
          className="spyne-btn-ghost text-[12px] disabled:opacity-30"
        >
          ← Back
        </button>
        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--spyne-text-secondary)" }}>
          <Sparkles size={11} style={{ color: "var(--spyne-primary)" }} />
          <span>
            <strong style={{ color: "var(--spyne-text-primary)" }}>PRD invariant</strong> — Use Case = function definition. The Campaign Builder reads from this.
          </span>
        </div>
        {step !== "deploy" ? (
          <button
            onClick={goNext}
            className="spyne-btn-primary text-[12px]"
          >
            Continue
            <ArrowRight size={11} />
          </button>
        ) : (
          <span className="text-[11px]" style={{ color: "var(--spyne-text-muted)" }}>Final step</span>
        )}
      </footer>
    </div>
  );
}

/* ── Step components ────────────────────────────────────────────── */

function DescribeStep({
  uc,
  onPatch,
  onPickStarter,
}: {
  uc: UseCase;
  onPatch: (p: Partial<UseCase>) => void;
  onPickStarter: (s: UseCaseStarter) => void;
}) {
  return (
    <div className="space-y-4">
      <StepIntro
        title="Describe what this agent does"
        subtitle="The PRD calls this a 'function definition.' One Use Case can power many campaigns — the agent brain, workflow, and test pack live here, not in the campaign."
      />

      <Card title="Plain-English intent">
        <textarea
          value={uc.intent}
          onChange={(e) => onPatch({ intent: e.target.value })}
          placeholder="e.g. Re-engage customers whose lease is expiring in the next 60-90 days. Lead with renew / upgrade / buy-out options. Low-pressure tone."
          rows={4}
          className="spyne-focus-ring w-full resize-none rounded-lg border px-3.5 py-2.5 text-[13px] leading-[20px] outline-none"
          style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-surface)", color: "var(--spyne-text-primary)" }}
        />
      </Card>

      <Card title="Or pick a Spyne-curated starter" subtitle="Pre-fills the agent brain, workflow, and channels. You can edit anything before deploy.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {USE_CASE_STARTERS.map((s) => (
            <button
              key={s.id}
              onClick={() => onPickStarter(s)}
              className="spyne-card-interactive group text-left rounded-xl px-3.5 py-3"
            >
              <div className="flex items-start justify-between mb-1.5">
                <p className="text-[13px] font-bold" style={{ color: "var(--spyne-text-primary)" }}>{s.label}</p>
                <span className={`spyne-badge text-[9.5px] uppercase tracking-wider ${
                  s.category === "service" ? "spyne-badge-danger" : "spyne-badge-brand"
                }`}>
                  {s.category}
                </span>
              </div>
              <p className="text-[11.5px] leading-snug" style={{ color: "var(--spyne-text-secondary)" }}>{s.description}</p>
              <div className="mt-2 flex items-center gap-1">
                {s.channels.map((ch) => {
                  const Icon = CHANNEL_ICON[ch];
                  return (
                    <span
                      key={ch}
                      className="inline-flex items-center gap-0.5 rounded-lg px-1.5 py-0.5 text-[9.5px] font-semibold uppercase"
                      style={{ background: "var(--spyne-primary-soft)", color: "var(--spyne-primary)" }}
                    >
                      <Icon size={9} /> {ch}
                    </span>
                  );
                })}
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card title="Sub-type">
        <div className="flex flex-wrap gap-2">
          {(["sales", "service"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => onPatch({ category: cat })}
              className={`spyne-focus-ring capitalize ${uc.category === cat ? "spyne-pill-active" : "spyne-pill"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

function BrainStep({ brain, onPatch }: { brain: AgentBrain; onPatch: (p: Partial<AgentBrain>) => void }) {
  function updateList(list: "mustDo" | "goodToHave" | "mustNotDo", i: number, v: string) {
    onPatch({ [list]: brain[list].map((x, idx) => (idx === i ? v : x)) } as Partial<AgentBrain>);
  }
  function removeFromList(list: "mustDo" | "goodToHave" | "mustNotDo", i: number) {
    onPatch({ [list]: brain[list].filter((_, idx) => idx !== i) } as Partial<AgentBrain>);
  }
  function addToList(list: "mustDo" | "goodToHave" | "mustNotDo") {
    onPatch({ [list]: [...brain[list], "New rule"] } as Partial<AgentBrain>);
  }

  return (
    <div className="space-y-4">
      <StepIntro
        title="Agent brain — the talk track guardrails"
        subtitle="Per the PRD: the must-not-do list is the safety rail — enforced in the prompt and audited monthly on recordings. These travel with every campaign that uses this Use Case."
      />

      <Card title="Tone">
        <div className="flex flex-wrap gap-2">
          {TONE_OPTIONS.map((t) => (
            <button
              key={t}
              onClick={() => onPatch({ tone: t })}
              className={`spyne-focus-ring ${brain.tone === t ? "spyne-pill-active" : "spyne-pill"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </Card>

      <Card title="Opening line">
        <textarea
          value={brain.openingLine ?? ""}
          onChange={(e) => onPatch({ openingLine: e.target.value })}
          placeholder="Hi {{firstName}}, this is Vini from {{dealer}}…"
          rows={2}
          className="spyne-focus-ring w-full resize-none rounded-lg border px-3 py-2 text-[12.5px] outline-none"
          style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-surface)", color: "var(--spyne-text-primary)" }}
        />
        <p className="mt-1 text-[10.5px]" style={{ color: "var(--spyne-text-muted)" }}>Use {"{{firstName}}"}, {"{{dealer}}"}, {"{{vehicle}}"} for runtime substitution.</p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <ListBlock
          label="MUST DO"
          tone="success"
          items={brain.mustDo}
          onChange={(i, v) => updateList("mustDo", i, v)}
          onRemove={(i) => removeFromList("mustDo", i)}
          onAdd={() => addToList("mustDo")}
        />
        <ListBlock
          label="GOOD TO HAVE"
          tone="brand"
          items={brain.goodToHave}
          onChange={(i, v) => updateList("goodToHave", i, v)}
          onRemove={(i) => removeFromList("goodToHave", i)}
          onAdd={() => addToList("goodToHave")}
        />
        <ListBlock
          label="MUST NOT DO"
          tone="danger"
          items={brain.mustNotDo}
          onChange={(i, v) => updateList("mustNotDo", i, v)}
          onRemove={(i) => removeFromList("mustNotDo", i)}
          onAdd={() => addToList("mustNotDo")}
        />
      </div>
    </div>
  );
}

function WorkflowStep({
  workflow,
  onPatch,
}: {
  workflow: WorkflowTouch[];
  onPatch: (w: WorkflowTouch[]) => void;
}) {
  function update(id: string, patch: Partial<WorkflowTouch>) {
    onPatch(workflow.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }
  function remove(id: string) {
    onPatch(workflow.filter((t) => t.id !== id));
  }
  function add() {
    const last = workflow[workflow.length - 1];
    onPatch([...workflow, {
      id: `t_${Math.random().toString(36).slice(2, 8)}`,
      dayOffset: (last?.dayOffset ?? 0) + 2,
      channel: "voice",
      intent: "Follow-up",
    }]);
  }

  return (
    <div className="space-y-4">
      <StepIntro
        title="Workflow — the touchpoint shape"
        subtitle="The PRD's mandate: 'Workflow preview before launch — ops will not trust a campaign they can't see.' This is the box diagram any campaign using this Use Case will inherit."
      />

      <Card title="Touch sequence">
        <div className="flex flex-col gap-2">
          {workflow.map((t, i) => {
            const Icon = CHANNEL_ICON[t.channel];
            return (
              <div key={t.id} className="flex items-center gap-3 rounded-xl border px-3 py-2.5" style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-surface)" }}>
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={
                      t.channel === "voice"
                        ? { background: "var(--spyne-info-subtle)", color: "var(--spyne-info-text)" }
                        : t.channel === "sms"
                          ? { background: "var(--spyne-primary-soft)", color: "var(--spyne-primary)" }
                          : { background: "var(--spyne-danger-subtle)", color: "var(--spyne-danger-text)" }
                    }
                  >
                    <Icon size={14} />
                  </div>
                  <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wider tabular-nums" style={{ color: "var(--spyne-text-muted)" }}>
                    Touch {i + 1}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10.5px] font-semibold" style={{ color: "var(--spyne-text-muted)" }}>Day</span>
                  <input
                    type="number"
                    min={0}
                    value={t.dayOffset}
                    onChange={(e) => update(t.id, { dayOffset: parseInt(e.target.value) || 0 })}
                    className="spyne-focus-ring w-14 rounded-lg border px-1.5 py-1 text-[12px] tabular-nums outline-none"
                    style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-surface)", color: "var(--spyne-text-primary)" }}
                  />
                </div>
                <select
                  value={t.channel}
                  onChange={(e) => update(t.id, { channel: e.target.value as Channel })}
                  className="spyne-focus-ring rounded-lg border px-2 py-1 text-[12px] outline-none cursor-pointer"
                  style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-surface)", color: "var(--spyne-text-primary)" }}
                >
                  <option value="voice">Voice</option>
                  <option value="sms">SMS</option>
                </select>
                <input
                  value={t.intent}
                  onChange={(e) => update(t.id, { intent: e.target.value })}
                  className="spyne-focus-ring flex-1 rounded-lg border px-2 py-1 text-[12px] outline-none"
                  style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-surface)", color: "var(--spyne-text-primary)" }}
                />
                <button
                  onClick={() => remove(t.id)}
                  className="spyne-focus-ring rounded-lg p-1"
                  aria-label="Remove touch"
                >
                  <Trash2 size={12} style={{ color: "var(--spyne-danger-text)" }} />
                </button>
              </div>
            );
          })}
          <button
            onClick={add}
            className="spyne-focus-ring self-start inline-flex items-center gap-1 rounded-lg border border-dashed px-3 py-1.5 text-[12px] font-semibold cursor-pointer"
            style={{ borderColor: "var(--spyne-primary)", background: "var(--spyne-primary-soft)", color: "var(--spyne-primary)" }}
          >
            <Plus size={11} strokeWidth={2.5} />
            Add touchpoint
          </button>
        </div>
      </Card>

      <Card title="Reply / no-reply branches" subtitle="Inherited from the runtime contract. Every touch passes the same guard stack before dispatch.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11.5px]">
          <div className="rounded-xl border p-3" style={{ background: "var(--spyne-success-subtle)", borderColor: "var(--spyne-success-muted)" }}>
            <p className="font-bold mb-1.5" style={{ color: "var(--spyne-success-text)" }}>If REPLIED</p>
            <ul className="space-y-0.5 list-disc list-inside" style={{ color: "var(--spyne-success-text)" }}>
              <li>INTERESTED → book appointment, exit ✓</li>
              <li>OBJECTION → drop to slower nurture</li>
              <li>NOT INTERESTED → close-lost, exit</li>
              <li>STOP / opt-out → suppress everywhere, exit</li>
            </ul>
          </div>
          <div className="rounded-xl border p-3" style={{ background: "var(--spyne-warning-subtle)", borderColor: "var(--spyne-warning-muted)" }}>
            <p className="font-bold mb-1.5" style={{ color: "var(--spyne-warning-ink)" }}>If NO REPLY</p>
            <ul className="space-y-0.5 list-disc list-inside" style={{ color: "var(--spyne-warning-ink)" }}>
              <li>Advance to next touch on schedule</li>
              <li>Escalate channel if configured (call → SMS)</li>
              <li>Touches exhausted → no-contact exit, return to pool</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

function CadenceStep({
  channels,
  onChannels,
  cadence,
  onCadence,
}: {
  channels: Channel[];
  onChannels: (c: Channel[]) => void;
  cadence: DefaultCadence;
  onCadence: (c: DefaultCadence) => void;
}) {
  function toggle(ch: Channel) {
    onChannels(channels.includes(ch) ? channels.filter((c) => c !== ch) : [...channels, ch]);
  }
  return (
    <div className="space-y-4">
      <StepIntro
        title="Channels + cadence defaults"
        subtitle="These travel with the Use Case but a campaign can override them at launch."
      />

      <Card title="Channels">
        <div className="flex flex-wrap gap-2">
          {(["voice", "sms"] as Channel[]).map((ch) => {
            const Icon = CHANNEL_ICON[ch];
            const active = channels.includes(ch);
            return (
              <button
                key={ch}
                onClick={() => toggle(ch)}
                className={`spyne-focus-ring uppercase ${active ? "spyne-pill-active" : "spyne-pill"}`}
              >
                <Icon size={11} />
                {ch}
              </button>
            );
          })}
        </div>
      </Card>

      <Card title="Cadence defaults">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--spyne-text-muted)" }}>Max attempts per touch</label>
            <input
              type="number"
              min={1}
              value={cadence.maxAttempts}
              onChange={(e) => onCadence({ ...cadence, maxAttempts: parseInt(e.target.value) || 1 })}
              className="spyne-focus-ring rounded-lg border px-2 py-1.5 text-[12.5px] tabular-nums outline-none"
              style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-surface)", color: "var(--spyne-text-primary)" }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--spyne-text-muted)" }}>Retry delay (hours)</label>
            <input
              type="number"
              min={1}
              value={cadence.retryDelayHours}
              onChange={(e) => onCadence({ ...cadence, retryDelayHours: parseInt(e.target.value) || 1 })}
              className="spyne-focus-ring rounded-lg border px-2 py-1.5 text-[12.5px] tabular-nums outline-none"
              style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-surface)", color: "var(--spyne-text-primary)" }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--spyne-text-muted)" }}>Silent hours start</label>
            <input
              type="time"
              value={cadence.silentHoursStart}
              onChange={(e) => onCadence({ ...cadence, silentHoursStart: e.target.value })}
              className="spyne-focus-ring rounded-lg border px-2 py-1.5 text-[12.5px] tabular-nums outline-none"
              style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-surface)", color: "var(--spyne-text-primary)" }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--spyne-text-muted)" }}>Silent hours end</label>
            <input
              type="time"
              value={cadence.silentHoursEnd}
              onChange={(e) => onCadence({ ...cadence, silentHoursEnd: e.target.value })}
              className="spyne-focus-ring rounded-lg border px-2 py-1.5 text-[12.5px] tabular-nums outline-none"
              style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-surface)", color: "var(--spyne-text-primary)" }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

function PersonasStep({
  personas,
  intent,
  onGenerate,
}: {
  personas: Persona[];
  intent: string;
  onGenerate: () => void;
}) {
  return (
    <div className="space-y-4">
      <StepIntro
        title="Personas — who the agent will be tested against"
        subtitle="Per the PRD: AI generates synthetic customer personas for the test pack. Each persona × scenario becomes a test case that must pass to deploy."
      />

      {personas.length === 0 ? (
        <Card title="Generate personas">
          <p className="text-[12px] mb-3" style={{ color: "var(--spyne-text-secondary)" }}>
            VINI will generate {5} archetypes — hot intent, price-first negotiator, skeptical re-engage, wrong number, opt-out request — and test the agent against each.
          </p>
          <button
            onClick={onGenerate}
            disabled={!intent.trim()}
            className="spyne-btn-primary text-[12px] disabled:opacity-30"
          >
            <Sparkles size={11} />
            Generate personas
          </button>
        </Card>
      ) : (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider tabular-nums" style={{ color: "var(--spyne-text-muted)" }}>{personas.length} personas</p>
            <button
              onClick={onGenerate}
              className="spyne-btn-ghost text-[11px]"
            >
              Regenerate
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {personas.map((p) => (
              <div key={p.id} className="spyne-card p-3">
                <div className="flex items-start gap-2 mb-1.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[12px] font-bold" style={{ background: "var(--spyne-primary-soft)", color: "var(--spyne-primary)" }}>
                    {p.name.split(" ").map((s) => s[0]).join("").toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-semibold" style={{ color: "var(--spyne-text-primary)" }}>{p.name}</p>
                    <p className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: "var(--spyne-primary)" }}>{p.archetype}</p>
                  </div>
                </div>
                <p className="text-[11.5px] leading-snug" style={{ color: "var(--spyne-text-secondary)" }}>{p.brief}</p>
                <p className="mt-1.5 text-[10.5px] leading-snug" style={{ color: "var(--spyne-text-muted)" }}>
                  <strong style={{ color: "var(--spyne-text-secondary)" }}>Expected:</strong> {p.expectedBehavior}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ValidateStep({
  uc,
  running,
  onRun,
}: {
  uc: UseCase;
  running: boolean;
  onRun: () => void;
}) {
  const result = uc.batchResult;
  const ready = uc.personas.length > 0;

  return (
    <div className="space-y-4">
      <StepIntro
        title="Batch test — the deploy gate"
        subtitle="PRD: 'A Use Case cannot go live until its test pack passes — ≥75% pass rate gates deploy.' This is the discipline that makes 'green = safe to launch' mean something."
      />

      {!ready && (
        <div className="rounded-xl border px-4 py-3 flex items-center gap-2" style={{ borderColor: "var(--spyne-warning-muted)", background: "var(--spyne-warning-subtle)" }}>
          <AlertCircle size={14} style={{ color: "var(--spyne-warning-ink)" }} />
          <p className="text-[12px]" style={{ color: "var(--spyne-warning-ink)" }}>Generate personas first (previous step) before running the batch.</p>
        </div>
      )}

      {running ? (
        <AnalyzingPanel
          title="VINI is running the test pack"
          steps={["Generating test cases…", "Running the agent…", "Scoring responses…"]}
        />
      ) : (
        <Card title="Run batch validation">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[12px] leading-snug" style={{ color: "var(--spyne-text-secondary)" }}>
                Runs every persona × scenario against the agent brain. Each case is graded against the must-do / must-not-do rules.
                <br />
                <span className="text-[10.5px] tabular-nums" style={{ color: "var(--spyne-text-muted)" }}>{uc.personas.length} personas · ~{uc.personas.length * 2.5} test cases</span>
              </p>
            </div>
            <button
              onClick={onRun}
              disabled={!ready || running}
              className="spyne-btn-primary text-[12px] disabled:opacity-30 shrink-0"
            >
              <Play size={11} />
              {result ? "Re-run batch" : "Run batch"}
            </button>
          </div>
        </Card>
      )}

      {result && (
        <>
          {/* Score */}
          {(() => {
            const passed = result.passRate >= DEPLOY_GATE_THRESHOLD;
            return (
          <div
            className="rounded-2xl border-2 px-5 py-4"
            style={{
              borderColor: passed ? "var(--spyne-success-text)" : "var(--spyne-danger-text)",
              background: passed ? "var(--spyne-success-subtle)" : "var(--spyne-danger-subtle)",
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: "var(--spyne-text-muted)" }}>Pass rate</p>
                <p
                  className="text-[36px] font-bold tabular-nums leading-none"
                  style={{ color: passed ? "var(--spyne-success-text)" : "var(--spyne-danger-text)" }}
                >
                  {Math.round(result.passRate * 100)}%
                </p>
                <p className="mt-1 text-[11px]" style={{ color: "var(--spyne-text-secondary)" }}>
                  {result.passed} passed · {result.warned} warned · {result.failed} failed · {result.cases.length} total
                </p>
              </div>
              {passed ? (
                <div className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-bold text-white" style={{ background: "var(--spyne-success-text)" }}>
                  <CheckCircle2 size={13} /> DEPLOY GATE PASSED
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-bold text-white" style={{ background: "var(--spyne-danger-text)" }}>
                  <AlertCircle size={13} /> BELOW 75% GATE
                </div>
              )}
            </div>
            <div className="mt-2 h-2 w-full rounded-full overflow-hidden bg-white/60">
              <div
                className="h-full"
                style={{ width: `${Math.round(result.passRate * 100)}%`, background: passed ? "var(--spyne-success-text)" : "var(--spyne-danger-text)" }}
              />
            </div>
            {!passed && (
              <p className="mt-2 text-[11.5px]" style={{ color: "var(--spyne-danger-text)" }}>
                Review failed cases below and tighten the must-not-do rules, then re-run. Deploy is blocked until ≥75%.
              </p>
            )}
          </div>
            );
          })()}

          {/* Case list */}
          <Card title="Test cases" subtitle={`${result.cases.length} cases · most informative failures first`}>
            <div className="max-h-[420px] overflow-y-auto flex flex-col gap-1.5 pr-1">
              {[...result.cases].sort((a, b) => {
                const order: Record<string, number> = { fail: 0, warn: 1, pass: 2 };
                return order[a.outcome] - order[b.outcome];
              }).map((c) => {
                const meta = c.outcome === "pass"
                  ? { bg: "var(--spyne-success-subtle)", border: "var(--spyne-success-muted)", text: "var(--spyne-success-text)", label: "PASS", icon: CheckCircle2 }
                  : c.outcome === "warn"
                    ? { bg: "var(--spyne-warning-subtle)", border: "var(--spyne-warning-muted)", text: "var(--spyne-warning-ink)", label: "WARN", icon: AlertCircle }
                    : { bg: "var(--spyne-danger-subtle)", border: "var(--spyne-danger-muted)", text: "var(--spyne-danger-text)", label: "FAIL", icon: AlertCircle };
                return (
                  <div key={c.id} className="rounded-lg border px-3 py-2" style={{ borderColor: meta.border, background: "var(--spyne-surface)" }}>
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-[11px] font-semibold truncate" style={{ color: "var(--spyne-text-primary)" }}>{c.scenarioLabel}</span>
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider"
                        style={{ background: meta.bg, color: meta.text }}
                      >
                        <meta.icon size={9} />
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-[10.5px] mb-0.5" style={{ color: "var(--spyne-text-muted)" }}>
                      <strong style={{ color: "var(--spyne-text-secondary)" }}>{c.rule.kind === "must" ? "Must-do" : c.rule.kind === "must_not" ? "Must-not-do" : "Good-to-have"}:</strong> {c.rule.rule}
                    </p>
                    <p className="text-[11px] leading-snug" style={{ color: "var(--spyne-text-secondary)" }}>{c.observed}</p>
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function DeployStep({ uc, onDeploy }: { uc: UseCase; onDeploy: () => void }) {
  const eligible = canDeploy(uc);
  const result = uc.batchResult;

  return (
    <div className="space-y-4">
      <StepIntro
        title="Deploy"
        subtitle="Once deployed, this Use Case is pinned (immutable promptVersionId) and available to any campaign in the Campaign Builder."
      />

      {!eligible && (
        <div className="rounded-xl border px-4 py-3 flex items-start gap-2" style={{ borderColor: "var(--spyne-danger-muted)", background: "var(--spyne-danger-subtle)" }}>
          <AlertCircle size={14} className="mt-0.5 shrink-0" style={{ color: "var(--spyne-danger-text)" }} />
          <div>
            <p className="text-[12.5px] font-bold mb-0.5" style={{ color: "var(--spyne-danger-text)" }}>Deploy is blocked</p>
            <p className="text-[11.5px]" style={{ color: "var(--spyne-danger-text)" }}>
              {result
                ? `Pass rate ${Math.round(result.passRate * 100)}% is below the 75% gate. Go back to Batch Test, refine the agent brain, and re-run.`
                : "Run the batch test first — at least 75% pass rate is required."}
            </p>
          </div>
        </div>
      )}

      <Card title="Summary">
        <div className="grid grid-cols-2 gap-3 text-[12px]">
          <SummaryRow k="Name" v={uc.name || "—"} />
          <SummaryRow k="Category" v={`${uc.category} · ${uc.subType}`} />
          <SummaryRow k="Channels" v={uc.channels.join(" · ")} />
          <SummaryRow k="Workflow" v={`${uc.workflow.length} touches across ${Math.max(...uc.workflow.map((t) => t.dayOffset))} days`} />
          <SummaryRow k="Personas" v={`${uc.personas.length}`} />
          <SummaryRow k="Pass rate" v={result ? `${Math.round(result.passRate * 100)}%` : "—"} accent={result && result.passRate >= 0.75 ? "good" : result ? "warn" : undefined} />
          <SummaryRow k="Tone" v={uc.agentBrain.tone} />
          <SummaryRow k="Prompt version" v={uc.promptVersionId} />
        </div>
      </Card>

      <Card title="What deploy means">
        <ul className="text-[11.5px] space-y-1 list-disc list-inside" style={{ color: "var(--spyne-text-secondary)" }}>
          <li>The Use Case becomes available in the Campaign Builder's template grid</li>
          <li>The agent brain + workflow + test pack are pinned to <strong>promptVersionId {uc.promptVersionId}</strong></li>
          <li>Live campaigns will always run the version they launched against — no drift</li>
          <li>You can edit later, which creates a new version; live campaigns keep their pinned version until re-deployed</li>
        </ul>
      </Card>

      <div className="flex justify-end">
        <button
          onClick={onDeploy}
          disabled={!eligible}
          className="spyne-btn-primary text-[12px] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Rocket size={14} />
          Deploy use case
        </button>
      </div>
    </div>
  );
}

/* ── Small components ───────────────────────────────────────────── */

function StepIntro({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="spyne-card px-4 py-3">
      <p className="text-[14px] font-bold leading-tight" style={{ color: "var(--spyne-text-primary)" }}>{title}</p>
      <p className="mt-0.5 text-[11.5px] leading-snug" style={{ color: "var(--spyne-text-secondary)" }}>{subtitle}</p>
    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="spyne-card p-4">
      <div className="mb-3">
        <p className="text-[12.5px] font-bold" style={{ color: "var(--spyne-text-primary)" }}>{title}</p>
        {subtitle && <p className="mt-0.5 text-[10.5px] leading-snug" style={{ color: "var(--spyne-text-muted)" }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function ListBlock({
  label,
  tone,
  items,
  onChange,
  onRemove,
  onAdd,
}: {
  label: string;
  tone: "success" | "brand" | "danger";
  items: string[];
  onChange: (i: number, v: string) => void;
  onRemove: (i: number) => void;
  onAdd: () => void;
}) {
  const ink =
    tone === "success" ? "var(--spyne-success-text)"
      : tone === "danger" ? "var(--spyne-danger-text)"
        : "var(--spyne-primary)";
  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-page-bg)" }}>
      <div className="px-3 py-2 border-b" style={{ borderColor: "var(--spyne-border)" }}>
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: ink }}>{label}</span>
      </div>
      <div className="px-3 py-2 flex flex-col gap-1">
        {items.map((it, i) => (
          <div key={i} className="flex items-start gap-1.5 group">
            <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ink }} />
            <input
              value={it}
              onChange={(e) => onChange(i, e.target.value)}
              className="spyne-focus-ring flex-1 bg-transparent text-[12px] outline-none border-b border-transparent py-1 focus:border-[color:var(--spyne-border)]"
              style={{ color: "var(--spyne-text-primary)" }}
            />
            <button
              onClick={() => onRemove(i)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded mt-0.5"
              style={{ background: "transparent" }}
            >
              <X size={10} style={{ color: "var(--spyne-danger-text)" }} />
            </button>
          </div>
        ))}
        <button
          onClick={onAdd}
          className="spyne-focus-ring text-[11px] font-medium pt-1 cursor-pointer rounded"
          style={{ color: ink }}
        >
          + Add
        </button>
      </div>
    </div>
  );
}

function SummaryRow({ k, v, accent }: { k: string; v: string; accent?: "good" | "warn" }) {
  const color = accent === "good" ? "var(--spyne-success-text)" : accent === "warn" ? "var(--spyne-danger-text)" : "var(--spyne-text-primary)";
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--spyne-text-muted)" }}>{k}</span>
      <span className="text-[12.5px] font-semibold truncate" style={{ color }}>{v}</span>
    </div>
  );
}
