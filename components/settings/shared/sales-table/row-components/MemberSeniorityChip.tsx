import { seniorityOptions } from '@/app-models-settings/SalesAvailabililty';

import { IoMdCheckmark } from 'react-icons/io';

import CommonDropdown from '@/components/settings/shared/dropdown/Dropdown';

export const MemberSeniorityChip = ({ level }: { level: string }) => {
  return (
    <div className="relative">
      <CommonDropdown>
        <CommonDropdown.Trigger className="inline-flex items-center justify-start justify-center gap-1 rounded-2xl border-none bg-slate-50 px-2 py-0.5 text-center text-xs font-medium text-indigo-900">
          {level}
        </CommonDropdown.Trigger>
        <CommonDropdown.Menu>
          <CommonDropdown.Options className="max-h-60">
            {seniorityOptions.map((option) => (
              <CommonDropdown.Option
                key={option.id}
                onClick={() => {}}
                className={
                  option.value === level
                    ? 'bg-gray-100 font-medium text-purple-700'
                    : ''
                }
              >
                <div className="flex w-full items-center justify-between">
                  <span>{option.label}</span>
                  {option.value === level && (
                    <IoMdCheckmark className="h-5 w-5 text-purple-700" />
                  )}
                </div>
              </CommonDropdown.Option>
            ))}
          </CommonDropdown.Options>
        </CommonDropdown.Menu>
      </CommonDropdown>
    </div>
  );
};
