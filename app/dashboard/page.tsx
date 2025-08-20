import { AppShell } from "@/components/app-shell"
// import { DashboardFilters } from "@/components/dashboard/dashboard-filters"
// import { KpiCards } from "@/components/dashboard/kpi-cards"
// import { TopEnumsChart } from "@/components/charts/top-enums-chart"
// import { TrendChart } from "@/components/charts/trend-chart"
// import { ResolutionFunnelChart } from "@/components/charts/resolution-funnel-chart"
// import { EnumsTable } from "@/components/dashboard/enums-table"

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">QA Status Dashboard</h1>
          <p className="text-muted-foreground">Analytics and insights for quality assurance performance.</p>
        </div>

        {/* <DashboardFilters />

        <KpiCards />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopEnumsChart />
          <TrendChart />
        </div>

        <ResolutionFunnelChart />

        <EnumsTable /> */}
        
        <div className="p-8 text-center text-muted-foreground">
          <p>Dashboard components temporarily disabled for build fix</p>
        </div>
      </div>
    </AppShell>
  )
}
