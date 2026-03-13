import type {
  LifecycleNode, CoreMetric, Threat, ThreatVehicle, Opportunity, OpportunityItem,
  InsightPreset, DemandSignal, ServiceLaneOpportunity, MarketGap, TradeInOpportunity,
  MerchandisingVehicle, LeadFunnelStage, VehicleInquiry, FollowUpOpportunity,
  ServiceBuyOpportunity, ServicePainPoint,
  LotVehicle, LotSummary, Customer, CustomerSummary, CustomerActivity,
} from "@/services/max-2/max-2.types"

// ─── Lifecycle Strip ───

export const mockLifecycle: LifecycleNode[] = [
  { stage: "sourcing", label: "Sourcing", href: "/max-2/sourcing", health: "yellow", openTasks: 3, threats: 1, opportunities: 8, summary: "8 unmet vehicle requests" },
  { stage: "recon", label: "Inspection & Recon", href: "/max-2/recon", health: "red", openTasks: 5, threats: 2, opportunities: 1, summary: "2 SLA breaches" },
  { stage: "studio", label: "Merchandising", href: "/max-2/studio", health: "yellow", openTasks: 4, threats: 3, opportunities: 2, summary: "3 stock-photo-only units" },
  { stage: "marketing", label: "Marketing", href: "/max-2/marketing", health: "green", openTasks: 2, threats: 0, opportunities: 4, summary: "2 hot-car campaigns available" },
  { stage: "sales", label: "Sales", href: "/max-2/sales", health: "yellow", openTasks: 6, threats: 1, opportunities: 4, summary: "4 urgent close opportunities" },
  { stage: "service", label: "Service", href: "/max-2/service", health: "green", openTasks: 2, threats: 0, opportunities: 2, summary: "2 buyback candidates" },
]

// ─── Core Metrics ───

export const mockCoreMetrics: CoreMetric[] = [
  { id: "units-mtd", name: "Units Sold MTD", value: 78, target: 100, unit: "units", status: "below", trend: [92, 88, 101, 95, 103, 78] },
  { id: "turn-rate", name: "Turn Rate", value: 1.8, target: 1.8, unit: "x", status: "at", trend: [1.5, 1.6, 1.7, 1.8, 1.9, 1.8] },
  { id: "holding-cost", name: "Holding Cost/Day", value: 46.44, target: 45, unit: "$/day", status: "at", trend: [48, 47, 46, 47, 46, 46.44] },
  { id: "days-to-frontline", name: "Days to Frontline", value: 2.8, target: 3, unit: "days", status: "above", trend: [4.2, 3.8, 3.5, 3.1, 2.9, 2.8] },
  { id: "aged-45-plus", name: "Aged 45+ Units", value: 8, target: 10, unit: "%", status: "above", trend: [14, 12, 11, 10, 9, 8] },
  { id: "avg-gross-margin", name: "Avg Gross Margin", value: 3500, target: 3500, unit: "$", status: "at", trend: [3200, 3350, 3400, 3450, 3500, 3500] },
]

// ─── Threats ───

export const mockThreats: Threat[] = [
  {
    id: "t1", category: "aging", label: "Aged 45+ days", count: 3, severity: "critical",
    description: "3 cars aged 45+ days — need walk and wholesale decision",
    href: "/max-2/sourcing?filter=aged-45",
    vehicles: [
      { vin: "3GNAXUEV9NL100007", year: 2018, make: "Chevrolet", model: "Equinox", detail: "48 days, ROI/Day $71" },
      { vin: "KNDJP3A54J7100010", year: 2019, make: "Kia", model: "Sportage", detail: "55 days, ROI/Day $64" },
      { vin: "5NPE34AF9GH100009", year: 2020, make: "Hyundai", model: "Sonata", detail: "42 days, ROI/Day $64" },
    ],
  },
  {
    id: "t2", category: "no-leads", label: "No leads in 5+ days", count: 2, severity: "warning",
    description: "2 cars live for 5+ days with zero leads",
    href: "/max-2/marketing?filter=no-leads",
    vehicles: [
      { vin: "WBAPH5C55BA100005", year: 2020, make: "BMW", model: "3 Series", detail: "5 days online, 0 leads, rank #14" },
      { vin: "1N4BL4BV5LC100006", year: 2019, make: "Nissan", model: "Altima", detail: "7 days online, 0 leads" },
    ],
  },
  {
    id: "t3", category: "recon-delay", label: "Stuck in recon", count: 4, severity: "critical",
    description: "4 cars stuck in recon past 3-day SLA",
    href: "/max-2/recon?filter=sla-breach",
    vehicles: [
      { vin: "RVIN006", year: 2021, make: "Nissan", model: "Rogue", detail: "3.5 days in detail" },
      { vin: "RVIN008", year: 2020, make: "Subaru", model: "Outback", detail: "4 days in photo" },
      { vin: "RVIN011", year: 2019, make: "Mazda", model: "CX-3", detail: "3.2 days in mechanical" },
      { vin: "RVIN012", year: 2020, make: "Ford", model: "Edge", detail: "3.8 days in body" },
    ],
  },
  {
    id: "t4", category: "pricing-risk", label: "Priced above market", count: 2, severity: "warning",
    description: "2 cars priced above market average and losing VDP clicks",
    href: "/max-2/marketing?filter=overpriced",
    vehicles: [
      { vin: "WBAPH5C55BA100005", year: 2020, make: "BMW", model: "3 Series", detail: "101.2% C2M, rank #14, VDPs down 35%" },
      { vin: "3GNAXUEV9NL100007", year: 2018, make: "Chevrolet", model: "Equinox", detail: "94.5% C2M, rank #11, VDPs down 22%" },
    ],
  },
  {
    id: "t5", category: "stock-photos", label: "Stock photos only", count: 3, severity: "warning",
    description: "3 units online with stock photos only — hurting conversion",
    href: "/max-2/studio?filter=stock-photos",
    vehicles: [
      { vin: "RVIN002", year: 2020, make: "Toyota", model: "Tacoma", detail: "8 stock photos, 0 real" },
      { vin: "RVIN004", year: 2022, make: "Hyundai", model: "Tucson", detail: "6 stock photos, 0 real" },
      { vin: "RVIN010", year: 2021, make: "Honda", model: "Civic", detail: "4 stock photos, 0 real" },
    ],
  },
  {
    id: "t6", category: "margin-erosion", label: "Margin erosion", count: 2, severity: "warning",
    description: "2 units with daily burn exceeding remaining margin in <10 days",
    href: "/max-2/sourcing?filter=margin-risk",
    vehicles: [
      { vin: "KNDJP3A54J7100010", year: 2019, make: "Kia", model: "Sportage", detail: "$3,500 margin left, $46/day burn = 76 days" },
      { vin: "3GNAXUEV9NL100007", year: 2018, make: "Chevrolet", model: "Equinox", detail: "$2,100 margin left, $46/day burn = 45 days" },
    ],
  },
]

