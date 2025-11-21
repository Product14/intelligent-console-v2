"use client"

import React from 'react'
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Copy, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAppDispatch, useAppSelector } from "@/store"
import {
  updateCall,
  setIsAssigning,
  setIsUnassigning,
  setClassificationDialogOpen,
} from "@/store/slices/callsSlice"
import {
  setIssuePanelOpen,
} from "@/store/slices/issuesSlice"
import {
  selectIsAssigning,
  selectIsUnassigning,
  selectAudioDuration,
  selectIsDurationLoading,
  selectCurrentCallId,
} from "@/store/selectors/callsSelectors"
import {
  selectIsIssuesPanelOpen,
  selectMarkIssueDraft,
} from "@/store/selectors/issuesSelectors"
import { CallsService, type AssignQCRequest } from "@/services"
import { getCurrentUserId } from "@/lib/auth-utils"
import type { Call } from "@/lib/types"
import type { CallsTableRef } from "@/components/calls/calls-table"

interface CallHeaderProps {
  selectedCall: Call
  callsTableRef?: React.RefObject<CallsTableRef | null> | null
  onQCDone?: () => void
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

const normalizeQcStatus = (status?: string): 'yet_to_start' | 'in_progress' | 'done' | 'completed' => {
  switch (status) {
    case 'done':
    case 'completed':
    case 'in_progress':
    case 'yet_to_start':
      return status
    default:
      return 'in_progress'
  }
}

export function CallHeader({ selectedCall, callsTableRef, onQCDone }: CallHeaderProps) {
  const { toast } = useToast()
  const dispatch = useAppDispatch()
  const isAssigning = useAppSelector(selectIsAssigning)
  const isUnassigning = useAppSelector(selectIsUnassigning)
  const audioDuration = useAppSelector(selectAudioDuration)
  const isDurationLoading = useAppSelector(selectIsDurationLoading)
  const currentCallId = useAppSelector(selectCurrentCallId)
  const showIssuesPanel = useAppSelector(selectIsIssuesPanelOpen)
  const markIssueData = useAppSelector(selectMarkIssueDraft)

  const handleAssignQC = async () => {
    if (!selectedCall?.id) return
    
    dispatch(setIsAssigning(true))
    try {
      const assignRequest: AssignQCRequest = {
        callId: selectedCall.id,
        qcStatus: 'in_progress'
      }
      
      const response = await CallsService.assignQC(assignRequest)
      
      // Check if we have a valid response with message and updatedFields
      if (response.message && response.updatedFields) {
        // Store current user ID for authorization checks
        if (response.updatedFields.qcAssignedTo?.id) {
          localStorage.setItem('qa_dashboard_user_id', response.updatedFields.qcAssignedTo.id)
        }
        
        // Update the selectedCall to reflect the new assignment
        const nextStatus = normalizeQcStatus(response.updatedFields.qcStatus)

        dispatch(updateCall({
          callId: selectedCall.id,
          updates: {
            qcAssignedTo: response.updatedFields.qcAssignedTo,
            qcStatus: nextStatus,
          },
        }))
        
        // Optimistic update - immediately update the calls list to show the avatar
        callsTableRef?.current?.updateCallStatus(
          selectedCall.id,
          nextStatus,
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
  } catch (error: any) {
    console.error('Error assigning QC:', error)
    
    // Extract validation error message if available
    let errorMessage = "An unexpected error occurred. Please try again."
    if (error?.validationErrors && error.validationErrors.length > 0) {
      errorMessage = error.validationErrors[0].rule
    } else if (error?.message) {
      errorMessage = error.message
    }
    
    toast({
      title: "Error Assigning QC",
      description: errorMessage,
      variant: "destructive",
    })
  } finally {
    dispatch(setIsAssigning(false))
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
    dispatch(setClassificationDialogOpen(true))
    
    // Call optional callback if provided
    if (onQCDone) {
      onQCDone()
    }
  }

  const handleUnassign = async () => {
    if (!selectedCall?.id) return
    
    dispatch(setIsUnassigning(true))
    try {
      // Use the same assignQC endpoint but with qcStatus: 'yet_to_start' to unassign
      const unassignRequest: AssignQCRequest = {
        callId: selectedCall.id,
        qcStatus: 'yet_to_start',
        qcAssignedTo: null
      }
      
      const response = await CallsService.assignQC(unassignRequest)
      
      if (response.message && response.updatedFields) {
        toast({
          title: "Unassign Successful",
          description: response.message,
          variant: "default",
        })
        
        // Update the selectedCall to reflect unassignment
        // Note: The API might return qcAssignedTo as null when unassigned
        dispatch(updateCall({
          callId: selectedCall.id,
          updates: {
            qcAssignedTo: null,
            qcStatus: 'yet_to_start',
          },
        }))
        
        // Update the calls table
        callsTableRef?.current?.updateCallStatus(
          selectedCall.id,
          'yet_to_start',
          null
        )
      } else {
        toast({
          title: "Error Unassigning",
          description: "Failed to unassign the call. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error unassigning call:', error)
      toast({
        title: "Error Unassigning",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      dispatch(setIsUnassigning(false))
    }
  }

  return (
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
                onClick={() => dispatch(setIssuePanelOpen(!showIssuesPanel))}
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
                    disabled={isAssigning}
                    
                    className="inline-flex cursor-pointer items-center px-5 py-2 bg-primary text-primary-foreground rounded-sm text-sm font-semibold hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAssigning ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      'Assign Call'
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isAssigning ? 'Assigning call...' : 'Assign Call'}</p>
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
        {/* Only show Unassign button when call is assigned and not completed */}
        {selectedCall.qcAssignedTo !== null && 
         selectedCall.qcStatus !== 'done' && 
         selectedCall.qcStatus !== 'completed' && (
          <div>
            <div className="flex flex-col items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleUnassign}
                      disabled={isUnassigning}
                      className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-sm text-sm font-semibold hover:bg-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUnassigning ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Unassigning...
                        </>
                      ) : (
                        'Unassign'
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isUnassigning ? 'Unassigning call...' : 'Unassign Call'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

