"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { AppShell } from "@/components/app-shell"
import { CallsTable, CallsTableRef } from "@/components/calls/calls-table"
import AudioPlayer, { AudioPlayerRef } from "@/components/audio/audio-player"
import { MarkIssueForm, MarkIssueFormRef } from "@/components/transcript/mark-issue-form"
import { fetchCallById } from "@/lib/api"
import { callsApiService, CallIssuesResponse, CallIssueGroup, type AssignQCRequest } from "@/lib/calls-api"
import { useToast } from "@/hooks/use-toast"
import { useEnterprise } from "@/lib/enterprise-context"
import { EnterpriseTeamSelector } from "@/components/enterprise/enterprise-team-selector"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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
  
  // Form state for sticky actions
  const [isFormValid, setIsFormValid] = useState(false)
  const [totalChanges, setTotalChanges] = useState(0)
  const formRef = React.useRef<MarkIssueFormRef>(null)

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
      setMarkIssueData({ transcriptText, timestamp, transcriptIndex })
      // Reset to new issue tab when opening
      setActiveTab('new-issue')
    } catch (error) {
      console.error('Error in handleMarkIssue:', error)
    }
  }

  const handleIssueSubmit = async (issue: { 
    addIssues: Array<{ issueId: string; severity: 'low' | 'medium' | 'high' }>;
    updateIssues: Array<{ id: string; severity: 'low' | 'medium' | 'high' }>;
    deleteIssues: string[];
  }) => {
    if (!selectedCall?.id || !markIssueData) return
    
    try {
      // Call the POST API to mark issues
      const markIssueRequest = {
        callId: selectedCall.id,
        secondsFromStart: markIssueData.timestamp,
        transcript: markIssueData.transcriptText,
        addIssues: issue.addIssues,
        updateIssues: issue.updateIssues,
        deleteIssues: issue.deleteIssues
      }
      

      
      const response = await callsApiService.markCallIssues(markIssueRequest)
      

      
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
          description = `${actions.join(', ')} at ${Math.floor(markIssueData.timestamp / 60)}:${Math.floor(markIssueData.timestamp % 60).toString().padStart(2, '0')}`
        } else {
          description = `Issues updated at ${Math.floor(markIssueData.timestamp / 60)}:${Math.floor(markIssueData.timestamp % 60).toString().padStart(2, '0')}`
        }
        
        toast({
          title: "Issues Marked Successfully",
          description: description,
          variant: "default",
        })
        
        // Reload call issues to get the updated data
        await loadCallIssues(selectedCall.id)
        
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
    
    try {
      const qcDoneRequest: AssignQCRequest = {
        callId: selectedCall.id,
        qcStatus: 'done'
      }
      
      const response = await callsApiService.assignQC(qcDoneRequest)
      
      if (response.message && response.updatedFields) {
        toast({
          title: "QC Completed Successfully",
          description: response.message,
          variant: "default",
        })
        
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



  // Function to load call issues from API
  const loadCallIssues = async (callId: string) => {
    try {
      setIsLoadingIssues(true)
      setIssuesError(null)
      
      const issuesResponse = await callsApiService.getCallIssues(callId)
      setApiCallIssues(issuesResponse.data)
    } catch (error) {
      console.error('Error fetching call issues:', error)
      setIssuesError('Failed to load call issues')
      setApiCallIssues([])
    } finally {
      setIsLoadingIssues(false)
    }
  }

  // Clear selected call when enterprise or team changes
  useEffect(() => {
    console.log('Clearing call data due to enterprise/team change')
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
    if (selectedCall?.id) {
      setIsLoadingCall(true)
      
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
          }
        })
        .catch((error) => {
          console.error('Error fetching call details:', error)
        })
        .finally(() => {
          setIsLoadingCall(false)
        })
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

  // Global keyboard shortcuts for audio control and mark issue
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Check if we're in the search input
      const isSearchInput = (event.target as HTMLElement)?.placeholder?.includes('Search by issue name')
      
      // If mark issue panel is open, let MarkIssueForm handle ctrl+number shortcuts
      // But allow them to work in search inputs
      if (event.ctrlKey && /^[1-9]$/.test(event.key) && markIssueData && !isSearchInput) {
        return
      }

      
      // Only handle shortcuts when not typing in input fields or textareas
      // Exception: Allow number shortcuts (1-9 and Ctrl+1-9) to work in search inputs
      const targetTag = (event.target as HTMLElement)?.tagName?.toLowerCase()
      const isNumberShortcut = /^[1-9]$/.test(event.key) || (event.ctrlKey && /^[1-9]$/.test(event.key))
      
      if (targetTag !== 'input' && targetTag !== 'textarea' || (isSearchInput && isNumberShortcut)) {
        // Spacebar - Play/Pause audio
        if (event.code === 'Space') {
          event.preventDefault()

          
          // Trigger play/pause if we have an audio player
          if (detailedCall?.callDetails?.recordingUrl) {

            // We'll need to expose the audio player's play/pause function
            // For now, we can dispatch a custom event that the audio player can listen to
            window.dispatchEvent(new CustomEvent('toggleAudioPlayPause'))
          } else {

          }
        }
        

        
        // Tab key - Toggle Mark Issue panel and pause audio (only if QC is assigned)
        if (event.code === 'Tab' && selectedCall?.qcAssignedTo !== null) {
          event.preventDefault()
          
          // If Mark Issue panel is already open, close it
          if (markIssueData) {

            setMarkIssueData(null)
          } else {
            // If Mark Issue panel is closed, open it and pause audio

            
            // Pause the audio first
            if (detailedCall?.callDetails?.recordingUrl) {

              window.dispatchEvent(new CustomEvent('pauseAudio'))
            }
            
            // Open Mark Issue panel with current transcript context
            if (detailedCall?.callDetails?.messages && detailedCall.callDetails.messages.length > 0) {
              // Get the current message being played - use exact current time for perfect accuracy
              const adjustedTime = currentPlaybackTime
              let currentMessageIndex = -1
              
              // Find the message that should be active at the current time
              for (let i = 0; i < detailedCall.callDetails.messages.length; i++) {
                const messageStart = detailedCall.callDetails.messages[i]?.secondsFromStart
                const nextMessageStart = detailedCall.callDetails.messages[i + 1]?.secondsFromStart
                
                if (typeof messageStart === 'number' && messageStart <= adjustedTime) {
                  if (typeof nextMessageStart !== 'number' || nextMessageStart > adjustedTime) {
                    currentMessageIndex = i
                    break
                  }
                }
              }
              
              const messageIndex = currentMessageIndex !== -1 ? currentMessageIndex : 0
              const currentMessage = detailedCall.callDetails.messages[messageIndex]
              
              if (currentMessage) {
                handleMarkIssue(
                  currentMessage.message || currentMessage.text || 'Current transcript context', 
                  currentMessage.secondsFromStart || currentPlaybackTime,
                  messageIndex
                )
              }
            } else if (detailedCall?.callDetails?.transcript) {
              // Handle other transcript formats
              const transcriptText = Array.isArray(detailedCall.callDetails.transcript) 
                ? detailedCall.callDetails.transcript[0]?.text || 'Transcript context'
                : typeof detailedCall.callDetails.transcript === 'string'
                ? detailedCall.callDetails.transcript.split('\n')[0] || 'Transcript context'
                : 'Transcript context'
              
              handleMarkIssue(transcriptText, currentPlaybackTime)
            } else {
              // Fallback - open with generic context
              handleMarkIssue('Call review context', currentPlaybackTime)
            }
          }
        }

        // N key - When on "Previous Issues" tab, switch to "New Issue" tab
        if (event.code === 'KeyN') {
          if (markIssueData && activeTab === 'previous-issues') {
            event.preventDefault()

            setActiveTab('new-issue')
          }
        }

        // Ctrl+A - Assign QC (only when call is selected and not assigned)
        if (event.ctrlKey && event.code === 'KeyA' && selectedCall && selectedCall.qcAssignedTo === null) {
          event.preventDefault()
          handleAssignQC()
        }

        // Ctrl+Q - QC Done (only when call is selected and assigned)
        if (event.ctrlKey && event.code === 'KeyQ' && selectedCall && selectedCall.qcAssignedTo !== null) {
          event.preventDefault()
          handleQCDone()
        }

        // Ctrl+S or Cmd+S - Open Mark Issue panel and focus search
        if ((event.ctrlKey || event.metaKey) && event.code === 'KeyS') {
          event.preventDefault()
          
          // Only open if QC is assigned and we have a call selected
          if (selectedCall?.qcAssignedTo !== null) {
            // If Mark Issue panel is already open, just focus the search
            if (markIssueData) {
              // Focus the search input in the Mark Issue panel
              setTimeout(() => {
                const searchInput = document.querySelector('[placeholder*="Search by issue name"]') as HTMLInputElement
                if (searchInput) {
                  searchInput.focus()
                }
              }, 100)
            } else {
              // Open Mark Issue panel with current transcript context
              if (detailedCall?.callDetails?.messages && detailedCall.callDetails.messages.length > 0) {
                // Get the current message being played - use exact current time for perfect accuracy
                const adjustedTime = currentPlaybackTime
                let currentMessageIndex = -1
                
                // Find the message that should be active at the current time
                for (let i = 0; i < detailedCall.callDetails.messages.length; i++) {
                  const messageStart = detailedCall.callDetails.messages[i]?.secondsFromStart
                  const nextMessageStart = detailedCall.callDetails.messages[i + 1]?.secondsFromStart
                  
                  if (typeof messageStart === 'number' && messageStart <= adjustedTime) {
                    if (typeof nextMessageStart !== 'number' || nextMessageStart > adjustedTime) {
                      currentMessageIndex = i
                      break
                    }
                  }
                }
                
                const messageIndex = currentMessageIndex !== -1 ? currentMessageIndex : 0
                const currentMessage = detailedCall.callDetails.messages[messageIndex]
                
                if (currentMessage) {
                  handleMarkIssue(
                    currentMessage.message || currentMessage.text || 'Current transcript context', 
                    currentMessage.secondsFromStart || currentPlaybackTime,
                    messageIndex
                  )
                  
                  // Focus the search input after opening
                  setTimeout(() => {
                    const searchInput = document.querySelector('[placeholder*="Search by issue name"]') as HTMLInputElement
                    if (searchInput) {
                      searchInput.focus()
                    }
                  }, 200)
                }
              } else if (detailedCall?.callDetails?.transcript) {
                // Handle other transcript formats
                const transcriptText = Array.isArray(detailedCall.callDetails.transcript) 
                  ? detailedCall.callDetails.transcript[0]?.text || 'Transcript context'
                  : typeof detailedCall.callDetails.transcript === 'string'
                  ? detailedCall.callDetails.transcript.split('\n')[0] || 'Transcript context'
                  : 'Transcript context'
                
                handleMarkIssue(transcriptText, currentPlaybackTime)
                
                // Focus the search input after opening
                setTimeout(() => {
                  const searchInput = document.querySelector('[placeholder*="Search by issue name"]') as HTMLInputElement
                  if (searchInput) {
                    searchInput.focus()
                  }
                }, 200)
              } else {
                // Fallback - open with generic context
                handleMarkIssue('Call review context', currentPlaybackTime)
                
                // Focus the search input after opening
                setTimeout(() => {
                  const searchInput = document.querySelector('[placeholder*="Search by issue name"]') as HTMLInputElement
                  if (searchInput) {
                    searchInput.focus()
                  }
                }, 200)
              }
            }
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [detailedCall?.callDetails?.recordingUrl, detailedCall?.callDetails?.messages, detailedCall?.callDetails?.transcript, currentPlaybackTime, markIssueData, activeTab, selectedCall?.qcAssignedTo, selectedCall, handleAssignQC, handleQCDone, handleMarkIssue])

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
    <AppShell>
      <div className="flex h-full bg-background">
        {/* Left Panel - Call List */}
        <div className="w-96 flex flex-col border-r border-border bg-card">
          {/* Enterprise/Team Selector */}
          <div className="px-6 py-4 border-b border-border bg-muted/20 flex-shrink-0">
            <EnterpriseTeamSelector />
          </div>
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-border bg-muted/20 flex-shrink-0">
            <h2 className="text-lg font-semibold text-foreground mb-1">Call Reviews</h2>
            <p className="text-[13px] text-muted-foreground/80">Recent customer calls</p>
          </div>
          
          {/* Call List - Independent scrolling */}
          <div className="flex-1 min-h-0 overflow-y-scroll scrollbar-hidden">
            <CallsTable ref={callsTableRef} onCallSelect={setSelectedCall} selectedCallId={selectedCall?.id || null} />
          </div>
        </div>

        {/* Main Panel - Call Details */}
        <div className="flex-1 transition-all duration-300">
          <div className="h-full flex flex-col">
            {selectedCall ? (
              <div className="flex-1 flex flex-col">
                {/* Call Header - Compact */}
                <div className="px-6 py-5 border-b border-border bg-card">
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
                      <h1 className="text-2xl font-semibold text-foreground mb-2">{selectedCall.customerName}</h1>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Phone:</span>
                          <span className="text-foreground">{selectedCall.phoneNumber}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="text-foreground">{selectedCall.callLength}</span>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                          selectedCall.callType === 'Inbound' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {selectedCall.callType}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                          selectedCall.callPriority === 'High' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedCall.callPriority}
                        </span>
                      </div>
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
                                <p>Assign Call (Ctrl+A)</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-medium" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>Ctrl</kbd>
                          <span className="text-[10px]">+</span>
                          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-medium" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>A</kbd>
                        </div>
                      </div>
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
                                <p>Mark Completed (Ctrl+Q)</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-medium" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>Ctrl</kbd>
                            <span className="text-[10px]">+</span>
                            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-medium" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>Q</kbd>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Call Content Header - Fixed */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-card flex-shrink-0">
                  <h3 className="text-[17px] font-semibold text-foreground">Call Recording & Transcript</h3>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground/80">
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 bg-muted rounded text-[10px] font-medium" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>Space</kbd>
                      <span className="font-medium">Play/Pause</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 bg-muted rounded text-[10px] font-medium" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>Tab</kbd>
                      <span className="font-medium">Mark Issue</span>
                    </div>
                  </div>
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
                  {/* Audio Player Section - Fixed */}
                  <div className="flex-shrink-0 pt-6">
                      {isLoadingCall ? (
                        <div className="space-y-6 px-6">
                          {/* Audio Player Skeleton - Attio Style */}
                          <div className="bg-muted/50 rounded-xl p-6 animate-pulse">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-muted rounded-full"></div>
                              <div className="flex-1 h-20 bg-muted rounded-lg"></div>
                              <div className="w-12 h-12 bg-muted rounded-full"></div>
                            </div>
                            <div className="flex justify-between mt-4">
                              <div className="w-16 h-4 bg-muted rounded"></div>
                              <div className="w-16 h-4 bg-muted rounded"></div>
                            </div>
                          </div>
                        </div>
                      ) : detailedCall?.callDetails?.recordingUrl ? (
                        <div className="px-6">
                          <AudioPlayer
                            ref={audioPlayerRef}
                            audioUrl={detailedCall.callDetails.recordingUrl}
                            showWaveform={true}
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
                        <div className="text-center py-12 px-6">
                          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                          </div>
                          <h3 className="attio-heading-3 mb-2">No recording available</h3>
                          <p className="attio-body-small">This call doesn't have an associated recording file.</p>
                        </div>
                      )}
                    </div>

                    {/* Transcript Section */}
                    <div className="flex-1 flex flex-col min-h-0 mt-8">
                      {isLoadingCall ? (
                        <div className="space-y-4 px-6">
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
                          <h4 className="text-[15px] font-semibold text-foreground mb-3 px-6 flex-shrink-0">Transcript</h4>
                          <div ref={transcriptContainerRef} className="space-y-2 overflow-y-auto max-h-[calc(100vh-400px)] px-6 pb-16 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                            {detailedCall.callDetails.messages.map((message: any, index: number) => {
                              const isAI = message.role === 'bot'
                              const speaker = isAI ? 'Agent' : formatCustomerName(detailedCall.callDetails.name || '')
                              
                              // Format timestamp from secondsFromStart to [MM:SS] format
                              const timestamp = message.secondsFromStart 
                                ? `${Math.floor(message.secondsFromStart / 60)}:${Math.floor(message.secondsFromStart % 60).toString().padStart(2, '0')}`
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
                                    const callDuration = detailedCall.duration || 300; // Default to 5 minutes if no duration
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
                                      {issueCount > 0 && (
                                        <Badge 
                                          variant="destructive" 
                                          className="text-xs px-1.5 py-0.5 h-5 min-w-5 flex items-center justify-center cursor-pointer hover:bg-destructive/80 transition-colors"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleMarkIssue(message.message, message.secondsFromStart || 0, index)
                                            // Switch to previous issues tab after opening
                                            setTimeout(() => setActiveTab('previous-issues'), 100)
                                          }}
                                          title={`Click to view ${issueCount} issue${issueCount > 1 ? 's' : ''} for this transcript`}
                                        >
                                          {issueCount}
                                        </Badge>
                                      )}
                                      {/* Only show Mark Issue button when QC is assigned */}
                                      {selectedCall?.qcAssignedTo !== null && (
                                        <div className="flex items-center gap-1.5">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              handleMarkIssue(message.message, message.secondsFromStart || 0, index)
                                            }}
                                            className={`transition-opacity text-[11px] px-2.5 py-1.5 rounded-md font-medium ${
                                              issueCount > 0
                                                ? 'opacity-100 bg-red-100 hover:bg-red-200 text-red-700' 
                                                : 'opacity-0 group-hover:opacity-100 bg-secondary hover:bg-muted text-secondary-foreground'
                                            }`}
                                          >
                                            {issueCount > 0 ? 'Mark more issues' : 'Mark issue'}
                                          </button>
                                        </div>
                                      )}
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
                  <h2 className="attio-heading-2 mb-2">No call selected</h2>
                  <p className="attio-body">Select a call from the list to start reviewing</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mark Issue Panel - Wider */}
        {markIssueData && (
          <div className="w-[480px] bg-card border-l-2 border-l-primary/20 transition-all duration-300 shadow-xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="px-6 py-5 border-b border-border bg-muted/20 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground mb-1">Mark Issue</h2>
                      <p className="text-[13px] text-muted-foreground/80">Identify quality concerns</p>
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
                  <button
                    onClick={() => setActiveTab('new-issue')}
                    className={`flex-1 pb-3 px-6 text-sm font-medium transition-colors relative ${
                      activeTab === 'new-issue'
                        ? 'text-foreground border-b-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    New Issue
                  </button>
                  <button
                    onClick={() => setActiveTab('previous-issues')}
                    className={`flex-1 pb-3 px-6 text-sm font-medium transition-colors relative flex items-center justify-center gap-2 ${
                      activeTab === 'previous-issues'
                        ? 'text-foreground border-b-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Previous Issues
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
                  <div className="p-6">
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
                  <div className="p-6">
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
                          <h3 className="text-sm font-medium text-foreground">All Issues in This Call</h3>
                          <Badge variant="outline" className="text-xs">
                            {apiCallIssues.reduce((total, group) => total + group.issues.length, 0)} issue{apiCallIssues.reduce((total, group) => total + group.issues.length, 0) !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <div className="space-y-3">
                          {apiCallIssues
                            .slice()
                            .sort((a, b) => b.secondsFromStart - a.secondsFromStart)
                            .map((issueGroup, groupIndex) => (
                            <div key={groupIndex} className="bg-muted/30 border rounded-lg p-4 space-y-3 relative group">
                              <div className="flex items-start justify-between gap-1">
                                <Badge variant="outline" className="text-xs" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
                                  {Math.floor(issueGroup.secondsFromStart / 60)}:{Math.floor(issueGroup.secondsFromStart % 60).toString().padStart(2, '0')}
                                </Badge>
                                <div className="flex flex-wrap gap-1">
                                  {issueGroup.issues.map((issue, issueIndex) => (
                                    <Badge
                                      key={issueIndex}
                                      variant={issue.severity === 'high' ? 'destructive' : issue.severity === 'medium' ? 'default' : 'secondary'}
                                      className="text-xs"
                                    >
                                      {issue.title}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground bg-background/50 rounded p-2 border-l-2 border-primary/20">
                                "{issueGroup.transcript}"
                              </div>
                              <p className="text-sm text-foreground leading-relaxed">
                                {issueGroup.issues.length} issue{issueGroup.issues.length > 1 ? 's' : ''} marked at {Math.floor(issueGroup.secondsFromStart / 60)}:{Math.floor(issueGroup.secondsFromStart % 60).toString().padStart(2, '0')}
                              </p>
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
                        <h3 className="text-lg font-medium text-foreground mb-2">No issues for this call</h3>
                        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                          No issues have been marked for this call yet. Switch to the "New Issue" tab to add some.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Sticky Actions - Only show for New Issue tab */}
              {activeTab === 'new-issue' && (
                <div className="flex-shrink-0 p-6 border-t border-border bg-card">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleCancelMarkIssue}
                      className="flex-1 px-4 py-2 text-sm font-medium text-foreground border border-input bg-background hover:bg-muted rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => formRef.current?.submitForm()}
                      disabled={!isFormValid}
                      className="flex-1 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground rounded-lg transition-colors"
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
    </AppShell>
  )
}
