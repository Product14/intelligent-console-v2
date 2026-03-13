"use client"

import {
  StoreGrade,
  DeskKPIs,
  MorningPlan,
  UrgentActions,
  WeeklyProfitReview,
} from "@/components/spyne-max/my-desk"

export default function MyDeskPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Desk</h1>
        <p className="text-sm text-muted-foreground mt-1">
          What you need to know before you pick up the phone or walk the lot.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
        <StoreGrade />
        <DeskKPIs />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MorningPlan />
        <UrgentActions />
      </div>

      <WeeklyProfitReview />
    </div>
  )
}
