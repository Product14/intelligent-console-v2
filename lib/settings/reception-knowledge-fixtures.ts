// Seed data and types for the Reception → Knowledge Base sub-tab.
// Ported from intelligent-console-v2-receptionist/components/max-2/receptionist/receptionist-data.ts.
// Local-state only — no service layer wiring this round.

export type QuickFactCategory = 'amenities' | 'policies' | 'services' | 'directions' | 'other';

export interface QuickFact {
  id: string;
  category: QuickFactCategory;
  text: string;
  addedBy: string;
  addedAt: string;
  timesReferenced: number;
}

export const QUICK_FACT_CATEGORIES: { id: QuickFactCategory; label: string }[] = [
  { id: 'amenities', label: 'Amenities' },
  { id: 'policies', label: 'Policies' },
  { id: 'services', label: 'Services' },
  { id: 'directions', label: 'Directions' },
  { id: 'other', label: 'Other' },
];

export const seedQuickFacts: QuickFact[] = [
  { id: 'qf-1', category: 'amenities', text: "Lounge has free Starbucks coffee, complimentary snacks, and a kids' play area with TV and toys.", addedBy: 'Nidhi', addedAt: '2026-04-12', timesReferenced: 47 },
  { id: 'qf-2', category: 'amenities', text: "Free Wi-Fi: network 'SpyneGuest', no password required.", addedBy: 'Nidhi', addedAt: '2026-04-12', timesReferenced: 84 },
  { id: 'qf-3', category: 'amenities', text: 'Family room and ADA-accessible restrooms on the main floor.', addedBy: 'Admin', addedAt: '2026-04-12', timesReferenced: 12 },
  { id: 'qf-4', category: 'amenities', text: 'Free valet parking in front lot during business hours. Overflow lot behind dealership.', addedBy: 'Lakshya', addedAt: '2026-04-15', timesReferenced: 31 },
  { id: 'qf-5', category: 'policies', text: 'Loaner vehicles available for any service appointment over 2 hours · $0 with appointment · subject to availability.', addedBy: 'Lakshya', addedAt: '2026-04-15', timesReferenced: 28 },
  { id: 'qf-6', category: 'policies', text: 'Shuttle service within 10 miles · free with service appointment · runs every 30 minutes.', addedBy: 'Lakshya', addedAt: '2026-04-15', timesReferenced: 19 },
  { id: 'qf-7', category: 'services', text: 'Factory-certified technicians for Ford, Lincoln. Same-day oil change with no appointment Mon-Fri before 4pm.', addedBy: 'Admin', addedAt: '2026-04-18', timesReferenced: 56 },
  { id: 'qf-8', category: 'services', text: 'Detail bay open Mon-Sat 8am-5pm. Full detail $189, express wash $24.', addedBy: 'Admin', addedAt: '2026-04-22', timesReferenced: 18 },
  { id: 'qf-9', category: 'directions', text: 'Located at the I-10 / Beltway 8 interchange · exit 757B · 2 minutes from Memorial Park.', addedBy: 'Nidhi', addedAt: '2026-04-12', timesReferenced: 42 },
  { id: 'qf-10', category: 'other', text: "Spanish-speaking sales rep Maria available Tue-Sat. Maria is also the dealership's bilingual liaison.", addedBy: 'Nidhi', addedAt: '2026-05-02', timesReferenced: 22 },
];

export type FAQCategory = 'amenities' | 'services' | 'policies' | 'directions' | 'other';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: FAQCategory;
  timesAnswered: number;
  lastAnswered?: string;
}

export const FAQ_CATEGORIES: { id: FAQCategory; label: string }[] = [
  { id: 'amenities', label: 'Amenities' },
  { id: 'services', label: 'Services' },
  { id: 'policies', label: 'Policies' },
  { id: 'directions', label: 'Directions' },
  { id: 'other', label: 'Other' },
];

