import type {
  DealerProfile, StoreGrade, StoreGradeThresholds, DealerKPI,
  MarketSegment, Competitor, MarketShareZip,
  VehiclePricing, RepricingRule,
  ReconVehicle, ReconStageStats, ReconStage,
  HoldingCostInputs, HoldingCostResult, BurnBucket,
  LotWalk, WalkComplianceData,
  MarketingChannel, SalesChannel, BDCMetrics,
  PackStructure, ProfitabilitySnapshot, HealthMetric,
  ManagerScorecard, AccountabilityTier, AccountabilityChecklist, LeadershipMetric, TeamMember,
  UrgentAction, DailyRhythmBlock,
} from "@/services/spyne-max/spyne-max.types"

// ─── Dealer Profile (100-unit baseline store) ───

export const mockDealerProfile: DealerProfile = {
  monthlyRetailUnits: 100,
  avgInventoryOnHand: 133,
  avgFrontGross: 1500,
  avgBackGross: 2000,
  totalPVR: 3500,
  netToGross: 30,
  returnOnSales: 4.5,
  holdingCostPerDay: 46.44,
  avgReconDays: 2.8,
  financePenetration: 72,
  serviceContractPenetration: 47,
  turnRate: 1.8,
  totalMonthlyGross: 350000,
  monthlyNetProfit: 105000,
  salesRevenue: 2330000,
  packPerUnit: 550,
}

// ─── Store Grade Thresholds (page 101) ───

export const STORE_GRADE_THRESHOLDS: StoreGradeThresholds[] = [
  { grade: "elite", label: "Elite Store", totalPVR: 4000, netToGross: 35, returnOnSales: 5.5, description: "Full process mastery" },
  { grade: "strong", label: "Strong Store", totalPVR: 3500, netToGross: 30, returnOnSales: 4.5, description: "Balanced, profitable" },
  { grade: "average", label: "Average Store", totalPVR: 2750, netToGross: 25, returnOnSales: 3.5, description: "Missing structure" },
  { grade: "weak", label: "Weak Store", totalPVR: 2000, netToGross: 20, returnOnSales: 3.0, description: "Reactive, inconsistent" },
]

export function getStoreGrade(pvr: number, n2g: number, ros: number): StoreGrade {
  if (pvr >= 4000 && n2g >= 35 && ros >= 5.5) return "elite"
  if (pvr >= 3500 && n2g >= 30 && ros >= 4.5) return "strong"
  if (pvr >= 2500 && n2g >= 25 && ros >= 3.5) return "average"
  return "weak"
}

// ─── KPIs (Benchmarks Quick Sheet, pages 3-5) ───

export const mockKPIs: DealerKPI[] = [
  {
    id: "units-mtd", name: "Units Sold MTD", value: 78, target: 100,
    formula: "Total retail units delivered this month",
    unit: "units", status: "below", trend: [92, 88, 101, 95, 103, 78],
    category: "volume",
  },
  {
    id: "turn-rate", name: "Turn Rate", value: 1.8, target: 1.8,
    targetRange: [1.6, 2.0],
    formula: "Units Sold ÷ Avg Inventory",
    unit: "x", status: "at", trend: [1.5, 1.6, 1.7, 1.8, 1.9, 1.8],
    category: "volume",
  },
  {
    id: "total-pvr", name: "Total PVR", value: 3500, target: 3500,
    formula: "Combined Gross ÷ Retail Units (Front + Back)",
    unit: "$", status: "at", trend: [3200, 3350, 3400, 3500, 3450, 3500],
    category: "gross",
  },
  {
    id: "net-to-gross", name: "Net-to-Gross", value: 30, target: 30,
    formula: "(Net Profit ÷ Total Gross) × 100",
    unit: "%", status: "at", trend: [26, 27, 28, 29, 30, 30],
    category: "efficiency",
  },
  {
    id: "holding-cost", name: "Holding Cost/Day", value: 46.44, target: 45,
    targetRange: [40, 50],
    formula: "Fixed Used Expense ÷ (Avg Inventory × Days Open)",
    unit: "$/day", status: "at", trend: [48, 47, 46, 47, 46, 46.44],
    category: "operational",
  },
  {
    id: "days-to-frontline", name: "Days to Frontline", value: 2.8, target: 3,
    formula: "Recon + Photo + Merchandising Days",
    unit: "days", status: "above", trend: [4.2, 3.8, 3.5, 3.1, 2.9, 2.8],
    category: "operational",
  },
  {
    id: "aged-45-plus", name: "Aged 45+ Units", value: 8, target: 10,
    formula: "(Aged Units ÷ Total Inventory) × 100",
    unit: "%", status: "above", trend: [14, 12, 11, 10, 9, 8],
    category: "aging",
  },
  {
    id: "finance-penetration", name: "Finance Penetration", value: 72, target: 72.5,
    targetRange: [70, 75],
    formula: "(Financed Deals ÷ Total Retail) × 100",
    unit: "%", status: "at", trend: [65, 68, 70, 71, 72, 72],
    category: "finance",
  },
  {
    id: "front-end-gross", name: "Front-End (After Pack)", value: 1500, target: 1500,
    formula: "Front Gross - Pack",
    unit: "$", status: "at", trend: [1350, 1400, 1450, 1480, 1500, 1500],
    category: "gross",
  },
  {
    id: "back-end-pvr", name: "Back-End PVR", value: 2000, target: 2000,
    formula: "Back-End Gross ÷ Retail Units",
    unit: "$", status: "at", trend: [1700, 1800, 1850, 1900, 1950, 2000],
    category: "gross",
  },
  {
    id: "return-on-sales", name: "Return on Sales", value: 4.5, target: 4.5,
    formula: "(Net Profit ÷ Sales Revenue) × 100",
    unit: "%", status: "at", trend: [3.8, 4.0, 4.2, 4.3, 4.4, 4.5],
    category: "efficiency",
  },
  {
    id: "recon-time", name: "Recon Time", value: 2.8, target: 3,
    formula: "Avg days in reconditioning",
    unit: "days", status: "above", trend: [4.5, 4.0, 3.5, 3.2, 3.0, 2.8],
    category: "operational",
  },
  {
    id: "service-contract", name: "Service Contract Penetration", value: 47, target: 47.5,
    targetRange: [45, 50],
    formula: "(Contracts ÷ Units Sold) × 100",
    unit: "%", status: "at", trend: [40, 42, 44, 45, 46, 47],
    category: "finance",
  },
  {
    id: "cost-to-market", name: "Avg Cost-to-Market", value: 96.1, target: 98,
    targetRange: [97, 99],
    formula: "(Your Price ÷ Market Avg Price) × 100",
    unit: "%", status: "below", trend: [95, 95.5, 96, 96, 96.1, 96.1],
    category: "operational",
  },
  {
    id: "market-share", name: "Market Share", value: 12.4, target: 13,
    formula: "(Your Units Sold ÷ Total Market Units) × 100",
    unit: "%", status: "below", trend: [10.8, 11.2, 11.5, 11.9, 12.1, 12.4],
    category: "volume",
  },
]

