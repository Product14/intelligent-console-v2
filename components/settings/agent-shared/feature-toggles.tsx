'use client';

import { useState } from 'react';
import { useSubStep } from '@/components/settings/shell/step-scaffold';
import { SubStepHeader } from '@/components/settings/shell/sub-step-header';
import { ToggleRow } from '@/components/settings/ui/toggle-row';

export interface FeatureItem {
  id: string;
  label: string;
  desc?: string;
}

export function FeatureToggles({
  subStepId,
  title,
  description,
  items,
  defaultsOn = true,
}: {
  subStepId: string;
  title: string;
  description?: string;
  items: FeatureItem[];
  defaultsOn?: boolean;
}) {
  const [state, setState] = useState<Record<string, boolean>>(
    Object.fromEntries(items.map((i) => [i.id, defaultsOn]))
  );
  useSubStep(subStepId, true);

  return (
    <div>
      <SubStepHeader title={title} description={description} />
      <div className="space-y-3">
        {items.map((item) => (
          <ToggleRow
            key={item.id}
            title={item.label}
            description={item.desc}
            enabled={!!state[item.id]}
            onChange={(v) => setState((s) => ({ ...s, [item.id]: v }))}
          />
        ))}
      </div>
    </div>
  );
}
