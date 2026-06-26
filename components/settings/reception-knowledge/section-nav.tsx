'use client';

import { cn } from '@/lib/settings/cn';
import type { KnowledgeSectionId } from '@/lib/settings/reception-knowledge-fixtures';

interface SectionNavItem {
  id: KnowledgeSectionId;
  label: string;
  count?: number;
  flag?: boolean;
}

interface SectionNavProps {
  items: SectionNavItem[];
  activeId: KnowledgeSectionId;
  onChange: (id: KnowledgeSectionId) => void;
}

/**
 * Pill-chip nav for the 7 Knowledge Base sections. Distinct visual style from
 * the outer SubTabs (underlined) so the nesting reads clearly.
 */
export function SectionNav({ items, activeId, onChange }: SectionNavProps) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {items.map((item) => {
        const selected = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              selected
                ? 'border-blue-light bg-blue-light/10 text-blue-light'
                : 'border-black/10 bg-white text-black-60 hover:border-black/20 hover:text-black-80'
            )}
          >
            <span>{item.label}</span>
            {typeof item.count === 'number' && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                  selected ? 'bg-blue-light/20 text-blue-light' : 'bg-black/5 text-black-60'
                )}
              >
                {item.count}
              </span>
            )}
            {item.flag && (
              <span className="ml-0.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}
