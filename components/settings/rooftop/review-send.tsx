'use client';

import { useState } from 'react';
import { CheckCircle2, Mail } from 'lucide-react';
import { api } from '@/services/settings';
import { useSubStep } from '@/components/settings/shell/step-scaffold';
import { SubStepHeader } from '@/components/settings/shell/sub-step-header';
import { DsButton } from '@/components/settings/ds';

export function ReviewSend({ subStepId }: { subStepId: string }) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  useSubStep(subStepId, true);

  const send = async () => {
    setSending(true);
    const res = await api.review.sendConfirmationEmail();
    setSending(false);
    setSent(res.sent);
  };

  return (
    <div>
      <SubStepHeader
        title="Review & Send for Confirmation"
        description="Send the rooftop details to the dealership for confirmation before we proceed to agent setup."
      />
      {sent ? (
        <div className="flex items-center gap-3 rounded-lg border border-green bg-green-lighter p-4">
          <CheckCircle2 className="h-5 w-5 text-green-darker" />
          <div className="text-sm text-green-darker">
            Confirmation email sent. You can continue to Sales Agent setup.
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-40 p-5">
          <p className="text-sm text-black-60">
            We&apos;ll email the dealership a summary of everything configured in this step to
            confirm before going live.
          </p>
          <div className="mt-4">
            <DsButton
              label="Send Email for Review"
              icon={<Mail className="h-4 w-4" />}
              onClick={send}
              isLoading={sending}
            />
          </div>
        </div>
      )}
    </div>
  );
}
