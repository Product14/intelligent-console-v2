"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MarkIssueDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (issue: { type: string; description: string; severity: string }) => void
  transcriptText: string
  timestamp: number
}

export function MarkIssueDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  transcriptText, 
  timestamp 
}: MarkIssueDialogProps) {
  const [issueType, setIssueType] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [severity, setSeverity] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (issueType && description && severity) {
      onSubmit({
        type: issueType,
        description,
        severity
      })
      // Reset form
      setIssueType("")
      setDescription("")
      setSeverity("")
      onOpenChange(false)
    }
  }

  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Mark Issue</DialogTitle>
          <DialogDescription>
            Report an issue found in this transcript line at {formatTimestamp(timestamp)}s
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transcript-text">Transcript Text</Label>
            <div className="p-3 bg-muted rounded-md text-sm">
              "{transcriptText}"
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="issue-type">Issue Type *</Label>
            <Select value={issueType} onValueChange={setIssueType} required>
              <SelectTrigger>
                <SelectValue placeholder="Select issue type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="accuracy">Accuracy/Incorrect Information</SelectItem>
                <SelectItem value="compliance">Compliance Violation</SelectItem>
                <SelectItem value="quality">Audio Quality</SelectItem>
                <SelectItem value="transcription">Transcription Error</SelectItem>
                <SelectItem value="behavior">Agent Behavior</SelectItem>
                <SelectItem value="process">Process Violation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">Severity *</Label>
            <Select value={severity} onValueChange={setSeverity} required>
              <SelectTrigger>
                <SelectValue placeholder="Select severity level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Minor issue</SelectItem>
                <SelectItem value="medium">Medium - Moderate concern</SelectItem>
                <SelectItem value="high">High - Significant problem</SelectItem>
                <SelectItem value="critical">Critical - Major violation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!issueType || !description || !severity}>
              Mark Issue
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
