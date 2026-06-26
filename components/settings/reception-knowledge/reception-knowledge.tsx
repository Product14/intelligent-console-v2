'use client';

import { useMemo, useState } from 'react';
import {
  KNOWLEDGE_SECTIONS,
  seedBulletins,
  seedDocuments,
  seedFaqs,
  seedPromotions,
  seedQuickFacts,
  seedSuggestions,
  seedWebsiteSync,
  type BulletinItem,
  type FAQItem,
  type KnowledgeDocument,
  type KnowledgeSectionId,
  type KnowledgeSuggestion,
  type Promotion,
  type QuickFact,
  type WebsiteSyncConfig,
} from '@/lib/settings/reception-knowledge-fixtures';
import { SectionNav } from './section-nav';
import { QuickFactsSection } from './sections/quick-facts-section';
import { FaqsSection } from './sections/faqs-section';
import { PromotionsSection } from './sections/promotions-section';
import { DocumentsSection } from './sections/documents-section';
import { WebsiteSyncSection } from './sections/website-sync-section';
import { BulletinsSection } from './sections/bulletins-section';
import { SuggestionsSection } from './sections/suggestions-section';

/**
 * Knowledge Base orchestrator. Owns the per-section state and a KPI strip,
 * delegates rendering to one section component at a time via SectionNav.
 *
 * Pure UI demo: all edits live in component state (reset on refresh). Swap
 * the seeds for service calls when a backend lands.
 */
export function ReceptionKnowledge() {
  const [activeSection, setActiveSection] = useState<KnowledgeSectionId>('facts');

  const [quickFacts, setQuickFacts] = useState<QuickFact[]>(seedQuickFacts);
  const [faqs, setFaqs] = useState<FAQItem[]>(seedFaqs);
  const [promotions, setPromotions] = useState<Promotion[]>(seedPromotions);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(seedDocuments);
  const [bulletins, setBulletins] = useState<BulletinItem[]>(seedBulletins);
  const [suggestions, setSuggestions] = useState<KnowledgeSuggestion[]>(seedSuggestions);
  const [websiteSync, setWebsiteSync] = useState<WebsiteSyncConfig>(seedWebsiteSync);

  const totalSources =
    quickFacts.length + faqs.length + promotions.length + documents.length + bulletins.length;

  const timesReferenced30d = useMemo(
    () =>
      quickFacts.reduce((s, f) => s + f.timesReferenced, 0) +
      faqs.reduce((s, f) => s + f.timesAnswered, 0) +
      promotions.reduce((s, p) => s + p.timesReferenced, 0) +
      documents.reduce((s, d) => s + d.timesReferenced, 0),
    [quickFacts, faqs, promotions, documents]
  );
  const activeBulletins = bulletins.filter((b) => b.active).length;
  const pendingSuggestions = suggestions.length;

  const navItems = KNOWLEDGE_SECTIONS.map((s) => {
    let count: number | undefined;
    let flag = false;
    switch (s.id) {
      case 'facts':
        count = quickFacts.length;
        break;
      case 'faqs':
        count = faqs.length;
        break;
      case 'promotions':
        count = promotions.filter((p) => p.status === 'active').length;
        break;
      case 'documents':
        count = documents.length;
        flag = documents.some((d) => d.status === 'processing' || d.status === 'error');
        break;
      case 'website':
        flag = websiteSync.status !== 'healthy';
        break;
      case 'bulletins':
        count = activeBulletins;
        break;
      case 'suggestions':
        count = pendingSuggestions;
        flag = pendingSuggestions > 0;
        break;
    }
    return { id: s.id, label: s.label, count, flag };
  });

  return (
    <div>
      <KpiStrip
        totalSources={totalSources}
        timesReferenced30d={timesReferenced30d}
        activeBulletins={activeBulletins}
        pendingSuggestions={pendingSuggestions}
      />

      <SectionNav items={navItems} activeId={activeSection} onChange={setActiveSection} />

      <div>
        {activeSection === 'facts' && (
          <QuickFactsSection items={quickFacts} setItems={setQuickFacts} />
        )}
        {activeSection === 'faqs' && <FaqsSection items={faqs} setItems={setFaqs} />}
        {activeSection === 'promotions' && (
          <PromotionsSection items={promotions} setItems={setPromotions} />
        )}
        {activeSection === 'documents' && (
          <DocumentsSection items={documents} setItems={setDocuments} />
        )}
        {activeSection === 'website' && (
          <WebsiteSyncSection config={websiteSync} setConfig={setWebsiteSync} />
        )}
        {activeSection === 'bulletins' && (
          <BulletinsSection items={bulletins} setItems={setBulletins} />
        )}
        {activeSection === 'suggestions' && (
          <SuggestionsSection
            items={suggestions}
            setItems={setSuggestions}
            onAddFact={(text) => {
              setQuickFacts((prev) => [
                {
                  id: `qf-${Date.now()}`,
                  category: 'other',
                  text,
                  addedBy: 'You',
                  addedAt: new Date().toISOString().slice(0, 10),
                  timesReferenced: 0,
                },
                ...prev,
              ]);
            }}
          />
        )}
      </div>
    </div>
  );
}

interface KpiStripProps {
  totalSources: number;
  timesReferenced30d: number;
  activeBulletins: number;
  pendingSuggestions: number;
}

function KpiStrip({
  totalSources,
  timesReferenced30d,
  activeBulletins,
  pendingSuggestions,
}: KpiStripProps) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <KpiCell label="Knowledge sources" value={totalSources.toLocaleString()} caption="facts, FAQs, docs, promos, bulletins" />
      <KpiCell label="Times referenced" value={timesReferenced30d.toLocaleString()} caption="across all sources · 30d" />
      <KpiCell label="Active bulletins" value={activeBulletins.toString()} caption="urgent overrides live now" />
      <KpiCell label="Pending suggestions" value={pendingSuggestions.toString()} caption="gaps Vini surfaced" highlight={pendingSuggestions > 0} />
    </div>
  );
}

function KpiCell({
  label,
  value,
  caption,
  highlight = false,
}: {
  label: string;
  value: string;
  caption: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? 'rounded-xl border border-amber-200 bg-amber-50 px-4 py-3'
          : 'rounded-xl border border-black/8 bg-gray-lighter px-4 py-3'
      }
    >
      <div className="text-xs text-black-60">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-black-dark">{value}</div>
      <div className="mt-0.5 text-[11px] text-black-40">{caption}</div>
    </div>
  );
}
