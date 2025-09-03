"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X, Filter, ArrowRight, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { COMPREHENSIVE_ENUMS, ENUM_CATEGORIES } from "@/lib/comprehensive-enums"

interface PreviousIssue {
  id: string
  type: string
  severity: string
  timestamp: number
  transcriptText: string
  createdAt: string
}

interface MarkIssueDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (issue: { issues: Array<{ type: string; severity: string }>; description: string }) => void
  transcriptText: string
  timestamp: number
  callId: string
  previousIssues?: PreviousIssue[]
}

// Convert comprehensive enums to the format expected by the dialog
const ISSUE_TYPES = COMPREHENSIVE_ENUMS.map(enum_ => ({
  id: enum_.code.toLowerCase().replace(/_/g, '-'),
  text: enum_.title,
  category: getCategoryDisplayName(enum_.id),
  severity: enum_.severity.toLowerCase()
}))

// Helper function to map enum IDs to consolidated automotive-specific category names
function getCategoryDisplayName(enumId: string): string {
  const prefix = enumId.split('-')[1] // Extract 'cf', 'cs', etc. from 'enum-cf-001'
  switch (prefix) {
    case 'cf': // Call Flow & Timing Issues
    case 'cs': // Agent Communication Style
      return 'Communication & Call Quality'
      
    case 'da': // Vehicle & Pricing Data
    case 'st': // Inventory & Search Systems
      return 'Vehicle Data & Systems'
      
    case 'ci': // Customer Information Management
    case 'ab': // Appointment & Test Drive Booking
    case 'ps': // Process & Workflow Adherence
      return 'Process & Customer Management'
      
    case 'fc': // Follow-up & Confirmations
      return 'Follow-up & Communications'
      
    default: return 'Other Issues'
  }
}

interface SelectedIssue {
  id: string
  text: string
  category: string
  severity: string
}

