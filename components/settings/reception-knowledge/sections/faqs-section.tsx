'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Info, Trash2, TrendingUp } from 'lucide-react';
import { DsButton } from '@/components/settings/ds';
import { FAQ_CATEGORIES, type FAQCategory, type FAQItem } from '@/lib/settings/reception-knowledge-fixtures';

interface FaqsSectionProps {
  items: FAQItem[];
  setItems: React.Dispatch<React.SetStateAction<FAQItem[]>>;
}

export function FaqsSection({ items, setItems }: FaqsSectionProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draftQ, setDraftQ] = useState('');
  const [draftA, setDraftA] = useState('');
  const [draftCat, setDraftCat] = useState<FAQCategory>('amenities');

  const toggle = (id: string) => setExpanded(expanded === id ? null : id);
  const remove = (id: string) => setItems((prev) => prev.filter((f) => f.id !== id));

  const save = () => {
    if (!draftQ.trim() || !draftA.trim()) return;
    setItems((prev) => [
      {
        id: `faq-${Date.now()}`,
        question: draftQ.trim(),
        answer: draftA.trim(),
        category: draftCat,
        timesAnswered: 0,
      },
      ...prev,
    ]);
    setDraftQ('');
    setDraftA('');
    setDraftCat('amenities');
    setAdding(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-blue-light/20 bg-blue-light/5 p-4">
        <Info className="h-5 w-5 shrink-0 text-blue-light" />
        <div className="flex-1 text-sm text-black-dark">
          <strong>Q&amp;A pairs the agent delivers verbatim.</strong> Use this when wording matters
          — legal disclaimers, exact warranty terms, branded responses.
        </div>
        <DsButton
          label={adding ? 'Cancel' : 'Add FAQ'}
          type={adding ? 'bordered' : 'primary'}
          size="AA"
          onClick={() => setAdding((v) => !v)}
        />
      </div>

      {adding && (
        <div className="flex flex-col gap-3 rounded-2xl border border-black/8 bg-white p-5">
          <input
            value={draftQ}
            onChange={(e) => setDraftQ(e.target.value)}
            placeholder="Question — e.g. 'Do you take Apple Pay for service?'"
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-blue-light focus:outline-none"
          />
          <textarea
            value={draftA}
            onChange={(e) => setDraftA(e.target.value)}
            placeholder="Answer the agent should give verbatim…"
            rows={3}
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-blue-light focus:outline-none"
          />
          <div className="flex items-center gap-3">
            <select
              value={draftCat}
              onChange={(e) => setDraftCat(e.target.value as FAQCategory)}
              className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-blue-light focus:outline-none"
            >
              {FAQ_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <div className="flex-1" />
            <DsButton label="Save FAQ" type="primary" size="AA" onClick={save} />
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-black/8 bg-white">
        {items.map((f) => (
          <div key={f.id} className="border-b border-black/8 last:border-b-0">
            <button
              type="button"
              onClick={() => toggle(f.id)}
              className="group flex w-full items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-gray-lighter/50"
            >
              <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-light" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-black-dark">{f.question}</div>
                {expanded === f.id && (
                  <div className="mt-2.5 rounded-md border-l-2 border-blue-light bg-gray-lighter/70 p-3 text-sm italic text-black-dark">
                    &ldquo;{f.answer}&rdquo;
                  </div>
                )}
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-black-60">
                  <span className="rounded bg-black/5 px-1.5 py-0.5 capitalize">{f.category}</span>
                  {f.timesAnswered > 0 && (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                      <TrendingUp className="h-3 w-3" />
                      Used {f.timesAnswered}× · last {f.lastAnswered}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(f.id);
                  }}
                  aria-label="Delete FAQ"
                  className="rounded p-1 text-black-40 opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                {expanded === f.id ? (
                  <ChevronUp className="h-5 w-5 text-black-60" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-black-60" />
                )}
              </div>
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <div className="py-12 text-center text-sm text-black-40">No FAQs yet.</div>
        )}
      </div>
    </div>
  );
}