// ─── Opportunities ───

export const mockOpportunities: Opportunity[] = [
  {
    id: "o1", category: "hot-vehicle", label: "Hot vehicles with rising demand", count: 4, impact: "high",
    description: "4 vehicles with increasing VDP views and market demand this week",
    href: "/max-2/sales?filter=hot-vehicles",
    items: [
      { id: "h1", title: "2021 Ford F-150 XLT", detail: "VDPs up 42% this week, 3 leads pending" },
      { id: "h2", title: "2022 Audi Q5 Premium", detail: "VDPs up 38%, segment demand rising 15%" },
      { id: "h3", title: "2021 Mazda CX-5 Touring", detail: "VDPs up 28%, 2 appointment requests" },
      { id: "h4", title: "2020 Toyota RAV4 XLE", detail: "VDPs up 25%, price sweet spot for zip 78704" },
    ],
  },
  {
    id: "o2", category: "price-drop-follow-up", label: "Price-drop follow-up", count: 3, impact: "medium",
    description: "3 recently repriced vehicles — alert past inquirers",
    href: "/max-2/marketing?filter=price-drop",
    items: [
      { id: "p1", title: "2019 Chevrolet Silverado LT", detail: "Dropped $1,000 on Day 18 — 5 past inquiries to notify" },
      { id: "p2", title: "2022 Honda CR-V EX-L", detail: "Dropped $1,300 on Day 20 — 3 past inquiries" },
      { id: "p3", title: "2020 Hyundai Sonata SEL", detail: "Dropped $600 on Day 35 — 2 past inquiries" },
    ],
  },
  {
    id: "o3", category: "demand-not-in-stock", label: "Requested vehicles not in stock", count: 8, impact: "high",
    description: "8 customer demand signals for vehicles you don't currently carry",
    href: "/max-2/sourcing?filter=unmet-demand",
    items: [
      { id: "d1", title: "Toyota Tacoma TRD ($32-38k)", detail: "6 inquiries this month, 0 in stock" },
      { id: "d2", title: "Honda Pilot EX-L ($35-42k)", detail: "4 inquiries, 0 in stock" },
      { id: "d3", title: "Jeep Wrangler ($28-35k)", detail: "5 inquiries, 0 in stock" },
      { id: "d4", title: "Subaru Outback ($25-32k)", detail: "3 inquiries, 0 in stock" },
      { id: "d5", title: "Ford Bronco Sport ($28-35k)", detail: "4 inquiries, 0 in stock" },
      { id: "d6", title: "Toyota 4Runner ($38-45k)", detail: "3 inquiries, 0 in stock" },
      { id: "d7", title: "Kia Telluride ($35-42k)", detail: "3 inquiries, 0 in stock" },
      { id: "d8", title: "Hyundai Palisade ($38-45k)", detail: "2 inquiries, 0 in stock" },
    ],
  },
  {
    id: "o4", category: "service-lane-acquisition", label: "Service-lane acquisitions", count: 2, impact: "high",
    description: "2 service customers with high-equity vehicles you can acquire",
    href: "/max-2/service?filter=acquisition",
    items: [
      { id: "s1", title: "Maria Gonzalez — 2021 Toyota Highlander", detail: "$8K+ equity, $2,800 RO, expressed upgrade interest" },
      { id: "s2", title: "Robert Kim — 2020 Honda Accord", detail: "$5K+ equity, lease ending in 60 days" },
    ],
  },
  {
    id: "o5", category: "campaign-ready", label: "Campaign-ready vehicles", count: 4, impact: "medium",
    description: "4 vehicles ready for targeted campaigns based on segment demand",
    href: "/max-2/marketing?filter=campaign-ready",
    items: [
      { id: "c1", title: "2021 Ford F-150 XLT", detail: "Truck segment demand up 12%, no active campaign" },
      { id: "c2", title: "2022 Audi Q5 Premium", detail: "Luxury crossover demand strong, no campaign" },
      { id: "c3", title: "2020 Toyota RAV4 XLE", detail: "SUV <$30k demand high, no campaign" },
      { id: "c4", title: "2021 Mazda CX-5 Touring", detail: "Crossover demand rising, no campaign" },
    ],
  },
]

