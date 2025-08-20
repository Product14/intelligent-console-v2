"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock } from "lucide-react"
import { fetchCalls, transformCallData } from "@/lib/api"
import { dummyCalls } from "@/lib/dummyCalls"

interface TransformedCall {
  id: string
  customerName: string
  customerInitials: string
  phoneNumber: string
  callType: string
  callLength: string
  timestamp: string
  callPriority: string
  status: string
  recordingUrl?: string
  transcript: Array<{
    speaker: string
    timestamp: string
    text: string
  }>
  aiScore: number
  sentiment: string
  intent: string
  actionItems: string[]
}

interface CallsTableProps {
  onCallSelect?: (call: TransformedCall) => void
}

export function CallsTable({ onCallSelect }: CallsTableProps) {
  const [calls, setCalls] = React.useState<TransformedCall[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [selectedCallId, setSelectedCallId] = React.useState<string | null>(null)

  // Fetch calls from API
  React.useEffect(() => {
    const loadCalls = async () => {
      try {
        setIsLoading(true)
        const response = await fetchCalls(20) // Get last 20 calls
        const transformedCalls = response.data.map(transformCallData)
        setCalls(transformedCalls)
      } catch (error) {
        console.error('Error loading calls:', error)
        // Fallback to dummy data if API fails
        setCalls(dummyCalls)
      } finally {
        setIsLoading(false)
      }
    }

    loadCalls()
  }, [])

  // Auto-select first contact on first load
  React.useEffect(() => {
    if (calls.length > 0 && !selectedCallId) {
      const firstCall = calls[0]
      setSelectedCallId(firstCall.id)
      onCallSelect?.(firstCall)
    }
  }, [calls, selectedCallId, onCallSelect])

  const getReviewStatusBadge = (status: string) => {
    switch (status) {
      case 'Pass':
        return <Badge variant="default" className="bg-green-100 text-green-800 text-xs">Pass</Badge>
      case 'Fail':
        return <Badge variant="destructive" className="text-xs">Fail</Badge>
      case 'In Progress':
        return <Badge variant="secondary" className="text-xs">In Progress</Badge>
      default:
        return <Badge variant="outline" className="text-xs">Unreviewed</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-3">
            <Skeleton className="h-10 w-10 rounded-full bg-gray-300" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[200px] bg-gray-300" />
              <Skeleton className="h-3 w-[150px] bg-gray-300" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (calls.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No calls found</h3>
        <p className="mt-1 text-sm text-gray-500">No calls are available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {calls.map((call) => {
        const isSelected = selectedCallId === call.id

        return (
          <div
            key={call.id}
            className={`flex items-center space-x-4 p-4 cursor-pointer transition-colors ${
              isSelected 
                ? "bg-purple-50 border-r-2 border-purple-500" 
                : "hover:bg-gray-50"
            }`}
            onClick={() => {
              setSelectedCallId(call.id)
              onCallSelect?.(call)
            }}
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-purple-100 text-purple-600">
                {call.customerInitials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {call.customerName}
                </h3>
                {getReviewStatusBadge(call.status)}
              </div>
              
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {call.callLength}
                </div>
                <div className="text-xs text-gray-500">
                  {call.timestamp}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
