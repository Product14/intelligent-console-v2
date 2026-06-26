/** Content-shaped skeleton for the Vini Status page. Mirrors the stepper
 *  geometry so the swap-in is shift-free. */
export function ViniStatusSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-live="polite">
      <div className="-mx-6 border-b border-black/8 bg-white px-6 py-4">
        <div className="space-y-2">
          <div className="h-5 w-32 rounded bg-black/10" />
          <div className="h-3 w-72 rounded bg-black/8" />
        </div>
        <div className="mt-3 h-1 w-full rounded-full bg-black/8" />
      </div>

      <div className="mt-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-stretch gap-4">
            <div className="flex w-10 shrink-0 flex-col items-center">
              <div className="h-8 w-8 rounded-full bg-black/8" />
              {i < 9 && <div className="-mt-0.5 w-0.5 grow bg-black/5" />}
            </div>
            <div className="flex-1 pb-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="h-3.5 w-44 rounded bg-black/10" />
                  <div className="h-3 w-64 rounded bg-black/8" />
                </div>
                <div className="h-7 w-20 rounded-lg bg-black/8" />
              </div>
              {/* Richer body placeholder for the agent + billing rows. */}
              {(i === 5 || i === 6 || i === 7 || i === 8 || i === 9) && (
                <div className="mt-3 h-28 rounded-xl bg-black/5" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
