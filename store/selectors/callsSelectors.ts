import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../index'

// Basic selectors
export const selectCalls = (state: RootState) => state.calls.calls
export const selectSelectedCall = (state: RootState) => state.calls.selectedCall
export const selectCallsLoading = (state: RootState) => state.calls.loading
export const selectCallsError = (state: RootState) => state.calls.error
export const selectCallsFilters = (state: RootState) => state.calls.filters
export const selectCallsCurrentPage = (state: RootState) => state.calls.currentPage
export const selectCallsHasMore = (state: RootState) => state.calls.hasMore
export const selectCallDetails = (state: RootState) => state.calls.callDetails
export const selectCallDetailsStatus = (state: RootState) => state.calls.callDetailsStatus
export const selectCallDetailsError = (state: RootState) => state.calls.callDetailsError
export const selectCurrentPlaybackTime = (state: RootState) => state.calls.currentPlaybackTime
export const selectAudioDuration = (state: RootState) => state.calls.audioDuration
export const selectIsDurationLoading = (state: RootState) => state.calls.isDurationLoading
export const selectCurrentCallId = (state: RootState) => state.calls.currentCallId
export const selectQCStats = (state: RootState) => state.calls.qcStats
export const selectQCStatsStatus = (state: RootState) => state.calls.qcStatsStatus
export const selectQCStatsError = (state: RootState) => state.calls.qcStatsError
export const selectIsAssigning = (state: RootState) => state.calls.isAssigning
export const selectIsUnassigning = (state: RootState) => state.calls.isUnassigning
export const selectIsClassificationDialogOpen = (state: RootState) => state.calls.isClassificationDialogOpen
export const selectSelectedClassification = (state: RootState) => state.calls.selectedClassification

// Memoized selectors
export const selectUniqueAgentNames = createSelector(
  [selectCalls],
  (calls): string[] => {
    const names = new Set<string>()
    calls.forEach((call) => {
      if (call.agentName) {
        names.add(call.agentName)
      }
    })
    return Array.from(names).sort((a, b) => a.localeCompare(b))
  }
)

export const selectFilteredCalls = createSelector(
  [selectCalls, selectCallsFilters],
  (calls, filters) => {
    // Additional client-side filtering if needed
    return calls
  }
)

export const selectCallById = createSelector(
  [selectCalls, (_: RootState, callId: string) => callId],
  (calls, callId) => calls.find(call => call.id === callId)
)

export const selectHasCallDetails = createSelector(
  [selectCallDetailsStatus, selectCallDetails],
  (status, details) => status === 'succeeded' && !!details
)

