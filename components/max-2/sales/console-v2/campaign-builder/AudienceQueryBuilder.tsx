"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, Users, X, ChevronDown, GitBranch, Sparkles, Check, AlertTriangle } from "lucide-react";
import { AnalyzingPanel, AgentMark } from "../shared";
import { EXAMPLE_AUDIENCE_PROMPTS, parseAudiencePrompt } from "./audience-parser";
import {
  CATEGORY_META,
  FIELD_LIBRARY,
  type FieldDef,
  type Operator,
  OPERATOR_LABEL,
  findField,
  defaultValueFor,
} from "./audience-fields";
import {
  type AudienceQuery,
  type ConditionNode,
  type GroupNode,
  type GroupOp,
  type GroupMode,
  addChildTo,
  addTopLevelGroup,
  estimateCount,
  fromParsedAudience,
  makeCondition,
  makeEmptyQuery,
  makeGroup,
  removeNode,
  summarizeQuery,
  updateNode,
} from "./audience-query";

interface AudienceQueryBuilderProps {
  onClose: () => void;
  onSave?: (audience: { name: string; query: AudienceQuery; count: number; summary: string }) => void;
  initialQuery?: AudienceQuery;
  initialName?: string;
}

/** Animate a number toward `target` with an ease-out cubic over ~650ms. */
function useCountUp(target: number, durationMs = 650) {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (target - from) * eased));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      fromRef.current = target;
    };
  }, [target, durationMs]);

  return display;
}

