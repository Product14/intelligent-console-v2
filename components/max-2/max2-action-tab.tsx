"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { spyneComponentClasses } from "@/lib/design-system/max-2"

export type Max2ActionTabProps = {
  icon: React.ReactNode
  title: string
  count: number
  selected?: boolean
  onClick?: () => void
  className?: string
}

/**
 * Single “action required” tab: icon, heading, then “N vehicles →”.
 * Icon slot: use `<MaterialSymbol name="…" size={24} />` (Max 2 default icon system).
 * Styles are defined under `.max2-spyne` in `app/globals.css` (see design-system/max-2.md).
 */
export function Max2ActionTab({
  icon,
  title,
  count,
  selected,
  onClick,
  className,
}: Max2ActionTabProps) {
  const vehicleLabel = count === 1 ? "vehicle" : "vehicles"
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className={cn(
        spyneComponentClasses.actionTab,
        selected && spyneComponentClasses.actionTabSelected,
        className,
      )}
    >
      <span className={spyneComponentClasses.actionTabIcon}>{icon}</span>
      <span className={spyneComponentClasses.actionTabTitle}>{title}</span>
      <span className={spyneComponentClasses.actionTabCount}>
        {count} {vehicleLabel} →
      </span>
    </button>
  )
}

export type Max2ActionTabStripProps = {
  children: React.ReactNode
  className?: string
}

export function Max2ActionTabStrip({ children, className }: Max2ActionTabStripProps) {
  return (
    <div role="tablist" className={cn(spyneComponentClasses.actionTabStrip, className)}>
      {children}
    </div>
  )
}
