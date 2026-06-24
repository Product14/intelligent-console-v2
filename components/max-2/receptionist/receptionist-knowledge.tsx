"use client"

import { useState } from "react"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { SpyneLineTab, SpyneLineTabBadge, SpyneLineTabStrip } from "@/components/max-2/spyne-line-tabs"
import { SpyneRoiKpiMetricCell, SpyneRoiKpiStrip } from "@/components/max-2/spyne-roi-kpi-strip"
import { max2Classes, spyneComponentClasses, spyneSalesLayout } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"
import {
  quickFacts as seedQuickFacts,
  faqs as seedFaqs,
  promotions as seedPromotions,
  documents as seedDocuments,
  bulletins as seedBulletins,
  knowledgeSuggestions,
  websiteSync,
  type QuickFact,
  type QuickFactCategory,
  type FAQItem,
  type Promotion,
  type PromotionStatus,
  type KnowledgeDocument,
  type BulletinItem,
  type KnowledgeSuggestion,
} from "./receptionist-data"

type Tab = "facts" | "faq" | "promotions" | "documents" | "website" | "bulletin" | "suggestions"

const categoryMeta: Record<QuickFactCategory, { label: string; symbol: string }> = {
  amenities:  { label: "Amenities",  symbol: "weekend" },
  policies:   { label: "Policies",   symbol: "policy" },
  services:   { label: "Services",   symbol: "build" },
  directions: { label: "Directions", symbol: "near_me" },
  other:      { label: "Other",      symbol: "more_horiz" },
}

export function ReceptionistKnowledge() {
  const [tab, setTab] = useState<Tab>("facts")

  // State for each section — interactive demo
  const [quickFacts, setQuickFacts] = useState(seedQuickFacts)
  const [faqs, setFaqs] = useState(seedFaqs)
  const [promotions, setPromotions] = useState(seedPromotions)
  const [bulletins, setBulletins] = useState(seedBulletins)
  const [documents] = useState(seedDocuments)
  const [suggestions, setSuggestions] = useState(knowledgeSuggestions)

  // Page-level stats
  const totalSources = quickFacts.length + faqs.length + promotions.filter((p) => p.status === "active").length + documents.filter((d) => d.status === "ready").length
  const totalReferenced = [...quickFacts, ...faqs, ...promotions, ...documents].reduce((s, x: { timesReferenced?: number; timesAnswered?: number }) => s + (x.timesReferenced ?? x.timesAnswered ?? 0), 0)
  const pendingSuggestions = suggestions.length
  const activeBulletins = bulletins.filter((b) => b.active).length

  return (
    <div className={spyneSalesLayout.pageStack}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className={max2Classes.pageTitle}>Knowledge</h1>
          <p className={max2Classes.pageDescription}>What Riley knows about your dealership. The agent draws from these sources before every answer — never fabricates.</p>
        </div>
        <button type="button" className={cn(spyneComponentClasses.btnPrimaryMd, "flex items-center gap-1.5")}>
          <MaterialSymbol name="add" size={16} /> Add knowledge
        </button>
      </div>

      {/* KPI strip — knowledge health at a glance */}
      <SpyneRoiKpiStrip gridClassName="lg:grid-cols-4">
        <SpyneRoiKpiMetricCell label="Knowledge sources" value={totalSources.toString()} sub="facts · FAQs · promos · docs" status="good" cellClassName="px-3 py-3" />
        <SpyneRoiKpiMetricCell label="Times referenced (30d)" value={totalReferenced.toLocaleString()} sub="by Riley across all calls" status="good" cellClassName="px-3 py-3" />
        <SpyneRoiKpiMetricCell label="Active bulletins" value={activeBulletins.toString()} sub="time-bound overrides" status="good" cellClassName="px-3 py-3" />
        <SpyneRoiKpiMetricCell label="Suggestions from VINI" value={pendingSuggestions.toString()} sub="gaps detected from real calls" status={pendingSuggestions > 0 ? "watch" : "good"} cellClassName="px-3 py-3" valueClassName={pendingSuggestions > 0 ? "text-spyne-primary" : undefined} />
      </SpyneRoiKpiStrip>

      {/* Sub-tabs */}
      <SpyneLineTabStrip>
        <SpyneLineTab active={tab === "facts"} onClick={() => setTab("facts")}>
          <MaterialSymbol name="bolt" size={14} /> Quick Facts <SpyneLineTabBadge>{quickFacts.length}</SpyneLineTabBadge>
        </SpyneLineTab>
        <SpyneLineTab active={tab === "faq"} onClick={() => setTab("faq")}>
          <MaterialSymbol name="quiz" size={14} /> FAQ <SpyneLineTabBadge>{faqs.length}</SpyneLineTabBadge>
        </SpyneLineTab>
        <SpyneLineTab active={tab === "promotions"} onClick={() => setTab("promotions")}>
          <MaterialSymbol name="campaign" size={14} /> Promotions <SpyneLineTabBadge>{promotions.filter((p) => p.status === "active").length}</SpyneLineTabBadge>
        </SpyneLineTab>
        <SpyneLineTab active={tab === "documents"} onClick={() => setTab("documents")}>
          <MaterialSymbol name="description" size={14} /> Documents <SpyneLineTabBadge>{documents.length}</SpyneLineTabBadge>
        </SpyneLineTab>
        <SpyneLineTab active={tab === "website"} onClick={() => setTab("website")}>
          <MaterialSymbol name="language" size={14} /> Website Sync
        </SpyneLineTab>
        <SpyneLineTab active={tab === "bulletin"} onClick={() => setTab("bulletin")}>
          <MaterialSymbol name="notifications_active" size={14} /> Bulletin <SpyneLineTabBadge>{activeBulletins}</SpyneLineTabBadge>
        </SpyneLineTab>
        <SpyneLineTab active={tab === "suggestions"} onClick={() => setTab("suggestions")}>
          <MaterialSymbol name="auto_awesome" size={14} /> Suggestions <SpyneLineTabBadge>{pendingSuggestions}</SpyneLineTabBadge>
        </SpyneLineTab>
      </SpyneLineTabStrip>

      {tab === "facts"       && <QuickFactsSection facts={quickFacts} setFacts={setQuickFacts} />}
      {tab === "faq"         && <FaqSection faqs={faqs} setFaqs={setFaqs} />}
      {tab === "promotions"  && <PromotionsSection promotions={promotions} setPromotions={setPromotions} />}
      {tab === "documents"   && <DocumentsSection documents={documents} />}
      {tab === "website"     && <WebsiteSection />}
      {tab === "bulletin"    && <BulletinSection bulletins={bulletins} setBulletins={setBulletins} />}
      {tab === "suggestions" && <SuggestionsSection suggestions={suggestions} setSuggestions={setSuggestions} />}
    </div>
  )
}

