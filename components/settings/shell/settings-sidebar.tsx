'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AppWindow,
  Building2,
  CalendarDays,
  Check,
  Cog,
  Eye,
  Headphones,
  Megaphone,
  MessageCircle,
  Phone,
  Plug,
  ScanSearch,
  Settings2,
  ShoppingCart,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/settings/cn';
import { useContractedAgents } from '@/hooks/settings/use-contracted-agents';
import { useSettingsProgress } from '@/hooks/settings/use-settings-progress';
import {
  SETTINGS_GROUPS,
  type SettingsGroupId,
  type SettingsScreenId,
} from '@/lib/settings/onboarding-model';
import type { ProgressState } from '@/lib/settings/settings-progress';

const SCREEN_ICONS: Record<SettingsScreenId, LucideIcon> = {
  rooftop: Building2,
  team: Users,
  departments: CalendarDays,
  'studio-general': Cog,
  'studio-app': AppWindow,
  'studio-smart-campaigns': Megaphone,
  'studio-smart-match': ScanSearch,
  'studio-smart-view': Eye,
  'integrations-vini': Plug,
  'vini-general': Settings2,
  telephony: Phone,
  sales: ShoppingCart,
  service: Wrench,
  reception: Headphones,
  chatbot: MessageCircle,
};

/**
 * Flat settings sidebar — one nav for both onboarding and post-launch settings.
 * Groups (Account / Studio AI / Integrations / Vini AI) render with section headers.
 * Per-item progress chips render only while onboarding is incomplete; once
 * every visible screen is `completed`, the chips disappear and the sidebar
 * reads like a normal settings nav.
 */
export function SettingsSidebar() {
  const pathname = usePathname() || '';
  const { agents } = useContractedAgents();
  const { progress, screens, allComplete } = useSettingsProgress(agents);

  const grouped = SETTINGS_GROUPS.map((g) => ({
    ...g,
    items: screens.filter((s) => s.group === g.id),
  })).filter((g) => g.items.length > 0);

  return (
    <nav
      aria-label="Settings"
      className="flex w-72 shrink-0 flex-col gap-4 overflow-y-auto border-r border-black/8 bg-gray-lighter px-3 py-5"
    >
      {grouped.map((group) => (
        <SettingsGroup
          key={group.id}
          groupId={group.id}
          label={group.label}
          items={group.items}
          progress={progress}
          showChips={!allComplete}
          activePath={pathname}
        />
      ))}
    </nav>
  );
}

interface SettingsGroupProps {
  groupId: SettingsGroupId;
  label: string;
  items: ReadonlyArray<{ id: SettingsScreenId; label: string; route: string }>;
  progress: Record<string, ProgressState>;
  showChips: boolean;
  activePath: string;
}

function SettingsGroup({
  label,
  items,
  progress,
  showChips,
  activePath,
}: SettingsGroupProps) {
  return (
    <div>
      <div className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wide text-black-40">
        {label}
      </div>
      <ol className="space-y-0.5">
        {items.map((screen) => {
          const selected = activePath.startsWith(screen.route);
          const state = progress[screen.id] ?? 'pending';
          const Icon = SCREEN_ICONS[screen.id];
          return (
            <li key={screen.id}>
              <Link
                href={screen.route}
                prefetch
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  selected
                    ? 'bg-white font-semibold text-black-dark shadow-sm'
                    : 'text-black-60 hover:bg-black/4'
                )}
              >
                {Icon && (
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0',
                      state === 'completed' && 'text-green',
                      selected && state !== 'completed' && 'text-blue-light',
                      !selected && state !== 'completed' && 'text-black-40'
                    )}
                  />
                )}
                <span className="flex-1 truncate">{screen.label}</span>
                {showChips && state === 'completed' && (
                  <Check className="h-3.5 w-3.5 shrink-0 text-green" />
                )}
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