export function MarkIssueDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  transcriptText, 
  timestamp,
  callId,
  previousIssues = []
}: MarkIssueDialogProps) {
  const [selectedIssues, setSelectedIssues] = React.useState<SelectedIssue[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string>("")
  const [currentTab, setCurrentTab] = React.useState<'search' | 'selected' | 'previous'>('search')
  const [focusedIssueIndex, setFocusedIssueIndex] = React.useState<number>(-1)
  const [selectedIssueIndex, setSelectedIssueIndex] = React.useState<number>(-1)

  // Filter issues based on search query and category
  const filteredIssues = React.useMemo(() => {
    let filtered = ISSUE_TYPES

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(issue => 
        issue.text.toLowerCase().includes(query) || 
        issue.category.toLowerCase().includes(query)
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter(issue => issue.category === selectedCategory)
    }

    // Keep all issues visible, selected ones will show as checked
    return filtered
  }, [searchQuery, selectedCategory])

  // Get unique categories for filter
  const categories = React.useMemo(() => {
    const uniqueCategories = [...new Set(ISSUE_TYPES.map(issue => issue.category))]
    return uniqueCategories.sort()
  }, [])

  const addIssue = (issue: typeof ISSUE_TYPES[0]) => {
    const newSelectedIssue: SelectedIssue = {
      id: issue.id,
      text: issue.text,
      category: issue.category,
      severity: "medium" // Default severity
    }
    setSelectedIssues(prev => [...prev, newSelectedIssue])
  }

  const removeIssue = (issueId: string) => {
    setSelectedIssues(prev => prev.filter(issue => issue.id !== issueId))
  }

  const updateIssueSeverity = (issueId: string, severity: string) => {
    setSelectedIssues(prev => prev.map(issue => 
      issue.id === issueId ? { ...issue, severity } : issue
    ))
  }

  // Keyboard event handler
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      // Tab to close dialog
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault()
        onOpenChange(false)
        return
      }

      // 'n' to switch to search tab and focus search input
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        setCurrentTab('search')
        // Focus the search input after switching tabs
        setTimeout(() => {
          const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
          if (searchInput) {
            searchInput.focus()
          }
        }, 100)
        return
      }

      // 's' key specifically for switching from Previous Issues tab to Search tab
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault()
        setCurrentTab('search')
        // Focus the search input after switching tabs
        setTimeout(() => {
          const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
          if (searchInput) {
            searchInput.focus()
          }
        }, 100)
        return
      }

      // Cmd+Shift+N (Mac) or Ctrl+Shift+N (Windows/Linux) to switch back to search from previous issues tab
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'N') {
        e.preventDefault()
        setCurrentTab('search')
        // Focus the search input after switching tabs
        setTimeout(() => {
          const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
          if (searchInput) {
            searchInput.focus()
          }
        }, 100)
        return
      }

      // Severity selection (1=low, 2=medium, 3=high) - PRIORITY: Handle this FIRST when there are selected issues
      if (selectedIssues.length > 0 && /^[1-3]$/.test(e.key) && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault()
        const severityMap = { '1': 'low', '2': 'medium', '3': 'high' }
        const severity = severityMap[e.key as '1' | '2' | '3']
        const issue = selectedIssues[0] // Only one issue since we enforce single selection
        if (issue) {
          updateIssueSeverity(issue.id, severity)
          // Auto-switch to selected tab if not already there to show the change
          if (currentTab !== 'selected') {
            setCurrentTab('selected')
          }
        }
        return
      }

      // Number keys for issue selection (1-9) - works in search tab and when search input is focused
      // Only runs if no selected issues (severity takes priority)
      // BUT NOT when Ctrl is pressed (that's for issues 10-18)
      if ((currentTab === 'search' || e.target instanceof HTMLInputElement) && !e.ctrlKey && /^[1-9]$/.test(e.key)) {
        e.preventDefault()
        const index = parseInt(e.key) - 1
        if (index < filteredIssues.length) {
          const issue = filteredIssues[index]
          const isSelected = selectedIssues.some(selected => selected.id === issue.id)
          
          if (!isSelected) {
            // Clear previous selections and add only this issue
            setSelectedIssues([])
            addIssue(issue)
            
            // Switch to selected tab and focus the newly added issue
            setCurrentTab('selected')
            setTimeout(() => {
              setSelectedIssueIndex(0) // Always the first (and only) item
              // Scroll to the selected issues section
              const selectedSection = document.querySelector('[data-selected-issues]')
              if (selectedSection) {
                selectedSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }
            }, 100)
          } else {
            // Remove the issue if already selected
            removeIssue(issue.id)
          }
        }
        return
      }

      // Ctrl + number keys for issues 10-18 (Ctrl+1-9) - works in search tab and when search input is focused
      if ((currentTab === 'search' || e.target instanceof HTMLInputElement) && e.ctrlKey && /^[1-9]$/.test(e.key)) {
        e.preventDefault()
        const index = parseInt(e.key) - 1 + 9 // 10-18
        if (index < filteredIssues.length) {
          const issue = filteredIssues[index]
          const isSelected = selectedIssues.some(selected => selected.id === issue.id)
          
          if (!isSelected) {
            // Clear previous selections and add only this issue
            setSelectedIssues([])
            addIssue(issue)
            
            // Switch to selected tab and focus the newly added issue
            setCurrentTab('selected')
            setTimeout(() => {
              setSelectedIssueIndex(0) // Always the first (and only) item
              // Scroll to the selected issues section
              const selectedSection = document.querySelector('[data-selected-issues]')
              if (selectedSection) {
                selectedSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }
            }, 100)
          } else {
            // Remove the issue if already selected
            removeIssue(issue.id)
          }
        }
        return
      }

            // Enter key to submit when there are selected issues (works globally)
      if (e.key === 'Enter' && selectedIssues.length > 0 && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault()
        handleSubmit()
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, currentTab, filteredIssues, selectedIssues, selectedIssueIndex])

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (selectedIssues.length > 0) {
      const issuesData = selectedIssues.map(issue => ({
        type: issue.text,
        severity: issue.severity
      }))

      onSubmit({
        issues: issuesData,
        description: `${selectedIssues.length} issue(s) marked at ${formatTimestamp(timestamp)}s`
      })
      
      // Reset form and switch to previous issues tab to show what was just marked
      setSelectedIssues([])
      setSearchQuery("")
      setSelectedCategory("")
      setCurrentTab('previous')
      setSelectedIssueIndex(-1)
      setFocusedIssueIndex(-1)
      // Keep dialog open and show previous issues
    }
  }

  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("")
  }

  const severityOptions = [
    { value: "low", label: "Low", color: "bg-green-100 text-green-800 border-green-200" },
    { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    { value: "high", label: "High", color: "bg-orange-100 text-orange-800 border-orange-200" },
    { value: "critical", label: "Critical", color: "bg-red-100 text-red-800 border-red-200" }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Mark Issues</DialogTitle>
          <DialogDescription>
            Report issues found in this transcript line at {formatTimestamp(timestamp)}s
          </DialogDescription>
          <div className="text-xs text-muted-foreground mt-2 space-y-1">
            <div><kbd className="px-2 py-1 bg-muted rounded text-xs">1-9</kbd> Select & focus issue • <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+1-9</kbd> Select issues 10-18</div>
            <div><kbd className="px-2 py-1 bg-muted rounded text-xs">1/2/3</kbd> Set severity • <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd> Submit • <kbd className="px-2 py-1 bg-muted rounded text-xs">N</kbd> or <kbd className="px-2 py-1 bg-muted rounded text-xs">S</kbd> New search • <kbd className="px-2 py-1 bg-muted rounded text-xs">Tab</kbd> Close</div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transcript-text">Transcript Text</Label>
              <div className="p-3 bg-muted rounded-md text-sm max-h-20 overflow-y-auto">
              "{transcriptText}"
            </div>
          </div>

            {/* Tab Navigation */}
            <div className="flex border-b">
              <button
                type="button"
                onClick={() => setCurrentTab('search')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  currentTab === 'search'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Search Issues ({filteredIssues.length})
              </button>
              <button
                type="button"
                onClick={() => setCurrentTab('selected')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  currentTab === 'selected'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Selected Issues ({selectedIssues.length})
              </button>
              <button
                type="button"
                onClick={() => setCurrentTab('previous')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  currentTab === 'previous'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Previous Issues ({previousIssues.length})
              </button>
            </div>

            {currentTab === 'search' ? (
              <div className="space-y-3">
                {/* Search Issues Content */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Available Issues</Label>
                  <Badge variant="outline">{filteredIssues.length} available</Badge>
          </div>

                {/* Search and Filter Bar */}
          <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                      <Input
                        placeholder="Search issues..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="pl-10 pr-8">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Categories</SelectItem>
                        {categories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {(searchQuery || selectedCategory) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>

                {/* Available Issues List */}
                <div className="border rounded-md h-80 overflow-y-auto">
                  {filteredIssues.length > 0 ? (
                    <div className="divide-y">
                      {filteredIssues.map((issue, index) => {
                        const isSelected = selectedIssues.some(selected => selected.id === issue.id)
                        const shortcutKey = index < 9 ? `${index + 1}` : index < 18 ? `Ctrl+${index - 8}` : null
                        
                        return (
                        <div
                          key={issue.id}
                          className="flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors"
                        >
                                                        <div className="flex items-center gap-2">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    addIssue(issue)
                                  } else {
                                    removeIssue(issue.id)
                                  }
                                }}
                              />
                            </div>
                          <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium">{issue.text}</span>
                            </div>
                            <div className="flex-shrink-0">
                              {shortcutKey && (
                                <kbd className="px-2 py-1 bg-muted text-xs rounded font-mono border">
                                  {shortcutKey}
                                </kbd>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No issues found matching your search.
                    </div>
                  )}
                </div>
              </div>

              </div>
            ) : currentTab === 'selected' ? (
              <div className="space-y-3" data-selected-issues>
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Selected Issues</Label>
                  <Badge variant="secondary">{selectedIssues.length} selected</Badge>
                </div>

                {/* Selected Issues List */}
                <div className="border rounded-md h-80 overflow-y-auto">
                  {selectedIssues.length > 0 ? (
                    <div className="divide-y">
                      {selectedIssues.map((issue, index) => (
                        <div
                          key={issue.id}
                          className={`p-3 space-y-2 cursor-pointer transition-colors ${
                            selectedIssueIndex === index ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-muted/50'
                          }`}
                          onClick={() => setSelectedIssueIndex(index)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium">{issue.text}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeIssue(issue.id)
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {/* Severity Selection */}
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">
                              Severity {selectedIssueIndex === index && '(Press 1/2/3)'}:
                            </Label>
                            <div className="grid grid-cols-3 gap-1">
                              {[
                                { value: 'low', label: 'Low', key: '1' },
                                { value: 'medium', label: 'Medium', key: '2' },
                                { value: 'high', label: 'High', key: '3' }
                              ].map((option) => (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    updateIssueSeverity(issue.id, option.value)
                                  }}
                                  className={cn(
                                    "px-2 py-1 text-xs rounded border transition-colors flex items-center justify-center gap-1",
                                    issue.severity === option.value
                                      ? option.value === 'low'
                                        ? "bg-green-50 border-green-200 text-green-700"
                                        : option.value === 'medium'
                                        ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                                        : "bg-red-50 border-red-200 text-red-700"
                                      : option.value === 'low'
                                      ? "bg-background border-border hover:bg-green-50 hover:border-green-300"
                                      : option.value === 'medium'
                                      ? "bg-background border-border hover:bg-yellow-50 hover:border-yellow-300"
                                      : "bg-background border-border hover:bg-red-50 hover:border-red-300"
                                  )}
                                >
                                  {selectedIssueIndex === index && (
                                    <kbd className="text-xs opacity-70">{option.key}</kbd>
                                  )}
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No issues selected. Switch to Search tab to select issues.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Previous Issues for Call {callId}</Label>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-muted-foreground">
                      Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">N</kbd> or <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">S</kbd> for new issue
                    </div>
                    <Badge variant="outline">{previousIssues.length} total</Badge>
                  </div>
          </div>

                {/* Previous Issues List */}
                <div className="border rounded-md h-80 overflow-y-auto">
                  {previousIssues.length > 0 ? (
                    <div className="divide-y">
                      {previousIssues.map((issue) => (
                        <div key={issue.id} className="p-3 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium">{issue.type}</span>
                              <div className="text-xs text-muted-foreground mt-1">
                                At {formatTimestamp(issue.timestamp)}s: "{issue.transcriptText}"
                              </div>
                            </div>
                            <Badge 
                              variant={
                                issue.severity === 'high' ? 'destructive' : 
                                issue.severity === 'medium' ? 'default' : 
                                'secondary'
                              }
                              className="text-xs"
                            >
                              {issue.severity.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No previous issues found for this call.
                    </div>
                  )}
                </div>
            </div>
            )}
          </div>

          <DialogFooter className="flex-shrink-0 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={selectedIssues.length === 0}
            >
              Mark {selectedIssues.length > 0 ? `${selectedIssues.length} Issue${selectedIssues.length > 1 ? 's' : ''}` : 'Issues'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}