import {
  ApiEntityConfig,
  EntityConfig,
  FtpEntityConfig,
} from '@/models/integrations.model';

import React from 'react';

import Image from 'next/image';

/**
 * Component to display selected provider information as badges
 */
interface ProviderInfoBadgesProps {
  integrationType?: string;
  entityConfig: EntityConfig | undefined;
}

const ProviderInfoBadges: React.FC<ProviderInfoBadgesProps> = ({
  entityConfig,
  integrationType = 'IMS',
}) => {
  if (!entityConfig) return null;

  const ftpConfig = entityConfig.ftp;
  // hasFtp is true only when partnerName, partnerId, AND dealerId all exist
  const hasFtp = Boolean(
    ftpConfig?.partnerName && ftpConfig?.partnerId && ftpConfig?.dealerId
  );

  const isCarHistory =
    integrationType === 'Car History' &&
    Boolean(
      (entityConfig as any)?.partnerId && (entityConfig as any)?.partnerName
    );

  const isServiceScheduler =
    (integrationType === 'Service Scheduler' || integrationType === 'CRM') &&
    Boolean(
      (entityConfig.api as FtpEntityConfig)?.partnerId &&
        (entityConfig.api as FtpEntityConfig)?.partnerName
    );
  // Check if it's a "not listed" case - has partnerName but no partnerId
  const isNotListedIms = Boolean(
    (ftpConfig?.partnerName && !ftpConfig?.partnerId) ||
      ((entityConfig.api as FtpEntityConfig)?.partnerName &&
        !(entityConfig.api as FtpEntityConfig)?.partnerId)
  );
  const hasApp = entityConfig.app === true;
  const hasConsole = entityConfig.console === true;
  const hasClone = entityConfig.mediaclone === true;
  const hasApi = Boolean(
    (entityConfig.api as ApiEntityConfig)?.apiKey ||
      (entityConfig.api as FtpEntityConfig)?.partnerName
  );

  if (
    !isCarHistory &&
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
            Not Listed - Request Raised for {integrationType} partner
          </div>
        </div>
      )}
      {/* FTP Partner info */}
      <>
        {/* Partner icon and name */}
        {(ftpConfig?.logo ||
          (isCarHistory
            ? (entityConfig as any)?.logo
            : isServiceScheduler
              ? (entityConfig.api as FtpEntityConfig)?.logo
              : null)) && (
          <div className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-2 py-1">
            <div className="h-5 w-5 flex-shrink-0 overflow-hidden rounded">
              <Image
                src={
                  (isCarHistory
                    ? (entityConfig as any)?.logo
                    : isServiceScheduler
                      ? (entityConfig.api as FtpEntityConfig)?.logo
                      : ftpConfig?.logo) ?? ''
                }
                alt={
                  (isCarHistory
                    ? (entityConfig as any)?.partnerName
                    : isServiceScheduler
                      ? (entityConfig.api as FtpEntityConfig)?.partnerName
                      : ftpConfig?.partnerName) ?? 'Partner'
                }
                width={20}
                height={20}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-sm font-medium text-neutral-900">
              {isCarHistory
                ? (entityConfig as any)?.partnerName
                : isServiceScheduler
                  ? (entityConfig.api as FtpEntityConfig)?.partnerName
                  : ftpConfig?.partnerName}
            </span>
          </div>
        )}
        {/* Type: FTP badge */}
        {!isCarHistory && (
          <span className="inline-flex items-center justify-center gap-1 rounded-2xl bg-indigo-50 px-3 py-0.5 text-center text-xs font-medium leading-5 text-indigo-700 outline outline-1 outline-offset-[-1px] outline-indigo-700/10">
            Type: {entityConfig.api ? 'API' : 'FTP'}
          </span>
        )}

        {(ftpConfig?.dealerId ||
          (entityConfig.api as FtpEntityConfig)?.dealerId) && (
          <span className="inline-flex items-center justify-center gap-1 rounded-2xl bg-slate-50 px-3 py-0.5 text-center text-xs font-medium leading-5 text-slate-700 outline outline-1 outline-offset-[-1px] outline-slate-700/10">
            Dealer ID:{' '}
            {ftpConfig?.dealerId ||
              (entityConfig.api as FtpEntityConfig)?.dealerId}
          </span>
        )}
      </>
    </div>
  );
};
export default ProviderInfoBadges;
