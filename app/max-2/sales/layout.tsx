"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutGrid,
  Calendar,
  MessageSquare,
  BarChart2,
} from "lucide-react"
import { cn } from "@/lib/utils"

/*
  SALES SUB-NAVIGATION
  ─────────────────────────────────────────────────────────────
  Two layouts:
    Mobile  → Fixed bottom tab bar (z-[999], above all content)
              Content has pb-20 to clear the nav.
    Desktop → Horizontal tab bar sticky at the top of the
              content scroll area (z-20, below dropdowns).

  This layout wraps all /max-2/sales/* routes.
  The Queue badge (urgent count) is hardcoded at 3 for now —
  replace with a real unread count from your data layer.
*/

const NAV_ITEMS = [
  {
    href: "/max-2/sales",
    label: "Queue",
    icon: LayoutGrid,
    exact: true,
    badge: 3, // urgent leads since last visit
  },
  {
    href: "/max-2/sales/appointments",
    label: "Appointments",
    icon: Calendar,
    exact: false,
    badge: 0,
  },
  {
    href: "/max-2/sales/conversations",
    label: "Conversations",
    icon: MessageSquare,
    exact: false,
    badge: 0,
  },
  {
    href: "/max-2/sales/overview",
    label: "Overview",
    icon: BarChart2,
    exact: false,
    badge: 0,
  },
]

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const isActive = (item: (typeof NAV_ITEMS)[0]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  return (
    <div className="flex flex-col">

      {/* ── Desktop: horizontal tab bar ─────────────────────── */}
      <div
        className="hidden md:flex items-center gap-1 px-6 sticky top-0 z-20 border-b"
        style={{
          background: "var(--spyne-surface)",
          borderColor: "var(--spyne-border)",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors",
                active
                  ? "border-[var(--spyne-brand)] text-[var(--spyne-brand)]"
                  : "border-transparent text-[var(--spyne-text-secondary)] hover:text-[var(--spyne-text-primary)]"
              )}
            >
              <item.icon size={15} strokeWidth={active ? 2.2 : 1.8} />
              {item.label}
              {item.badge > 0 && (
                <span
                  className="flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-700 leading-none"
                  style={{
                    background: "var(--spyne-brand)",
                    color: "var(--spyne-brand-on)",
                    fontSize: "10px",
                    fontWeight: 700,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* ── Content area ────────────────────────────────────── */}
      {/* pb-20 on mobile reserves space above the fixed bottom nav */}
      <div className="pb-20 md:pb-0">
        {children}
      </div>

      {/* ── Mobile: fixed bottom tab bar ────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 flex border-t"
        style={{
          zIndex: "var(--spyne-z-nav)",
          background: "var(--spyne-surface)",
          borderColor: "var(--spyne-border)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
        aria-label="Sales navigation"
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 transition-colors"
              style={{
                color: active
                  ? "var(--spyne-brand)"
                  : "var(--spyne-text-muted)",
                minHeight: "56px",
              }}
              aria-current={active ? "page" : undefined}
            >
              {/* Badge */}
              {item.badge > 0 && (
                <span
                  className="absolute top-1.5 right-[calc(50%-14px)] flex items-center justify-center w-[18px] h-[18px] rounded-full"
                  style={{
                    background: "var(--spyne-brand)",
                    color: "var(--spyne-brand-on)",
                    fontSize: "10px",
                    fontWeight: 700,
                  }}
                >
                  {item.badge}
                </span>
              )}
              <item.icon
                size={22}
                strokeWidth={active ? 2.2 : 1.8}
              />
              <span
                className="font-medium"
                style={{ fontSize: "10px" }}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
