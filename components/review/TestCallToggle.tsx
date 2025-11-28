"use client"

import React, { useRef, useEffect } from 'react'
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAppDispatch, useAppSelector } from "@/store"
import {
  setIsUpdatingTestCall,
  setTestCallUpdateError,
  updateTestCallStatus,
} from "@/store/slices/callsSlice"
import {
  selectIsUpdatingTestCall,
  selectTestCallUpdateError,
} from "@/store/selectors/callsSelectors"
import { CallsService } from "@/services"
import type { CallData } from "@/services"

interface TestCallToggleProps {
  callDetails: CallData | null
  selectedCallId: string | null
  isCallCompleted: boolean
}

export function TestCallToggle({
  callDetails,
  selectedCallId,
  isCallCompleted,
}: TestCallToggleProps) {
  const { toast } = useToast()
  const dispatch = useAppDispatch()
  const isUpdatingTestCall = useAppSelector(selectIsUpdatingTestCall)
  const testCallUpdateError = useAppSelector(selectTestCallUpdateError)
  const isUpdatingTestCallRef = useRef<boolean>(false)
  const previousCallIdRef = useRef<string | null>(null)

  // Reset error state when call changes
  useEffect(() => {
    if (previousCallIdRef.current !== null && previousCallIdRef.current !== selectedCallId) {
      // Call has changed, reset error state
      dispatch(setTestCallUpdateError(null))
      dispatch(setIsUpdatingTestCall(false))
      isUpdatingTestCallRef.current = false
    }
    previousCallIdRef.current = selectedCallId
  }, [selectedCallId, dispatch])

  const handleToggleTestCall = async (isTestCall: boolean) => {
    // Prevent multiple clicks - check ref immediately (synchronous)
    if (isUpdatingTestCallRef.current) {
      return
    }
    
    if (!selectedCallId || !callDetails) return
    
    // Set ref immediately to prevent rapid clicks
    isUpdatingTestCallRef.current = true
    dispatch(setIsUpdatingTestCall(true))
    dispatch(setTestCallUpdateError(null))
    
    try {
      const response = await CallsService.updateTestCallStatus(selectedCallId, isTestCall)
      
      if (response.message && response.callId) {
        // Update call details in Redux
        dispatch(updateTestCallStatus(isTestCall))
        
        toast({
          title: "Success",
          description: response.message,
        })
      }
    } catch (error: any) {
      // Handle ApiError from the API client
      let errorMessage = 'Failed to update test call status'
      
      if (error?.message) {
        errorMessage = error.message
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      dispatch(setTestCallUpdateError(errorMessage))
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      isUpdatingTestCallRef.current = false
      dispatch(setIsUpdatingTestCall(false))
    }
  }

  if (!callDetails) {
    return null
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {isCallCompleted ? (
        // Show read-only status for completed calls
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Test Call:</span>
          <Badge variant={callDetails.isTestCall ? "default" : "secondary"}>
            {callDetails.isTestCall ? "Yes" : "No"}
          </Badge>
        </div>
      ) : (
        // Show toggle for non-completed calls
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Test Call</span>
                  <div className="flex items-center gap-2">
                    {isUpdatingTestCall ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <Switch
                        checked={callDetails.isTestCall || false}
                        onCheckedChange={handleToggleTestCall}
                        disabled={isUpdatingTestCall}
                        aria-label="Mark as test call"
                      />
                    )}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {isUpdatingTestCall 
                    ? 'Updating test call status...'
                    : callDetails.isTestCall 
                    ? 'This call is marked as a test call' 
                    : 'Mark this call as a test call'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      {/* {testCallUpdateError && (
        <span className="text-xs text-destructive">{testCallUpdateError}</span>
      )} */}
    </div>
  )
}

