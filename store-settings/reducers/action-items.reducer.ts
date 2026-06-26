import { createReducer } from '@reduxjs/toolkit';

import {
  ActionItemsActionTypes,
  ActionItemsPayload,
  ResolutionStepsPayload,
  SetSelectedActionItemPayload,
  bulkUpdateActionItemsFailure,
  bulkUpdateActionItemsSuccess,
  fetchResolutionStepsFailure,
  fetchResolutionStepsSuccess,
  patchActionItems,
  setSelectedActionItem,
  updateActionItemFailure,
  updateActionItemSuccess,
} from '../actions/action-items.actions';
import {
  ActionItem,
  ActionItemsStoreInterface,
} from '../models/action-items.model';

const initialState: ActionItemsStoreInterface = {
  actionItems: [],
  actionItemsLoading: false,
  actionItemsLoaded: false,
  actionItemsError: false,
  selectedActionItem: null,
  pagination: null,
  // Add total counts initial state
  totalCounts: null,
  // Add resolution steps initial state
  resolutionSteps: null,
  resolutionStepsLoading: false,
  resolutionStepsError: false,
};

const actionItemsReducer = createReducer(initialState, (builder) => {
  builder
    // Patch action items (for loading states and data updates)
    .addCase(patchActionItems, (state, action) => {
      const payload: ActionItemsPayload = action.payload;

      if (payload.actionItems !== undefined) {
        if (payload.appendData) {
          // Append new items to existing ones (for infinite scroll)
          const existingIds = new Set(
            state.actionItems.map((item) => item.id || item._id)
          );
          const newItems = payload.actionItems.filter(
            (item) => !existingIds.has(item.id || item._id)
          );
          state.actionItems = [...state.actionItems, ...newItems];
        } else {
          // Replace all items (for initial load or refresh)
          state.actionItems = payload.actionItems;
        }
      }
      if (payload.loading !== undefined) {
        state.actionItemsLoading = payload.loading;
      }
      if (payload.loaded !== undefined) {
        state.actionItemsLoaded = payload.loaded;
      }
      if (payload.error !== undefined) {
        state.actionItemsError = payload.error;
      }
      if (payload.pagination !== undefined) {
        state.pagination = payload.pagination;
      }
      if (payload.totalCounts !== undefined) {
        state.totalCounts = payload.totalCounts;
      }
    })

    // Set selected action item
    .addCase(setSelectedActionItem, (state, action) => {
      const payload: SetSelectedActionItemPayload = action.payload;
      state.selectedActionItem = payload.actionItem;
    })

    // Update action item success
    .addCase(updateActionItemSuccess, (state, action) => {
      const { actionItemId, updatedActionItem } = action.payload;
      const index = state.actionItems.findIndex(
        (item) => item.id === actionItemId
      );

      let oldItem: ActionItem | undefined;
      if (index !== -1) {
        oldItem = state.actionItems[index];
        // Always update the item in place, don't remove it immediately
        // Let the frontend handle the removal after animation
        state.actionItems[index] = updatedActionItem;
      }

      // Update selected action item if it's the same one
      if (state.selectedActionItem?.id === actionItemId) {
        state.selectedActionItem = updatedActionItem;
      }

      // Update totalCounts if completion status changed
      if (state.totalCounts && oldItem) {
        const oldCompleted = oldItem.completed || oldItem.is_completed;
        const newCompleted =
          updatedActionItem.completed || updatedActionItem.is_completed;

        if (oldCompleted !== newCompleted) {
          if (newCompleted) {
            // Item was marked as completed
            state.totalCounts.completed += 1;
            state.totalCounts.incomplete -= 1;
          } else {
            // Item was marked as incomplete
            state.totalCounts.completed -= 1;
            state.totalCounts.incomplete += 1;
          }
        }
      }
    })

    // Update action item failure
    .addCase(updateActionItemFailure, (state, action) => {
      // Handle error state if needed
      state.actionItemsError = true;
    })

    // Add resolution steps cases
    .addCase(fetchResolutionStepsSuccess, (state, action) => {
      const payload: ResolutionStepsPayload = action.payload;

      if (payload.loading !== undefined) {
        state.resolutionStepsLoading = payload.loading;
      }

      if (payload.error !== undefined) {
        state.resolutionStepsError = payload.error;
      }

      if (payload.resolutionSteps && payload.actionItemId) {
        if (!state.resolutionSteps) {
          state.resolutionSteps = {};
        }
        state.resolutionSteps[payload.actionItemId] = payload.resolutionSteps;
      }
    })

    .addCase(fetchResolutionStepsFailure, (state, action) => {
      const payload: ResolutionStepsPayload = action.payload;

      state.resolutionStepsLoading = false;
      state.resolutionStepsError = true;
    })

    // Bulk update action items success
    .addCase(bulkUpdateActionItemsSuccess, (state, action) => {
      const { actionItemIds, isCompleted, updatedActionItems } = action.payload;

      // Update each item in the state
      updatedActionItems.forEach((updatedItem) => {
        const index = state.actionItems.findIndex(
          (item) => item.id === updatedItem.id
        );

        if (index !== -1) {
          const oldItem = state.actionItems[index];
          // Update the item in place
          state.actionItems[index] = updatedItem;

          // Update totalCounts if completion status changed
          if (state.totalCounts) {
            const oldCompleted = oldItem.completed || oldItem.is_completed;
            const newCompleted =
              updatedItem.completed || updatedItem.is_completed;

            if (oldCompleted !== newCompleted) {
              if (newCompleted) {
                // Item was marked as completed
                state.totalCounts.completed += 1;
                state.totalCounts.incomplete -= 1;
              } else {
                // Item was marked as incomplete
                state.totalCounts.completed -= 1;
                state.totalCounts.incomplete += 1;
              }
            }
          }
        }
      });
    })

    // Bulk update action items failure
    .addCase(bulkUpdateActionItemsFailure, (state, action) => {
      // Handle error state if needed
      state.actionItemsError = true;
    });
});

export default actionItemsReducer;
