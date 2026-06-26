import React, { useMemo } from 'react';

import { leftArrowSvg, rightArrowSvg } from '../../../public/assets/svg';

const PaginationWrapper = ({ pageNo, totalPage, loadMoreData = () => {} }) => {
  const paginationWrapper = useMemo(() => {
    let selectedStyle = {
      backgroundColor: 'rgba(70, 0, 242, 0.04)',
      color: '#4600F2',
    };
    let visibleBox = 3;
    if (totalPage >= 20) {
      visibleBox = 5;
    }
    let visiblePageNo = [];
    if (totalPage >= 10) {
      visiblePageNo[0] = 1;

      if (pageNo < visibleBox + 1) {
        for (var i = 2; i <= visibleBox + 1; i++) {
          visiblePageNo.push(i);
        }
        visiblePageNo.push('...');
      } else if (pageNo > totalPage - visibleBox) {
        visiblePageNo.push('...');
        for (var i = totalPage - visibleBox; i < totalPage; i++) {
          visiblePageNo.push(i);
        }
      } else {
        visiblePageNo.push('...');
        for (var i = pageNo - 1; i < pageNo - 1 + visibleBox; i++) {
          visiblePageNo.push(i);
        }
        visiblePageNo.push('...');
      }

      visiblePageNo.push(totalPage);
    } else {
      for (let i = 1; i <= totalPage; i++) {
        visiblePageNo.push(i);
      }
    }

    return (
      <div className="flex justify-center items-center py-4">
        <div
          className="w-8 h-8 flex items-center justify-center cursor-pointer"
          onClick={() => (pageNo > 1 ? loadMoreData(pageNo - 1) : null)}
        >
          {leftArrowSvg(20, 20, pageNo == 1 ? '0.4' : '0.8')}
        </div>

        {visiblePageNo?.map((page, i) => {
          return (
            <div
              className="w-8 h-8 rounded-full flex items-center cursor-pointer justify-center text-black"
              style={page == pageNo ? selectedStyle : {}}
              onClick={() => loadMoreData(page)}
            >
              {page}
            </div>
          );
        })}

        <div
          className="w-8 h-8 flex items-center justify-center cursor-pointer"
          onClick={() => (pageNo < totalPage ? loadMoreData(pageNo + 1) : null)}
        >
          {rightArrowSvg(20, 20, pageNo == totalPage ? '0.4' : '0.8')}
        </div>
      </div>
    );
  }, [pageNo]);

  return <>{paginationWrapper}</>;
};

export default PaginationWrapper;