// ============= QUICK FACTS =============
function QuickFactsSection({ facts, setFacts }: { facts: QuickFact[]; setFacts: (f: QuickFact[]) => void }) {
  const [filter, setFilter] = useState<QuickFactCategory | "all">("all")
  const [newFact, setNewFact] = useState("")
  const [newCategory, setNewCategory] = useState<QuickFactCategory>("amenities")

  const filtered = filter === "all" ? facts : facts.filter((f) => f.category === filter)

  const addFact = () => {
    if (!newFact.trim()) return
    setFacts([
      { id: `qf-${Date.now()}`, category: newCategory, text: newFact.trim(), addedBy: "You", addedAt: "Just now", timesReferenced: 0 },
      ...facts,
    ])
    setNewFact("")
  }
  const removeFact = (id: string) => setFacts(facts.filter((f) => f.id !== id))

  return (
    <div className="flex flex-col gap-4">
      <div className="spyne-card p-5">
        <div className="mb-3 flex items-center gap-2">
          <MaterialSymbol name="bolt" size={16} className="text-spyne-brand" />
          <h3 className={cn(spyneComponentClasses.cardTitle, "m-0")}>Add a quick fact</h3>
        </div>
        <p className="text-[12px] text-spyne-text-muted mb-3">
          Anything a great human receptionist would just &ldquo;know.&rdquo; The agent uses these as background context for every call.
        </p>
        <div className="flex gap-2">
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as QuickFactCategory)}
            className="rounded-lg border border-spyne-border bg-spyne-surface px-3 py-2 text-[13px] focus:border-spyne-brand focus:outline-none"
          >
            {Object.entries(categoryMeta).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <input
            value={newFact}
            onChange={(e) => setNewFact(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addFact()}
            placeholder="e.g. We have free Starbucks coffee in the lounge..."
            className="flex-1 rounded-lg border border-spyne-border bg-spyne-surface px-3 py-2 text-[13px] focus:border-spyne-brand focus:outline-none"
          />
          <button type="button" onClick={addFact} className={cn(spyneComponentClasses.btnPrimaryMd, "flex items-center gap-1")}>
            <MaterialSymbol name="add" size={14} /> Add
          </button>
        </div>
      </div>

      <div className="spyne-card overflow-hidden">
        <div className="border-b border-spyne-border px-5 py-3 flex items-center gap-4">
          <div className="flex-1">
            <h3 className={cn(spyneComponentClasses.cardTitle, "m-0")}>All quick facts <span className="text-spyne-text-muted font-normal">· {facts.length}</span></h3>
          </div>
          <div className="flex gap-1.5">
            <FilterChip label="All" active={filter === "all"} onClick={() => setFilter("all")} count={facts.length} />
            {Object.entries(categoryMeta).map(([k, v]) => (
              <FilterChip key={k} label={v.label} active={filter === k} onClick={() => setFilter(k as QuickFactCategory)} count={facts.filter((f) => f.category === k).length} />
            ))}
          </div>
        </div>
        <div>
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-[13px] text-spyne-text-muted">No facts in this category yet.</div>
          ) : filtered.map((f) => (
            <div key={f.id} className="border-b border-spyne-border last:border-b-0 flex items-start gap-3 px-5 py-3.5 hover:bg-spyne-surface-hover transition-colors group">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-spyne-brand-subtle text-spyne-brand">
                <MaterialSymbol name={categoryMeta[f.category].symbol} size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] leading-relaxed">{f.text}</div>
                <div className="mt-1.5 flex items-center gap-3 text-[11px] text-spyne-text-muted">
                  <span><MaterialSymbol name="person" size={11} /> {f.addedBy} · {f.addedAt}</span>
                  {f.timesReferenced > 0 && (
                    <span className="inline-flex items-center gap-1 text-spyne-success font-semibold">
                      <MaterialSymbol name="trending_up" size={11} /> Referenced {f.timesReferenced}× in 30d
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => removeFact(f.id)} className="opacity-0 group-hover:opacity-100 text-spyne-text-muted hover:text-spyne-error transition-opacity">
                <MaterialSymbol name="delete_outline" size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============= FAQ =============
function FaqSection({ faqs, setFaqs }: { faqs: FAQItem[]; setFaqs: (f: FAQItem[]) => void }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const toggle = (id: string) => setExpanded(expanded === id ? null : id)
  const remove = (id: string) => setFaqs(faqs.filter((f) => f.id !== id))

  return (
    <div className="flex flex-col gap-3">
      <div className="spyne-card p-4 flex items-center gap-3 bg-spyne-brand-subtle border-spyne-brand/20">
        <MaterialSymbol name="info" size={18} className="text-spyne-brand" />
        <div className="text-[13px] flex-1">
          <strong>Q&amp;A pairs Riley delivers verbatim.</strong> Use this when wording matters — legal disclaimers, exact warranty terms, branded responses.
        </div>
        <button type="button" className={cn(spyneComponentClasses.btnPrimaryMd, "flex items-center gap-1")}>
          <MaterialSymbol name="add" size={14} /> Add FAQ
        </button>
      </div>

      <div className="spyne-card overflow-hidden">
        {faqs.map((f) => (
          <div key={f.id} className="border-b border-spyne-border last:border-b-0">
            <button
              type="button"
              onClick={() => toggle(f.id)}
              className="w-full flex items-start gap-3 px-5 py-3.5 hover:bg-spyne-surface-hover transition-colors text-left"
            >
              <MaterialSymbol name="quiz" size={16} className="mt-0.5 text-spyne-brand shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-[14px]">{f.question}</div>
                {expanded === f.id && (
                  <div className="mt-2.5 bg-spyne-surface-hover rounded-md p-3 border-l-2 border-spyne-brand text-[13px] italic">
                    &ldquo;{f.answer}&rdquo;
                  </div>
                )}
                <div className="mt-1.5 flex items-center gap-3 text-[11px] text-spyne-text-muted">
                  <span className="rounded bg-spyne-border px-1.5 py-0.5">{f.category}</span>
                  {f.timesAnswered > 0 && (
                    <span className="inline-flex items-center gap-1 text-spyne-success font-semibold">
                      <MaterialSymbol name="trending_up" size={11} /> Used {f.timesAnswered}× · last {f.lastAnswered}
                    </span>
                  )}
                </div>
              </div>
              <MaterialSymbol name={expanded === f.id ? "expand_less" : "expand_more"} size={20} className="text-spyne-text-muted shrink-0" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============= PROMOTIONS =============
function PromotionsSection({ promotions, setPromotions }: { promotions: Promotion[]; setPromotions: (p: Promotion[]) => void }) {
  const [statusFilter, setStatusFilter] = useState<PromotionStatus | "all">("active")
  const filtered = statusFilter === "all" ? promotions : promotions.filter((p) => p.status === statusFilter)

  const counts = {
    all: promotions.length,
    active: promotions.filter((p) => p.status === "active").length,
    scheduled: promotions.filter((p) => p.status === "scheduled").length,
    expired: promotions.filter((p) => p.status === "expired").length,
  }

  const archive = (id: string) => setPromotions(promotions.map((p) => p.id === id ? { ...p, status: "expired" as PromotionStatus } : p))

  return (
    <div className="flex flex-col gap-4">
      <div className="spyne-card p-4 flex items-center gap-3">
        <MaterialSymbol name="campaign" size={18} className="text-spyne-brand" />
        <div className="text-[13px] flex-1">
          <strong>Time-bound campaigns Riley mentions to relevant callers.</strong> Auto-expire on end date.
        </div>
        <button type="button" className={cn(spyneComponentClasses.btnPrimaryMd, "flex items-center gap-1")}>
          <MaterialSymbol name="add" size={14} /> New promotion
        </button>
      </div>

      <div className="flex gap-2">
        <FilterChip label="Active" active={statusFilter === "active"} onClick={() => setStatusFilter("active")} count={counts.active} />
        <FilterChip label="Scheduled" active={statusFilter === "scheduled"} onClick={() => setStatusFilter("scheduled")} count={counts.scheduled} />
        <FilterChip label="Expired" active={statusFilter === "expired"} onClick={() => setStatusFilter("expired")} count={counts.expired} />
        <FilterChip label="All" active={statusFilter === "all"} onClick={() => setStatusFilter("all")} count={counts.all} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.map((p) => (
          <div key={p.id} className="spyne-card p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <StatusBadge status={p.status} />
                <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-spyne-text-muted">{p.department}</span>
              </div>
              {p.status === "active" && (
                <button onClick={() => archive(p.id)} className="text-[11px] text-spyne-text-muted hover:text-spyne-error">Archive</button>
              )}
            </div>
            <div className="font-semibold text-[14px] mb-1">{p.title}</div>
            <p className="text-[12px] text-spyne-text-muted leading-relaxed mb-2.5">{p.description}</p>
            <div className="flex items-center justify-between text-[11px] text-spyne-text-muted pt-2 border-t border-spyne-border">
              <span><MaterialSymbol name="event" size={11} /> {p.startDate} → {p.endDate}</span>
              <span><MaterialSymbol name="trending_up" size={11} /> {p.timesReferenced}× referenced</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============= DOCUMENTS =============
function DocumentsSection({ documents }: { documents: KnowledgeDocument[] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="spyne-card p-4 flex items-center gap-3">
        <MaterialSymbol name="upload_file" size={18} className="text-spyne-brand" />
        <div className="text-[13px] flex-1">
          <strong>Upload PDFs / Word docs to enrich Riley's knowledge.</strong> Parsed into searchable chunks. Riley cites the source.
        </div>
        <button type="button" className={cn(spyneComponentClasses.btnPrimaryMd, "flex items-center gap-1")}>
          <MaterialSymbol name="upload" size={14} /> Upload document
        </button>
      </div>

      <div className="spyne-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-spyne-border bg-spyne-surface-hover text-[11px] font-bold uppercase tracking-[0.04em] text-spyne-text-muted">
              <th className="text-left px-5 py-3">Filename</th>
              <th className="text-left px-5 py-3">Type</th>
              <th className="text-left px-5 py-3">Size</th>
              <th className="text-left px-5 py-3">Status</th>
              <th className="text-left px-5 py-3">Chunks</th>
              <th className="text-left px-5 py-3">Used</th>
              <th className="text-left px-5 py-3">Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((d) => (
              <tr key={d.id} className="border-b border-spyne-border last:border-b-0 hover:bg-spyne-surface-hover text-[13px]">
                <td className="px-5 py-3 font-semibold flex items-center gap-2">
                  <MaterialSymbol name="picture_as_pdf" size={16} className="text-spyne-error" />
                  {d.filename}
                </td>
                <td className="px-5 py-3 text-spyne-text-muted uppercase font-mono text-[11px]">{d.fileType}</td>
                <td className="px-5 py-3 text-spyne-text-muted tabular-nums">{d.sizeKb < 1024 ? `${d.sizeKb} KB` : `${(d.sizeKb/1024).toFixed(1)} MB`}</td>
                <td className="px-5 py-3">
                  {d.status === "ready" && <Pill tone="success">Ready</Pill>}
                  {d.status === "processing" && <Pill tone="warning">Processing</Pill>}
                  {d.status === "error" && <Pill tone="error">Error</Pill>}
                </td>
                <td className="px-5 py-3 text-spyne-text-muted tabular-nums">{d.chunkCount}</td>
                <td className="px-5 py-3 tabular-nums">{d.timesReferenced > 0 ? `${d.timesReferenced}×` : "—"}</td>
                <td className="px-5 py-3 text-spyne-text-muted text-[12px]">{d.uploadedBy} · {d.uploadedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============= WEBSITE SYNC =============
function WebsiteSection() {
  return (
    <div className="flex flex-col gap-4">
      <div className="spyne-card p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-spyne-brand-subtle text-spyne-brand flex items-center justify-center shrink-0">
            <MaterialSymbol name="language" size={24} />
          </div>
          <div className="flex-1">
            <h3 className={cn(spyneComponentClasses.cardTitle, "m-0 mb-1")}>Website sync</h3>
            <p className="text-[12px] text-spyne-text-muted mb-3">
              Auto-pull from your dealership website daily. Riley uses About, Services, Hours, and Contact pages as canonical sources.
            </p>
            <div className="flex items-center gap-3">
              <input
                value={websiteSync.url}
                className="flex-1 rounded-lg border border-spyne-border bg-spyne-surface px-3 py-2 text-[13px] font-mono focus:border-spyne-brand focus:outline-none"
                readOnly
              />
              <button type="button" className={cn(spyneComponentClasses.btnSecondaryMd, "flex items-center gap-1")}>
                <MaterialSymbol name="refresh" size={14} /> Sync now
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="spyne-card p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-spyne-text-muted">Last sync</div>
          <div className="text-[18px] font-bold mt-1">{websiteSync.lastSyncedAt}</div>
        </div>
        <div className="spyne-card p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-spyne-text-muted">Pages ingested</div>
          <div className="text-[18px] font-bold mt-1 tabular-nums">{websiteSync.pagesIngested}</div>
        </div>
        <div className="spyne-card p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-spyne-text-muted">Pending changes</div>
          <div className="text-[18px] font-bold mt-1 tabular-nums text-spyne-brand">{websiteSync.pagesPending}</div>
        </div>
      </div>

      {websiteSync.pagesPending > 0 && (
        <div className="spyne-card p-5 border-spyne-brand/30 bg-spyne-brand-subtle/30">
          <div className="flex items-start gap-3">
            <MaterialSymbol name="diff" size={18} className="text-spyne-brand mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-[14px] mb-1">2 pages have changes since last sync</div>
              <ul className="text-[12px] text-spyne-text-muted space-y-1">
                <li>• <strong>/services</strong> — pricing for detailing updated · 3 lines changed</li>
                <li>• <strong>/specials</strong> — new Memorial Day banner added</li>
              </ul>
              <div className="flex gap-2 mt-3">
                <button type="button" className={cn(spyneComponentClasses.btnPrimaryMd, "flex items-center gap-1")}>
                  <MaterialSymbol name="check" size={14} /> Approve all changes
                </button>
                <button type="button" className={spyneComponentClasses.btnSecondaryMd}>Review individually</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============= BULLETIN =============
function BulletinSection({ bulletins, setBulletins }: { bulletins: BulletinItem[]; setBulletins: (b: BulletinItem[]) => void }) {
  const [draft, setDraft] = useState("")
  const post = () => {
    if (!draft.trim()) return
    setBulletins([
      { id: `b-${Date.now()}`, message: draft.trim(), expiresAt: "Auto · 7 days", postedBy: "You", postedAt: "Just now", active: true },
      ...bulletins,
    ])
    setDraft("")
  }
  const dismiss = (id: string) => setBulletins(bulletins.map((b) => b.id === id ? { ...b, active: false } : b))
  const remove = (id: string) => setBulletins(bulletins.filter((b) => b.id !== id))

  return (
    <div className="flex flex-col gap-4">
      <div className="spyne-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <MaterialSymbol name="notifications_active" size={18} className="text-spyne-brand" />
          <h3 className={cn(spyneComponentClasses.cardTitle, "m-0")}>Post a bulletin</h3>
        </div>
        <p className="text-[12px] text-spyne-text-muted mb-3">
          One-off override — &ldquo;closing early today,&rdquo; &ldquo;recall just announced,&rdquo; &ldquo;parking lot under construction.&rdquo; Bulletins take priority over all other knowledge for the duration they're active.
        </p>
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && post()}
            placeholder="e.g. Closing at 4pm today for staff training..."
            className="flex-1 rounded-lg border border-spyne-border bg-spyne-surface px-3 py-2 text-[13px] focus:border-spyne-brand focus:outline-none"
          />
          <select className="rounded-lg border border-spyne-border bg-spyne-surface px-3 py-2 text-[13px] focus:border-spyne-brand focus:outline-none">
            <option>Auto-expire · 24 hours</option>
            <option>Auto-expire · 7 days</option>
            <option>Auto-expire · 30 days</option>
            <option>Until manually removed</option>
          </select>
          <button type="button" onClick={post} className={cn(spyneComponentClasses.btnPrimaryMd, "flex items-center gap-1")}>
            <MaterialSymbol name="send" size={14} /> Post
          </button>
        </div>
      </div>

      <div className="spyne-card overflow-hidden">
        <div className="border-b border-spyne-border px-5 py-3">
          <h3 className={cn(spyneComponentClasses.cardTitle, "m-0")}>Active bulletins <span className="font-normal text-spyne-text-muted">· {bulletins.filter((b) => b.active).length}</span></h3>
        </div>
        {bulletins.length === 0 ? (
          <div className="py-12 text-center text-[13px] text-spyne-text-muted">No bulletins active.</div>
        ) : bulletins.map((b) => (
          <div key={b.id} className={cn("border-b border-spyne-border last:border-b-0 px-5 py-3.5 flex items-start gap-3", !b.active && "opacity-50")}>
            <div className={cn("w-2 h-2 rounded-full mt-2 shrink-0", b.active ? "bg-spyne-brand animate-pulse" : "bg-spyne-text-subtle")} />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] leading-relaxed">{b.message}</div>
              <div className="mt-1.5 flex items-center gap-3 text-[11px] text-spyne-text-muted">
                <span>{b.postedBy} · {b.postedAt}</span>
                <span>· Expires {b.expiresAt}</span>
                {!b.active && <Pill tone="neutral">Dismissed</Pill>}
              </div>
            </div>
            {b.active && (
              <button onClick={() => dismiss(b.id)} className="text-[11px] text-spyne-text-muted hover:text-spyne-text-primary font-semibold">Dismiss</button>
            )}
            <button onClick={() => remove(b.id)} className="text-spyne-text-muted hover:text-spyne-error">
              <MaterialSymbol name="close" size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============= SUGGESTIONS =============
function SuggestionsSection({ suggestions, setSuggestions }: { suggestions: KnowledgeSuggestion[]; setSuggestions: (s: KnowledgeSuggestion[]) => void }) {
  const dismiss = (id: string) => setSuggestions(suggestions.filter((s) => s.id !== id))

  const typeMeta = {
    unanswered_question: { label: "Unanswered question", icon: "help",     tone: "warning" as const },
    missing_fact:        { label: "Missing fact",         icon: "lightbulb", tone: "brand"   as const },
    outdated_fact:       { label: "Outdated",             icon: "schedule",  tone: "error"   as const },
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="spyne-card p-4 flex items-center gap-3 bg-spyne-brand-subtle border-spyne-brand/20">
        <MaterialSymbol name="auto_awesome" size={18} className="text-spyne-brand" />
        <div className="text-[13px] flex-1">
          <strong>VINI is watching every call.</strong> When the same question comes up repeatedly and Riley can't answer well, it surfaces here as a suggested knowledge addition.
        </div>
      </div>

      {suggestions.length === 0 ? (
        <div className="spyne-card py-12 text-center">
          <MaterialSymbol name="check_circle" size={32} className="text-spyne-success mb-2" />
          <div className="text-[14px] font-semibold">All caught up.</div>
          <div className="text-[12px] text-spyne-text-muted mt-1">No knowledge gaps detected in recent calls.</div>
        </div>
      ) : suggestions.map((s) => {
        const tm = typeMeta[s.type]
        return (
          <div key={s.id} className="spyne-card p-4">
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                tm.tone === "warning" && "bg-spyne-warning-subtle text-[var(--spyne-warning-ink)]",
                tm.tone === "brand"   && "bg-spyne-brand-subtle text-spyne-brand",
                tm.tone === "error"   && "bg-spyne-error-subtle text-spyne-error",
              )}>
                <MaterialSymbol name={tm.icon} size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Pill tone={tm.tone}>{tm.label}</Pill>
                  <span className="text-[11px] text-spyne-text-muted">{s.detectedAt}</span>
                  {s.frequency > 0 && (
                    <span className="text-[11px] font-semibold text-spyne-text-muted">
                      · {s.frequency}× this period
                    </span>
                  )}
                </div>
                <div className="text-[14px] font-semibold mb-2">{s.text}</div>
                {s.suggestedAnswer && (
                  <div className="bg-spyne-surface-hover rounded-md p-3 border-l-2 border-spyne-brand text-[12px] mt-2">
                    <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-spyne-text-muted mb-1">VINI suggests</div>
                    <div className="italic">&ldquo;{s.suggestedAnswer}&rdquo;</div>
                  </div>
                )}
                <div className="flex gap-2 mt-3">
                  <button type="button" className={cn(spyneComponentClasses.btnPrimaryMd, "flex items-center gap-1")}>
                    <MaterialSymbol name="add" size={14} /> Add to knowledge
                  </button>
                  <button type="button" onClick={() => dismiss(s.id)} className={spyneComponentClasses.btnSecondaryMd}>Dismiss</button>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ============= UTILITIES =============
function FilterChip({ label, active, onClick, count }: { label: string; active: boolean; onClick: () => void; count?: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold transition-colors",
        active
          ? "bg-spyne-brand text-white"
          : "bg-spyne-surface-hover text-spyne-text-muted hover:bg-spyne-border"
      )}
    >
      {label}
      {count !== undefined && (
        <span className={cn(
          "tabular-nums",
          active ? "text-white/80" : "text-spyne-text-subtle"
        )}>
          {count}
        </span>
      )}
    </button>
  )
}

function StatusBadge({ status }: { status: PromotionStatus }) {
  if (status === "active") return <Pill tone="success">Active</Pill>
  if (status === "scheduled") return <Pill tone="brand">Scheduled</Pill>
  return <Pill tone="neutral">Expired</Pill>
}

function Pill({ tone, children }: { tone: "success" | "warning" | "brand" | "error" | "neutral" | "info"; children: React.ReactNode }) {
  const cls =
    tone === "success" ? "bg-spyne-success-subtle text-spyne-success" :
    tone === "warning" ? "bg-spyne-warning-subtle text-[var(--spyne-warning-ink)]" :
    tone === "brand"   ? "bg-spyne-brand-subtle text-spyne-brand" :
    tone === "error"   ? "bg-spyne-error-subtle text-spyne-error" :
    tone === "info"    ? "bg-spyne-info-subtle text-spyne-info" :
                         "bg-spyne-border text-spyne-text-muted"
  return <span className={cn("inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold", cls)}>{children}</span>
}
