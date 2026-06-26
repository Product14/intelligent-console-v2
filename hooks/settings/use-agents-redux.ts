'use client';
// Shim — no Redux fetch; returns empty agents list (mock). Components fall back to empty state.
export const useAgentsRedux = (_p?: unknown) => ({
  availableAgents: [] as unknown[],
  isLoading: false,
  isLoaded: true,
  refetch: () => {},
  clearCache: () => {},
});
export default useAgentsRedux;
