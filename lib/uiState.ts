// UI state interfaces and hooks
// Note: Zustand stores are temporarily disabled to fix SSR issues

export interface FiltersState {
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
  status: string[]
  priority: string[]
  callType: string[]
  severity: string[]
  searchQuery: string
  
  // Actions
  setDateRange: (from: Date | undefined, to: Date | undefined) => void
  setStatus: (status: string[]) => void
  setPriority: (priority: string[]) => void
  setCallType: (callType: string[]) => void
  setSeverity: (severity: string[]) => void
  setSearchQuery: (query: string) => void
  resetFilters: () => void
}

export interface GlobalSearchState {
  isOpen: boolean
  query: string
  results: any[]
  
  // Actions
  open: () => void
  close: () => void
  setQuery: (query: string) => void
  setResults: (results: any[]) => void
}

// Temporary mock implementations to fix SSR issues
export const useFiltersStore = () => ({
  filters: {
    dateRange: { from: undefined, to: undefined },
    status: [],
    priority: [],
    callType: [],
    severity: [],
    searchQuery: "",
    dealerships: [],
    agents: [],
    aiOnly: false,
  },
  dateRange: { from: undefined, to: undefined },
  status: [],
  priority: [],
  callType: [],
  severity: [],
  searchQuery: "",
  dealerships: [],
  agents: [],
  aiOnly: false,
  setDateRange: () => {},
  setStatus: () => {},
  setPriority: () => {},
  setCallType: () => {},
  setSeverity: () => {},
  setSearchQuery: () => {},
  resetFilters: () => {},
})

export const useGlobalSearch = () => ({
  isOpen: false,
  query: "",
  results: [],
  open: () => {},
  close: () => {},
  setQuery: () => {},
  setResults: () => {},
})

// Hook to initialize filters on app startup
export function useInitializeFilters() {
  // This hook can be used to initialize filters from URL params or other sources
  // For now, it's just a placeholder that can be expanded later
  return null
}
