"use client"

import React, { PropsWithChildren, useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { CallsService } from "@/services"
import { useToast } from "@/hooks/use-toast"

interface DeleteIssueDialogProps extends PropsWithChildren {
  callId: string | null
  issueId: string
  issueTitle?: string
  onDeleted?: () => Promise<void> | void
}

export function DeleteIssueDialog({
  callId,
  issueId,
  issueTitle,
  onDeleted,
  children,
}: DeleteIssueDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirmDelete = async () => {
    if (!callId || !issueId) {
      setOpen(false)
      return
    }

    setIsDeleting(true)

    try {
      await CallsService.deleteCallIssue({
        callId,
        id: issueId,
      })

      toast({
        title: "Issue Deleted",
        description: issueTitle ? `"${issueTitle}" was deleted.` : "Issue deleted successfully.",
      })

      if (onDeleted) {
        await onDeleted()
      }
    } catch (error) {
      console.error("Error deleting issue:", error)
      toast({
        title: "Error",
        description: "Failed to delete issue.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setOpen(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => !isDeleting && setOpen(next)}>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete issue?</AlertDialogTitle>
          <AlertDialogDescription>
            {issueTitle
              ? `Are you sure you want to delete "${issueTitle}"? This action cannot be undone.`
              : "Are you sure you want to delete this issue? This action cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}


