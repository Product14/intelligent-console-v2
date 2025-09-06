"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock } from "lucide-react"
import { callsApiService, TransformedCall } from "@/lib/calls-api"

import { useEnterprise } from "@/lib/enterprise-context"

// Remove duplicate interface - using the one from calls-api.ts

interface CallsTableProps {
  onCallSelect?: (call: TransformedCall) => void
  selectedCallId?: string | null
}

export interface CallsTableRef {
  updateCallStatus: (callId: string, qcStatus: string, qcAssignedTo: string | null) => void
  refreshCalls: () => Promise<void>
}

export const CallsTable = React.forwardRef<CallsTableRef, CallsTableProps>(({ onCallSelect, selectedCallId: externalSelectedCallId }, ref) => {
  const { selectedEnterprise, selectedTeam } = useEnterprise()
  const [calls, setCalls] = React.useState<TransformedCall[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isLoadingMore, setIsLoadingMore] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedCallId, setSelectedCallId] = React.useState<string | null>(externalSelectedCallId || null)

  // Sync internal state with external prop
  React.useEffect(() => {
    setSelectedCallId(externalSelectedCallId || null)
  }, [externalSelectedCallId])
  const [page, setPage] = React.useState(1)
  const [hasMore, setHasMore] = React.useState(true)

  // Helper function to generate pastel colors based on name
  const getAvatarColor = (name: string) => {
    if (!name) return { bg: 'bg-slate-200', text: 'text-slate-700' }
    
    const firstLetter = name.charAt(0).toLowerCase()
    const colors = {
      a: { bg: 'bg-red-200', text: 'text-red-800' },
      b: { bg: 'bg-orange-200', text: 'text-orange-800' },
      c: { bg: 'bg-amber-200', text: 'text-amber-800' },
      d: { bg: 'bg-yellow-200', text: 'text-yellow-800' },
      e: { bg: 'bg-lime-200', text: 'text-lime-800' },
      f: { bg: 'bg-green-200', text: 'text-green-800' },
      g: { bg: 'bg-emerald-200', text: 'text-emerald-800' },
      h: { bg: 'bg-teal-200', text: 'text-teal-800' },
      i: { bg: 'bg-cyan-200', text: 'text-cyan-800' },
      j: { bg: 'bg-sky-200', text: 'text-sky-800' },
      k: { bg: 'bg-blue-200', text: 'text-blue-800' },
      l: { bg: 'bg-indigo-200', text: 'text-indigo-800' },
      m: { bg: 'bg-violet-200', text: 'text-violet-800' },
      n: { bg: 'bg-purple-200', text: 'text-purple-800' },
      o: { bg: 'bg-fuchsia-200', text: 'text-fuchsia-800' },
      p: { bg: 'bg-pink-200', text: 'text-pink-800' },
      q: { bg: 'bg-rose-200', text: 'text-rose-800' },
      r: { bg: 'bg-red-200', text: 'text-red-800' },
      s: { bg: 'bg-orange-200', text: 'text-orange-800' },
      t: { bg: 'bg-amber-200', text: 'text-amber-800' },
      u: { bg: 'bg-yellow-200', text: 'text-yellow-800' },
      v: { bg: 'bg-lime-200', text: 'text-lime-800' },
      w: { bg: 'bg-green-200', text: 'text-green-800' },
      x: { bg: 'bg-emerald-200', text: 'text-emerald-800' },
      y: { bg: 'bg-teal-200', text: 'text-teal-800' },
      z: { bg: 'bg-cyan-200', text: 'text-cyan-800' },
    }
    
    return colors[firstLetter as keyof typeof colors] || { bg: 'bg-slate-200', text: 'text-slate-700' }
  }

  // Function to load more calls
  const loadMoreCalls = React.useCallback(async () => {
    if (isLoadingMore || !hasMore || isLoading || !(selectedEnterprise?.id || selectedEnterprise?.enterpriseId) || !selectedTeam?.team_id) {
      return
    }

    
    try {
      setIsLoadingMore(true)
      setError(null)
      
      const response = await callsApiService.getCalls({
        enterpriseId: selectedEnterprise.id || selectedEnterprise.enterpriseId,
        teamId: selectedTeam.team_id,
        limit: 10,
        page: page + 1,
        qcStatus: 'yet_to_start,in_progress' // Only show calls that need QC
      })
      
      
      const transformedCalls = response.calls.map(call => 
        callsApiService.transformCallData(call)
      )
      
      if (transformedCalls.length > 0) {
        setCalls(prev => {
          const newCalls = [...prev, ...transformedCalls]
          return newCalls
        })
        setPage(prev => prev + 1)
        setHasMore(transformedCalls.length === 10) // Has more if we got full page
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more calls:', error)
      setError('Failed to load more calls.')
    } finally {
      setIsLoadingMore(false)
    }
  }, [page, hasMore, isLoadingMore, isLoading, selectedEnterprise?.id, selectedEnterprise?.enterpriseId, selectedTeam?.team_id])

  // Load calls when enterprise/team changes (with debouncing)
  React.useEffect(() => {
    // Clear calls immediately when enterprise/team changes
    setCalls([])
    setIsLoading(true)
    setError(null)
    setSelectedCallId(null) // Clear selection immediately
    
    const loadCalls = async () => {
      // Don't load calls if enterprise/team not selected yet
      if (!(selectedEnterprise?.id || selectedEnterprise?.enterpriseId) || !selectedTeam?.team_id) {
        setCalls([])
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        
        const response = await callsApiService.getCalls({
          enterpriseId: selectedEnterprise.id || selectedEnterprise.enterpriseId,
          teamId: selectedTeam.team_id,
          limit: 10,
          page: 1,
          qcStatus: 'yet_to_start,in_progress' // Only show calls that need QC
        })
        
        const transformedCalls = response.calls.map(call => 
          callsApiService.transformCallData(call)
        )
        setCalls(transformedCalls)
        setPage(1)
        setHasMore(transformedCalls.length === 10) // Has more if we got full page
      } catch (error) {
        console.error('Error loading calls:', error)
        setError('Failed to load calls from the server.')
        setCalls([])
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce to prevent multiple calls when both enterprise and team change rapidly
    const timeoutId = setTimeout(() => {

      loadCalls()
    }, 200) // 200ms delay to batch rapid changes

    return () => clearTimeout(timeoutId)
  }, [selectedEnterprise?.id, selectedEnterprise?.enterpriseId, selectedTeam?.team_id])

  // Reusable function to load calls (for refresh functionality)
  const loadCalls = React.useCallback(async () => {
    // Don't load calls if enterprise/team not selected yet
    if (!(selectedEnterprise?.id || selectedEnterprise?.enterpriseId) || !selectedTeam?.team_id) {
      setCalls([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const response = await callsApiService.getCalls({
        enterpriseId: selectedEnterprise.id || selectedEnterprise.enterpriseId,
        teamId: selectedTeam.team_id,
        limit: 10,
        page: 1,
        qcStatus: 'yet_to_start,in_progress' // Only show calls that need QC
      })
      
      const transformedCalls = response.calls.map(call => 
        callsApiService.transformCallData(call)
      )
      setCalls(transformedCalls)
      setPage(1)
      setHasMore(transformedCalls.length === 10) // Has more if we got full page
    } catch (error) {
      console.error('Error loading calls:', error)
      setError('Failed to load calls from the server.')
      setCalls([])
    } finally {
      setIsLoading(false)
    }
  }, [selectedEnterprise?.id, selectedEnterprise?.enterpriseId, selectedTeam?.team_id])

  // Auto-select first contact on first load and after refresh
  React.useEffect(() => {
    if (calls.length > 0) {
      // If no call is selected or the selected call is no longer in the list, select the first one
      const selectedCallExists = calls.some(call => call.id === selectedCallId)
      if (!selectedCallId || !selectedCallExists) {
        const firstCall = calls[0]
        setSelectedCallId(firstCall.id)
        onCallSelect?.(firstCall)
      }
    }
  }, [calls, selectedCallId, onCallSelect])

  // Add intersection observer for infinite scroll
  const loadMoreRef = React.useRef<HTMLDivElement>(null)
  
  React.useEffect(() => {
    const loadMoreElement = loadMoreRef.current
    if (!loadMoreElement) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry && entry.isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          loadMoreCalls()
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '100px' // Trigger 100px before the element comes into view
      }
    )

    observer.observe(loadMoreElement)
    return () => {
      observer.disconnect()
    }
  }, [hasMore, isLoadingMore, isLoading, loadMoreCalls])

  // Expose methods to parent component
  React.useImperativeHandle(ref, () => ({
    updateCallStatus: (callId: string, qcStatus: string, qcAssignedTo: string | null) => {
      setCalls(prevCalls => 
        prevCalls.map(call => 
          call.id === callId 
            ? { ...call, qcStatus, qcAssignedTo, status: qcStatus === 'in_progress' ? 'In Progress' : call.status }
            : call
        )
      )
    },
    refreshCalls: loadCalls
  }))

  const getReviewStatusBadge = (status: string) => {
    switch (status) {
      case 'Pass':
        return <Badge variant="default" className="bg-green-100 text-green-800 text-xs">Pass</Badge>
      case 'Fail':
        return <Badge variant="destructive" className="text-xs">Fail</Badge>
      case 'In Progress':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200 text-xs font-semibold">In Progress</Badge>
      default:
        return <Badge variant="outline" className="text-xs">Unreviewed</Badge>
    }
  }

  // Loading state - Matches card layout exactly
  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="attio-card p-4 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-muted rounded-2xl"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Error state - Attio Style
  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="attio-heading-3 mb-2">Failed to load calls</h3>
        <p className="attio-body-small text-muted-foreground">{error}</p>
      </div>
    )
  }

  // Empty state - Attio Style
  if (calls.length === 0) {
    return (
      <div className="p-6 text-center mt-12">
        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </div>
        <h3 className="attio-heading-3 mb-2">No calls found</h3>
        <p className="attio-body-small text-muted-foreground">No calls are available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {calls.map((call) => {
        const isSelected = selectedCallId === call.id

        return (
          <div
            key={call.id}
            className={`px-5 py-4 transition-all duration-200 cursor-pointer border-b border-border/30 hover:bg-muted/40 ${
              isSelected 
                ? 'bg-primary/10 border-l-4 border-l-primary shadow-sm' 
                : ''
            }`}
            onClick={() => {
              setSelectedCallId(call.id)
              onCallSelect?.(call)
            }}
          >
            <div className="flex items-start space-x-3">
              {/* Avatar */}
              {(() => {
                const avatarColor = getAvatarColor(call.customerName)
                return (
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${avatarColor.bg}`}>
                    <span className={`font-semibold text-sm ${avatarColor.text}`}>{call.customerInitials}</span>
                  </div>
                )
              })()}
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Primary info - Name and Time */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-[15px] leading-tight text-foreground truncate pr-2">
                    {call.customerName}
                  </h3>
                  <span className="text-[11px] text-muted-foreground/70 whitespace-nowrap font-medium">
                    {call.timestamp}
                  </span>
                </div>
                
                {/* Secondary info - Status */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getReviewStatusBadge(call.status)}
                  </div>
                  
                  {/* Call type indicator */}
                  <span className={`text-[10px] px-2 py-1 rounded-md font-semibold ${
                    call.callType === 'Inbound' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {call.callType}
                  </span>
                </div>
                
                {/* Tertiary info - Phone number and Duration */}
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground/60 truncate">
                  <span className="font-mono" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>{call.phoneNumber}</span>
                  <span className="text-muted-foreground/40">•</span>
                  <div className="flex items-center gap-1 text-muted-foreground/80">
                    <Clock className="h-3 w-3 opacity-60" />
                    <span className="font-medium" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>{call.callLength}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
      
      {/* Loading more indicator */}
      {isLoadingMore && (
        <div className="px-5 py-4 border-b border-border/30 animate-pulse">
          <div className="flex items-start space-x-3">
            <div className="w-11 h-11 bg-muted rounded-full flex-shrink-0"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Intersection observer target */}
      {hasMore && <div ref={loadMoreRef} className="h-4 w-full" />}
    </div>
  )
})
