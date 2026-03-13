// Max 2.0 Types — Dealer flywheel architecture

// ─── Lifecycle ───

export type LifecycleStage = "sourcing" | "recon" | "studio" | "marketing" | "sales" | "service"

export interface LifecycleNode {
  stage: LifecycleStage
  label: string
  href: string
  health: "green" | "yellow" | "red"
  openTasks: number
  threats: number
  opportunities: number
  summary: string
}

// ─── Core Metrics ───

export type MetricStatus = "above" | "at" | "below"

export interface CoreMetric {
  id: string
  name: string
  value: number
  target: number
  unit: string
  status: MetricStatus
  trend: number[]
}

// ─── Threats ───

export type ThreatCategory = "aging" | "no-leads" | "recon-delay" | "pricing-risk" | "margin-erosion" | "stock-photos" | "wholesale-candidate"

export interface Threat {
  id: string
  category: ThreatCategory
  label: string
  count: number
  description: string
  severity: "critical" | "warning"
  href: string
  filterParams?: string
  vehicles?: ThreatVehicle[]
}

export interface ThreatVehicle {
  vin: string
  year: number
  make: string
  model: string
  detail: string
}

// ─── Opportunities ───

export type OpportunityCategory = "hot-vehicle" | "price-drop-follow-up" | "demand-not-in-stock" | "service-lane-acquisition" | "market-gap" | "campaign-ready"

export interface Opportunity {
  id: string
  category: OpportunityCategory
  label: string
  count: number
  description: string
  impact: "high" | "medium"
  href: string
  filterParams?: string
  items?: OpportunityItem[]
}

export interface OpportunityItem {
  id: string
  title: string
  detail: string
}

// ─── Insights ───

export interface InsightPreset {
  id: string
  question: string
  category: "service" | "sales" | "inventory" | "market"
  icon: string
}

// ─── Sourcing ───

export interface DemandSignal {
  id: string
  vehicleDescription: string
  source: "vini-sales" | "vini-service" | "market-data" | "customer-inquiry"
  sourceLabel: string
  requestCount: number
  avgBudget: number
  urgency: "high" | "medium" | "low"
  inStock: boolean
  segment: string
}

export interface ServiceLaneOpportunity {
  id: string
  customerName: string
  currentVehicle: string
  roAmount: number
  visitReason: string
  buySignal: string
  estimatedEquity: number
}

export interface MarketGap {
  segment: string
  marketDemand: number
  yourInventory: number
  gap: number
  avgPrice: number
  monthlyOpportunity: number
}

export interface TradeInOpportunity {
  id: string
  customerName: string
  vehicleOffered: string
  estimatedACV: number
  estimatedFrontGross: number
  source: string
  daysOld: number
}

// ─── Studio / Merchandising ───

export type MediaStatus = "real-photos" | "clone-photos" | "stock-photos" | "no-photos"
export type PublishStatus = "live" | "pending" | "not-published"

export interface MerchandisingVehicle {
  vin: string
  year: number
  make: string
  model: string
  mediaStatus: MediaStatus
  photoCount: number
  has360: boolean
  hasVideo: boolean
  publishStatus: PublishStatus
  listingScore: number
  daysInStock: number
  vdpViews: number
}

// ─── Sales ───

export interface LeadFunnelStage {
  stage: string
  count: number
  conversionRate: number
}

export interface VehicleInquiry {
  id: string
  vehicleDescription: string
  vin?: string
  inStock: boolean
  inquiryCount: number
  lastInquiry: string
  source: string
  status: "hot" | "warm" | "cold"
}

export interface FollowUpOpportunity {
  id: string
  customerName: string
  vehicleInterest: string
  lastContact: string
  reason: string
  priority: "high" | "medium" | "low"
}

// ─── Service ───

export interface ServiceBuyOpportunity {
  id: string
  customerName: string
  currentVehicle: string
  vehicleAge: number
  mileage: number
  roTotal: number
  buySignal: string
  estimatedEquity: number
  recommendedAction: string
}

export interface ServicePainPoint {
  id: string
  category: string
  mentionCount: number
  sentiment: "negative" | "neutral"
  topQuotes: string[]
  trend: "rising" | "stable" | "declining"
}

// ─── Lot View ───

export type LotStatus = "frontline" | "in-recon" | "arriving" | "wholesale-candidate" | "sold-pending"
export type PricingPosition = "below-market" | "at-market" | "above-market"

export interface LotVehicle {
  vin: string
  stockNumber: string
  year: number
  make: string
  model: string
  trim: string
  color: string
  mileage: number
  listPrice: number
  marketPrice: number
  acv: number
  pricingPosition: PricingPosition
  costToMarketPct: number
  daysInStock: number
  lotStatus: LotStatus
  photoCount: number
  hasRealPhotos: boolean
  vdpViews: number
  leads: number
  lastLeadDate: string | null
  recentPriceChange: number | null
  holdingCostPerDay: number
  totalHoldingCost: number
  estimatedFrontGross: number
  segment: string
  location: string
}

export interface LotSummary {
  totalUnits: number
  frontlineReady: number
  inRecon: number
  arriving: number
  avgDaysInStock: number
  avgCostToMarket: number
  totalHoldingCostToday: number
  aged30Plus: number
  aged45Plus: number
  aged60Plus: number
  noLeads5Days: number
  noPhotos: number
}

// ─── Customers ───

export type CustomerStatus = "active-lead" | "sold" | "service-only" | "lost" | "be-back"
export type CustomerSource = "website" | "walk-in" | "phone" | "referral" | "service-lane" | "third-party"

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  status: CustomerStatus
  source: CustomerSource
  assignedSalesperson: string
  firstContactDate: string
  lastContactDate: string
  vehicleInterests: string[]
  currentVehicle: string | null
  estimatedEquity: number | null
  totalTouchpoints: number
  appointmentSet: boolean
  testDriveCompleted: boolean
  creditAppSubmitted: boolean
  notes: string
}

export interface CustomerSummary {
  totalActive: number
  newThisWeek: number
  appointmentsToday: number
  followUpsDue: number
  beBackOpportunities: number
  avgResponseTime: string
  conversionRate: number
  lostThisMonth: number
}

export interface CustomerActivity {
  id: string
  customerId: string
  type: "call" | "email" | "text" | "visit" | "test-drive" | "appointment" | "credit-app" | "deal-closed"
  description: string
  timestamp: string
  salesperson: string
}
