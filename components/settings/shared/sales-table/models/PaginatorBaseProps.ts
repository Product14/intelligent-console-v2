export interface PaginatorBaseProps {
  totalPages: number;
  currentPage: number;
  handlePageChange: (pageNumber: number) => void;
}
