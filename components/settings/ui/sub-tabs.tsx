'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/settings/cn';

interface SubTab {
  id: string;
  label: string;
  render: () => ReactNode;
}

interface SubTabsProps {
  tabs: SubTab[];
  /** Tab id to render on first mount. Defaults to the first tab. */
  initialId?: string;
}

/**
 * In-page horizontal tab strip. Local state only — does not sync to URL.
 * Use inside a settings screen to split a tab into sub-tabs.
 */
export function SubTabs({ tabs, initialId }: SubTabsProps) {
  const [activeId, setActiveId] = useState(initialId ?? tabs[0]?.id);
  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];

  return (
    <div>
      <div role="tablist" className="mb-6 flex gap-6 border-b border-black/8">
        {tabs.map((t) => {
          const selected = t.id === activeId;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveId(t.id)}
              className={cn(
                '-mb-px border-b-2 pb-3 text-sm font-medium transition-colors',
                selected
                  ? 'border-blue-light text-blue-light'
                  : 'border-transparent text-black-60 hover:text-black-80'
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel">{active?.render()}</div>
    </div>
  );
}
