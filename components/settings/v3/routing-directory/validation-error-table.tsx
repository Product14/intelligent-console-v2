import { MdOutlineError } from 'react-icons/md';

import { InvalidRow } from '@/lib/settings/xlsx-validator';

interface ValidationErrorTableProps {
  invalidRows: InvalidRow[];
}

export const ValidationErrorTable = ({
  invalidRows,
}: ValidationErrorTableProps) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm font-medium text-red-600">
        <MdOutlineError className="h-4 w-4 shrink-0" />
        <span>
          {invalidRows.length} row{invalidRows.length > 1 ? 's' : ''} with
          errors — fix these in your file and re-upload
        </span>
      </div>

      <div className="overflow-auto rounded-lg border border-red-200">
        <table className="w-full min-w-max text-xs">
          <thead>
            <tr className="border-b border-red-200 bg-red-50">
              <th className="px-3 py-2 text-left font-medium text-red-700">
                Row
              </th>
              <th className="px-3 py-2 text-left font-medium text-red-700">
                First Name
              </th>
              <th className="px-3 py-2 text-left font-medium text-red-700">
                Last Name
              </th>
              <th className="px-3 py-2 text-left font-medium text-red-700">
                Role
              </th>
              <th className="px-3 py-2 text-left font-medium text-red-700">
                Department
              </th>
              <th className="px-3 py-2 text-left font-medium text-red-700">
                Phone Number
              </th>
              <th className="px-3 py-2 text-left font-medium text-red-700">
                Onboard (Y/N)
              </th>
              <th className="px-3 py-2 text-left font-medium text-red-700">
                Email
              </th>
              <th className="px-3 py-2 text-left font-medium text-red-700">
                Errors
              </th>
            </tr>
          </thead>
          <tbody>
            {invalidRows.map(({ rowNumber, data, errors }) => {
              const errorFields = new Set(errors.map((e) => e.field));
              const cellClass = (field: string) =>
                errorFields.has(field as any)
                  ? 'bg-red-50 text-red-700 font-medium'
                  : 'text-neutral-700';

              return (
                <tr
                  key={rowNumber}
                  className="border-b border-red-100 last:border-0"
                >
                  <td className="px-3 py-2 text-gray-400">{rowNumber}</td>
                  <td className={`px-3 py-2 ${cellClass('First Name')}`}>
                    {data['First Name'] || (
                      <span className="italic text-red-400">empty</span>
                    )}
                  </td>
                  <td className={`px-3 py-2 ${cellClass('Last Name')}`}>
                    {data['Last Name'] || (
                      <span className="italic text-red-400">empty</span>
                    )}
                  </td>
                  <td className={`px-3 py-2 ${cellClass('Role')}`}>
                    {data['Role'] || (
                      <span className="italic text-red-400">empty</span>
                    )}
                  </td>
                  <td className={`px-3 py-2 ${cellClass('Department')}`}>
                    {data['Department'] || (
                      <span className="italic text-red-400">empty</span>
                    )}
                  </td>
                  <td className={`px-3 py-2 ${cellClass('Phone Number')}`}>
                    {data['Phone Number'] || (
                      <span className="italic text-red-400">empty</span>
                    )}
                  </td>
                  <td
                    className={`px-3 py-2 ${cellClass('Onboard to Rooftop (Y/N)')}`}
                  >
                    {data['Onboard to Rooftop (Y/N)'] || (
                      <span className="italic text-red-400">empty</span>
                    )}
                  </td>
                  <td className={`px-3 py-2 ${cellClass('Email')}`}>
                    {data['Email'] || (
                      <span className="italic text-red-400">empty</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <ul className="flex flex-col gap-0.5">
                      {errors.map((e, i) => (
                        <li key={i} className="text-red-600">
                          <span className="font-medium">{e.field}:</span>{' '}
                          {e.message}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
