'use client';

import { useEffect, useState } from 'react';
import { Phone, Check } from 'lucide-react';
import { api } from '@/services/settings';
import type { PhoneAssignment } from '@/services/settings/types';
import { useSubStep } from '@/components/settings/shell/step-scaffold';
import { DsButton } from '@/components/settings/ds';

export function AssignNumber({ subStepId, segment }: { subStepId: string; segment: string }) {
  const [phone, setPhone] = useState<PhoneAssignment | null>(null);
  const [assigning, setAssigning] = useState(false);
  useSubStep(subStepId, true);

  useEffect(() => {
    api.phone.get(segment).then(setPhone);
  }, [segment]);

  const assign = async () => {
    setAssigning(true);
    const p = await api.phone.assign(segment, phone?.areaCode ?? '');
    setPhone(p);
    setAssigning(false);
  };

  return (
    <div>
      <div className="flex">
        <DsButton
          label={phone?.number ? 'Re-assign Number' : 'Assign Number'}
          type={phone?.number ? 'bordered' : 'primary'}
          icon={<Phone className="h-4 w-4" />}
          onClick={assign}
          isLoading={assigning}
        />
      </div>

      {phone?.number && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-green bg-green-lighter p-4">
          <Check className="h-5 w-5 text-green-darker" />
          <div>
            <div className="text-sm font-semibold text-green-darker">Number Assigned — {phone.number}</div>
            <div className="text-xs text-green-darker/80">
              Calls to this number will work once the agent is deployed.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
