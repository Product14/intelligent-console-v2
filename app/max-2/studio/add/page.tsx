"use client"

import { Plus } from "lucide-react"
import { AddVehiclePage } from "@/components/max-2/studio/add-vehicle-page"
import { max2Classes } from "@/lib/design-system/max-2"

export default function AddVehicleRoute() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Plus className="h-4.5 w-4.5 text-primary" />
        </div>
        <div>
          <h1 className={max2Classes.pageTitle}>Add New Vehicle</h1>
          <p className={max2Classes.pageDescription}>
            Choose how to add vehicles to your inventory.
          </p>
        </div>
      </div>

      <AddVehiclePage />
    </div>
  )
}
