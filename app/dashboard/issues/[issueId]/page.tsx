"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmptyState } from "@/components/ui/empty-state"
import { ArrowLeft, Search, Play, Volume2, Phone, FileX } from "lucide-react"

//comment 
const mockCallsData = {
  "long-awkward-pauses": [
    {
      id: "call-001",
      customerName: "Emily Davis",
      phoneNumber: "(555) 890-1234",
      timestamp: "2024-02-07 18:25",
      agent: {
        name: "AutoBot-1",
        role: "Sales Assistant"
      },
      enterprise: "Metro Honda",
      severity: "Low",
      callType: "Live",
      audio: {
        duration: "1:36",
        totalDuration: "3:56s",
        issueTimestamp: "3:14 into call"
      }
    },
    {
      id: "call-002",
      customerName: "Sarah Johnson",
      phoneNumber: "(555) 789-0123",
      timestamp: "2024-01-10 16:16",
      agent: {
        name: "AutoBot-3",
        role: "Finance Assistant"
      },
      enterprise: "City Nissan",
      severity: "Medium",
      callType: "Live",
      audio: {
        duration: "3:48",
        totalDuration: "0:47s",
        issueTimestamp: "1:50 into call"
      }
    },
    {
      id: "call-003",
      customerName: "David Wilson",
      phoneNumber: "(555) 234-5678",
      timestamp: "2024-02-01 13:19",
      agent: {
        name: "AutoBot-6",
        role: "Inventory Assistant"
      },
      enterprise: "Metro Honda",
      severity: "Low",
      callType: "Live",
      audio: {
        duration: "0:46",
        totalDuration: "2:06s",
        issueTimestamp: "4:46 into call"
      }
    }
  ],
  "lag-in-reply": [
    {
      id: "call-004",
      customerName: "Michael Brown",
      phoneNumber: "(555) 345-6789",
      timestamp: "2024-02-05 14:22",
      agent: {
        name: "AutoBot-2",
        role: "Sales Assistant"
      },
      enterprise: "Downtown Motors",
      severity: "High",
      callType: "Live",
      audio: {
        duration: "2:15",
        totalDuration: "4:32s",
        issueTimestamp: "2:10 into call"
      }
    }
  ]
}

// Issue types data (subset for reference)
const issueTypesMap = {
  "long-awkward-pauses": {
    name: "Long/awkward pauses or random breaks",
    category: "Communication Issues",
    description: "AI agent communication and conversation flow problems affecting customer experience"
  },
  "lag-in-reply": {
    name: "Lag in agent reply",
    category: "Communication Issues", 
    description: "AI agent communication and conversation flow problems affecting customer experience"
  },
  "call-collision": {
    name: "Call collision (agent & customer talk over each other)",
    category: "Communication Issues",
    description: "AI agent communication and conversation flow problems affecting customer experience"
  }
}

