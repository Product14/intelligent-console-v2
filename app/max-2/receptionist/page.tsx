"use client"

import { Suspense } from "react"
import { ConsoleV2ReceptionistExperience } from "@/components/max-2/receptionist/console-v2-receptionist-experience"

export default function ReceptionistPage() {
  return (
    <Suspense fallback={null}>
      <ConsoleV2ReceptionistExperience />
    </Suspense>
  )
}
