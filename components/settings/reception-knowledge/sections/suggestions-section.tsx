'use client';

import { CheckCircle2, Clock, HelpCircle, Lightbulb, Plus, Sparkles } from 'lucide-react';
import { cn } from '@/lib/settings/cn';
import { DsButton } from '@/components/settings/ds';
import type {
  KnowledgeSuggestion,
  SuggestionType,
} from '@/lib/settings/reception-knowledge-fixtures';

const TYPE_META: Record<
  SuggestionType,
  { label: string; tone: 'warning' | 'brand' | 'error' }
> = {
  unanswered_question: { label: 'Unanswered question', tone: 'warning' },
  missing_fact: { label: 'Missing fact', tone: 'brand' },
  outdated_fact: { label: 'Outdated', tone: 'error' },
};

interface SuggestionsSectionProps {
  items: KnowledgeSuggestion[];
  setItems: React.Dispatch<React.SetStateAction<KnowledgeSuggestion[]>>;
  /** Hook the orchestrator passes to materialize a suggestion into a Quick Fact. */
  onAddFact: (text: string) => void;
}

export function SuggestionsSection({ items, setItems, onAddFact }: SuggestionsSectionProps) {
  const dismiss = (id: string) => setItems((prev) => prev.filter((s) => s.id !== id));

  const accept = (s: KnowledgeSuggestion) => {
    onAddFact(s.suggestedAnswer ?? s.text);
    dismiss(s.id);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-blue-light/20 bg-blue-light/5 p-4">
        <Sparkles className="h-5 w-5 shrink-0 text-blue-light" />
        <div className="flex-1 text-sm text-black-dark">
          <strong>Vini is watching every call.</strong> When the same question comes up repeatedly
          and the agent can't answer well, it surfaces here as a suggested knowledge addition.
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-black/8 bg-white py-12 text-center">
          <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-600" />
          <div className="text-sm font-semibold text-black-dark">All caught up.</div>
          <div className="mt-1 text-xs text-black-60">
            No knowledge gaps detected in recent calls.
          </div>
        </div>
      ) : (
        items.map((s) => {
          const tm = TYPE_META[s.type];
          const Icon =
            s.type === 'unanswered_question'
              ? HelpCircle
              : s.type === 'missing_fact'
                ? Lightbulb
                : Clock;
          return (
            <div key={s.id} className="rounded-2xl border border-black/8 bg-white p-4">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                    tm.tone === 'warning' && 'bg-amber-50 text-amber-700',
                    tm.tone === 'brand' && 'bg-blue-light/10 text-blue-light',
                    tm.tone === 'error' && 'bg-red-50 text-red-600'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <TypePill tone={tm.tone}>{tm.label}</TypePill>
                    <span className="text-[11px] text-black-60">{s.detectedAt}</span>
                    {s.frequency > 0 && (
                      <span className="text-[11px] font-semibold text-black-60">
                        · {s.frequency}× this period
                      </span>
                    )}
                  </div>
                  <div className="mb-2 text-sm font-semibold text-black-dark">{s.text}</div>
                  {s.suggestedAnswer && (
                    <div className="mt-2 rounded-md border-l-2 border-blue-light bg-gray-lighter/70 p-3 text-xs">
                      <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.06em] text-black-60">
                        Vini suggests
                      </div>
                      <div className="italic text-black-dark">&ldquo;{s.suggestedAnswer}&rdquo;</div>
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <DsButton
                      label="Add to knowledge"
                      type="primary"
                      size="AA"
                      onClick={() => accept(s)}
                      icon={<Plus className="h-3.5 w-3.5" />}
                    />
                    <DsButton
                      label="Dismiss"
                      type="bordered"
                      size="AA"
                      onClick={() => dismiss(s.id)}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function TypePill({
  tone,
  children,
}: {
  tone: 'warning' | 'brand' | 'error';
  children: React.ReactNode;
}) {
  const cls =
    tone === 'warning'
      ? 'bg-amber-50 text-amber-700'
      : tone === 'brand'
        ? 'bg-blue-light/10 text-blue-light'
        : 'bg-red-50 text-red-600';
  return (
    <span className={cn('inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold', cls)}>
      {children}
    </span>
  );
}