// ─── Market Intelligence ───

export const mockMarketSegments: MarketSegment[] = [
  { segment: "SUV < $30k", marketVolume: 420, yourVolume: 52, marketShare: 12.4, avgPrice: 26800, yourDaySupply: 29, marketDaySupply: 45, gap: 15, gapDollars: 30000 },
  { segment: "Truck $30-45k", marketVolume: 310, yourVolume: 18, marketShare: 5.8, avgPrice: 37400, yourDaySupply: 41, marketDaySupply: 38, gap: 25, gapDollars: 50000 },
  { segment: "Sedan < $20k", marketVolume: 280, yourVolume: 35, marketShare: 12.5, avgPrice: 17200, yourDaySupply: 22, marketDaySupply: 30, gap: -3, gapDollars: 0 },
  { segment: "Crossover $25-40k", marketVolume: 350, yourVolume: 28, marketShare: 8.0, avgPrice: 31500, yourDaySupply: 35, marketDaySupply: 42, gap: 18, gapDollars: 36000 },
  { segment: "Luxury $40k+", marketVolume: 180, yourVolume: 12, marketShare: 6.7, avgPrice: 48900, yourDaySupply: 52, marketDaySupply: 55, gap: 5, gapDollars: 15000 },
  { segment: "Economy < $15k", marketVolume: 260, yourVolume: 22, marketShare: 8.5, avgPrice: 12400, yourDaySupply: 18, marketDaySupply: 25, gap: 8, gapDollars: 16000 },
]

export const mockCompetitors: Competitor[] = [
  { name: "Metro Auto Group", estimatedVolume: 180, avgPrice: 28500, daySupply: 42, bounceRate: 58, topSegments: ["SUV < $30k", "Truck $30-45k"] },
  { name: "Valley Ford", estimatedVolume: 150, avgPrice: 32100, daySupply: 38, bounceRate: 45, topSegments: ["Truck $30-45k", "SUV < $30k"] },
  { name: "City Toyota", estimatedVolume: 140, avgPrice: 27800, daySupply: 35, bounceRate: 42, topSegments: ["Sedan < $20k", "Crossover $25-40k"] },
  { name: "Premier Honda", estimatedVolume: 120, avgPrice: 25600, daySupply: 40, bounceRate: 52, topSegments: ["Sedan < $20k", "Crossover $25-40k"] },
  { name: "Sunrise Chevrolet", estimatedVolume: 110, avgPrice: 29900, daySupply: 44, bounceRate: 62, topSegments: ["Truck $30-45k", "SUV < $30k"] },
  { name: "Lakeside Motors", estimatedVolume: 95, avgPrice: 24200, daySupply: 48, bounceRate: 55, topSegments: ["Economy < $15k", "Sedan < $20k"] },
  { name: "CarMax (Local)", estimatedVolume: 200, avgPrice: 26700, daySupply: 30, bounceRate: 38, topSegments: ["SUV < $30k", "Sedan < $20k"] },
  { name: "Heritage Nissan", estimatedVolume: 85, avgPrice: 23800, daySupply: 46, bounceRate: 60, topSegments: ["Sedan < $20k", "Economy < $15k"] },
  { name: "Crown Auto Mall", estimatedVolume: 130, avgPrice: 34500, daySupply: 36, bounceRate: 44, topSegments: ["Luxury $40k+", "Crossover $25-40k"] },
  { name: "AutoNation (Local)", estimatedVolume: 165, avgPrice: 30200, daySupply: 32, bounceRate: 40, topSegments: ["SUV < $30k", "Crossover $25-40k"] },
]

export const mockMarketShareByZip: MarketShareZip[] = [
  { zip: "78701", area: "Downtown", marketVolume: 210, yourSales: 28, penetration: 13.3, topCompetitors: ["CarMax", "Metro Auto Group", "City Toyota"], growthTarget: 14.3 },
  { zip: "78702", area: "East Side", marketVolume: 185, yourSales: 22, penetration: 11.9, topCompetitors: ["Premier Honda", "Lakeside Motors", "Heritage Nissan"], growthTarget: 12.9 },
  { zip: "78704", area: "South Lamar", marketVolume: 240, yourSales: 32, penetration: 13.3, topCompetitors: ["Valley Ford", "AutoNation", "Crown Auto Mall"], growthTarget: 14.3 },
  { zip: "78745", area: "South Austin", marketVolume: 195, yourSales: 18, penetration: 9.2, topCompetitors: ["Sunrise Chevrolet", "Metro Auto Group", "CarMax"], growthTarget: 10.2 },
  { zip: "78750", area: "NW Hills", marketVolume: 160, yourSales: 15, penetration: 9.4, topCompetitors: ["Crown Auto Mall", "AutoNation", "Valley Ford"], growthTarget: 10.4 },
  { zip: "78753", area: "North Austin", marketVolume: 220, yourSales: 25, penetration: 11.4, topCompetitors: ["City Toyota", "CarMax", "Premier Honda"], growthTarget: 12.4 },
  { zip: "78759", area: "Anderson Mill", marketVolume: 175, yourSales: 20, penetration: 11.4, topCompetitors: ["Metro Auto Group", "Heritage Nissan", "Sunrise Chevrolet"], growthTarget: 12.4 },
  { zip: "78660", area: "Pflugerville", marketVolume: 145, yourSales: 12, penetration: 8.3, topCompetitors: ["Valley Ford", "Lakeside Motors", "AutoNation"], growthTarget: 9.3 },
]

