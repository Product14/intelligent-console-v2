import type {
  CapitalOverview,
  AgingStageData,
  VehicleSummary,
  VehicleStage,
  CampaignStatus,
  MediaType,
  PriceBand,
  VehicleSource,
} from "@/services/inventory/inventory.types"
import { mockCapitalOverview, mockAgingStages, mockVehicles } from "./inventory-mocks"

export type ScenarioId =
  | "default"
  | "first-time"
  | "return-user"
  | "empty"
  | "all-cloned"
  | "all-real"
  | "healthy"
  | "crisis"
  | "no-campaigns"
  | "high-engagement"
  | "images-only"
  | "studio-only"
  | "cloned-aging"

export interface Scenario {
  id: ScenarioId
  name: string
  description: string
  emoji: string
  showWelcome: boolean
  showBrief: boolean
  showNudge: boolean
  showAlerts: boolean
  nudgeType: "campaign-activation" | "media-upgrade" | "performance" | "upsell-cloning-campaign" | "upsell-vini-call" | "upsell-real-media"
}

export const scenarios: Scenario[] = [
  {
    id: "default",
    name: "Default",
    description: "Mixed inventory — standard operating state",
    emoji: "📊",
    showWelcome: false,
    showBrief: false,
    showNudge: true,
    showAlerts: true,
    nudgeType: "campaign-activation",
  },
  {
    id: "first-time",
    name: "First-Time User",
    description: "New dealer — onboarding triggers, small starting lot",
    emoji: "👋",
    showWelcome: true,
    showBrief: false,
    showNudge: true,
    showAlerts: true,
    nudgeType: "campaign-activation",
  },
  {
    id: "return-user",
    name: "Return User",
    description: "Experienced dealer — clean UI, no nudges",
    emoji: "🔄",
    showWelcome: false,
    showBrief: true,
    showNudge: false,
    showAlerts: false,
    nudgeType: "campaign-activation",
  },
  {
    id: "empty",
    name: "Empty Inventory",
    description: "Zero vehicles — brand new or cleared lot",
    emoji: "📦",
    showWelcome: true,
    showBrief: false,
    showNudge: false,
    showAlerts: false,
    nudgeType: "campaign-activation",
  },
  {
    id: "all-cloned",
    name: "All Media Cloned",
    description: "Every vehicle on AI Instant — upgrade pressure visible",
    emoji: "🟣",
    showWelcome: false,
    showBrief: false,
    showNudge: true,
    showAlerts: true,
    nudgeType: "media-upgrade",
  },
  {
    id: "all-real",
    name: "All Real Media",
    description: "Every vehicle upgraded — best-case media state",
    emoji: "🟢",
    showWelcome: false,
    showBrief: false,
    showNudge: false,
    showAlerts: false,
    nudgeType: "performance",
  },
  {
    id: "healthy",
    name: "Healthy Inventory",
    description: "Low risk — mostly fresh, high velocity score",
    emoji: "💚",
    showWelcome: false,
    showBrief: false,
    showNudge: false,
    showAlerts: false,
    nudgeType: "performance",
  },
  {
    id: "crisis",
    name: "Inventory in Crisis",
    description: "High exposure — margin bleeding, low leads",
    emoji: "🔴",
    showWelcome: false,
    showBrief: false,
    showNudge: true,
    showAlerts: true,
    nudgeType: "performance",
  },
  {
    id: "no-campaigns",
    name: "No Campaigns Active",
    description: "Zero campaigns — missed acceleration opportunity",
    emoji: "📭",
    showWelcome: false,
    showBrief: false,
    showNudge: true,
    showAlerts: true,
    nudgeType: "campaign-activation",
  },
  {
    id: "high-engagement",
    name: "High Engagement",
    description: "Hot leads everywhere — clone-to-real opportunity",
    emoji: "🔥",
    showWelcome: false,
    showBrief: false,
    showNudge: true,
    showAlerts: false,
    nudgeType: "media-upgrade",
  },
  {
    id: "images-only",
    name: "Images Only Plan",
    description: "Basic images — upsell Media Cloning & Campaigns",
    emoji: "🖼️",
    showWelcome: false,
    showBrief: false,
    showNudge: true,
    showAlerts: true,
    nudgeType: "upsell-cloning-campaign",
  },
  {
    id: "studio-only",
    name: "Studio Only Plan",
    description: "Studio media — upsell Vini Call on Campaigns",
    emoji: "🎬",
    showWelcome: false,
    showBrief: false,
    showNudge: true,
    showAlerts: true,
    nudgeType: "upsell-vini-call",
  },
  {
    id: "cloned-aging",
    name: "Cloned Media Aging",
    description: "Using AI clones too long — nudge to upload real photos",
    emoji: "📸",
    showWelcome: false,
    showBrief: false,
    showNudge: true,
    showAlerts: true,
    nudgeType: "upsell-real-media",
  },
]

