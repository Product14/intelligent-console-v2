"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Max2UiProvider } from "@/components/max-2/max-2-ui-context"
import { Max2SpyneScope } from "@/components/max-2/max2-spyne-scope"
import {
  Max2SidebarRail,
  Max2SidebarRailChildLink,
  Max2SidebarRailDivider,
  Max2SidebarRailNavLink,
} from "@/components/max-2/max2-sidebar-rail"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { cn } from "@/lib/utils"
import { max2Classes, max2Layout, spyneComponentClasses } from "@/lib/design-system/max-2"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"

interface NavChild {
  href: string
  label: string
  /** When true, only this exact path is active (avoids parent path matching a sub-route). */
  exact?: boolean
}

interface NavItem {
  href: string
  label: string
  icon: string
  exact?: boolean
  /** Thin divider above this item (collapsed rail grouping). */
  dividerBefore?: boolean
  children?: NavChild[]
}

const navItems: NavItem[] = [
  { href: "/max-2", label: "Home", icon: "home", exact: true },
  {
    href: "/max-2/studio",
    label: "Studio AI",
    icon: "photo_camera",
    dividerBefore: true,
    children: [
      { href: "/max-2/studio", label: "Overview" },
      { href: "/max-2/studio/add", label: "Add Vehicle" },
      { href: "/max-2/studio/inventory", label: "Active Inventory" },
      { href: "/max-2/studio/media-lot", label: "Media Lot", exact: true },
      { href: "/max-2/studio/media-lot/inventory", label: "Lot Inventory" },
    ],
  },
  { href: "/max-2/marketing", label: "Marketing", icon: "campaign" },
  { href: "/max-2/sales", label: "Sales", icon: "shopping_cart" },
  { href: "/max-2/service", label: "Service", icon: "build" },
  // { href: "/max-2/sourcing", label: "Sourcing", icon: "manage_search" },
  // { href: "/max-2/recon", label: "Inspection & Recon", icon: "fact_check" },
  { href: "/max-2/customers", label: "Customers", icon: "group" },
]

export default function Max2Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  /** Sales + Service + Studio: same chrome (full-width sticky tab strip, body padding inside experience). */
  const isConsoleTabRoute =
    pathname.startsWith("/max-2/sales") ||
    pathname.startsWith("/max-2/service") ||
    pathname.startsWith("/max-2/studio")
  const [collapsed, setCollapsed] = React.useState(isConsoleTabRoute)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  React.useEffect(() => {
    if (isConsoleTabRoute) {
      setCollapsed(true)
    }
  }, [isConsoleTabRoute])
  const [hoveredParent, setHoveredParent] = React.useState<string | null>(null)

  const SidebarNav = ({
    onNavigate,
    railCollapsed,
  }: {
    onNavigate?: () => void
    railCollapsed: boolean
  }) => (
    <div className="flex flex-col gap-0">
      {navItems.map((item) => {
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
        const hasChildren = item.children && item.children.length > 0
        const isExpanded = hasChildren && (hoveredParent === item.href || isActive)

        return (
          <div
            key={item.href}
            onMouseEnter={() => hasChildren && !railCollapsed && setHoveredParent(item.href)}
            onMouseLeave={() => hasChildren && !railCollapsed && setHoveredParent(null)}
          >
            {item.dividerBefore ? <Max2SidebarRailDivider /> : null}
            <Max2SidebarRailNavLink
              href={item.href}
              label={item.label}
              icon={item.icon}
              collapsed={railCollapsed}
              active={isActive}
              onNavigate={onNavigate}
            />

            {hasChildren && !railCollapsed && (
              <div
                className={cn(
                  "overflow-hidden transition-all duration-200 ease-in-out",
                  isExpanded ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <div className={spyneComponentClasses.sidebarRailChildGroup}>
                  {item.children!.map((child) => {
                    const childActive = child.exact
                      ? pathname === child.href
                      : child.href === item.href
                        ? pathname === child.href
                        : pathname.startsWith(child.href)
                    return (
                      <Max2SidebarRailChildLink
                        key={child.href}
                        href={child.href}
                        label={child.label}
                        active={childActive}
                        onNavigate={onNavigate}
                      />
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  return (
    <AppShell>
      <Max2UiProvider
        sidebarCollapsed={collapsed}
        openMobileSidebar={() => setMobileOpen(true)}
      >
        <Max2SpyneScope className="flex min-h-screen min-w-0 w-full bg-max2-shell">
          <Max2SidebarRail
            collapsed={collapsed}
            onToggleCollapsed={() => setCollapsed(!collapsed)}
            headerTitle="Max 2.0"
          >
            <SidebarNav railCollapsed={collapsed} />
          </Max2SidebarRail>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetContent
              side="left"
              className={cn(
                "w-[260px] border-spyne-border bg-spyne-surface p-0",
                max2Classes.spyneScope,
              )}
            >
              <div className="flex h-14 items-center border-b border-spyne-border px-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-spyne-text-secondary">
                  Max 2.0
                </span>
              </div>
              <div className="p-2">
                <SidebarNav railCollapsed={false} onNavigate={() => setMobileOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex-1 min-w-0">
            <div
              className={cn(
                "lg:hidden sticky top-0 z-10 border-b border-spyne-border bg-spyne-surface py-2",
                max2Layout.pageGutterX
              )}
            >
              <Button variant="ghost" size="sm" className="h-10 gap-2 rounded-[8px] px-3 text-sm" onClick={() => setMobileOpen(true)}>
                <MaterialSymbol name="menu" size={20} />
                Menu
              </Button>
            </div>
            <div
              className={cn(
                /* Sales / Service: no horizontal padding here; tab strip is full width; page body pads inside experience */
                isConsoleTabRoute ? "pb-max2-page pt-0" : max2Layout.pagePadding
              )}
            >
              {children}
            </div>
          </div>
        </Max2SpyneScope>
      </Max2UiProvider>
    </AppShell>
  )
}