// ─── Pricing ───

export const mockVehiclePricing: VehiclePricing[] = [
  { vin: "1FTEW1EP5MFA00001", year: 2021, make: "Ford", model: "F-150", trim: "XLT", costToMarket: 96.1, marketRank: 4, totalComparables: 18, daysAtCurrentPrice: 8, daysInStock: 8, acquisitionCost: 25000, currentAsk: 28500, marketAvg: 29650, targetGross: 3500, repriceHistory: [], stage: "fresh" },
  { vin: "5YJSA1DN2DFP00002", year: 2020, make: "Toyota", model: "Camry", trim: "SE", costToMarket: 98.2, marketRank: 3, totalComparables: 22, daysAtCurrentPrice: 12, daysInStock: 12, acquisitionCost: 18500, currentAsk: 21900, marketAvg: 22300, targetGross: 3400, repriceHistory: [], stage: "fresh" },
  { vin: "1GCUYDED1LZ100003", year: 2019, make: "Chevrolet", model: "Silverado", trim: "LT", costToMarket: 97.5, marketRank: 6, totalComparables: 15, daysAtCurrentPrice: 18, daysInStock: 22, acquisitionCost: 28000, currentAsk: 31500, marketAvg: 32300, targetGross: 3500, repriceHistory: [{ date: "2026-02-20", oldPrice: 32500, newPrice: 31500, reason: "Day 18 reprice" }], stage: "watch" },
  { vin: "2T1BURHE5JC100004", year: 2022, make: "Honda", model: "CR-V", trim: "EX-L", costToMarket: 95.8, marketRank: 8, totalComparables: 20, daysAtCurrentPrice: 14, daysInStock: 28, acquisitionCost: 24000, currentAsk: 27200, marketAvg: 28400, targetGross: 3200, repriceHistory: [{ date: "2026-02-10", oldPrice: 28500, newPrice: 27200, reason: "Day 20 reprice" }], stage: "watch" },
  { vin: "WBAPH5C55BA100005", year: 2020, make: "BMW", model: "3 Series", trim: "330i", costToMarket: 101.2, marketRank: 14, totalComparables: 12, daysAtCurrentPrice: 25, daysInStock: 35, acquisitionCost: 27500, currentAsk: 33800, marketAvg: 33400, targetGross: 6300, repriceHistory: [], stage: "risk" },
  { vin: "1N4BL4BV5LC100006", year: 2019, make: "Nissan", model: "Altima", trim: "2.5 SV", costToMarket: 99.1, marketRank: 5, totalComparables: 25, daysAtCurrentPrice: 10, daysInStock: 38, acquisitionCost: 15200, currentAsk: 18600, marketAvg: 18770, targetGross: 3400, repriceHistory: [{ date: "2026-02-01", oldPrice: 19500, newPrice: 18600, reason: "Day 28 reprice" }], stage: "risk" },
  { vin: "3GNAXUEV9NL100007", year: 2018, make: "Chevrolet", model: "Equinox", trim: "LT", costToMarket: 94.5, marketRank: 11, totalComparables: 16, daysAtCurrentPrice: 15, daysInStock: 48, acquisitionCost: 14800, currentAsk: 18200, marketAvg: 19260, targetGross: 3400, repriceHistory: [{ date: "2026-01-25", oldPrice: 19800, newPrice: 18900, reason: "Day 30 reprice" }, { date: "2026-02-05", oldPrice: 18900, newPrice: 18200, reason: "Day 40 aggressive" }], stage: "critical" },
  { vin: "JM1NDAL75N0100008", year: 2021, make: "Mazda", model: "CX-5", trim: "Touring", costToMarket: 97.8, marketRank: 3, totalComparables: 14, daysAtCurrentPrice: 5, daysInStock: 5, acquisitionCost: 22000, currentAsk: 25800, marketAvg: 26380, targetGross: 3800, repriceHistory: [], stage: "fresh" },
  { vin: "5NPE34AF9GH100009", year: 2020, make: "Hyundai", model: "Sonata", trim: "SEL", costToMarket: 96.8, marketRank: 7, totalComparables: 19, daysAtCurrentPrice: 20, daysInStock: 42, acquisitionCost: 16500, currentAsk: 19200, marketAvg: 19840, targetGross: 2700, repriceHistory: [{ date: "2026-01-28", oldPrice: 20500, newPrice: 19800, reason: "Day 25 reprice" }, { date: "2026-02-10", oldPrice: 19800, newPrice: 19200, reason: "Day 35 aggressive" }], stage: "risk" },
  { vin: "KNDJP3A54J7100010", year: 2019, make: "Kia", model: "Sportage", trim: "LX", costToMarket: 93.2, marketRank: 15, totalComparables: 17, daysAtCurrentPrice: 12, daysInStock: 55, acquisitionCost: 14000, currentAsk: 17500, marketAvg: 18780, targetGross: 3500, repriceHistory: [{ date: "2026-01-15", oldPrice: 19200, newPrice: 18400, reason: "Day 30 reprice" }, { date: "2026-01-28", oldPrice: 18400, newPrice: 17500, reason: "Day 45 fire-sale" }], stage: "critical" },
  { vin: "WA1LFAFP1EA100011", year: 2022, make: "Audi", model: "Q5", trim: "Premium", costToMarket: 98.5, marketRank: 2, totalComparables: 10, daysAtCurrentPrice: 6, daysInStock: 6, acquisitionCost: 32000, currentAsk: 37500, marketAvg: 38070, targetGross: 5500, repriceHistory: [], stage: "fresh" },
  { vin: "4T1B11HK5KU100012", year: 2020, make: "Toyota", model: "RAV4", trim: "XLE", costToMarket: 97.9, marketRank: 4, totalComparables: 21, daysAtCurrentPrice: 15, daysInStock: 19, acquisitionCost: 23500, currentAsk: 27200, marketAvg: 27790, targetGross: 3700, repriceHistory: [], stage: "watch" },
]

