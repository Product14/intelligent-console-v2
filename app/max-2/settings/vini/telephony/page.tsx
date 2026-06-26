'use client';

// @ts-ignore - vendored v3 page
import CallerIdRegistrationStep from '@/components/settings/v3/rooftop-details/caller-id-registration-step';
import { AssignNumber } from '@/components/settings/agent-shared/assign-number';

/**
 * Telephony — rooftop-level phone infrastructure. Caller ID/CNAM (US only) and
 * phone-number assignment. Sales and Service agent screens reference the numbers
 * configured here.
 */
export default function TelephonyPage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-black-dark">Telephony</h1>
        <p className="mt-1 text-sm text-black-60">
          Caller ID registration and the phone numbers Vini's agents use.
        </p>
      </header>

      <CallerIdRegistrationStep />

      <section className="mb-12">
        <h2 className="mb-3 text-base font-semibold text-black-80">Phone Numbers</h2>
        <p className="mb-4 text-sm text-black-60">
          Assign a number to each call type.
        </p>
        <AssignNumber subStepId="telephony:numbers" segment="inboundSales" />
      </section>
    </div>
  );
}
