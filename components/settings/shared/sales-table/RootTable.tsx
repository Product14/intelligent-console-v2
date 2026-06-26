import React, { FC, memo, useEffect, useMemo, useState } from 'react';
import { MdChevronLeft, MdExpandMore, MdPersonAddAlt } from 'react-icons/md';

import BodyRowRenderer from '@/components/settings/shared/sales-table/BodyRowRenderer';
import ColumnRenderer from '@/components/settings/shared/sales-table/ColumnRenderer';
import {
  ColumnHeader,
  ColumnID,
} from '@/components/settings/shared/sales-table/models/columnMeta';
import TableCell from '@/components/settings/shared/sales-table/table-base/TableCell';
import TableRow from '@/components/settings/shared/sales-table/table-base/TableRow';

import { TableColumn } from './models/tableColumn';

interface RootTableProps {
  areRowsLoading: boolean;
  itemsPerPage: number;
  rowData: any[];
  setShowRealAvailabilityModal: (show: boolean) => void;
  setShowAvailabilityModal: (show: boolean) => void;
  setSelectedDepartment: (department: string) => void;
}

const RootTable: FC<RootTableProps> = ({
  areRowsLoading,
  itemsPerPage = 6,
  rowData,
  setShowRealAvailabilityModal,
  setShowAvailabilityModal,
  setSelectedDepartment,
}) => {
  const [expandedGroups, setExpandedGroups] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    const groups = rowData.reduce(
      (acc, curr) => {
        const group = curr?.department || 'Unassigned';
        acc[group] = true;
        return acc;
      },
      {} as { [key: string]: boolean }
    );

    setExpandedGroups(groups);
  }, [rowData]);

  const columnHeaders: TableColumn[] = useMemo(
    () => [
      {
        id: ColumnID.NAME,
        header: ColumnHeader.NAME,
        colWidth: 'auto',
      },
      {
        id: ColumnID.SENIORITY,
        header: ColumnHeader.SENIORITY,
        colWidth: '180px',
      },
      {
        id: ColumnID.ROLE,
        header: ColumnHeader.ROLE,
        colWidth: '180px',
      },
      {
        id: ColumnID.AVAILABILITY,
        header: ColumnHeader.AVAILABILITY,
        colWidth: 'auto',
      },
    ],
    []
  );

  const groupedRows = useMemo(() => {
    return rowData.reduce((acc, curr) => {
      const group = curr?.department || 'Unassigned';
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(curr);
      return acc;
    }, {});
  }, [rowData]);

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  return (
    <table className="w-full min-w-full table-fixed border-collapse">
      <thead>
        <TableRow className="bg-gray-50">
          <ColumnRenderer data={columnHeaders} />
        </TableRow>
      </thead>
      <tbody>
        {Object.keys(groupedRows)
          .filter((group) => groupedRows[group].length > 0)
          .map((group, index) => (
            <React.Fragment key={index}>
              <TableRow>
                <TableCell colSpan={columnHeaders.length}>
                  <div className="h-4" />
                </TableCell>
              </TableRow>
              <TableRow className="outline-1 outline-gray-100">
                <TableCell colSpan={columnHeaders.length} className="p-0">
                  <div
                    className={`flex w-full items-center justify-between border border-gray-100 px-6 py-3 ${expandedGroups[group] ? 'rounded-t-xl' : 'rounded-xl'}`}
                  >
                    <div className="text-black-80 text-lg font-semibold">
                      {group}
                    </div>
                    <div className="flex items-center gap-6">
                      <div
                        onClick={() => {
                          setSelectedDepartment(group);
                          setShowAvailabilityModal(true);
                        }}
                        className="flex cursor-pointer items-center justify-end gap-2"
                      >
                        <MdPersonAddAlt className="text-black-40 h-5 w-5" />
                        <div className="text-black-60 text-sm font-semibold">
                          Add User
                        </div>
                      </div>
                      <MdExpandMore
                        className={`text-black-60 h-6 w-6 transform cursor-pointer transition-transform ${expandedGroups[group] ? 'rotate-0' : '-rotate-180'}`}
                        onClick={() => toggleGroup(group)}
                      />
                    </div>
                  </div>
                </TableCell>
              </TableRow>
              {!!expandedGroups[group] && (
                <BodyRowRenderer
                  setSelectedDepartment={setSelectedDepartment}
                  setShowRealAvailabilityModal={setShowRealAvailabilityModal}
                  areRowsLoading={areRowsLoading}
                  itemsPerPage={itemsPerPage}
                  columnData={columnHeaders}
                  rowData={groupedRows[group]}
                  variant="default"
                />
              )}
            </React.Fragment>
          ))}
      </tbody>
    </table>
  );
};

export default memo(RootTable);
