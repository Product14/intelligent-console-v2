"use client"

import React, { useMemo } from 'react'
import { Badge } from "@/components/ui/badge"
import { useAppDispatch } from "@/store"
import { setSelectedTranscriptIndex, setActiveTab } from "@/store/slices/issuesSlice"

interface TranscriptMessage {
  role: string
  message: string
  secondsFromStart?: number
  issueCount?: number
}

interface IssueGroup {
  secondsFromStart: number
  transcript: string
  issues: Array<{
    _id: string
    title: string
    severity: 'low' | 'medium' | 'high'
    code?: string
    description?: string
    note?: string
  }>
}

interface TranscriptSectionProps {
  callDetailsStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  callDetails: {
    callDetails?: {
      messages?: TranscriptMessage[]
      name?: string | null
    }
  } | null
  selectedCall: {
    id: string
    customerInitials?: string
    qcAssignedTo?: any
    qcStatus?: string
  } | null
  currentPlaybackTime: number
  markedTranscriptIndices: number[]
  resolvedIssueGroups: IssueGroup[]
  hasLoadedApiIssues: boolean
  isCallCompleted: boolean
  transcriptContainerRef: React.RefObject<HTMLDivElement | null>
  selectedTranscriptIndex: number | null
  seekToTime: (seconds: number) => void
  handleMarkIssue: (transcriptText: string, timestamp: number, transcriptIndex?: number) => void
}

// Helper function to format customer name in proper case
const formatCustomerName = (name: string) => {
  if (!name) return 'Customer'
  return name.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ')
}

export const TranscriptSection: React.FC<TranscriptSectionProps> = ({
  callDetailsStatus,
  callDetails,
  selectedCall,
  currentPlaybackTime,
  markedTranscriptIndices,
  resolvedIssueGroups,
  hasLoadedApiIssues,
  isCallCompleted,
  transcriptContainerRef,
  selectedTranscriptIndex,
  seekToTime,
  handleMarkIssue,
}) => {
  const dispatch = useAppDispatch()

  const markedTranscriptSet = useMemo(() => new Set(markedTranscriptIndices), [markedTranscriptIndices])

  return (
    <div className="flex-1 flex flex-col min-h-0 mt-4">
      {callDetailsStatus === 'loading' ? (
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
      ) : callDetails?.callDetails?.messages && callDetails.callDetails.messages.length > 0 ? (
        <div className="flex flex-col flex-1 min-h-0">
          <h4 className="text-[15px] font-semibold text-foreground mb-3 px-4 lg:px-6 flex-shrink-0">Transcript</h4>
          <div ref={transcriptContainerRef} className="space-y-2 pb-6 overflow-y-auto max-h-[calc(100vh-400px)] px-4 lg:px-6  scrollbar-thin scrollbar-thumb-muted-foreground/20  scrollbar-track-transparent">
            {(callDetails.callDetails?.messages ?? []).map((message: any, index: number) => {
              const isAI = message.role === 'bot'
              const speaker = isAI ? 'Agent' : formatCustomerName(callDetails.callDetails?.name || '')
              
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
                const nextMessageStart = callDetails.callDetails?.messages?.[index + 1]?.secondsFromStart ?? Infinity
                // Use exact timing for precise highlighting
                isCurrentLine = adjustedPlaybackTime >= messageStart && adjustedPlaybackTime < nextMessageStart
              }
              
              const shouldHighlight = selectedTranscriptIndex !== null 
                ? selectedTranscriptIndex === index 
                : isCurrentLine
              
              const hasIssue = markedTranscriptSet.has(index)
              
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
                    // Use the actual timestamp from the message instead of estimating
                    const timestamp = message.secondsFromStart || 0;
                    
                    seekToTime(timestamp);
                    dispatch(setSelectedTranscriptIndex(index));
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
                        const transcriptIssues = resolvedIssueGroups.filter(group => 
                          Math.abs(group.secondsFromStart - (message.secondsFromStart || 0)) < 1
                        )
                        
                        const totalIssuesAtTimestamp = transcriptIssues.reduce((total, group) => total + group.issues.length, 0)
                        
                        // Check if API data is loaded (use hasLoadedApiIssues from above)
                        if (hasLoadedApiIssues && totalIssuesAtTimestamp > 0) {
                          const highSeverityCount = transcriptIssues.reduce((total, group) => 
                            total + group.issues.filter(issue => issue.severity === 'high').length, 0
                          )
                          
                          return (
                            <div className="flex items-center gap-1">
                              {isCallCompleted ? (
                                // Enhanced view for completed calls
                                <div className="flex flex-col items-end gap-1">
                                  <Badge 
                                    variant={highSeverityCount > 0 ? "destructive" : "default"} 
                                    className="text-xs px-1.5 py-0.5 h-5 min-w-5 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      dispatch(setActiveTab('previous-issues'))
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
                                    setTimeout(() => dispatch(setActiveTab('previous-issues')), 100)
                                  }}
                                  title={`Click to view ${totalIssuesAtTimestamp} issue${totalIssuesAtTimestamp > 1 ? 's' : ''} for this transcript`}
                                >
                                  {totalIssuesAtTimestamp}
                                </Badge>
                              )}
                            </div>
                          )
                        }
                        
                        // Fallback to issueCount only if API issues are not loaded yet
                        if (!hasLoadedApiIssues && issueCount > 0) {
                          return (
                            <Badge 
                              variant="destructive" 
                              className="text-xs px-1.5 py-0.5 h-5 min-w-5 flex items-center justify-center cursor-pointer hover:bg-destructive/80 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (!isCallCompleted) {
                                  handleMarkIssue(message.message, message.secondsFromStart || 0, index)
                                }
                                setTimeout(() => dispatch(setActiveTab('previous-issues')), 100)
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
                        const transcriptIssues = resolvedIssueGroups.filter(group => 
                          Math.abs(group.secondsFromStart - (message.secondsFromStart || 0)) < 1
                        )
                        const totalIssuesAtTimestamp = transcriptIssues.reduce((total, group) => total + group.issues.length, 0)
                        // Use hasLoadedApiIssues to determine which source to use
                        const hasIssues = hasLoadedApiIssues
                          ? totalIssuesAtTimestamp > 0
                          : issueCount > 0
                        
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
                              {isCallCompleted ? "View marked issues" : hasIssues ? 'Mark more issues' : 'Mark issue'}
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
  )
}

