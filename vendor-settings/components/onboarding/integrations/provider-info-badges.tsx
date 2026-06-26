import React from 'react';

import PartnerIconWithFallback from './partner-icon-with-fallback';
import type { EntityConfig } from './types';

/**
 * Component to display selected provider information as badges
 */
interface ProviderInfoBadgesProps {
  entityConfig: EntityConfig | undefined;
}

const ProviderInfoBadges: React.FC<ProviderInfoBadgesProps> = ({
  entityConfig,
}) => {
  if (!entityConfig) return null;

  const ftpConfig = entityConfig.ftp;
  // hasFtp is true only when partnerName, partnerId, AND dealerId all exist
  const hasFtp = Boolean(
    ftpConfig?.partnerName && ftpConfig?.partnerId && ftpConfig?.dealerId
  );
  // Check if it's a "not listed" case - has partnerName but no partnerId
  const isNotListedIms = Boolean(
    ftpConfig?.partnerName && !ftpConfig?.partnerId
  );
  const hasApp = entityConfig.app === true;
  const hasConsole = entityConfig.console === true;
  const hasClone = entityConfig.mediaclone === true;
  const hasApi = Boolean(entityConfig.api?.apiKey);

  if (
    !hasFtp &&
    !isNotListedIms &&
    !hasApp &&
    !hasConsole &&
    !hasClone &&
    !hasApi
  )
    return null;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {/* Not Listed IMS - Request Raised badge */}
      {isNotListedIms && (
        <div className="inline-flex items-center justify-center gap-1 rounded-2xl bg-sky-50 px-3 py-0.5 outline outline-1 outline-offset-[-1.07px] outline-sky-700/10">
          <div className="justify-start text-center font-['Inter'] text-xs font-medium leading-5 text-sky-700">
            Not Listed - Request Raised for IMS partner
          </div>
        </div>
      )}
      {/* FTP Partner info */}
      {hasFtp && (
        <>
          {/* Partner icon and name */}
          <div className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-2 py-1">
            <PartnerIconWithFallback
              icon={ftpConfig?.logo}
              name={ftpConfig?.partnerName || 'Partner'}
              size={20}
              rounded="rounded"
            />
            <span className="text-sm font-medium text-neutral-900">
              {ftpConfig?.partnerName}
            </span>
          </div>
          {/* Type: FTP badge */}
          <span className="inline-flex items-center justify-center gap-1 rounded-2xl bg-indigo-50 px-3 py-0.5 text-center text-xs font-medium leading-5 text-indigo-700 outline outline-1 outline-offset-[-1px] outline-indigo-700/10">
            FTP
          </span>
          {/* Dealer ID badge */}
          {ftpConfig?.dealerId && (
            <span className="inline-flex items-center justify-center gap-1 rounded-2xl bg-slate-50 px-3 py-0.5 text-center text-xs font-medium leading-5 text-slate-700 outline outline-1 outline-offset-[-1px] outline-slate-700/10">
              Dealer ID: {ftpConfig.dealerId}
            </span>
          )}
        </>
      )}
      {/* App badge */}
      {hasApp && (
        <span className="inline-flex items-center justify-center gap-1 rounded-2xl bg-sky-50 px-2 py-0.5 text-center text-xs font-medium leading-5 text-sky-700 outline outline-1 outline-offset-[-1px] outline-sky-700/10">
          Spyne App
        </span>
      )}
      {/* Console badge */}
      {hasConsole && (
        <div className="inline-flex items-center justify-center gap-1 rounded-2xl bg-orange-50 px-3 py-0.5 outline outline-1 outline-offset-[-1px] outline-orange-700/10">
          <div className="justify-start text-center font-['Inter'] text-xs font-medium leading-5 text-orange-700">
            Spyne Console
          </div>
        </div>
      )}
      {/* Clone badge */}
      {hasClone && (
        <div className="inline-flex items-center justify-center gap-1 rounded-2xl bg-sky-50 px-2 py-0.5 outline outline-1 outline-offset-[-1px] outline-sky-700/10">
          <div className="justify-start text-center font-['Inter'] text-xs font-medium leading-5 text-sky-700">
            Spyne-Media Cloning
          </div>
        </div>
      )}
      {/* Spyne Public API badge */}
      {hasApi && (
        <span className="inline-flex items-center justify-center gap-1 rounded-2xl bg-purple-50 px-2 py-0.5 text-center font-['Inter'] text-xs font-medium leading-5 text-violet-700 outline outline-1 outline-offset-[-1px] outline-violet-700/10">
          Spyne Public API
        </span>
      )}
    </div>
  );
};

export default ProviderInfoBadges;