// ─── Insights ───

export const mockInsightPresets: InsightPreset[] = [
  { id: "i1", question: "What are the top pain points from service calls this week?", category: "service", icon: "Wrench" },
  { id: "i2", question: "Which vehicles are customers requesting most that we don't have?", category: "inventory", icon: "Search" },
  { id: "i3", question: "What are the top objections in sales calls this month?", category: "sales", icon: "Phone" },
  { id: "i4", question: "Why are some deals not closing — what patterns do you see?", category: "sales", icon: "TrendingDown" },
  { id: "i5", question: "What's changing in my local market this month?", category: "market", icon: "Globe" },
  { id: "i6", question: "Which SUVs under $35k have the highest demand right now?", category: "inventory", icon: "Car" },
]

// ─── Sourcing ───

export const mockDemandSignals: DemandSignal[] = [
  { id: "ds1", vehicleDescription: "Toyota Tacoma TRD ($32-38k)", source: "vini-sales", sourceLabel: "Sales Calls", requestCount: 6, avgBudget: 35000, urgency: "high", inStock: false, segment: "Truck $30-45k" },
  { id: "ds2", vehicleDescription: "Honda Pilot EX-L ($35-42k)", source: "vini-sales", sourceLabel: "Sales Calls", requestCount: 4, avgBudget: 38000, urgency: "high", inStock: false, segment: "SUV $35-45k" },
  { id: "ds3", vehicleDescription: "Jeep Wrangler ($28-35k)", source: "customer-inquiry", sourceLabel: "Website Inquiry", requestCount: 5, avgBudget: 31000, urgency: "high", inStock: false, segment: "SUV $25-35k" },
  { id: "ds4", vehicleDescription: "Subaru Outback ($25-32k)", source: "vini-sales", sourceLabel: "Sales Calls", requestCount: 3, avgBudget: 28000, urgency: "medium", inStock: false, segment: "Crossover $25-35k" },
  { id: "ds5", vehicleDescription: "Ford Bronco Sport ($28-35k)", source: "market-data", sourceLabel: "Market Intel", requestCount: 4, avgBudget: 30000, urgency: "medium", inStock: false, segment: "SUV $25-35k" },
  { id: "ds6", vehicleDescription: "Toyota 4Runner ($38-45k)", source: "vini-sales", sourceLabel: "Sales Calls", requestCount: 3, avgBudget: 41000, urgency: "medium", inStock: false, segment: "SUV $35-45k" },
  { id: "ds7", vehicleDescription: "Ford F-150 XLT ($30-38k)", source: "vini-sales", sourceLabel: "Sales Calls", requestCount: 8, avgBudget: 34000, urgency: "high", inStock: true, segment: "Truck $30-45k" },
  { id: "ds8", vehicleDescription: "Toyota RAV4 ($25-32k)", source: "customer-inquiry", sourceLabel: "Website Inquiry", requestCount: 5, avgBudget: 27000, urgency: "medium", inStock: true, segment: "Crossover $25-35k" },
]

export const mockServiceLaneOpps: ServiceLaneOpportunity[] = [
  { id: "sl1", customerName: "Maria Gonzalez", currentVehicle: "2021 Toyota Highlander XLE", roAmount: 2800, visitReason: "Major service (60k)", buySignal: "Asked about new models, expressed frustration with repair cost", estimatedEquity: 8200 },
  { id: "sl2", customerName: "Robert Kim", currentVehicle: "2020 Honda Accord Sport", roAmount: 450, visitReason: "Routine maintenance", buySignal: "Lease ending in 60 days, asked about purchase options", estimatedEquity: 5100 },
  { id: "sl3", customerName: "Jennifer Walsh", currentVehicle: "2019 Chevrolet Equinox LT", roAmount: 1900, visitReason: "Transmission concern", buySignal: "Mentioned wanting something bigger, asked about trade value", estimatedEquity: 3800 },
]

export const mockMarketGaps: MarketGap[] = [
  { segment: "Truck $30-45k", marketDemand: 310, yourInventory: 18, gap: 25, avgPrice: 37400, monthlyOpportunity: 50000 },
  { segment: "SUV < $30k", marketDemand: 420, yourInventory: 52, gap: 15, avgPrice: 26800, monthlyOpportunity: 30000 },
  { segment: "Crossover $25-40k", marketDemand: 350, yourInventory: 28, gap: 18, avgPrice: 31500, monthlyOpportunity: 36000 },
  { segment: "Economy < $15k", marketDemand: 260, yourInventory: 22, gap: 8, avgPrice: 12400, monthlyOpportunity: 16000 },
  { segment: "Luxury $40k+", marketDemand: 180, yourInventory: 12, gap: 5, avgPrice: 48900, monthlyOpportunity: 15000 },
]

export const mockTradeInOpps: TradeInOpportunity[] = [
  { id: "ti1", customerName: "David Park", vehicleOffered: "2020 Toyota Camry SE", estimatedACV: 19500, estimatedFrontGross: 2200, source: "Walk-in appraisal", daysOld: 1 },
  { id: "ti2", customerName: "Sarah Thompson", vehicleOffered: "2021 Honda CR-V EX", estimatedACV: 24000, estimatedFrontGross: 2800, source: "Online trade tool", daysOld: 2 },
  { id: "ti3", customerName: "Mike Rodriguez", vehicleOffered: "2019 Ford F-150 XLT", estimatedACV: 28000, estimatedFrontGross: 3200, source: "Sales desk", daysOld: 0 },
]

