import React from 'react';

import SelectChip from '@spyne-console/design-system/select-chip';

import { ColumnHeader } from '@/components/settings/shared/sales-table/models/columnMeta';
import { TableColumn } from '@/components/settings/shared/sales-table/models/tableColumn';
import { AvailabilityTimeStamp } from '@/components/settings/shared/sales-table/row-components/AvailabilityTimeStamp';
import { MemberDetails } from '@/components/settings/shared/sales-table/row-components/MemberDetails';
import TableCell from '@/components/settings/shared/sales-table/table-base/TableCell';

interface TeamAvailabilityRowRendererProps {
  item: any;
  columnData: TableColumn[];
  setShowRealAvailabilityModal: (show: boolean) => void;
  setSelectedDepartment: (department: string) => void;
}

const TeamAvailabilityRowRenderer: React.FC<
  TeamAvailabilityRowRendererProps
> = ({
  item,
  columnData,
  setShowRealAvailabilityModal,
  setSelectedDepartment,
}) => {
  const renderCell = (column: TableColumn) => {
    switch (column.header) {
      case ColumnHeader.NAME:
        return <MemberDetails member={item} />;
      case ColumnHeader.SENIORITY:
        return (
          <div className="text-left">
            <SelectChip
              id="seniority"
              className="inline-flex items-center justify-center border-none bg-slate-50 text-xs text-indigo-900"
              label={item.senority}
              value={item.senority}
            />
          </div>
        );
      case ColumnHeader.ROLE:
        return (
          <div className="text-left">
            <SelectChip
              className="inline-flex items-center justify-center border-none bg-slate-50 text-xs text-indigo-900"
              id="role"
              label={item.role}
              value={item.role}
            />
          </div>
        );
      case ColumnHeader.AVAILABILITY:
        return (
          <div className="text-left">
            <AvailabilityTimeStamp
              setSelectedDepartment={setSelectedDepartment}
              setShowRealAvailabilityModal={setShowRealAvailabilityModal}
              representative={item}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {columnData.map((column, colIndex) => (
        <TableCell
          key={column.id}
          className={`p-6 ${column?.disabled ? 'opacity-40' : ''} border-x border-gray-100`}
          style={{ width: column.colWidth }}
        >
          <div className="w-full">{renderCell(column)}</div>
        </TableCell>
      ))}
    </>
  );
};

export default TeamAvailabilityRowRenderer;
