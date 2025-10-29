"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { AppShell } from "@/components/app-shell"
import { CallsTable, CallsTableRef } from "@/components/calls/calls-table"
import AudioPlayer, { AudioPlayerRef } from "@/components/audio/audio-player"
import { MarkIssueForm, MarkIssueFormRef } from "@/components/transcript/mark-issue-form"
import { fetchCallById } from "@/lib/api"
import { callsApiService, CallIssuesResponse, CallIssueGroup, type AssignQCRequest, filterCallsByDateRange } from "@/lib/calls-api"
import { useToast } from "@/hooks/use-toast"
import { useEnterprise } from "@/lib/enterprise-context"
import { EnterpriseTeamSelector } from "@/components/enterprise/enterprise-team-selector"
import { getCurrentUserId } from "@/lib/auth-utils"

import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CalendarIcon, X, Phone, CheckCircle, Clock, Copy } from "lucide-react"
import { format, formatDuration } from "date-fns"

export default function ReviewPage() {
  const { toast } = useToast()
  const { 
    isInitialLoading: isLoadingEnterpriseData,
    selectedEnterprise,
    selectedTeam
  } = useEnterprise()
  
  const [selectedCall, setSelectedCall] = React.useState<any>(null)
  const [detailedCall, setDetailedCall] = React.useState<any>(null)
  const [isLoadingCall, setIsLoadingCall] = React.useState(false)
  const [currentPlaybackTime, setCurrentPlaybackTime] = React.useState(0)
  const [audioDuration, setAudioDuration] = React.useState(0)
  const [isDurationLoading, setIsDurationLoading] = React.useState(true)
  const [currentCallId, setCurrentCallId] = React.useState<string | null>(null)
  const transcriptContainerRef = React.useRef<HTMLDivElement>(null)
  const audioPlayerRef = useRef<AudioPlayerRef>(null)
  const callsTableRef = useRef<CallsTableRef>(null)
  
  // Mark Issue state
  const [markIssueData, setMarkIssueData] = React.useState<{
    transcriptText: string
    timestamp: number
    transcriptIndex?: number
  } | null>(null)
  
  // Track manually selected transcript line
  const [selectedTranscriptIndex, setSelectedTranscriptIndex] = React.useState<number | null>(null)
  
  // Track user scroll intent to pause auto-scrolling
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const [lastUserScrollTime, setLastUserScrollTime] = useState(0)
  const [autoScrollPaused, setAutoScrollPaused] = useState(false)
  const [lastAutoScrollTime, setLastAutoScrollTime] = useState(0)
  
  // Track marked issues by transcript index
  const [markedIssues, setMarkedIssues] = useState<Set<number>>(new Set())
  
  // Store detailed issue data for each call (mock data for new issues)
  const [callIssues, setCallIssues] = useState<Map<string, Array<{ 
    issues: Array<{ type: string; severity: string }>; 
    description: string; 
    timestamp: number; 
    transcriptText: string;
    transcriptIndex?: number;
  }>>>(new Map())
  
  // API call issues data
  const [apiCallIssues, setApiCallIssues] = useState<CallIssueGroup[]>([])
  const [isLoadingIssues, setIsLoadingIssues] = useState(false)
  const [issuesError, setIssuesError] = useState<string | null>(null)
  
  // Status filter state
  const [statusFilter, setStatusFilter] = useState<'pending' | 'completed' | 'all'>('pending')
  
  // Issues panel toggle state
  const [showIssuesPanel, setShowIssuesPanel] = useState(false)
  
  // Date filter state
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  
  // Agent filter state
  const [selectedAgentName, setSelectedAgentName] = useState<string>('all')
  const [selectedAgentType, setSelectedAgentType] = useState<string>('all')
  const [uniqueAgentNames, setUniqueAgentNames] = useState<string[]>([])
  
  // Call type filter state
  const [selectedCallType, setSelectedCallType] = useState<string>('all')
  
  // Load agent names whenever calls are loaded
  useEffect(() => {
    if (callsTableRef.current) {
      const names = callsTableRef.current.getUniqueAgentNames()
      setUniqueAgentNames(names)
    }
  }, [selectedEnterprise, selectedTeam, startDate, endDate, statusFilter])
  
  // Stats state
  const [callStats, setCallStats] = useState({
    total: 0,
    reviewed: 0,
    unreviewed: 0,
    isLoading: true
  })
  
  // Clear selection when switching to completed calls
  React.useEffect(() => {
    if (statusFilter === 'completed') {
      // Only clear if we're actually changing the filter
      // This prevents unnecessary clearing that could trigger auto-selection
      if (selectedCall && selectedCall.qcStatus !== 'done' && selectedCall.qcStatus !== 'completed') {
      setSelectedCall(null)
      setDetailedCall(null)
      setMarkIssueData(null) // Clear any open mark issue panel
      }
    }
  }, [statusFilter])

  // Auto-switch to Previous Issues tab for completed calls and load issues
  React.useEffect(() => {
    if (selectedCall) {
      // Close mark issue panel if call is completed
      if (selectedCall.qcStatus === 'done' || selectedCall.qcStatus === 'completed') {
        setMarkIssueData(null)
      }
      
      // Always load issues when a call is selected
      loadCallIssues(selectedCall.id)
      
      // Auto-switch to Previous Issues tab for completed calls
      if (selectedCall.qcStatus === 'done' || selectedCall.qcStatus === 'completed') {
        setActiveTab('previous-issues')
        setShowIssuesPanel(true) // Auto-show issues panel for completed calls
      }
    } else {
      // Clear issues when no call is selected
      setApiCallIssues([])
    }
  }, [selectedCall])
  
  // Form state for sticky actions
  const [isFormValid, setIsFormValid] = useState(false)
  const [totalChanges, setTotalChanges] = useState(0)
  const formRef = React.useRef<MarkIssueFormRef>(null)
  const [lastIssueNote, setLastIssueNote] = useState<{ timestamp: number; note: string } | null>(null)
  
  // Call classification dialog state
  const [showClassificationDialog, setShowClassificationDialog] = useState(false)
  const [selectedClassification, setSelectedClassification] = useState<string>('')
  
  // Note editing state
  const [editingNote, setEditingNote] = useState<string | null>(null) // Store the issue _id being edited
  const [editNoteText, setEditNoteText] = useState('')

  // Memoized form change handler to prevent unnecessary re-renders
  const handleFormChange = useCallback((isValid: boolean, changes: number) => {
    setIsFormValid(isValid)
    setTotalChanges(changes)
  }, [])

  // Memoized existing issues calculation to prevent unnecessary re-renders
  const existingIssuesAtTimestamp = useMemo(() => {
    if (!markIssueData) return []
    return apiCallIssues.find(group => 
      Math.abs(group.secondsFromStart - markIssueData.timestamp) < 1
    )?.issues || []
  }, [apiCallIssues, markIssueData?.timestamp])

  // Memoized callback for new issue tab switch
  const handleNewIssue = useCallback(() => {
    setActiveTab('new-issue')
  }, [])
  
  // Tab state for Mark Issue panel
  const [activeTab, setActiveTab] = useState<string>("new-issue")

  // Helper function to format customer name in proper case
  const formatCustomerName = (name: string) => {
    if (!name) return 'Customer'
    return name.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')
  }

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

  // Function to scroll to current transcript line
  const scrollToCurrentTranscriptLine = (currentTime: number) => {
    if (!transcriptContainerRef.current || !detailedCall?.callDetails?.messages) return

    const messages = detailedCall.callDetails.messages
    // Use exact current time for perfect sync accuracy
    const adjustedTime = currentTime

    // Find the CURRENT message that's actively being spoken
    let currentMessageIndex = -1
    
    // Loop through messages to find the one that should be active
    for (let i = 0; i < messages.length; i++) {
      const messageStart = messages[i]?.secondsFromStart
      const nextMessageStart = messages[i + 1]?.secondsFromStart
      
      if (typeof messageStart === 'number' && messageStart <= adjustedTime) {
        // Check if this is the current message by seeing if the next one starts after current time
        if (typeof nextMessageStart !== 'number' || nextMessageStart > adjustedTime) {
          currentMessageIndex = i
          break
        }
      }
    }

    if (currentMessageIndex !== -1) {
      // Only auto-scroll if:
      // 1. User isn't manually scrolling
      // 2. Auto-scroll hasn't been paused
      // 3. Enough time has passed since last user scroll (2 seconds)
      // 4. Enough time has passed since last auto-scroll (1 second)
      const timeSinceLastScroll = Date.now() - lastUserScrollTime
      const timeSinceLastAutoScroll = Date.now() - lastAutoScrollTime
      const shouldAutoScroll = !isUserScrolling && !autoScrollPaused && timeSinceLastScroll > 2000 && timeSinceLastAutoScroll > 1000
      
      if (shouldAutoScroll) {
        const messageElements = transcriptContainerRef.current.children
        if (messageElements[currentMessageIndex]) {
          const currentElement = messageElements[currentMessageIndex] as HTMLElement
          const container = transcriptContainerRef.current
          
          // Check if the current element is already visible in the viewport
          const elementRect = currentElement.getBoundingClientRect()
          const containerRect = container.getBoundingClientRect()
          
          // Only scroll if the element is not visible or is at the bottom
          const isElementVisible = elementRect.top >= containerRect.top && elementRect.bottom <= containerRect.bottom
          const isElementBelowViewport = elementRect.top > containerRect.bottom
          
          if (!isElementVisible || isElementBelowViewport) {
            // Calculate the position to scroll to within the container
            const containerScrollTop = container.scrollTop
            const containerOffsetTop = containerRect.top
            const elementOffsetTop = elementRect.top - containerOffsetTop + containerScrollTop
            const containerHeight = containerRect.height
            const elementHeight = elementRect.height
            
            // Center the element in the container
            const targetScrollTop = elementOffsetTop - (containerHeight / 2) + (elementHeight / 2)
            
            // Scroll within the container only, not the entire page
            container.scrollTo({
              top: Math.max(0, targetScrollTop),
              behavior: 'instant'
            })
            
            // Update last auto-scroll time
            setLastAutoScrollTime(Date.now())
          }
        }
      } else if (isUserScrolling || autoScrollPaused) {
        // Auto-scroll is paused due to user activity
      }
    }
  }

  // Function to seek audio to a specific time
  const seekToTime = (seconds: number) => {
    // Try direct ref approach first
    if (audioPlayerRef.current) {
      audioPlayerRef.current.seek(seconds)
    } else {
      // Fallback to event approach
      window.dispatchEvent(new CustomEvent('seekAudioToTime', { 
        detail: { time: seconds } 
      }))
    }
    
    // Update the current playback time
    setCurrentPlaybackTime(seconds)
    
    // Ensure audio plays after seek
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('ensureAudioPlaying'))
    }, 100)
  }

  // Mark Issue handlers
  const handleMarkIssue = (transcriptText: string, timestamp: number, transcriptIndex?: number) => {
    try {
      // Check if call is assigned and if current user is authorized
      if (selectedCall?.qcAssignedTo) {
        const currentUserId = getCurrentUserId()
        // The qcAssignedTo object might have userId instead of id
        const assignedUserId = selectedCall.qcAssignedTo.userId || selectedCall.qcAssignedTo.id
        
        if (currentUserId && assignedUserId && assignedUserId !== currentUserId) {
          toast({
            title: "Unauthorized Action",
            description: `This call is assigned to ${selectedCall.qcAssignedTo.name}. Only the assigned QC reviewer can mark issues.`,
            variant: "destructive",
          })
          return
        }
      }
      
      // Allow marking issues on all calls, including completed ones
      setMarkIssueData({ transcriptText, timestamp, transcriptIndex })
      
      // Reset to new issue tab when opening
      setActiveTab('new-issue')
    } catch (error) {
      console.error('Error in handleMarkIssue:', error)
    }
  }

  const handleIssueSubmit = async (issue: { 
    addIssues: Array<{ issueId: string; severity: 'low' | 'medium' | 'high'; note?: string }>;
    updateIssues: Array<{ id: string; severity: 'low' | 'medium' | 'high'; note?: string }>;
    deleteIssues: string[];
  }) => {
    if (!selectedCall?.id || !markIssueData) return
    
    try {
      // Call the POST API to mark issues
      const markIssueRequest = {
        callId: selectedCall.id,
        secondsFromStart: Math.floor(markIssueData.timestamp || 0),
        transcript: markIssueData.transcriptText,
        addIssues: issue.addIssues,
        updateIssues: issue.updateIssues,
        deleteIssues: issue.deleteIssues
      }
      

      
      // Store note locally for immediate display even if backend doesn't persist it
      // Note is now part of each addIssue item
      const firstIssueWithNote = issue.addIssues.find(item => item.note)
      if (firstIssueWithNote?.note) {
        setLastIssueNote({ timestamp: markIssueData.timestamp, note: firstIssueWithNote.note })
      }

      let response
      try {
        response = await callsApiService.markCallIssues(markIssueRequest)
      } catch (err: any) {
        const message = (err && (err.message || err.toString())) as string
        const notAuthorized = message?.toLowerCase().includes('not authorized') || message?.toLowerCase().includes('assign') || message?.toLowerCase().includes('qcassigned')
        if (notAuthorized) {
          // Try to auto-assign QC to current user and retry once
          try {
            await callsApiService.assignQC({ callId: selectedCall.id, qcStatus: 'in_progress' })
            response = await callsApiService.markCallIssues(markIssueRequest)
          } catch (retryErr) {
            throw retryErr
          }
        } else {
          throw err
        }
      }
      

      
      // Check if we have a successful response (200 status means success)
      const isSuccess = response.success !== false
      
      if (isSuccess) {

        
        // Show success toast
        const totalChanges = issue.addIssues.length + issue.updateIssues.length + issue.deleteIssues.length
        let description = ""
        
        const actions = []
        if (issue.addIssues.length > 0) {
          actions.push(`${issue.addIssues.length} added`)
        }
        if (issue.updateIssues.length > 0) {
          actions.push(`${issue.updateIssues.length} updated`)
        }
        if (issue.deleteIssues.length > 0) {
          actions.push(`${issue.deleteIssues.length} removed`)
        }
        
        if (actions.length > 0) {
          const seconds = Math.max(0, Math.floor(markIssueData.timestamp))
          const mins = Math.floor(seconds / 60)
          const secs = Math.floor(seconds % 60)
          description = `${actions.join(', ')} at ${mins}:${secs.toString().padStart(2, '0')}`
        } else {
          const seconds = Math.max(0, Math.floor(markIssueData.timestamp))
          const mins = Math.floor(seconds / 60)
          const secs = Math.floor(seconds % 60)
          description = `Issues updated at ${mins}:${secs.toString().padStart(2, '0')}`
        }
        
        const isCompletedCall = selectedCall.qcStatus === 'done' || selectedCall.qcStatus === 'completed'
        
        toast({
          title: isCompletedCall ? "Additional Issues Added" : "Issues Marked Successfully",
          description: isCompletedCall 
            ? `Additional issues added to completed review: ${description}`
            : description,
          variant: "default",
        })
        
        // Reload call issues to get the updated data
        await loadCallIssues(selectedCall.id)
        
        // For completed calls, switch to existing issues tab to show the updated list
        if (isCompletedCall && issue.addIssues.length > 0) {
          setTimeout(() => {
            setActiveTab('previous-issues')
          }, 500)
        }
        
        // Mark the transcript card as having an issue if we added any issues
        if (issue.addIssues.length > 0 && markIssueData?.transcriptIndex !== undefined) {
          setMarkedIssues(prev => new Set([...prev, markIssueData.transcriptIndex!]))
        }
        
        // Update the issue count in the transcript data
        if (markIssueData?.transcriptIndex !== undefined && detailedCall?.callDetails?.messages) {
          const transcriptIndex = markIssueData.transcriptIndex
          const netChange = issue.addIssues.length - issue.deleteIssues.length
          
          setDetailedCall((prev: any) => {
            if (!prev?.callDetails?.messages) return prev
            
            const updatedMessages = [...prev.callDetails.messages]
            if (updatedMessages[transcriptIndex]) {
              updatedMessages[transcriptIndex] = {
                ...updatedMessages[transcriptIndex],
                issueCount: Math.max(0, (updatedMessages[transcriptIndex].issueCount || 0) + netChange)
              }
            }
            
            return {
              ...prev,
              callDetails: {
                ...prev.callDetails,
                messages: updatedMessages
              }
            }
          })
        }
        
        // Switch to Previous Issues tab instead of closing the panel
        setActiveTab('previous-issues')
      } else {
        const errorMessage = (response as any).message || "Failed to mark issues. Please try again."
        console.error('Failed to mark issues:', errorMessage)
        toast({
          title: "Error Marking Issues",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error marking issues:', error)
      toast({
        title: "Error Marking Issues",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAssignQC = async () => {
    if (!selectedCall?.id) return
    
    try {
      const assignRequest: AssignQCRequest = {
        callId: selectedCall.id,
        qcStatus: 'in_progress'
      }
      
      const response = await callsApiService.assignQC(assignRequest)
      
      // Check if we have a valid response with message and updatedFields
      if (response.message && response.updatedFields) {
        // Store current user ID for authorization checks
        if (response.updatedFields.qcAssignedTo?.id) {
          localStorage.setItem('qa_dashboard_user_id', response.updatedFields.qcAssignedTo.id)
        }
        
        // Update the selectedCall to reflect the new assignment
        setSelectedCall((prev: any) => ({
          ...prev,
          qcAssignedTo: response.updatedFields.qcAssignedTo,
          qcStatus: response.updatedFields.qcStatus
        }))
        
        // Update the calls list to reflect the status change
        callsTableRef.current?.updateCallStatus(
          selectedCall.id,
          response.updatedFields.qcStatus,
          response.updatedFields.qcAssignedTo
        )
        
        toast({
          title: "QC Assigned Successfully",
          description: response.message,
          variant: "default",
        })
      } else {
        toast({
          title: "Error Assigning QC",
          description: "Failed to assign QC. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error assigning QC:', error)
      toast({
        title: "Error Assigning QC",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleQCDone = async () => {
    if (!selectedCall?.id) return
    
    // Check if call is assigned and if current user is authorized
    if (selectedCall?.qcAssignedTo) {
      const currentUserId = getCurrentUserId()
      // The qcAssignedTo object might have userId instead of id
      const assignedUserId = selectedCall.qcAssignedTo.userId || selectedCall.qcAssignedTo.id
      
      if (currentUserId && assignedUserId && assignedUserId !== currentUserId) {
        toast({
          title: "Unauthorized Action",
          description: `This call is assigned to ${selectedCall.qcAssignedTo.name}. Only the assigned QC reviewer can mark the call as done.`,
          variant: "destructive",
        })
        return
      }
    }
    
    // Show classification dialog instead of directly marking as done
    setShowClassificationDialog(true)
  }
  
  const handleClassificationSubmit = async () => {
    if (!selectedCall?.id || !selectedClassification) return
    
    try {
      const qcDoneRequest: AssignQCRequest = {
        callId: selectedCall.id,
        qcStatus: 'done',
        qcRating: selectedClassification.toLowerCase()
      }
      
      const response = await callsApiService.assignQC(qcDoneRequest)
      
      if (response.message && response.updatedFields) {
        toast({
          title: "QC Completed Successfully",
          description: `Call classified as "${selectedClassification}". ${response.message}`,
          variant: "default",
        })
        
        // Close dialog and reset
        setShowClassificationDialog(false)
        setSelectedClassification('')
        
        // Clear the current call selection since it's now completed
        setSelectedCall(null)
        setDetailedCall(null)
        
        // Refresh the calls list to remove the completed call (API will filter out done calls)
        if (callsTableRef.current) {
          await callsTableRef.current.refreshCalls()
        }
      } else {
        toast({
          title: "Error Completing QC",
          description: "Failed to complete QC. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error completing QC:', error)
      toast({
        title: "Error Completing QC",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCancelMarkIssue = () => {
    setMarkIssueData(null)
  }

  const handleDeleteIssue = (issueIndex: number) => {
    if (selectedCall?.id) {
      setCallIssues(prev => {
        const newMap = new Map(prev)
        const existingIssues = newMap.get(selectedCall.id) || []
        const updatedIssues = existingIssues.filter((_, index) => index !== issueIndex)
        
        if (updatedIssues.length === 0) {
          newMap.delete(selectedCall.id)
        } else {
          newMap.set(selectedCall.id, updatedIssues)
        }
        
        return newMap
      })
      
      // Update marked issues set if needed
      const issueToDelete = callIssues.get(selectedCall.id)?.[issueIndex]
      if (issueToDelete?.transcriptIndex !== undefined) {
        // Check if there are other issues for this transcript index
        const remainingIssues = callIssues.get(selectedCall.id)?.filter((_, index) => index !== issueIndex)
        const hasOtherIssuesForTranscript = remainingIssues?.some(issue => issue.transcriptIndex === issueToDelete.transcriptIndex)
        
        if (!hasOtherIssuesForTranscript) {
          setMarkedIssues(prev => {
            const newSet = new Set(prev)
            newSet.delete(issueToDelete.transcriptIndex!)
            return newSet
          })
        }
      }
    }
  }



  

  // Function to load call issues from API with fallback to mock data
  const loadCallIssues = async (callId: string) => {
    try {
      setIsLoadingIssues(true)
      setIssuesError(null)
      
      // Fetch ONLY real issues that were marked for this call
      const issuesResponse = await callsApiService.getCallIssues(callId)
      
      if (issuesResponse && issuesResponse.data) {
        setApiCallIssues(issuesResponse.data)
      } else {
        setApiCallIssues([])
      }
      
    } catch (error) {
      console.error('Error fetching call issues:', error)
      setIssuesError('Failed to load call issues')
      setApiCallIssues([])
    } finally {
      setIsLoadingIssues(false)
    }
  }

  // Function to calculate stats from calls table data
  const loadCallStats = useCallback(async () => {
    if (!selectedEnterprise || !selectedTeam) {
      setCallStats({ total: 0, reviewed: 0, unreviewed: 0, isLoading: false })
      return
    }

    try {
      setCallStats(prev => ({ ...prev, isLoading: true }))
      
      // Get calls from the CallsTable component
      if (callsTableRef.current) {
        const calls = callsTableRef.current.getCalls()
        
        // Calculate statistics from loaded calls
        const total = calls.length
        const reviewed = calls.filter((call: any) => 
          call.qcStatus === 'done' || call.qcStatus === 'completed'
        ).length
        const unreviewed = total - reviewed

        setCallStats({
          total,
          reviewed,
          unreviewed,
          isLoading: false
        })
      } else {
        // If no calls table ref, set to zero
        setCallStats({ total: 0, reviewed: 0, unreviewed: 0, isLoading: false })
      }
    } catch (error) {
      console.error('Error loading call stats:', error)
      setCallStats({ total: 0, reviewed: 0, unreviewed: 0, isLoading: false })
    }
  }, [selectedEnterprise, selectedTeam])

  // Clear selected call when enterprise or team changes
  useEffect(() => {
    setSelectedCall(null)
    setDetailedCall(null)
    setCurrentPlaybackTime(0)
    setSelectedTranscriptIndex(null)
    setMarkIssueData(null)
    setApiCallIssues([]) // Also clear API call issues
    setCallIssues(new Map()) // Clear call issues map
  }, [selectedEnterprise?.id, selectedEnterprise?.enterpriseId, selectedTeam?.team_id])

  // Fetch detailed call data when a call is selected
  useEffect(() => {
    // First, always pause any playing audio when selection changes
    window.dispatchEvent(new CustomEvent('pauseAudio'))
    
    if (selectedCall?.id) {
      const callId = selectedCall.id // Capture current call ID in closure
      setIsLoadingCall(true)
      
      // Clear the old detailed call data immediately to prevent showing stale data
      setDetailedCall(null)
      // Reset duration for new call
      setAudioDuration(0)
      setIsDurationLoading(true)
      setCurrentCallId(callId)
      
      // Reset marked issues for the new call
      const existingIssues = callIssues.get(selectedCall.id) || []
      const markedIndices = new Set(existingIssues.map(issue => issue.transcriptIndex).filter(index => index !== undefined))
      setMarkedIssues(markedIndices as Set<number>)
      
      // Load call details and issues in parallel
      Promise.all([
        fetchCallById(selectedCall.id),
        loadCallIssues(selectedCall.id)
      ])
        .then(([callData]) => {
          if (callData) {
            setDetailedCall(callData)
            
            // Calculate audio duration from metadata
            if (callData.callDetails?.recordingUrl) {
              const audio = new Audio(callData.callDetails.recordingUrl)
              
              audio.addEventListener('loadedmetadata', () => {
                // Only update duration if this is still the selected call
                setCurrentCallId(prevCallId => {
                  if (prevCallId === callId) {
                    if (isFinite(audio.duration) && audio.duration > 0) {
                      setAudioDuration(audio.duration)
                      setIsDurationLoading(false)
                    }
                  }
                  return prevCallId
                })
              })
              
              audio.addEventListener('error', () => {
                // Only update if this is still the selected call
                setCurrentCallId(prevCallId => {
                  if (prevCallId === callId) {
                    setIsDurationLoading(false)
                  }
                  return prevCallId
                })
              })
            } else {
              // No recording URL, stop loading
              setIsDurationLoading(false)
            }
          } else {
            // API returned null - call details not found
            console.warn('Call details not found for ID:', callId)
            setIsDurationLoading(false)
            
            // Show a toast to inform the user
            toast({
              title: "Unable to load call details",
              description: "The transcript for this call could not be loaded. Please try selecting another call.",
              variant: "destructive"
            })
            
            // Keep the selectedCall to prevent auto-selection of first call
            // but clear detailedCall to show "No transcript available" message
            setDetailedCall(null)
          }
        })
        .catch((error) => {
          console.error('Error fetching call details:', error)
          setIsDurationLoading(false)
          
          // Show user-friendly error message
          toast({
            title: "Error loading call",
            description: "Failed to load call details. Please try again.",
            variant: "destructive"
          })
          
          // Keep selectedCall but clear detailedCall
          setDetailedCall(null)
        })
        .finally(() => {
          setIsLoadingCall(false)
        })
    } else {
      // Clear everything when no call is selected
      setDetailedCall(null)
      setAudioDuration(0)
      setIsDurationLoading(false)
      setCurrentCallId(null)
    }
  }, [selectedCall?.id, callIssues])


  // Add scroll event listeners to detect user scroll intent
  useEffect(() => {
    const transcriptContainer = transcriptContainerRef.current
    if (!transcriptContainer) return

    let scrollTimeout: NodeJS.Timeout
    let scrollEndTimeout: NodeJS.Timeout

    const handleScroll = () => {
      const now = Date.now()
      setLastUserScrollTime(now)
      setIsUserScrolling(true)
      setAutoScrollPaused(true)
      
      // Clear previous timeouts
      clearTimeout(scrollTimeout)
      clearTimeout(scrollEndTimeout)
      
      // Reset user scrolling after 1 second of no scroll activity
      scrollTimeout = setTimeout(() => {
        setIsUserScrolling(false)
      }, 1000)
      
      // Resume auto-scroll after 3 seconds of no scroll activity
      scrollEndTimeout = setTimeout(() => {
        setAutoScrollPaused(false)
      }, 3000)
    }

    const handleWheel = () => {
      // Wheel events indicate user intent to scroll
      const now = Date.now()
      setLastUserScrollTime(now)
      setIsUserScrolling(true)
      setAutoScrollPaused(true)
      
      // Clear previous timeouts
      clearTimeout(scrollTimeout)
      clearTimeout(scrollEndTimeout)
      
      // Reset user scrolling after 1 second of no scroll activity
      scrollTimeout = setTimeout(() => {
        setIsUserScrolling(false)
      }, 1000)
      
      // Resume auto-scroll after 3 seconds of no scroll activity
      scrollEndTimeout = setTimeout(() => {
        setAutoScrollPaused(false)
      }, 3000)
    }

    const handleTouchStart = () => {
      // Touch events indicate user intent to scroll
      const now = Date.now()
      setLastUserScrollTime(now)
      setIsUserScrolling(true)
      setAutoScrollPaused(true)
      
      // Clear previous timeouts
      clearTimeout(scrollTimeout)
      clearTimeout(scrollEndTimeout)
      
      // Reset user scrolling after 1 second of no scroll activity
      scrollTimeout = setTimeout(() => {
        setIsUserScrolling(false)
      }, 1000)
      
      // Resume auto-scroll after 3 seconds of no scroll activity
      scrollEndTimeout = setTimeout(() => {
        setAutoScrollPaused(false)
      }, 3000)
    }

    transcriptContainer.addEventListener('scroll', handleScroll)
    transcriptContainer.addEventListener('wheel', handleWheel)
    transcriptContainer.addEventListener('touchstart', handleTouchStart)
    
    return () => {
      transcriptContainer.removeEventListener('scroll', handleScroll)
      transcriptContainer.removeEventListener('wheel', handleWheel)
      transcriptContainer.removeEventListener('touchstart', handleTouchStart)
      clearTimeout(scrollTimeout)
      clearTimeout(scrollEndTimeout)
    }
  }, [detailedCall])

  // Removed all keyboard shortcuts as requested

  // Show shimmer for entire page if enterprise data is loading
  if (isLoadingEnterpriseData) {
    return (
      <AppShell>
        <div className="flex h-full bg-background">
          {/* Left Panel - Shimmer */}
          <div className="w-96 flex flex-col border-r border-border bg-card">
            {/* Enterprise/Team Selector Shimmer */}
            <div className="px-6 py-4 border-b border-border bg-muted/20 flex-shrink-0">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-muted rounded animate-pulse" />
                  <div className="w-20 h-5 bg-muted rounded animate-pulse" />
                  <div className="w-48 h-9 bg-muted rounded animate-pulse" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-muted rounded animate-pulse" />
                  <div className="w-20 h-5 bg-muted rounded animate-pulse" />
                  <div className="w-48 h-9 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </div>
            
            {/* Header Shimmer */}
            <div className="px-6 py-5 border-b border-border bg-muted/20 flex-shrink-0">
              <div className="w-32 h-6 bg-muted rounded animate-pulse mb-1" />
              <div className="w-48 h-4 bg-muted rounded animate-pulse" />
            </div>
            
            {/* Call List Shimmer */}
            <div className="flex-1 min-h-0 overflow-y-scroll scrollbar-hidden">
              <div className="space-y-2 p-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="p-4 border rounded-lg animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-muted rounded-full" />
                      <div className="flex-1">
                        <div className="w-24 h-4 bg-muted rounded mb-1" />
                        <div className="w-32 h-3 bg-muted rounded" />
                      </div>
                      <div className="w-16 h-5 bg-muted rounded" />
                    </div>
                    <div className="flex gap-2">
                      <div className="w-20 h-3 bg-muted rounded" />
                      <div className="w-16 h-3 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Panel Shimmer */}
          <div className="flex-1 transition-all duration-300">
            <div className="h-full flex flex-col">
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse" />
                  <div className="w-32 h-6 bg-muted rounded mx-auto mb-2 animate-pulse" />
                  <div className="w-48 h-4 bg-muted rounded mx-auto animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell 
      statsChips={
        <div className="flex items-center gap-3 flex-nowrap">
          {/* Total Calls Chip */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-sm whitespace-nowrap">
            <Phone className="h-3 w-3 text-blue-600 flex-shrink-0" />
            <span className="font-medium text-blue-900">
              Total: {callStats.isLoading ? (
                <span className="inline-block w-6 h-3 bg-blue-200 animate-pulse rounded" />
              ) : (
                callStats.total.toLocaleString()
              )}
            </span>
          </div>

          {/* Reviewed Calls Chip */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-sm whitespace-nowrap">
            <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
            <span className="font-medium text-green-900">
              Reviewed: {callStats.isLoading ? (
                <span className="inline-block w-6 h-3 bg-green-200 animate-pulse rounded" />
              ) : (
                callStats.reviewed.toLocaleString()
              )}
            </span>
          </div>

          {/* Pending Review Chip */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-full text-sm whitespace-nowrap">
            <Clock className="h-3 w-3 text-orange-600 flex-shrink-0" />
            <span className="font-medium text-orange-900">
              Pending: {callStats.isLoading ? (
                <span className="inline-block w-6 h-3 bg-orange-200 animate-pulse rounded" />
              ) : (
                callStats.unreviewed.toLocaleString()
              )}
            </span>
          </div>
        </div>
      }
    >
      <div className="flex flex-col h-full bg-background">
        {/* Top Horizontal Filters Bar - Updated Layout */}
        <div className="flex-shrink-0 border-b border-border bg-card">
          <div className="px-6 py-4">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Enterprise/Team Selector - Now Horizontal */}
              <div className="flex-shrink-0">
                <EnterpriseTeamSelector />
              </div>
              
              {/* Date Filters */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-sm font-medium text-foreground whitespace-nowrap">From:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-36 justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "MMM dd") : "Start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        if (date) {
                          // Normalize to midnight local time to avoid timezone issues
                          const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
                          setStartDate(normalized);
                        } else {
                          setStartDate(undefined);
                        }
                      }}
                      disabled={(date) => date > new Date() || (endDate ? date > endDate : false)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-sm font-medium text-foreground whitespace-nowrap">To:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-36 justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "MMM dd") : "End date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        if (date) {
                          // Normalize to midnight local time to avoid timezone issues
                          const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
                          setEndDate(normalized);
                        } else {
                          setEndDate(undefined);
                        }
                      }}
                      disabled={(date) => date > new Date() || (startDate ? date < startDate : false)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div> 

              {/* Clear Date Filters */}
              {(startDate || endDate) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setStartDate(undefined)
                    setEndDate(undefined)
                  }}
                  className="h-8 px-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              {/* Status Filter */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-sm font-medium text-foreground whitespace-nowrap">Status:</span>
                <Select value={statusFilter} onValueChange={(value: 'pending' | 'completed' | 'all') => setStatusFilter(value)}>
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
                <Select value={selectedAgentType} onValueChange={setSelectedAgentType}>
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
                <Select value={selectedCallType} onValueChange={setSelectedCallType}>
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
                  onValueChange={setSelectedAgentName}
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
            </div>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Call List Panel */}
          <div className="w-80 lg:w-96 flex flex-col border-r border-border bg-card flex-shrink-0">
            {/* Header */}
            <div className="px-4 lg:px-6 py-4 border-b border-border bg-muted/20 flex-shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Call Reviews</h2>
                <p className="text-[13px] text-muted-foreground/80">Recent customer calls</p>
              </div>
            </div>
            
            {/* Call List - Independent scrolling */}
            <div className="flex-1 min-h-0 overflow-y-scroll scrollbar-hidden">
                          <CallsTable 
              ref={callsTableRef} 
              onCallSelect={setSelectedCall} 
              selectedCallId={selectedCall?.id || null}
              statusFilter={statusFilter}
              startDate={startDate}
              endDate={endDate}
              selectedAgentName={selectedAgentName}
              selectedAgentType={selectedAgentType}
              selectedCallType={selectedCallType}
              onAgentNamesChange={setUniqueAgentNames}
              onCallsLoaded={loadCallStats}
            />
            </div>
          </div>

        {/* Main Panel - Call Details */}
        <div className={`transition-all duration-300 flex-1 min-w-0 ${
          markIssueData ? 'overflow-hidden' : ''
        }`}>
          <div className="h-full flex flex-col">
            {selectedCall ? (
              <div className="flex-1 flex flex-col">
                {/* Call Header - Compact */}
                <div className="px-4 lg:px-6 py-4 lg:py-5 border-b border-border bg-card">
                  <div className="flex items-start gap-4">
                    {(() => {
                      const avatarColor = getAvatarColor(selectedCall.customerName)
                      return (
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${avatarColor.bg}`}>
                          <span className={`font-semibold text-lg ${avatarColor.text}`}>{selectedCall.customerInitials}</span>
                        </div>
                      )
                    })()}
                    <div className="flex-1 min-w-0">
                      <div className={`flex items-center ${markIssueData ? 'gap-2' : 'gap-3'} mb-1 flex-wrap`}>
                        <h1 className={`font-semibold text-foreground ${markIssueData ? 'text-xl' : 'text-2xl'}`}>{selectedCall.customerName}</h1>
                        <div className={`flex items-center gap-1 text-muted-foreground ${markIssueData ? 'text-xs' : 'text-sm'}`}>
                          <span>Phone:</span>
                          <span className="text-foreground break-all">{selectedCall.phoneNumber}</span>
                        </div>
                        <div className={`flex items-center gap-1 text-muted-foreground ${markIssueData ? 'text-xs' : 'text-sm'}`}>
                          <span>Duration:</span>
                          {isDurationLoading || audioDuration === 0 || currentCallId !== selectedCall?.id ? (
                            <span className="inline-block w-12 h-3 bg-muted animate-pulse rounded"></span>
                          ) : (
                            <span className="text-foreground whitespace-nowrap">
                              {`${Math.floor(audioDuration / 60)}:${Math.floor(audioDuration % 60).toString().padStart(2, '0')}`}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Call ID with Copy Icon */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">Call ID:</span>
                        <span className="text-xs text-foreground">{selectedCall.id}</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(selectedCall.id)
                                  toast({
                                    title: "Copied!",
                                    description: `Call ID "${selectedCall.id}" copied to clipboard`,
                                    duration: 2000,
                                  })
                                }}
                                className="p-1 hover:bg-muted rounded transition-colors"
                              >
                                <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Copy Call ID</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      {/* Completed Review Status on separate line */}
                      {(selectedCall.qcStatus === 'done' || selectedCall.qcStatus === 'completed') && (
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            ✓ Review Completed
                          </Badge>
                          <button
                            onClick={() => setShowIssuesPanel(!showIssuesPanel)}
                            className="text-xs px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
                          >
                            {showIssuesPanel ? 'Hide Issues' : 'Show Issues'}
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* QC Status and Actions */}
                    {selectedCall.qcAssignedTo === null ? (
                      <div className="flex flex-col items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                  onClick={handleAssignQC}
                                  className="inline-flex items-center px-5 py-2 bg-primary text-primary-foreground rounded-sm text-sm font-semibold hover:bg-primary/90 transition-all duration-200"
                                >
                                  Assign Call
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Assign Call</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    ) : selectedCall.qcStatus === 'done' || selectedCall.qcStatus === 'completed' ? (
                      null
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={handleQCDone}
                                  className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-sm text-sm font-semibold hover:bg-emerald-700 transition-all duration-200"
                                >
                                  Mark Completed
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Mark Completed</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Call Content Header - Fixed */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-card flex-shrink-0">
                  <h3 className="text-[17px] font-semibold text-foreground">Call Recording & Transcript</h3>
                </div>

                {/* Call Content - Fixed Layout */}
                <div className={`flex-1 flex flex-col bg-card relative ${
                  selectedCall?.qcAssignedTo === null ? 'opacity-40 pointer-events-none' : 'opacity-100'
                }`}>
                  {/* Overlay when QC not assigned */}
                  {selectedCall?.qcAssignedTo === null && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                      <div className="text-center p-6 bg-card rounded-lg shadow-lg border">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">QC Assignment Required</h3>
                        <p className="text-sm text-muted-foreground">
                          Please assign QC to this call to access the recording and transcript.
                        </p>
                      </div>
                    </div>
                  )}
                  {/* Audio Player Section - Compact */}
                  <div className="flex-shrink-0 pt-3">
                      {isLoadingCall ? (
                        <div className="space-y-3 px-6">
                          {/* Audio Player Skeleton - Compact */}
                          <div className="bg-muted/50 rounded-xl p-4 animate-pulse">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-muted rounded-full"></div>
                              <div className="flex-1 h-12 bg-muted rounded-lg"></div>
                              <div className="w-8 h-8 bg-muted rounded-full"></div>
                            </div>
                            <div className="flex justify-between mt-2">
                              <div className="w-12 h-3 bg-muted rounded"></div>
                              <div className="w-12 h-3 bg-muted rounded"></div>
                            </div>
                          </div>
                        </div>
                      ) : detailedCall?.callDetails?.recordingUrl && currentCallId === selectedCall?.id ? (
                        <div className="px-4 lg:px-6">
                          <AudioPlayer
                            ref={audioPlayerRef}
                            audioUrl={detailedCall.callDetails.recordingUrl}
                            showWaveform={true}
                            duration={audioDuration}
                            onTimeUpdate={(currentTime) => {
                              setCurrentPlaybackTime(currentTime)
                              scrollToCurrentTranscriptLine(currentTime)
                              
                              // Clear manual selection when audio continues playing
                              // This allows highlighting to follow the audio again
                              // Only clear if we're not in the middle of a message transition
                              if (selectedTranscriptIndex !== null) {
                                // Check if the manually selected message is still current
                                const selectedMessage = detailedCall.callDetails.messages[selectedTranscriptIndex]
                                if (selectedMessage?.secondsFromStart !== undefined) {
                                  const adjustedTime = currentTime
                                  const messageEnd = detailedCall.callDetails.messages[selectedTranscriptIndex + 1]?.secondsFromStart || Infinity
                                  const isStillCurrent = adjustedTime >= selectedMessage.secondsFromStart && adjustedTime < messageEnd
                                  
                                  if (!isStillCurrent) {
                                    setSelectedTranscriptIndex(null)
                                  }
                                }
                              }
                            }}
                            onPlay={() => {
                              // Audio started playing
                            }}
                            onPause={() => {
                              // Audio paused - reset user scrolling to allow auto-scroll
                              setIsUserScrolling(false)
                            }}
                          />
                        </div>
                      ) : (
                        <div className="text-center py-6 px-4 lg:px-6">
                          <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                          </div>
                          <h3 className="text-sm font-medium mb-1">No recording available</h3>
                          <p className="text-xs text-muted-foreground">This call doesn't have an associated recording file.</p>
                        </div>
                      )}
                    </div>

                    {/* Transcript Section */}
                    <div className="flex-1 flex flex-col min-h-0 mt-4">
                      {isLoadingCall ? (
                        <div className="space-y-4 px-4 lg:px-6">
                          <h3 className="attio-heading-3 mb-4">Transcript</h3>
                          {/* Transcript Skeleton - Attio Style */}
                          {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="attio-card p-4 animate-pulse">
                              <div className="flex items-start justify-between mb-3">
                                <div className="w-20 h-4 bg-muted rounded"></div>
                                <div className="w-16 h-3 bg-muted rounded"></div>
                              </div>
                              <div className="space-y-2">
                                <div className="w-full h-3 bg-muted rounded"></div>
                                <div className="w-4/5 h-3 bg-muted rounded"></div>
                                <div className="w-3/5 h-3 bg-muted rounded"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : detailedCall?.callDetails?.messages && detailedCall.callDetails.messages.length > 0 ? (
                        <div className="flex flex-col flex-1 min-h-0">
                          <h4 className="text-[15px] font-semibold text-foreground mb-3 px-4 lg:px-6 flex-shrink-0">Transcript</h4>
                          <div ref={transcriptContainerRef} className="space-y-2 overflow-y-auto max-h-[calc(100vh-400px)] px-4 lg:px-6 pb-40 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                            {detailedCall.callDetails.messages.map((message: any, index: number) => {
                              const isAI = message.role === 'bot'
                              const speaker = isAI ? 'Agent' : formatCustomerName(detailedCall.callDetails.name || '')
                              
                              // Format timestamp from secondsFromStart to [MM:SS] format
                              const timestamp = message.secondsFromStart !== undefined && message.secondsFromStart !== null
                                ? (() => {
                                    const seconds = Math.max(0, message.secondsFromStart); // Ensure non-negative
                                    const mins = Math.floor(seconds / 60);
                                    const secs = Math.floor(seconds % 60);
                                    return `${mins}:${secs.toString().padStart(2, '0')}`;
                                  })()
                                : null
                              
                              // Determine if this is the currently active transcript line
                              // Use exact current time for perfect sync accuracy
                              const adjustedPlaybackTime = currentPlaybackTime
                              const messageStart = message.secondsFromStart
                              
                              let isCurrentLine = false
                              if (messageStart !== undefined && messageStart !== null) {
                                const messageEnd = detailedCall.callDetails.messages[index + 1]?.secondsFromStart || Infinity
                                // Use exact timing for precise highlighting
                                isCurrentLine = adjustedPlaybackTime >= messageStart && adjustedPlaybackTime < messageEnd
                              }
                              
                              const shouldHighlight = selectedTranscriptIndex !== null 
                                ? selectedTranscriptIndex === index 
                                : isCurrentLine
                              
                              const hasIssue = markedIssues.has(index)
                              
                              // Get issue count from API response (prioritize API data over local calculation)
                              const issueCount = message.issueCount || 0
                              
                              return (
                                <div 
                                  key={index} 
                                  className={`p-4 rounded-lg border cursor-pointer relative group transition-all duration-200 ${
                                    shouldHighlight 
                                      ? 'bg-primary/5 border-primary/20 shadow-sm' 
                                      : issueCount > 0
                                      ? 'bg-red-50 border-red-200 shadow-sm'
                                      : 'bg-card border-border hover:bg-muted/50'
                                  }`}
                                  onClick={() => {
                                    // Calculate time based on message index and call duration
                                    const totalMessages = detailedCall.callDetails.messages.length;
                                    const callDuration = detailedCall.callDuration || 0;
                                    const estimatedTime = Math.floor((index / Math.max(totalMessages - 1, 1)) * callDuration);
                                    

                                    seekToTime(estimatedTime)
                                    setSelectedTranscriptIndex(index)
                                  }}
                                  title="Click to jump to this point in audio"
                                >
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                                        isAI 
                                          ? 'bg-primary/12 text-primary' 
                                          : 'bg-green-100 text-green-700'
                                      }`}>
                                        {isAI ? 'AI' : selectedCall?.customerInitials || 'CU'}
                                      </div>
                                      <div>
                                        <div className="text-[13px] font-semibold text-foreground">{speaker}</div>
                                        {timestamp && (
                                          <div className="text-[11px] text-muted-foreground/70 font-medium">{timestamp}</div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Issue Indicator and Mark Issue Button */}
                                    <div className="flex items-center gap-2">
                                      {/* Enhanced issue indicator for completed calls */}
                                      {(() => {
                                        // Find issues for this timestamp from API data
                                        // Only show badge if issue is marked at this exact timestamp (within 1 second)
                                        const transcriptIssues = apiCallIssues.filter(group => 
                                          Math.abs(group.secondsFromStart - (message.secondsFromStart || 0)) < 1
                                        )
                                        
                                        const totalIssuesAtTimestamp = transcriptIssues.reduce((total, group) => total + group.issues.length, 0)
                                        
                                        if (totalIssuesAtTimestamp > 0) {
                                          const highSeverityCount = transcriptIssues.reduce((total, group) => 
                                            total + group.issues.filter(issue => issue.severity === 'high').length, 0
                                          )
                                          
                                          return (
                                            <div className="flex items-center gap-1">
                                              {(selectedCall?.qcStatus === 'done' || selectedCall?.qcStatus === 'completed') ? (
                                                // Enhanced view for completed calls
                                                <div className="flex flex-col items-end gap-1">
                                                  <Badge 
                                                    variant={highSeverityCount > 0 ? "destructive" : "default"} 
                                                    className="text-xs px-1.5 py-0.5 h-5 min-w-5 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                                                    onClick={(e) => {
                                                      e.stopPropagation()
                                                      setActiveTab('previous-issues')
                                                    }}
                                                    title={`${totalIssuesAtTimestamp} issue${totalIssuesAtTimestamp > 1 ? 's' : ''} found at this timestamp`}
                                                  >
                                                    {totalIssuesAtTimestamp}
                                                  </Badge>
                                                  {highSeverityCount > 0 && (
                                                    <span className="text-xs text-destructive font-medium">
                                                      {highSeverityCount} HIGH
                                                    </span>
                                                  )}
                                                </div>
                                              ) : (
                                                // Original view for pending calls
                                                <Badge 
                                                  variant="destructive" 
                                                  className="text-xs px-1.5 py-0.5 h-5 min-w-5 flex items-center justify-center cursor-pointer hover:bg-destructive/80 transition-colors"
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleMarkIssue(message.message, message.secondsFromStart || 0, index)
                                                    setTimeout(() => setActiveTab('previous-issues'), 100)
                                                  }}
                                                  title={`Click to view ${totalIssuesAtTimestamp} issue${totalIssuesAtTimestamp > 1 ? 's' : ''} for this transcript`}
                                                >
                                                  {totalIssuesAtTimestamp}
                                                </Badge>
                                              )}
                                            </div>
                                          )
                                        }
                                        
                                        // Fallback to issueCount if no API data matches
                                        if (issueCount > 0) {
                                          return (
                                            <Badge 
                                              variant="destructive" 
                                              className="text-xs px-1.5 py-0.5 h-5 min-w-5 flex items-center justify-center cursor-pointer hover:bg-destructive/80 transition-colors"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                if (!(selectedCall?.qcStatus === 'done' || selectedCall?.qcStatus === 'completed')) {
                                                  handleMarkIssue(message.message, message.secondsFromStart || 0, index)
                                                }
                                                setTimeout(() => setActiveTab('previous-issues'), 100)
                                              }}
                                              title={`Click to view ${issueCount} issue${issueCount > 1 ? 's' : ''} for this transcript`}
                                            >
                                              {issueCount}
                                            </Badge>
                                          )
                                        }
                                        
                                        return null
                                      })()}
                                      {/* Show Mark Issue button when QC is assigned - allow for completed calls too */}
                                      {selectedCall?.qcAssignedTo !== null && (() => {
                                        // Find issues for this timestamp from API data
                                        // Only show issues if marked at this exact timestamp (within 1 second)
                                        const transcriptIssues = apiCallIssues.filter(group => 
                                          Math.abs(group.secondsFromStart - (message.secondsFromStart || 0)) < 1
                                        )
                                        const totalIssuesAtTimestamp = transcriptIssues.reduce((total, group) => total + group.issues.length, 0)
                                        const hasIssues = totalIssuesAtTimestamp > 0 || issueCount > 0
                                        
                                        return (
                                          <div className="flex items-center gap-1.5">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                handleMarkIssue(message.message, message.secondsFromStart || 0, index)
                                              }}
                                              className={`transition-opacity text-[11px] px-2.5 py-1.5 rounded-md font-medium ${
                                                hasIssues
                                                  ? 'opacity-100 bg-red-100 hover:bg-red-200 text-red-700' 
                                                  : 'opacity-0 group-hover:opacity-100 bg-secondary hover:bg-muted text-secondary-foreground'
                                              }`}
                                            >
                                              {hasIssues ? 'Mark more issues' : 'Mark issue'}
                                            </button>
                                          </div>
                                        )
                                      })()}
                                    </div>
                                  </div>
                                  
                                  <div className="text-[14px] text-foreground/90 leading-relaxed font-normal mt-1">
                                    {message.message}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 px-6">
                          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </div>
                          <h3 className="attio-heading-3 mb-2">No transcript available</h3>
                          <p className="attio-body-small">This call doesn't have transcript data.</p>
                        </div>
                      )}
                    </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h2 className="attio-heading-2 mb-2">
                    {statusFilter === 'completed' ? 'Completed Reviews' : 'No call selected'}
                  </h2>
                  <p className="attio-body">
                    {statusFilter === 'completed' 
                      ? 'Select a completed call from the list to view its review details and issues found during QC'
                      : 'Select a call from the list to start reviewing'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Issues Panel for Completed Calls - Collapsible */}
        {showIssuesPanel && selectedCall && (selectedCall.qcStatus === 'done' || selectedCall.qcStatus === 'completed') && (
          <div className="w-full sm:w-[380px] md:w-[400px] lg:w-[480px] xl:w-[520px] bg-card border-l-2 border-l-green-500/20 transition-all duration-300 shadow-xl flex-shrink-0">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="px-4 lg:px-6 py-4 lg:py-6 border-b border-border bg-muted/20 flex-shrink-0">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                       <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                     </div>
                     <div>
                       <h3 className="text-xl font-semibold text-foreground">QC Review Issues</h3>
                       <p className="text-sm text-muted-foreground mt-1">Issues found during quality review</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-2">
                     {/* Removed Add More Issues button for completed calls */}
                     <button
                       onClick={() => setShowIssuesPanel(false)}
                       className="p-2 hover:bg-muted rounded-lg transition-colors"
                     >
                       <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                       </svg>
                     </button>
                   </div>
                 </div>
              </div>

              {/* Issues Content */}
              <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
                  {isLoadingIssues ? (
                    // Loading state
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
                        <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                      </div>
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="bg-muted/30 border rounded-lg p-4 space-y-3 animate-pulse">
                            <div className="flex items-start justify-between gap-1">
                              <div className="h-4 w-16 bg-muted rounded"></div>
                              <div className="h-4 w-24 bg-muted rounded"></div>
                            </div>
                            <div className="h-12 bg-muted rounded"></div>
                            <div className="h-4 w-full bg-muted rounded"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : issuesError ? (
                    // Error state
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">Error loading issues</h3>
                      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">{issuesError}</p>
                    </div>
                  ) : apiCallIssues.length > 0 ? (
                    // Show API issues
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-foreground">
                          Issues Found During QC Review
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                            Review Complete
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {apiCallIssues.reduce((total, group) => total + group.issues.length, 0)} issue{apiCallIssues.reduce((total, group) => total + group.issues.length, 0) !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Enhanced summary for completed calls */}
                      {apiCallIssues.length > 0 && (
                        <div className="bg-gradient-to-br from-card to-muted/20 border rounded-xl p-6 shadow-sm">
                          <h4 className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            QC Review Summary
                          </h4>
                          <div className="grid grid-cols-3 gap-6 text-center mb-5">
                            <div className="bg-background/50 rounded-lg p-4 border">
                              <div className="text-2xl font-bold text-destructive mb-1">
                                {apiCallIssues.reduce((total, group) => 
                                  total + group.issues.filter(issue => issue.severity === 'high').length, 0
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground font-medium">High</div>
                              <div className="text-xs text-muted-foreground">Severity</div>
                            </div>
                            <div className="bg-background/50 rounded-lg p-4 border">
                              <div className="text-2xl font-bold text-orange-600 mb-1">
                                {apiCallIssues.reduce((total, group) => 
                                  total + group.issues.filter(issue => issue.severity === 'medium').length, 0
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground font-medium">Medium</div>
                              <div className="text-xs text-muted-foreground">Severity</div>
                            </div>
                            <div className="bg-background/50 rounded-lg p-4 border">
                              <div className="text-2xl font-bold text-muted-foreground mb-1">
                                {apiCallIssues.reduce((total, group) => 
                                  total + group.issues.filter(issue => issue.severity === 'low').length, 0
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground font-medium">Low</div>
                              <div className="text-xs text-muted-foreground">Severity</div>
                            </div>
                          </div>

                        </div>
                      )}
                      
                      <div className="space-y-4">
                        {apiCallIssues
                          .slice()
                          .sort((a, b) => b.secondsFromStart - a.secondsFromStart)
                          .map((issueGroup, groupIndex) => (
                          <div key={groupIndex} className="bg-gradient-to-br from-background to-muted/20 border rounded-xl p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="bg-primary/10 rounded-lg px-3 py-2">
                                  <Badge variant="outline" className="text-sm font-mono bg-background" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
                                    {(() => {
                                      const seconds = Math.max(0, issueGroup.secondsFromStart);
                                      const mins = Math.floor(seconds / 60);
                                      const secs = Math.floor(seconds % 60);
                                      return `${mins}:${secs.toString().padStart(2, '0')}`;
                                    })()}
                                  </Badge>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-foreground">
                                    {issueGroup.issues.length} Issue{issueGroup.issues.length > 1 ? 's' : ''}
                                  </span>
                                  <div className="text-xs text-muted-foreground">Found at this timestamp</div>
                                </div>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground bg-primary/5 rounded-lg p-4 border-l-4 border-primary/30">
                              <div className="font-medium text-foreground mb-1">Transcript:</div>
                              <div className="italic">"{issueGroup.transcript}"</div>
                            </div>
                            {/* Enhanced issue details for completed calls */}
                            <div className="space-y-3">
                              {issueGroup.issues.map((issue, issueIndex) => (
                                <div key={issueIndex} className="bg-background border rounded-lg p-4 hover:bg-muted/20 transition-colors">
                                  <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex-1">
                                      <h4 className="text-base font-semibold text-foreground mb-1">{issue.title}</h4>
                                      {issue.code && (
                                        <p className="text-sm text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded">
                                          Code: {issue.code}
                                        </p>
                                      )}
                                    </div>
                                    <Badge
                                      variant={issue.severity === 'high' ? 'destructive' : issue.severity === 'medium' ? 'default' : 'secondary'}
                                      className="text-sm px-3 py-1"
                                    >
                                      {issue.severity.toUpperCase()}
                                    </Badge>
                                  </div>
                                  {issue.description && (
                                    <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-lg">
                                      {issue.description}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Empty state
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-muted-foreground/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        No issues found during QC review
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                        This call passed QC review with no issues identified. The call quality met all standards.
                      </p>
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="text-sm text-green-800">
                          ✓ QC Review completed by: <span className="font-medium">{selectedCall?.qcAssignedTo?.name || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mark Issue Panel - Responsive - Allow marking issues even for completed calls */}
        {markIssueData && selectedCall && (
          <div className="w-full sm:w-[380px] md:w-[400px] lg:w-[480px] xl:w-[520px] bg-card border-l-2 border-l-primary/20 transition-all duration-300 shadow-xl flex-shrink-0">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="px-4 lg:px-6 py-4 lg:py-5 border-b border-border bg-muted/20 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-base lg:text-lg font-semibold text-foreground mb-1">Mark Issue</h2>
                      <p className="text-xs lg:text-[13px] text-muted-foreground/80">Identify quality concerns</p>
                    </div>
                  </div>
                <button 
                  onClick={handleCancelMarkIssue}
                  className="w-8 h-8 rounded-lg border border-input hover:bg-muted hover:border-border flex items-center justify-center transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                </div>
              </div>
              
              {/* Tabs Navigation */}
              <div className="pt-4 pb-0">
                <div className="flex border-b border-border">
                  {/* Always show New Issue tab - but with different label for completed calls */}
                  <button
                    onClick={() => setActiveTab('new-issue')}
                    className={`flex-1 pb-3 px-3 lg:px-6 text-xs lg:text-sm font-medium transition-colors relative ${
                      activeTab === 'new-issue'
                        ? 'text-foreground border-b-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {(selectedCall?.qcStatus === 'done' || selectedCall?.qcStatus === 'completed') 
                      ? 'Add More Issues' 
                      : 'New Issue'
                    }
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('previous-issues')}
                    className={`flex-1 pb-3 px-3 lg:px-6 text-xs lg:text-sm font-medium transition-colors relative flex items-center justify-center gap-2 ${
                      activeTab === 'previous-issues'
                        ? 'text-foreground border-b-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {(selectedCall?.qcStatus === 'done' || selectedCall?.qcStatus === 'completed') 
                      ? 'Existing Issues' 
                      : 'Previous Issues'
                    }
                    {(() => {
                      const totalApiIssuesCount = apiCallIssues.reduce((total, group) => total + group.issues.length, 0)
                      return totalApiIssuesCount > 0 ? (
                        <span className="bg-muted text-muted-foreground text-xs px-1.5 py-0.5 rounded-full font-medium">
                          {totalApiIssuesCount}
                        </span>
                      ) : null
                    })()}
                  </button>
                </div>
              </div>

              {/* Content - Independent scrolling */}
              <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                {activeTab === 'new-issue' && (
                  <div className="p-4 lg:p-6">
                    <MarkIssueForm
                      ref={formRef}
                      transcriptText={markIssueData.transcriptText}
                      timestamp={markIssueData.timestamp}
                      onSubmit={handleIssueSubmit}
                      onCancel={handleCancelMarkIssue}
                      showActions={false}
                      onFormChange={handleFormChange}
                      existingIssuesAtTimestamp={existingIssuesAtTimestamp}
                      onNewIssue={handleNewIssue}
                    />
                  </div>
                )}
                
                {activeTab === 'previous-issues' && (
                  <div className="p-4 lg:p-6">
                    {isLoadingIssues ? (
                      // Loading state
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
                          <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                        </div>
                        <div className="space-y-3">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-muted/30 border rounded-lg p-4 space-y-3 animate-pulse">
                              <div className="flex items-start justify-between gap-1">
                                <div className="h-4 w-16 bg-muted rounded"></div>
                                <div className="flex gap-1">
                                  <div className="h-4 w-20 bg-muted rounded"></div>
                                  <div className="h-4 w-24 bg-muted rounded"></div>
                                </div>
                              </div>
                              <div className="h-8 bg-muted rounded"></div>
                              <div className="h-4 w-full bg-muted rounded"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : issuesError ? (
                      // Error state
                      <div className="flex flex-col items-center justify-center h-full text-center py-12">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">Error loading issues</h3>
                        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">{issuesError}</p>
                      </div>
                    ) : apiCallIssues.length > 0 ? (
                      // Show API issues
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-foreground">
                            {(selectedCall?.qcStatus === 'done' || selectedCall?.qcStatus === 'completed') 
                              ? 'Issues Found During QC Review' 
                              : 'All Issues in This Call'
                            }
                          </h3>
                          <div className="flex items-center gap-2">
                            {(selectedCall?.qcStatus === 'done' || selectedCall?.qcStatus === 'completed') && (
                              <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                                Review Complete
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {apiCallIssues.reduce((total, group) => total + group.issues.length, 0)} issue{apiCallIssues.reduce((total, group) => total + group.issues.length, 0) !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Enhanced summary for completed calls */}
                        {(selectedCall?.qcStatus === 'done' || selectedCall?.qcStatus === 'completed') && apiCallIssues.length > 0 && (
                          <div className="bg-card border rounded-lg p-4 mb-4">
                            <h4 className="text-sm font-medium text-foreground mb-3">QC Review Summary</h4>
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <div className="text-lg font-semibold text-destructive">
                                  {apiCallIssues.reduce((total, group) => 
                                    total + group.issues.filter(issue => issue.severity === 'high').length, 0
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">High Severity</div>
                              </div>
                              <div>
                                <div className="text-lg font-semibold text-orange-600">
                                  {apiCallIssues.reduce((total, group) => 
                                    total + group.issues.filter(issue => issue.severity === 'medium').length, 0
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">Medium Severity</div>
                              </div>
                              <div>
                                <div className="text-lg font-semibold text-muted-foreground">
                                  {apiCallIssues.reduce((total, group) => 
                                    total + group.issues.filter(issue => issue.severity === 'low').length, 0
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">Low Severity</div>
                              </div>
                            </div>

                          </div>
                        )}
                        
                        <div className="space-y-3">
                          {apiCallIssues
                            .slice()
                            .sort((a, b) => b.secondsFromStart - a.secondsFromStart)
                            .map((issueGroup, groupIndex) => (
                            <div key={groupIndex} className="bg-muted/30 border rounded-lg p-4 space-y-3 relative group">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
                                    {(() => {
                                      const seconds = Math.max(0, issueGroup.secondsFromStart);
                                      const mins = Math.floor(seconds / 60);
                                      const secs = Math.floor(seconds % 60);
                                      return `${mins}:${secs.toString().padStart(2, '0')}`;
                                    })()}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {issueGroup.issues.length} issue{issueGroup.issues.length > 1 ? 's' : ''}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1 justify-end max-w-[70%]">
                                  {issueGroup.issues.map((issue, issueIndex) => (
                                    <Badge
                                      key={issueIndex}
                                      variant={issue.severity === 'high' ? 'destructive' : issue.severity === 'medium' ? 'default' : 'secondary'}
                                      className="text-xs max-w-full"
                                      title={`${issue.severity.toUpperCase()} - ${issue.title}`}
                                    >
                                      <span className="truncate">
                                        {issue.severity.toUpperCase()} - {issue.title}
                                      </span>
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground bg-background/50 rounded p-2 border-l-2 border-primary/20 space-y-1">
                                <div>
                                  <strong>Transcript:</strong> "{issueGroup.transcript}"
                                </div>
                                {(() => {
                                  // Check if any issue in this group has a note
                                  const issuesWithNotes = issueGroup.issues.filter(issue => issue.note)
                                  if (issuesWithNotes.length > 0) {
                                    return (
                                      <div className="space-y-1 mt-2">
                                        {issuesWithNotes.map((issue, idx) => (
                                          <div key={idx} className="text-xs text-foreground bg-yellow-50 border border-yellow-200 rounded p-2">
                                            <div className="font-medium text-yellow-900 mb-1">{issue.title}</div>
                                            {editingNote === issue._id ? (
                                              <div className="space-y-2">
                                                <textarea
                                                  value={editNoteText}
                                                  onChange={(e) => setEditNoteText(e.target.value)}
                                                  className="w-full text-xs border rounded px-2 py-1 min-h-[60px]"
                                                  autoFocus
                                                />
                                                <div className="flex gap-1">
                                                  <button
                                                    onClick={async () => {
                                                      try {
                                                        // Call update API
                                                        await callsApiService.markCallIssues({
                                                          callId: selectedCall.id,
                                                          secondsFromStart: Math.floor(issueGroup.secondsFromStart),
                                                          transcript: issueGroup.transcript,
                                                          addIssues: [],
                                                          updateIssues: [{
                                                            id: issue._id,
                                                            severity: issue.severity,
                                                            note: editNoteText
                                                          }],
                                                          deleteIssues: []
                                                        })
                                                        toast({
                                                          title: "Note Updated",
                                                          description: "The note has been updated successfully.",
                                                        })
                                                        await loadCallIssues(selectedCall.id)
                                                        setEditingNote(null)
                                                      } catch (err) {
                                                        toast({
                                                          title: "Error",
                                                          description: "Failed to update note.",
                                                          variant: "destructive"
                                                        })
                                                      }
                                                    }}
                                                    className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                                                  >
                                                    Save
                                                  </button>
                                                  <button
                                                    onClick={() => {
                                                      setEditingNote(null)
                                                      setEditNoteText('')
                                                    }}
                                                    className="text-xs px-2 py-1 bg-muted text-foreground rounded hover:bg-muted/80"
                                                  >
                                                    Cancel
                                                  </button>
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                  <strong>Note:</strong> {issue.note}
                                                </div>
                                                <button
                                                  onClick={() => {
                                                    setEditNoteText(issue.note || '')
                                                    setEditingNote(issue._id)
                                                  }}
                                                  className="text-primary hover:text-primary/80"
                                                  title="Edit note"
                                                >
                                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                  </svg>
                                                </button>
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )
                                  }
                                  return null
                                })()}
                              </div>
                              {/* Enhanced issue details for completed calls */}
                              {(selectedCall?.qcStatus === 'done' || selectedCall?.qcStatus === 'completed') && (
                                <div className="space-y-2">
                                  {issueGroup.issues.map((issue, issueIndex) => (
                                    <div key={issueIndex} className="bg-background/70 rounded p-3 border group/issue hover:border-primary/30 transition-colors">
                                      <div className="flex items-start justify-between gap-2 mb-2">
                                        <div className="flex-1">
                                          <h4 className="text-sm font-medium text-foreground">{issue.title}</h4>
                                          {issue.code && (
                                            <p className="text-xs text-muted-foreground mt-1">Code: {issue.code}</p>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Badge
                                            variant={issue.severity === 'high' ? 'destructive' : issue.severity === 'medium' ? 'default' : 'secondary'}
                                            className="text-xs"
                                          >
                                            {issue.severity.toUpperCase()}
                                          </Badge>
                                          <button
                                            onClick={async () => {
                                              if (confirm(`Remove "${issue.title}" from this timestamp?`)) {
                                                try {
                                                  await callsApiService.markCallIssues({
                                                    callId: selectedCall.id,
                                                    secondsFromStart: Math.floor(issueGroup.secondsFromStart),
                                                    transcript: issueGroup.transcript,
                                                    addIssues: [],
                                                    updateIssues: [],
                                                    deleteIssues: [issue._id]
                                                  })
                                                  toast({
                                                    title: "Issue Removed",
                                                    description: `"${issue.title}" has been removed.`,
                                                  })
                                                  await loadCallIssues(selectedCall.id)
                                                } catch (err) {
                                                  toast({
                                                    title: "Error",
                                                    description: "Failed to remove issue.",
                                                    variant: "destructive"
                                                  })
                                                }
                                              }
                                            }}
                                            className="opacity-0 group-hover/issue:opacity-100 text-xs px-2 py-1 text-destructive hover:bg-destructive/10 rounded transition-all"
                                          >
                                            Remove
                                          </button>
                                        </div>
                                      </div>
                                      {issue.description && (
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                          {issue.description}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                  <button
                                    onClick={() => {
                                      handleMarkIssue(
                                        issueGroup.transcript,
                                        issueGroup.secondsFromStart
                                      )
                                    }}
                                    className="w-full text-xs px-3 py-2 bg-primary/10 text-primary border border-primary/20 rounded hover:bg-primary/20 transition-colors"
                                  >
                                    Add/Change Issues at this Timestamp
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      // Empty state
                      <div className="flex flex-col items-center justify-center h-full text-center py-12">
                        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                          <svg className="w-8 h-8 text-muted-foreground/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">
                          {(selectedCall?.qcStatus === 'done' || selectedCall?.qcStatus === 'completed') 
                            ? 'No issues found during QC review' 
                            : 'No issues for this call'
                          }
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                          {(selectedCall?.qcStatus === 'done' || selectedCall?.qcStatus === 'completed') 
                            ? 'This call passed QC review with no issues identified. The call quality met all standards.' 
                            : 'No issues have been marked for this call yet. Switch to the "New Issue" tab to add some.'
                          }
                        </p>
                        {(selectedCall?.qcStatus === 'done' || selectedCall?.qcStatus === 'completed') && (
                          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="text-sm text-green-800">
                              ✓ QC Review completed by: <span className="font-medium">{selectedCall?.qcAssignedTo?.name || 'Unknown'}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Sticky Actions - Only show for New Issue tab */}
              {activeTab === 'new-issue' && (
                <div className="flex-shrink-0 p-4 lg:p-6 border-t border-border bg-card">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleCancelMarkIssue}
                      className="flex-1 px-3 lg:px-4 py-2 text-sm font-medium text-foreground border border-input bg-background hover:bg-muted rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => formRef.current?.submitForm()}
                      disabled={!isFormValid}
                      className="flex-1 px-3 lg:px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground rounded-lg transition-colors"
                    >
                      Mark Issue
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
      
      {/* Call Classification Dialog */}
      <Dialog open={showClassificationDialog} onOpenChange={setShowClassificationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Classify Call Quality</DialogTitle>
            <DialogDescription>
              Please classify this call before marking it as completed.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            {['Excellent', 'Good', 'Average', 'Poor'].map((classification) => (
              <button
                key={classification}
                onClick={() => setSelectedClassification(classification)}
                className={`w-full px-4 py-3 text-left rounded-lg border-2 transition-all ${
                  selectedClassification === classification
                    ? 'border-primary bg-primary/10 font-semibold'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{classification}</span>
                  {selectedClassification === classification && (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  )}
                </div>
              </button>
            ))}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowClassificationDialog(false)
                setSelectedClassification('')
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleClassificationSubmit}
              disabled={!selectedClassification}
            >
              Mark Completed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}
