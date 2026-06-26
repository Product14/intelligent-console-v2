'use client';
// Shim — personas come from backend; empty in mock (screen shows empty/loading-complete state).
export const usePersonaRedux = (_p?: unknown) => ({
  personas: [] as unknown[],
  isLoading: false,
  isLoaded: true,
  refetch: () => {},
  clearCache: () => {},
});
export default usePersonaRedux;