function cloneVehicles(base: VehicleSummary[]): VehicleSummary[] {
  return base.map((v) => ({ ...v }))
}

const emptyOverview: CapitalOverview = {
  totalCapitalLocked: 0,
  totalDailyBurn: 0,
  avgDaysToLive: 0,
  capitalSavedThisMonth: 0,
  capitalAtRisk: 0,
  vehiclesInRisk: 0,
  vehiclesInCritical: 0,
  totalVehicles: 0,
  velocityScore: 0,
  marketBenchmarkDaysToLive: 24,
  deltas: {
    capitalLocked: 0,
    dailyBurn: 0,
    daysToLive: 0,
    capitalSaved: 0,
    capitalAtRisk: 0,
    riskCount: 0,
    velocityScore: 0,
  },
  trends: {
    dailyBurn: [0, 0, 0, 0, 0, 0, 0],
    capitalSaved: [0, 0, 0, 0, 0, 0, 0],
    capitalAtRisk: [0, 0, 0, 0, 0, 0, 0],
  },
}

const emptyAging: AgingStageData[] = [
  { stage: "fresh", count: 0, totalCapital: 0, marginExposurePercent: 0, avgDaysInStock: 0, avgLeadVelocity: 0 },
  { stage: "watch", count: 0, totalCapital: 0, marginExposurePercent: 0, avgDaysInStock: 0, avgLeadVelocity: 0 },
  { stage: "risk", count: 0, totalCapital: 0, marginExposurePercent: 0, avgDaysInStock: 0, avgLeadVelocity: 0 },
  { stage: "critical", count: 0, totalCapital: 0, marginExposurePercent: 0, avgDaysInStock: 0, avgLeadVelocity: 0 },
]

const sources: VehicleSource[] = ["auction", "trade-in", "wholesale", "direct"]
const priceBands: PriceBand[] = ["under-25k", "25k-35k", "35k-50k", "over-50k"]

