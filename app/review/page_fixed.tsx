"use client"

import React, { useState, useEffect } from 'react'
import { AppShell } from "@/components/app-shell"
import { CallsTable } from "@/components/calls/calls-table"
import AudioPlayer from "@/components/audio/audio-player"
import { MarkIssueForm } from "@/components/transcript/mark-issue-form"
import { fetchCallById } from "@/lib/api"

export default function ReviewPage() {
  const [selectedCall, setSelectedCall] = React.useState<any>(null)
  const [detailedCall, setDetailedCall] = React.useState<any>(null)
  const [isLoadingCall, setIsLoadingCall] = React.useState(false)
  const [currentPlaybackTime, setCurrentPlaybackTime] = React.useState(0)
  const transcriptContainerRef = React.useRef<HTMLDivElement>(null)
  
  // Mark Issue state
  const [markIssueData, setMarkIssueData] = React.useState<{
    transcriptText: string
    timestamp: number
  } | null>(null)
  
  // Track manually selected transcript line
  const [selectedTranscriptIndex, setSelectedTranscriptIndex] = React.useState<number | null>(null)
  
  // Track user scroll intent to pause auto-scrolling
  const [isUserScrolling, setIsUserScrolling] = React.useState(false)
  const [showGoToCurrentCTA, setShowGoToCurrentCTA] = React.useState(false)

  // Helper function to format customer name in proper case
  const formatCustomerName = (name: string) => {
    if (!name) return 'Customer'
    return name.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')
  }

  // Function to scroll to current transcript line
  const scrollToCurrentTranscriptLine = (currentTime: number) => {
    if (!transcriptContainerRef.current || !detailedCall?.callDetails?.messages) return

    const messages = detailedCall.callDetails.messages
    // Move 3 seconds earlier by subtracting 3 from currentTime
    const adjustedTime = Math.max(0, currentTime - 3)

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
      // Only auto-scroll if user isn't manually scrolling
      if (!isUserScrolling) {
        const messageElements = transcriptContainerRef.current.children
        if (messageElements[currentMessageIndex]) {
          messageElements[currentMessageIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          })
        }
      } else {
        // Show CTA to go back to current line
        setShowGoToCurrentCTA(true)
      }
    }
  }

  // Function to seek audio to a specific time
  const seekToTime = (seconds: number) => {
    console.log('🎯 SEEKING to time:', seconds, 'seconds')
    
    // Dispatch a custom event that the audio player can listen to
    window.dispatchEvent(new CustomEvent('seekAudioToTime', { 
      detail: { time: seconds } 
    }))
    
    // Update the current playback time to reflect the seek
    setCurrentPlaybackTime(seconds)
    
    // Ensure audio continues playing after seek with multiple attempts
    const ensurePlayback = () => {
      if (detailedCall?.callDetails?.recordingUrl) {
        console.log('🚀 Ensuring audio plays after seek to', seconds, 's')
        window.dispatchEvent(new CustomEvent('ensureAudioPlaying'))
      }
    }
    
    // Try multiple times to ensure audio plays
    setTimeout(ensurePlayback, 100)  // First attempt
    setTimeout(ensurePlayback, 300)  // Second attempt
    setTimeout(ensurePlayback, 500)  // Third attempt
  }

  // Mark Issue handlers
  const handleMarkIssue = (transcriptText: string, timestamp: number) => {
    try {
      console.log('Marking issue for:', transcriptText, 'at timestamp:', timestamp)
      setMarkIssueData({ transcriptText, timestamp })
    } catch (error) {
      console.error('Error in handleMarkIssue:', error)
    }
  }

  const handleIssueSubmit = (issue: { issues: Array<{ type: string; severity: string }>; description: string }) => {
    // Here you would typically save the issue to your backend
    console.log('Issue submitted:', issue)
    
    // Clear the mark issue form
    setMarkIssueData(null)
  }

  const handleCancelMarkIssue = () => {
    setMarkIssueData(null)
  }

  // Function to go to current transcript line when CTA is clicked
  const handleGoToCurrentLine = () => {
    setIsUserScrolling(false)
    setShowGoToCurrentCTA(false)
    // Force scroll to current line
    if (detailedCall?.callDetails?.recordingUrl) {
      scrollToCurrentTranscriptLine(currentPlaybackTime)
    }
  }

  // Fetch detailed call data when a call is selected
  useEffect(() => {
    if (selectedCall?.id) {
      setIsLoadingCall(true)
      fetchCallById(selectedCall.id)
        .then((callData) => {
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
  }, [selectedCall?.id])

  // Add scroll event listeners to detect user scroll intent
  useEffect(() => {
    const transcriptContainer = transcriptContainerRef.current
    if (!transcriptContainer) return

    let scrollTimeout: NodeJS.Timeout

    const handleScroll = () => {
      setIsUserScrolling(true)
      setShowGoToCurrentCTA(false)
      
      // Clear previous timeout
      clearTimeout(scrollTimeout)
      
      // Reset user scrolling after 1.5 seconds of no scroll activity
      scrollTimeout = setTimeout(() => {
        setIsUserScrolling(false)
      }, 1500)
    }

    transcriptContainer.addEventListener('scroll', handleScroll)
    
    return () => {
      transcriptContainer.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [detailedCall])

  // Global keyboard shortcuts for audio control and mark issue
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      console.log('Key pressed:', event.code, 'Target:', (event.target as HTMLElement)?.tagName)
      
      // Only handle shortcuts when not typing in input fields
      if (!(event.target as HTMLElement)?.tagName?.toLowerCase().includes('input')) {
        // Spacebar - Play/Pause audio
        if (event.code === 'Space') {
          event.preventDefault()
          console.log('Spacebar pressed - attempting to toggle audio')
          
          // Trigger play/pause if we have an audio player
          if (detailedCall?.callDetails?.recordingUrl) {
            console.log('Dispatching toggleAudioPlayPause event')
            // We'll need to expose the audio player's play/pause function
            // For now, we can dispatch a custom event that the audio player can listen to
            window.dispatchEvent(new CustomEvent('toggleAudioPlayPause'))
          } else {
            console.log('No recording URL found')
          }
        }
        
        // Tab key - Toggle Mark Issue panel
        if (event.code === 'Tab') {
          event.preventDefault()
          
          // If Mark Issue panel is already open, close it
          if (markIssueData) {
            console.log('Tab key pressed - closing Mark Issue panel')
            setMarkIssueData(null)
          } else {
            // If Mark Issue panel is closed, open it
            console.log('Tab key pressed - opening Mark Issue panel')
            
            // Open Mark Issue panel with current transcript context
            if (detailedCall?.callDetails?.messages && detailedCall.callDetails.messages.length > 0) {
              // Get the current message being played or the first message
              const currentMessage = detailedCall.callDetails.messages.find((msg: any) => 
                msg.secondsFromStart && Math.abs(msg.secondsFromStart - currentPlaybackTime) < 2
              ) || detailedCall.callDetails.messages[0]
              
              if (currentMessage) {
                handleMarkIssue(
                  currentMessage.message || currentMessage.text || 'Current transcript context', 
                  currentMessage.secondsFromStart || 0
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
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [detailedCall?.callDetails?.recordingUrl, detailedCall?.callDetails?.messages, currentPlaybackTime, markIssueData])

  return (
    <AppShell>
      <div className="flex h-full">
        {/* Central Panel - Call List */}
        <div className="w-[307px] flex flex-col border-r">
          {/* Call List */}
          <div className="flex-1 overflow-auto">
            <CallsTable onCallSelect={setSelectedCall} />
          </div>
        </div>

        {/* Right Panel - Call Details */}
        <div className={`bg-gray-50 border-l transition-all duration-300 ${
          markIssueData ? 'w-[calc(100%-307px-384px)]' : 'w-[calc(100%-307px)]'
        }`}>
          <div className="p-6">
            {selectedCall ? (
              <>
                {/* Caller Information */}
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">{selectedCall.customerInitials}</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedCall.customerName}</h2>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    {/* Row 1: Phone number + Call length */}
                    <div className="grid grid-cols-2 gap-8 text-sm">
                      <div className="flex items-center">
                        <span className="text-gray-900 font-bold w-28 flex-shrink-0">Phone number</span>
                        <span className="text-gray-900">{selectedCall.phoneNumber}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-900 font-bold w-20 flex-shrink-0">Call length</span>
                        <span className="text-gray-900">{selectedCall.callLength}</span>
                      </div>
                    </div>
                    
                    {/* Row 2: Call type + Timestamp */}
                    <div className="grid grid-cols-2 gap-8 text-sm">
                      <div className="flex items-center">
                        <span className="text-gray-900 font-bold w-24 flex-shrink-0">Call type</span>
                        <span className={`px-3 py-1.5 text-xs text-center ${selectedCall.callType === 'Inbound' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`} style={{ borderRadius: '8px' }}>
                          {selectedCall.callType}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-900 font-bold w-20 flex-shrink-0">Timestamp</span>
                        <span className="text-gray-900">{selectedCall.timestamp}</span>
                      </div>
                    </div>
                    
                    {/* Row 3: Call Priority */}
                    <div className="flex items-center text-sm">
                      <span className="text-gray-900 font-bold w-24 flex-shrink-0">Call Priority</span>
                      <span className={`px-3 py-1.5 text-xs ${selectedCall.callPriority === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`} style={{ borderRadius: '8px' }}>
                        {selectedCall.callPriority}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No call selected</h3>
                <p className="mt-1 text-sm text-gray-500">Select a call from the list to view details</p>
              </div>
            )}

            {selectedCall && (
              <>
                {/* Combined Call Recording and Transcription Card */}
                <div className="bg-gray-50 border border-gray-300 pt-4 px-6 pb-6 shadow-md" style={{ borderRadius: '16px' }}>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-300">
                    <h3 className="text-lg font-semibold text-gray-900">Call Recording</h3>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Space</kbd>
                        Play/Pause
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Tab</kbd>
                        Mark Issue
                      </span>
                    </div>
                  </div>
                  
                  {isLoadingCall ? (
                    <div className="space-y-6">
                      {/* Audio Player Skeleton */}
                      <div className="space-y-4">
                        {/* Audio Controls Skeleton */}
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                            <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                          </div>
                          {/* Waveform Skeleton */}
                          <div className="flex-1">
                            <div className="flex items-center justify-center h-16 space-x-1">
                              {Array.from({ length: 60 }).map((_, i) => (
                                <div
                                  key={i}
                                  className="w-1 bg-gray-200 rounded-sm animate-pulse"
                                  style={{
                                    height: `${Math.random() * 40 + 10}px`,
                                    animationDelay: `${i * 0.1}s`
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        {/* Time Display Skeleton */}
                        <div className="flex justify-between">
                          <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  ) : detailedCall?.callDetails?.recordingUrl ? (
                    <>
                      <AudioPlayer
                        audioUrl={detailedCall.callDetails.recordingUrl}
                        showWaveform={true}
                        onTimeUpdate={(currentTime) => {
                          setCurrentPlaybackTime(currentTime)
                          scrollToCurrentTranscriptLine(currentTime)
                          
                          // Clear manual selection when audio continues playing
                          // This allows highlighting to follow the audio again
                          if (selectedTranscriptIndex !== null) {
                            setSelectedTranscriptIndex(null)
                          }
                        }}
                        onPlay={() => {
                          // Audio started playing
                        }}
                        onPause={() => {
                          // Audio paused - reset user scrolling to allow auto-scroll
                          setIsUserScrolling(false)
                          setShowGoToCurrentCTA(false)
                        }}
                      />
                      
                      {/* Go to Current Line CTA */}
                      {showGoToCurrentCTA && (
                        <div className="mt-3 text-center">
                          <button
                            onClick={handleGoToCurrentLine}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            Go to Current Line
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                      <p>No recording available for this call</p>
                    </div>
                  )}

                  {/* Transcription Content */}
                  <div className="mt-8">
                    {isLoadingCall ? (
                      <div className="space-y-3">
                        {/* Transcript Skeleton */}
                        {Array.from({ length: 8 }).map((_, index) => (
                          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
                            <div className="flex items-start justify-between mb-2">
                              <div className="w-16 h-4 bg-gray-200 rounded"></div>
                              <div className="w-12 h-3 bg-gray-200 rounded"></div>
                            </div>
                            <div className="space-y-2">
                              <div className="w-full h-3 bg-gray-200 rounded"></div>
                              <div className="w-3/4 h-3 bg-gray-200 rounded"></div>
                              <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : detailedCall?.callDetails?.messages && detailedCall.callDetails.messages.length > 0 ? (
                      <div>
                        <div ref={transcriptContainerRef} className="space-y-3 overflow-y-auto">
                          {detailedCall.callDetails.messages.map((message: any, index: number) => {
                            const isAI = message.role === 'bot'
                            const speaker = isAI ? 'Agent' : formatCustomerName(detailedCall.callDetails.name || '')
                            
                            // Format timestamp from secondsFromStart to [MM:SS] format
                            const timestamp = message.secondsFromStart 
                              ? `[${Math.floor(message.secondsFromStart / 60)}:${Math.floor(message.secondsFromStart % 60).toString().padStart(2, '0')}]`
                              : null
                            
                            // Determine if this is the currently active transcript line
                            // Move 3 seconds earlier by subtracting 3 from currentPlaybackTime
                            const adjustedPlaybackTime = Math.max(0, currentPlaybackTime - 3)
                            const messageStart = message.secondsFromStart
                            
                            // Find the message that should be highlighted
                            // We want the message that's closest to the adjusted playback time
                            // This is more reliable than trying to determine "current" message
                            const timeDifference = Math.abs(adjustedPlaybackTime - (messageStart || 0))
                            // Only highlight if this is the closest message to avoid dual highlighting
                            // We'll use a more precise approach to ensure only one message is highlighted
                            const isCurrentLine = timeDifference < 1.0 && timeDifference === Math.min(
                              ...detailedCall.callDetails.messages.map((msg: any) => 
                                Math.abs(adjustedPlaybackTime - (msg.secondsFromStart || 0))
                              )
                            )
                            
                            // Use manually selected index if available, otherwise use current line only
                            // We don't want fallback logic to create multiple highlights
                            const shouldHighlight = selectedTranscriptIndex !== null 
                              ? selectedTranscriptIndex === index 
                              : isCurrentLine
                            
                            return (
                              <div 
                                key={index} 
                                className={`border rounded-lg p-4 transition-colors shadow-sm cursor-pointer relative ${
                                  shouldHighlight 
                                    ? 'bg-purple-100 border-purple-300' 
                                    : 'bg-white border-gray-200 hover:bg-gray-50'
                                }`}
                                onClick={() => {
                                  if (message.secondsFromStart) {
                                    console.log(`🎯 Clicked transcript card ${index}: seeking to ${message.secondsFromStart}s`)
                                    seekToTime(message.secondsFromStart)
                                    
                                    // Ensure audio starts playing immediately after seek
                                    setTimeout(() => {
                                      if (detailedCall?.callDetails?.recordingUrl) {
                                        console.log('🚀 Ensuring audio plays after seek')
                                        window.dispatchEvent(new CustomEvent('ensureAudioPlaying'))
                                      }
                                    }, 150) // Slightly longer delay to ensure seek completes
                                  }
                                  setSelectedTranscriptIndex(index)
                                }}
                                title="Click to jump to this point in audio"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className={`text-sm font-medium ${
                                    isAI 
                                      ? 'text-[#4f45e6]' 
                                      : 'text-green-800'
                                  }`}>
                                    {speaker}
                                  </div>
                                  {timestamp && (
                                    <div className="text-xs text-gray-500">
                                      {timestamp}
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 pb-8">
                                  <p className="text-sm text-gray-900 leading-relaxed">
                                    {message.message}
                                  </p>
                                </div>
                                
                                {/* Mark Issue Button - Bottom Right */}
                                <div className="absolute bottom-3 right-3">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleMarkIssue(message.message, message.secondsFromStart || 0)
                                    }}
                                    className="text-xs text-gray-500 hover:text-gray-700 hover:underline font-medium"
                                  >
                                    Mark issue
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p>No transcription available for this call</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mark Issue Panel */}
        {markIssueData && (
          <div className="w-96 bg-white border-l border-gray-200 transition-all duration-300">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Mark Issue</h2>
                <button 
                  onClick={handleCancelMarkIssue}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              {/* Content */}
              <div className="flex-1 overflow-auto p-6">
                <MarkIssueForm
                  transcriptText={markIssueData.transcriptText}
                  timestamp={markIssueData.timestamp}
                  onSubmit={handleIssueSubmit}
                  onCancel={handleCancelMarkIssue}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
