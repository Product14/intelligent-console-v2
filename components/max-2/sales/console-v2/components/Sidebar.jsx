"use client"

import {
  LayoutDashboard, Search, Timer, Camera, Megaphone,
  ShoppingCart, Wrench, Car, Users, PanelLeftClose, PanelLeft,
} from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',         active: false },
  { icon: Search,          label: 'Sourcing',           active: false },
  { icon: Timer,           label: 'Inspection & Recon', active: false },
  { icon: Camera,          label: 'Merchandising',      active: false },
  { icon: Megaphone,       label: 'Marketing',          active: false },
  { icon: ShoppingCart,    label: 'Sales',              active: true  },
  { icon: Wrench,          label: 'Service',            active: false },
  { icon: Car,             label: 'Lot View',           active: false },
  { icon: Users,           label: 'Customers',          active: false },
]

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className="fixed top-0 left-0 h-full flex flex-col z-40 transition-[width] duration-200"
      style={{
        width: collapsed ? 60 : 220,
        background: 'var(--spyne-surface)',
        borderRight: '1px solid var(--spyne-border)',
      }}
    >
      {/* Header row: Spyne logo + "Vini AI" label + collapse toggle */}
      <div
        className="flex items-center h-14 shrink-0 px-3"
        style={{
          borderBottom: '1px solid var(--spyne-border)',
          justifyContent: collapsed ? 'center' : 'space-between',
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <img
            src="/spyne-logo.png"
            alt="Spyne"
            style={{ height: 26, width: 'auto', objectFit: 'contain', flexShrink: 0 }}
          />
          {!collapsed && (
            <span className="text-sm font-semibold truncate" style={{ color: 'var(--spyne-text-primary)' }}>
              Vini AI
            </span>
          )}
        </div>

        {!collapsed && (
          <button
            onClick={onToggle}
            className="flex items-center justify-center rounded-md transition-colors cursor-pointer shrink-0"
            style={{ width: 28, height: 28, background: 'transparent', border: 'none', color: 'var(--spyne-text-muted)' }}
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose size={16} />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-0.5">
        {navItems.map((item) => (
          <button
            key={item.label}
            className="w-full flex items-center rounded-lg transition-colors cursor-pointer"
            style={{
              gap: 12,
              padding: collapsed ? '10px 8px' : '8px 12px',
              justifyContent: collapsed ? 'center' : undefined,
              background: item.active ? 'var(--spyne-brand-subtle)' : 'transparent',
              color: item.active ? 'var(--spyne-brand)' : 'var(--spyne-text-secondary)',
              fontWeight: item.active ? 600 : 400,
              fontSize: 14,
              border: 'none',
            }}
            aria-label={item.label}
          >
            <item.icon size={16} className="shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Expand button when collapsed */}
      {collapsed && (
        <div className="p-2 shrink-0" style={{ borderTop: '1px solid var(--spyne-border)' }}>
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center rounded-md transition-colors cursor-pointer"
            style={{ height: 32, background: 'transparent', border: 'none', color: 'var(--spyne-text-muted)' }}
            aria-label="Expand sidebar"
          >
            <PanelLeft size={16} />
          </button>
        </div>
      )}
    </aside>
  )
}
