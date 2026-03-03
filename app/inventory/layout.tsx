"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  Gauge, Rocket, Camera, DollarSign, Target, Globe, MessageSquare, Megaphone,
  PanelLeftClose, PanelLeft,
} from "lucide-react"
import { DemoConsole } from "@/components/inventory/demo-console"
import { ScenarioProvider } from "@/lib/scenario-context"
import type { ScenarioId } from "@/lib/demo-scenarios"

const navItems = [
  { href: "/inventory", label: "Dashboard", icon: Gauge, exact: true },
  { href: "/inventory/acceleration", label: "Acceleration", icon: Rocket },
  { href: "/inventory/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/inventory/media", label: "Media Intel", icon: Camera },
  { href: "/inventory/exposure", label: "Capital Exposure", icon: DollarSign },
  { href: "/inventory/queue", label: "Action Queue", icon: Target },
  { href: "/inventory/website-score", label: "Website Score", icon: Globe },
  { href: "/inventory/chat", label: "AI Chat", icon: MessageSquare },
]

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isVINDetail = /^\/inventory\/[A-Z0-9]{10,}/.test(pathname)
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [activeScenario, setActiveScenario] = React.useState<ScenarioId>("default")

  const SidebarNav = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-1 px-3 py-4">
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
              collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
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
    <ScenarioProvider activeScenario={activeScenario} setActiveScenario={setActiveScenario}>
      <AppShell>
        <div className="flex min-h-screen bg-gray-50/30">
          {/* Desktop sidebar — hidden on VIN detail */}
          {!isVINDetail && (
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
                    Inventory
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
          )}

          {/* Mobile sidebar drawer */}
          {!isVINDetail && (
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetContent side="left" className="w-[260px] p-0">
                <div className="flex items-center h-12 border-b px-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Inventory
                  </span>
                </div>
                <SidebarNav onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>
          )}

          {/* Main content area */}
          <div className="flex-1 min-w-0">
            {/* Mobile toggle button */}
            {!isVINDetail && (
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
            )}

            {isVINDetail ? (
              children
            ) : (
              <div className="px-6 py-6">
                {children}
              </div>
            )}
          </div>
        </div>

        <DemoConsole
          activeScenario={activeScenario}
          onScenarioChange={setActiveScenario}
        />
      </AppShell>
    </ScenarioProvider>
  )
}
