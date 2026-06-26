import React from 'react';

const StatusBadge = ({ status }: { status: string }) => {
  const statusData: Record<string, { className: string; label: string }> = {
    pending: {
      className: 'bg-[#FFE3E0] text-[#B42318] border-[#B423181A]',
      label: 'Approval Pending',
    },
  };
  return status === 'pending' ? (
    <span
      className={`rounded-2xl border px-2 py-0.5 text-xs font-medium uppercase leading-4 ${statusData[status]?.className}`}
    >
      {statusData[status].label}
    </span>
  ) : (
    <></>
  );
};

export default StatusBadge;
