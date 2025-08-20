"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Building, User, Clock } from "lucide-react"
import Link from "next/link"
import AudioPlayer from "@/components/audio/audio-player"
import { AnnotationsList } from "@/components/annotations/annotations-list"
import { ReviewSummaryCard } from "@/components/calls/review-summary-card"
import { formatDuration } from "@/lib/mocks"

interface CallDetailViewProps {
  call: any // Using any for now since it's the transformed API data
}

export function CallDetailView({ call }: CallDetailViewProps) {
  // Extract data from the transformed API call
  const agentName = call.customerName || 'Unknown Agent'
  const agentType = call.callType || 'Unknown'
  const dealershipName = 'Dealership' // This might need to come from a different API call
  const customerPhone = call.phoneNumber || 'No phone'
  const startedAt = call.timestamp || 'Unknown time'
  const duration = call.duration || 0

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/review">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Calls
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">Call {call.id}</h1>
              <Badge variant={agentType === "Inbound" ? "default" : "secondary"}>{agentType}</Badge>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground mt-1">
              <div className="flex items-center gap-1">
                <Building className="h-3 w-3" />
                {dealershipName}
              </div>
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {agentName}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {startedAt}
              </div>
              <span>Duration: {formatDuration(duration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-5 h-full">
          {/* Left Panel - Audio & Waveform */}
          <div className="border-r bg-card lg:col-span-2">
            <div className="p-6 h-full flex flex-col">
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Audio Recording</h2>
                <p className="text-sm text-muted-foreground">Customer: {customerPhone}</p>
              </div>

              <div className="flex-1">
                {call.recordingUrl ? (
                  <AudioPlayer 
                    audioUrl={call.recordingUrl} 
                    showWaveform={true}
                    onTimeUpdate={(time) => {
                      // Handle time updates if needed
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
              </div>
            </div>
          </div>

          {/* Right Panel - Transcript & Annotations */}
          <div className="flex flex-col h-full lg:col-span-1">
            <div className="flex-1 overflow-auto">
              <div className="p-6">
                <div className="space-y-6">
                  {/* Transcript */}
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Transcript</h2>
                    {call.rawTranscript ? (
                      <div className="space-y-3">
                        {call.rawTranscript.split('\n').map((line: string, index: number) => (
                          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                            <p className="text-sm text-gray-900">{line}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No transcript available</p>
                    )}
                  </div>

                  <Separator />

                  {/* Annotations */}
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Annotations</h2>
                    <AnnotationsList callId={call.id} />
                  </div>
                </div>
              </div>
            </div>

            {/* Review Summary - Fixed at bottom */}
            <div className="border-t bg-card p-6">
              <ReviewSummaryCard callId={call.id} review={null} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
