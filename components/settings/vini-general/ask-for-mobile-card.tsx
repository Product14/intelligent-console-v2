'use client';

import { PolicyCard } from '@/components/settings/agents/policies/policy-card';
import { PhoneListEditor } from './phone-list-editor';
import type { AskForMobileConfig } from '@/types/settings/vini-general-config';

interface Props {
  value: AskForMobileConfig;
  onChange(next: AskForMobileConfig): void;
}

export function AskForMobileCard({ value, onChange }: Props) {
  const hasNumbers = value.triggerNumbers.length > 0;

  return (
    <PolicyCard
      title="Ask for caller’s mobile number"
      description="When the inbound call’s caller-ID matches one of these numbers, the agent ignores it and asks the caller for a personal mobile so the dealer captures a real callback line. Useful for shared lines (fleet hotlines, office switchboards, call-pool numbers)."
      status={hasNumbers ? 'enabled' : 'all_off'}
      defaultOpen
    >
      <PhoneListEditor
        values={value.triggerNumbers}
        onChange={(triggerNumbers) => onChange({ ...value, triggerNumbers })}
      />
    </PolicyCard>
  );
}
