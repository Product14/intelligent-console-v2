import { Toggle } from '@spyne-console/design-system';
import { useSelector } from '@spyne-console/store';

import React, { useMemo } from 'react';
import { toast } from 'react-toastify';

import SVG from '@spyne-console/design-system/svg';

interface EmailToggleCardProps {
  speedToLeadEnabled: boolean;
  setSpeedToLeadEnabled: (speedToLeadEnabled: boolean) => void;
  isEmailEnabled?: boolean;
}

export const EmailToggleCard: React.FC<EmailToggleCardProps> = ({
  speedToLeadEnabled,
  setSpeedToLeadEnabled,
  isEmailEnabled,
}) => {
  const enterpriseTeamReducer = useSelector(
    (state: any) => state.enterpriseTeamReducer
  );
  const handleSpeedToLeadEnabledChange = () => {
    setSpeedToLeadEnabled(!speedToLeadEnabled);
  };

  const emailValue = useMemo(() => {
    const teamName = enterpriseTeamReducer?.selectedTeam?.team_name || '';
    const teamId = enterpriseTeamReducer?.selectedTeam?.team_id || '';
    if (!teamName || !teamId) return '';
    return `${teamName}_${teamId}@vini.ai`;
  }, [enterpriseTeamReducer.selectedTeam]);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailValue);
    toast.success('Email copied to clipboard');
  };
  return (
    <div className="w-full">
      <div className="mb-6 flex w-full items-center justify-between gap-2 rounded-xl border border-black/10 p-4">
        <h4 className="flex items-center gap-2 text-lg font-normal leading-6 text-black/80">
          <SVG iconName="clock" className="h-5 w-5 fill-black/80" />
          <strong className="font-medium">Instant Response</strong> - Enable
          automated quick responses to new leads
        </h4>
        <div className="flex items-center gap-2">
          <Toggle
            id="instant-response-toggle"
            toggle={speedToLeadEnabled}
            toggleHandler={handleSpeedToLeadEnabledChange}
            disabled={false}
            className=""
          />{' '}
          {speedToLeadEnabled && (
            <span className="text-base font-normal text-black/80">ON</span>
          )}
        </div>
      </div>
      {isEmailEnabled && !!emailValue && (
        <div className="flex w-full flex-col gap-1">
          <label
            htmlFor="speed-to-lead-email"
            className="whitespace-nowrap text-base font-semibold text-black/80"
          >
            Forward all new leads via email to
          </label>
          <div className="relative flex w-1/2 items-center gap-2">
            <input
              type="email"
              placeholder="Enter email"
              className="w-full rounded-md border border-black/10 p-3 text-sm font-normal text-black/60"
              value={emailValue}
              readOnly
            />
            <button
              onClick={handleCopyEmail}
              className="absolute right-2 top-1/2 w-fit -translate-y-1/2 p-1"
            >
              <SVG
                iconName="copy"
                className="hover:fill-blue-light h-5 w-5 cursor-pointer fill-black/60 transition-all duration-200"
                fill="black/50"
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
