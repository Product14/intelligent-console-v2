"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatTimestamp } from "@/lib/mocks"
import type { Call } from "@/lib/types"

interface TranscriptViewProps {
  transcript?: Call["transcript"]
  callId: string
  currentTime?: number
  onMarkIssue?: (transcriptText: string, timestamp: number) => void
}

export function TranscriptView({ transcript, callId, currentTime = 0, onMarkIssue }: TranscriptViewProps) {
  // Remove local currentTime state - use prop from parent

  // Group words into sentences for better readability
  const sentences = React.useMemo(() => {
    if (!transcript || !transcript.items.length) {
      return []
    }

    const words = transcript.items
    const grouped: { startTime: number; endTime: number; text: string; words: typeof words }[] = []

    let currentSentence: typeof words = []
    let sentenceStart = 0

    words.forEach((word, index) => {
      if (currentSentence.length === 0) {
        sentenceStart = word.t
      }

      currentSentence.push(word)

      // End sentence on punctuation or every 10-15 words
      const isEndOfSentence = word.word.match(/[.!?]/) || currentSentence.length >= 12
      const isLastWord = index === words.length - 1

      if (isEndOfSentence || isLastWord) {
        grouped.push({
          startTime: sentenceStart,
          endTime: word.t + 0.5,
          text: currentSentence.map((w) => w.word).join(" "),
          words: [...currentSentence],
        })
        currentSentence = []
      }
    })

    return grouped
  }, [transcript])

  const handleWordClick = (timestamp: number) => {
    // Move 1 second earlier by subtracting 1 from timestamp
    const adjustedTimestamp = Math.max(0, timestamp - 1)
    // Only dispatch seek event to audio player - don't manage local state
    window.dispatchEvent(new CustomEvent('seekAudioToTime', { 
      detail: { time: adjustedTimestamp } 
    }))
    console.log(`Seeking to ${adjustedTimestamp}s (adjusted from ${timestamp}s)`)
  }

  const handleMarkIssue = (transcriptText: string, timestamp: number) => {
    if (onMarkIssue) {
      onMarkIssue(transcriptText, timestamp)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="space-y-4">
          {!transcript || !transcript.items.length ? (
            <div className="text-muted-foreground">
              <p>No transcript available for this call</p>
            </div>
          ) : (
            sentences.map((sentence, index) => {
              const isCurrentSentence = currentTime >= sentence.startTime && currentTime <= sentence.endTime

              return (
                <div
                  key={index}
                  className={cn(
                    "flex flex-col gap-3 p-4 rounded-lg transition-colors cursor-pointer",
                    isCurrentSentence ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50",
                  )}
                  onClick={() => handleWordClick(sentence.startTime)}
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-16">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs font-mono text-muted-foreground"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleWordClick(sentence.startTime)
                        }}
                      >
                        {formatTimestamp(sentence.startTime)}
                      </Button>
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <div className="w-[90%]">
                        <p className={cn("text-sm leading-relaxed", isCurrentSentence && "font-medium")}>
                          {sentence.words.map((word, wordIndex) => (
                            <span
                              key={wordIndex}
                              className={cn(
                                "cursor-pointer hover:bg-yellow-200 dark:hover:bg-yellow-900 px-0.5 rounded",
                                Math.abs(currentTime - word.t) < 1 && "bg-yellow-100 dark:bg-yellow-900",
                              )}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleWordClick(word.t)
                              }}
                            >
                              {word.word}
                              {wordIndex < sentence.words.length - 1 && " "}
                            </span>
                          ))}
                        </p>
                      </div>
                      
                      {/* Mark Issue Button - Same Line, Right Side */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMarkIssue(sentence.text, sentence.startTime)
                        }}
                        className="text-xs font-medium ml-2 whitespace-nowrap"
                      >
                        Mark Issue
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </Card>

      <div className="text-xs text-muted-foreground text-center">
        Click on any word or timestamp to seek to that position in the audio
      </div>

      {/* Mark Issue Dialog - Only show if no callback provided */}
      {/* This section is removed as per the edit hint */}
    </div>
  )
}
