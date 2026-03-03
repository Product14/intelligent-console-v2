"use client"

import { AutomationToggles } from "@/components/spyne-x"
import { Settings2 } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-0">
      <div className="border-b bg-white -mx-6 -mt-6 px-6 py-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 text-white">
            <Settings2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Automation & Settings</h1>
            <p className="text-sm text-muted-foreground">Configure automated risk and opportunity workflows</p>
          </div>
        </div>
      </div>

      <AutomationToggles />
    </div>
  )
}
