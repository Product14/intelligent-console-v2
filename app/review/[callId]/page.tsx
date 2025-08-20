"use client"

import { notFound } from "next/navigation"
import { useEffect, useState } from "react"
import { AppShell } from "@/components/app-shell"
import { CallDetailView } from "@/components/calls/call-detail-view"
import { fetchCallById, transformCallData } from "@/lib/api"

interface CallDetailPageProps {
  params: {
    callId: string
  }
}

export default function CallDetailPage({ params }: CallDetailPageProps) {
  const [call, setCall] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCall() {
      try {
        setIsLoading(true)
        const callData = await fetchCallById(params.callId)
        if (callData) {
          const transformedCall = transformCallData(callData)
          setCall(transformedCall)
        } else {
          setError('Call not found')
        }
      } catch (err) {
        setError('Failed to load call')
        console.error('Error loading call:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadCall()
  }, [params.callId])

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading call details...</p>
          </div>
        </div>
      </AppShell>
    )
  }

  if (error || !call) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Call not found'}</p>
            <button 
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <CallDetailView call={call} />
    </AppShell>
  )
}
