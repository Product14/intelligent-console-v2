'use client';

import { useMemo } from 'react';
import { PolicyCard } from '@/components/settings/agents/policies/policy-card';
import {
  FeatureSwitch,
  FormRow,
  NumberInput,
} from '@/components/settings/agents/policies/policy-form-bits';
import { RulesListEditor } from '@/components/settings/ui/rules-list-editor';
import { validateDiagnosticService } from '@/lib/settings/service-policies-validation';
import type { DiagnosticServiceRules } from '@/types/settings/service-policies';

interface Props {
  value: DiagnosticServiceRules;
  onChange(next: DiagnosticServiceRules): void;
}

export function DiagnosticServiceCard({ value, onChange }: Props) {
  const errors = useMemo(() => validateDiagnosticService(value), [value]);
  const update = (patch: Partial<DiagnosticServiceRules>) => onChange({ ...value, ...patch });

  return (
    <PolicyCard
      title="Diagnostic service"
      description="How the dealer handles initial diagnostics and pricing for them."
      status={value.offered ? 'enabled' : 'off'}
    >
      <div className="divide-y divide-black/5">
        <FormRow
          label="Diagnostic service offered"
          control={
            <FeatureSwitch
              enabled={value.offered}
              onChange={(offered) => update({ offered })}
            />
          }
        />
        {value.offered && (
          <>
            <FormRow
              label="Fee charged"
              control={
                <FeatureSwitch
                  enabled={value.feeCharged}
                  onChange={(feeCharged) => update({ feeCharged })}
                />
              }
            />
            {value.feeCharged && (
              <>
                <FormRow
                  label="Fee amount"
                  required
                  error={errors?.feeAmount}
                  control={
                    <NumberInput
                      value={value.feeAmount}
                      onChange={(feeAmount) => update({ feeAmount })}
                      min={0}
                      max={500}
                      suffix="$"
                      placeholder="129"
                    />
                  }
                />
                <FormRow
                  label="Fee waived if work is performed"
                  info="The agent reassures the caller that the diagnostic fee rolls into the repair cost when they proceed with work."
                  control={
                    <FeatureSwitch
                      enabled={value.feeWaivedIfWorkPerformed}
                      onChange={(feeWaivedIfWorkPerformed) =>
                        update({ feeWaivedIfWorkPerformed })
                      }
                    />
                  }
                />
              </>
            )}
            <FormRow
              label="Appointment required"
              control={
                <FeatureSwitch
                  enabled={value.appointmentRequired}
                  onChange={(appointmentRequired) => update({ appointmentRequired })}
                />
              }
            />
            <FormRow
              label="Notes"
              fullWidthControl
              info="One note per row. The agent reads these back when callers ask follow-up questions."
              control={
                <RulesListEditor
                  values={value.notes}
                  onChange={(notes) => update({ notes })}
                  placeholder="e.g. EVs require specialist scheduling"
                  addLabel="Add note"
                  emptyLabel="No notes added yet."
                />
              }
            />
          </>
        )}
      </div>
    </PolicyCard>
  );
}
