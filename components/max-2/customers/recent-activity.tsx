"use client"

import { mockCustomerActivities, mockCustomers } from "@/lib/max-2-mocks"
import type { CustomerActivity } from "@/services/max-2/max-2.types"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  Phone,
  Mail,
  MessageSquare,
  MapPin,
  Car,
  Calendar,
  FileText,
  CheckCircle,
} from "lucide-react"

const activityMeta: Record<
  CustomerActivity["type"],
  { icon: typeof Phone; dot: string; label: string }
> = {
  call: { icon: Phone, dot: "bg-gray-400", label: "Call" },
  email: { icon: Mail, dot: "bg-gray-400", label: "Email" },
  text: { icon: MessageSquare, dot: "bg-gray-400", label: "Text" },
  visit: { icon: MapPin, dot: "bg-gray-400", label: "Visit" },
  "test-drive": { icon: Car, dot: "bg-violet-500", label: "Test Drive" },
  appointment: { icon: Calendar, dot: "bg-gray-400", label: "Appointment" },
  "credit-app": { icon: FileText, dot: "bg-blue-500", label: "Credit App" },
  "deal-closed": { icon: CheckCircle, dot: "bg-emerald-500", label: "Deal Closed" },
}

function customerName(customerId: string): string {
  return mockCustomers.find((c) => c.id === customerId)?.name ?? "Unknown"
}

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Customer Activity</CardTitle>
        <CardDescription>Latest touchpoints across your team</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-0">
          {mockCustomerActivities.map((a, idx) => {
            const meta = activityMeta[a.type]
            const Icon = meta.icon
            const isLast = idx === mockCustomerActivities.length - 1

            return (
              <div key={a.id} className="relative flex gap-3 pb-5">
                {/* timeline connector */}
                {!isLast && (
                  <div className="absolute left-[13px] top-7 bottom-0 w-px bg-border" />
                )}

                {/* dot / icon */}
                <div
                  className={cn(
                    "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-background",
                    meta.dot,
                  )}
                >
                  <Icon className="h-3.5 w-3.5 text-white" />
                </div>

                {/* content */}
                <div className="flex flex-col gap-0.5 min-w-0 pt-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{customerName(a.customerId)}</span>
                    <span
                      className={cn(
                        "text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded",
                        a.type === "deal-closed" && "bg-emerald-500/10 text-emerald-600",
                        a.type === "credit-app" && "bg-blue-500/10 text-blue-600",
                        a.type === "test-drive" && "bg-violet-500/10 text-violet-600",
                        !["deal-closed", "credit-app", "test-drive"].includes(a.type) &&
                          "bg-muted text-muted-foreground",
                      )}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <p className="text-xs text-foreground">{a.description}</p>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span>{a.timestamp}</span>
                    <span>·</span>
                    <span>{a.salesperson}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
