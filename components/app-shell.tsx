"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, BarChart3, Settings, Search, Menu, Moon, Sun, User, LogOut } from "lucide-react"
import { useTheme } from "next-themes"
import { CommandPalette } from "./command-palette"
import { DateRangePicker } from "./filters/date-range-picker"
import { QuickFilters } from "./filters/quick-filters"
import { MultiSelect, type Option } from "./ui/multi-select"
// import { useInitializeFilters } from "@/lib/uiState"

const navigation = [
  {
    name: "Review Calls",
    href: "/review",
    icon: ClipboardList,
    description: "Call review dashboard",
  },
  {
    name: "QC Analytics",
    href: "/dashboard",
    icon: BarChart3,
    description: "Analytics and status overview",
  },
  {
    name: "Enum Management",
    href: "/enums",
    icon: Settings,
    description: "Manage QA enums catalog",
  },
]

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()
  const [commandOpen, setCommandOpen] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  // useInitializeFilters()

  // Global keyboard shortcuts
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn("flex flex-col", mobile ? "h-full" : "h-screen")}>
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <span className="font-semibold">QC Dashboard</span>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => mobile && setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                "hover:bg-[rgba(245,244,247,255)] hover:text-[#6825d8]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive ? "bg-[rgba(245,244,247,255)] text-[#6825d8]" : "text-muted-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden w-64 border-r bg-card lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar mobile />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between bg-card px-6">
          {/* Left side - Mobile Menu Button */}
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
            </Sheet>
          </div>

          {/* Center - Enterprise and Team Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="enterprise-filter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Enterprise ID:
              </label>
              <select
                id="enterprise-filter"
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-w-[140px]"
                defaultValue="nextgear"
              >
                <option value="nextgear">NextGear</option>
                <option value="enterprise-001">Enterprise 001</option>
                <option value="enterprise-002">Enterprise 002</option>
                <option value="enterprise-003">Enterprise 003</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label htmlFor="team-filter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Team ID:
              </label>
              <select
                id="team-filter"
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-w-[140px]"
                defaultValue="nextgear"
              >
                <option value="nextgear">NextGear</option>
                <option value="team-001">Team 001</option>
                <option value="team-002">Team 002</option>
                <option value="team-003">Team 003</option>
              </select>
            </div>
          </div>

          {/* Right side - Theme toggle and other controls can go here */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {/* Command Palette */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  )
}