export default function IssueCallsPage() {
  const params = useParams()
  const router = useRouter()
  const issueId = params.issueId as string
  
  const [selectedAgent, setSelectedAgent] = useState("all")
  const [selectedSeverity, setSelectedSeverity] = useState("all") 
  const [selectedEnterprise, setSelectedEnterprise] = useState("all")
  const [selectedCallType, setSelectedCallType] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const issueInfo = issueTypesMap[issueId as keyof typeof issueTypesMap]
  const callsData = mockCallsData[issueId as keyof typeof mockCallsData] || []

  const filteredCalls = useMemo(() => {
    return callsData.filter(call => {
      const matchesAgent = selectedAgent === "all" || call.agent.name === selectedAgent
      const matchesSeverity = selectedSeverity === "all" || call.severity === selectedSeverity
      const matchesEnterprise = selectedEnterprise === "all" || call.enterprise === selectedEnterprise
      const matchesCallType = selectedCallType === "all" || call.callType === selectedCallType
      const matchesSearch = searchTerm === "" || 
        call.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.phoneNumber.includes(searchTerm)
      
      return matchesAgent && matchesSeverity && matchesEnterprise && matchesCallType && matchesSearch
    })
  }, [callsData, selectedAgent, selectedSeverity, selectedEnterprise, selectedCallType, searchTerm])

  const getSeverityBadge = (severity: string) => {
    const colorClass = severity === "High" ? "bg-red-100 text-red-700 border-red-200" :
                      severity === "Medium" ? "bg-amber-100 text-amber-700 border-amber-200" :
                      "bg-green-100 text-green-700 border-green-200"
    
    return (
      <Badge className={`${colorClass} text-xs border`}>
        {severity}
      </Badge>
    )
  }

  const handleCallClick = (callId: string) => {
    router.push(`/review?callId=${callId}`)
  }

  if (!issueInfo) {
    return (
      <AppShell>
        <div className="attio-container h-full flex flex-col">
          <div className="flex-1 overflow-auto py-8">
            <div className="max-w-7xl mx-auto">
              <EmptyState
                icon={<FileX className="h-8 w-8 text-muted-foreground" />}
                heading="Issue not found"
                subheading="The requested issue could not be found."
                ctaLabel="Back to Dashboard"
                onCtaClick={() => router.push('/dashboard')}
              />
            </div>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="attio-container h-full flex flex-col">
        <div className="flex-1 overflow-auto py-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => router.back()}
                    className="text-muted-foreground hover:text-foreground p-2 h-8 w-8"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-xl font-semibold tracking-tight text-foreground">{issueInfo.name}</h2>
                  <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                    {issueInfo.category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground ml-11">{issueInfo.description}</p>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                <Input 
                  placeholder="Search calls..." 
                  className="pl-10 bg-white/90 backdrop-blur-sm border-border/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger className="w-auto min-w-[140px] bg-white/90 backdrop-blur-sm border-border/50">
                  <SelectValue placeholder="All Agents">
                    {selectedAgent === "all" ? "All Agents" : selectedAgent}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-md border-border/50">
                  <SelectItem value="all" className="text-foreground hover:bg-muted/50">All Agents</SelectItem>
                  <SelectItem value="AutoBot-1" className="text-foreground hover:bg-muted/50">AutoBot-1</SelectItem>
                  <SelectItem value="AutoBot-2" className="text-foreground hover:bg-muted/50">AutoBot-2</SelectItem>
                  <SelectItem value="AutoBot-3" className="text-foreground hover:bg-muted/50">AutoBot-3</SelectItem>
                  <SelectItem value="AutoBot-6" className="text-foreground hover:bg-muted/50">AutoBot-6</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger className="w-auto min-w-[140px] bg-white/90 backdrop-blur-sm border-border/50">
                  <SelectValue placeholder="All Severities">
                    {selectedSeverity === "all" ? "All Severities" : selectedSeverity}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-md border-border/50">
                  <SelectItem value="all" className="text-foreground hover:bg-muted/50">All Severities</SelectItem>
                  <SelectItem value="High" className="text-foreground hover:bg-muted/50">High</SelectItem>
                  <SelectItem value="Medium" className="text-foreground hover:bg-muted/50">Medium</SelectItem>
                  <SelectItem value="Low" className="text-foreground hover:bg-muted/50">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedEnterprise} onValueChange={setSelectedEnterprise}>
                <SelectTrigger className="w-auto min-w-[160px] bg-white/90 backdrop-blur-sm border-border/50">
                  <SelectValue placeholder="All Enterprises">
                    {selectedEnterprise === "all" ? "All Enterprises" : selectedEnterprise}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-md border-border/50">
                  <SelectItem value="all" className="text-foreground hover:bg-muted/50">All Enterprises</SelectItem>
                  <SelectItem value="Metro Honda" className="text-foreground hover:bg-muted/50">Metro Honda</SelectItem>
                  <SelectItem value="City Nissan" className="text-foreground hover:bg-muted/50">City Nissan</SelectItem>
                  <SelectItem value="Downtown Motors" className="text-foreground hover:bg-muted/50">Downtown Motors</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedCallType} onValueChange={setSelectedCallType}>
                <SelectTrigger className="w-auto min-w-[120px] bg-white/90 backdrop-blur-sm border-border/50">
                  <SelectValue placeholder="All Types">
                    {selectedCallType === "all" ? "All Types" : selectedCallType}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-md border-border/50">
                  <SelectItem value="all" className="text-foreground hover:bg-muted/50">All Types</SelectItem>
                  <SelectItem value="Live" className="text-foreground hover:bg-muted/50">Live</SelectItem>
                  <SelectItem value="Demo" className="text-foreground hover:bg-muted/50">Demo</SelectItem>
                </SelectContent>
              </Select>

              {(selectedAgent !== "all" || selectedSeverity !== "all" || selectedEnterprise !== "all" || selectedCallType !== "all" || searchTerm !== "") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedAgent("all")
                    setSelectedSeverity("all")
                    setSelectedEnterprise("all")
                    setSelectedCallType("all")
                    setSearchTerm("")
                  }}
                  className="text-sm bg-white/80 hover:bg-white/95"
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Calls Table */}
            <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
              <CardHeader className="pb-6">
                <CardTitle className="text-lg font-semibold text-foreground">
                  All Calls with This Issue ({filteredCalls.length})
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Complete list of calls where this specific issue was identified and marked
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredCalls.length === 0 ? (
                  <EmptyState
                    icon={Phone as any}
                    heading="No calls found"
                    subheading={
                      searchTerm || selectedAgent !== "all" || selectedSeverity !== "all" || selectedEnterprise !== "all" || selectedCallType !== "all"
                        ? "No calls match your current search criteria or filters."
                        : "No calls found with this issue."
                    }
                    ctaLabel={
                      searchTerm || selectedAgent !== "all" || selectedSeverity !== "all" || selectedEnterprise !== "all" || selectedCallType !== "all"
                        ? "Clear Filters"
                        : undefined
                    }
                    onCtaClick={
                      searchTerm || selectedAgent !== "all" || selectedSeverity !== "all" || selectedEnterprise !== "all" || selectedCallType !== "all"
                        ? () => {
                            setSelectedAgent("all")
                            setSelectedSeverity("all")
                            setSelectedEnterprise("all")
                            setSelectedCallType("all")
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
                          <TableHead className="font-semibold text-foreground py-3 px-4">Customer/Phone Number</TableHead>
                          <TableHead className="font-semibold text-foreground py-3 px-4">Timestamp</TableHead>
                          <TableHead className="font-semibold text-foreground py-3 px-4">Agent</TableHead>
                          <TableHead className="font-semibold text-foreground py-3 px-4">Enterprise</TableHead>
                          <TableHead className="font-semibold text-foreground py-3 px-4">Severity</TableHead>
                          <TableHead className="font-semibold text-foreground py-3 px-4">Call Type</TableHead>
                          <TableHead className="font-semibold text-foreground py-3 px-4">Audio</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCalls.map((call) => (
                          <TableRow 
                            key={call.id}
                            className="hover:bg-muted/50 cursor-pointer transition-all duration-200 hover:bg-white/80 backdrop-blur-sm"
                            style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}
                            onClick={() => handleCallClick(call.id)}
                            title="Click to review this call"
                          >
                            <TableCell className="py-4 px-4">
                              <div>
                                <div className="font-medium text-foreground">{call.customerName}</div>
                                <div className="text-sm text-muted-foreground">{call.phoneNumber}</div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <span className="text-sm text-foreground">{call.timestamp}</span>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <div>
                                <div className="font-medium text-foreground">{call.agent.name}</div>
                                <div className="text-sm text-muted-foreground">{call.agent.role}</div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <span className="text-sm text-foreground">{call.enterprise}</span>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              {getSeverityBadge(call.severity)}
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <Badge variant="outline" className="text-xs">
                                {call.callType}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-primary/10"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    // Handle audio play
                                  }}
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                                <div className="text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Volume2 className="h-3 w-3" />
                                    {call.audio.duration} / {call.audio.totalDuration}
                                  </div>
                                  <div className="text-xs text-muted-foreground/70">
                                    Issue: {call.audio.issueTimestamp}
                                  </div>
                                </div>
                              </div>
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
        </div>
      </div>
    </AppShell>
  )
}
