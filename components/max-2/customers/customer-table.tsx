"use client"

import * as React from "react"
import { mockCustomers } from "@/lib/max-2-mocks"
import type { CustomerStatus, CustomerSource } from "@/services/max-2/max-2.types"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { Search, ExternalLink } from "lucide-react"

const statusBadge: Record<CustomerStatus, { label: string; className: string }> = {
  "active-lead": { label: "Active Lead", className: "bg-blue-500/10 text-blue-600 border-blue-200" },
  sold: { label: "Sold", className: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
  "service-only": { label: "Service Only", className: "bg-violet-500/10 text-violet-600 border-violet-200" },
  lost: { label: "Lost", className: "bg-gray-500/10 text-gray-500 border-gray-200" },
  "be-back": { label: "Be-Back", className: "bg-amber-500/10 text-amber-600 border-amber-200" },
}

const sourceBadge: Record<CustomerSource, { label: string; className: string }> = {
  website: { label: "Website", className: "bg-blue-500/10 text-blue-600 border-blue-200" },
  "walk-in": { label: "Walk-in", className: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
  phone: { label: "Phone", className: "bg-amber-500/10 text-amber-600 border-amber-200" },
  referral: { label: "Referral", className: "bg-violet-500/10 text-violet-600 border-violet-200" },
  "service-lane": { label: "Service Lane", className: "bg-cyan-500/10 text-cyan-600 border-cyan-200" },
  "third-party": { label: "Third Party", className: "bg-gray-500/10 text-gray-500 border-gray-200" },
}

function JourneyDot({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className={cn(
          "h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center text-[8px] font-bold",
          done
            ? "bg-emerald-500 border-emerald-500 text-white"
            : "border-gray-300 bg-transparent text-transparent dark:border-gray-600",
        )}
      >
        {done ? "✓" : ""}
      </span>
      <span className="text-[9px] text-muted-foreground leading-none">{label}</span>
    </div>
  )
}

export function CustomerTable() {
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [sourceFilter, setSourceFilter] = React.useState<string>("all")

  const filtered = mockCustomers.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false
    if (sourceFilter !== "all" && c.source !== sourceFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (
        !c.name.toLowerCase().includes(q) &&
        !c.email.toLowerCase().includes(q) &&
        !c.phone.includes(q)
      )
        return false
    }
    return true
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Board</CardTitle>
        <CardDescription>
          Every customer in your pipeline — filter, sort, and act
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name, email, or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active-lead">Active Lead</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="service-only">Service Only</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
              <SelectItem value="be-back">Be-Back</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="walk-in">Walk-in</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="service-lane">Service Lane</SelectItem>
              <SelectItem value="third-party">Third Party</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[140px]">Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Salesperson</TableHead>
                <TableHead className="min-w-[140px]">Vehicle Interest</TableHead>
                <TableHead>Last Contact</TableHead>
                <TableHead className="text-center">Touches</TableHead>
                <TableHead className="text-center">Journey</TableHead>
                <TableHead className="min-w-[180px]">Notes</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => {
                const sb = statusBadge[c.status]
                const srcb = sourceBadge[c.source]
                const isBeBack = c.status === "be-back"
                const isNewLead = c.status === "active-lead" && c.totalTouchpoints === 1

                return (
                  <TableRow
                    key={c.id}
                    className={cn(
                      isBeBack && "bg-amber-50/60 dark:bg-amber-950/15",
                      isNewLead && "bg-blue-50/60 dark:bg-blue-950/15",
                    )}
                  >
                    <TableCell>
                      <div className="font-medium text-sm">{c.name}</div>
                      <div className="text-[11px] text-muted-foreground">{c.phone}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[11px]", sb.className)}>
                        {sb.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[11px]", srcb.className)}>
                        {srcb.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{c.assignedSalesperson}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        {c.vehicleInterests.length > 0
                          ? c.vehicleInterests.map((v) => (
                              <span key={v} className="text-xs">
                                {v}
                              </span>
                            ))
                          : <span className="text-xs text-muted-foreground">—</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {c.lastContactDate}
                    </TableCell>
                    <TableCell className="text-center text-sm font-medium">
                      {c.totalTouchpoints}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1.5">
                        <JourneyDot done={c.appointmentSet} label="Apt" />
                        <JourneyDot done={c.testDriveCompleted} label="TD" />
                        <JourneyDot done={c.creditAppSubmitted} label="CA" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-muted-foreground line-clamp-2 max-w-[200px]">
                        {c.notes}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-sm text-muted-foreground py-8">
                    No customers match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
