"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface InlineAudioPlayerProps {
  recordingUrl: string
  callId: string
  isPlaying: boolean
  onPlayPause: (callId: string) => void
}

const formatSeconds = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function InlineAudioPlayer({ 
  recordingUrl, 
  callId, 
  isPlaying, 
  onPlayPause 
}: InlineAudioPlayerProps) {
  const { toast } = useToast()
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const isDraggingRef = useRef(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const progressBarRef = useRef<HTMLDivElement | null>(null)
  const shouldPlayRef = useRef(false)

  // Store callbacks in refs to avoid recreating audio element
  const onPlayPauseRef = useRef(onPlayPause)
  const callIdRef = useRef(callId)
  
  useEffect(() => {
    onPlayPauseRef.current = onPlayPause
    callIdRef.current = callId
  }, [onPlayPause, callId])

  // Initialize audio element
  useEffect(() => {
    if (!recordingUrl) return

    const audio = new Audio(recordingUrl)
    audioRef.current = audio
    shouldPlayRef.current = false // Reset on new audio

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0)
      // If we should be playing, try to play now that metadata is loaded
      if (shouldPlayRef.current && audio.paused) {
        audio.play().catch((error) => {
          // Silently handle autoplay policy errors on initial load
          if (error.name !== 'NotAllowedError') {
            console.error('Error playing audio after metadata load:', error)
            toast({
              title: "Playback Error",
              description: "Failed to play audio.",
              variant: "destructive",
            })
            onPlayPauseRef.current(callIdRef.current)
          }
        })
      }
    }

    const handleTimeUpdate = () => {
      if (!isDraggingRef.current) {
        setCurrentTime(audio.currentTime)
      }
    }

    const handleEnded = () => {
      setCurrentTime(0)
      shouldPlayRef.current = false
      onPlayPauseRef.current(callIdRef.current)
    }

    const handleError = () => {
      toast({
        title: "Audio Error",
        description: "Failed to load audio file.",
        variant: "destructive",
      })
      shouldPlayRef.current = false
      onPlayPauseRef.current(callIdRef.current)
    }

    // Handle audio metadata loaded
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)

    // Handle time update
    audio.addEventListener('timeupdate', handleTimeUpdate)

    // Handle audio end
    audio.addEventListener('ended', handleEnded)

    // Handle audio error
    audio.addEventListener('error', handleError)

    // Load duration if already loaded
    if (audio.readyState >= 1) {
      setDuration(audio.duration || 0)
    }

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.pause()
      audio.src = ''
      audioRef.current = null
      shouldPlayRef.current = false
    }
  }, [recordingUrl, toast])

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      shouldPlayRef.current = true
      
      // Only attempt to play if audio has loaded metadata
      // readyState 0 = HAVE_NOTHING, 1 = HAVE_METADATA, 2 = HAVE_CURRENT_DATA, 3 = HAVE_FUTURE_DATA, 4 = HAVE_ENOUGH_DATA
      if (audio.readyState >= 1) {
        // Only attempt to play if not already playing to avoid unnecessary errors
        if (audio.paused) {
          audio.play().catch((error) => {
            // Silently handle autoplay policy errors - these are expected on page load
            // Only show error if it's a user-initiated play action
            if (error.name !== 'NotAllowedError') {
              console.error('Error playing audio:', error)
              toast({
                title: "Playback Error",
                description: "Failed to play audio.",
                variant: "destructive",
              })
              shouldPlayRef.current = false
              onPlayPauseRef.current(callIdRef.current)
            } else {
              // For autoplay policy errors, just update the state
              shouldPlayRef.current = false
              onPlayPauseRef.current(callIdRef.current)
            }
          })
        }
      }
      // If audio not ready yet, shouldPlayRef is set and will be handled in loadedmetadata
    } else {
      shouldPlayRef.current = false
      if (!audio.paused) {
        audio.pause()
      }
    }
  }, [isPlaying, toast])

  // Handle global mouse move for dragging
  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const progressBar = progressBarRef.current
      if (!progressBar) return

      const rect = progressBar.getBoundingClientRect()
      const dragX = e.clientX - rect.left
      const width = rect.width
      if (!duration) return

      const dragPercentage = Math.max(0, Math.min(1, dragX / width))
      const seekTime = dragPercentage * duration

      setCurrentTime(seekTime)
    }

    const handleMouseUp = () => {
      const audio = audioRef.current
      if (audio && currentTime !== undefined) {
        audio.currentTime = currentTime
      }
      setIsDragging(false)
      isDraggingRef.current = false
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, duration, currentTime])

  const handleSeek = (seekTime: number) => {
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = seekTime
      setCurrentTime(seekTime)
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging || !duration) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const width = rect.width
    const clickPercentage = Math.max(0, Math.min(1, clickX / width))
    const seekTime = clickPercentage * duration

    handleSeek(seekTime)
  }

  const handleProgressDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    isDraggingRef.current = true

    const progressBar = progressBarRef.current
    if (!progressBar || !duration) return

    const rect = progressBar.getBoundingClientRect()
    const dragX = e.clientX - rect.left
    const width = rect.width
    const dragPercentage = Math.max(0, Math.min(1, dragX / width))
    const seekTime = dragPercentage * duration

    setCurrentTime(seekTime)
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="flex items-center gap-2 min-w-[200px]">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 hover:bg-primary/10 flex-shrink-0"
        onClick={(e) => {
          e.stopPropagation()
          onPlayPause(callId)
        }}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatSeconds(Math.floor(currentTime))}
          </span>
          <div
            ref={progressBarRef}
            className="relative h-1.5 flex-1 cursor-pointer bg-secondary rounded-full overflow-hidden"
            onClick={(e) => {
              e.stopPropagation()
              handleProgressClick(e)
            }}
            onMouseDown={(e) => {
              e.stopPropagation()
              handleProgressDragStart(e)
            }}
          >
            <div
              className="absolute left-0 top-0 h-full bg-primary transition-all duration-100"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {duration ? formatSeconds(Math.floor(duration)) : '--:--'}
          </span>
        </div>
      </div>
    </div>
  )
}