export const REPRICING_RULES: RepricingRule[] = [
  { dayRange: [1, 15], action: "hold", label: "Hold Firm", description: "Price strong. Stay in top 5 within 25 miles. Never below 98% of market avg." },
  { dayRange: [16, 30], action: "first-reprice", label: "First Reprice", description: "Adjust 1-2% if not in top 5. Check VDP trend. Stay above 97% of market." },
  { dayRange: [31, 45], action: "aggressive", label: "Aggressive", description: "Reprice 2-3% below market. Feature in email blast. Consider trade-walk." },
  { dayRange: [46, 999], action: "wholesale-decision", label: "Wholesale Decision", description: "Calculate minimum gross. If negative ROI/day, send to auction or fire-sale online." },
]

// ─── Recon Pipeline ───

export const mockReconVehicles: ReconVehicle[] = [
  { vin: "RVIN001", year: 2021, make: "Ford", model: "Escape", currentStage: "inspection", daysInRecon: 0.5, daysInCurrentStage: 0.5, slaTarget: 3, slaBreach: false, reconCost: 0, estimatedCost: 1200, doorRate: 125, internalBilled: 0, doorRateCompliance: 0, assignedTo: "Mike T." },
  { vin: "RVIN002", year: 2020, make: "Toyota", model: "Tacoma", currentStage: "mechanical", daysInRecon: 1.5, daysInCurrentStage: 1, slaTarget: 3, slaBreach: false, reconCost: 450, estimatedCost: 1100, doorRate: 125, internalBilled: 100, doorRateCompliance: 80, assignedTo: "Carlos R." },
  { vin: "RVIN003", year: 2019, make: "Honda", model: "Accord", currentStage: "mechanical", daysInRecon: 2, daysInCurrentStage: 1.5, slaTarget: 3, slaBreach: false, reconCost: 680, estimatedCost: 950, doorRate: 125, internalBilled: 110, doorRateCompliance: 88, assignedTo: "Carlos R." },
  { vin: "RVIN004", year: 2022, make: "Hyundai", model: "Tucson", currentStage: "body", daysInRecon: 2.5, daysInCurrentStage: 0.5, slaTarget: 3, slaBreach: false, reconCost: 800, estimatedCost: 1050, doorRate: 125, internalBilled: 100, doorRateCompliance: 80, assignedTo: "Jake S." },
  { vin: "RVIN005", year: 2020, make: "Chevrolet", model: "Malibu", currentStage: "detail", daysInRecon: 3, daysInCurrentStage: 0.5, slaTarget: 3, slaBreach: false, reconCost: 920, estimatedCost: 980, doorRate: 125, internalBilled: 115, doorRateCompliance: 92, assignedTo: "Anna K." },
  { vin: "RVIN006", year: 2021, make: "Nissan", model: "Rogue", currentStage: "detail", daysInRecon: 3.5, daysInCurrentStage: 1, slaTarget: 3, slaBreach: true, reconCost: 1050, estimatedCost: 1100, doorRate: 125, internalBilled: 105, doorRateCompliance: 84, assignedTo: "Anna K." },
  { vin: "RVIN007", year: 2019, make: "Kia", model: "Sorento", currentStage: "photo", daysInRecon: 2.8, daysInCurrentStage: 0.3, slaTarget: 3, slaBreach: false, reconCost: 1180, estimatedCost: 1200, doorRate: 125, internalBilled: 120, doorRateCompliance: 96, assignedTo: "Photo Team" },
  { vin: "RVIN008", year: 2020, make: "Subaru", model: "Outback", currentStage: "photo", daysInRecon: 4, daysInCurrentStage: 0.5, slaTarget: 3, slaBreach: true, reconCost: 1350, estimatedCost: 1400, doorRate: 125, internalBilled: 108, doorRateCompliance: 86, assignedTo: "Photo Team" },
  { vin: "RVIN009", year: 2022, make: "Toyota", model: "Corolla", currentStage: "online", daysInRecon: 2.5, daysInCurrentStage: 0.2, slaTarget: 3, slaBreach: false, reconCost: 850, estimatedCost: 850, doorRate: 125, internalBilled: 122, doorRateCompliance: 98, assignedTo: "Online Team" },
  { vin: "RVIN010", year: 2021, make: "Honda", model: "Civic", currentStage: "inspection", daysInRecon: 0.2, daysInCurrentStage: 0.2, slaTarget: 3, slaBreach: false, reconCost: 0, estimatedCost: 900, doorRate: 125, internalBilled: 0, doorRateCompliance: 0, assignedTo: "Mike T." },
]

const RECON_STAGE_LABELS: Record<ReconStage, string> = {
  inspection: "Inspection", mechanical: "Mechanical", body: "Body",
  detail: "Detail", photo: "Photo", online: "Online",
}

