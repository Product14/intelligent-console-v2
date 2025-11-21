"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Clock } from "lucide-react"
import { CallsService, type TransformedCall } from "@/services"
import { ReviewFilterState, DEFAULT_REVIEW_FILTERS, type Call } from "@/lib/types"

import { useEnterprise } from "@/lib/enterprise-context"
import { useAppDispatch, useAppSelector } from "@/store"
import { selectReviewFilters } from "@/store/selectors/filtersSelectors"
import {
  selectCalls,
  selectCallsLoading,
  selectCallsError,
  selectCallsCurrentPage,
  selectCallsHasMore,
  selectCurrentCallId,
} from "@/store/selectors/callsSelectors"
import {
  addCalls,
  setCalls,
  setError as setCallsErrorAction,
  setHasMore,
  setLoading,
  setCurrentPage,
  updateCall,
  updateFilters as updateCallFilters,
} from "@/store/slices/callsSlice"

// Remove duplicate interface - using the one from calls-api.ts

interface CallsTableProps {
  onCallSelect?: (call: Call) => void
  selectedCallId?: string | null
  filters?: ReviewFilterState
  onAgentNamesChange?: (agentNames: string[]) => void
}

const PAGE_SIZE = 10

const formatDateForRange = (date: Date, boundary: "start" | "end") => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  if (boundary === "start") {
    return `${year}-${month}-${day}T00:00:00.000Z`
  }
  return `${year}-${month}-${day}T23:59:59.999Z`
}

const transformToCall = (transformed: TransformedCall): Call => ({
  id: transformed.id,
  customerName: transformed.customerName,
  customerInitials: transformed.customerInitials,
  phoneNumber: transformed.phoneNumber,
  callType: transformed.callType,
  callLength: transformed.callLength,
  timestamp: transformed.timestamp,
  callPriority: transformed.callPriority,
  status: transformed.status,
  recordingUrl: transformed.recordingUrl,
  transcript: undefined,
  aiScore: transformed.aiScore,
  sentiment: transformed.sentiment,
  intent: transformed.intent,
  actionItems: transformed.actionItems,
  duration: undefined,
  rawTranscript: undefined,
  dealershipId: undefined,
  agentId: undefined,
  agentName: transformed.agentName,
  agentType: transformed.agentType,
  qcStatus: transformed.qcStatus as Call["qcStatus"],
  qcAssignedTo: transformed.qcAssignedTo
    ? {
        id: transformed.qcAssignedTo.id,
        name: transformed.qcAssignedTo.name,
      }
    : null,
  rawApiData: transformed.rawApiData,
})

const normalizeAgentTypeParam = (agentType: string) => {
  if (!agentType || agentType === "all") {
    return undefined
  }
  return agentType
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
    .map((entry) => {
      if (entry === "sales") return "Sales"
      if (entry === "service") return "Service"
      return entry
    })
    .join(",")
}

const applyClientAgentFilters = (
  callsList: TransformedCall[],
  selectedAgentName: string,
  selectedAgentType: string
) => {
  let filtered = callsList

  if (selectedAgentName && selectedAgentName !== "all") {
    filtered = filtered.filter(
      (call) => call.agentName?.toLowerCase() === selectedAgentName.toLowerCase()
    )
  }

  if (selectedAgentType && selectedAgentType !== "all") {
    filtered = filtered.filter(
      (call) => call.agentType?.toLowerCase() === selectedAgentType.toLowerCase()
    )
  }

  return filtered
}

const buildDebugString = (params: Record<string, string | undefined>) =>
  Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => `${key}=${value}`)
    .join("&")

export interface CallsTableRef {
  updateCallStatus: (callId: string, qcStatus: string, qcAssignedTo: { id: string; name: string } | null) => void
  refreshCalls: () => Promise<void>
  getUniqueAgentNames: () => string[]
  getCalls: () => Call[]
}

