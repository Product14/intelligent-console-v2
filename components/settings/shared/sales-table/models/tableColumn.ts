import {
  ColumnHeader,
  ColumnID,
} from '@/components/settings/shared/sales-table/models/columnMeta';

import {
  ConversationColumnHeader,
  ConversationColumnID,
} from './conversationColumnMeta';

export interface TableColumn {
  id: ColumnID | ConversationColumnID;
  header: ColumnHeader | ConversationColumnHeader;
  colWidth?: string;
  minWidth?: string;
  maxWidth?: string;
  priority?: 'high' | 'medium' | 'low';
  responsiveClasses?: string;
  showVerticalSeperator?: boolean;
  enableFilter?: boolean;
  disabled?: boolean;
}