export function getReconStageStats(): ReconStageStats[] {
  const stages: ReconStage[] = ["inspection", "mechanical", "body", "detail", "photo", "online"]
  return stages.map(stage => {
    const vehicles = mockReconVehicles.filter(v => v.currentStage === stage)
    return {
      stage,
      label: RECON_STAGE_LABELS[stage],
      count: vehicles.length,
      avgDays: vehicles.length ? vehicles.reduce((s, v) => s + v.daysInCurrentStage, 0) / vehicles.length : 0,
      breachCount: vehicles.filter(v => v.slaBreach).length,
    }
  })
}

// ─── Holding Cost ───

export const mockHoldingCostInputs: HoldingCostInputs = {
  ytdTotalUsedExpense: 4800000,
  ytdVariableExpense: 2800000,
  monthsElapsed: 12,
  avgMonthlySales: 100,
  daysOpenPerMonth: 27,
}

export function calculateHoldingCost(inputs: HoldingCostInputs): HoldingCostResult {
  const fixedCost = inputs.ytdTotalUsedExpense - inputs.ytdVariableExpense
  const avgFixedPerMonth = fixedCost / inputs.monthsElapsed
  const avgUnitsInStock = inputs.avgMonthlySales * 1.33
  const perUnitPerMonth = avgFixedPerMonth / avgUnitsInStock
  const holdingCostPerDay = perUnitPerMonth / inputs.daysOpenPerMonth
  return { fixedCost, avgFixedPerMonth, avgUnitsInStock, perUnitPerMonth, holdingCostPerDay }
}

export const mockBurnBuckets: BurnBucket[] = [
  { stage: "fresh", label: "Fresh (0-15 days)", dayRange: "0-15", count: 52, totalBurn: 18200, avgDaysInBucket: 7.5 },
  { stage: "watch", label: "Watch (16-30 days)", dayRange: "16-30", count: 38, totalBurn: 39900, avgDaysInBucket: 22.5 },
  { stage: "risk", label: "Risk (31-50 days)", dayRange: "31-50", count: 28, totalBurn: 52080, avgDaysInBucket: 40 },
  { stage: "critical", label: "Critical (51+ days)", dayRange: "51+", count: 15, totalBurn: 45414, avgDaysInBucket: 65 },
]

// ─── Lot Walks ───

const FIFTEEN_DAY_CHECKLIST = [
  { id: "condition-clean", category: "Physical Condition", description: "Is it clean? Tires dressed, windows spotless?" },
  { id: "condition-ready", category: "Physical Condition", description: "Does it look ready to sell today?" },
  { id: "photos-count", category: "Photos & Merchandising", description: "30+ clear, high-res photos uploaded?" },
  { id: "photos-description", category: "Photos & Merchandising", description: "Price, description, and features accurate online?" },
  { id: "photos-first3", category: "Photos & Merchandising", description: "Are the first 3 photos strong enough to get clicks?" },
  { id: "pricing-market", category: "Pricing Review", description: "Still within 98-100% of market average?" },
  { id: "pricing-vdp", category: "Pricing Review", description: "Are VDPs trending up or down this week?" },
  { id: "recon-complete", category: "Recon Confirmation", description: "Verify it's fully through service and detail" },
  { id: "recon-live", category: "Recon Confirmation", description: "Check for 'completed but not live' cars" },
  { id: "desk-visibility", category: "Desk Visibility", description: "Does every manager know this unit and what story to tell?" },
]

const FORTY_FIVE_DAY_CHECKLIST = [
  { id: "roi-per-day", category: "ROI/Day Review", description: "Front Gross ÷ Days in Stock — still positive?" },
  { id: "market-rank", category: "Market Position", description: "Still competitive in top 10 within 25 miles?" },
  { id: "minimum-gross", category: "Floor Decision", description: "What's the minimum acceptable gross before wholesale?" },
  { id: "action-reprice", category: "Action", description: "Reprice 2-3% below market + feature in email blast?" },
  { id: "action-auction", category: "Action", description: "Move to auction this week?" },
  { id: "action-tradewalk", category: "Action", description: "Offer as trade-walk to incoming customers?" },
  { id: "action-firesale", category: "Action", description: "Fire-sale online with aggressive pricing?" },
]

