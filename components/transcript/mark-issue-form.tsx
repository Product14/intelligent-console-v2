"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X, Filter, ArrowRight, ArrowLeft, Clock, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { enumApiService, getAllEnumCategories, getEnumCategoryLabel, getSeverityColor } from "@/lib/enum-api"
import { getAuthParamsOrDefaults } from "@/lib/auth-utils"
import { useToast } from "@/hooks/use-toast"

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
  const [customIssueDescription, setCustomIssueDescription] = React.useState("")
  const [customIssueCategory, setCustomIssueCategory] = React.useState("communication_call_quality")
  const [customIssueSeverity, setCustomIssueSeverity] = React.useState<"low" | "medium" | "high">("medium")
  const [isCreatingCustomIssue, setIsCreatingCustomIssue] = React.useState(false)
  
  // Reference to the search input for auto-focusing
  const searchInputRef = React.useRef<HTMLInputElement>(null)
  
  // Toast hook for notifications
  const { toast } = useToast()

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
      
      // Store original existing issues for comparison but don't show them in selected issues
      // They are already visible in the "Previous Issues" tab
      const originalIssues = activeExistingIssues.map(issue => ({
        id: issue.issueId, // Use issueId to match with issue-master _id
        severity: issue.severity,
        originalId: issue._id // Store the original _id for deletion
      }))
      
      setOriginalExistingIssues(originalIssues)
    } else {
      // No existing issues at this timestamp
      setOriginalExistingIssues([])
    }
    
    // Always start with empty selected issues - existing issues are shown in Previous Issues tab
    setSelectedIssues([])
    setInitializedExistingIssues(true)
  }, [existingIssuesAtTimestamp])

  // Reset initialization flag when timestamp changes (new issue marking session)
  React.useEffect(() => {
    setInitializedExistingIssues(false)
    // Don't clear originalExistingIssues here - let the initialization effect handle it
  }, [timestamp])

  // Filter issues based on search query and category, excluding already marked issues
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

    // Exclude issues that are already marked at this timestamp
    if (existingIssuesAtTimestamp && existingIssuesAtTimestamp.length > 0) {
      const existingIssueIds = existingIssuesAtTimestamp
        .filter(issue => issue.isActive !== false) // Only consider active issues
        .map(issue => issue.issueId)
      
      filtered = filtered.filter(issue => !existingIssueIds.includes(issue.id))
    }

    return filtered
  }, [issueTypes, searchQuery, selectedCategory, existingIssuesAtTimestamp])

  // Get available issues (excluding already marked ones) for category filtering
  const availableIssues = React.useMemo(() => {
    let available = issueTypes

    // Exclude issues that are already marked at this timestamp
    if (existingIssuesAtTimestamp && existingIssuesAtTimestamp.length > 0) {
      const existingIssueIds = existingIssuesAtTimestamp
        .filter(issue => issue.isActive !== false) // Only consider active issues
        .map(issue => issue.issueId)
      
      available = available.filter(issue => !existingIssueIds.includes(issue.id))
    }

    return available
  }, [issueTypes, existingIssuesAtTimestamp])

  // Get unique categories for filter - only from available issues
  const categories = React.useMemo(() => {
    const uniqueCategories = [...new Set(availableIssues.map(issue => issue.category))]
    return uniqueCategories.sort()
  }, [availableIssues])

  // Note: Auto-focus removed as per user request

  // Keyboard event handler for issue selection and severity
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {


      // Do not hijack keys while typing in inputs/textareas/selects or contenteditable
      const target = e.target as HTMLElement | null
      const tag = target?.tagName?.toLowerCase()
      const isTypingContext = tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable

      // N key to trigger new issue - only when not typing
      if ((e.key === 'n' || e.key === 'N') && !isTypingContext) {
        e.preventDefault()
        if (onNewIssue) {
          onNewIssue()
        }
        return
      }

      // Severity selection using left/right arrow keys to cycle through levels - PRIORITY: Handle FIRST when there are selected issues
      if (selectedIssues.length > 0 && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault()
        const issue = selectedIssues[0] // Only one issue since we enforce single selection
        if (issue) {
          const severityOrder = ['low', 'medium', 'high']
          const currentIndex = severityOrder.indexOf(issue.severity)
          
          let newIndex
          if (e.key === 'ArrowLeft') {
            // Move left: high -> medium -> low -> high (cycle)
            newIndex = currentIndex === 0 ? severityOrder.length - 1 : currentIndex - 1
          } else {
            // Move right: low -> medium -> high -> low (cycle)
            newIndex = currentIndex === severityOrder.length - 1 ? 0 : currentIndex + 1
          }
          
          const newSeverity = severityOrder[newIndex]
          updateIssueSeverity(issue.id, newSeverity)
        }
        return
      }

      // Number keys for issue selection (1-9) - works globally when not typing
      // Number keys for issue selection (1-9) - works everywhere except when typing
      // BUT NOT when Ctrl is pressed (that's for issues 10-18)
      if (!isTypingContext && !e.ctrlKey && /^[1-9]$/.test(e.key)) {
        e.preventDefault()
        const index = parseInt(e.key) - 1
        if (index < filteredIssues.length) {
          const issue = filteredIssues[index]
          const isSelected = selectedIssues.some(selected => selected.id === issue.id)
          
          if (!isSelected) {
            // Use addIssue which handles single selection logic and toast
            addIssue(issue)
            setTimeout(() => {
              setSelectedIssueIndex(0) // Always the first (and only) item
              // Scroll to the selected issues section within the Mark Issue panel only
              const selectedSection = document.querySelector('[data-selected-issues-form]')
              const markIssueContainer = document.querySelector('.flex-1.overflow-y-auto.min-h-0')
              
              if (selectedSection && markIssueContainer) {
                // Calculate position relative to the container
                const containerRect = markIssueContainer.getBoundingClientRect()
                const sectionRect = selectedSection.getBoundingClientRect()
                const relativeTop = sectionRect.top - containerRect.top
                
                // Scroll within the container only
                markIssueContainer.scrollTo({
                  top: markIssueContainer.scrollTop + relativeTop - (containerRect.height / 2) + (sectionRect.height / 2),
                  behavior: 'smooth'
                })
              }
            }, 100)
          } else {
            // Remove the issue if already selected
            removeIssue(issue.id)
          }
        }
        return
      }

      // Ctrl + Number keys for issue selection (10-18) - Ctrl+1 to Ctrl+9
      if (!isTypingContext && e.ctrlKey && /^[1-9]$/.test(e.key)) {
        e.preventDefault()
        const index = parseInt(e.key) - 1 + 9 // Add 9 to get indices 9-17 (issues 10-18)
        if (index < filteredIssues.length) {
          const issue = filteredIssues[index]
          const isSelected = selectedIssues.some(selected => selected.id === issue.id)
          
          if (!isSelected) {
            // Use addIssue which handles single selection logic and toast
            addIssue(issue)
            setTimeout(() => {
              setSelectedIssueIndex(0) // Always the first (and only) item
              // Scroll to the selected issues section within the Mark Issue panel only
              const selectedSection = document.querySelector('[data-selected-issues-form]')
              const markIssueContainer = document.querySelector('.flex-1.overflow-y-auto.min-h-0')
              
              if (selectedSection && markIssueContainer) {
                // Calculate position relative to the container
                const containerRect = markIssueContainer.getBoundingClientRect()
                const sectionRect = selectedSection.getBoundingClientRect()
                const relativeTop = sectionRect.top - containerRect.top
                
                // Scroll within the container only
                markIssueContainer.scrollTo({
                  top: markIssueContainer.scrollTop + relativeTop - (containerRect.height / 2) + (sectionRect.height / 2),
                  behavior: 'smooth'
                })
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

    document.addEventListener('keydown', handleKeyDown, true) // Use capture phase
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
    }
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
    // Check if there's already a selected issue
    if (selectedIssues.length > 0) {
      toast({
        title: "Single Issue Selection",
        description: "Only one issue can be marked at a time. Please deselect the current issue first.",
        variant: "default",
      })
      return
    }

    const newSelectedIssue: SelectedIssue = {
      id: issue.id,
      text: issue.text,
      category: issue.category,
      severity: issue.severity // Use the issue's default severity from API
    }
    setSelectedIssues([newSelectedIssue]) // Replace array instead of adding to it
  }, [selectedIssues.length, toast])

  const removeIssue = React.useCallback((issueId: string) => {
    setSelectedIssues(prev => prev.filter(issue => issue.id !== issueId))
  }, [])

  const updateIssueSeverity = React.useCallback((issueId: string, severity: string) => {
    setSelectedIssues(prev => prev.map(issue => 
      issue.id === issueId ? { ...issue, severity } : issue
    ))
  }, [])

  const addCustomIssue = async () => {
    if (!customIssueText.trim() || !customIssueDescription.trim()) return
    
    // Check if there's already a selected issue
    if (selectedIssues.length > 0) {
      toast({
        title: "Single Issue Selection",
        description: "Only one issue can be marked at a time. Please deselect the current issue first.",
        variant: "default",
      })
      return
    }
    
    try {
      setIsCreatingCustomIssue(true)
      
      // Create the issue using the API
      const createRequest = {
        code: customIssueCategory as any, // Cast to EnumCategoryCode
        title: customIssueText.trim(),
        description: customIssueDescription.trim(),
        defaultSeverity: customIssueSeverity,
        isActive: true
      }
      
      const createdIssue = await enumApiService.createIssueMaster(createRequest)
      
      // Add the created issue to selected issues
      const newSelectedIssue: SelectedIssue = {
        id: createdIssue._id,
        text: createdIssue.title,
        category: getEnumCategoryLabel(createdIssue.code as any),
        severity: createdIssue.defaultSeverity
      }
      
      setSelectedIssues([newSelectedIssue]) // Replace array instead of adding to it
      
      // Reset custom issue form
      setCustomIssueText("")
      setCustomIssueDescription("")
      setCustomIssueCategory("communication_call_quality")
      setCustomIssueSeverity("medium")
      setShowCustomIssueForm(false)
      
      // Reload the issue types to include the new issue
      const response = await enumApiService.getIssueMasters({ isActive: true })
      const transformedIssues: IssueType[] = response.data
        .filter(issue => issue.isActive === true)
        .map(issue => ({
          id: issue._id,
          text: issue.title,
          category: getEnumCategoryLabel(issue.code as any),
          severity: issue.defaultSeverity,
          code: issue.code
        }))
      setIssueTypes(transformedIssues)
      
    } catch (error) {
      console.error('Failed to create custom issue:', error)
      setError('Failed to create custom issue. Please try again.')
    } finally {
      setIsCreatingCustomIssue(false)
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
    
    // Since existing issues are not shown in Selected Issues section anymore,
    // we should never delete them when marking new issues. Only send empty deleteIssues array.
    const deleteIssues: string[] = []
    
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
            {Math.floor(timestamp / 60)}:{Math.floor(timestamp % 60).toString().padStart(2, '0')}
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
              All ({availableIssues.length})
            </button>
            {categories.map((category) => {
              const count = availableIssues.filter(issue => issue.category === category).length
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

        {/* Issues Grid - Hide when custom issue form is open */}
        {!showCustomIssueForm && (
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
            const shortcutKey = index < 9 ? `${index + 1}` : index < 18 ? `Ctrl+${index - 8}` : null
            
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
        )}

        {/* Custom Issue Section - Only show when no search results or when form is open */}
        {(filteredIssues.length === 0 && searchQuery.trim() && !isLoading && !error) || showCustomIssueForm ? (
        <div className="space-y-3">
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
                    setCustomIssueDescription("")
                    setCustomIssueCategory("communication_call_quality")
                    setCustomIssueSeverity("medium")
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="custom-issue-category">Category *</Label>
                  <Select value={customIssueCategory} onValueChange={setCustomIssueCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAllEnumCategories().map(({ code, label }) => (
                        <SelectItem key={code} value={code}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="custom-issue-title">Title *</Label>
                  <Input
                    id="custom-issue-title"
                    placeholder="e.g., Missing Professional Greeting"
                    value={customIssueText}
                    onChange={(e) => setCustomIssueText(e.target.value)}
                    className="text-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="custom-issue-description">Description *</Label>
                  <Textarea
                    id="custom-issue-description"
                    placeholder="Detailed description of this quality issue..."
                    value={customIssueDescription}
                    onChange={(e) => setCustomIssueDescription(e.target.value)}
                    rows={3}
                    className="text-sm resize-none max-h-[120px] overflow-y-auto"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="custom-issue-severity">Default Severity *</Label>
                  <Select value={customIssueSeverity} onValueChange={(value: "low" | "medium" | "high") => setCustomIssueSeverity(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityColor("low") as "default" | "destructive" | "secondary" | "outline"}>LOW</Badge>
                          <span>Low</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityColor("medium") as "default" | "destructive" | "secondary" | "outline"}>MEDIUM</Badge>
                          <span>Medium</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityColor("high") as "default" | "destructive" | "secondary" | "outline"}>HIGH</Badge>
                          <span>High</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={addCustomIssue}
                    disabled={!customIssueText.trim() || !customIssueDescription.trim() || isCreatingCustomIssue}
                    size="sm"
                    className="px-4 flex-1"
                  >
                    {isCreatingCustomIssue ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        Adding...
                      </>
                    ) : (
                      'Add'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        ) : null}

      </div>

      {/* Selected Issues Management */}
      {selectedIssues.length > 0 && (
        <div className="space-y-3" data-selected-issues-form>
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Selected Issue ({selectedIssues.length})</Label>
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
                    Severity Level {selectedIssueIndex === index && '(Press ←/→ to cycle)'}
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'low', label: 'Low' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'high', label: 'High' }
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
