// Spyne Max Types -- Dealer GM terminology throughout

// Store-level baseline ("100-unit store" from GM feedback)
export interface DealerProfile {
  monthlyRetailUnits: number
  avgInventoryOnHand: number
  avgFrontGross: number
  avgBackGross: number
  totalPVR: number
  netToGross: number
  returnOnSales: number
  holdingCostPerDay: number
  avgReconDays: number
  financePenetration: number
  serviceContractPenetration: number
  turnRate: number
  totalMonthlyGross: number
  monthlyNetProfit: number
  salesRevenue: number
  packPerUnit: number
}

export type StoreGrade = "elite" | "strong" | "average" | "weak"

export interface StoreGradeThresholds {
  grade: StoreGrade
  label: string
  totalPVR: number
  netToGross: number
  returnOnSales: number
  description: string
}

export type KPIStatus = "above" | "at" | "below"
export type KPIUnit = "%" | "$" | "x" | "days" | "units" | "$/day"

export interface DealerKPI {
  id: string
  name: string
  value: number
  target: number
  targetRange?: [number, number]
  formula: string
  unit: KPIUnit
  status: KPIStatus
  trend: number[]
  category: "volume" | "gross" | "efficiency" | "operational" | "finance" | "aging"
}

// Market Intelligence
export interface MarketSegment {
  segment: string
  marketVolume: number
  yourVolume: number
  marketShare: number
  avgPrice: number
  yourDaySupply: number
  marketDaySupply: number
  gap: number
  gapDollars: number
}

export interface Competitor {
  name: string
  estimatedVolume: number
  avgPrice: number
  daySupply: number
  bounceRate: number
  topSegments: string[]
}

export interface MarketShareZip {
  zip: string
  area: string
  marketVolume: number
  yourSales: number
  penetration: number
  topCompetitors: string[]
  growthTarget: number
}

// Pricing
export interface VehiclePricing {
  vin: string
  year: number
  make: string
  model: string
  trim: string
  costToMarket: number
  marketRank: number
  totalComparables: number
  daysAtCurrentPrice: number
  daysInStock: number
  acquisitionCost: number
  currentAsk: number
  marketAvg: number
  targetGross: number
  repriceHistory: PriceChange[]
  stage: VehicleAgeStage
}

export interface PriceChange {
  date: string
  oldPrice: number
  newPrice: number
  reason: string
}

export type VehicleAgeStage = "fresh" | "watch" | "risk" | "critical"

export type RepricingAction = "hold" | "first-reprice" | "aggressive" | "wholesale-decision"
export interface RepricingRule {
  dayRange: [number, number]
  action: RepricingAction
  label: string
  description: string
}

// Recon Pipeline
export type ReconStage = "inspection" | "mechanical" | "body" | "detail" | "photo" | "online"

export interface ReconVehicle {
  vin: string
  year: number
  make: string
  model: string
  currentStage: ReconStage
  daysInRecon: number
  daysInCurrentStage: number
  slaTarget: number
  slaBreach: boolean
  reconCost: number
  estimatedCost: number
  doorRate: number
  internalBilled: number
  doorRateCompliance: number
  assignedTo: string
}

export interface ReconStageStats {
  stage: ReconStage
  label: string
  count: number
  avgDays: number
  breachCount: number
}

// Holding Cost
export interface HoldingCostInputs {
  ytdTotalUsedExpense: number
  ytdVariableExpense: number
  monthsElapsed: number
  avgMonthlySales: number
  daysOpenPerMonth: number
}

export interface HoldingCostResult {
  fixedCost: number
  avgFixedPerMonth: number
  avgUnitsInStock: number
  perUnitPerMonth: number
  holdingCostPerDay: number
}

export interface BurnBucket {
  stage: VehicleAgeStage
  label: string
  dayRange: string
  count: number
  totalBurn: number
  avgDaysInBucket: number
}

// Lot Walks
export type WalkType = "15-day" | "45-day"
export type WalkStatus = "upcoming" | "due-today" | "overdue" | "completed"

export interface WalkChecklistItem {
  id: string
  category: string
  description: string
  completed: boolean
}

export interface LotWalk {
  vin: string
  year: number
  make: string
  model: string
  walkType: WalkType
  dueDate: string
  status: WalkStatus
  daysInStock: number
  checklist: WalkChecklistItem[]
  actionTaken?: string
  completedDate?: string
  roiPerDay?: number
}

export interface WalkComplianceData {
  week: string
  fifteenDayTotal: number
  fifteenDayCompleted: number
  fortyFiveDayTotal: number
  fortyFiveDayCompleted: number
}

// Marketing & Leads
export interface MarketingChannel {
  source: string
  spend: number
  leads: number
  appointments: number
  unitsSold: number
  costPerSale: number
  costPerLead: number
  conversionRate: number
}

export type SalesChannelType = "internet" | "phone" | "walk-in"

export interface SalesChannel {
  channel: SalesChannelType
  label: string
  conversionRate: number
  targetRange: [number, number]
  primaryWeakness: string
  processSteps: string[]
}

export interface BDCMetrics {
  appointmentShowRate: number
  showRateTarget: number
  avgResponseTime: number
  responseTimeTarget: number
  contactRate: number
  totalAppointmentsSet: number
  totalShows: number
}

// Profitability
export interface PackStructure {
  advertising: number
  lotExpense: number
  salesSupplies: number
  reconVariance: number
  totalPack: number
}

export interface ProfitabilitySnapshot {
  units: number
  avgFrontGross: number
  avgBackGross: number
  totalFrontGross: number
  totalBackGross: number
  combinedGross: number
  netToGross: number
  netProfit: number
  salesRevenue: number
  returnOnSales: number
}

export interface HealthMetric {
  name: string
  formula: string
  current: number
  target: number | string
  unit: KPIUnit
  status: KPIStatus
}

// Team & Accountability
export type ManagerRole = "used-car-manager" | "finance-director" | "service-recon" | "bdc-manager" | "sales-manager"

export interface ManagerScorecard {
  role: ManagerRole
  roleLabel: string
  name: string
  metrics: {
    name: string
    current: number
    target: number
    unit: KPIUnit
    status: KPIStatus
  }[]
}

export type AccountabilityLevel = "store" | "manager" | "sales-bdc"

export interface AccountabilityTier {
  level: AccountabilityLevel
  label: string
  focus: string
  metrics: string[]
}

export type ChecklistFrequency = "daily" | "weekly" | "monthly"

export interface AccountabilityChecklist {
  frequency: ChecklistFrequency
  label: string
  duration: string
  items: { id: string; description: string; completed: boolean }[]
}

export interface LeadershipMetric {
  name: string
  formula: string
  current: number
  target: number
  unit: KPIUnit
}

export interface TeamMember {
  id: string
  name: string
  role: ManagerRole
  roleLabel: string
  hireDate: string
  metrics: { name: string; current: number; target: number; unit: KPIUnit }[]
  trend: "up" | "flat" | "down"
}

// Urgent Actions
export type UrgentActionType = "walk" | "recon" | "pricing" | "marketing" | "aging" | "finance"

export interface UrgentAction {
  id: string
  type: UrgentActionType
  message: string
  severity: "high" | "medium" | "low"
  actionLabel: string
  href?: string
  vin?: string
}

// Daily Rhythm
export type TimeOfDay = "morning" | "midday" | "end-of-day"

export interface DailyRhythmBlock {
  timeOfDay: TimeOfDay
  label: string
  timeRange: string
  tasks: { id: string; description: string; completed: boolean }[]
}
