"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X, Filter, ArrowRight, ArrowLeft, Clock, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { enumApiService, getAllEnumCategories, getEnumCategoryLabel, getSeverityColor } from "@/lib/enum-api"
import { getAuthParamsOrDefaults } from "@/lib/auth-utils"

interface MarkIssueFormProps {
  transcriptText: string
  timestamp: number
  onSubmit: (issue: { 
    addIssues: Array<{ issueId: string; severity: 'low' | 'medium' | 'high' }>;
    updateIssues: Array<{ id: string; severity: 'low' | 'medium' | 'high' }>;
    deleteIssues: string[];
  }) => void
  onCancel: () => void
  showActions?: boolean
  onFormChange?: (isValid: boolean, selectedCount: number) => void
  existingIssuesAtTimestamp?: Array<{ _id: string; issueId: string; code: string; title: string; description: string; severity: 'low' | 'medium' | 'high'; isActive: boolean }>
  onNewIssue?: () => void
}

export interface MarkIssueFormRef {
  submitForm: () => void
}

// Types for API data
interface IssueType {
  id: string
  text: string
  category: string
  severity: string
  code: string
}

interface SelectedIssue {
  id: string
  text: string
  category: string
  severity: string
  originalId?: string // For tracking the original _id from issues API for deletion
}

