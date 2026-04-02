"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  LayoutDashboard, Search, Timer, Camera, Megaphone, ShoppingCart, Wrench,
  PanelLeftClose, PanelLeft, Car, Users,
  ChevronDown, Gauge, Crosshair, Crown, Zap, BrainCircuit,
} from "lucide-react"

const navItems = [
  { href: "/max-2", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/max-2/sourcing", label: "Sourcing", icon: Search },
  { href: "/max-2/recon", label: "Inspection & Recon", icon: Timer },
  { href: "/max-2/studio", label: "Merchandising", icon: Camera },
  { href: "/max-2/marketing", label: "Marketing", icon: Megaphone },
  { href: "/max-2/sales", label: "Sales", icon: ShoppingCart },
  { href: "/max-2/service", label: "Service", icon: Wrench },
  { href: "/max-2/lot-view", label: "Lot View", icon: Car },
  { href: "/max-2/customers", label: "Customers", icon: Users },
]

const PRODUCTS = [
  { name: "Spyne Velocity", href: "/inventory",  icon: Gauge },
  { name: "Spyne X",        href: "/spyne-x",   icon: Crosshair },
  { name: "Spyne Max",      href: "/spyne-max",  icon: Crown },
  { name: "Max 2.0",        href: "/max-2",      icon: Zap },
  { name: "Velocity 2.0",   href: "/velocity-2", icon: BrainCircuit },
]

export default function Max2Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [productOpen, setProductOpen] = React.useState(false)

  const SidebarNav = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-0.5 px-3 py-4">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
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
    <div className="flex min-h-screen bg-gray-50/30">
        <aside className={cn(
          "hidden lg:flex flex-col border-r bg-white shrink-0 sticky top-0 h-screen transition-[width] duration-200",
          collapsed ? "w-[60px]" : "w-[220px]"
        )}>
          {/* Row 1: product switcher + collapse toggle */}
          <div className={cn("flex items-center h-12 border-b px-3", collapsed ? "justify-center" : "justify-between")}>
            {!collapsed ? (
              <button
                onClick={() => setProductOpen((o) => !o)}
                className="flex items-center gap-2 flex-1 text-left rounded-md px-1 py-1 hover:bg-muted transition-colors"
              >
                <Zap className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-sm font-semibold text-foreground">Max 2.0</span>
                <ChevronDown
                  className="h-3.5 w-3.5 text-muted-foreground ml-auto shrink-0 transition-transform"
                  style={{ transform: productOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                />
              </button>
            ) : (
              <Zap className="h-4 w-4 text-primary" />
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 ml-1" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          </div>

          {/* Row 2: product dropdown (only when expanded + open) */}
          {!collapsed && productOpen && (
            <div className="px-3 pb-2 border-b">
              {PRODUCTS.map((p) => {
                const Icon = p.icon
                const isCurrent = p.href === "/max-2"
                return (
                  <Link
                    key={p.href}
                    href={p.href}
                    onClick={() => setProductOpen(false)}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition-colors",
                      isCurrent
                        ? "text-primary bg-primary/5"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    {p.name}
                  </Link>
                )
              })}
            </div>
          )}

          <SidebarNav />
        </aside>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-[260px] p-0">
            <div className="flex items-center h-12 border-b px-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Max 2.0</span>
            </div>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
          <div className="lg:hidden sticky top-0 z-10 border-b bg-white px-4 py-2">
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => setMobileOpen(true)}>
              <PanelLeft className="h-4 w-4" />
              <span className="text-sm">Menu</span>
            </Button>
          </div>
          {children}
        </div>
      </div>
  )
}
