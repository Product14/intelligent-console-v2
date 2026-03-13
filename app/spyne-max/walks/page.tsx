"use client"

import { WalkBoard, WalkCompliance } from "@/components/spyne-max/walks"

export default function WalksPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Lot Walks</h1>
        <p className="text-sm text-muted-foreground">
          Which vehicles need my eyes today?
        </p>
      </div>

      <WalkBoard />
      <WalkCompliance />
    </div>
  )
}