// ─── Studio / Merchandising ───

export const mockMerchandisingVehicles: MerchandisingVehicle[] = [
  { vin: "MV001", year: 2021, make: "Ford", model: "F-150 XLT", mediaStatus: "real-photos", photoCount: 42, has360: true, hasVideo: true, publishStatus: "live", listingScore: 95, daysInStock: 8, vdpViews: 340 },
  { vin: "MV002", year: 2020, make: "Toyota", model: "Camry SE", mediaStatus: "real-photos", photoCount: 36, has360: true, hasVideo: false, publishStatus: "live", listingScore: 88, daysInStock: 12, vdpViews: 210 },
  { vin: "MV003", year: 2019, make: "Chevrolet", model: "Silverado LT", mediaStatus: "clone-photos", photoCount: 30, has360: false, hasVideo: false, publishStatus: "live", listingScore: 72, daysInStock: 22, vdpViews: 185 },
  { vin: "MV004", year: 2022, make: "Honda", model: "CR-V EX-L", mediaStatus: "clone-photos", photoCount: 28, has360: false, hasVideo: false, publishStatus: "live", listingScore: 68, daysInStock: 28, vdpViews: 150 },
  { vin: "MV005", year: 2020, make: "BMW", model: "330i", mediaStatus: "stock-photos", photoCount: 8, has360: false, hasVideo: false, publishStatus: "live", listingScore: 35, daysInStock: 35, vdpViews: 62 },
  { vin: "MV006", year: 2019, make: "Nissan", model: "Altima 2.5 SV", mediaStatus: "stock-photos", photoCount: 6, has360: false, hasVideo: false, publishStatus: "live", listingScore: 30, daysInStock: 38, vdpViews: 44 },
  { vin: "MV007", year: 2021, make: "Mazda", model: "CX-5 Touring", mediaStatus: "real-photos", photoCount: 38, has360: true, hasVideo: true, publishStatus: "live", listingScore: 92, daysInStock: 5, vdpViews: 280 },
  { vin: "MV008", year: 2020, make: "Hyundai", model: "Tucson", mediaStatus: "stock-photos", photoCount: 4, has360: false, hasVideo: false, publishStatus: "pending", listingScore: 18, daysInStock: 3, vdpViews: 0 },
  { vin: "MV009", year: 2022, make: "Toyota", model: "RAV4 XLE", mediaStatus: "real-photos", photoCount: 40, has360: true, hasVideo: false, publishStatus: "live", listingScore: 90, daysInStock: 19, vdpViews: 295 },
  { vin: "MV010", year: 2022, make: "Audi", model: "Q5 Premium", mediaStatus: "clone-photos", photoCount: 32, has360: false, hasVideo: false, publishStatus: "live", listingScore: 70, daysInStock: 6, vdpViews: 175 },
  { vin: "MV011", year: 2020, make: "Honda", model: "Civic", mediaStatus: "no-photos", photoCount: 0, has360: false, hasVideo: false, publishStatus: "not-published", listingScore: 0, daysInStock: 1, vdpViews: 0 },
]

// ─── Sales ───

export const mockLeadFunnel: LeadFunnelStage[] = [
  { stage: "Website Visits", count: 4200, conversionRate: 100 },
  { stage: "VDP Views", count: 1850, conversionRate: 44 },
  { stage: "Leads Generated", count: 420, conversionRate: 22.7 },
  { stage: "Appointments Set", count: 156, conversionRate: 37.1 },
  { stage: "Shows", count: 106, conversionRate: 67.9 },
  { stage: "Deals Closed", count: 78, conversionRate: 73.6 },
]

export const mockVehicleInquiries: VehicleInquiry[] = [
  { id: "vi1", vehicleDescription: "2021 Ford F-150 XLT", vin: "1FTEW1EP5MFA00001", inStock: true, inquiryCount: 8, lastInquiry: "2 hours ago", source: "Website + Phone", status: "hot" },
  { id: "vi2", vehicleDescription: "2022 Audi Q5 Premium", vin: "WA1LFAFP1EA100011", inStock: true, inquiryCount: 5, lastInquiry: "4 hours ago", source: "Website", status: "hot" },
  { id: "vi3", vehicleDescription: "Toyota Tacoma TRD (any)", vin: undefined, inStock: false, inquiryCount: 6, lastInquiry: "Yesterday", source: "Sales Calls", status: "hot" },
  { id: "vi4", vehicleDescription: "2021 Mazda CX-5 Touring", vin: "JM1NDAL75N0100008", inStock: true, inquiryCount: 4, lastInquiry: "Today", source: "Walk-in + Website", status: "warm" },
  { id: "vi5", vehicleDescription: "Honda Pilot EX-L (any)", vin: undefined, inStock: false, inquiryCount: 4, lastInquiry: "2 days ago", source: "Website", status: "warm" },
  { id: "vi6", vehicleDescription: "2020 Toyota RAV4 XLE", vin: "4T1B11HK5KU100012", inStock: true, inquiryCount: 3, lastInquiry: "Today", source: "Phone", status: "warm" },
]

