// Export all conversation-related types
export * from './leads';
export * from './chat';
export * from './call';
export * from './email';

// Re-export commonly used types for convenience
export type {
  Lead,
  LastInteraction,
  LeadsApiResponse,
  LeadsPagination,
  UnreadCounts,
} from './leads';
