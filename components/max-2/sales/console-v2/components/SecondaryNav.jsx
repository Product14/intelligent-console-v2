"use client"

import { LayoutDashboard, ListChecks, CalendarCheck, Users, Megaphone } from 'lucide-react'

const navItems = [
  { id: 'overview',      label: 'Overview',      icon: LayoutDashboard, badge: null },
  { id: 'campaigns',     label: 'Campaigns',     icon: Megaphone,       badge: 4   },
  { id: 'action-items',  label: 'Action Items',  icon: ListChecks,      badge: 6   },
  { id: 'appointments',  label: 'Appointments',  icon: CalendarCheck,   badge: 3   },
  { id: 'customers',     label: 'Leads',          icon: Users,           badge: null },
]

export default function SecondaryNav({ activePage, onPageChange, navLeftPx = 220, embedded = false }) {
  if (embedded) {
    return (
      <div
        className="sticky top-0 z-20 flex h-11 w-full items-center border-b transition-all duration-200"
        style={{
          background: 'var(--spyne-surface)',
          borderColor: 'var(--spyne-border)',
        }}
      >
        <div className="flex h-full items-center gap-0.5 px-5">
          {navItems.map((item) => {
            const active = activePage === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onPageChange(item.id)}
                className="relative flex h-full cursor-pointer items-center gap-2 border-b-2 px-4 transition-colors"
                style={{
                  borderColor: active ? 'var(--spyne-brand)' : 'transparent',
                  color: active ? 'var(--spyne-brand)' : 'var(--spyne-text-muted)',
                  fontWeight: active ? 600 : 500,
                  fontSize: 13,
                }}
                aria-current={active ? 'page' : undefined}
              >
                <item.icon size={14} strokeWidth={active ? 2.2 : 1.8} />
                {item.label}
                {item.badge ? (
                  <span
                    className="flex h-[18px] min-w-[18px] items-center justify-center px-1 font-bold leading-none"
                    style={{
                      borderRadius: 'var(--spyne-radius-pill)',
                      background: 'var(--spyne-brand)',
                      color: 'var(--spyne-brand-on)',
                      fontSize: 10,
                    }}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed right-0 flex items-center z-20 transition-all duration-200"
      style={{
        top: 56,
        left: navLeftPx,
        height: 44,
        background: 'var(--spyne-surface)',
        borderBottom: '1px solid var(--spyne-border)',
      }}
    >
      <div className="flex items-center px-5 h-full gap-0.5">
        {navItems.map((item) => {
          const active = activePage === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onPageChange(item.id)}
              className="relative flex items-center gap-2 px-4 h-full border-b-2 transition-colors cursor-pointer"
              style={{
                borderColor: active ? 'var(--spyne-brand)' : 'transparent',
                color: active ? 'var(--spyne-brand)' : 'var(--spyne-text-muted)',
                fontWeight: active ? 600 : 500,
                fontSize: 13,
              }}
              aria-current={active ? 'page' : undefined}
            >
              <item.icon size={14} strokeWidth={active ? 2.2 : 1.8} />
              {item.label}
              {item.badge ? (
                <span
                  className="flex items-center justify-center min-w-[18px] h-[18px] px-1 font-bold leading-none"
                  style={{
                    borderRadius: 'var(--spyne-radius-pill)',
                    background: 'var(--spyne-brand)',
                    color: 'var(--spyne-brand-on)',
                    fontSize: 10,
                  }}
                >
                  {item.badge}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
