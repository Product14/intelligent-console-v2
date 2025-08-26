"use client"

import { useState, useMemo } from "react"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmptyState } from "@/components/ui/empty-state"
import { DatePicker } from "@/components/ui/date-picker"
import { Search, ChevronUp, ChevronDown, FileX } from "lucide-react"
import { useRouter } from "next/navigation"

// Comprehensive automotive AI agent issues data structure
const issueTypes = [
  // Communication & Conversation Flow Issues
  {
    id: "long-awkward-pauses",
    name: "Long/awkward pauses or random breaks",
    occurrence: 23,
    severityBifurcation: { High: 8, Medium: 10, Low: 5 },
    liveCallOccurrence: 18,
    testCallOccurrence: 5,
    firstOccurrenceDate: "2024-01-03",
    resolved: false,
    occurrenceAfterResolve: 0,
    category: "Communication Issues"
  },
  {
    id: "lag-in-reply",
    name: "Lag in agent reply",
    occurrence: 31,
    severityBifurcation: { High: 12, Medium: 13, Low: 6 },
    liveCallOccurrence: 24,
    testCallOccurrence: 7,
    firstOccurrenceDate: "2024-01-02",
    resolved: false,
    occurrenceAfterResolve: 0,
    category: "Communication Issues"
  },
  {
    id: "call-collision",
    name: "Call collision (agent & customer talk over each other)",
    occurrence: 19,
    severityBifurcation: { High: 7, Medium: 8, Low: 1 },
    liveCallOccurrence: 15,
    testCallOccurrence: 4,
    firstOccurrenceDate: "2024-01-04",
    resolved: false,
    occurrenceAfterResolve: 0,
    category: "Communication Issues"
  },
  {
    id: "agent-cuts-customer",
    name: "Agent cuts customer mid-speech",
    occurrence: 17,
    severityBifurcation: { High: 8, Medium: 5, Low: 0 },
    liveCallOccurrence: 13,
    testCallOccurrence: 4,
    firstOccurrenceDate: "2024-01-05",
    resolved: false,
    occurrenceAfterResolve: 0,
    category: "Communication Issues"
  },
  {
    id: "sounds-robotic",
    name: "Sounds robotic",
    occurrence: 42,
    severityBifurcation: { High: 8, Medium: 20, Low: 13 },
    liveCallOccurrence: 32,
    testCallOccurrence: 10,
    firstOccurrenceDate: "2024-01-01",
    resolved: false,
    occurrenceAfterResolve: 0,
    category: "Communication Issues"
  },
  {
    id: "wrong-car-color",
    name: "Wrong car color informed",
    occurrence: 13,
    severityBifurcation: { High: 4, Medium: 1, Low: 0 },
    liveCallOccurrence: 11,
    testCallOccurrence: 2,
    firstOccurrenceDate: "2024-01-18",
    resolved: false,
    occurrenceAfterResolve: 0,
    category: "Data Issues"
  },
  {
    id: "inventory-search-failed",
    name: "Inventory search failed (no data returned)",
    occurrence: 26,
    severityBifurcation: { High: 11, Medium: 5, Low: 1 },
    liveCallOccurrence: 20,
    testCallOccurrence: 6,
    firstOccurrenceDate: "2024-01-21",
    resolved: false,
    occurrenceAfterResolve: 0,
    category: "Technical Issues"
  },
  {
    id: "dealer-crm-not-linked",
    name: "Dealer CRM not linked",
    occurrence: 37,
    severityBifurcation: { High: 15, Medium: 11, Low: 3 },
    liveCallOccurrence: 29,
    testCallOccurrence: 8,
    firstOccurrenceDate: "2024-02-15",
    resolved: false,
    occurrenceAfterResolve: 0,
    category: "Technical Issues"
  },
  {
    id: "customer-name-not-asked",
    name: "Customer name not asked",
    occurrence: 33,
    severityBifurcation: { High: 4, Medium: 18, Low: 11 },
    liveCallOccurrence: 25,
    testCallOccurrence: 8,
    firstOccurrenceDate: "2024-01-30",
    resolved: false,
    occurrenceAfterResolve: 0,
    category: "Business Logic"
  },
  {
    id: "out-door-price-missing",
    name: "Out-the-door price missing",
    occurrence: 41,
    severityBifurcation: { High: 12, Medium: 19, Low: 7 },
    liveCallOccurrence: 32,
    testCallOccurrence: 9,
    firstOccurrenceDate: "2024-02-14",
    resolved: false,
    occurrenceAfterResolve: 0,
    category: "Business Logic"
  }
]



