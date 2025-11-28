"use client";

import React from "react";
import { CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectIsClassificationDialogOpen } from "@/store/selectors/callsSelectors";
import {
  setClassificationDialogOpen,
  setSelectedClassification as setSelectedClassificationAction,
} from "@/store/slices/callsSlice";

interface ClassificationDialogProps {
  onSubmit: () => void | Promise<void>;
  selectedClassification: string;
}

export function ClassificationDialog({
  onSubmit,
  selectedClassification,
}: ClassificationDialogProps) {
  const dispatch = useAppDispatch();
  const showClassificationDialog = useAppSelector(
    selectIsClassificationDialogOpen
  );

  const classifications = ["Excellent", "Good", "Average", "Poor"];

  const handleSubmit = async () => {
    await onSubmit();
  };

  return (
    <Dialog
      open={showClassificationDialog}
      onOpenChange={(open) => {
        dispatch(setClassificationDialogOpen(open));
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Classify Call Quality</DialogTitle>
          <DialogDescription>
            Please classify this call before marking it as completed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {classifications.map((classification) => (
            <button
              key={classification}
              onClick={() =>
                dispatch(setSelectedClassificationAction(classification))
              }
              className={`w-full px-4 py-3 text-left rounded-lg border-2 transition-all ${
                selectedClassification === classification
                  ? "border-primary bg-primary/10 font-semibold"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">{classification}</span>
                {selectedClassification === classification && (
                  <CheckCircle className="h-5 w-5 text-primary" />
                )}
              </div>
            </button>
          ))}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              dispatch(setClassificationDialogOpen(false));
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedClassification}>
            Mark Completed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
