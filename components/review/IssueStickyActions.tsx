import React from "react";
import { Loader2 } from "lucide-react";
import { useAppSelector } from "@/store";
import { selectMarkIssueStatus } from "@/store/selectors/issuesSelectors";

interface IssueStickyActionsProps {
  activeTab: string;
  isFormValid: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export function IssueStickyActions({
  activeTab,
  isFormValid,
  onCancel,
  onSubmit,
}: IssueStickyActionsProps) {
  // Get mark issue status from Redux
  const markIssueStatus = useAppSelector(selectMarkIssueStatus);
  const isSubmitting = markIssueStatus === "loading";
  const isSubmitted = markIssueStatus === "succeeded";

  // Only show for New Issue tab
  if (activeTab !== "new-issue") {
    return null;
  }

  return (
    <div className="flex-shrink-0 p-4 lg:p-6 border-t border-border bg-card sticky bottom-0">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-3 lg:px-4 py-2 text-sm font-medium text-foreground border border-input bg-background hover:bg-muted rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!isFormValid || isSubmitting || isSubmitted}
          className="flex-1 px-3 lg:px-4 py-2 text-sm font-medium cursor-pointer text-primary-foreground bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : isSubmitted ? (
            <>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Submitted
            </>
          ) : (
            "Mark Issue"
          )}
        </button>
      </div>
    </div>
  );
}

