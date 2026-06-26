import React, { useRef } from 'react';

function BottomModal({ children, ref }) {
  return (
    <div
      className="relative z-[120]"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      <div className="fixed inset-0 z-20 overflow-y-auto">
        <div className="ltb:items-center ltb:p-4 flex min-h-full items-end justify-center text-center">
          <div
            className="ltb:items-center fixed bottom-0 m-0 flex w-full flex-col overflow-y-scroll rounded-t-3xl bg-white"
            ref={ref}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
export default BottomModal;
