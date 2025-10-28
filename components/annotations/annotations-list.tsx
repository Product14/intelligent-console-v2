"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AnnotationCard } from "./annotation-card"
import { AddAnnotationSheet } from "./add-annotation-sheet"
import { MOCKS } from "@/lib/mocks"

interface AnnotationsListProps {
  callId: string
}

export function AnnotationsList({ callId }: AnnotationsListProps) {
  const [showAddAnnotation, setShowAddAnnotation] = React.useState(false)

  // Get annotations for this call
  const review = MOCKS.reviews.find((r) => r.callId === callId)
  const annotations = review ? MOCKS.annotations.filter((a) => a.reviewId === review.id) : []

  // Removed keyboard shortcut as requested

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {annotations.length} annotation{annotations.length !== 1 ? "s" : ""}
        </span>
        <Button size="sm" onClick={() => setShowAddAnnotation(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Annotation
        </Button>
      </div>

      {annotations.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-muted-foreground">
            <Plus className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p>No annotations yet</p>
            <p className="text-sm">Click the button above to add your first annotation</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {annotations
            .sort((a, b) => a.callTsSec - b.callTsSec)
            .map((annotation) => (
              <AnnotationCard key={annotation.id} annotation={annotation} />
            ))}
        </div>
      )}

      <AddAnnotationSheet open={showAddAnnotation} onOpenChange={setShowAddAnnotation} callId={callId} />
    </div>
  )
}
