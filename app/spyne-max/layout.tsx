"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  LayoutDashboard, Globe, Warehouse, Tag, Timer, Flame,
  Footprints, TrendingUp, DollarSign, Users,
  PanelLeftClose, PanelLeft,
} from "lucide-react"

const navItems = [
  { href: "/spyne-max", label: "My Desk", icon: LayoutDashboard, exact: true },
  { href: "/spyne-max/market", label: "Market Position", icon: Globe },
  { href: "/spyne-max/inventory", label: "Inventory", icon: Warehouse },
  { href: "/spyne-max/pricing", label: "Pricing", icon: Tag },
  { href: "/spyne-max/recon", label: "Recon Pipeline", icon: Timer },
  { href: "/spyne-max/holding-cost", label: "Holding Cost", icon: Flame },
  { href: "/spyne-max/walks", label: "Lot Walks", icon: Footprints },
  { href: "/spyne-max/leads", label: "Leads & Marketing", icon: TrendingUp },
  { href: "/spyne-max/profitability", label: "Profitability", icon: DollarSign },
  { href: "/spyne-max/team", label: "Team", icon: Users },
]

export default function SpyneMaxLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const SidebarNav = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-0.5 px-3 py-4">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg text-sm font-medium transition-colors",
              collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <AppShell>
      <div className="flex min-h-screen bg-gray-50/30">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            "hidden lg:flex flex-col border-r bg-white shrink-0 sticky top-0 h-screen transition-[width] duration-200",
            collapsed ? "w-[60px]" : "w-[220px]"
          )}
        >
          <div className={cn(
            "flex items-center h-12 border-b px-3",
            collapsed ? "justify-center" : "justify-between"
          )}>
            {!collapsed && (
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Spyne Max
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>
          </div>
          <SidebarNav />
        </aside>

        {/* Mobile sidebar drawer */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-[260px] p-0">
            <div className="flex items-center h-12 border-b px-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Spyne Max
              </span>
            </div>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Main content area */}
        <div className="flex-1 min-w-0">
          <div className="lg:hidden sticky top-0 z-10 border-b bg-white px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => setMobileOpen(true)}
            >
              <PanelLeft className="h-4 w-4" />
              <span className="text-sm">Menu</span>
            </Button>
          </div>
          <div className="px-6 py-6">
            {children}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