export function getScenarioData(id: ScenarioId): {
  overview: CapitalOverview
  aging: AgingStageData[]
  vehicles: VehicleSummary[]
} {
  const base = cloneVehicles(mockVehicles)

  switch (id) {
    case "empty":
      return { overview: emptyOverview, aging: emptyAging, vehicles: [] }

    case "first-time": {
      const subset = base.slice(0, 5).map((v) => ({
        ...v,
        stage: "fresh" as VehicleStage,
        daysInStock: Math.floor(Math.random() * 5) + 1,
        marginRemaining: Math.round(2800 + Math.random() * 1500),
        leads: Math.round(Math.random() * 4),
        campaignStatus: "none" as CampaignStatus,
        mediaType: "clone" as MediaType,
      }))
      const totalCap = subset.reduce((a, v) => a + v.acquisitionCost, 0)
      return {
        overview: {
          ...mockCapitalOverview,
          totalCapitalLocked: totalCap,
          totalDailyBurn: subset.reduce((a, v) => a + v.dailyBurn, 0),
          avgDaysToLive: 42.0,
          capitalSavedThisMonth: 0,
          capitalAtRisk: 0,
          vehiclesInRisk: 0,
          vehiclesInCritical: 0,
          totalVehicles: subset.length,
          velocityScore: 65,
          deltas: { capitalLocked: 0, dailyBurn: 0, daysToLive: 0, capitalSaved: 0, capitalAtRisk: 0, riskCount: 0, velocityScore: 0 },
          trends: { dailyBurn: [0, 0, 0, 0, 0, 0, subset.reduce((a, v) => a + v.dailyBurn, 0)], capitalSaved: [0, 0, 0, 0, 0, 0, 0], capitalAtRisk: [0, 0, 0, 0, 0, 0, 0] },
        },
        aging: [
          { stage: "fresh", count: subset.length, totalCapital: totalCap, marginExposurePercent: 1.2, avgDaysInStock: 3, avgLeadVelocity: 1.8 },
          { stage: "watch", count: 0, totalCapital: 0, marginExposurePercent: 0, avgDaysInStock: 0, avgLeadVelocity: 0 },
          { stage: "risk", count: 0, totalCapital: 0, marginExposurePercent: 0, avgDaysInStock: 0, avgLeadVelocity: 0 },
          { stage: "critical", count: 0, totalCapital: 0, marginExposurePercent: 0, avgDaysInStock: 0, avgLeadVelocity: 0 },
        ],
        vehicles: subset,
      }
    }

    case "all-cloned": {
      const cloned = base.map((v) => ({ ...v, mediaType: "clone" as MediaType }))
      return {
        overview: {
          ...mockCapitalOverview,
          velocityScore: 52,
          capitalSavedThisMonth: 98_000,
          deltas: { ...mockCapitalOverview.deltas, velocityScore: -8.6, capitalSaved: -16.4 },
          trends: {
            ...mockCapitalOverview.trends,
            capitalSaved: [124000, 118000, 112000, 108000, 104000, 100000, 98000],
          },
        },
        aging: mockAgingStages.map((s) => ({
          ...s,
          avgLeadVelocity: +(s.avgLeadVelocity * 0.72).toFixed(1),
        })),
        vehicles: cloned,
      }
    }

    case "all-real": {
      const real = base.map((v) => ({
        ...v,
        mediaType: "real" as MediaType,
        leads: Math.round(v.leads * 1.24 + 2),
        ctr: +(v.ctr * 1.24).toFixed(1),
        appointments: Math.round(v.appointments * 1.18 + 1),
      }))
      return {
        overview: {
          ...mockCapitalOverview,
          velocityScore: 88,
          capitalAtRisk: 180_000,
          capitalSavedThisMonth: 312_000,
          avgDaysToLive: 24.1,
          deltas: {
            ...mockCapitalOverview.deltas,
            velocityScore: 12.4,
            capitalAtRisk: -22.5,
            capitalSaved: 28.3,
            daysToLive: 6.2,
          },
          trends: {
            dailyBurn: [13600, 13200, 12800, 12400, 12200, 12000, 11800],
            capitalSaved: [220000, 238000, 256000, 274000, 288000, 300000, 312000],
            capitalAtRisk: [320000, 296000, 268000, 240000, 220000, 198000, 180000],
          },
        },
        aging: mockAgingStages.map((s) => ({
          ...s,
          avgLeadVelocity: +(s.avgLeadVelocity * 1.34).toFixed(1),
          marginExposurePercent: +(s.marginExposurePercent * 0.72).toFixed(1),
        })),
        vehicles: real,
      }
    }

    case "healthy": {
      const stages: VehicleStage[] = ["fresh", "fresh", "fresh", "fresh", "fresh", "fresh", "fresh", "watch", "watch", "fresh", "fresh", "fresh"]
      const healthyVehicles = base.map((v, i) => ({
        ...v,
        stage: stages[i % stages.length],
        daysInStock: stages[i % stages.length] === "fresh" ? Math.floor(Math.random() * 12) + 1 : Math.floor(Math.random() * 10) + 16,
        marginRemaining: Math.round(2500 + Math.random() * 2000),
        leads: Math.round(6 + Math.random() * 14),
        appointments: Math.round(2 + Math.random() * 4),
        ctr: +(3.2 + Math.random() * 3).toFixed(1),
        campaignStatus: (Math.random() > 0.4 ? "active" : "none") as CampaignStatus,
        mediaType: (Math.random() > 0.3 ? "real" : "clone") as MediaType,
        attractionRisk: "optimized" as "optimized",
      }))
      return {
        overview: {
          ...mockCapitalOverview,
          velocityScore: 92,
          capitalAtRisk: 48_000,
          avgDaysToLive: 32.6,
          totalDailyBurn: 8_200,
          vehiclesInRisk: 2,
          vehiclesInCritical: 0,
          capitalSavedThisMonth: 264_000,
          deltas: {
            ...mockCapitalOverview.deltas,
            velocityScore: 8.1,
            capitalAtRisk: -34.2,
            daysToLive: 6.8,
            dailyBurn: -18.4,
            capitalSaved: 22.0,
            riskCount: -42.0,
          },
          trends: {
            dailyBurn: [12000, 11200, 10400, 9800, 9200, 8600, 8200],
            capitalSaved: [180000, 198000, 216000, 230000, 242000, 254000, 264000],
            capitalAtRisk: [140000, 120000, 98000, 82000, 68000, 56000, 48000],
          },
        },
        aging: [
          { stage: "fresh" as const, count: 98, totalCapital: 3_136_000, marginExposurePercent: 2.1, avgDaysInStock: 5, avgLeadVelocity: 8.2 },
          { stage: "watch" as const, count: 38, totalCapital: 1_216_000, marginExposurePercent: 8.4, avgDaysInStock: 19, avgLeadVelocity: 5.6 },
          { stage: "risk" as const, count: 5, totalCapital: 200_000, marginExposurePercent: 22.0, avgDaysInStock: 34, avgLeadVelocity: 2.8 },
          { stage: "critical" as const, count: 1, totalCapital: 40_000, marginExposurePercent: 45.0, avgDaysInStock: 52, avgLeadVelocity: 0.5 },
        ],
        vehicles: healthyVehicles,
      }
    }

    case "crisis": {
      const crisisStages: VehicleStage[] = ["risk", "critical", "risk", "risk", "critical", "watch", "risk", "critical", "risk", "critical", "risk", "critical"]
      const crisisVehicles = base.map((v, i) => ({
        ...v,
        stage: crisisStages[i % crisisStages.length],
        daysInStock: crisisStages[i % crisisStages.length] === "critical" ? Math.floor(55 + Math.random() * 30) : Math.floor(32 + Math.random() * 18),
        marginRemaining: crisisStages[i % crisisStages.length] === "critical" ? Math.round(-400 + Math.random() * 600) : Math.round(200 + Math.random() * 900),
        dailyBurn: Math.round(85 + Math.random() * 75),
        leads: Math.round(Math.random() * 2),
        appointments: 0,
        ctr: +(Math.random() * 1.2).toFixed(1),
        campaignStatus: "none" as CampaignStatus,
        mediaType: "clone" as MediaType,
        priceReduced: crisisStages[i % crisisStages.length] === "critical",
        attractionRisk: (crisisStages[i % crisisStages.length] === "critical" ? "low-conversion" : "below-benchmark") as "low-conversion" | "below-benchmark" | "optimized",
      }))
      return {
        overview: {
          ...mockCapitalOverview,
          velocityScore: 24,
          capitalAtRisk: 1_840_000,
          avgDaysToLive: 4.8,
          totalDailyBurn: 24_800,
          vehiclesInRisk: 52,
          vehiclesInCritical: 34,
          capitalSavedThisMonth: 22_000,
          totalVehicles: 142,
          deltas: {
            capitalLocked: 4.6,
            velocityScore: -18.4,
            capitalAtRisk: 32.6,
            dailyBurn: 14.2,
            daysToLive: -8.4,
            capitalSaved: -62.0,
            riskCount: 28.0,
          },
          trends: {
            dailyBurn: [18000, 19200, 20400, 21600, 22800, 23800, 24800],
            capitalSaved: [86000, 72000, 58000, 44000, 36000, 28000, 22000],
            capitalAtRisk: [1200000, 1340000, 1480000, 1580000, 1680000, 1760000, 1840000],
          },
        },
        aging: [
          { stage: "fresh" as const, count: 12, totalCapital: 384_000, marginExposurePercent: 6.0, avgDaysInStock: 8, avgLeadVelocity: 2.4 },
          { stage: "watch" as const, count: 44, totalCapital: 1_408_000, marginExposurePercent: 28.4, avgDaysInStock: 26, avgLeadVelocity: 1.1 },
          { stage: "risk" as const, count: 52, totalCapital: 2_080_000, marginExposurePercent: 58.2, avgDaysInStock: 42, avgLeadVelocity: 0.4 },
          { stage: "critical" as const, count: 34, totalCapital: 1_360_000, marginExposurePercent: 88.4, avgDaysInStock: 68, avgLeadVelocity: 0.1 },
        ],
        vehicles: crisisVehicles,
      }
    }

    case "no-campaigns": {
      const noCampVehicles = base.map((v) => ({
        ...v,
        campaignStatus: "none" as CampaignStatus,
      }))
      return {
        overview: {
          ...mockCapitalOverview,
          velocityScore: 42,
          capitalSavedThisMonth: 64_000,
          capitalAtRisk: 580_000,
          avgDaysToLive: 14.2,
          deltas: {
            ...mockCapitalOverview.deltas,
            velocityScore: -14.8,
            capitalSaved: -38.2,
            capitalAtRisk: 18.6,
            daysToLive: -4.2,
          },
          trends: {
            dailyBurn: [12200, 12400, 12500, 12600, 12600, 12640, 12640],
            capitalSaved: [120000, 108000, 96000, 86000, 78000, 72000, 64000],
            capitalAtRisk: [380000, 412000, 446000, 480000, 520000, 554000, 580000],
          },
        },
        aging: mockAgingStages.map((s) => ({
          ...s,
          marginExposurePercent: +(s.marginExposurePercent * 1.3).toFixed(1),
          avgLeadVelocity: +(s.avgLeadVelocity * 0.6).toFixed(1),
        })),
        vehicles: noCampVehicles,
      }
    }

    case "high-engagement": {
      const hotVehicles = base.map((v) => ({
        ...v,
        leads: Math.round(v.leads * 2.6 + 6),
        ctr: +(v.ctr * 1.8).toFixed(1),
        appointments: Math.round(v.appointments * 2.2 + 2),
        mediaType: (v.mediaType === "real" ? "real" : "clone") as MediaType,
        campaignStatus: (Math.random() > 0.3 ? "active" : v.campaignStatus) as CampaignStatus,
      }))
      return {
        overview: {
          ...mockCapitalOverview,
          velocityScore: 84,
          capitalSavedThisMonth: 248_000,
          capitalAtRisk: 286_000,
          avgDaysToLive: 22.8,
          deltas: {
            ...mockCapitalOverview.deltas,
            velocityScore: 9.6,
            capitalSaved: 24.8,
            capitalAtRisk: -12.4,
            daysToLive: 4.6,
          },
          trends: {
            dailyBurn: [13800, 13400, 13000, 12800, 12600, 12400, 12200],
            capitalSaved: [168000, 184000, 200000, 214000, 228000, 238000, 248000],
            capitalAtRisk: [382000, 362000, 340000, 322000, 308000, 296000, 286000],
          },
        },
        aging: mockAgingStages.map((s) => ({
          ...s,
          avgLeadVelocity: +(s.avgLeadVelocity * 2.2).toFixed(1),
        })),
        vehicles: hotVehicles,
      }
    }

    case "images-only": {
      const imgVehicles = base.map((v) => ({
        ...v,
        mediaType: "none" as MediaType,
        campaignStatus: "none" as CampaignStatus,
        leads: Math.max(0, Math.round(v.leads * 0.4)),
        ctr: +(v.ctr * 0.5).toFixed(1),
        appointments: Math.max(0, Math.round(v.appointments * 0.3)),
        attractionRisk: (v.daysInStock > 30 ? "low-conversion" : "below-benchmark") as "low-conversion" | "below-benchmark" | "optimized",
      }))
      return {
        overview: {
          ...mockCapitalOverview,
          velocityScore: 34,
          capitalSavedThisMonth: 42_000,
          capitalAtRisk: 720_000,
          avgDaysToLive: 11.4,
          deltas: {
            ...mockCapitalOverview.deltas,
            velocityScore: -22.1,
            capitalSaved: -48.6,
            capitalAtRisk: 26.4,
            daysToLive: -6.8,
          },
          trends: {
            dailyBurn: [12800, 13000, 13200, 13300, 13400, 13400, 13500],
            capitalSaved: [98000, 86000, 74000, 64000, 56000, 48000, 42000],
            capitalAtRisk: [480000, 520000, 568000, 620000, 660000, 694000, 720000],
          },
        },
        aging: mockAgingStages.map((s) => ({
          ...s,
          avgLeadVelocity: +(s.avgLeadVelocity * 0.4).toFixed(1),
          marginExposurePercent: +(s.marginExposurePercent * 1.4).toFixed(1),
        })),
        vehicles: imgVehicles,
      }
    }

    case "studio-only": {
      const studioVehicles = base.map((v) => ({
        ...v,
        mediaType: "real" as MediaType,
        campaignStatus: "none" as CampaignStatus,
        leads: Math.round(v.leads * 0.9 + 1),
        ctr: +(v.ctr * 1.1).toFixed(1),
        appointments: Math.max(0, Math.round(v.appointments * 0.5)),
      }))
      return {
        overview: {
          ...mockCapitalOverview,
          velocityScore: 58,
          capitalSavedThisMonth: 128_000,
          capitalAtRisk: 420_000,
          avgDaysToLive: 18.6,
          deltas: {
            ...mockCapitalOverview.deltas,
            velocityScore: -6.2,
            capitalSaved: -12.8,
            capitalAtRisk: 8.4,
            daysToLive: -2.4,
          },
          trends: {
            dailyBurn: [12400, 12300, 12200, 12200, 12100, 12100, 12000],
            capitalSaved: [164000, 156000, 148000, 142000, 136000, 132000, 128000],
            capitalAtRisk: [340000, 356000, 372000, 388000, 400000, 412000, 420000],
          },
        },
        aging: mockAgingStages.map((s) => ({
          ...s,
          avgLeadVelocity: +(s.avgLeadVelocity * 0.85).toFixed(1),
          marginExposurePercent: +(s.marginExposurePercent * 1.15).toFixed(1),
        })),
        vehicles: studioVehicles,
      }
    }

    case "cloned-aging": {
      const cloneAgeVehicles = base.map((v) => {
        const ageDays = Math.floor(18 + Math.random() * 25)
        return {
          ...v,
          mediaType: "clone" as MediaType,
          daysInStock: ageDays,
          leads: Math.max(0, Math.round(v.leads * 0.55 - ageDays * 0.08)),
          ctr: +(v.ctr * 0.6).toFixed(1),
          appointments: Math.max(0, Math.round(v.appointments * 0.4)),
          attractionRisk: (ageDays > 30 ? "low-conversion" : "below-benchmark") as "low-conversion" | "below-benchmark" | "optimized",
          stage: (ageDays > 35 ? "risk" : ageDays > 20 ? "watch" : "fresh") as VehicleStage,
        }
      })
      return {
        overview: {
          ...mockCapitalOverview,
          velocityScore: 46,
          capitalSavedThisMonth: 82_000,
          capitalAtRisk: 620_000,
          avgDaysToLive: 13.2,
          deltas: {
            ...mockCapitalOverview.deltas,
            velocityScore: -12.4,
            capitalSaved: -24.8,
            capitalAtRisk: 18.6,
            daysToLive: -4.8,
          },
          trends: {
            dailyBurn: [11800, 12000, 12200, 12400, 12500, 12600, 12640],
            capitalSaved: [142000, 128000, 116000, 104000, 96000, 88000, 82000],
            capitalAtRisk: [420000, 460000, 500000, 540000, 574000, 600000, 620000],
          },
        },
        aging: mockAgingStages.map((s) => ({
          ...s,
          avgLeadVelocity: +(s.avgLeadVelocity * 0.58).toFixed(1),
          marginExposurePercent: +(s.marginExposurePercent * 1.3).toFixed(1),
        })),
        vehicles: cloneAgeVehicles,
      }
    }

    case "return-user":
      return {
        overview: mockCapitalOverview,
        aging: mockAgingStages,
        vehicles: base,
      }

    default:
      return {
        overview: mockCapitalOverview,
        aging: mockAgingStages,
        vehicles: base,
      }
  }
}
