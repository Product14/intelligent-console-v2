/**
 * Shown instantly while the route compiles or fetches on first visit.
 * Keeps tab switches from feeling frozen during dev-mode lazy compilation.
 */
export default function SettingsLoading() {
  return (
    <div className="w-full animate-pulse px-6 py-8">
      <div className="mb-6 space-y-2">
        <div className="h-7 w-56 rounded bg-black/8" />
        <div className="h-4 w-80 rounded bg-black/5" />
      </div>
      <div className="space-y-3">
        <div className="h-32 rounded-lg bg-black/5" />
        <div className="h-32 rounded-lg bg-black/5" />
        <div className="h-32 rounded-lg bg-black/5" />
      </div>
    </div>
  );
}
