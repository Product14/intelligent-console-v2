import { createAction } from '@reduxjs/toolkit';

import {
  ActionItem,
  FetchActionItemsParams,
  PaginationMeta,
  ResolutionSteps,
} from '../models/action-items.model';

export interface ActionItemsPayload {
  actionItems?: ActionItem[];
  loading?: boolean;
  loaded?: boolean;
  error?: boolean;
  enterpriseId?: string;
  teamId?: string;
  pagination?: PaginationMeta;
  totalCounts?: {
    total: number;
    completed: number;
    incomplete: number;
  };
  appendData?: boolean; // Flag to indicate whether to append or replace data
}

export interface SetSelectedActionItemPayload {
  actionItem: ActionItem | null;
}

export interface UpdateActionItemPayload {
  actionItemId: string;
  updates: Partial<ActionItem>;
  enterpriseId: string;
  teamId: string;
}

export interface FetchResolutionStepsPayload {
  actionItemId: string;
}

export interface ResolutionStepsPayload {
  actionItemId: string;
  resolutionSteps?: ResolutionSteps;
  loading?: boolean;
  error?: boolean;
}

export interface BulkUpdateActionItemPayload {
  actionItemIds: string[];
  isCompleted: boolean;
  enterpriseId: string;
  teamId: string;
}

export enum ActionItemsActionTypes {
  FETCH_ACTION_ITEMS = 'actionItems/fetchActionItems',
  FETCH_MORE_ACTION_ITEMS = 'actionItems/fetchMoreActionItems',
  PATCH_ACTION_ITEMS = 'actionItems/patchActionItems',
  SET_SELECTED_ACTION_ITEM = 'actionItems/setSelectedActionItem',
  UPDATE_ACTION_ITEM = 'actionItems/updateActionItem',
  UPDATE_ACTION_ITEM_SUCCESS = 'actionItems/updateActionItemSuccess',
  UPDATE_ACTION_ITEM_FAILURE = 'actionItems/updateActionItemFailure',
  // Bulk operations
  BULK_UPDATE_ACTION_ITEMS = 'actionItems/bulkUpdateActionItems',
  BULK_UPDATE_ACTION_ITEMS_SUCCESS = 'actionItems/bulkUpdateActionItemsSuccess',
  BULK_UPDATE_ACTION_ITEMS_FAILURE = 'actionItems/bulkUpdateActionItemsFailure',
  // Add resolution steps actions
  FETCH_RESOLUTION_STEPS = 'actionItems/fetchResolutionSteps',
  FETCH_RESOLUTION_STEPS_SUCCESS = 'actionItems/fetchResolutionStepsSuccess',
  FETCH_RESOLUTION_STEPS_FAILURE = 'actionItems/fetchResolutionStepsFailure',
}

// Fetch action items
export const fetchActionItems = createAction<FetchActionItemsParams>(
  ActionItemsActionTypes.FETCH_ACTION_ITEMS
);

// Fetch more action items (for infinite scroll)
export const fetchMoreActionItems = createAction<FetchActionItemsParams>(
  ActionItemsActionTypes.FETCH_MORE_ACTION_ITEMS
);

// Patch action items (for updating loading states and data)
export const patchActionItems = createAction<ActionItemsPayload>(
  ActionItemsActionTypes.PATCH_ACTION_ITEMS
);

// Set selected action item
export const setSelectedActionItem = createAction<SetSelectedActionItemPayload>(
  ActionItemsActionTypes.SET_SELECTED_ACTION_ITEM
);

// Update action item (for status changes, assignee changes, etc.)
export const updateActionItem = createAction<UpdateActionItemPayload>(
  ActionItemsActionTypes.UPDATE_ACTION_ITEM
);

export const updateActionItemSuccess = createAction<{
  actionItemId: string;
  updatedActionItem: ActionItem;
}>(ActionItemsActionTypes.UPDATE_ACTION_ITEM_SUCCESS);

export const updateActionItemFailure = createAction<{
  actionItemId: string;
  error: string;
}>(ActionItemsActionTypes.UPDATE_ACTION_ITEM_FAILURE);

// Bulk update action items
export const bulkUpdateActionItems = createAction<BulkUpdateActionItemPayload>(
  ActionItemsActionTypes.BULK_UPDATE_ACTION_ITEMS
);

export const bulkUpdateActionItemsSuccess = createAction<{
  actionItemIds: string[];
  isCompleted: boolean;
  updatedActionItems: ActionItem[];
}>(ActionItemsActionTypes.BULK_UPDATE_ACTION_ITEMS_SUCCESS);

export const bulkUpdateActionItemsFailure = createAction<{
  actionItemIds: string[];
  error: string;
}>(ActionItemsActionTypes.BULK_UPDATE_ACTION_ITEMS_FAILURE);

// Add resolution steps actions
export const fetchResolutionSteps = createAction<FetchResolutionStepsPayload>(
  ActionItemsActionTypes.FETCH_RESOLUTION_STEPS
);

export const fetchResolutionStepsSuccess = createAction<ResolutionStepsPayload>(
  ActionItemsActionTypes.FETCH_RESOLUTION_STEPS_SUCCESS
);

export const fetchResolutionStepsFailure = createAction<ResolutionStepsPayload>(
  ActionItemsActionTypes.FETCH_RESOLUTION_STEPS_FAILURE
);