function IssuesManagement() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedDateRange, setSelectedDateRange] = useState("all")
  const [customDateFrom, setCustomDateFrom] = useState<Date | undefined>(undefined)
  const [customDateTo, setCustomDateTo] = useState<Date | undefined>(undefined)
  const [selectedSeverity, setSelectedSeverity] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [issues, setIssues] = useState(issueTypes)
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')


  // Helper function to check if date matches selected range
  const matchesDateRange = (dateString: string, range: string) => {
    if (range === "all") return true
    
    const issueDate = new Date(dateString)
    
    // Handle custom date range
    if (range === "custom") {
      if (!customDateFrom && !customDateTo) return true
      
      if (customDateFrom && customDateTo) {
        // Set time to start/end of day for proper comparison
        const fromDate = new Date(customDateFrom)
        fromDate.setHours(0, 0, 0, 0)
        const toDate = new Date(customDateTo)
        toDate.setHours(23, 59, 59, 999)
        return issueDate >= fromDate && issueDate <= toDate
      } else if (customDateFrom) {
        const fromDate = new Date(customDateFrom)
        fromDate.setHours(0, 0, 0, 0)
        return issueDate >= fromDate
      } else if (customDateTo) {
        const toDate = new Date(customDateTo)
        toDate.setHours(23, 59, 59, 999)
        return issueDate <= toDate
      }
      return true
    }
    
    const today = new Date()
    const daysDiff = Math.floor((today.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24))
    
    switch (range) {
      case "7d":
        return daysDiff <= 7
      case "30d":
        return daysDiff <= 30
      case "90d":
        return daysDiff <= 90
      default:
        return true
    }
  }

  // Helper function to get dominant severity
  const getDominantSeverity = (severityBifurcation: Record<string, number>) => {
    const high = severityBifurcation.High || 0
    const medium = severityBifurcation.Medium || 0
    const low = severityBifurcation.Low || 0
    
    if (high >= medium && high >= low) return "High"
    if (medium >= low) return "Medium"
    return "Low"
  }

  // Filter and sort issues based on selected filters
  const filteredIssues = useMemo(() => {
    let filtered = issues.filter(issue => {
      const matchesCategory = selectedCategory === "all" || issue.category === selectedCategory
      const matchesStatus = selectedStatus === "all" || 
        (selectedStatus === "resolved" && issue.resolved) ||
        (selectedStatus === "unresolved" && !issue.resolved)
      const matchesDate = matchesDateRange(issue.firstOccurrenceDate, selectedDateRange)
      const matchesSeverity = selectedSeverity === "all" || 
        getDominantSeverity(issue.severityBifurcation) === selectedSeverity
      const matchesSearch = searchTerm === "" || 
        issue.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesCategory && matchesStatus && matchesDate && matchesSeverity && matchesSearch
    })

    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue: any = a[sortField as keyof typeof a]
        let bValue: any = b[sortField as keyof typeof b]
        
        // Handle special cases
        if (sortField === 'name') {
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
        } else if (sortField === 'firstOccurrenceDate') {
          aValue = new Date(a.firstOccurrenceDate)
          bValue = new Date(b.firstOccurrenceDate)
        } else if (sortField === 'severity') {
          // Sort by severity priority (High > Medium > Low)
          const getSeverityPriority = (severityBifurcation: Record<string, number>) => {
            const high = severityBifurcation.High || 0
            const medium = severityBifurcation.Medium || 0
            const low = severityBifurcation.Low || 0
            // Calculate weighted score: High=3, Medium=2, Low=1
            return (high * 3 + medium * 2 + low * 1)
          }
          aValue = getSeverityPriority(a.severityBifurcation)
          bValue = getSeverityPriority(b.severityBifurcation)
        }
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [issues, selectedCategory, selectedStatus, selectedDateRange, customDateFrom, customDateTo, selectedSeverity, searchTerm, sortField, sortDirection])

  const getSeverityBadges = (severityBifurcation: Record<string, number>) => {
    const severities = ["High", "Medium", "Low"]
    return severities.map(severity => {
      const count = severityBifurcation[severity] || 0
      if (count === 0) return null
      
      const colorClass = severity === "High" ? "bg-red-100 text-red-700 border-red-200" :
                        severity === "Medium" ? "bg-amber-100 text-amber-700 border-amber-200" :
                        "bg-green-100 text-green-700 border-green-200"
      
      return (
        <Badge key={severity} className={`${colorClass} text-xs mr-1 border`}>
          {severity}: {count}
        </Badge>
      )
    }).filter(Boolean)
  }

  const isHighSeverityDominant = (severityBifurcation: Record<string, number>) => {
    const highCount = severityBifurcation.High || 0
    const mediumCount = severityBifurcation.Medium || 0
    const lowCount = severityBifurcation.Low || 0
    return highCount > (mediumCount + lowCount)
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

  const handleIssueClick = (issueId: string) => {
    router.push(`/dashboard/issues/${issueId}`)
  }

  const toggleResolved = (issueId: string) => {
    setIssues(prevIssues => 
      prevIssues.map(issue => 
        issue.id === issueId 
          ? { ...issue, resolved: !issue.resolved }
          : issue
      )
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Issue Types Overview</h2>
          <p className="text-sm text-muted-foreground">
            High-level view of all issue types with occurrence statistics and resolution status.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className={`w-auto min-w-[160px] bg-white/90 backdrop-blur-sm border-border/50 hover:bg-white/95 transition-all ${selectedCategory !== "all" ? "ring-2 ring-primary/20 border-primary" : ""}`}>
            <SelectValue placeholder="Category">
              {selectedCategory === "all" ? "All Categories" : selectedCategory}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-white/95 backdrop-blur-md border-border/50">
            <SelectItem value="all" className="text-foreground hover:bg-muted/50">All Categories</SelectItem>
            <SelectItem value="Communication Issues" className="text-foreground hover:bg-muted/50">Communication Issues</SelectItem>
            <SelectItem value="Data Issues" className="text-foreground hover:bg-muted/50">Data Issues</SelectItem>
            <SelectItem value="Technical Issues" className="text-foreground hover:bg-muted/50">Technical Issues</SelectItem>
            <SelectItem value="Business Logic" className="text-foreground hover:bg-muted/50">Business Logic</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className={`w-auto min-w-[120px] bg-white/90 backdrop-blur-sm border-border/50 hover:bg-white/95 transition-all ${selectedStatus !== "all" ? "ring-2 ring-primary/20 border-primary" : ""}`}>
            <SelectValue placeholder="Status">
              {selectedStatus === "all" ? "All Status" : selectedStatus === "resolved" ? "Resolved" : "Unresolved"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-white/95 backdrop-blur-md border-border/50">
            <SelectItem value="all" className="text-foreground hover:bg-muted/50">All Status</SelectItem>
            <SelectItem value="resolved" className="text-foreground hover:bg-muted/50">Resolved</SelectItem>
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

        {(selectedCategory !== "all" || selectedStatus !== "all" || selectedDateRange !== "all" || customDateFrom !== undefined || customDateTo !== undefined || selectedSeverity !== "all" || searchTerm !== "") && (
          <Button
            variant="outline"
            onClick={() => {
              setSelectedCategory("all")
              setSelectedStatus("all")
              setSelectedDateRange("all")
              setCustomDateFrom(undefined)
              setCustomDateTo(undefined)
              setSelectedSeverity("all")
              setSearchTerm("")
            }}
            className="text-sm"
          >
            Clear Filters
          </Button>
        )}

        <div className="relative w-64 ml-auto">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search issues..." 
            className="pl-10 bg-white/90 backdrop-blur-sm border-border/50 hover:bg-white/95 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Issues Table */}
      <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
        <CardContent>
          {filteredIssues.length === 0 ? (
            <EmptyState
              icon={FileX as any}
              heading="No issues found"
              subheading={
                searchTerm || selectedCategory !== "all" || selectedStatus !== "all" || selectedDateRange !== "all" || customDateFrom !== undefined || customDateTo !== undefined || selectedSeverity !== "all"
                  ? "No issues match your current search criteria or filters. Try adjusting your filters or search term to see more results."
                  : "No issues are currently available in the system."
              }
              ctaLabel={
                searchTerm || selectedCategory !== "all" || selectedStatus !== "all" || selectedDateRange !== "all" || customDateFrom !== undefined || customDateTo !== undefined || selectedSeverity !== "all"
                  ? "Clear Filters"
                  : undefined
              }
              onCtaClick={
                searchTerm || selectedCategory !== "all" || selectedStatus !== "all" || selectedDateRange !== "all" || customDateFrom !== undefined || customDateTo !== undefined || selectedSeverity !== "all"
                  ? () => {
                      setSelectedCategory("all")
                      setSelectedStatus("all")
                      setSelectedDateRange("all")
                      setCustomDateFrom(undefined)
                      setCustomDateTo(undefined)
                      setSelectedSeverity("all")
                      setSearchTerm("")
                    }
                  : undefined
              }
            />
          ) : (
            <div className="w-full overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="bg-secondary/60 backdrop-blur-sm">
                    <SortableHeader field="name" className="min-w-[300px]">Issue Name</SortableHeader>
                    <SortableHeader field="occurrence" className="min-w-[100px]">Occurrence</SortableHeader>
                    <SortableHeader field="severity" className="min-w-[200px]">Severity</SortableHeader>
                    <SortableHeader field="liveCallOccurrence" className="min-w-[100px]">Live Call</SortableHeader>
                    <SortableHeader field="testCallOccurrence" className="min-w-[100px]">Demo Call</SortableHeader>
                    <SortableHeader field="firstOccurrenceDate" className="min-w-[120px]">First Date</SortableHeader>
                    <SortableHeader field="resolved" className="min-w-[100px]">Resolved?</SortableHeader>
                    <SortableHeader field="occurrenceAfterResolve" className="min-w-[120px]">After Resolve</SortableHeader>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIssues.map((issue) => (
                    <TableRow 
                      key={issue.id} 
                      className={`hover:bg-muted/50 cursor-pointer transition-all duration-200 ${
                        isHighSeverityDominant(issue.severityBifurcation) 
                          ? 'bg-red-50/30 hover:bg-red-50/50 border-l-4 border-l-red-200/60' 
                          : 'hover:bg-white/80 backdrop-blur-sm hover:border-primary/20'
                      }`}
                      style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}
                      onClick={() => handleIssueClick(issue.id)}
                      title="Click to view calls with this issue"
                    >
                      <TableCell className="py-3 px-4">
                        <div className="max-w-[300px]">
                          <div className="font-medium text-foreground line-clamp-2 leading-tight">{issue.name}</div>
                          <div className="text-sm mt-1" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>{issue.category}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-3 px-4">
                        <Badge variant="outline" className="text-sm font-medium">
                          {issue.occurrence}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {getSeverityBadges(issue.severityBifurcation)}
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-3 px-4">
                        <Badge variant="outline" className="text-sm font-medium">
                          {issue.liveCallOccurrence}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center py-3 px-4">
                        <Badge variant="outline" className="text-sm font-medium">
                          {issue.testCallOccurrence}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center py-3 px-4">
                        <span className="text-sm">{issue.firstOccurrenceDate}</span>
                      </TableCell>
                      <TableCell className="text-center py-3 px-4">
                        <Select 
                          value={issue.resolved ? "yes" : "no"} 
                          onValueChange={(value) => {
                            if ((value === "yes") !== issue.resolved) {
                              toggleResolved(issue.id);
                            }
                          }}
                        >
                          <SelectTrigger 
                            className="w-20 h-8 bg-white/90 backdrop-blur-sm border-border/50"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <SelectValue>
                              {issue.resolved ? "Yes" : "No"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="bg-white/95 backdrop-blur-md border-border/50">
                            <SelectItem value="yes" className="text-foreground hover:bg-muted/50">Yes</SelectItem>
                            <SelectItem value="no" className="text-foreground hover:bg-muted/50">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-center py-3 px-4">
                        <span className="text-sm font-medium">
                          {issue.occurrenceAfterResolve > 0 ? (
                            <Badge className="bg-orange-100 text-orange-700 border border-orange-200">
                              {issue.occurrenceAfterResolve}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="w-full px-6 h-full flex flex-col">
        {/* Page Content - Direct Issues Management */}
        <div className="flex-1 overflow-auto py-8">
          <IssuesManagement />
        </div>
      </div>
    </AppShell>
  )
}