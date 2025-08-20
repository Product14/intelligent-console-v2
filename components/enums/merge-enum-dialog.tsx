"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Merge, AlertTriangle, Info } from "lucide-react"
import { MOCKS, getSeverityColor } from "@/lib/mocks"
import { toast } from "@/hooks/use-toast"
import type { QAEnum } from "@/lib/types"

interface MergeEnumDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sourceEnum: QAEnum
}

export function MergeEnumDialog({ open, onOpenChange, sourceEnum }: MergeEnumDialogProps) {
  const [targetEnumId, setTargetEnumId] = React.useState("")
  const [note, setNote] = React.useState("")

  // Get available target enums (excluding the source enum)
  const availableTargets = MOCKS.enums.filter((e) => e.id !== sourceEnum.id && e.isActive)

  const targetEnum = availableTargets.find((e) => e.id === targetEnumId)

  // Check if severities are different
  const hasSeverityMismatch = targetEnum && targetEnum.defaultSeverity !== sourceEnum.defaultSeverity

  // Get usage statistics for the source enum
  const sourceUsage = React.useMemo(() => {
    const annotations = MOCKS.annotations.filter((a) => a.enumId === sourceEnum.id)
    const occurrences = MOCKS.occurrences.filter((o) => o.enumId === sourceEnum.id)
    return {
      annotationCount: annotations.length,
      occurrenceCount: occurrences.length,
    }
  }, [sourceEnum.id])

  const handleMerge = () => {
    if (!targetEnum) {
      toast({
        title: "Error",
        description: "Please select a target enum to merge into",
        variant: "destructive",
      })
      return
    }

    // In a real app, this would:
    // 1. Update all annotations to point to the target enum
    // 2. Update all occurrences to point to the target enum
    // 3. Create a resolution record for the source enum
    // 4. Deactivate or delete the source enum
    console.log("Merging enum:", {
      sourceEnumId: sourceEnum.id,
      targetEnumId: targetEnum.id,
      note: note || undefined,
      sourceUsage,
    })

    toast({
      title: "Enum merged successfully",
      description: `${sourceEnum.code} has been merged into ${targetEnum.code}. All references have been updated.`,
    })

    onOpenChange(false)
  }

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setTargetEnumId("")
      setNote("")
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Merge className="h-5 w-5" />
            Merge Enum
          </DialogTitle>
          <DialogDescription>
            Merge this enum into another enum. All annotations and occurrences will be transferred to the target enum.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Source Enum Info */}
          <div className="space-y-2">
            <Label>Source Enum (will be merged)</Label>
            <div className="p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="font-mono">
                  {sourceEnum.code}
                </Badge>
                <Badge className={getSeverityColor(sourceEnum.severity)}>{sourceEnum.severity}</Badge>
              </div>
              <div className="text-sm font-medium">{sourceEnum.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{sourceEnum.description}</div>
              <div className="text-xs text-muted-foreground mt-2">
                Usage: {sourceUsage.annotationCount} annotations, {sourceUsage.occurrenceCount} occurrences
              </div>
            </div>
          </div>

          {/* Target Enum Selection */}
          <div className="space-y-2">
            <Label htmlFor="target">Target Enum (merge into) *</Label>
            <Select value={targetEnumId} onValueChange={setTargetEnumId}>
              <SelectTrigger>
                <SelectValue placeholder="Select target enum..." />
              </SelectTrigger>
              <SelectContent>
                {availableTargets.map((enum_) => (
                  <SelectItem key={enum_.id} value={enum_.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{enum_.code}</span>
                                      <Badge className={getSeverityColor(enum_.severity)} variant="outline">
                  {enum_.severity}
                </Badge>
                      <span className="text-muted-foreground">- {enum_.title}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Enum Preview */}
          {targetEnum && (
            <div className="space-y-2">
              <Label>Target Enum Preview</Label>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="font-mono">
                    {targetEnum.code}
                  </Badge>
                  <Badge className={getSeverityColor(targetEnum.severity)}>{targetEnum.severity}</Badge>
                </div>
                <div className="text-sm font-medium">{targetEnum.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{targetEnum.description}</div>
              </div>
            </div>
          )}

          {/* Severity Mismatch Warning */}
          {hasSeverityMismatch && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Severity Mismatch:</strong> The source enum has{" "}
                <Badge className={getSeverityColor(sourceEnum.severity)} variant="outline">
                  {sourceEnum.severity}
                </Badge>{" "}
                severity while the target has{" "}
                <Badge className={getSeverityColor(targetEnum.severity)} variant="outline">
                  {targetEnum.severity}
                </Badge>
                . Existing annotations will keep their current severity, but new annotations will use the target's
                default severity.
              </AlertDescription>
            </Alert>
          )}

          {/* Info about merge process */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>What happens during merge:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>All {sourceUsage.annotationCount} annotations will be transferred to the target enum</li>
                <li>All {sourceUsage.occurrenceCount} occurrences will be transferred to the target enum</li>
                <li>The source enum will be deactivated and marked as merged</li>
                <li>A resolution record will be created for audit purposes</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Merge Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Merge Note (Optional)</Label>
            <Textarea
              id="note"
              placeholder="Reason for merging or additional context..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleMerge} disabled={!targetEnum} variant="destructive">
            <Merge className="h-4 w-4 mr-2" />
            Merge Enums
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