export const CallsTable = React.forwardRef<CallsTableRef, CallsTableProps>(({ onCallSelect, selectedCallId: externalSelectedCallId, filters, onAgentNamesChange }, ref) => {
  const { selectedEnterprise, selectedTeam } = useEnterprise()
  const dispatch = useAppDispatch()
  const reviewFilters = useAppSelector(selectReviewFilters)
  const calls = useAppSelector(selectCalls)
  const isLoading = useAppSelector(selectCallsLoading)
  const error = useAppSelector(selectCallsError)
  const currentPage = useAppSelector(selectCallsCurrentPage)
  const hasMore = useAppSelector(selectCallsHasMore)
  const currentCallIdFromStore = useAppSelector(selectCurrentCallId)
  const effectiveFilters: ReviewFilterState = filters ?? reviewFilters ?? DEFAULT_REVIEW_FILTERS
  
  // Destructure filters with defaults
  const { 
    statusFilter = DEFAULT_REVIEW_FILTERS.statusFilter,
    startDate,
    endDate,
    selectedAgentName = DEFAULT_REVIEW_FILTERS.selectedAgentName,
    selectedAgentType = DEFAULT_REVIEW_FILTERS.selectedAgentType,
    selectedCallType = DEFAULT_REVIEW_FILTERS.selectedCallType,
    callId = DEFAULT_REVIEW_FILTERS.callId,
    durationRange = DEFAULT_REVIEW_FILTERS.durationRange,
    outcome = DEFAULT_REVIEW_FILTERS.outcome
  } = effectiveFilters
  
  // AbortController for request cancellation
  const abortControllerRef = React.useRef<AbortController | null>(null)

  const [allAgentNames, setAllAgentNames] = React.useState<string[]>([]) // Store all agent names
  const [isLoadingMore, setIsLoadingMore] = React.useState(false)
  const effectiveSelectedCallId = externalSelectedCallId ?? currentCallIdFromStore ?? null
  const [selectedCallId, setSelectedCallId] = React.useState<string | null>(effectiveSelectedCallId)
  const [lastQueryDebug, setLastQueryDebug] = React.useState<string>('')
  // Sync internal state with external prop
  React.useEffect(() => {
    setSelectedCallId(effectiveSelectedCallId || null)
  }, [effectiveSelectedCallId])
  
  // Reset agent names when enterprise or team changes
  React.useEffect(() => {
    setAllAgentNames([])
  }, [selectedEnterprise?.id, selectedEnterprise?.enterpriseId, selectedTeam?.team_id])
  
  const callRefs = React.useRef<{ [key: string]: HTMLDivElement | null }>({})
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

  const enterpriseIdentifier = selectedEnterprise?.id || selectedEnterprise?.enterpriseId
  const teamIdentifier = selectedTeam?.team_id ?? null

  const getQcStatusParam = React.useCallback(
    (mode: "standard" | "refresh" = "standard") => {
      if (statusFilter === "pending") {
        return "yet_to_start,in_progress"
      }
      if (statusFilter === "completed") {
        return mode === "refresh" ? "done,completed" : "done"
      }
      return undefined
    },
    [statusFilter]
  )

  const fetchCallsPage = React.useCallback(
    async ({
      page,
      includeAgentName,
      includeAgentType,
      qcStatus,
      fallbackQcStatus,
      signal,
    }: {
      page: number
      includeAgentName?: boolean
      includeAgentType?: boolean
      qcStatus?: string
      fallbackQcStatus?: string
      signal?: AbortSignal
    }) => {
      if (!enterpriseIdentifier || !teamIdentifier) {
        return {
          transformedCalls: [] as TransformedCall[],
          agentNames: [] as string[],
          debug: "",
          aborted: false,
        }
      }

      const normalizedAgentType = includeAgentType ? normalizeAgentTypeParam(selectedAgentType) : undefined

      const params: Parameters<typeof CallsService.getCalls>[0] = {
        enterpriseId: enterpriseIdentifier,
        teamId: teamIdentifier,
        limit: PAGE_SIZE,
        page,
      }

      const debugParams: Record<string, string | undefined> = {
        enterpriseId: enterpriseIdentifier,
        teamId: teamIdentifier,
        limit: PAGE_SIZE.toString(),
        page: page.toString(),
      }

      if (qcStatus) {
        params.qcStatus = qcStatus
        debugParams.qcStatus = qcStatus
      }

      if (includeAgentName && selectedAgentName && selectedAgentName !== "all") {
        params.agentName = selectedAgentName
        debugParams.agentName = selectedAgentName
      }

      if (normalizedAgentType) {
        params.agentType = normalizedAgentType
        debugParams.agentType = normalizedAgentType
      }

      if (startDate) {
        params.startDate = formatDateForRange(startDate, "start")
        debugParams.startDate = startDate.toISOString()
      }

      if (endDate) {
        params.endDate = formatDateForRange(endDate, "end")
        debugParams.endDate = endDate.toISOString()
      }

      if (selectedCallType && selectedCallType !== "all") {
        params.callType = selectedCallType
        debugParams.callType = selectedCallType
      }

      if (callId && callId.trim() !== "") {
        params.callId = callId.trim()
        debugParams.callId = callId.trim()
      }

      if (durationRange && durationRange !== "all") {
        params.durationRange = durationRange
        debugParams.durationRange = durationRange
      }

      if (outcome && outcome !== "all") {
        params.outcome = outcome
        debugParams.outcome = outcome
      }

      const response = await CallsService.getCalls(params, signal)

      if (signal?.aborted) {
        return {
          transformedCalls: [] as TransformedCall[],
          agentNames: [] as string[],
          debug: "",
          aborted: true,
        }
      }

      let apiCalls = response.calls
      let debugString = buildDebugString(debugParams)

      if (normalizedAgentType && apiCalls.length === 0) {
        const fallbackParams: Parameters<typeof CallsService.getCalls>[0] = { ...params }
        delete fallbackParams.agentType

        const fallbackDebugParams: Record<string, string | undefined> = { ...debugParams }
        delete fallbackDebugParams.agentType

        const qcStatusForFallback = fallbackQcStatus ?? qcStatus
        if (qcStatusForFallback) {
          fallbackParams.qcStatus = qcStatusForFallback
          fallbackDebugParams.qcStatus = qcStatusForFallback
        } else {
          delete fallbackParams.qcStatus
          delete fallbackDebugParams.qcStatus
        }

        const fallbackResponse = await CallsService.getCalls(fallbackParams, signal)
        if (signal?.aborted) {
          return {
            transformedCalls: [] as TransformedCall[],
            agentNames: [] as string[],
            debug: "",
            aborted: true,
          }
        }

        apiCalls = fallbackResponse.calls
        debugString = buildDebugString(fallbackDebugParams) + "  (fallback)"
      }

      const transformedCalls = apiCalls.map((call) => CallsService.transformCallData(call))

      const agentNames = Array.from(
        new Set(
          transformedCalls
            .map((call) => call.agentName)
            .filter((name): name is string => Boolean(name))
        )
      ).sort()

      return {
        transformedCalls,
        agentNames,
        debug: debugString,
        aborted: false,
      }
    },
    [
      enterpriseIdentifier,
      teamIdentifier,
      selectedAgentName,
      selectedAgentType,
      selectedCallType,
      startDate,
      endDate,
      callId,
      durationRange,
      outcome,
    ]
  )

  const loadMoreCalls = React.useCallback(async () => {
    if (
      isLoadingMore ||
      isLoading ||
      !hasMore ||
      !enterpriseIdentifier ||
      !teamIdentifier
    ) {
      return
    }

    try {
      setIsLoadingMore(true)
      dispatch(setCallsErrorAction(null))

      const nextPage = currentPage + 1
      const result = await fetchCallsPage({
        page: nextPage,
        includeAgentName: false,
        includeAgentType: selectedAgentType !== "all",
        qcStatus: selectedAgentType !== "all" ? undefined : getQcStatusParam(),
        fallbackQcStatus: getQcStatusParam(),
      })

      if (result.aborted) {
        return
      }

      const filteredTransformed = applyClientAgentFilters(
        result.transformedCalls,
        selectedAgentName,
        selectedAgentType
      )

      if (filteredTransformed.length > 0) {
        dispatch(addCalls(filteredTransformed.map(transformToCall)))
        dispatch(setCurrentPage(nextPage))
        dispatch(setHasMore(result.transformedCalls.length === PAGE_SIZE))
      } else {
        dispatch(setHasMore(false))
      }

      setLastQueryDebug(result.debug)
    } catch (error) {
      console.error("Error loading more calls:", error)
      dispatch(setCallsErrorAction("Failed to load more calls."))
    } finally {
      setIsLoadingMore(false)
    }
  }, [
    dispatch,
    fetchCallsPage,
    getQcStatusParam,
    hasMore,
    currentPage,
    isLoading,
    isLoadingMore,
    selectedAgentName,
    selectedAgentType,
    enterpriseIdentifier,
    teamIdentifier,
  ])

  React.useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    setSelectedCallId(null)
    dispatch(setCalls([]))
    dispatch(setHasMore(true))
    dispatch(setCallsErrorAction(null))
    dispatch(setLoading(true))

    dispatch(
      updateCallFilters({
        status: statusFilter,
        agentName: selectedAgentName,
        agentType: selectedAgentType,
        callType: selectedCallType,
        startDate: startDate ? startDate.toISOString() : undefined,
        endDate: endDate ? endDate.toISOString() : undefined,
      })
    )

    const run = async () => {
      if (!enterpriseIdentifier || !teamIdentifier) {
        dispatch(setHasMore(false))
        dispatch(setLoading(false))
        return
      }

      try {
        const result = await fetchCallsPage({
          page: 1,
          includeAgentName: true,
          includeAgentType: selectedAgentType !== "all",
          qcStatus: getQcStatusParam(),
          fallbackQcStatus: getQcStatusParam(),
          signal: controller.signal,
        })

        if (result.aborted) {
          return
        }

        const filtered = applyClientAgentFilters(
          result.transformedCalls,
          selectedAgentName,
          selectedAgentType
        )

        dispatch(setCalls(filtered.map(transformToCall)))
        dispatch(setHasMore(result.transformedCalls.length === PAGE_SIZE))

        if (result.agentNames.length > 0) {
          let shouldNotify = false
          setAllAgentNames((prev) => {
            if (prev.length === 0) {
              shouldNotify = true
              return result.agentNames
            }
            return prev
          })
          if (shouldNotify && onAgentNamesChange) {
            onAgentNamesChange(result.agentNames)
          }
        }

        setLastQueryDebug(result.debug)
      } catch (error) {
        if (controller.signal.aborted) {
          return
        }
        console.error("Error loading calls:", error)
        dispatch(setCalls([]))
        dispatch(setHasMore(false))
        dispatch(setCallsErrorAction("Failed to load calls from the server."))
      } finally {
        if (!controller.signal.aborted) {
          dispatch(setLoading(false))
        }
      }
    }

    run()

    return () => {
      controller.abort()
    }
  }, [
    dispatch,
    enterpriseIdentifier,
    teamIdentifier,
    statusFilter,
    startDate?.getTime(),
    endDate?.getTime(),
    selectedAgentName,
    selectedAgentType,
    selectedCallType,
    callId,
    durationRange,
    outcome,
    fetchCallsPage,
    getQcStatusParam,
    onAgentNamesChange,
  ])

  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const refreshCalls = React.useCallback(async () => {
    if (!enterpriseIdentifier || !teamIdentifier) {
      dispatch(setCalls([]))
      dispatch(setHasMore(false))
      return
    }

    try {
      dispatch(setLoading(true))
      dispatch(setCallsErrorAction(null))

      const result = await fetchCallsPage({
        page: 1,
        includeAgentName: true,
        includeAgentType: selectedAgentType !== "all",
        qcStatus: getQcStatusParam("refresh"),
        fallbackQcStatus: getQcStatusParam("refresh"),
      })

      if (result.aborted) {
        return
      }

      const filtered = applyClientAgentFilters(
        result.transformedCalls,
        selectedAgentName,
        selectedAgentType
      )

      dispatch(setCalls(filtered.map(transformToCall)))
      dispatch(setHasMore(result.transformedCalls.length === PAGE_SIZE))

      if (result.agentNames.length > 0) {
        let shouldNotify = false
        setAllAgentNames((prev) => {
          if (prev.length === 0) {
            shouldNotify = true
            return result.agentNames
          }
          return prev
        })
        if (shouldNotify && onAgentNamesChange) {
          onAgentNamesChange(result.agentNames)
        }
      }

      setLastQueryDebug(result.debug)
    } catch (error) {
      console.error("Error loading calls:", error)
      dispatch(setCalls([]))
      dispatch(setCallsErrorAction("Failed to load calls from the server."))
    } finally {
      dispatch(setLoading(false))
    }
  }, [
    dispatch,
    enterpriseIdentifier,
    teamIdentifier,
    fetchCallsPage,
    getQcStatusParam,
    selectedAgentName,
    selectedAgentType,
    selectedCallType,
    onAgentNamesChange,
  ])


  // No auto-selection - let user explicitly choose which call to review
  React.useEffect(() => {
    // If the selected call exists in the list, ensure it stays selected
    if (selectedCallId) {
      const selectedCallExists = calls.some(call => call.id === selectedCallId)
      if (!selectedCallExists) {
        // The selected call is no longer in the list (filtered out, deleted, etc.)
        // Don't auto-select another call - let the user choose
        console.log('Selected call no longer in list, user must select a new one')
        // Clear the selection since it's no longer valid
        setSelectedCallId(null)
      }
    }
  }, [calls, selectedCallId])

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
    updateCallStatus: (callId: string, qcStatus: string, qcAssignedTo: { id: string; name: string } | null) => {
      // Map qcStatus to status display value (matching getStatusFromQcStatus logic)
      const getStatusFromQcStatus = (qcStatus: string): string => {
        switch (qcStatus) {
          case 'completed':
          case 'done':
            return 'Pass'
          case 'in_progress':
            return 'In Progress'
          case 'yet_to_start':
          default:
            return 'Unreviewed'
        }
      }
      
      dispatch(updateCall({
        callId,
        updates: {
          qcStatus: qcStatus as Call["qcStatus"],
          qcAssignedTo: qcAssignedTo
            ? { id: qcAssignedTo.id, name: qcAssignedTo.name }
            : null,
          status: getStatusFromQcStatus(qcStatus),
        },
      }))
    },
    refreshCalls,
    getUniqueAgentNames: () => {
      // Return stored agent names from initial load, not from filtered calls
      return allAgentNames
    },
    getCalls: () => {
      return calls
    }
  }), [allAgentNames, calls, dispatch, refreshCalls])

  const getReviewStatusBadge = (status: string) => {
    switch (status) {
      case 'Pass':
        return null; // No badge for Pass
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
        const badge = getReviewStatusBadge(call.status)

        return (
          <div
            key={call.id}
            ref={(el) => { callRefs.current[call.id] = el }}
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
                {badge && <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {badge}
                  </div>
                </div>}
                
                {/* Tertiary info - Phone number, Duration, and QC Assignee */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground/60">
                  <div className="flex items-center gap-3 truncate">
                    <span className="font-mono" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>{call.phoneNumber}</span>
                    <span className="text-muted-foreground/40">•</span>
                    <div className="flex items-center gap-1 text-muted-foreground/80">
                      <Clock className="h-3 w-3 opacity-60" />
                      <span className="font-medium" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>{call.callLength}</span>
                    </div>
                  </div>
                  
                  {/* QC Assigned User Avatar or Temporary Status */}
                  {call.qcAssignedTo && (
                    call.qcAssignedTo.name ? (
                      // Show avatar when name is available
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Avatar className="h-6 w-6 flex-shrink-0">
                              <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
                                {call.qcAssignedTo.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{call.qcAssignedTo.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      // Show temporary "Assigned" text during optimistic update
                      <span className="text-xs italic text-muted-foreground">
                        Assigned
                      </span>
                    )
                  )}
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