export const mockWalks: LotWalk[] = [
  { vin: "1GCUYDED1LZ100003", year: 2019, make: "Chevrolet", model: "Silverado", walkType: "15-day", dueDate: "2026-02-25", status: "completed", daysInStock: 22, checklist: FIFTEEN_DAY_CHECKLIST.map(c => ({ ...c, completed: true })), completedDate: "2026-02-24", roiPerDay: 159 },
  { vin: "2T1BURHE5JC100004", year: 2022, make: "Honda", model: "CR-V", walkType: "15-day", dueDate: "2026-02-22", status: "completed", daysInStock: 28, checklist: FIFTEEN_DAY_CHECKLIST.map(c => ({ ...c, completed: true })), completedDate: "2026-02-22", roiPerDay: 114 },
  { vin: "WBAPH5C55BA100005", year: 2020, make: "BMW", model: "3 Series", walkType: "15-day", dueDate: "2026-02-18", status: "completed", daysInStock: 35, checklist: FIFTEEN_DAY_CHECKLIST.map((c, i) => ({ ...c, completed: i < 8 })), completedDate: "2026-02-19", roiPerDay: 180 },
  { vin: "WBAPH5C55BA100005", year: 2020, make: "BMW", model: "3 Series", walkType: "45-day", dueDate: "2026-03-15", status: "upcoming", daysInStock: 35, checklist: FORTY_FIVE_DAY_CHECKLIST.map(c => ({ ...c, completed: false })), roiPerDay: 180 },
  { vin: "1N4BL4BV5LC100006", year: 2019, make: "Nissan", model: "Altima", walkType: "45-day", dueDate: "2026-03-12", status: "upcoming", daysInStock: 38, checklist: FORTY_FIVE_DAY_CHECKLIST.map(c => ({ ...c, completed: false })), roiPerDay: 89 },
  { vin: "3GNAXUEV9NL100007", year: 2018, make: "Chevrolet", model: "Equinox", walkType: "45-day", dueDate: "2026-03-05", status: "due-today", daysInStock: 48, checklist: FORTY_FIVE_DAY_CHECKLIST.map(c => ({ ...c, completed: false })), roiPerDay: 71 },
  { vin: "5NPE34AF9GH100009", year: 2020, make: "Hyundai", model: "Sonata", walkType: "45-day", dueDate: "2026-03-08", status: "upcoming", daysInStock: 42, checklist: FORTY_FIVE_DAY_CHECKLIST.map(c => ({ ...c, completed: false })), roiPerDay: 64 },
  { vin: "KNDJP3A54J7100010", year: 2019, make: "Kia", model: "Sportage", walkType: "45-day", dueDate: "2026-02-28", status: "overdue", daysInStock: 55, checklist: FORTY_FIVE_DAY_CHECKLIST.map(c => ({ ...c, completed: false })), roiPerDay: 64 },
  { vin: "4T1B11HK5KU100012", year: 2020, make: "Toyota", model: "RAV4", walkType: "15-day", dueDate: "2026-03-12", status: "upcoming", daysInStock: 19, checklist: FIFTEEN_DAY_CHECKLIST.map(c => ({ ...c, completed: false })), roiPerDay: 195 },
  { vin: "JM1NDAL75N0100008", year: 2021, make: "Mazda", model: "CX-5", walkType: "15-day", dueDate: "2026-03-18", status: "upcoming", daysInStock: 5, checklist: FIFTEEN_DAY_CHECKLIST.map(c => ({ ...c, completed: false })), roiPerDay: 760 },
]

export const mockWalkCompliance: WalkComplianceData[] = [
  { week: "Feb 3", fifteenDayTotal: 8, fifteenDayCompleted: 6, fortyFiveDayTotal: 3, fortyFiveDayCompleted: 2 },
  { week: "Feb 10", fifteenDayTotal: 7, fifteenDayCompleted: 7, fortyFiveDayTotal: 4, fortyFiveDayCompleted: 3 },
  { week: "Feb 17", fifteenDayTotal: 9, fifteenDayCompleted: 8, fortyFiveDayTotal: 2, fortyFiveDayCompleted: 2 },
  { week: "Feb 24", fifteenDayTotal: 6, fifteenDayCompleted: 6, fortyFiveDayTotal: 5, fortyFiveDayCompleted: 4 },
  { week: "Mar 3", fifteenDayTotal: 8, fifteenDayCompleted: 5, fortyFiveDayTotal: 3, fortyFiveDayCompleted: 1 },
  { week: "Mar 10", fifteenDayTotal: 7, fifteenDayCompleted: 3, fortyFiveDayTotal: 4, fortyFiveDayCompleted: 0 },
]

// ─── Marketing & Leads (page 17) ───

export const mockMarketingChannels: MarketingChannel[] = [
  { source: "Google Ads", spend: 4200, leads: 187, appointments: 48, unitsSold: 19, costPerSale: 221, costPerLead: 22.5, conversionRate: 10.2 },
  { source: "Meta Ads", spend: 1800, leads: 142, appointments: 27, unitsSold: 9, costPerSale: 200, costPerLead: 12.7, conversionRate: 6.3 },
  { source: "AutoTrader / Cars.com", spend: 3500, leads: 92, appointments: 22, unitsSold: 8, costPerSale: 437, costPerLead: 38.0, conversionRate: 8.7 },
  { source: "CRM / Email / SMS", spend: 0, leads: 310, appointments: 67, unitsSold: 31, costPerSale: 0, costPerLead: 0, conversionRate: 10.0 },
]

export const mockSalesChannels: SalesChannel[] = [
  { channel: "internet", label: "Internet Leads", conversionRate: 10, targetRange: [8, 12], primaryWeakness: "Slow response, weak engagement", processSteps: ["Auto-confirm within 60 seconds", "Match to 3 vehicles within 5 minutes", "BDC call within 5 minutes", "Offer specific appointment time", "Follow-up cadence: Day 1, 3, 5, 7, 14"] },
  { channel: "phone", label: "Phone Calls", conversionRate: 30, targetRange: [25, 35], primaryWeakness: "Poor qualification, no TO to manager", processSteps: ["Qualify: budget, timeline, trade?", "Set firm appointment with commitment", "TO to manager if caller hesitates", "Confirm appointment via text", "Follow up if no-show within 1 hour"] },
  { channel: "walk-in", label: "Walk-Ins", conversionRate: 40, targetRange: [35, 45], primaryWeakness: "Skipping steps, lazy TO", processSteps: ["Greet within 30 seconds", "Needs assessment (5 questions)", "Present 2-3 vehicles", "Test drive every customer", "Desk with manager — every deal gets a TO"] },
]

export const mockBDCMetrics: BDCMetrics = {
  appointmentShowRate: 68,
  showRateTarget: 65,
  avgResponseTime: 4.2,
  responseTimeTarget: 5,
  contactRate: 72,
  totalAppointmentsSet: 156,
  totalShows: 106,
}

// ─── Profitability ───

export const mockPackStructure: PackStructure = {
  advertising: 250,
  lotExpense: 100,
  salesSupplies: 50,
  reconVariance: 150,
  totalPack: 550,
}

export function calculateProfitability(units: number, frontGross: number, backGross: number, n2gPercent: number, salesRevenue: number): ProfitabilitySnapshot {
  const totalFrontGross = units * frontGross
  const totalBackGross = units * backGross
  const combinedGross = totalFrontGross + totalBackGross
  const netProfit = combinedGross * (n2gPercent / 100)
  const returnOnSales = (netProfit / salesRevenue) * 100
  return { units, avgFrontGross: frontGross, avgBackGross: backGross, totalFrontGross, totalBackGross, combinedGross, netToGross: n2gPercent, netProfit, salesRevenue, returnOnSales }
}

