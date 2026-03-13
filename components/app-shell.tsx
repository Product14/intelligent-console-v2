"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { ClipboardList, BarChart3, Settings, Menu, Bug, CheckCircle, Sparkles, DollarSign, Gauge, BrainCircuit, Crosshair, Crown, Zap } from "lucide-react"

const navigation = [
  {
    name: "Spyne Velocity",
    href: "/inventory",
    icon: Gauge,
    description: "Capital velocity & inventory aging",
  },
  {
    name: "Spyne X",
    href: "/spyne-x",
    icon: Crosshair,
    description: "Time-to-Sell operating system",
  },
  {
    name: "Spyne Max",
    href: "/spyne-max",
    icon: Crown,
    description: "The complete used car operating system",
  },
  {
    name: "Max 2.0",
    href: "/max-2",
    icon: Zap,
    description: "Flywheel-driven dealer console",
  },
  {
    name: "Velocity 2.0",
    href: "/velocity-2",
    icon: BrainCircuit,
    description: "AI-native inventory intelligence",
  },
  {
    name: "ROI Dashboard",
    href: "/roi",
    icon: DollarSign,
    description: "Dealer ROI & qualified calls",
  },
  {
    name: "Spyne Flip",
    href: "/spyne-flip",
    icon: Sparkles,
    description: "Chrome plugin analytics dashboard",
  },
  {
    name: "Review Calls",
    href: "/review",
    icon: ClipboardList,
    description: "Review and analyze customer calls",
  },
  {
    name: "Issue Tracker",
    href: "/dashboard", 
    icon: BarChart3,
    description: "Track and monitor quality issues",
  },
  {
    name: "Issue Manager", 
    href: "/enums",
    icon: Bug,
    description: "Manage and categorize quality issues",
  },
]

interface AppShellProps {
  children: React.ReactNode
  statsChips?: React.ReactNode
}

export function AppShell({ children, statsChips }: AppShellProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  

  const MobileNavigation = () => (
    <div className="flex flex-col h-full bg-white sticky top-0">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <ClipboardList className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">QA Dashboard</h2>
            <p className="text-xs text-muted-foreground">Quality Assurance</p>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  "hover:bg-secondary",
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <MobileNavigation />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-y-auto" data-slot="scroll-root">
        {/* Top Navigation Bar - Scrolls with content */}
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
          <div className="w-full pl-2 pr-6">
            <div className="flex h-16 items-center justify-between">
              {/* Left Side - Logo and Navigation */}
              <div className="flex items-center gap-2">
                {/* Mobile Menu Button */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="lg:hidden"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>

                

                {/* Desktop Navigation as underline tabs */}
                <nav className="hidden lg:flex items-center gap-2">
                  {navigation.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2 px-4 h-16 -mb-px text-base font-medium border-b-2 transition-colors",
                          isActive
                            ? "text-foreground border-primary"
                            : "text-muted-foreground border-transparent hover:text-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    )
                  })}
                </nav>
              </div>

              {/* Right Side - Stats Chips */}
              {statsChips && (
                <div className="flex items-center pr-4">
                  {statsChips}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 ">
          {children}
        </main>
      </div>

      
    </div>
  )
}
