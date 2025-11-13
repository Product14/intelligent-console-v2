import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../index'

// Basic selectors
export const selectIssues = (state: RootState) => state.issues.issues
export const selectSelectedIssue = (state: RootState) => state.issues.selectedIssue
export const selectIssuesLoading = (state: RootState) => state.issues.loading
export const selectIssuesError = (state: RootState) => state.issues.error
export const selectIssuesCallId = (state: RootState) => state.issues.callId
export const selectIssueGroups = (state: RootState) => state.issues.issueGroups
export const selectIsIssuesPanelOpen = (state: RootState) => state.issues.isPanelOpen
export const selectActiveIssuesTab = (state: RootState) => state.issues.activeTab
export const selectMarkIssueStatus = (state: RootState) => state.issues.markIssueStatus
export const selectMarkIssueError = (state: RootState) => state.issues.markIssueError
export const selectLastIssueNote = (state: RootState) => state.issues.lastIssueNote
export const selectEditingNoteId = (state: RootState) => state.issues.editingNoteId
export const selectEditNoteText = (state: RootState) => state.issues.editNoteText
export const selectMarkIssueDraft = (state: RootState) => state.issues.markIssueDraft
export const selectSelectedTranscriptIndex = (state: RootState) => state.issues.selectedTranscriptIndex
export const selectMarkedTranscriptIndices = (state: RootState) => state.issues.markedTranscriptIssues

// Memoized selectors
export const selectIssuesByCallId = createSelector(
  [selectIssues, (_: RootState, callId: string) => callId],
  (issues, callId) => issues.filter(issue => issue.reviewId === callId)
)

export const selectIssueById = createSelector(
  [selectIssues, (_: RootState, issueId: string) => issueId],
  (issues, issueId) => issues.find(issue => issue.id === issueId)
)

export const selectIssuesBySeverity = createSelector(
  [selectIssues, (_: RootState, severity: string) => severity],
  (issues, severity) => issues.filter(issue => issue.severity === severity)
)

export const selectIssueGroupsCount = createSelector(
  [selectIssueGroups],
  (groups) => groups.reduce((total, group) => total + group.issues.length, 0)
)