export const mockFollowUps: FollowUpOpportunity[] = [
  { id: "fu1", customerName: "James Wilson", vehicleInterest: "2021 Ford F-150 XLT", lastContact: "3 days ago", reason: "Asked for financing info, never responded", priority: "high" },
  { id: "fu2", customerName: "Amanda Chen", vehicleInterest: "2022 Honda CR-V EX-L", lastContact: "5 days ago", reason: "Price just dropped $1,300 — notify", priority: "high" },
  { id: "fu3", customerName: "Carlos Mendez", vehicleInterest: "SUV under $30k", lastContact: "1 week ago", reason: "Visited lot but didn't buy, no follow-up yet", priority: "medium" },
  { id: "fu4", customerName: "Rachel Green", vehicleInterest: "2022 Audi Q5 Premium", lastContact: "2 days ago", reason: "Test drove, said 'thinking about it'", priority: "high" },
]

// ─── Service ───

export const mockServiceBuyOpps: ServiceBuyOpportunity[] = [
  { id: "sb1", customerName: "Maria Gonzalez", currentVehicle: "2021 Toyota Highlander XLE", vehicleAge: 4, mileage: 62000, roTotal: 2800, buySignal: "Asked about new models, frustrated with repair cost", estimatedEquity: 8200, recommendedAction: "Offer trade-in appraisal, show payment comparison" },
  { id: "sb2", customerName: "Robert Kim", currentVehicle: "2020 Honda Accord Sport", vehicleAge: 5, mileage: 48000, roTotal: 450, buySignal: "Lease ending in 60 days", estimatedEquity: 5100, recommendedAction: "Present lease-end options, show used inventory" },
  { id: "sb3", customerName: "Jennifer Walsh", currentVehicle: "2019 Chevrolet Equinox LT", vehicleAge: 6, mileage: 78000, roTotal: 1900, buySignal: "Wants something bigger, asked about trade value", estimatedEquity: 3800, recommendedAction: "Appraise trade, show 3-row SUV options" },
  { id: "sb4", customerName: "Thomas Brown", currentVehicle: "2018 Ford Explorer XLT", vehicleAge: 7, mileage: 92000, roTotal: 3200, buySignal: "Repair cost exceeds 15% of vehicle value", estimatedEquity: 2100, recommendedAction: "Show total cost of ownership, offer upgrade path" },
]

export const mockServicePainPoints: ServicePainPoint[] = [
  { id: "sp1", category: "Repair Cost Frustration", mentionCount: 18, sentiment: "negative", topQuotes: ["This repair costs more than my payment", "I didn't expect this bill"], trend: "rising" },
  { id: "sp2", category: "Wait Time Complaints", mentionCount: 12, sentiment: "negative", topQuotes: ["I've been waiting 3 hours", "Nobody told me it would take this long"], trend: "stable" },
  { id: "sp3", category: "Parts Availability", mentionCount: 8, sentiment: "negative", topQuotes: ["The part won't be here for 2 weeks?", "I can't wait that long"], trend: "declining" },
  { id: "sp4", category: "Vehicle Upgrade Interest", mentionCount: 15, sentiment: "neutral", topQuotes: ["What would I get for my car?", "I've been thinking about something newer"], trend: "rising" },
]

// ─── Lot View ───

