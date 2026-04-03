"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, Zap, ChevronDown } from "lucide-react"

const retailIndigo = "#302667"
const retailMuted = "#9E9E9E"

const navigation = [
  {
    name: "Max 2.0",
    href: "/max-2",
    icon: Zap,
    description: "Flywheel-driven dealer console",
  },
]

type RooftopOption = { id: string; name: string }

/** Current enterprise (one at a time); swap via auth/context when wired. */
const ENTERPRISE_NAME = "Mega Dealer"

/** Rooftops for the active enterprise; replace with API when wired. */
const ROOFTOP_OPTIONS: RooftopOption[] = [
  { id: "ford-sec-48", name: "Ford Sec 48" },
  { id: "chevy-ave-12", name: "Chevy Ave 12" },
  { id: "lincoln-row", name: "Lincoln Row 3" },
]

interface AppShellProps {
  children: React.ReactNode
  statsChips?: React.ReactNode
}

export function AppShell({ children, statsChips }: AppShellProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [rooftopId, setRooftopId] = React.useState(ROOFTOP_OPTIONS[0]!.id)
  const [rooftopMenuOpen, setRooftopMenuOpen] = React.useState(false)
  const isMax2 = pathname.startsWith("/max-2")

  const selectedRooftop = React.useMemo(
    () => ROOFTOP_OPTIONS.find((r) => r.id === rooftopId) ?? ROOFTOP_OPTIONS[0]!,
    [rooftopId]
  )

  const BrandBlock = ({ className }: { className?: string }) => (
    <Link
      href="/max-2"
      aria-label="Retail Suite by spyne"
      className={cn("flex items-center gap-1.5 min-w-0", className)}
      onClick={() => setMobileMenuOpen(false)}
    >
      <Image
        src="/branding/retail-suite-logomark.svg"
        alt=""
        width={48}
        height={48}
        aria-hidden
        className="h-12 w-12 shrink-0 object-contain"
        priority
      />
      <Image
        src="/branding/retail-suite-wordmark.svg"
        alt=""
        width={111}
        height={36}
        className="h-8 w-auto shrink-0 object-contain object-left sm:h-9"
        priority
        aria-hidden
      />
    </Link>
  )

  const MobileNavigation = () => (
    <div className="flex flex-col h-full bg-white sticky top-0">
      <div className="flex items-center justify-between p-6 border-b border-neutral-200">
        <BrandBlock />
      </div>

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
                  "hover:bg-neutral-100",
                  isActive
                    ? "bg-[#F5F6FA] border border-neutral-200"
                    : "text-foreground"
                )}
                style={isActive ? { color: retailIndigo } : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs" style={{ color: retailMuted }}>
                    {item.description}
                  </div>
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
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <MobileNavigation />
        </SheetContent>
      </Sheet>

      <div className="flex min-h-0 flex-1 flex-col">
        <header className="sticky top-0 z-50 flex-shrink-0 border-b border-neutral-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.06),0_1px_4px_rgba(15,23,42,0.04)]">
          <div
            className={cn(
              "flex h-16 w-full items-center justify-between gap-4",
              isMax2 ? "pl-3 pr-5 sm:pr-8" : "px-5 sm:px-8"
            )}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-neutral-600 lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <BrandBlock className="min-w-0" />
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              {statsChips}
              <DropdownMenu onOpenChange={setRooftopMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Select rooftop location"
                    className={cn(
                      "flex max-w-[min(100%,11rem)] items-center gap-2 rounded-md border px-3 py-2 text-left transition-colors",
                      "border-[#302667]/14 bg-[#EDEAF6]/55",
                      "hover:border-[#302667]/22 hover:bg-[#EDEAF6]/90",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#302667]/20 focus-visible:ring-offset-2",
                      "data-[state=open]:border-[#302667]/25 data-[state=open]:bg-[#E4DEF2]",
                      "sm:max-w-[15rem] sm:px-3.5"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div
                        className="truncate text-[11px] font-medium leading-tight tracking-wide text-neutral-500"
                        title={ENTERPRISE_NAME}
                      >
                        {ENTERPRISE_NAME}
                      </div>
                      <div
                        className="truncate text-sm font-semibold leading-tight tracking-tight"
                        style={{ color: retailIndigo }}
                        title={selectedRooftop.name}
                      >
                        {selectedRooftop.name}
                      </div>
                    </div>
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-neutral-500 transition-transform duration-200",
                        rooftopMenuOpen && "rotate-180"
                      )}
                      aria-hidden
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="w-[min(calc(100vw-2rem),18rem)] rounded-lg border-neutral-200/90 p-1.5 shadow-none"
                >
                  <DropdownMenuRadioGroup value={rooftopId} onValueChange={setRooftopId}>
                    {ROOFTOP_OPTIONS.map((r) => (
                      <DropdownMenuRadioItem
                        key={r.id}
                        value={r.id}
                        className="cursor-pointer rounded-md py-2 pl-8 pr-2 text-sm focus:bg-[#EDEAF6]/80"
                      >
                        <span className="font-medium" style={{ color: retailIndigo }}>
                          {r.name}
                        </span>
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Avatar className="h-9 w-9 shrink-0 border border-neutral-200">
                <AvatarImage
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop"
                  alt="Account"
                />
                <AvatarFallback className="text-xs font-medium" style={{ color: retailIndigo }}>
                  JD
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main
          className="min-h-0 flex-1 overflow-y-auto"
          data-slot="scroll-root"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