export const MarkIssueForm = React.forwardRef<MarkIssueFormRef, MarkIssueFormProps>(({ 
  transcriptText, 
  timestamp, 
  onSubmit, 
  onCancel,
  showActions = true,
  onFormChange,
  existingIssuesAtTimestamp = [],
  onNewIssue
}, ref) => {

  const [selectedIssues, setSelectedIssues] = React.useState<SelectedIssue[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string>("")
  const [isTranscriptExpanded, setIsTranscriptExpanded] = React.useState(false)
  const [selectedIssueIndex, setSelectedIssueIndex] = React.useState<number>(-1)
  
  // Track original existing issues to calculate deletes
  const [originalExistingIssues, setOriginalExistingIssues] = React.useState<Array<{ id: string; severity: string; originalId?: string }>>([])
  const [initializedExistingIssues, setInitializedExistingIssues] = React.useState(false)
  
  // API state
  const [issueTypes, setIssueTypes] = React.useState<IssueType[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  
  // Custom issue state
  const [showCustomIssueForm, setShowCustomIssueForm] = React.useState(false)
  const [customIssueText, setCustomIssueText] = React.useState("")
  const [customIssueCategory, setCustomIssueCategory] = React.useState("Other")
  
  // Reference to the search input for auto-focusing
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  // Fetch enums from API
  React.useEffect(() => {
    const loadEnums = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await enumApiService.getIssueMasters({ isActive: true })
        
        // Transform API data to IssueType format and filter out inactive issues
        const transformedIssues: IssueType[] = response.data
          .filter(issue => {
            return issue.isActive === true
          })
          .map(issue => ({
            id: (issue as any).id || issue._id, // Handle both id and _id field names
            text: issue.title,
            category: getEnumCategoryLabel(issue.code),
            severity: issue.defaultSeverity,
            code: issue.code
          }))
        

        setIssueTypes(transformedIssues)
      } catch (error) {
        console.error('Error loading enums:', error)
        setError('Failed to load issue types.')
      } finally {
        setIsLoading(false)
      }
    }

    loadEnums()
  }, [])

  // Initialize existing issues when component mounts or existing issues change
  React.useEffect(() => {
    // Always reinitialize when existingIssuesAtTimestamp changes
    if (existingIssuesAtTimestamp.length > 0) {
      // Filter out inactive issues - only show active issues
      const activeExistingIssues = existingIssuesAtTimestamp.filter(issue => {
        // Only include issues that are explicitly active (isActive === true)
        // If isActive is undefined, assume it's active (for backward compatibility)
        return issue.isActive === true || issue.isActive === undefined
      })
      
      const existingSelectedIssues: SelectedIssue[] = activeExistingIssues.map(issue => {
        let category = 'Other'
        try {
          category = getEnumCategoryLabel(issue.code as any) || 'Other'
        } catch (error) {
          console.warn('Failed to get category label for code:', issue.code, error)
        }
        

        
        return {
          id: issue.issueId, // Use issueId to match with issue-master _id
          text: issue.title,
          category,
          severity: issue.severity,
          originalId: issue._id // Store the original _id for deletion
        }
      })
      
      const originalIssues = activeExistingIssues.map(issue => ({
        id: issue.issueId, // Use issueId to match with issue-master _id
        severity: issue.severity,
        originalId: issue._id // Store the original _id for deletion
      }))
      
      setSelectedIssues(existingSelectedIssues)
      setOriginalExistingIssues(originalIssues)
      setInitializedExistingIssues(true)
    } else {
      // No existing issues at this timestamp
      setSelectedIssues([])
      setOriginalExistingIssues([])
      setInitializedExistingIssues(true)
    }
  }, [existingIssuesAtTimestamp])

  // Reset initialization flag when timestamp changes (new issue marking session)
  React.useEffect(() => {
    setInitializedExistingIssues(false)
    // Don't clear originalExistingIssues here - let the initialization effect handle it
  }, [timestamp])

  // Filter issues based on search query and category
  const filteredIssues = React.useMemo(() => {
    let filtered = issueTypes

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
  }, [issueTypes, searchQuery, selectedCategory])

  // Get unique categories for filter
  const categories = React.useMemo(() => {
    const uniqueCategories = [...new Set(issueTypes.map(issue => issue.category))]
    return uniqueCategories.sort()
  }, [issueTypes])

  // Auto-focus the search input when component mounts
  React.useEffect(() => {
    if (searchInputRef.current) {
      // Small delay to ensure the component is fully rendered
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }, [])

  // Keyboard event handler for issue selection and severity
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not hijack keys while typing in inputs/textareas/selects or contenteditable
      const target = e.target as HTMLElement | null
      const tag = target?.tagName?.toLowerCase()
      const isTypingContext = tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable

      // N key to trigger new issue (focus search) - only when not typing
      if ((e.key === 'n' || e.key === 'N') && !isTypingContext) {
        e.preventDefault()
        if (onNewIssue) {
          onNewIssue()
        }
        // Also focus the search input
        setTimeout(() => {
          const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
          if (searchInput) {
            searchInput.focus()
          }
        }, 100)
        return
      }

      // Severity selection (1=low, 2=medium, 3=high) - PRIORITY: Handle FIRST when there are selected issues
      if (selectedIssues.length > 0 && /^[1-3]$/.test(e.key)) {
        e.preventDefault()
        const severityMap = { '1': 'low', '2': 'medium', '3': 'high' }
        const severity = severityMap[e.key as '1' | '2' | '3']
        const issue = selectedIssues[0] // Only one issue since we enforce single selection
        if (issue) {
          updateIssueSeverity(issue.id, severity)
        }
        return
      }

      // Number keys for issue selection (1-9) - works when search input is focused
      if (e.target instanceof HTMLInputElement && /^[1-9]$/.test(e.key)) {
        e.preventDefault()
        const index = parseInt(e.key) - 1
        if (index < filteredIssues.length) {
          const issue = filteredIssues[index]
          const isSelected = selectedIssues.some(selected => selected.id === issue.id)
          
          if (!isSelected) {
            // Clear previous selections and add only this issue
            setSelectedIssues([])
            addIssue(issue)
            setTimeout(() => {
              setSelectedIssueIndex(0) // Always the first (and only) item
              // Scroll to the selected issues section
              const selectedSection = document.querySelector('[data-selected-issues-form]')
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

      // Shift + number keys for issues 10-18 (Shift+1-9)
      if (e.target instanceof HTMLInputElement && e.shiftKey && /^[1-9]$/.test(e.key)) {
        e.preventDefault()
        const index = parseInt(e.key) - 1 + 9 // 10-18
        if (index < filteredIssues.length) {
          const issue = filteredIssues[index]
          const isSelected = selectedIssues.some(selected => selected.id === issue.id)
          
          if (!isSelected) {
            // Clear previous selections and add only this issue
            setSelectedIssues([])
            addIssue(issue)
            setTimeout(() => {
              setSelectedIssueIndex(0) // Always the first (and only) item
              // Scroll to the selected issues section
              const selectedSection = document.querySelector('[data-selected-issues-form]')
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

      // Enter key to submit when has issues - works globally
      if (e.key === 'Enter' && selectedIssues.length > 0) {
        e.preventDefault()
        handleSubmit()
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [filteredIssues, selectedIssues, selectedIssueIndex])

  // Memoize form validation calculations to prevent unnecessary re-renders
  const formValidation = React.useMemo(() => {
    // Calculate if there are any changes to be made
    const currentIssues = selectedIssues.map(issue => ({
      id: issue.id,
      severity: issue.severity
    }))
    
    // Count additions (newly selected issues OR existing issues with changed severity)
    const additions = currentIssues.filter(current => {
      const original = originalExistingIssues.find(orig => orig.id === current.id)
      return !original || original.severity !== current.severity
    }).length
    
    // Count deletions (originally selected issues that are no longer selected)
    const deletions = originalExistingIssues.filter(original => {
      const current = currentIssues.find(curr => curr.id === original.id)
      return !current
    }).length
    
    // Form is valid if there are any changes to be made (additions or deletions)
    const isValid = additions > 0 || deletions > 0
    const totalChanges = additions + deletions
    
    return { isValid, totalChanges }
  }, [selectedIssues, originalExistingIssues])

  // Notify parent about form changes
  React.useEffect(() => {
    onFormChange?.(formValidation.isValid, formValidation.totalChanges)
  }, [formValidation.isValid, formValidation.totalChanges, onFormChange])

  const addIssue = React.useCallback((issue: IssueType) => {
    const newSelectedIssue: SelectedIssue = {
      id: issue.id,
      text: issue.text,
      category: issue.category,
      severity: issue.severity // Use the issue's default severity from API
    }
    setSelectedIssues(prev => [...prev, newSelectedIssue])
  }, [])

  const removeIssue = React.useCallback((issueId: string) => {
    setSelectedIssues(prev => prev.filter(issue => issue.id !== issueId))
  }, [])

  const updateIssueSeverity = React.useCallback((issueId: string, severity: string) => {
    setSelectedIssues(prev => prev.map(issue => 
      issue.id === issueId ? { ...issue, severity } : issue
    ))
  }, [])

  const addCustomIssue = () => {
    if (customIssueText.trim()) {
      const customIssue = {
        id: `custom-${Date.now()}`,
        text: customIssueText.trim(),
        category: customIssueCategory,
        severity: "medium" as const // Default severity for custom issues
      }
      
      const newSelectedIssue: SelectedIssue = {
        id: customIssue.id,
        text: customIssue.text,
        category: customIssue.category,
        severity: customIssue.severity
      }
      
      setSelectedIssues(prev => [...prev, newSelectedIssue])
      
      // Reset custom issue form
      setCustomIssueText("")
      setCustomIssueCategory("Other")
      setShowCustomIssueForm(false)
    }
  }

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    
    // Calculate addIssues and deleteIssues based on actual changes
    const currentIssues = selectedIssues.map(issue => ({
      id: issue.id,
      severity: issue.severity
    }))
    
    // Issues to add: newly selected issues only
    const addIssues: Array<{ issueId: string; severity: 'low' | 'medium' | 'high' }> = []
    // Issues to update: existing issues with changed severity
    const updateIssues: Array<{ id: string; severity: 'low' | 'medium' | 'high' }> = []
    
    currentIssues.forEach(current => {
      const original = originalExistingIssues.find(orig => orig.id === current.id)
      
      if (!original) {
        // Newly selected issue
        addIssues.push({
          issueId: current.id,
          severity: current.severity as 'low' | 'medium' | 'high'
        })
      } else if (original.severity !== current.severity) {
        // Existing issue with changed severity - use originalId (_id from issues API)
        const originalIssue = originalExistingIssues.find(orig => orig.id === current.id)
        if (originalIssue && originalIssue.originalId) {
          updateIssues.push({
            id: originalIssue.originalId, // Use the _id from issues API
            severity: current.severity as 'low' | 'medium' | 'high'
          })
        }
      }
      // If original exists and severity is same, no change needed
    })
    
    // Issues to delete: originally selected issues that are no longer selected
    const deleteIssues = originalExistingIssues.filter(original => {
      const current = currentIssues.find(curr => curr.id === original.id)
      return !current // Only delete if completely removed
    }).map(issue => issue.originalId).filter((id): id is string => id !== undefined) // Use originalId (the _id from issues API) for deletion
    
    onSubmit({
      addIssues,
      updateIssues,
      deleteIssues
    })
  }

  // Expose submit method to parent
  React.useImperativeHandle(ref, () => ({
    submitForm: handleSubmit
  }))

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Transcript Context */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Transcript Context</Label>
        <div className="p-3 bg-muted rounded-lg">
          <div 
            className={`text-sm text-muted-foreground cursor-pointer transition-all ${
              !isTranscriptExpanded ? 'line-clamp-2' : ''
            }`}
            onClick={() => setIsTranscriptExpanded(!isTranscriptExpanded)}
          >
            {transcriptText}
          </div>
          {transcriptText.length > 120 && (
            <button
              onClick={() => setIsTranscriptExpanded(!isTranscriptExpanded)}
              className="text-xs text-primary hover:text-primary/80 mt-2 font-medium transition-colors"
            >
              {isTranscriptExpanded ? 'Show less' : 'Click to view full'}
            </button>
          )}
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {Math.floor(timestamp / 60)}:{(timestamp % 60).toString().padStart(2, '0')}
          </p>
        </div>
      </div>

      {/* Enhanced Issue Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Find & Mark Issues</Label>
          <Badge variant="outline" className="text-xs">
            {selectedIssues.length} selected
          </Badge>
        </div>
        
        {/* Smart Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
          <Input
            ref={searchInputRef}
            placeholder="Search by issue name, category, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {/* Quick Category Filters */}
        {isLoading ? (
          <div className="flex gap-1 flex-wrap">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-2 py-1 bg-muted rounded-md animate-pulse">
                <div className="h-4 w-16 bg-muted-foreground/20 rounded"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-sm text-red-600">
            {error}
          </div>
        ) : (
          <div className="flex gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedCategory("")}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                selectedCategory === "" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({issueTypes.length})
            </button>
            {categories.map((category) => {
              const count = issueTypes.filter(issue => issue.category === category).length
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${
                    selectedCategory === category 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {category} ({count})
                </button>
              )
            })}
          </div>
        )}

        {/* Issues Grid */}
        <div className="grid gap-2">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-3 border rounded-lg animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-muted rounded"></div>
                    <div className="h-4 w-32 bg-muted rounded"></div>
                  </div>
                  <div className="h-3 w-8 bg-muted rounded"></div>
                </div>
              </div>
            ))
          ) : error ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Failed to load issue types. Please try again.
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              {searchQuery ? `No issues found matching "${searchQuery}"` : "No issues available"}
            </div>
          ) : (
            filteredIssues.map((issue, index) => {
            const isSelected = selectedIssues.some(selected => selected.id === issue.id)
            const shortcutKey = index < 9 ? `${index + 1}` : index < 18 ? `Shift+${index - 8}` : null
            
            return (
              <div
                key={issue.id}
                className={`group relative p-3 border rounded-lg cursor-pointer transition-all ${
                  isSelected 
                    ? "border-primary bg-primary/5 shadow-sm" 
                    : "border-border hover:border-primary/50 hover:bg-muted/30"
                }`}
                onClick={() => isSelected ? removeIssue(issue.id) : addIssue(issue)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                      isSelected 
                        ? "border-primary bg-primary" 
                        : "border-muted-foreground/30 group-hover:border-primary/50"
                    }`}>
                      {isSelected && (
                        <svg className="w-2.5 h-2.5 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm font-medium ${isSelected ? "text-foreground" : "text-foreground/90"}`}>
                      {issue.text}
                    </span>
                  </div>
                  
                  <div className="flex-shrink-0">
                    {shortcutKey && (
                      <kbd className="px-2 py-1 bg-muted text-xs rounded font-mono border">
                        {shortcutKey}
                      </kbd>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
        </div>

        {/* Custom Issue Section */}
        {/* <div className="space-y-3">
          {!showCustomIssueForm ? (
            <button
              type="button"
              onClick={() => setShowCustomIssueForm(true)}
              className="w-full p-3 border-2 border-dashed border-muted-foreground/30 rounded-lg hover:border-primary/50 hover:bg-muted/30 transition-colors text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Custom Issue
            </button>
          ) : (
            <div className="border rounded-lg p-4 bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Add Custom Issue</Label>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomIssueForm(false)
                    setCustomIssueText("")
                    setCustomIssueCategory("Other")
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                <Input
                  placeholder="Describe the issue..."
                  value={customIssueText}
                  onChange={(e) => setCustomIssueText(e.target.value)}
                  className="text-sm"
                />
                
                <div className="flex gap-2">
                  <Select value={customIssueCategory} onValueChange={setCustomIssueCategory}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Other">Other</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button
                    type="button"
                    onClick={addCustomIssue}
                    disabled={!customIssueText.trim()}
                    size="sm"
                    className="px-4"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div> */}

      </div>

      {/* Selected Issues Management */}
      {selectedIssues.length > 0 && (
        <div className="space-y-3" data-selected-issues-form>
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Selected Issues ({selectedIssues.length})</Label>
            <button
              type="button"
              onClick={() => setSelectedIssues([])}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all
            </button>
          </div>
          
          <div className="space-y-2">
            {selectedIssues.map((issue, index) => (
              <div 
                key={issue.id} 
                className={`bg-card border rounded-lg p-3 cursor-pointer transition-colors ${
                  selectedIssueIndex === index ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedIssueIndex(index)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-foreground">{issue.text}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeIssue(issue.id)
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Severity Selection */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Severity Level {selectedIssueIndex === index && '(Press 1/2/3)'}
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'low', label: 'Low', key: '1' },
                      { value: 'medium', label: 'Medium', key: '2' },
                      { value: 'high', label: 'High', key: '3' }
                    ].map((severity) => (
                      <button
                        key={severity.value}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          updateIssueSeverity(issue.id, severity.value)
                        }}
                        className={`px-3 py-2 text-xs font-medium rounded-md border transition-colors flex items-center justify-center gap-1 ${
                          issue.severity === severity.value
                            ? severity.value === 'low'
                              ? 'bg-green-50 border-green-200 text-green-700'
                              : severity.value === 'medium'
                              ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                              : 'bg-red-50 border-red-200 text-red-700'
                            : severity.value === 'low'
                            ? 'bg-background border-border text-muted-foreground hover:bg-green-50 hover:border-green-300 hover:text-green-700'
                            : severity.value === 'medium'
                            ? 'bg-background border-border text-muted-foreground hover:bg-yellow-50 hover:border-yellow-300 hover:text-yellow-700'
                            : 'bg-background border-border text-muted-foreground hover:bg-red-50 hover:border-red-300 hover:text-red-700'
                        }`}
                      >
                        {selectedIssueIndex === index && (
                          <kbd className="text-xs opacity-70">{severity.key}</kbd>
                        )}
                        {severity.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Summary Bar */}
          <div className="bg-muted/30 rounded-lg p-3 border">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">
                Total: {selectedIssues.length} issue{selectedIssues.length > 1 ? 's' : ''}
              </span>
              <div className="flex gap-2">
                {[
                  { severity: 'high', label: 'High', variant: 'destructive' as const },
                  { severity: 'medium', label: 'Medium', variant: 'default' as const },
                  { severity: 'low', label: 'Low', variant: 'secondary' as const }
                ].map(({ severity, label, variant }) => {
                  const count = selectedIssues.filter(issue => issue.severity === severity).length
                  if (count === 0) return null
                  return (
                    <Badge key={severity} variant={variant} className="text-xs">
                      {count} {label}
                    </Badge>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Actions */}
      {showActions && (
        <div className="flex gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={selectedIssues.length === 0}
            className="flex-1"
          >
            Mark {selectedIssues.length > 0 ? `${selectedIssues.length} Issue${selectedIssues.length > 1 ? 's' : ''}` : 'Issues'}
          </Button>
        </div>
      )}
    </form>
  )
})

MarkIssueForm.displayName = 'MarkIssueForm'
