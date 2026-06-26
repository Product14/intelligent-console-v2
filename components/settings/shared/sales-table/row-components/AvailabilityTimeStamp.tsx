import { TeamRepresentative } from '@/app-models-settings/SalesAvailabililty';

import { GrLanguage } from 'react-icons/gr';
import {
  MdOutlineCalendarMonth,
  MdOutlineModeEditOutline,
} from 'react-icons/md';

import { useQueryParams } from '@/hooks/settings/useQueryParams';

interface AvailabilityTimeStampProps {
  representative: TeamRepresentative;
  setShowRealAvailabilityModal: (show: boolean) => void;
  setSelectedDepartment: (department: string) => void;
}

export const AvailabilityTimeStamp = ({
  representative,
  setShowRealAvailabilityModal,
  setSelectedDepartment,
}: AvailabilityTimeStampProps) => {
  const { updateQueryParams } = useQueryParams();

  return (
    <div className="flex w-full items-center justify-between text-left">
      {
        <div className="flex flex-col gap-2.5">
          <div className="text-black-80 flex items-center gap-5 text-sm font-semibold">
            <span>
              {representative?.availability?.startTime} -{' '}
              {representative?.availability?.endTime}
            </span>
            <button
              type="button"
              onClick={() => {
                updateQueryParams({
                  userId: representative.user_id,
                  teamId: representative.team_id,
                });
                setSelectedDepartment(representative?.department || '');
                setTimeout(() => {
                  setShowRealAvailabilityModal(true);
                }, 100);
              }}
            >
              <MdOutlineModeEditOutline className="text-black-60 h-4 w-4" />
            </button>
          </div>
          <div className="text-black-60 flex items-center gap-2 text-xs font-medium">
            <GrLanguage className="text-black-60 h-4 w-4" />
            {representative?.availability?.startTime} -{' '}
            {representative?.availability?.endTime}
          </div>
          <div className="text-black-60 flex items-center gap-2 text-xs font-medium">
            <MdOutlineCalendarMonth className="text-black-60 h-4 w-4" />
            {representative?.availability?.isAvailable
              ? 'Available'
              : 'Not Available'}
          </div>
        </div>
      }
    </div>
  );
};
