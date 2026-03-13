"use client"

import {
  ManagerScorecards,
  AccountabilityPyramid,
  DailyRhythmTracker,
  LeadershipMetrics,
  TeamRoster,
} from "@/components/spyne-max/team"

export default function TeamPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Is my team running the process, or just showing up?
        </p>
      </div>

      <ManagerScorecards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AccountabilityPyramid />
        <LeadershipMetrics />
      </div>

      <DailyRhythmTracker />

      <TeamRoster />
    </div>
  )
}