export const mockFrontEndHealth: HealthMetric[] = [
  { name: "Cost-to-Market %", formula: "(Your Price ÷ Market Avg) × 100", current: 96.1, target: "97-99%", unit: "%", status: "below" },
  { name: "Days to Frontline", formula: "Recon + Merchandising Days", current: 2.8, target: "≤ 3", unit: "days", status: "above" },
  { name: "Avg Days in Stock", formula: "Sum of Days ÷ Units", current: 28, target: "< 35", unit: "days", status: "above" },
  { name: "Turn Rate", formula: "Units Sold ÷ Avg Inventory", current: 1.8, target: "1.6-2.0×", unit: "x", status: "at" },
  { name: "Holding Cost/Day", formula: "Steps 1-5 Formula (Ch. 6)", current: 46.44, target: "$40-$50", unit: "$/day", status: "at" },
]

export const mockBackEndHealth: HealthMetric[] = [
  { name: "Finance Penetration", formula: "(Financed ÷ Total Sold) × 100", current: 72, target: "70-75%", unit: "%", status: "at" },
  { name: "Back-End PVR", formula: "Back-End Gross ÷ Retail Units", current: 2000, target: "$2,000+", unit: "$", status: "at" },
  { name: "Service Contract Penetration", formula: "(Contracts ÷ Units Sold) × 100", current: 47, target: "45-50%", unit: "%", status: "at" },
  { name: "Total PVR (Front + Back)", formula: "Combined Gross ÷ Units", current: 3500, target: "$3,500+", unit: "$", status: "at" },
  { name: "Chargeback Rate", formula: "(Chargebacks ÷ Contracts) × 100", current: 3.2, target: "< 5%", unit: "%", status: "above" },
]

export const mockExpenseControl: HealthMetric[] = [
  { name: "Holding Cost per Day", formula: "Total Fixed ÷ (Avg Inventory × Days)", current: 46.44, target: "$40-$50", unit: "$/day", status: "at" },
  { name: "Recon Cost per Unit", formula: "Total Recon ÷ Retail Units", current: 1180, target: "$1,000-$1,400", unit: "$", status: "at" },
  { name: "Internal Rate Compliance", formula: "(Internal Billed ÷ Door Rate) × 100", current: 88, target: "100%", unit: "%", status: "below" },
  { name: "Ad Cost per Sale", formula: "Total Ad Spend ÷ Units Sold", current: 285, target: "$250-$400", unit: "$", status: "at" },
  { name: "Policy Expense %", formula: "Policy ÷ Front Gross", current: 7.5, target: "< 10%", unit: "%", status: "above" },
]

// ─── Team & Accountability ───

export const mockManagerScorecards: ManagerScorecard[] = [
  { role: "used-car-manager", roleLabel: "Used Car Manager", name: "David Chen", metrics: [{ name: "Turn Rate", current: 1.8, target: 1.8, unit: "x", status: "at" }, { name: "Net-to-Gross", current: 30, target: 30, unit: "%", status: "at" }] },
  { role: "finance-director", roleLabel: "Finance Director", name: "Sarah Mitchell", metrics: [{ name: "Back-End PVR", current: 2000, target: 2000, unit: "$", status: "at" }, { name: "Finance Penetration", current: 72, target: 72.5, unit: "%", status: "at" }] },
  { role: "service-recon", roleLabel: "Service / Recon", name: "Mike Torres", metrics: [{ name: "Time-to-Frontline", current: 2.8, target: 3, unit: "days", status: "above" }] },
  { role: "bdc-manager", roleLabel: "BDC Manager", name: "Lisa Park", metrics: [{ name: "Appointment Show Rate", current: 68, target: 65, unit: "%", status: "above" }] },
  { role: "sales-manager", roleLabel: "Sales Manager", name: "James Rivera", metrics: [{ name: "TO %", current: 88, target: 90, unit: "%", status: "below" }, { name: "Close %", current: 42, target: 42.5, unit: "%", status: "at" }] },
]

export const mockAccountabilityTiers: AccountabilityTier[] = [
  { level: "store", label: "Store-Level", focus: "Profit, Volume, CSI", metrics: ["100 used/month", "4.5% ROS", "30% Net-to-Gross"] },
  { level: "manager", label: "Manager-Level", focus: "Process Execution", metrics: ["Appointments booked", "Time-to-Frontline", "Aged % under 10%"] },
  { level: "sales-bdc", label: "Sales / BDC-Level", focus: "Daily Activity", metrics: ["Calls made", "Contacts reached", "Appointments set", "TOs completed"] },
]

export const mockChecklists: AccountabilityChecklist[] = [
  {
    frequency: "daily", label: "Morning Huddle", duration: "15 min",
    items: [
      { id: "d1", description: "Review yesterday's appointments, shows, and solds", completed: true },
      { id: "d2", description: "Identify pending deals and expected deliveries", completed: true },
      { id: "d3", description: "Flag hot inventory that needs immediate action", completed: false },
      { id: "d4", description: "Check internet and phone lead status", completed: false },
      { id: "d5", description: "Review recon or photo delays", completed: false },
      { id: "d6", description: "Pull price rank report on top 10 units", completed: false },
    ],
  },
  {
    frequency: "weekly", label: "Used Team Review", duration: "30 min",
    items: [
      { id: "w1", description: "Pull Market Master report and compare inventory mix", completed: false },
      { id: "w2", description: "Review BDC appointment show/close rate", completed: false },
      { id: "w3", description: "Adjust acquisition focus based on gap analysis", completed: false },
      { id: "w4", description: "Re-allocate ad budget based on cost per sale", completed: false },
      { id: "w5", description: "Review prior week: units, gross, turn, PVR, ROS", completed: false },
      { id: "w6", description: "Identify top and bottom 5 units by ROI/day", completed: false },
    ],
  },
  {
    frequency: "monthly", label: "One-on-One Reviews", duration: "45 min",
    items: [
      { id: "m1", description: "Calculate Net-to-Gross and Market Share Growth", completed: false },
      { id: "m2", description: "Walk lot and audit photos, descriptions, and pricing", completed: false },
      { id: "m3", description: "Review holding cost per day and velocity score", completed: false },
      { id: "m4", description: "Market share analysis by zip code", completed: false },
      { id: "m5", description: "Competitor ad review (Search + Meta)", completed: false },
      { id: "m6", description: "Individual manager goal review and development", completed: false },
    ],
  },
]