export const mockLotVehicles: LotVehicle[] = [
  { vin: "1FTEW1EP5MFA00001", stockNumber: "A1001", year: 2021, make: "Ford", model: "F-150", trim: "XLT", color: "Oxford White", mileage: 32400, listPrice: 38500, marketPrice: 37800, acv: 33200, pricingPosition: "at-market", costToMarketPct: 98.2, daysInStock: 8, lotStatus: "frontline", photoCount: 42, hasRealPhotos: true, vdpViews: 340, leads: 3, lastLeadDate: "2 hours ago", recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 368, estimatedFrontGross: 3800, segment: "Truck $30-45k", location: "Lot A - Row 3" },
  { vin: "4T1B11HK5KU100012", stockNumber: "A1002", year: 2020, make: "Toyota", model: "RAV4", trim: "XLE", color: "Lunar Rock", mileage: 28900, listPrice: 29400, marketPrice: 29100, acv: 25600, pricingPosition: "at-market", costToMarketPct: 97.9, daysInStock: 19, lotStatus: "frontline", photoCount: 40, hasRealPhotos: true, vdpViews: 295, leads: 2, lastLeadDate: "Today", recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 874, estimatedFrontGross: 2800, segment: "Crossover $25-35k", location: "Lot A - Row 5" },
  { vin: "WA1LFAFP1EA100011", stockNumber: "A1003", year: 2022, make: "Audi", model: "Q5", trim: "Premium", color: "Navarra Blue", mileage: 18200, listPrice: 44900, marketPrice: 44500, acv: 39200, pricingPosition: "at-market", costToMarketPct: 99.1, daysInStock: 6, lotStatus: "frontline", photoCount: 32, hasRealPhotos: false, vdpViews: 175, leads: 5, lastLeadDate: "4 hours ago", recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 276, estimatedFrontGross: 4200, segment: "Luxury $40k+", location: "Lot B - Row 1" },
  { vin: "JM1NDAL75N0100008", stockNumber: "A1004", year: 2021, make: "Mazda", model: "CX-5", trim: "Touring", color: "Soul Red Crystal", mileage: 24600, listPrice: 28900, marketPrice: 28400, acv: 24800, pricingPosition: "at-market", costToMarketPct: 98.2, daysInStock: 5, lotStatus: "frontline", photoCount: 38, hasRealPhotos: true, vdpViews: 280, leads: 4, lastLeadDate: "Today", recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 230, estimatedFrontGross: 3100, segment: "Crossover $25-35k", location: "Lot A - Row 2" },
  { vin: "WBAPH5C55BA100005", stockNumber: "A1005", year: 2020, make: "BMW", model: "3 Series", trim: "330i", color: "Mineral Grey", mileage: 42100, listPrice: 33500, marketPrice: 33100, acv: 28900, pricingPosition: "above-market", costToMarketPct: 101.2, daysInStock: 35, lotStatus: "frontline", photoCount: 8, hasRealPhotos: false, vdpViews: 62, leads: 0, lastLeadDate: null, recentPriceChange: -500, holdingCostPerDay: 46, totalHoldingCost: 1610, estimatedFrontGross: 2400, segment: "Luxury $30-40k", location: "Lot B - Row 4" },
  { vin: "1N4BL4BV5LC100006", stockNumber: "A1006", year: 2019, make: "Nissan", model: "Altima", trim: "2.5 SV", color: "Gun Metallic", mileage: 55200, listPrice: 18900, marketPrice: 19200, acv: 15800, pricingPosition: "below-market", costToMarketPct: 95.4, daysInStock: 38, lotStatus: "frontline", photoCount: 6, hasRealPhotos: false, vdpViews: 44, leads: 0, lastLeadDate: null, recentPriceChange: -600, holdingCostPerDay: 46, totalHoldingCost: 1748, estimatedFrontGross: 1800, segment: "Economy < $20k", location: "Lot C - Row 1" },
  { vin: "3GNAXUEV9NL100007", stockNumber: "A1007", year: 2018, make: "Chevrolet", model: "Equinox", trim: "LT", color: "Mosaic Black", mileage: 61300, listPrice: 21500, marketPrice: 21800, acv: 17200, pricingPosition: "below-market", costToMarketPct: 94.5, daysInStock: 48, lotStatus: "wholesale-candidate", photoCount: 22, hasRealPhotos: true, vdpViews: 38, leads: 0, lastLeadDate: null, recentPriceChange: -1000, holdingCostPerDay: 46, totalHoldingCost: 2208, estimatedFrontGross: 1100, segment: "Crossover $20-25k", location: "Lot C - Row 3" },
  { vin: "5NPE34AF9GH100009", stockNumber: "A1008", year: 2020, make: "Hyundai", model: "Sonata", trim: "SEL", color: "Shimmering Silver", mileage: 38700, listPrice: 22900, marketPrice: 23500, acv: 19400, pricingPosition: "below-market", costToMarketPct: 93.8, daysInStock: 42, lotStatus: "frontline", photoCount: 28, hasRealPhotos: true, vdpViews: 55, leads: 1, lastLeadDate: "6 days ago", recentPriceChange: -600, holdingCostPerDay: 46, totalHoldingCost: 1932, estimatedFrontGross: 1900, segment: "Sedan $20-25k", location: "Lot A - Row 7" },
  { vin: "KNDJP3A54J7100010", stockNumber: "A1009", year: 2019, make: "Kia", model: "Sportage", trim: "LX", color: "Pacific Blue", mileage: 52800, listPrice: 19800, marketPrice: 20200, acv: 16300, pricingPosition: "below-market", costToMarketPct: 95.1, daysInStock: 55, lotStatus: "wholesale-candidate", photoCount: 20, hasRealPhotos: true, vdpViews: 28, leads: 0, lastLeadDate: null, recentPriceChange: -800, holdingCostPerDay: 46, totalHoldingCost: 2530, estimatedFrontGross: 800, segment: "Crossover $15-20k", location: "Lot C - Row 2" },
  { vin: "2T1BURHE5JC100003", stockNumber: "A1010", year: 2020, make: "Toyota", model: "Corolla", trim: "LE", color: "Classic Silver", mileage: 35200, listPrice: 19500, marketPrice: 19800, acv: 16500, pricingPosition: "below-market", costToMarketPct: 96.5, daysInStock: 14, lotStatus: "frontline", photoCount: 34, hasRealPhotos: true, vdpViews: 120, leads: 2, lastLeadDate: "Yesterday", recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 644, estimatedFrontGross: 2200, segment: "Economy < $20k", location: "Lot A - Row 6" },
  { vin: "RVINNEW001", stockNumber: "A1011", year: 2021, make: "Honda", model: "Civic", trim: "Sport", color: "Rallye Red", mileage: 22400, listPrice: 24500, marketPrice: 24200, acv: 20800, pricingPosition: "at-market", costToMarketPct: 98.8, daysInStock: 2, lotStatus: "in-recon", photoCount: 0, hasRealPhotos: false, vdpViews: 0, leads: 0, lastLeadDate: null, recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 92, estimatedFrontGross: 2800, segment: "Sedan $20-25k", location: "Recon Bay" },
  { vin: "RVINNEW002", stockNumber: "A1012", year: 2022, make: "Hyundai", model: "Tucson", trim: "SEL", color: "Amazon Gray", mileage: 19800, listPrice: 28200, marketPrice: 27800, acv: 24100, pricingPosition: "at-market", costToMarketPct: 98.6, daysInStock: 3, lotStatus: "in-recon", photoCount: 0, hasRealPhotos: false, vdpViews: 0, leads: 0, lastLeadDate: null, recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 138, estimatedFrontGross: 3100, segment: "Crossover $25-35k", location: "Recon Bay" },
  { vin: "RVINNEW003", stockNumber: "A1013", year: 2023, make: "Toyota", model: "Camry", trim: "SE", color: "Midnight Black", mileage: 12100, listPrice: 27800, marketPrice: 27500, acv: 24200, pricingPosition: "at-market", costToMarketPct: 98.9, daysInStock: 0, lotStatus: "arriving", photoCount: 0, hasRealPhotos: false, vdpViews: 0, leads: 0, lastLeadDate: null, recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 0, estimatedFrontGross: 2900, segment: "Sedan $25-30k", location: "In Transit" },
  { vin: "RVINNEW004", stockNumber: "A1014", year: 2021, make: "Subaru", model: "Forester", trim: "Premium", color: "Jasper Green", mileage: 31200, listPrice: 27200, marketPrice: 27000, acv: 23500, pricingPosition: "at-market", costToMarketPct: 99.3, daysInStock: 1, lotStatus: "arriving", photoCount: 0, hasRealPhotos: false, vdpViews: 0, leads: 0, lastLeadDate: null, recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 46, estimatedFrontGross: 2800, segment: "Crossover $25-35k", location: "In Transit" },
  { vin: "SOLDVIN001", stockNumber: "A0998", year: 2021, make: "Chevrolet", model: "Silverado", trim: "LT", color: "Summit White", mileage: 28900, listPrice: 36500, marketPrice: 36200, acv: 31800, pricingPosition: "at-market", costToMarketPct: 99.2, daysInStock: 22, lotStatus: "sold-pending", photoCount: 30, hasRealPhotos: true, vdpViews: 185, leads: 4, lastLeadDate: "3 days ago", recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 1012, estimatedFrontGross: 3500, segment: "Truck $30-45k", location: "Delivery Prep" },
]