export default function AudienceQueryBuilder({
  onClose,
  onSave,
  initialQuery,
  initialName,
}: AudienceQueryBuilderProps) {
  const [name, setName] = useState(initialName ?? "");
  const [query, setQuery] = useState<AudienceQuery>(initialQuery ?? makeEmptyQuery());
  const [prompt, setPrompt] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [promptOpen, setPromptOpen] = useState(true);

  const count = useMemo(() => estimateCount(query), [query]);
  const summary = useMemo(() => summarizeQuery(query), [query]);
  const animatedCount = useCountUp(count);
  const isTinyAudience = count > 0 && count < 50;

  function handleParsePrompt() {
    if (!prompt.trim()) return;
    setIsParsing(true);
    setTimeout(() => {
      const parsed = parseAudiencePrompt(prompt);
      setQuery(fromParsedAudience(parsed));
      setIsParsing(false);
    }, 450);
  }

  function patchNode(id: string, patch: Partial<ConditionNode> | Partial<GroupNode>) {
    setQuery((q) => updateNode(q, id, patch));
  }
  function deleteNode(id: string) {
    setQuery((q) => removeNode(q, id));
  }
  function addChildToGroup(parentId: string, child: ConditionNode | GroupNode) {
    setQuery((q) => addChildTo(q, parentId, child));
  }

  const handleSave = () => {
    if (!onSave) return;
    const finalName = name.trim() || `Audience · ${new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
    onSave({ name: finalName, query, count, summary });
  };

  return (
    <div className="flex h-full flex-col overflow-hidden" style={{ background: "var(--spyne-page-bg)" }}>
      {/* Header */}
      <header
        className="shrink-0 border-b px-6 py-3.5"
        style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-surface)" }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className="size-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "var(--spyne-primary-soft)", color: "var(--spyne-primary)" }}
            >
              <Users size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--spyne-primary)" }}>Audience Builder</p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name this audience…"
                className="w-full bg-transparent text-[16px] font-bold outline-none placeholder:text-[var(--spyne-text-muted)]"
                style={{ color: "var(--spyne-text-primary)" }}
              />
            </div>
          </div>
          <button
            onClick={onClose}
            className="spyne-focus-ring rounded-full border p-1.5"
            style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-surface)", color: "var(--spyne-text-secondary)" }}
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>
      </header>

      {/* Sticky count bar */}
      <div
        className="shrink-0 border-b px-6 py-3"
        style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-dark-elevated-bg)", color: "var(--spyne-on-dark-text)" }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Estimated audience</span>
            <span className="text-[10px] truncate max-w-md" style={{ color: "var(--spyne-on-dark-text-muted)" }}>· {summary}</span>
          </div>
          <span className="text-[22px] font-bold tabular-nums">{animatedCount.toLocaleString()} <span className="text-[11px] font-medium" style={{ color: "var(--spyne-on-dark-text-muted)" }}>leads</span></span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
        <div className="mx-auto max-w-[920px] space-y-3">
          {/* Prompt-driven entry */}
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-primary-soft)" }}
          >
            <button
              type="button"
              onClick={() => setPromptOpen((o) => !o)}
              className="spyne-focus-ring w-full flex items-center justify-between px-4 py-2.5 border-b cursor-pointer"
              style={{ borderColor: "var(--spyne-border)" }}
            >
              <div className="flex items-center gap-2">
                <AgentMark size={12} className="!size-6 !rounded-full" />
                <span className="text-[12.5px] font-semibold" style={{ color: "var(--spyne-text-primary)" }}>Describe your audience in plain English</span>
                <span className="spyne-badge spyne-badge-brand !px-1.5 !py-0.5 !text-[9px] font-bold uppercase tracking-wider">
                  VINI AI
                </span>
              </div>
              <ChevronDown
                size={12}
                className={`transition-transform ${promptOpen ? "rotate-180" : ""}`}
                style={{ color: "var(--spyne-text-secondary)" }}
              />
            </button>

            {promptOpen && (
              <div className="px-4 py-3 flex flex-col gap-2.5">
                {isParsing ? (
                  <AnalyzingPanel
                    title="VINI is building your audience"
                    steps={["Reading your description…", "Mapping to audience fields…", "Estimating reach…"]}
                  />
                ) : (
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleParsePrompt();
                    }}
                    rows={2}
                    placeholder="e.g. Leads who asked about EVs in the last 30 days, excluding those who already booked"
                    className="spyne-focus-ring w-full resize-none rounded-lg border bg-[var(--spyne-surface)] px-3.5 py-2.5 text-[13px] leading-[20px] text-[var(--spyne-text-primary)] placeholder-[var(--spyne-text-muted)] outline-none transition-colors focus:border-[var(--spyne-primary)]"
                    style={{ borderColor: "var(--spyne-border)" }}
                  />
                )}

                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--spyne-text-muted)" }}>Try</span>
                    {EXAMPLE_AUDIENCE_PROMPTS.slice(0, 4).map((ex) => (
                      <button
                        key={ex.label}
                        onClick={() => setPrompt(ex.prompt)}
                        disabled={isParsing}
                        className="spyne-pill !h-auto !py-0.5 !text-[10.5px] disabled:opacity-40"
                      >
                        {ex.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleParsePrompt}
                    disabled={!prompt.trim() || isParsing}
                    className="spyne-btn-primary !px-3 !py-1.5 !text-[11.5px]"
                  >
                    <Sparkles size={11} />
                    Parse into query
                  </button>
                </div>
                <p className="text-[10.5px] leading-snug" style={{ color: "var(--spyne-text-muted)" }}>
                  VINI will turn this into editable INCLUDE / EXCLUDE groups below. You can refine each chip after.
                </p>
              </div>
            )}
          </div>

          {/* Divider with hint */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--spyne-text-muted)" }}>Or build manually</span>
            <div className="flex-1 h-px" style={{ background: "var(--spyne-border)" }} />
          </div>

          {isTinyAudience && (
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-[11.5px] font-medium"
              style={{ background: "var(--spyne-warning-subtle)", color: "var(--spyne-warning-ink)" }}
            >
              <AlertTriangle size={13} className="shrink-0" />
              This audience is very small — loosen a filter.
            </div>
          )}

          {query.groups.map((g, idx) => (
            <Group
              key={g.id}
              group={g}
              isTopLevel
              isFirst={idx === 0}
              onUpdate={(patch) => patchNode(g.id, patch)}
              onDelete={() => deleteNode(g.id)}
              onAddCondition={() => addChildToGroup(g.id, makeCondition("vehicle_interest"))}
              onAddGroup={() => addChildToGroup(g.id, makeGroup(g.mode, g.op === "AND" ? "OR" : "AND"))}
              onPatchChild={patchNode}
              onDeleteChild={deleteNode}
              onAddChildCondition={(parentId) => addChildToGroup(parentId, makeCondition("vehicle_interest"))}
              onAddChildGroup={(parentId, parentMode, parentOp) =>
                addChildToGroup(parentId, makeGroup(parentMode, parentOp === "AND" ? "OR" : "AND"))
              }
            />
          ))}

          <button
            onClick={() => setQuery((q) => addTopLevelGroup(q, "exclude"))}
            className="spyne-focus-ring flex items-center gap-1.5 rounded-lg border border-dashed px-3 py-2 text-[12px] font-medium transition-colors hover:bg-[var(--spyne-primary-soft)]"
            style={{ borderColor: "color-mix(in srgb, var(--spyne-primary) 35%, var(--spyne-border))", color: "var(--spyne-primary)" }}
          >
            <Plus size={12} strokeWidth={2.5} />
            Add another group (include or exclude)
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="shrink-0 border-t px-6 py-3 flex items-center justify-between"
        style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-surface)" }}
      >
        <div className="flex items-center gap-2 text-[11.5px]" style={{ color: "var(--spyne-text-secondary)" }}>
          <AgentMark size={12} chip={false} />
          <span><strong style={{ color: "var(--spyne-text-primary)" }}>VINI</strong> · Count updates live as you edit</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="spyne-btn-secondary !px-3.5 !py-1.5 !text-[12.5px]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={count === 0}
            className="spyne-btn-primary !px-4 !py-1.5 !text-[12.5px]"
          >
            Save audience · <span className="tabular-nums">{count.toLocaleString()}</span>
          </button>
        </div>
      </footer>
    </div>
  );
}

/* ── Group ──────────────────────────────────────────────────────── */

interface GroupProps {
  group: GroupNode;
  isTopLevel?: boolean;
  isFirst?: boolean;
  onUpdate: (patch: Partial<GroupNode>) => void;
  onDelete: () => void;
  onAddCondition: () => void;
  onAddGroup: () => void;
  onPatchChild: (id: string, patch: Partial<ConditionNode> | Partial<GroupNode>) => void;
  onDeleteChild: (id: string) => void;
  onAddChildCondition: (parentId: string) => void;
  onAddChildGroup: (parentId: string, parentMode: GroupMode, parentOp: GroupOp) => void;
}

function Group({
  group,
  isTopLevel = false,
  isFirst = false,
  onUpdate,
  onDelete,
  onAddCondition,
  onAddGroup,
  onPatchChild,
  onDeleteChild,
  onAddChildCondition,
  onAddChildGroup,
}: GroupProps) {
  const isInclude = group.mode === "include";
  const accent = isTopLevel
    ? isInclude
      ? "var(--spyne-primary)"
      : "var(--spyne-danger-text)"
    : "var(--spyne-text-muted)";
  const accentBg = isTopLevel
    ? isInclude
      ? "var(--spyne-primary-soft)"
      : "var(--spyne-danger-subtle)"
    : "var(--spyne-surface-hover)";
  const accentBorder = isTopLevel
    ? isInclude
      ? "color-mix(in srgb, var(--spyne-primary) 35%, var(--spyne-border))"
      : "color-mix(in srgb, var(--spyne-error) 35%, var(--spyne-border))"
    : "var(--spyne-border)";

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: accentBorder, background: "var(--spyne-surface)" }}
    >
      {/* Group header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b"
        style={{ background: accentBg, borderColor: accentBorder }}
      >
        <div className="flex items-center gap-2">
          {isTopLevel && (
            <button
              onClick={() => onUpdate({ mode: isInclude ? "exclude" : "include" })}
              className="spyne-focus-ring rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white"
              style={{ background: accent }}
              title="Toggle include / exclude"
            >
              {group.mode}
            </button>
          )}
          {!isTopLevel && (
            <span
              className="rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
              style={{ background: "var(--spyne-surface)", borderColor: "var(--spyne-border)", color: "var(--spyne-text-secondary)" }}
            >
              Subgroup
            </span>
          )}
          <span className="text-[11.5px]" style={{ color: "var(--spyne-text-secondary)" }}>
            Match{" "}
            <button
              onClick={() => onUpdate({ op: group.op === "AND" ? "OR" : "AND" })}
              className="spyne-focus-ring inline-flex items-center gap-1 rounded-lg border px-1.5 py-0.5 text-[10.5px] font-bold uppercase"
              style={{ background: "var(--spyne-surface)", borderColor: accentBorder, color: "var(--spyne-text-primary)" }}
            >
              {group.op === "AND" ? "all of" : "any of"}
              <ChevronDown size={9} />
            </button>{" "}
            the following:
          </span>
        </div>
        {(!isFirst || !isTopLevel) && (
          <button
            onClick={onDelete}
            className="spyne-focus-ring rounded-lg p-1 transition-colors hover:bg-[var(--spyne-danger-subtle)]"
            aria-label="Remove group"
            title="Remove group"
          >
            <Trash2 size={12} style={{ color: accent }} />
          </button>
        )}
      </div>

      {/* Children */}
      <div className="px-4 py-3 flex flex-col gap-2">
        {group.children.length === 0 && (
          <p className="text-[11.5px] italic py-1" style={{ color: "var(--spyne-text-muted)" }}>No conditions yet — add one below.</p>
        )}
        {group.children.map((child, i) => (
          <div key={child.id} className="flex items-stretch gap-2">
            {i > 0 && (
              <div className="flex flex-col items-center pt-1 w-7">
                <span className="text-[9.5px] font-bold uppercase tracking-widest" style={{ color: "var(--spyne-text-muted)" }}>
                  {group.op}
                </span>
              </div>
            )}
            {i === 0 && <div className="w-7 shrink-0" aria-hidden />}
            <div className="flex-1 min-w-0">
              {child.kind === "condition" ? (
                <ConditionRowEditor
                  cond={child}
                  onPatch={(patch) => onPatchChild(child.id, patch)}
                  onDelete={() => onDeleteChild(child.id)}
                  accent={accent}
                />
              ) : (
                <Group
                  group={child}
                  isTopLevel={false}
                  onUpdate={(patch) => onPatchChild(child.id, patch)}
                  onDelete={() => onDeleteChild(child.id)}
                  onAddCondition={() => onAddChildCondition(child.id)}
                  onAddGroup={() => onAddChildGroup(child.id, child.mode, child.op)}
                  onPatchChild={onPatchChild}
                  onDeleteChild={onDeleteChild}
                  onAddChildCondition={onAddChildCondition}
                  onAddChildGroup={onAddChildGroup}
                />
              )}
            </div>
          </div>
        ))}

        {/* Add controls */}
        <div className="flex items-center gap-1.5 pt-1">
          <button
            onClick={onAddCondition}
            className="spyne-focus-ring inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-semibold transition-colors hover:border-[var(--spyne-primary)] hover:text-[var(--spyne-primary)]"
            style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-surface)", color: "var(--spyne-text-secondary)" }}
          >
            <Plus size={10} strokeWidth={2.5} />
            Add condition
          </button>
          <button
            onClick={onAddGroup}
            className="spyne-focus-ring inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-semibold transition-colors hover:border-[var(--spyne-primary)] hover:text-[var(--spyne-primary)]"
            style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-surface)", color: "var(--spyne-text-secondary)" }}
          >
            <GitBranch size={10} strokeWidth={2.5} />
            Add subgroup
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Condition row ─────────────────────────────────────────────── */

function ConditionRowEditor({
  cond,
  onPatch,
  onDelete,
  accent,
}: {
  cond: ConditionNode;
  onPatch: (patch: Partial<ConditionNode>) => void;
  onDelete: () => void;
  accent: string;
}) {
  const field = findField(cond.field);

  function handleFieldChange(newId: string) {
    const next = findField(newId);
    if (!next) return;
    onPatch({
      field: newId,
      op: next.operators[0],
      value: defaultValueFor(next),
    });
  }

  return (
    <div
      className="flex items-start gap-2 rounded-lg border px-2.5 py-2"
      style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-surface)" }}
    >
      <FieldPicker value={cond.field} onChange={handleFieldChange} />

      {field && (
        <OperatorPicker
          field={field}
          value={cond.op}
          onChange={(op) => onPatch({ op })}
        />
      )}

      {field && (
        <div className="flex-1 min-w-0">
          <ValueEditor
            field={field}
            op={cond.op}
            value={cond.value}
            onChange={(v) => onPatch({ value: v })}
          />
        </div>
      )}

      <button
        onClick={onDelete}
        className="spyne-focus-ring rounded-lg p-1 shrink-0 mt-0.5 transition-colors hover:bg-[var(--spyne-danger-subtle)]"
        aria-label="Remove"
      >
        <X size={11} style={{ color: accent }} />
      </button>
    </div>
  );
}

/* ── Field picker (grouped by category) ─────────────────────────── */

function FieldPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const grouped = useMemo(() => {
    const map: Record<string, FieldDef[]> = {};
    for (const f of FIELD_LIBRARY) {
      if (!map[f.category]) map[f.category] = [];
      map[f.category].push(f);
    }
    return map;
  }, []);

  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="spyne-focus-ring appearance-none rounded-lg border pl-2.5 pr-7 py-1.5 text-[12px] font-semibold outline-none cursor-pointer transition-colors hover:border-[var(--spyne-border-strong)] focus:border-[var(--spyne-primary)] min-w-[180px]"
        style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-surface-hover)", color: "var(--spyne-text-primary)" }}
      >
        {Object.entries(grouped).map(([cat, fields]) => (
          <optgroup key={cat} label={CATEGORY_META[cat as keyof typeof CATEGORY_META]?.label ?? cat}>
            {fields.map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </optgroup>
        ))}
      </select>
      <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--spyne-text-muted)" }} />
    </div>
  );
}

/* ── Operator picker (filtered to field's allowed operators) ────── */

function OperatorPicker({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: Operator;
  onChange: (op: Operator) => void;
}) {
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Operator)}
        className="spyne-focus-ring appearance-none rounded-lg border pl-2.5 pr-6 py-1.5 text-[11.5px] font-medium outline-none cursor-pointer transition-colors hover:border-[var(--spyne-primary)] min-w-[80px]"
        style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-surface)", color: "var(--spyne-primary)" }}
      >
        {field.operators.map((op) => (
          <option key={op} value={op}>{OPERATOR_LABEL[op]}</option>
        ))}
      </select>
      <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--spyne-primary)" }} />
    </div>
  );
}

/* ── Value editor (typed per field.type + operator) ─────────────── */

function ValueEditor({
  field,
  op,
  value,
  onChange,
}: {
  field: FieldDef;
  op: Operator;
  value: string | string[] | number;
  onChange: (v: string | string[] | number) => void;
}) {
  if (op === "between" && field.type === "number") {
    const arr = Array.isArray(value) ? value : [String(value), ""];
    return (
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          value={String(arr[0] ?? "")}
          onChange={(e) => onChange([e.target.value, String(arr[1] ?? "")])}
          className="spyne-focus-ring w-20 rounded-lg border px-2 py-1 text-[12px] outline-none focus:border-[var(--spyne-primary)]"
          style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-surface)", color: "var(--spyne-text-primary)" }}
        />
        <span className="text-[11px]" style={{ color: "var(--spyne-text-muted)" }}>and</span>
        <input
          type="number"
          value={String(arr[1] ?? "")}
          onChange={(e) => onChange([String(arr[0] ?? ""), e.target.value])}
          className="spyne-focus-ring w-20 rounded-lg border px-2 py-1 text-[12px] outline-none focus:border-[var(--spyne-primary)]"
          style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-surface)", color: "var(--spyne-text-primary)" }}
        />
        {field.unit && <span className="text-[11px]" style={{ color: "var(--spyne-text-muted)" }}>{field.unit}</span>}
      </div>
    );
  }

  if (field.type === "number") {
    return (
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          value={typeof value === "number" || typeof value === "string" ? String(value) : ""}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
          className="spyne-focus-ring w-24 rounded-lg border px-2 py-1 text-[12px] tabular-nums outline-none focus:border-[var(--spyne-primary)]"
          style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-surface)", color: "var(--spyne-text-primary)" }}
        />
        {field.unit && <span className="text-[11px]" style={{ color: "var(--spyne-text-muted)" }}>{field.unit}</span>}
      </div>
    );
  }

  if (field.type === "text") {
    return (
      <input
        type="text"
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type a value…"
        className="spyne-focus-ring w-full rounded-lg border px-2 py-1 text-[12px] outline-none focus:border-[var(--spyne-primary)] placeholder:text-[var(--spyne-text-muted)]"
        style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-surface)", color: "var(--spyne-text-primary)" }}
      />
    );
  }

  if (field.type === "bool") {
    return (
      <div className="flex items-center gap-1">
        {(["true", "false"] as const).map((v) => {
          const isSel = value === v;
          return (
            <button
              key={v}
              onClick={() => onChange(v)}
              className="spyne-focus-ring rounded-lg border px-2.5 py-1 text-[11.5px] font-medium cursor-pointer transition-colors"
              style={
                isSel
                  ? { borderColor: "var(--spyne-primary)", background: "var(--spyne-primary)", color: "#fff" }
                  : { borderColor: "var(--spyne-border)", background: "var(--spyne-surface)", color: "var(--spyne-text-secondary)" }
              }
            >
              {v === "true" ? "Yes" : "No"}
            </button>
          );
        })}
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className="relative">
        <select
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className="spyne-focus-ring appearance-none w-full rounded-lg border pl-2.5 pr-7 py-1 text-[12px] outline-none cursor-pointer transition-colors hover:border-[var(--spyne-primary)]"
          style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-surface)", color: "var(--spyne-text-primary)" }}
        >
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--spyne-text-muted)" }} />
      </div>
    );
  }

  // multiselect
  const selected = Array.isArray(value) ? value : [];
  return (
    <MultiSelectEditor
      options={field.options ?? []}
      selected={selected}
      onChange={(vs) => onChange(vs)}
    />
  );
}

function MultiSelectEditor({
  options,
  selected,
  onChange,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (vs: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  function toggle(v: string) {
    if (selected.includes(v)) onChange(selected.filter((s) => s !== v));
    else onChange([...selected, v]);
  }

  return (
    <div className="relative flex-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className="spyne-focus-ring w-full flex items-center justify-between rounded-lg border px-2 py-1 text-left text-[12px] transition-colors hover:border-[var(--spyne-primary)] min-h-[28px]"
        style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-surface)" }}
      >
        <div className="flex flex-wrap items-center gap-1 min-w-0">
          {selected.length === 0 && <span style={{ color: "var(--spyne-text-muted)" }}>Pick one or more…</span>}
          {selected.map((v) => {
            const opt = options.find((o) => o.value === v);
            return (
              <span
                key={v}
                className="spyne-badge spyne-badge-brand !gap-0.5 !px-1.5 !py-0.5 !text-[10.5px] font-medium"
              >
                {opt?.label ?? v}
                <button
                  onClick={(e) => { e.stopPropagation(); toggle(v); }}
                  className="hover:opacity-70 ml-0.5"
                  aria-label={`Remove ${opt?.label ?? v}`}
                >
                  <X size={9} strokeWidth={2.5} />
                </button>
              </span>
            );
          })}
        </div>
        <ChevronDown size={11} className="shrink-0 ml-1" style={{ color: "var(--spyne-text-muted)" }} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="spyne-float absolute left-0 right-0 top-full mt-1 z-20 rounded-lg border max-h-56 overflow-y-auto p-1"
            style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-surface)", boxShadow: "var(--spyne-shadow-md)" }}
          >
            {options.map((o) => {
              const isSel = selected.includes(o.value);
              return (
                <button
                  key={o.value}
                  onClick={() => toggle(o.value)}
                  className="spyne-focus-ring w-full flex items-center justify-between rounded-lg px-2 py-1.5 text-left text-[12px] transition-colors hover:bg-[var(--spyne-primary-soft)]"
                  style={
                    isSel
                      ? { background: "var(--spyne-primary-soft)", color: "var(--spyne-primary)", fontWeight: 600 }
                      : { color: "var(--spyne-text-secondary)" }
                  }
                >
                  <span>{o.label}</span>
                  {isSel && <Check size={12} style={{ color: "var(--spyne-primary)" }} />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