export const mockLeadershipMetrics: LeadershipMetric[] = [
  { name: "Team Retention", formula: "(Current ÷ Start of Year) × 100", current: 85, target: 80, unit: "%" },
  { name: "Internal Promotions", formula: "(Promoted ÷ Positions Filled) × 100", current: 55, target: 50, unit: "%" },
  { name: "Training Compliance", formula: "(Sessions Held ÷ Planned) × 100", current: 92, target: 90, unit: "%" },
]

export const mockTeamMembers: TeamMember[] = [
  { id: "tm1", name: "David Chen", role: "used-car-manager", roleLabel: "Used Car Manager", hireDate: "2022-03-15", metrics: [{ name: "Turn Rate", current: 1.8, target: 1.8, unit: "x" }, { name: "Net-to-Gross", current: 30, target: 30, unit: "%" }], trend: "up" },
  { id: "tm2", name: "Sarah Mitchell", role: "finance-director", roleLabel: "Finance Director", hireDate: "2021-08-01", metrics: [{ name: "Back-End PVR", current: 2000, target: 2000, unit: "$" }, { name: "Penetration", current: 72, target: 72.5, unit: "%" }], trend: "up" },
  { id: "tm3", name: "Mike Torres", role: "service-recon", roleLabel: "Service / Recon Manager", hireDate: "2023-01-10", metrics: [{ name: "Time-to-Frontline", current: 2.8, target: 3, unit: "days" }], trend: "up" },
  { id: "tm4", name: "Lisa Park", role: "bdc-manager", roleLabel: "BDC Manager", hireDate: "2023-06-20", metrics: [{ name: "Show Rate", current: 68, target: 65, unit: "%" }], trend: "flat" },
  { id: "tm5", name: "James Rivera", role: "sales-manager", roleLabel: "Sales Manager", hireDate: "2022-11-05", metrics: [{ name: "TO %", current: 88, target: 90, unit: "%" }, { name: "Close %", current: 42, target: 42.5, unit: "%" }], trend: "down" },
]

// ─── Urgent Actions ───

export const mockUrgentActions: UrgentAction[] = [
  { id: "u1", type: "walk", message: "2019 Kia Sportage hit Day 55 — needs 45-day walk and wholesale decision", severity: "high", actionLabel: "Start Walk", vin: "KNDJP3A54J7100010", href: "/spyne-max/walks" },
  { id: "u2", type: "recon", message: "Recon SLA breach: 2 units past 3-day target (Rogue, Outback)", severity: "high", actionLabel: "View Pipeline", href: "/spyne-max/recon" },
  { id: "u3", type: "pricing", message: "BMW 330i priced 101.2% of market — rank dropped to #14, losing VDP clicks", severity: "medium", actionLabel: "Reprice", vin: "WBAPH5C55BA100005", href: "/spyne-max/pricing" },
  { id: "u4", type: "marketing", message: "AutoTrader CPS at $437 — well above Google ($221). Consider shifting budget.", severity: "medium", actionLabel: "Review Spend", href: "/spyne-max/leads" },
  { id: "u5", type: "aging", message: "3 units approaching Day 30 — schedule 15-day walks before they age out", severity: "low", actionLabel: "Schedule Walks", href: "/spyne-max/walks" },
]

// ─── Daily Rhythm ───

export const mockDailyRhythm: DailyRhythmBlock[] = [
  {
    timeOfDay: "morning", label: "Morning", timeRange: "8:00 – 10:00 AM",
    tasks: [
      { id: "m1", description: "Review previous day's sales and gross by segment", completed: false },
      { id: "m2", description: "Check price rank on top 20 units in V-Auto", completed: false },
      { id: "m3", description: "Approve recon ROs — same-day turnaround", completed: false },
    ],
  },
  {
    timeOfDay: "midday", label: "Midday", timeRange: "10:00 AM – 2:00 PM",
    tasks: [
      { id: "md1", description: "Meet with BDC for lead updates and appointment conversion", completed: false },
      { id: "md2", description: "Approve new purchases based on live market data", completed: false },
    ],
  },
  {
    timeOfDay: "end-of-day", label: "End of Day", timeRange: "4:00 – 6:00 PM",
    tasks: [
      { id: "e1", description: "Spot-check five units online for photos and descriptions", completed: false },
      { id: "e2", description: "Review inventory aging report and flag approaching 30-day units", completed: false },
    ],
  },
]

// ─── Net-to-Gross Trend ───

export const mockNetToGrossTrend = [
  { month: "Sep", value: 26 },
  { month: "Oct", value: 27 },
  { month: "Nov", value: 28 },
  { month: "Dec", value: 29 },
  { month: "Jan", value: 30 },
  { month: "Feb", value: 30 },
]

export const mockHoldingCostTrend = [
  { month: "Sep", value: 48 },
  { month: "Oct", value: 47.5 },
  { month: "Nov", value: 47 },
  { month: "Dec", value: 46.8 },
  { month: "Jan", value: 46.5 },
  { month: "Feb", value: 46.44 },
]