export const mockLotSummary: LotSummary = {
  totalUnits: 15,
  frontlineReady: 9,
  inRecon: 2,
  arriving: 2,
  avgDaysInStock: 19.9,
  avgCostToMarket: 97.6,
  totalHoldingCostToday: 690,
  aged30Plus: 5,
  aged45Plus: 3,
  aged60Plus: 0,
  noLeads5Days: 4,
  noPhotos: 4,
}

// ─── Customers ───

export const mockCustomers: Customer[] = [
  { id: "c1", name: "James Wilson", email: "jwilson@email.com", phone: "(512) 555-0142", status: "active-lead", source: "website", assignedSalesperson: "Marcus D.", firstContactDate: "Mar 7", lastContactDate: "Mar 7", vehicleInterests: ["2021 Ford F-150 XLT"], currentVehicle: "2017 Toyota Tundra SR5", estimatedEquity: 4200, totalTouchpoints: 3, appointmentSet: false, testDriveCompleted: false, creditAppSubmitted: false, notes: "Asked for financing info, never responded. High intent." },
  { id: "c2", name: "Amanda Chen", email: "achen@email.com", phone: "(512) 555-0287", status: "active-lead", source: "website", assignedSalesperson: "Sarah K.", firstContactDate: "Mar 5", lastContactDate: "Mar 5", vehicleInterests: ["2022 Honda CR-V EX-L"], currentVehicle: "2018 Nissan Rogue SV", estimatedEquity: 2800, totalTouchpoints: 4, appointmentSet: true, testDriveCompleted: false, creditAppSubmitted: false, notes: "Price just dropped $1,300 — needs a callback." },
  { id: "c3", name: "Carlos Mendez", email: "cmendez@email.com", phone: "(512) 555-0391", status: "active-lead", source: "walk-in", assignedSalesperson: "Marcus D.", firstContactDate: "Mar 3", lastContactDate: "Mar 3", vehicleInterests: ["SUV under $30k"], currentVehicle: null, estimatedEquity: null, totalTouchpoints: 1, appointmentSet: false, testDriveCompleted: false, creditAppSubmitted: false, notes: "Visited lot but didn't buy. No follow-up sent yet." },
  { id: "c4", name: "Rachel Green", email: "rgreen@email.com", phone: "(512) 555-0104", status: "active-lead", source: "referral", assignedSalesperson: "Jake P.", firstContactDate: "Mar 8", lastContactDate: "Mar 8", vehicleInterests: ["2022 Audi Q5 Premium"], currentVehicle: "2019 BMW X3 xDrive30i", estimatedEquity: 6100, totalTouchpoints: 5, appointmentSet: true, testDriveCompleted: true, creditAppSubmitted: false, notes: "Test drove, said 'thinking about it'. Hot lead." },
  { id: "c5", name: "Maria Gonzalez", email: "mgonzalez@email.com", phone: "(512) 555-0218", status: "service-only", source: "service-lane", assignedSalesperson: "Unassigned", firstContactDate: "Feb 12", lastContactDate: "Mar 9", vehicleInterests: [], currentVehicle: "2021 Toyota Highlander XLE", estimatedEquity: 8200, totalTouchpoints: 8, appointmentSet: false, testDriveCompleted: false, creditAppSubmitted: false, notes: "Service customer — frustrated with repair cost, asked about new models." },
  { id: "c6", name: "Robert Kim", email: "rkim@email.com", phone: "(512) 555-0375", status: "service-only", source: "service-lane", assignedSalesperson: "Unassigned", firstContactDate: "Jan 20", lastContactDate: "Mar 8", vehicleInterests: [], currentVehicle: "2020 Honda Accord Sport", estimatedEquity: 5100, totalTouchpoints: 6, appointmentSet: false, testDriveCompleted: false, creditAppSubmitted: false, notes: "Lease ending in 60 days. Asked about purchase options." },
  { id: "c7", name: "David Park", email: "dpark@email.com", phone: "(512) 555-0456", status: "active-lead", source: "walk-in", assignedSalesperson: "Sarah K.", firstContactDate: "Mar 9", lastContactDate: "Mar 9", vehicleInterests: ["Toyota Camry SE", "Honda Civic Sport"], currentVehicle: "2016 Hyundai Elantra SE", estimatedEquity: 1200, totalTouchpoints: 2, appointmentSet: true, testDriveCompleted: true, creditAppSubmitted: true, notes: "Trade-in appraisal done. Ready to close today." },
  { id: "c8", name: "Sarah Thompson", email: "sthompson@email.com", phone: "(512) 555-0533", status: "active-lead", source: "website", assignedSalesperson: "Jake P.", firstContactDate: "Mar 8", lastContactDate: "Mar 9", vehicleInterests: ["2021 Honda CR-V EX"], currentVehicle: "2018 Toyota RAV4 LE", estimatedEquity: 3400, totalTouchpoints: 3, appointmentSet: false, testDriveCompleted: false, creditAppSubmitted: false, notes: "Used online trade tool. Submitted inquiry." },
  { id: "c9", name: "Mike Rodriguez", email: "mrodriguez@email.com", phone: "(512) 555-0601", status: "sold", source: "phone", assignedSalesperson: "Marcus D.", firstContactDate: "Feb 28", lastContactDate: "Mar 7", vehicleInterests: ["2021 Ford F-150 XLT"], currentVehicle: null, estimatedEquity: null, totalTouchpoints: 7, appointmentSet: true, testDriveCompleted: true, creditAppSubmitted: true, notes: "Deal closed. F&I complete. Pending delivery." },
  { id: "c10", name: "Jennifer Walsh", email: "jwalsh@email.com", phone: "(512) 555-0778", status: "be-back", source: "service-lane", assignedSalesperson: "Sarah K.", firstContactDate: "Feb 15", lastContactDate: "Mar 2", vehicleInterests: ["3-row SUV"], currentVehicle: "2019 Chevrolet Equinox LT", estimatedEquity: 3800, totalTouchpoints: 4, appointmentSet: false, testDriveCompleted: false, creditAppSubmitted: false, notes: "Wants something bigger. Mentioned trading in. Not contacted in 8 days." },
  { id: "c11", name: "Brian Foster", email: "bfoster@email.com", phone: "(512) 555-0855", status: "lost", source: "website", assignedSalesperson: "Jake P.", firstContactDate: "Feb 20", lastContactDate: "Feb 25", vehicleInterests: ["Truck under $35k"], currentVehicle: "2015 Chevrolet Colorado LT", estimatedEquity: 1500, totalTouchpoints: 3, appointmentSet: true, testDriveCompleted: false, creditAppSubmitted: false, notes: "No-showed appointment. No response to follow-up." },
  { id: "c12", name: "Lisa Chang", email: "lchang@email.com", phone: "(512) 555-0912", status: "active-lead", source: "third-party", assignedSalesperson: "Marcus D.", firstContactDate: "Mar 10", lastContactDate: "Mar 10", vehicleInterests: ["2021 Mazda CX-5 Touring"], currentVehicle: "2017 Honda HR-V EX", estimatedEquity: 2100, totalTouchpoints: 1, appointmentSet: false, testDriveCompleted: false, creditAppSubmitted: false, notes: "AutoTrader lead just came in. Needs immediate outreach." },
]

