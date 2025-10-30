"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { EnterpriseTeamSelector } from "@/components/enterprise/enterprise-team-selector"
import { ReviewFilterState, ReviewFilterUpdate } from "@/lib/types"

interface ReviewFiltersProps {
  filters: ReviewFilterState
  uniqueAgentNames: string[]
  onFiltersChange: (updates: ReviewFilterUpdate) => void
}

export function ReviewFilters({
  filters,
  uniqueAgentNames,
  onFiltersChange
}: ReviewFiltersProps) {
  const { statusFilter, startDate, endDate, selectedAgentName, selectedAgentType, selectedCallType } = filters
  const [rangePopoverOpen, setRangePopoverOpen] = useState(false)

  // Handler for range selection
  const handleRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      // Both dates selected - apply and close
      const from = new Date(range.from.getFullYear(), range.from.getMonth(), range.from.getDate(), 0, 0, 0, 0)
      const to = new Date(range.to.getFullYear(), range.to.getMonth(), range.to.getDate(), 0, 0, 0, 0)
      onFiltersChange({ startDate: from, endDate: to })
      setRangePopoverOpen(false)
    } else if (range?.from && !range.to) {
      // User selected only start date - keep popover open
      const from = new Date(range.from.getFullYear(), range.from.getMonth(), range.from.getDate(), 0, 0, 0, 0)
      onFiltersChange({ startDate: from, endDate: undefined })
      setRangePopoverOpen(false)
    }
  }

  // Handler for 'Today' button
  const handleToday = () => {
    const today = new Date()
    const normalized = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0)
    onFiltersChange({ startDate: normalized, endDate: normalized })
    setRangePopoverOpen(false)
  }

  // Handler to clear range
  const handleClearDates = () => {
    onFiltersChange({ startDate: undefined, endDate: undefined })
    setRangePopoverOpen(false)
  }

  // Summary text for button
  let dateRangeSummary = "Select date range"
  if (startDate && endDate) {
    const sameDay = startDate.toDateString() === endDate.toDateString()
    if (sameDay) {
      dateRangeSummary = format(startDate, "MMM d, yyyy")
    } else {
      dateRangeSummary = `${format(startDate, "MMM d, yyyy")} – ${format(endDate, "MMM d, yyyy")}`
    }
  } else if (startDate) {
    dateRangeSummary = `From ${format(startDate, "MMM d, yyyy")}`
  } else if (endDate) {
    dateRangeSummary = `Until ${format(endDate, "MMM d, yyyy")}`
  }

  return (
    <div className="flex-shrink-0 border-b border-border bg-card">
      <div className="px-6 py-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Enterprise/Team Selector - Now Horizontal */}
          <div className="flex-shrink-0">
            <EnterpriseTeamSelector />
          </div>
          
          {/* Date Range Filter */}
          <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-sm font-medium text-foreground whitespace-nowrap">Date Range:</span>
          <Popover open={rangePopoverOpen} onOpenChange={setRangePopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-60 justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRangeSummary}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-3">
                <Calendar
                  mode="range"
                  selected={startDate && endDate ? { from: startDate, to: endDate } : startDate ? { from: startDate, to: undefined } : undefined}
                  onSelect={handleRangeSelect}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  numberOfMonths={2}
                  showOutsideDays={false}
                />
                <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleToday}
                    className="flex-1"
                  >
                    Today
                  </Button>
                  {(startDate || endDate) && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleClearDates}
                      className="px-3"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-sm font-medium text-foreground whitespace-nowrap">Status:</span>
            <Select value={statusFilter} onValueChange={(value: 'pending' | 'completed' | 'all') => onFiltersChange({ statusFilter: value })}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="completed">Completed Reviews</SelectItem>
                <SelectItem value="all">All Calls</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Agent Type Filter */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-sm font-medium text-foreground whitespace-nowrap">Agent Type:</span>
            <Select value={selectedAgentType} onValueChange={(value: string) => onFiltersChange({ selectedAgentType: value })}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Call Type Filter */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-sm font-medium text-foreground whitespace-nowrap">Call Type:</span>
            <Select value={selectedCallType} onValueChange={(value: string) => onFiltersChange({ selectedCallType: value })}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="inbound">Inbound</SelectItem>
                <SelectItem value="outbound">Outbound</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Agent Name Filter */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-sm font-medium text-foreground whitespace-nowrap">Agent:</span>
            <Select 
              value={selectedAgentName} 
              onValueChange={(value: string) => onFiltersChange({ selectedAgentName: value })}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All Agents" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {uniqueAgentNames.map((agentName: string) => (
                  <SelectItem key={agentName} value={agentName}>{agentName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}

