'use client';

import { Calendar, UserCheck, GitBranch } from 'lucide-react';
import type { InboundOutcomes } from '@/lib/settings/vini-training-mock';
import { InfoTip } from './info-tip';

interface Props {
  outcomes: InboundOutcomes;
}

/** Thin strip below the inbound channels. Real downstream outcomes Vini's
 *  work produced this window — small early, grows by Day 30+. */
export function InboundOutcomesStrip({ outcomes }: Props) {
  return (
    <section className="rounded-xl border border-black/8 bg-white p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-semibold text-black-dark">
            Outcomes from Vini's inbound work
          </h3>
          <InfoTip width={300}>
            Concrete results from the conversations Vini handled this window.{' '}
            <b>Appointments</b> are confirmed in your scheduler.{' '}
            <b>Qualified leads</b> are contacts where vehicle interest is
            captured. <b>Routed to BDC</b> is when Vini hands the conversation
            to a human (complex requests, escalations).
          </InfoTip>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <Stat
            Icon={Calendar}
            label="Appointments booked"
            value={outcomes.appointmentsBooked}
          />
          <Stat
            Icon={UserCheck}
            label="Qualified leads"
            value={outcomes.qualifiedLeads}
          />
          <Stat
            Icon={GitBranch}
            label="Routed to BDC"
            value={outcomes.routedToHuman}
          />
        </div>
      </div>
    </section>
  );
}

function Stat({
  Icon,
  label,
  value,
}: {
  Icon: typeof Calendar;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <Icon className="h-3.5 w-3.5 self-center text-black-40" />
      <div>
        <div className="text-base font-semibold tabular-nums text-black-dark">
          {value.toLocaleString()}
        </div>
        <div className="text-[10px] uppercase tracking-wide text-black-60">{label}</div>
      </div>
    </div>
  );
}
