import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Call } from '@/lib/types'
import type { CallData } from '@/services'

export interface CallFilters {
  status: 'pending' | 'completed' | 'all'
  agentName: string
  agentType: string
  callType: string
  startDate?: string
  endDate?: string
}

interface CallsState {
  calls: Call[]
  selectedCall: Call | null
  loading: boolean
  error: string | null
  filters: CallFilters
  currentPage: number
  hasMore: boolean
  callDetails: CallData | null
  callDetailsStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  callDetailsError: string | null
  currentPlaybackTime: number
  audioDuration: number
  isDurationLoading: boolean
  currentCallId: string | null
  qcStats: {
    total: number
    reviewed: number
    pending: number
  }
  qcStatsStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  qcStatsError: string | null
  isAssigning: boolean
  isUnassigning: boolean
  isClassificationDialogOpen: boolean
  selectedClassification: string
  isUpdatingTestCall: boolean
  testCallUpdateError: string | null
}

const initialFilters: CallFilters = {
  status: 'pending',
  agentName: 'all',
  agentType: 'all',
  callType: 'all',
}

const initialState: CallsState = {
  calls: [],
  selectedCall: null,
  loading: false,
  error: null,
  filters: initialFilters,
  currentPage: 1,
  hasMore: true,
  callDetails: null,
  callDetailsStatus: 'idle',
  callDetailsError: null,
  currentPlaybackTime: 0,
  audioDuration: 0,
  isDurationLoading: true,
  currentCallId: null,
  qcStats: {
    total: 0,
    reviewed: 0,
    pending: 0,
  },
  qcStatsStatus: 'idle',
  qcStatsError: null,
  isAssigning: false,
  isUnassigning: false,
  isClassificationDialogOpen: false,
  selectedClassification: '',
  isUpdatingTestCall: false,
  testCallUpdateError: null,
}

const callsSlice = createSlice({
  name: 'calls',
  initialState,
  reducers: {
    // Set calls (replace all)
    setCalls: (state, action: PayloadAction<Call[]>) => {
      state.calls = action.payload
      state.currentPage = 1
      state.error = null
    },
    
    // Select a call
    selectCall: (state, action: PayloadAction<Call | null>) => {
      state.selectedCall = action.payload
      state.currentCallId = action.payload?.id ?? null
      state.currentPlaybackTime = 0
      state.audioDuration = 0
      state.isDurationLoading = true
      state.callDetails = null
      state.callDetailsStatus = action.payload ? 'loading' : 'idle'
      state.callDetailsError = null
      state.testCallUpdateError = null
      state.isUpdatingTestCall = false
    },
    
    // Update a single call
    updateCall: (state, action: PayloadAction<{ callId: string; updates: Partial<Call> }>) => {
      const { callId, updates } = action.payload
      const index = state.calls.findIndex(call => call.id === callId)
      if (index !== -1) {
        state.calls[index] = { ...state.calls[index], ...updates }
      }
      if (state.selectedCall?.id === callId) {
        state.selectedCall = { ...state.selectedCall, ...updates }
      }
    },
    
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    
    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    },
    
    // Update filters
    updateFilters: (state, action: PayloadAction<Partial<CallFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
      state.currentPage = 1
    },
    
    // Reset filters
    resetFilters: (state) => {
      state.filters = initialFilters
      state.currentPage = 1
    },
    
    // Increment page
    incrementPage: (state) => {
      state.currentPage += 1
    },
    
    // Call details lifecycle
    setCallDetailsLoading: (state) => {
      state.callDetailsStatus = 'loading'
      state.callDetailsError = null
      state.testCallUpdateError = null
      state.isUpdatingTestCall = false
    },

    setCallDetails: (state, action: PayloadAction<CallData | null>) => {
      state.callDetails = action.payload
      state.callDetailsStatus = action.payload ? 'succeeded' : 'idle'
      state.callDetailsError = null
    },

    setCallDetailsError: (state, action: PayloadAction<string | null>) => {
      state.callDetailsError = action.payload
      state.callDetailsStatus = 'failed'
    },

    // Audio state
    setCurrentPlaybackTime: (state, action: PayloadAction<number>) => {
      state.currentPlaybackTime = action.payload
    },

    setAudioDuration: (state, action: PayloadAction<number>) => {
      state.audioDuration = action.payload
      state.isDurationLoading = false
    },

    setIsDurationLoading: (state, action: PayloadAction<boolean>) => {
      state.isDurationLoading = action.payload
    },

    resetAudioState: (state) => {
      state.currentPlaybackTime = 0
      state.audioDuration = 0
      state.isDurationLoading = true
    },

    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload
    },

    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload
    },

    // Add calls (append for infinite scroll)
    addCalls: (state, action: PayloadAction<Call[]>) => {
      state.calls.push(...action.payload)
    },

    setCallStatsLoading: (state) => {
      state.qcStatsStatus = 'loading'
      state.qcStatsError = null
    },

    setCallStats: (state, action: PayloadAction<{ total: number; reviewed: number; pending: number }>) => {
      state.qcStats = action.payload
      state.qcStatsStatus = 'succeeded'
      state.qcStatsError = null
    },

    setCallStatsError: (state, action: PayloadAction<string | null>) => {
      state.qcStatsError = action.payload
      state.qcStatsStatus = 'failed'
    },

    setIsAssigning: (state, action: PayloadAction<boolean>) => {
      state.isAssigning = action.payload
    },

    setIsUnassigning: (state, action: PayloadAction<boolean>) => {
      state.isUnassigning = action.payload
    },

    setClassificationDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isClassificationDialogOpen = action.payload
      if (!action.payload) {
        state.selectedClassification = ''
      }
    },

    setSelectedClassification: (state, action: PayloadAction<string>) => {
      state.selectedClassification = action.payload
    },

    // Test call status update
    setIsUpdatingTestCall: (state, action: PayloadAction<boolean>) => {
      state.isUpdatingTestCall = action.payload
      if (action.payload) {
        state.testCallUpdateError = null
      }
    },

    setTestCallUpdateError: (state, action: PayloadAction<string | null>) => {
      state.testCallUpdateError = action.payload
      state.isUpdatingTestCall = false
    },

    updateTestCallStatus: (state, action: PayloadAction<boolean>) => {
      if (state.callDetails) {
        state.callDetails.isTestCall = action.payload
      }
      state.isUpdatingTestCall = false
      state.testCallUpdateError = null
    },

    // Reset entire state
    reset: () => initialState,
  },
})

export const {
  setCalls,
  addCalls,
  selectCall,
  updateCall,
  setLoading,
  setError,
  updateFilters,
  resetFilters,
  incrementPage,
  setCallDetailsLoading,
  setCallDetails,
  setCallDetailsError,
  setCurrentPlaybackTime,
  setAudioDuration,
  setIsDurationLoading,
  resetAudioState,
  setHasMore,
  setCurrentPage,
  setCallStatsLoading,
  setCallStats,
  setCallStatsError,
  setIsAssigning,
  setIsUnassigning,
  setClassificationDialogOpen,
  setSelectedClassification,
  setIsUpdatingTestCall,
  setTestCallUpdateError,
  updateTestCallStatus,
  reset,
} = callsSlice.actions

export default callsSlice.reducer

