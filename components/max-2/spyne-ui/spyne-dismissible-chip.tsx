"use client"

import * as React from "react"
import { X } from "lucide-react"
import type { SpyneChipTone, SpyneChipVariant } from "@/lib/design-system/max-2"
import { SpyneChip } from "./core"

export interface SpyneDismissibleChipProps {
  children: React.ReactNode
  onDismiss: () => void
  variant?: SpyneChipVariant
  tone?: SpyneChipTone
  compact?: boolean
  className?: string
  /** `aria-label` on the button (required for a11y when `children` is not plain text) */
  ariaLabel: string
}

/**
 * Whole chip is a button: click anywhere (including the X) clears the filter / tag.
 */
export function SpyneDismissibleChip({
  children,
  onDismiss,
  variant = "soft",
  tone = "primary",
  compact = false,
  className,
  ariaLabel,
}: SpyneDismissibleChipProps) {
  return (
    <SpyneChip
      as="button"
      type="button"
      variant={variant}
      tone={tone}
      compact={compact}
      className={className}
      onClick={onDismiss}
      trailing={<X className="h-3 w-3 shrink-0" aria-hidden />}
      aria-label={ariaLabel}
    >
      {children}
    </SpyneChip>
  )
}
