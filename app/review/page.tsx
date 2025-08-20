"use client"

import React, { useState, useEffect } from 'react'
import { AppShell } from "@/components/app-shell"
import { CallsTable } from "@/components/calls/calls-table"
import AudioPlayer from "@/components/audio/audio-player"
import { MarkIssueDialog } from "@/components/transcript/mark-issue-dialog"
import { fetchCallById } from "@/lib/api"

export default function ReviewPage() {
  const [selectedCall, setSelectedCall] = React.useState<any>(null)
  const [detailedCall, setDetailedCall] = React.useState<any>(null)
  const [isLoadingCall, setIsLoadingCall] = React.useState(false)
  const [currentPlaybackTime, setCurrentPlaybackTime] = React.useState(0)
  const [markIssueDialog, setMarkIssueDialog] = React.useState<{
    open: boolean
    transcriptText: string
    timestamp: number
  }>({
    open: false,
    transcriptText: "",
    timestamp: 0
  })
  const transcriptContainerRef = React.useRef<HTMLDivElement>(null)

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
    const currentMessageIndex = messages.findIndex((msg: any) => 
      msg.secondsFromStart && msg.secondsFromStart >= currentTime
    )
    
    if (currentMessageIndex !== -1) {
      const messageElements = transcriptContainerRef.current.children
      if (messageElements[currentMessageIndex]) {
        messageElements[currentMessageIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      }
    }
  }

  // Function to seek audio to a specific time
  const seekToTime = (seconds: number) => {
    // Dispatch a custom event that the audio player can listen to
    window.dispatchEvent(new CustomEvent('seekAudioToTime', { 
      detail: { time: seconds } 
    }))
    // Update the current playback time to reflect the seek
    setCurrentPlaybackTime(seconds)
  }

  // Function to handle marking issues
  const handleMarkIssue = (transcriptText: string, timestamp: number) => {
    setMarkIssueDialog({
      open: true,
      transcriptText,
      timestamp
    })
  }

  // Function to handle issue submission
  const handleIssueSubmit = (issue: { type: string; description: string; severity: string }) => {
    // Here you would typically save the issue to your backend
    console.log("Issue marked:", {
      callId: selectedCall?.id,
      timestamp: markIssueDialog.timestamp,
      transcriptText: markIssueDialog.transcriptText,
      ...issue
    })
    
    // You could also dispatch an event or call an API here
    // For now, we'll just log it
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

  // Global keyboard shortcuts for audio control
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle spacebar when not typing in input fields
      if (event.code === 'Space' && !(event.target as HTMLElement)?.tagName?.toLowerCase().includes('input')) {
        event.preventDefault()
        
        // Trigger play/pause if we have an audio player
        if (detailedCall?.callDetails?.recordingUrl) {
          // We'll need to expose the audio player's play/pause function
          // For now, we can dispatch a custom event that the audio player can listen to
          window.dispatchEvent(new CustomEvent('toggleAudioPlayPause'))
        }
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [detailedCall?.callDetails?.recordingUrl])

  return (
    <AppShell>
      <div className="flex h-full">
        {/* Central Panel - Call List */}
        <div className="w-[384px] flex flex-col border-r">



          
          {/* Call List */}
          <div className="flex-1 overflow-auto">
            <CallsTable onCallSelect={setSelectedCall} />
          </div>
        </div>

        {/* Right Panel - Call Details */}
        <div className="w-3/5 bg-gray-50 border-l">
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
                  
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center text-sm">
                      <span className="text-gray-900 font-bold w-28 flex-shrink-0">Phone number</span>
                      <span className="text-gray-900">{selectedCall.phoneNumber}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-900 font-bold w-24">Call type</span>
                      <span className={`px-3 py-1.5 text-xs text-center ${selectedCall.callType === 'Inbound' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`} style={{ borderRadius: '8px' }}>
                        {selectedCall.callType}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-900 font-bold w-24">Call length</span>
                      <span className="text-gray-900">{selectedCall.callLength}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-900 font-bold w-24">Timestamp</span>
                      <span className="text-gray-900">{selectedCall.timestamp}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-900 font-bold w-24">Call Priority</span>
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
                {/* Navigation Tabs */}
                <div className="border-b border-gray-200 mb-6">
                  <nav className="flex space-x-8">
                    <button className="border-b-2 border-purple-500 text-purple-600 py-2 px-1 text-sm font-medium">
                      Overview
                    </button>
                    <button className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 py-2 px-1 text-sm font-medium">
                      QC Details
                    </button>
                  </nav>
                </div>

                {/* Combined Call Recording and Transcription Card */}
                <div className="bg-gray-50 border border-gray-300 pt-4 px-6 pb-6 shadow-md" style={{ borderRadius: '16px' }}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-300">Call Recording</h3>
                  
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
                    <AudioPlayer
                      audioUrl={detailedCall.callDetails.recordingUrl}
                      showWaveform={true}
                      onTimeUpdate={(currentTime) => {
                        setCurrentPlaybackTime(currentTime)
                        scrollToCurrentTranscriptLine(currentTime)
                      }}
                      onPlay={() => {
                        // Audio started playing
                      }}
                      onPause={() => {
                        // Audio paused
                      }}
                    />
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
                        {Array.from({ length: 5 }).map((_, index) => (
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
                        <div ref={transcriptContainerRef} className="space-y-3 max-h-96 overflow-y-auto">
                          {detailedCall.callDetails.messages.map((message: any, index: number) => {
                            const isAI = message.role === 'bot'
                            const speaker = isAI ? 'Agent' : formatCustomerName(detailedCall.callDetails.name || '')
                            
                            // Use real timestamp if available, otherwise don't show
                            const timestamp = message.secondsFromStart 
                              ? `[${Math.floor(message.secondsFromStart / 60)}:${Math.floor(message.secondsFromStart % 60).toString().padStart(2, '0')}]`
                              : null
                            
                            const isCurrentLine = message.secondsFromStart && 
                              message.secondsFromStart <= currentPlaybackTime && 
                              (index === detailedCall.callDetails.messages.length - 1 || 
                               !detailedCall.callDetails.messages[index + 1]?.secondsFromStart || 
                               detailedCall.callDetails.messages[index + 1]?.secondsFromStart > currentPlaybackTime)
                            
                            return (
                              <div 
                                key={index} 
                                className={`border rounded-lg p-4 transition-colors shadow-sm cursor-pointer relative ${
                                  isCurrentLine 
                                    ? 'bg-blue-50 border-blue-300' 
                                    : 'bg-white border-gray-200 hover:bg-gray-50'
                                }`}
                                onClick={() => message.secondsFromStart && seekToTime(message.secondsFromStart)}
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
                    ) : detailedCall?.callDetails?.transcript ? (
                      <div>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {detailedCall.callDetails.transcript.split('\n').map((line: string, index: number) => {
                            if (!line.trim()) return null
                            
                            const isAI = line.startsWith('AI:')
                            const isUser = line.startsWith('User:')
                            
                            if (!isAI && !isUser) return null
                            
                            const speaker = isAI ? 'Agent' : formatCustomerName(detailedCall.callDetails.name || '')
                            const message = line.replace(/^(AI|User):\s*/, '')
                            
                            return (
                              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors shadow-sm relative">
                                <div className="flex items-start justify-between mb-2">
                                  <div className={`text-sm font-medium ${
                                    isAI 
                                      ? 'text-[#4f45e6]' 
                                      : 'text-green-800'
                                  }`}>
                                    {speaker}
                                  </div>
                                </div>
                                <div className="flex-1 pb-8">
                                  <p className="text-sm text-gray-900 leading-relaxed">
                                    {message}
                                  </p>
                                </div>
                                
                                {/* Mark Issue Button - Bottom Right */}
                                <div className="absolute bottom-3 right-3">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleMarkIssue(message, 0) // No timestamp for this format
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
      </div>

      {/* Mark Issue Dialog */}
      <MarkIssueDialog
        open={markIssueDialog.open}
        onOpenChange={(open) => setMarkIssueDialog(prev => ({ ...prev, open }))}
        onSubmit={handleIssueSubmit}
        transcriptText={markIssueDialog.transcriptText}
        timestamp={markIssueDialog.timestamp}
      />
    </AppShell>
  )
}
