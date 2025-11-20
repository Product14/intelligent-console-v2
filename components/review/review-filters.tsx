"use client"

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, Search, X } from "lucide-react"
import { format, startOfMonth, addMonths, isSameMonth, isSameDay } from "date-fns"
import { EnterpriseTeamSelector } from "@/components/enterprise/enterprise-team-selector"
import { ReviewFilterState, ReviewFilterUpdate } from "@/lib/types"
import { useAppDispatch, useAppSelector } from "@/store"
import { updateReviewFilters } from "@/store/slices/filtersSlice"
import { selectReviewFilters } from "@/store/selectors/filtersSelectors"

interface ReviewFiltersProps {
  filters?: ReviewFilterState
  uniqueAgentNames: string[]
  onFiltersChange?: (updates: ReviewFilterUpdate) => void
}

export function ReviewFilters({
  filters,
  uniqueAgentNames,
  onFiltersChange
}: ReviewFiltersProps) {
  const dispatch = useAppDispatch()
  const storeFilters = useAppSelector(selectReviewFilters)
  const activeFilters = filters ?? storeFilters
  const { statusFilter, startDate, endDate, selectedAgentName, selectedAgentType, selectedCallType, callId } = activeFilters
  const handleChange = useCallback((updates: ReviewFilterUpdate) => {
    if (onFiltersChange) {
      onFiltersChange(updates)
    } else {
      dispatch(updateReviewFilters(updates))
    }
  }, [dispatch, onFiltersChange])
  const [rangePopoverOpen, setRangePopoverOpen] = useState(false)
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(undefined)

  // Reset temp date when popover closes
  useEffect(() => {
    if (!rangePopoverOpen) {
      setTempStartDate(undefined)
    }
  }, [rangePopoverOpen])

  // Normalize date to start of day
  const normalizeDate = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
  }

  // Handler for range selection - simplified logic
  const handleRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range || !range.from) {
      setTempStartDate(undefined)
      return
    }

    const from = normalizeDate(range.from)
    
    // Case 1: Only start date selected (first click)
    if (!range.to) {
      // If clicking same date again, apply single date filter
      if (tempStartDate && isSameDay(from, tempStartDate)) {
        handleChange({ startDate: from, endDate: from })
        setTempStartDate(undefined)
        setRangePopoverOpen(false)
      } else {
        // Store temp date, don't update filters yet
        setTempStartDate(from)
      }
      return
    }

    // Case 2: Both dates selected
    const to = normalizeDate(range.to)
    
    // Case 2a: Same date clicked twice -> single date
    if (isSameDay(from, to)) {
      if (tempStartDate && isSameDay(from, tempStartDate)) {
        // Same date clicked twice - apply single date filter
        handleChange({ startDate: from, endDate: from })
        setTempStartDate(undefined)
        setRangePopoverOpen(false)
      } else {
        // First time seeing same date, wait for second click
        setTempStartDate(from)
      }
      return
    }

    // Case 2b: Two different dates -> date range
    handleChange({ startDate: from, endDate: to })
    setTempStartDate(undefined)
    setRangePopoverOpen(false)
  }

  // Handler for 'Today' button
  const handleToday = () => {
    const today = normalizeDate(new Date())
    handleChange({ startDate: today, endDate: today })
    setTempStartDate(undefined)
    setRangePopoverOpen(false)
  }

  // Handler to clear range
  const handleClearDates = () => {
    handleChange({ startDate: undefined, endDate: undefined })
    setTempStartDate(undefined)
    setRangePopoverOpen(false)
  }

  // Calendar month - show current month on right
  const calendarMonth = useMemo(() => {
    const today = new Date()
    return startOfMonth(addMonths(today, -1))
  }, [])

  // Check if right navigation should be disabled
  const isRightNavDisabled = useMemo(() => {
    const today = new Date()
    const currentMonth = startOfMonth(today)
    const rightMonth = startOfMonth(addMonths(calendarMonth, 1))
    return isSameMonth(currentMonth, rightMonth)
  }, [calendarMonth])

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
      <div className="px-6 py-4 overflow-x-auto">
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
                  selected={
                    tempStartDate 
                      ? { from: tempStartDate, to: undefined }
                      : startDate && endDate
                        ? { from: startDate, to: endDate }
                        : startDate
                          ? { from: startDate, to: undefined }
                          : undefined
                  }
                  onSelect={handleRangeSelect}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  numberOfMonths={2}
                  showOutsideDays={false}
                  defaultMonth={calendarMonth}
                  components={{
                    Chevron: ({ orientation, className, ...props }: { orientation?: 'left' | 'right' | 'up' | 'down', className?: string, [key: string]: any }) => {
                      if (orientation === 'right' && isRightNavDisabled) {
                        return (
                          <button
                            {...props}
                            className={className}
                            disabled={true}
                            aria-disabled={true}
                            style={{ cursor: 'not-allowed', opacity: 0.5 }}
                            onClick={(e) => e.preventDefault()}
                          >
                            <ChevronRightIcon className="size-4" />
                          </button>
                        )
                      }
                      
                      // Handle other orientations
                      if (orientation === 'left') {
                        return <ChevronLeftIcon className={`size-4 ${className || ''}`} {...props} />
                      }
                      
                      if (orientation === 'right') {
                        return <ChevronRightIcon className={`size-4 ${className || ''}`} {...props} />
                      }
                      
                      return <ChevronDownIcon className={`size-4 ${className || ''}`} {...props} />
                    }
                  }}
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
            <Select value={statusFilter} onValueChange={(value: 'pending' | 'completed' | 'all') => handleChange({ statusFilter: value })}>
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
            <Select value={selectedAgentType} onValueChange={(value: string) => handleChange({ selectedAgentType: value })}>
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
            <Select value={selectedCallType} onValueChange={(value: string) => handleChange({ selectedCallType: value })}>
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
              onValueChange={(value: string) => handleChange({ selectedAgentName: value })}
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

          {/* Call ID Filter */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-sm font-medium text-foreground whitespace-nowrap">Call ID:</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Paste call ID..."
                value={callId || ''}
                onChange={(e) => handleChange({ callId: e.target.value.trim() })}
                className="w-64 pl-9 pr-9"
              />
              {callId && callId.trim() !== '' && (
                <button
                  type="button"
                  onClick={() => handleChange({ callId: '' })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear call ID filter"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

