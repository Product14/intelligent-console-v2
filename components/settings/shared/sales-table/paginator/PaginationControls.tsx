import React from 'react';

import { PaginatorBaseProps } from '../models/PaginatorBaseProps';
import { NavigateButtonType } from '../models/navigateButtonType';
import NavigateButton from './NavigateButton';
import PageLegend from './PageLegend';

export const PaginationControls: React.FC<PaginatorBaseProps> = ({
  currentPage,
  totalPages,
  handlePageChange,
}) => {
  return (
    <div className="mt-4 flex items-center justify-center gap-2">
      <NavigateButton
        type={NavigateButtonType.PREVIOUS}
        isPageLimitReached={currentPage === 1}
        navigate={() => handlePageChange(currentPage - 1)}
      />

      <PageLegend
        totalPages={totalPages}
        currentPage={currentPage}
        handlePageChange={(page) => handlePageChange(page)}
      />

      <NavigateButton
        type={NavigateButtonType.NEXT}
        isPageLimitReached={currentPage === totalPages}
        navigate={() => handlePageChange(currentPage + 1)}
      />
    </div>
  );
};