export const seedFaqs: FAQItem[] = [
  { id: 'faq-1', question: "Do you have a kids' play area?", answer: 'Yes — in the main lounge, near the showroom. TV, toys, and snacks. Free to use during your visit.', category: 'amenities', timesAnswered: 38, lastAnswered: 'Today' },
  { id: 'faq-2', question: "What's your Wi-Fi?", answer: "Free Wi-Fi — network 'SpyneGuest', no password.", category: 'amenities', timesAnswered: 84, lastAnswered: 'Today' },
  { id: 'faq-3', question: 'Do you offer loaner vehicles?', answer: 'Yes — for any service appointment over 2 hours. Free with appointment, subject to availability. Let me get you to Service to set it up.', category: 'policies', timesAnswered: 26, lastAnswered: 'Yesterday' },
  { id: 'faq-4', question: 'Do you have a shuttle?', answer: 'Yes — free shuttle within 10 miles, running every 30 minutes. Available with any service appointment.', category: 'policies', timesAnswered: 19, lastAnswered: 'Today' },
  { id: 'faq-5', question: 'Where are you located?', answer: "We're at the I-10 and Beltway 8 interchange — exit 757B. About 2 minutes from Memorial Park. Address: 2300 Auto Center Dr.", category: 'directions', timesAnswered: 42, lastAnswered: 'Today' },
  { id: 'faq-6', question: 'Do you speak Spanish?', answer: 'Sí — Maria, our bilingual sales rep, is available Tuesday through Saturday. Would you like me to connect you?', category: 'other', timesAnswered: 14, lastAnswered: 'Today' },
  { id: 'faq-7', question: 'Can I just walk in for an oil change?', answer: 'Yes — no appointment needed for oil changes, Monday through Friday before 4pm. Otherwise we\'d recommend booking.', category: 'services', timesAnswered: 31, lastAnswered: 'Today' },
];

export type PromotionStatus = 'active' | 'scheduled' | 'expired';
export type PromotionDept = 'sales' | 'service' | 'parts' | 'finance';

export interface Promotion {
  id: string;
  title: string;
  description: string;
  department: PromotionDept;
  startDate: string;
  endDate: string;
  status: PromotionStatus;
  timesReferenced: number;
}

export const PROMOTION_DEPTS: { id: PromotionDept; label: string }[] = [
  { id: 'sales', label: 'Sales' },
  { id: 'service', label: 'Service' },
  { id: 'parts', label: 'Parts' },
  { id: 'finance', label: 'Finance' },
];

export const seedPromotions: Promotion[] = [
  { id: 'p-1', title: 'Memorial Day sales event', description: 'Up to $2,500 off select 2026 F-150 models. Plus 0% APR for 60 months on qualified buyers.', department: 'sales', startDate: 'May 22', endDate: 'Jun 2', status: 'active', timesReferenced: 18 },
  { id: 'p-2', title: 'Free brake inspection', description: 'Complimentary multi-point brake inspection through summer. Includes pad-life report.', department: 'service', startDate: 'May 1', endDate: 'Aug 31', status: 'active', timesReferenced: 24 },
  { id: 'p-3', title: 'Trade-in bonus', description: 'Extra $1,000 over Kelley Blue Book value when you trade in toward a new F-150 Lightning.', department: 'sales', startDate: 'May 15', endDate: 'Jun 15', status: 'active', timesReferenced: 11 },
  { id: 'p-4', title: 'Summer service bundle', description: 'Oil change + tire rotation + multi-point inspection for $89 (save $40).', department: 'service', startDate: 'Jun 1', endDate: 'Aug 31', status: 'scheduled', timesReferenced: 0 },
  { id: 'p-5', title: 'Spring tire promo', description: 'Buy 3 tires, get the 4th free. Mountings included.', department: 'parts', startDate: 'Mar 1', endDate: 'May 31', status: 'expired', timesReferenced: 47 },
];

export type DocumentStatus = 'processing' | 'ready' | 'error';
export type DocumentFileType = 'pdf' | 'docx' | 'txt';

export interface KnowledgeDocument {
  id: string;
  filename: string;
  fileType: DocumentFileType;
  sizeKb: number;
  uploadedBy: string;
  uploadedAt: string;
  status: DocumentStatus;
  chunkCount: number;
  timesReferenced: number;
}