export const mockCustomerSummary: CustomerSummary = {
  totalActive: 7,
  newThisWeek: 3,
  appointmentsToday: 2,
  followUpsDue: 4,
  beBackOpportunities: 1,
  avgResponseTime: "1.4 hrs",
  conversionRate: 73.6,
  lostThisMonth: 1,
}

export const mockCustomerActivities: CustomerActivity[] = [
  { id: "ca1", customerId: "c12", type: "call", description: "AutoTrader lead — first outreach needed", timestamp: "Today, 9:15 AM", salesperson: "Marcus D." },
  { id: "ca2", customerId: "c7", type: "credit-app", description: "Credit app submitted, trade appraisal complete", timestamp: "Today, 8:30 AM", salesperson: "Sarah K." },
  { id: "ca3", customerId: "c4", type: "test-drive", description: "Test drove 2022 Audi Q5 — very interested", timestamp: "Yesterday, 3:45 PM", salesperson: "Jake P." },
  { id: "ca4", customerId: "c2", type: "email", description: "Price-drop notification sent for CR-V EX-L", timestamp: "Yesterday, 11:00 AM", salesperson: "Sarah K." },
  { id: "ca5", customerId: "c8", type: "visit", description: "Submitted online trade inquiry", timestamp: "Yesterday, 9:20 AM", salesperson: "Jake P." },
  { id: "ca6", customerId: "c1", type: "call", description: "Left voicemail about financing options", timestamp: "Mar 7, 2:15 PM", salesperson: "Marcus D." },
  { id: "ca7", customerId: "c9", type: "deal-closed", description: "Deal closed — 2021 Ford F-150 XLT", timestamp: "Mar 7, 11:30 AM", salesperson: "Marcus D." },
  { id: "ca8", customerId: "c5", type: "visit", description: "Service visit — 60k mile service, $2,800 RO", timestamp: "Mar 6, 10:00 AM", salesperson: "Unassigned" },
]
