import { TeamRepresentative } from '@/app-models-settings/SalesAvailabililty';

import { IoMdCall } from 'react-icons/io';
import { MdMailOutline } from 'react-icons/md';

export const MemberDetails = ({ member }: { member: TeamRepresentative }) => {
  return (
    <div className="flex w-full flex-col items-start">
      <span className="text-black-80 mb-3 w-full truncate text-base font-semibold">
        {member.user_name}
      </span>
      {member?.contact_no && (
        <div className="mb-1.5 flex w-full items-center gap-1">
          <IoMdCall className="text-black-60 h-4 w-4 flex-shrink-0" />
          <div className="text-black-60 truncate text-xs font-medium">
            {member.contact_no}
          </div>
        </div>
      )}
      {member?.email_id && (
        <div className="flex w-full items-center gap-1">
          <MdMailOutline className="text-black-60 h-4 w-4 flex-shrink-0" />
          <div className="text-black-60 truncate text-xs font-medium">
            {member.email_id}
          </div>
        </div>
      )}
    </div>
  );
};
