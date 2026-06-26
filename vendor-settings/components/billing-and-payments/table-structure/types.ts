export type TableAlignment = 'left' | 'center' | 'right';
export interface TablePagination {
  page: number;
  pageSize: number;
  total: number;
}
export interface TableWrapperProps<T extends { id: string }> {
  columns: TableColumn<T>[];
  data: T[];
  filters?: TableFilterConfig[];
  pagination?: TablePagination;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  getRowClassName?: (row: T) => string;
  loadingState?: TableLoadingState;
  bodyClassName?: string;
}
export interface TableColumn<T> {
  id: string;
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  align?: TableAlignment;
  width?: string;
  sortable?: boolean;
  cellClassName?: string;
  minWidth?: string;
  maxWidth?: string;
  sticky?: boolean;
}

export interface TableRowAction<T> {
  id: string;
  label: string;
  onClick: (row: T) => void;
}

export interface TableFilterOption {
  label: string;
  value: string;
}

export interface TableFilterConfig {
  id: string;
  label: string;
  options: TableFilterOption[];
}

export interface TableSkeletonProps<T> {
  rows: number;
  columns: TableColumn<T>[];
  colClassName: string;
}

export interface TableLoadingState {
  isLoading?: boolean;
  skeletonRows?: number;
}

export interface TablePaginationProps {
  pagination: TablePagination;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  loadingState?: TableLoadingState;
  paginationClassName?: string;
  paginationContainerClassName?: string;
}
