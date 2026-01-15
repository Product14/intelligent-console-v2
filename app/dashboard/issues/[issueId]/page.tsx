"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmptyState } from "@/components/ui/empty-state"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, FileX, Search, X } from "lucide-react"
import { dashboardApiService, type IssueCall } from "@/lib/dashboard-api"
import { useToast } from "@/hooks/use-toast"
import { getEnumCategoryLabel } from "@/lib/enum-api"
import { InlineAudioPlayer } from "@/components/audio/inline-audio-player"

export default function IssueCallsPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const issueId = params.issueId as string
  const { toast } = useToast()
  
  // Get issue details from URL params
  const issueTitle = searchParams.get('title') || 'Unknown Issue'
  const issueCode = searchParams.get('code') || ''
  const issueCategory = issueCode ? (getEnumCategoryLabel(issueCode as any) || 'Other') : 'Other'
  
  // State for calls data
  const [calls, setCalls] = useState<IssueCall[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Audio player state - track which row is currently playing (by index)
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)

  // Track which items are being updated
  const [updatingStatus, setUpdatingStatus] = useState<Set<string>>(new Set())

  // Search state
  const [searchQuery, setSearchQuery] = useState("")
  const [activeSearch, setActiveSearch] = useState("")

  // Infinite scroll ref
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastElementRef = useRef<HTMLTableRowElement | null>(null)

  // Load calls from API
  const loadCalls = useCallback(async (page: number = 1, resetData: boolean = true, callIdSearch?: string) => {
    try {
      if (page === 1) {
        setIsLoading(true)
      } else {
        setIsLoadingMore(true)
      }

      const response = await dashboardApiService.getIssueCalls(issueId, page, 10, callIdSearch || undefined)
      
      if (resetData || page === 1) {
        setCalls(response.data)
        // Reset playing state when data is reset
        setPlayingIndex(null)
      } else {
        setCalls(prev => [...prev, ...response.data])
      }
      
      setHasNextPage(response.pagination.hasNextPage)
      setCurrentPage(response.pagination.currentPage)
      setTotalItems(response.pagination.totalItems)
      
    } catch (error) {
      console.error('Error loading calls:', error)
      setError('Failed to load calls data. Please try again.')
      toast({
        title: "Error Loading Calls",
        description: "Failed to load calls data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [issueId, toast])

  // Load more calls for infinite scroll
  const loadMoreCalls = useCallback(async () => {
    if (!hasNextPage || isLoadingMore) return
    await loadCalls(currentPage + 1, false, activeSearch)
  }, [hasNextPage, isLoadingMore, currentPage, loadCalls, activeSearch])

  // Handle search button click
  const handleSearch = useCallback(() => {
    setActiveSearch(searchQuery)
    loadCalls(1, true, searchQuery)
  }, [searchQuery, loadCalls])

  // Handle cancel/clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery("")
    setActiveSearch("")
    loadCalls(1, true, "")
  }, [loadCalls])

  // Setup intersection observer for infinite scroll
  const setupObserver = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect()

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting && hasNextPage && !isLoadingMore) {
          loadMoreCalls()
        }
      },
      { threshold: 0.1 }
    )

    if (lastElementRef.current) {
      observerRef.current.observe(lastElementRef.current)
    }
  }, [hasNextPage, isLoadingMore, loadMoreCalls])

  // Initial load
  useEffect(() => {
    loadCalls(1, true)
  }, [loadCalls])

  // Setup observer when calls change
  useEffect(() => {
    setupObserver()
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [setupObserver, calls])


  const getSeverityBadge = (severity: string) => {
    const colorClass = severity === "high" ? "bg-red-100 text-red-700 border-red-200" :
                      severity === "medium" ? "bg-amber-100 text-amber-700 border-amber-200" :
                      "bg-green-100 text-green-700 border-green-200"
    
    return (
      <Badge className={`${colorClass} text-xs border`}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    )
  }

  const formatSeconds = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string): string => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return '-'
    }
  }

  const truncateNote = (note: string, maxLength: number = 30) => {
    if (!note || note.length <= maxLength) return note || '-'
    return note.substring(0, maxLength) + '...'
  }

  const truncateTranscript = (transcript: string, maxLength: number = 50) => {
    if (!transcript || transcript.length <= maxLength) return transcript || '-'
    return transcript.substring(0, maxLength) + '...'
  }

  const handlePlayPause = useCallback((index: number) => {
    // If this row is already playing, pause it; otherwise play it
    setPlayingIndex(prev => prev === index ? null : index)
  }, [])

  const handleStatusToggle = useCallback(async (_id: string, currentStatus: 'resolved' | 'unresolved') => {
    // Prevent multiple updates to the same item
    if (updatingStatus.has(_id)) return

    try {
      // Add to updating set
      setUpdatingStatus(prev => new Set(prev).add(_id))

      // Toggle the status
      const newStatus = currentStatus === 'resolved' ? 'unresolved' : 'resolved'

      // Call API to update status
      await dashboardApiService.updateIssueCallStatus(_id, newStatus)

      // Update local state
      setCalls(prev => prev.map(call => 
        call._id === _id ? { ...call, status: newStatus } : call
      ))

      toast({
        title: "Status Updated",
        description: `Issue status updated to ${newStatus}`,
      })
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      })
    } finally {
      // Remove from updating set
      setUpdatingStatus(prev => {
        const newSet = new Set(prev)
        newSet.delete(_id)
        return newSet
      })
    }
  }, [updatingStatus, toast])

  // Commented out: Click handler for future implementation
  // const handleCallClick = (callId: string) => {
  //   router.push(`/review?callId=${callId}`)
  // }

  if (error) {
    return (
      <AppShell>
        <div className="w-full px-6 h-full flex flex-col">
          <div className="flex-1 overflow-auto py-8">
            <div className="max-w-7xl mx-auto">
              <EmptyState
                icon={<FileX className="h-8 w-8 text-muted-foreground" />}
                heading="Error loading data"
                subheading={error}
                ctaLabel="Back to Dashboard"
                onCtaClick={() => router.push('/dashboard')}
              />
            </div>
          </div>
        </div>
      </AppShell>
    )
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="w-full px-6 h-full flex flex-col">
          <div className="flex-1 overflow-auto py-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center">
                <h2 className="text-xl font-semibold">Loading...</h2>
                <p className="text-muted-foreground">Please wait while we load the data.</p>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="w-full px-6 h-full flex flex-col">
        <div className="flex-1 overflow-auto py-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      // Navigate back to dashboard with preserved filters from URL
                      const currentParams = new URLSearchParams(searchParams.toString())
                      // Remove issue-specific params but keep filter params
                      currentParams.delete("title")
                      currentParams.delete("code")
                      const filterParams = currentParams.toString()
                      router.push(`/dashboard${filterParams ? `?${filterParams}` : ""}`)
                    }}
                    className="text-muted-foreground hover:text-foreground p-2 h-8 w-8"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-xl font-semibold tracking-tight text-foreground">{issueTitle}</h2>
                  <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                    {issueCategory}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground ml-11">
                  All calls where this issue was identified ({totalItems} total)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input 
                    type="text" 
                    placeholder="Search by Call ID..." 
                    value={searchQuery}
                    onChange={(e) => {
                      const value = e.target.value
                      setSearchQuery(value)
                      // Auto-clear when input is emptied and there was an active search
                      if (!value.trim() && activeSearch) {
                        handleClearSearch()
                      }
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-64 h-9 pl-9 pr-4 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all duration-200 shadow-sm hover:border-muted-foreground/50"
                  />
                </div>
                <Button 
                  variant={activeSearch ? "outline" : "default"} 
                  size="sm" 
                  onClick={activeSearch ? handleClearSearch : handleSearch}
                  disabled={!searchQuery.trim()}
                  className="h-9 "
                >
                 { activeSearch ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
                 { activeSearch ? 'Clear' : 'Search' }
                </Button>
          
              </div>
            </div>

            {/* Commented out: Filters section for future implementation */}
            {/* 
            <div className="flex flex-wrap gap-3 items-center">
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger className="w-auto min-w-[140px] bg-white/90 backdrop-blur-sm border-border/50">
                  <SelectValue placeholder="All Agents">
                    {selectedAgent === "all" ? "All Agents" : selectedAgent}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-md border-border/50">
                  <SelectItem value="all" className="text-foreground hover:bg-muted/50">All Agents</SelectItem>
                </SelectContent>
              </Select>
            </div>
            */}

            {/* Calls Table */}
            <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
              <CardHeader className="pb-6">
                <CardTitle className="text-lg font-semibold text-foreground">
                  All Calls with This Issue ({calls.length} loaded)
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Complete list of calls where this specific issue was identified and marked
                </CardDescription>
              </CardHeader>
              <CardContent>
                {calls.length === 0 && !isLoading ? (
                  <EmptyState
                    icon={<FileX className="h-8 w-8 text-muted-foreground" />}
                    heading="No calls found"
                    subheading="No calls found with this issue."
                  />
                ) : (
                  <div className="w-full overflow-x-auto">
                    <Table className="min-w-full">
                      <TableHeader>
                        <TableRow className="bg-secondary/60 backdrop-blur-sm">
                          <TableHead className="font-semibold text-foreground py-3 px-4">Call ID</TableHead>
                          <TableHead className="font-semibold text-foreground py-3 px-4">Enterprise ID</TableHead>
                          <TableHead className="font-semibold text-foreground py-3 px-4">Enterprise Name</TableHead>
                          <TableHead className="font-semibold text-foreground py-3 px-4">Team ID</TableHead>
                          <TableHead className="font-semibold text-foreground py-3 px-4">Team Name</TableHead>
                          <TableHead className="font-semibold text-foreground py-3 px-4">Note</TableHead>
                          <TableHead className="font-semibold text-foreground py-3 px-4">Transcript</TableHead>
                          <TableHead className="font-semibold text-foreground py-3 px-4">Severity</TableHead>
                          <TableHead className="font-semibold text-foreground py-3 px-4">Time in Call</TableHead>
                          <TableHead className="font-semibold text-foreground py-3 px-4">Created At</TableHead>
                          <TableHead className="font-semibold text-foreground py-3 px-4">Audio</TableHead>
                          <TableHead className="font-semibold text-foreground py-3 px-4">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {calls.map((call, index) => {
                          const isLastElement = index === calls.length - 1
                          
                          return (
                            <TableRow 
                              key={index}
                              ref={isLastElement ? lastElementRef : null}
                              className="hover:bg-muted/50 transition-all duration-200 hover:bg-white/80 backdrop-blur-sm"
                              style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}
                              // Commented out: Click handler for future implementation
                              // onClick={() => handleCallClick(call.callId)}
                              // title="Click to review this call"
                            >
                              <TableCell className="py-4 px-4">
                                <span className="text-sm text-foreground font-mono">{call.callId}</span>
                              </TableCell>
                              <TableCell className="py-4 px-4">
                                <span className="text-sm text-foreground font-mono">{call.enterpriseId}</span>
                              </TableCell>
                              <TableCell className="py-4 px-4">
                                <span className="text-sm text-foreground">{call.enterpriseName}</span>
                              </TableCell>
                              <TableCell className="py-4 px-4">
                                <span className="text-sm text-foreground font-mono">{call.teamId}</span>
                              </TableCell>
                              <TableCell className="py-4 px-4">
                                <span className="text-sm text-foreground">{call.teamName || '-'}</span>
                              </TableCell>
                              <TableCell className="py-4 px-4">
                                {call.note && call.note.length > 30 ? (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="text-sm text-foreground cursor-help">
                                          {truncateNote(call.note)}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-md">
                                        <p className="whitespace-pre-wrap">{call.note}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                ) : (
                                  <span className="text-sm text-foreground">{call.note || '-'}</span>
                                )}
                              </TableCell>
                              <TableCell className="py-4 px-4">
                                {call.transcript && call.transcript.length > 50 ? (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="text-sm text-foreground cursor-help">
                                          {truncateTranscript(call.transcript)}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-md">
                                        <p className="whitespace-pre-wrap">{call.transcript}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                ) : (
                                  <span className="text-sm text-foreground">{call.transcript || '-'}</span>
                                )}
                              </TableCell>
                              <TableCell className="py-4 px-4">
                                {getSeverityBadge(call.severity)}
                              </TableCell>
                              <TableCell className="py-4 px-4">
                                <span className="text-sm text-foreground">{formatSeconds(call.secondsFromStart)}</span>
                              </TableCell>
                              <TableCell className="py-4 px-4">
                                <span className="text-sm text-foreground">{formatDate(call.createdAt)}</span>
                              </TableCell>
                              <TableCell className="py-4 px-4">
                                {call.callRecordingUrl ? (
                                  <InlineAudioPlayer
                                    recordingUrl={call.callRecordingUrl}
                                    callId={`${index}`}
                                    isPlaying={playingIndex === index}
                                    onPlayPause={() => handlePlayPause(index)}
                                  />
                                ) : (
                                  <span className="text-xs text-muted-foreground">No audio</span>
                                )}
                              </TableCell>
                              <TableCell className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={call.status === 'resolved'}
                                    onCheckedChange={() => handleStatusToggle(call._id, call.status)}
                                    disabled={updatingStatus.has(call._id)}
                                    className="data-[state=checked]:bg-green-500"
                                  />
                                  <span className={`text-xs font-medium ${call.status === 'resolved' ? 'text-green-600' : 'text-amber-600'}`}>
                                    {call.status === 'resolved' ? 'Resolved' : 'Unresolved'}
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                        {isLoadingMore && (
                          <TableRow>
                            <TableCell colSpan={12} className="text-center py-4">
                              <div className="flex items-center justify-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                <span className="text-sm text-muted-foreground">Loading more calls...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
