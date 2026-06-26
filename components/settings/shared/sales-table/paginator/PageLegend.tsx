import { memo, useCallback } from 'react';

import { PaginatorBaseProps } from '../models/PaginatorBaseProps';

interface PageNumberButtonProps {
  pageNumber: number;
  currentPage: number;
  navigateToPage: () => void;
}

const PageNumberButton = memo(
  ({ pageNumber, currentPage, navigateToPage }: PageNumberButtonProps) => {
    return (
      <button
        type="button"
        onClick={navigateToPage}
        className={`flex h-6 w-6 items-center justify-center rounded-[24px] p-2 ${
          currentPage === pageNumber
            ? 'bg-[#4600F2]/10 font-normal text-[#4600F2]'
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        {pageNumber}
      </button>
    );
  }
);

const Ellipsis = memo(() => <span className="mx-1">...</span>);

const PageLegend = ({
  totalPages,
  currentPage,
  handlePageChange,
}: PaginatorBaseProps) => {
  const shouldShowPageNumber = useCallback(
    (pageNumber: number) => {
      return (
        pageNumber <= 3 ||
        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
      );
    },
    [currentPage]
  );

  const shouldShowEllipsis = useCallback(
    (pageNumber: number) => {
      return pageNumber === 4 || pageNumber === currentPage + 2;
    },
    [currentPage]
  );

  return (
    <div className="flex items-center gap-1">
      {[...Array(totalPages)].map((_, index) => {
        const pageNumber = index + 1;
        if (shouldShowPageNumber(pageNumber)) {
          return (
            <PageNumberButton
              key={pageNumber}
              pageNumber={pageNumber}
              currentPage={currentPage}
              navigateToPage={() => handlePageChange(pageNumber)}
            />
          );
        } else if (shouldShowEllipsis(pageNumber)) {
          return <Ellipsis />;
        }
        return null;
      })}
    </div>
  );
};

export default memo(PageLegend);
