"use client"

import { useState, useMemo, useEffect, useRef, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmptyState } from "@/components/ui/empty-state"
import { DatePicker } from "@/components/ui/date-picker"
import { Search, ChevronUp, ChevronDown, FileX, Building2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { dashboardApiService, type DashboardIssueStats, type DashboardFilters } from "@/lib/dashboard-api"
import { DashboardShimmer } from "@/components/dashboard/dashboard-shimmer"
import { useToast } from "@/hooks/use-toast"
import { getEnumCategoryLabel } from "@/lib/enum-api"
import { useEnterprise } from "@/lib/enterprise-context"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"





function IssuesManagement() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { 
    selectedEnterprise, 
    selectedTeam, 
    enterprises,
    searchEnterprises,
    isLoadingEnterprises,
    clearSearchAndReload 
  } = useEnterprise()
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedDateRange, setSelectedDateRange] = useState("all")
  const [customDateFrom, setCustomDateFrom] = useState<Date | undefined>(undefined)
  const [customDateTo, setCustomDateTo] = useState<Date | undefined>(undefined)
  const [selectedSeverity, setSelectedSeverity] = useState("all")
  const [selectedAgentType, setSelectedAgentType] = useState("all")
  const [selectedAgentCallType, setSelectedAgentCallType] = useState("all")
  const [selectedEnterpriseId, setSelectedEnterpriseId] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  
  // Enterprise search states
  const [isEnterpriseDropdownOpen, setIsEnterpriseDropdownOpen] = useState(false)
  const [localEnterpriseSearchTerm, setLocalEnterpriseSearchTerm] = useState("")
  const [isSearchingEnterprises, setIsSearchingEnterprises] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
  
  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  
  // API data states
  const [issues, setIssues] = useState<DashboardIssueStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  // Infinite scroll ref
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastElementRef = useRef<HTMLTableRowElement | null>(null)
  
  // Add a new state to store the selected enterprise name
  const [selectedEnterpriseName, setSelectedEnterpriseName] = useState<string>("All Enterprises")
  
  // Extract URL parameters for enterprise and team if provided
  const urlEnterpriseId = searchParams.get('enterprise_id')
  const urlTeamId = searchParams.get('team_id')
  const urlToken = searchParams.get('token')

  // Helper function to calculate date range
  const getDateRangeParams = useCallback(() => {
    const now = new Date()
    let startDate: string | undefined
    let endDate: string | undefined

    switch (selectedDateRange) {
      case "7d":
        const start7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        start7d.setHours(0, 0, 0, 0) // Start of day
        startDate = start7d.toISOString()
        endDate = now.toISOString()
        break
      case "30d":
        const start30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        start30d.setHours(0, 0, 0, 0) // Start of day
        startDate = start30d.toISOString()
        endDate = now.toISOString()
        break
      case "90d":
        const start90d = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        start90d.setHours(0, 0, 0, 0) // Start of day
        startDate = start90d.toISOString()
        endDate = now.toISOString()
        break
      case "custom":
        if (customDateFrom) {
          const startOfDay = new Date(customDateFrom)
          startOfDay.setHours(0, 0, 0, 0) // Start of day
          startDate = startOfDay.toISOString()
        }
        if (customDateTo) {
          // Set to end of day for the "to" date
          const endOfDay = new Date(customDateTo)
          endOfDay.setHours(23, 59, 59, 999)
          endDate = endOfDay.toISOString()
        }
        break
      case "all":
      default:
        // No date filtering
        break
    }

    return { startDate, endDate }
  }, [selectedDateRange, customDateFrom, customDateTo])

  // Debounced search function for enterprises
  const handleEnterpriseSearch = useCallback((value: string) => {
    setLocalEnterpriseSearchTerm(value)
    
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    // Set searching state immediately when user types
    if (value.trim()) {
      setIsSearchingEnterprises(true)
    } else {
      setIsSearchingEnterprises(false)
    }

    const timeout = setTimeout(async () => {
      try {
        await searchEnterprises(value)
      } finally {
        setIsSearchingEnterprises(false)
      }
    }, 300) // 300ms debounce

    setSearchTimeout(timeout)
  }, [searchTimeout, searchEnterprises])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTimeout])

  // Load issues from API
  const loadIssues = useCallback(async (page: number = 1, resetData: boolean = true) => {
    try {
      // For custom date range, don't call API until both dates are selected
      if (selectedDateRange === "custom" && (!customDateFrom || !customDateTo)) {
        return
      }

      if (page === 1) {
        setIsLoading(true)
      } else {
        setIsLoadingMore(true)
      }

      const filters: DashboardFilters = {
        page,
        limit: 100,
        isActive: true, // Only show active issues
      }

      // Apply filters
      if (selectedStatus !== "all") {
        filters.status = selectedStatus as 'resolved' | 'in_dev' | 'unresolved'
      }
      if (selectedSeverity !== "all") {
        filters.severity = selectedSeverity.toLowerCase() as 'high' | 'medium' | 'low'
      }
      if (debouncedSearchTerm.trim()) {
        filters.search = debouncedSearchTerm.trim()
      }
      if (selectedAgentType !== "all") {
        filters.agentType = selectedAgentType
      }
      if (selectedAgentCallType !== "all") {
        filters.agentCallType = selectedAgentCallType
      }
      if (selectedEnterpriseId !== "all") {
        filters.enterpriseId = selectedEnterpriseId
      }

      // Apply date range filters
      const { startDate, endDate } = getDateRangeParams()
      if (startDate) {
        filters.startDate = startDate
      }
      if (endDate) {
        filters.endDate = endDate
      }

      const response = await dashboardApiService.getIssueStats(filters)
      
      if (resetData || page === 1) {
        setIssues(response.data)
      } else {
        setIssues(prev => [...prev, ...response.data])
      }
      
      setHasNextPage(response.pagination.hasNextPage)
      setCurrentPage(response.pagination.currentPage)
      setTotalItems(response.pagination.totalItems)
      
    } catch (error) {
      console.error('Error loading issues:', error)
      setError('Failed to load dashboard data. Please try again.')
      toast({
        title: "Error Loading Issues",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [selectedStatus, selectedSeverity, debouncedSearchTerm, selectedAgentType, selectedAgentCallType, selectedEnterpriseId, getDateRangeParams, toast])

  // Load more issues for infinite scroll
  const loadMoreIssues = useCallback(async () => {
    if (!hasNextPage || isLoadingMore) return
    await loadIssues(currentPage + 1, false)
  }, [hasNextPage, isLoadingMore, currentPage, loadIssues])

  // Setup intersection observer for infinite scroll
  const setupObserver = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect()

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting && hasNextPage && !isLoadingMore) {
          loadMoreIssues()
        }
      },
      { threshold: 0.1 }
    )

    if (lastElementRef.current) {
      observerRef.current.observe(lastElementRef.current)
    }
  }, [hasNextPage, isLoadingMore, loadMoreIssues])

  // Initial load and filter changes
  useEffect(() => {
    loadIssues(1, true)
  }, [loadIssues])

  // Setup observer when issues change
  useEffect(() => {
    setupObserver()
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [setupObserver, issues])



  // Helper function to get dominant severity
  const getDominantSeverity = (severityOccurrence: { high: number; medium: number; low: number }) => {
    const { high, medium, low } = severityOccurrence
    
    if (high >= medium && high >= low) return "High"
    if (medium >= low) return "Medium"
    return "Low"
  }

  // Helper function to get category from code
  const getCategoryFromCode = (code: string) => {
    try {
      return getEnumCategoryLabel(code as any) || 'Other'
    } catch (error) {
      console.warn('Failed to get category for code:', code, error)
      return 'Other'
    }
  }

  // Get available categories from loaded issues
  const availableCategories = useMemo(() => {
    const categories = new Set<string>()
    issues.forEach(issue => {
      const category = getCategoryFromCode(issue.code)
      categories.add(category)
    })
    return Array.from(categories).sort()
  }, [issues])

  // Client-side filtering and sorting for local data (API already handles most filters)
  const filteredIssues = useMemo(() => {
    let filtered = [...issues]

    // Apply client-side category filtering if needed
    if (selectedCategory !== "all") {
      filtered = filtered.filter(issue => {
        const category = getCategoryFromCode(issue.code)
        return category === selectedCategory
      })
    }

    // Date filtering is now handled server-side via API parameters

    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue: any
        let bValue: any
        
        // Handle special cases
        if (sortField === 'title') {
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
        } else if (sortField === 'createdAt') {
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
        } else if (sortField === 'firstMarkDate') {
          aValue = a.firstMarkDate ? new Date(a.firstMarkDate) : new Date(0)
          bValue = b.firstMarkDate ? new Date(b.firstMarkDate) : new Date(0)
        } else if (sortField === 'lastMarkDate') {
          aValue = a.lastMarkDate ? new Date(a.lastMarkDate) : new Date(0)
          bValue = b.lastMarkDate ? new Date(b.lastMarkDate) : new Date(0)
        } else if (sortField === 'lastResolvedAt') {
          aValue = a.lastResolvedAt ? new Date(a.lastResolvedAt) : new Date(0)
          bValue = b.lastResolvedAt ? new Date(b.lastResolvedAt) : new Date(0)
        } else if (sortField === 'occurrence') {
          aValue = a.occurrence.total
          bValue = b.occurrence.total
        } else if (sortField === 'severity') {
          // Sort by severity priority (High > Medium > Low)
          const getSeverityPriority = (severityOccurrence: { high: number; medium: number; low: number }) => {
            const { high, medium, low } = severityOccurrence
            // Calculate weighted score: High=3, Medium=2, Low=1
            return (high * 3 + medium * 2 + low * 1)
          }
          aValue = getSeverityPriority(a.severityOccurrence)
          bValue = getSeverityPriority(b.severityOccurrence)
        } else if (sortField === 'liveCall') {
          aValue = a.occurrence.liveCall
          bValue = b.occurrence.liveCall
        } else if (sortField === 'demoCall') {
          aValue = a.occurrence.demoCall
          bValue = b.occurrence.demoCall
        } else if (sortField === 'status') {
          aValue = a.status === 'resolved' ? 1 : 0
          bValue = b.status === 'resolved' ? 1 : 0
        } else if (sortField === 'afterResolve') {
          aValue = a.occurrence.afterLastResolved
          bValue = b.occurrence.afterLastResolved
        } else {
          aValue = a[sortField as keyof DashboardIssueStats]
          bValue = b[sortField as keyof DashboardIssueStats]
        }
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [issues, selectedCategory, selectedDateRange, customDateFrom, customDateTo, sortField, sortDirection])

  const getSeverityBadges = (severityOccurrence: { high: number; medium: number; low: number }) => {
    const severities = [
      { name: "High", count: severityOccurrence.high },
      { name: "Medium", count: severityOccurrence.medium },
      { name: "Low", count: severityOccurrence.low }
    ]
    
    return severities.map(severity => {
      const colorClass = severity.name === "High" ? "bg-red-100 text-red-700 border-red-200" :
                        severity.name === "Medium" ? "bg-amber-100 text-amber-700 border-amber-200" :
                        "bg-green-100 text-green-700 border-green-200"
      
      return (
        <Badge key={severity.name} className={`${colorClass} text-xs mr-1 border`}>
          {severity.name}: {severity.count}
        </Badge>
      )
    })
  }

  const isHighSeverityDominant = (severityOccurrence: { high: number; medium: number; low: number }) => {
    const { high, medium, low } = severityOccurrence
    return high > (medium + low)
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortableHeader = ({ field, children, className }: { field: string, children: React.ReactNode, className?: string }) => (
    <TableHead 
      className={`font-semibold text-foreground py-3 px-4 cursor-pointer hover:bg-muted/50 ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <div className="flex flex-col">
          {sortField === field && sortDirection === 'asc' ? (
            <ChevronUp className="h-3 w-3 text-primary" />
          ) : (
            <ChevronUp className="h-3 w-3 text-muted-foreground/40" />
          )}
          {sortField === field && sortDirection === 'desc' ? (
            <ChevronDown className="h-3 w-3 text-primary -mt-1" />
          ) : (
            <ChevronDown className="h-3 w-3 text-muted-foreground/40 -mt-1" />
          )}
        </div>
      </div>
    </TableHead>
  )

  const handleIssueClick = (issueId: string, issueTitle: string, issueCode: string) => {
    const params = new URLSearchParams({
      title: issueTitle,
      code: issueCode
    })
    router.push(`/dashboard/issues/${issueId}?${params.toString()}`)
  }

  // Add a helper function to build the current filter object
  const getCurrentFilters = useCallback(() => {
    const { startDate, endDate } = getDateRangeParams()
    
    const filterDefinitions = [
      { key: 'severity', value: selectedSeverity.toLowerCase(), condition: selectedSeverity !== "all" },
      { key: 'agentType', value: selectedAgentType, condition: selectedAgentType !== "all" },
      { key: 'agentCallType', value: selectedAgentCallType, condition: selectedAgentCallType !== "all" },
      { key: 'enterpriseId', value: selectedEnterpriseId, condition: selectedEnterpriseId !== "all" },
      { key: 'search', value: debouncedSearchTerm.trim(), condition: debouncedSearchTerm.trim() !== "" },
      { key: 'startDate', value: startDate, condition: startDate !== undefined },
      { key: 'endDate', value: endDate, condition: endDate !== undefined },
    ]
    
    return filterDefinitions
      .filter(filter => filter.condition)
      .reduce((acc, filter) => {
        acc[filter.key] = filter.value
        return acc
      }, {} as Record<string, any>)
  }, [selectedSeverity, selectedAgentType, selectedAgentCallType, selectedEnterpriseId, debouncedSearchTerm, getDateRangeParams])

  // Update the toggleResolved function
  const toggleResolved = async (issueId: string, newStatus: 'resolved' | 'in_dev' | 'unresolved') => {
    try {
      const currentFilters = getCurrentFilters()
      
      await dashboardApiService.updateIssueStatus(issueId, newStatus, currentFilters)
      
      // Update local state
      setIssues(prevIssues => 
        prevIssues.map(issue => 
          issue._id === issueId 
            ? { ...issue, status: newStatus }
            : issue
        )
      )
      
      toast({
        title: `Issue ${newStatus === 'resolved' ? 'Resolved' : newStatus === 'unresolved' ? 'Unresolved' : 'In Dev'}`,
        description: `Issue has been marked as ${newStatus === 'resolved' ? 'resolved' : newStatus === 'unresolved' ? 'unresolved' : 'in development'}.`,
        variant: "default",
      })
      
    } catch (error) {
      console.error('Error updating issue status:', error)
      toast({
        title: "Error",
        description: `Failed to mark issue as ${newStatus}. Please try again.`,
        variant: "destructive",
      })
    }
  }

  const clearFilters = () => {
    setSelectedCategory("all")
    setSelectedStatus("all")
    setSelectedDateRange("all")
    setCustomDateFrom(undefined)
    setCustomDateTo(undefined)
    setSelectedSeverity("all")
    setSelectedAgentType("all")
    setSelectedAgentCallType("all")
    setSelectedEnterpriseId("all")
    setSearchTerm("")
  }

  if (error) {
    return (
      <div className="space-y-8 p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Dashboard Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <button 
            onClick={() => {
              setError(null)
              loadIssues(1, true)
            }}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (isLoading && issues.length === 0) {
    return (
      <div className="space-y-8 p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading Dashboard...</h2>
          <p className="text-muted-foreground">Please wait while we load the data.</p>
          {(urlEnterpriseId || urlTeamId) && (
            <div className="mt-2 text-sm text-green-600">
              Using Enterprise: {urlEnterpriseId} | Team: {urlTeamId}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Issue Types Overview Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            High-level view of all issue types with occurrence statistics and resolution status.
          </p>

          <div className="mt-1 text-xs text-muted-foreground">
            Total Issues Loaded: {issues.length} | Loading: {isLoading ? 'Yes' : 'No'}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search bar moved to first position */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
          <Input 
            placeholder="Search issues..." 
            className="pl-10 bg-white/90 backdrop-blur-sm border-border/50 hover:bg-white/95 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters in flexible layout */}
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className={`w-auto min-w-[160px] bg-white/90 backdrop-blur-sm border-border/50 hover:bg-white/95 transition-all ${selectedCategory !== "all" ? "ring-2 ring-primary/20 border-primary" : ""}`}>
            <SelectValue placeholder="Category">
              {selectedCategory === "all" ? "All Categories" : selectedCategory}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-white/95 backdrop-blur-md border-border/50">
            <SelectItem value="all" className="text-foreground hover:bg-muted/50">All Categories</SelectItem>
            {availableCategories.map(category => (
              <SelectItem key={category} value={category} className="text-foreground hover:bg-muted/50">
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className={`w-auto min-w-[120px] bg-white/90 backdrop-blur-sm border-border/50 hover:bg-white/95 transition-all ${selectedStatus !== "all" ? "ring-2 ring-primary/20 border-primary" : ""}`}>
            <SelectValue placeholder="Status">
              {selectedStatus === "all" ? "All Status" : 
               selectedStatus === "resolved" ? "Resolved" : 
               selectedStatus === "unresolved" ? "Unresolved" :
               selectedStatus === "in_dev" ? "In Dev" : selectedStatus}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-white/95 backdrop-blur-md border-border/50">
            <SelectItem value="all" className="text-foreground hover:bg-muted/50">All Status</SelectItem>
            <SelectItem value="resolved" className="text-foreground hover:bg-muted/50">Resolved</SelectItem>
            <SelectItem value="in_dev" className="text-foreground hover:bg-muted/50">In Dev</SelectItem>
            <SelectItem value="unresolved" className="text-foreground hover:bg-muted/50">Unresolved</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
          <SelectTrigger className={`w-auto min-w-[140px] bg-white/90 backdrop-blur-sm border-border/50 hover:bg-white/95 transition-all ${selectedDateRange !== "all" ? "ring-2 ring-primary/20 border-primary" : ""}`}>
            <SelectValue placeholder="Date Range">
              {selectedDateRange === "all" ? "All Time" : 
               selectedDateRange === "7d" ? "Last 7 Days" :
               selectedDateRange === "30d" ? "Last 30 Days" :
               selectedDateRange === "90d" ? "Last 90 Days" :
               selectedDateRange === "custom" ? "Custom Range" : "All Time"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-white/95 backdrop-blur-md border-border/50">
            <SelectItem value="all" className="text-foreground hover:bg-muted/50">All Time</SelectItem>
            <SelectItem value="7d" className="text-foreground hover:bg-muted/50">Last 7 Days</SelectItem>
            <SelectItem value="30d" className="text-foreground hover:bg-muted/50">Last 30 Days</SelectItem>
            <SelectItem value="90d" className="text-foreground hover:bg-muted/50">Last 90 Days</SelectItem>
            <SelectItem value="custom" className="text-foreground hover:bg-muted/50">Custom Range</SelectItem>
          </SelectContent>
        </Select>
        

        {selectedDateRange === "custom" && (
          <div className="flex gap-2 items-center">
            <DatePicker
              value={customDateFrom}
              onValueChange={setCustomDateFrom}
              placeholder="From date"
              className="w-auto"
            />
            <span className="text-sm text-muted-foreground">to</span>
            <DatePicker
              value={customDateTo}
              onValueChange={setCustomDateTo}
              placeholder="To date"
              className="w-auto"
            />
          </div>
        )}

        <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
          <SelectTrigger className={`w-auto min-w-[120px] bg-white/90 backdrop-blur-sm border-border/50 hover:bg-white/95 transition-all ${selectedSeverity !== "all" ? "ring-2 ring-primary/20 border-primary" : ""}`}>
            <SelectValue placeholder="Severity">
              {selectedSeverity === "all" ? "All Severity" : selectedSeverity}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-white/95 backdrop-blur-md border-border/50">
            <SelectItem value="all" className="text-foreground hover:bg-muted/50">All Severity</SelectItem>
            <SelectItem value="High" className="text-foreground hover:bg-muted/50">High</SelectItem>
            <SelectItem value="Medium" className="text-foreground hover:bg-muted/50">Medium</SelectItem>
            <SelectItem value="Low" className="text-foreground hover:bg-muted/50">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedAgentType} onValueChange={setSelectedAgentType}>
          <SelectTrigger className={`w-auto min-w-[140px] bg-white/90 backdrop-blur-sm border-border/50 hover:bg-white/95 transition-all ${selectedAgentType !== "all" ? "ring-2 ring-primary/20 border-primary" : ""}`}>
            <SelectValue placeholder="Agent Type">
              {selectedAgentType === "all" ? "All Agent Types" : 
               selectedAgentType === "Sales" ? "Sales" : 
               selectedAgentType === "Service" ? "Service" : selectedAgentType}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-white/95 backdrop-blur-md border-border/50">
            <SelectItem value="all" className="text-foreground hover:bg-muted/50">All Agent Types</SelectItem>
            <SelectItem value="Sales" className="text-foreground hover:bg-muted/50">Sales</SelectItem>
            <SelectItem value="Service" className="text-foreground hover:bg-muted/50">Service</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedAgentCallType} onValueChange={setSelectedAgentCallType}>
          <SelectTrigger className={`w-auto min-w-[140px] bg-white/90 backdrop-blur-sm border-border/50 hover:bg-white/95 transition-all ${selectedAgentCallType !== "all" ? "ring-2 ring-primary/20 border-primary" : ""}`}>
            <SelectValue placeholder="Agent Call Type">
              {selectedAgentCallType === "all" ? "All Call Types" : 
               selectedAgentCallType === "inbound" ? "Inbound" : 
               selectedAgentCallType === "outbound" ? "Outbound" : selectedAgentCallType}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-white/95 backdrop-blur-md border-border/50">
            <SelectItem value="all" className="text-foreground hover:bg-muted/50">All Call Types</SelectItem>
            <SelectItem value="inbound" className="text-foreground hover:bg-muted/50">Inbound</SelectItem>
            <SelectItem value="outbound" className="text-foreground hover:bg-muted/50">Outbound</SelectItem>
          </SelectContent>
        </Select>

        <Popover 
          open={isEnterpriseDropdownOpen} 
          onOpenChange={(open) => {
            setIsEnterpriseDropdownOpen(open)
            if (open) {
              // Clear search when dropdown opens to show full list
              setLocalEnterpriseSearchTerm("")
              setIsSearchingEnterprises(false)
              // Always reload all enterprises when opening
              clearSearchAndReload()
            } else {
              // Clear local search when dropdown closes
              setLocalEnterpriseSearchTerm("")
              setIsSearchingEnterprises(false)
            }
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isEnterpriseDropdownOpen}
              className={`w-auto min-w-[160px] justify-between bg-white/90 backdrop-blur-sm border-border/50 hover:bg-white/95 transition-all ${selectedEnterpriseId !== "all" ? "ring-2 ring-primary/20 border-primary" : ""}`}
              disabled={isLoadingEnterprises}
            >
              {/* Use the stored name instead of looking it up */}
              <span className="truncate">{selectedEnterpriseName}</span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0">
            <Command key={isEnterpriseDropdownOpen ? 'open' : 'closed'} shouldFilter={false}>
              <CommandInput 
                placeholder="Search enterprises..." 
                value={localEnterpriseSearchTerm}
                onValueChange={handleEnterpriseSearch}
              />
              <CommandList>
                <CommandEmpty>
                  {isLoadingEnterprises || isSearchingEnterprises ? "Loading enterprises..." : "No enterprises found."}
                </CommandEmpty>
                <CommandGroup>
                  <div className="max-h-60 overflow-y-auto">
                    <CommandItem
                      value="all"
                      onSelect={() => {
                        setSelectedEnterpriseId("all")
                        setSelectedEnterpriseName("All Enterprises")
                        setIsEnterpriseDropdownOpen(false)
                        setLocalEnterpriseSearchTerm("")
                        setIsSearchingEnterprises(false)
                        // Removed: searchEnterprises("") - unnecessary since we reload on open
                      }}
                    >
                      <div className="flex items-center gap-2 w-full min-w-0">
                        <Building2 className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate flex-1 text-left">All Enterprises</span>
                      </div>
                    </CommandItem>
                    {enterprises.map((enterprise, index) => (
                      <CommandItem
                        key={`${enterprise.enterpriseId || enterprise.id}-${index}`}
                        value={enterprise.name}
                        onSelect={() => {
                          setSelectedEnterpriseId(enterprise.enterpriseId || enterprise.id || "")
                          setSelectedEnterpriseName(enterprise.name) // Store the name
                          setIsEnterpriseDropdownOpen(false)
                          setLocalEnterpriseSearchTerm("")
                          setIsSearchingEnterprises(false)
                          // Removed: searchEnterprises("") - unnecessary since we reload on open
                        }}
                      >
                        <div className="flex items-center gap-2 w-full min-w-0">
                          <Building2 className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate flex-1 text-left">{enterprise.name}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </div>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {(selectedCategory !== "all" || selectedStatus !== "all" || selectedDateRange !== "all" || customDateFrom !== undefined || customDateTo !== undefined || selectedSeverity !== "all" || selectedAgentType !== "all" || selectedAgentCallType !== "all" || selectedEnterpriseId !== "all" || debouncedSearchTerm !== "") && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="text-sm"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Issues Table */}
      <Card className="bg-card/80 h-[80vh] backdrop-blur-sm border ">
        <CardContent className="p-0 overflow-auto h-full">
          {filteredIssues.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<FileX className="h-8 w-8 text-muted-foreground" />}
                heading="No issues found"
                subheading={
                  debouncedSearchTerm || selectedCategory !== "all" || selectedStatus !== "all" || selectedDateRange !== "all" || customDateFrom !== undefined || customDateTo !== undefined || selectedSeverity !== "all" || selectedAgentType !== "all" || selectedAgentCallType !== "all" || selectedEnterpriseId !== "all"
                    ? "No issues match your current search criteria or filters. Try adjusting your filters or search term to see more results."
                    : "No issues are currently available in the system."
                }
                ctaLabel={
                  debouncedSearchTerm || selectedCategory !== "all" || selectedStatus !== "all" || selectedDateRange !== "all" || customDateFrom !== undefined || customDateTo !== undefined || selectedSeverity !== "all" || selectedAgentType !== "all" || selectedAgentCallType !== "all" || selectedEnterpriseId !== "all"
                    ? "Clear Filters"
                    : undefined
                }
                onCtaClick={
                  debouncedSearchTerm || selectedCategory !== "all" || selectedStatus !== "all" || selectedDateRange !== "all" || customDateFrom !== undefined || customDateTo !== undefined || selectedSeverity !== "all" || selectedAgentType !== "all" || selectedAgentCallType !== "all" || selectedEnterpriseId !== "all"
                    ? clearFilters
                    : undefined
                }
              />
            </div>
          ) : (
            <div className="w-full h-full scrollbar-always-visible">
              <Table className="min-w-full min-h-full" allowDefaultXScroll={false}>
                <TableHeader>
                  <TableRow className="bg-secondary/60 backdrop-blur-sm">
                    <SortableHeader field="title" className="min-w-[300px]">Issue Name</SortableHeader>
                    <SortableHeader field="status" className="min-w-[180px]">Status</SortableHeader>
                    <SortableHeader field="occurrence" className="min-w-[100px]">Occurrence</SortableHeader>
                    <SortableHeader field="severity" className="min-w-[200px]">Severity</SortableHeader>
                    <SortableHeader field="firstMarkDate" className="min-w-[140px]">First Raised Date</SortableHeader>
                    <SortableHeader field="lastMarkDate" className="min-w-[140px]">Last Raised Date</SortableHeader>
                    <SortableHeader field="lastResolvedAt" className="min-w-[140px]">Last Resolved At</SortableHeader>
                    <SortableHeader field="afterResolve" className="min-w-[120px]">After Resolve</SortableHeader>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIssues.map((issue, index) => {
                    const isLastElement = index === filteredIssues.length - 1
                    const category = getCategoryFromCode(issue.code)
                    
                    return (
                      <TableRow 
                        key={issue._id}
                        ref={isLastElement ? lastElementRef : null}
                        className={`hover:bg-muted/50 cursor-pointer transition-all duration-200 ${
                          isHighSeverityDominant(issue.severityOccurrence) 
                            ? 'bg-red-50/30 hover:bg-red-50/50 border-l-4 border-l-red-200/60' 
                            : 'hover:bg-white/80 backdrop-blur-sm hover:border-primary/20'
                        }`}
                        style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}
                        onClick={() => handleIssueClick(issue._id, issue.title, issue.code)}
                        title="Click to view calls with this issue"
                      >
                        {/* 1. Issue Name */}
                        <TableCell className="py-3 px-4">
                          <div className="max-w-[300px]">
                            <div className="font-medium text-foreground line-clamp-2 leading-tight">{issue.title}</div>
                            <div className="text-sm mt-1" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>{category}</div>
                          </div>
                        </TableCell>
                        
                        {/* 2. Status - MOVED TO 2ND POSITION */}
                        <TableCell className="text-center py-3 px-4">
                          <Select 
                            value={issue.status} 
                            onValueChange={(value) => {
                              if (value !== issue.status) {
                                toggleResolved(issue._id, value as 'resolved' | 'in_dev' | 'unresolved');
                              }
                            }}
                          >
                            <SelectTrigger 
                              className="w-36 h-8 bg-white/90 backdrop-blur-sm border-border/50"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <SelectValue>
                                {issue.status === 'resolved' ? "Resolved" : 
                                 issue.status === 'unresolved' ? "Unresolved" :
                                 issue.status === 'in_dev' ? "In Dev" : issue.status}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="bg-white/95 backdrop-blur-md border-border/50">
                              <SelectItem value="resolved" className="text-foreground hover:bg-muted/50">Resolved</SelectItem>
                              <SelectItem value="in_dev" className="text-foreground hover:bg-muted/50">In Dev</SelectItem>
                              <SelectItem value="unresolved" className="text-foreground hover:bg-muted/50">Unresolved</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        
                        {/* 3. Occurrence */}
                        <TableCell className="text-center py-3 px-4">
                          <Badge variant="outline" className="text-sm font-medium">
                            {issue.occurrence.total}
                          </Badge>
                        </TableCell>
                        
                        {/* 4. Severity */}
                        <TableCell className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {getSeverityBadges(issue.severityOccurrence)}
                          </div>
                        </TableCell>
                        
                        {/* 5. First Raised Date */}
                        <TableCell className="text-center py-3 px-4">
                          <span className="text-sm">
                            {issue.firstMarkDate ? new Date(issue.firstMarkDate).toLocaleDateString() : '-'}
                          </span>
                        </TableCell>
                        
                        {/* 6. Last Raised Date */}
                        <TableCell className="text-center py-3 px-4">
                          <span className="text-sm">
                            {issue.lastMarkDate ? new Date(issue.lastMarkDate).toLocaleDateString() : '-'}
                          </span>
                        </TableCell>
                        
                        {/* 7. Last Resolved At */}
                        <TableCell className="text-center py-3 px-4">
                          <span className="text-sm">
                            {issue.lastResolvedAt ? new Date(issue.lastResolvedAt).toLocaleDateString() : '-'}
                          </span>
                        </TableCell>
                        
                        {/* 8. After Resolve */}
                        <TableCell className="text-center py-3 px-4">
                          <span className="text-sm font-medium">
                            {issue.occurrence.afterLastResolved > 0 ? (
                              <Badge className="bg-orange-100 text-orange-700 border border-orange-200">
                                {issue.occurrence.afterLastResolved}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">0</span>
                            )}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {isLoadingMore && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          <span className="text-sm text-muted-foreground">Loading more issues...</span>
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
  )
}

function IssuesManagementWithSuspense() {
  return (
    <Suspense fallback={
      <div className="space-y-8 p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading Dashboard...</h2>
          <p className="text-muted-foreground">Please wait while we load the data.</p>
        </div>
      </div>
    }>
      <IssuesManagement />
    </Suspense>
  )
}

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="w-full px-6 h-full flex flex-col">
        {/* Page Content - Direct Issues Management */}
        <div className="flex-1 overflow-auto py-8">
          <IssuesManagementWithSuspense />
        </div>
      </div>
    </AppShell>
  )
}