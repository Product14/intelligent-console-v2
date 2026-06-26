import React from 'react';

import RootTable from './RootTable';
import { PaginationControls } from './paginator/PaginationControls';

interface SalesTableProps {
  data: any[];
  handleSort: (columnId: string) => void;
  itemsPerPage?: number;
  sortColumn: string | null;
  minWidth?: string;
  sortOrder: 'asc' | 'desc' | null;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  setShowRealAvailabilityModal: (show: boolean) => void;
  setShowAvailabilityModal: (show: boolean) => void;
  setSelectedDepartment: (department: string) => void;
}

const SalesTable: React.FC<SalesTableProps> = ({
  data,
  itemsPerPage = 6,
  currentPage: externalCurrentPage,
  totalPages: externalTotalPages,
  onPageChange,
  setShowRealAvailabilityModal,
  setShowAvailabilityModal,
  setSelectedDepartment,
}) => {
  const [internalCurrentPage, setInternalCurrentPage] = React.useState(1);
  const currentPage = externalCurrentPage ?? internalCurrentPage;
  const totalPages =
    externalTotalPages ?? Math.ceil(data?.length / itemsPerPage);

  const indexOfLastItem = externalTotalPages
    ? 1 * itemsPerPage
    : currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data;

  const handlePageChange = (page: number) => {
    // Update internal state when page changes
    setInternalCurrentPage(page);
    // Call external handler if provided
    onPageChange?.(page);
  };

  return (
    <>
      <RootTable
        setSelectedDepartment={setSelectedDepartment}
        setShowAvailabilityModal={setShowAvailabilityModal}
        setShowRealAvailabilityModal={setShowRealAvailabilityModal}
        areRowsLoading={false}
        itemsPerPage={itemsPerPage}
        rowData={currentItems}
      />
      {/* <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        handlePageChange={(page) => handlePageChange(page)}
      /> */}
    </>
  );
};

export default SalesTable;