export const seedDocuments: KnowledgeDocument[] = [
  { id: 'doc-1', filename: 'service-menu-2026.pdf', fileType: 'pdf', sizeKb: 1240, uploadedBy: 'Admin', uploadedAt: '2026-04-08', status: 'ready', chunkCount: 47, timesReferenced: 89 },
  { id: 'doc-2', filename: 'dealer-handbook.pdf', fileType: 'pdf', sizeKb: 2890, uploadedBy: 'Admin', uploadedAt: '2026-04-08', status: 'ready', chunkCount: 102, timesReferenced: 23 },
  { id: 'doc-3', filename: 'warranty-coverage-2026.pdf', fileType: 'pdf', sizeKb: 680, uploadedBy: 'Nidhi', uploadedAt: '2026-04-12', status: 'ready', chunkCount: 21, timesReferenced: 34 },
  { id: 'doc-4', filename: 'memorial-day-sale-terms.pdf', fileType: 'pdf', sizeKb: 320, uploadedBy: 'Lakshya', uploadedAt: '2026-05-20', status: 'ready', chunkCount: 8, timesReferenced: 6 },
  { id: 'doc-5', filename: 'staff-bios-q2.docx', fileType: 'docx', sizeKb: 145, uploadedBy: 'Lakshya', uploadedAt: '2026-05-22', status: 'processing', chunkCount: 0, timesReferenced: 0 },
];

export interface BulletinItem {
  id: string;
  message: string;
  expiresAt: string;
  postedBy: string;
  postedAt: string;
  active: boolean;
}

export const seedBulletins: BulletinItem[] = [
  { id: 'b-1', message: 'Wednesday June 18: closing at 4pm for staff training. Service department closed. Sales open until 4pm.', expiresAt: '2026-06-19', postedBy: 'Nidhi', postedAt: '2026-06-15', active: true },
  { id: 'b-2', message: 'New EV charger installed in lot 3 — let callers asking about EVs know we now have on-site charging.', expiresAt: '2026-07-01', postedBy: 'Admin', postedAt: '2026-06-10', active: true },
];

export type SuggestionType = 'unanswered_question' | 'missing_fact' | 'outdated_fact';

export interface KnowledgeSuggestion {
  id: string;
  type: SuggestionType;
  text: string;
  frequency: number;
  suggestedAnswer?: string;
  detectedAt: string;
}

export const seedSuggestions: KnowledgeSuggestion[] = [
  { id: 'ks-1', type: 'unanswered_question', text: "Callers asking: 'Do you take Apple Pay for service?'", frequency: 12, suggestedAnswer: 'Yes, we accept Apple Pay, Google Pay, and all major credit cards.', detectedAt: 'Last 7 days' },
  { id: 'ks-2', type: 'unanswered_question', text: "Callers asking: 'Are you open on Memorial Day?'", frequency: 8, suggestedAnswer: 'Add to bulletin: Closed Memorial Day. Open regular hours rest of week.', detectedAt: 'Last 7 days' },
  { id: 'ks-3', type: 'missing_fact', text: '10 callers asked about EV charging — bulletin exists but not in FAQ.', frequency: 10, suggestedAnswer: 'Promote bulletin item to a permanent FAQ entry.', detectedAt: 'Last 14 days' },
  { id: 'ks-4', type: 'outdated_fact', text: "'Spring tire promo' is still in active promotions but ended May 31.", frequency: 0, suggestedAnswer: 'Archive promotion p-5.', detectedAt: 'Yesterday' },
  { id: 'ks-5', type: 'unanswered_question', text: "Callers asking: 'Do you do trade-in appraisals over video?'", frequency: 6, suggestedAnswer: 'Add as FAQ — yes, video appraisals available with Sales team.', detectedAt: 'Last 14 days' },
];

export interface WebsiteSyncConfig {
  url: string;
  lastSyncedAt: string;
  pagesIngested: number;
  pagesPending: number;
  status: 'healthy' | 'changes_pending' | 'error';
}

export const seedWebsiteSync: WebsiteSyncConfig = {
  url: 'https://spynemotors.com',
  lastSyncedAt: 'Today at 4:00 AM',
  pagesIngested: 18,
  pagesPending: 2,
  status: 'changes_pending',
};

export type KnowledgeSectionId =
  | 'facts'
  | 'faqs'
  | 'promotions'
  | 'documents'
  | 'website'
  | 'bulletins'
  | 'suggestions';

export const KNOWLEDGE_SECTIONS: { id: KnowledgeSectionId; label: string }[] = [
  { id: 'facts', label: 'Quick Facts' },
  { id: 'faqs', label: 'FAQs' },
  { id: 'promotions', label: 'Promotions' },
  { id: 'documents', label: 'Documents' },
  { id: 'website', label: 'Website Sync' },
  { id: 'bulletins', label: 'Bulletins' },
  { id: 'suggestions', label: 'Suggestions' },
];
