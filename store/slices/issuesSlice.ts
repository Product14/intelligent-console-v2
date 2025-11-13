import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { QAAnnotation } from '@/lib/types'
import type { CallIssueGroup } from '@/services'

interface IssuesState {
  issues: QAAnnotation[]
  selectedIssue: QAAnnotation | null
  loading: boolean
  error: string | null
  callId: string | null
  issueGroups: CallIssueGroup[]
  isPanelOpen: boolean
  activeTab: 'new-issue' | 'previous-issues'
  markIssueStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  markIssueError: string | null
  lastIssueNote: { timestamp: number; note: string } | null
  editingNoteId: string | null
  editNoteText: string
  markIssueDraft: {
    transcriptText: string
    timestamp: number
    transcriptIndex?: number
  } | null
  selectedTranscriptIndex: number | null
  markedTranscriptIssues: number[]
}

const initialState: IssuesState = {
  issues: [],
  selectedIssue: null,
  loading: false,
  error: null,
  callId: null,
  issueGroups: [],
  isPanelOpen: false,
  activeTab: 'previous-issues',
  markIssueStatus: 'idle',
  markIssueError: null,
  lastIssueNote: null,
  editingNoteId: null,
  editNoteText: '',
  markIssueDraft: null,
  selectedTranscriptIndex: null,
  markedTranscriptIssues: [],
}

const issuesSlice = createSlice({
  name: 'issues',
  initialState,
  reducers: {
    // Set issues for a call
    setIssues: (state, action: PayloadAction<{ callId: string; issues: QAAnnotation[] }>) => {
      state.issues = action.payload.issues
      state.callId = action.payload.callId
      state.error = null
    },

    setIssueGroups: (state, action: PayloadAction<{ callId: string; groups: CallIssueGroup[] }>) => {
      state.issueGroups = action.payload.groups
      state.callId = action.payload.callId
      state.error = null
    },
    
    // Add a new issue
    addIssue: (state, action: PayloadAction<QAAnnotation>) => {
      state.issues.push(action.payload)
    },
    
    // Update an issue
    updateIssue: (state, action: PayloadAction<{ issueId: string; updates: Partial<QAAnnotation> }>) => {
      const { issueId, updates } = action.payload
      const index = state.issues.findIndex(issue => issue.id === issueId)
      if (index !== -1) {
        state.issues[index] = { ...state.issues[index], ...updates }
      }
      if (state.selectedIssue?.id === issueId) {
        state.selectedIssue = { ...state.selectedIssue, ...updates }
      }
    },
    
    // Remove an issue
    removeIssue: (state, action: PayloadAction<string>) => {
      state.issues = state.issues.filter(issue => issue.id !== action.payload)
      if (state.selectedIssue?.id === action.payload) {
        state.selectedIssue = null
      }
    },
    
    // Select an issue
    selectIssue: (state, action: PayloadAction<QAAnnotation | null>) => {
      state.selectedIssue = action.payload
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

    setMarkIssueStatus: (state, action: PayloadAction<'idle' | 'loading' | 'succeeded' | 'failed'>) => {
      state.markIssueStatus = action.payload
      if (action.payload === 'loading') {
        state.markIssueError = null
      }
    },

    setMarkIssueError: (state, action: PayloadAction<string | null>) => {
      state.markIssueError = action.payload
      state.markIssueStatus = action.payload ? 'failed' : state.markIssueStatus
    },

    setLastIssueNote: (state, action: PayloadAction<{ timestamp: number; note: string } | null>) => {
      state.lastIssueNote = action.payload
    },

    setEditingNote: (state, action: PayloadAction<string | null>) => {
      state.editingNoteId = action.payload
      if (action.payload === null) {
        state.editNoteText = ''
      }
    },

    setEditNoteText: (state, action: PayloadAction<string>) => {
      state.editNoteText = action.payload
    },

    setMarkIssueDraft: (state, action: PayloadAction<IssuesState['markIssueDraft']>) => {
      state.markIssueDraft = action.payload
    },

    setSelectedTranscriptIndex: (state, action: PayloadAction<number | null>) => {
      state.selectedTranscriptIndex = action.payload
    },

    addMarkedTranscriptIndex: (state, action: PayloadAction<number>) => {
      if (!state.markedTranscriptIssues.includes(action.payload)) {
        state.markedTranscriptIssues.push(action.payload)
      }
    },

    setMarkedTranscriptIndices: (state, action: PayloadAction<number[]>) => {
      state.markedTranscriptIssues = action.payload
    },

    resetMarkedTranscriptIndices: (state) => {
      state.markedTranscriptIssues = []
    },

    // Panel visibility & tabs
    setIssuePanelOpen: (state, action: PayloadAction<boolean>) => {
      state.isPanelOpen = action.payload
    },

    setActiveTab: (state, action: PayloadAction<'new-issue' | 'previous-issues'>) => {
      state.activeTab = action.payload
    },
    
    // Reset entire state
    reset: () => initialState,
  },
})

export const {
  setIssues,
  setIssueGroups,
  addIssue,
  updateIssue,
  removeIssue,
  selectIssue,
  setLoading,
  setError,
  setMarkIssueStatus,
  setMarkIssueError,
  setLastIssueNote,
  setEditingNote,
  setEditNoteText,
  setMarkIssueDraft,
  setSelectedTranscriptIndex,
  addMarkedTranscriptIndex,
  setMarkedTranscriptIndices,
  resetMarkedTranscriptIndices,
  setIssuePanelOpen,
  setActiveTab,
  reset,
} = issuesSlice.actions

export default issuesSlice.reducer

