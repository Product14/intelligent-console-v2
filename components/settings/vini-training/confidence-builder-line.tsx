'use client';

import { Sparkles } from 'lucide-react';

interface Props {
  /** Free-form confidence line, e.g. "Vini is handling 100% of your after-hours
   *  calls at 47s avg response time." */
  text: string;
}

/** Italicized one-liner that uses live-source performance to build confidence
 *  in a NOT LIVE source. Rendered inside channel/campaign cards. */
export function ConfidenceBuilderLine({ text }: Props) {
  return (
    <div className="mt-2 flex items-start gap-1.5 rounded-md bg-blue-2/60 px-2.5 py-1.5">
      <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-blue-light" />
      <p className="text-[11px] italic leading-snug text-black-60">{text}</p>
    </div>
  );
}
