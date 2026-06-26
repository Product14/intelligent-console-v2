import { AgentType } from '@/store-settings/models/agent-types.model';

import React, { useMemo } from 'react';
import { HiExternalLink } from 'react-icons/hi';

import { useAgentTypesRedux } from '@/hooks/settings/use-agent-types-redux';

import { StringUtils } from '@/utils-settings/StringUtils';
import { getSafeStaticAssetUrl } from '@/utils-settings/image-util';

const getProductKey = (agentType: AgentType) => {
  return `${agentType.agentType}-${agentType.agentCallType}`;
};

export default function ViniContractBanner() {
  const { agentTypes, contractLink } = useAgentTypesRedux({ autoFetch: true });

  const uniqueAgentTypes = useMemo(() => {
    const uniqueAgentTypes = new Set<string>();
    (agentTypes || []).forEach((agentType) => {
      uniqueAgentTypes.add(getProductKey(agentType));
    });
    return Array.from(uniqueAgentTypes).map((productKey) => {
      return agentTypes.find(
        (agentType) => getProductKey(agentType) === productKey
      );
    }) as AgentType[];
  }, [agentTypes]);

  const onViewContract = () => {
    if (contractLink) {
      window.open(contractLink, '_blank');
    }
  };

  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-center text-base font-normal leading-6 text-[#111]">
        Your plan highlights:
      </p>

      <div className="w-full rounded-2xl border-2 border-[#027a48] bg-white px-6 py-5 shadow-[0px_1px_4px_0px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Contract Image */}
            <div className="relative flex h-[106px] w-[120px] items-center justify-center overflow-hidden rounded-2xl">
              <img
                src={getSafeStaticAssetUrl(
                  'https://spyne-static.s3.us-east-1.amazonaws.com/vini-icon.png'
                )}
                alt="Contract background"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <h3 className="text-2xl font-semibold leading-[1.4] text-[rgba(0,0,0,0.8)]">
                  Vini Agents Contract
                </h3>
                <div className="border-[rgba(2, 122, 72, 0.10)] flex items-center gap-1 rounded-2xl border bg-[#D9FFE9] px-2 py-0.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#027A48]" />
                  <span className="text-sm font-medium leading-[22px] text-[#027A48]">
                    Contracted
                  </span>
                </div>
              </div>

              <div className="flex h-8 items-start gap-2">
                {uniqueAgentTypes.map((agentType, index) => (
                  <div
                    key={index}
                    className="flex h-full items-center rounded-lg border border-[rgba(0,0,0,0.2)] bg-white shadow-[1px_1px_1px_0px_rgba(0,0,0,0.04)]"
                  >
                    <div className="flex h-full w-8 items-center justify-center rounded-l-lg border-r border-[rgba(0,0,0,0.2)] px-[9px] py-1">
                      <div className="flex h-4 w-4 items-center justify-center">
                        {agentType.agentType === 'Sales' ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                          >
                            <path
                              d="M3 10C3.27778 10 3.51389 9.90278 3.70833 9.70833C3.90278 9.51389 4 9.27778 4 9C4 8.72222 3.90278 8.48611 3.70833 8.29167C3.51389 8.09722 3.27778 8 3 8C2.72222 8 2.48611 8.09722 2.29167 8.29167C2.09722 8.48611 2 8.72222 2 9C2 9.27778 2.09722 9.51389 2.29167 9.70833C2.48611 9.90278 2.72222 10 3 10ZM9 10C9.22222 10 9.42222 9.93333 9.6 9.8C9.77778 9.66667 9.89444 9.49444 9.95 9.28333C9.72778 9.23889 9.51667 9.16389 9.31667 9.05833C9.11667 8.95278 8.93333 8.81667 8.76667 8.65L8.35 8.23333C8.23889 8.32222 8.15278 8.43333 8.09167 8.56667C8.03056 8.7 8 8.84444 8 9C8 9.27778 8.09722 9.51389 8.29167 9.70833C8.48611 9.90278 8.72222 10 9 10ZM2 12V12.6667C2 12.8556 1.93611 13.0139 1.80833 13.1417C1.68056 13.2694 1.52222 13.3333 1.33333 13.3333H0.666667C0.477778 13.3333 0.319444 13.2694 0.191667 13.1417C0.0638889 13.0139 0 12.8556 0 12.6667V7.33333L1.4 3.33333C1.46667 3.13333 1.58611 2.97222 1.75833 2.85C1.93056 2.72778 2.12222 2.66667 2.33333 2.66667H4.66667V3.58333C4.66667 3.65 4.66944 3.71944 4.675 3.79167C4.68056 3.86389 4.68889 3.93333 4.7 4H2.56667L1.86667 6H6.11667L7.45 7.33333H1.33333V10.6667H10.6667V9.31667C10.9111 9.29445 11.1472 9.23333 11.375 9.13333C11.6028 9.03333 11.8111 8.89444 12 8.71667V12.6667C12 12.8556 11.9361 13.0139 11.8083 13.1417C11.6806 13.2694 11.5222 13.3333 11.3333 13.3333H10.6667C10.4778 13.3333 10.3194 13.2694 10.1917 13.1417C10.0639 13.0139 10 12.8556 10 12.6667V12H2ZM8.66667 3.33333C8.85556 3.33333 9.01389 3.26944 9.14167 3.14167C9.26945 3.01389 9.33333 2.85556 9.33333 2.66667C9.33333 2.47778 9.26945 2.31944 9.14167 2.19167C9.01389 2.06389 8.85556 2 8.66667 2C8.47778 2 8.31944 2.06389 8.19167 2.19167C8.06389 2.31944 8 2.47778 8 2.66667C8 2.85556 8.06389 3.01389 8.19167 3.14167C8.31944 3.26944 8.47778 3.33333 8.66667 3.33333ZM9.7 7.7L6.3 4.3C6.21111 4.21111 6.13889 4.10278 6.08333 3.975C6.02778 3.84722 6 3.71667 6 3.58333V1C6 0.722222 6.09722 0.486111 6.29167 0.291667C6.48611 0.0972222 6.72222 0 7 0H9.58333C9.71667 0 9.84722 0.0277778 9.975 0.0833333C10.1028 0.138889 10.2111 0.211111 10.3 0.3L13.7 3.7C13.8889 3.88889 13.9833 4.125 13.9833 4.40833C13.9833 4.69167 13.8889 4.92778 13.7 5.11667L11.1167 7.7C10.9278 7.88889 10.6917 7.98333 10.4083 7.98333C10.125 7.98333 9.88889 7.88889 9.7 7.7ZM10.4167 6.53333L12.5333 4.41667L9.45 1.33333H7.33333V3.45L10.4167 6.53333Z"
                              fill="#38464F"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="16"
                            viewBox="0 0 14 16"
                            fill="none"
                          >
                            <path
                              d="M5.33333 2.66667V0H6.66667V2.66667H5.33333ZM2.38333 3.61667L0.383333 1.61667L1.33333 0.666667L3.33333 2.66667L2.38333 3.61667ZM0.666667 15.3333C0.477778 15.3333 0.319444 15.2694 0.191667 15.1417C0.0638889 15.0139 0 14.8556 0 14.6667V9.33333L1.4 5.33333C1.46667 5.13333 1.58611 4.97222 1.75833 4.85C1.93056 4.72778 2.12222 4.66667 2.33333 4.66667H4V3.33333H6.18333C5.91667 3.71111 5.70833 4.125 5.55833 4.575C5.40833 5.025 5.33333 5.5 5.33333 6H2.56667L1.58333 8.66667H6.18333C6.37222 8.93333 6.58333 9.18055 6.81667 9.40833C7.05 9.63611 7.31111 9.83333 7.6 10H1.33333V12.6667H10.6667V10.6167C10.9 10.5833 11.1278 10.5333 11.35 10.4667C11.5722 10.4 11.7889 10.3167 12 10.2167V14.6667C12 14.8556 11.9361 15.0139 11.8083 15.1417C11.6806 15.2694 11.5222 15.3333 11.3333 15.3333H10.6667C10.4778 15.3333 10.3194 15.2694 10.1917 15.1417C10.0639 15.0139 10 14.8556 10 14.6667V14H2V14.6667C2 14.8556 1.93611 15.0139 1.80833 15.1417C1.68056 15.2694 1.52222 15.3333 1.33333 15.3333H0.666667ZM2 12H4C4.18889 12 4.34722 11.9361 4.475 11.8083C4.60278 11.6806 4.66667 11.5222 4.66667 11.3333C4.66667 11.1444 4.60278 10.9861 4.475 10.8583C4.34722 10.7306 4.18889 10.6667 4 10.6667H2V12ZM10 12V10.6667H8C7.81111 10.6667 7.65278 10.7306 7.525 10.8583C7.39722 10.9861 7.33333 11.1444 7.33333 11.3333C7.33333 11.5222 7.39722 11.6806 7.525 11.8083C7.65278 11.9361 7.81111 12 8 12H10ZM9.51667 7.5L11.8333 5.2L11.1333 4.5L9.51667 6.08333L8.86667 5.43333L8.16667 6.15L9.51667 7.5ZM10 2.66667C10.9222 2.66667 11.7083 2.99167 12.3583 3.64167C13.0083 4.29167 13.3333 5.07778 13.3333 6C13.3333 6.92222 13.0083 7.70833 12.3583 8.35833C11.7083 9.00833 10.9222 9.33333 10 9.33333C9.07778 9.33333 8.29167 9.00833 7.64167 8.35833C6.99167 7.70833 6.66667 6.92222 6.66667 6C6.66667 5.07778 6.99167 4.29167 7.64167 3.64167C8.29167 2.99167 9.07778 2.66667 10 2.66667Z"
                              fill="#38464F"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="flex h-full items-center justify-center rounded-r-lg px-2 py-1">
                      <span className="whitespace-nowrap text-[13px] font-medium leading-5 text-[#38464f]">
                        {`${StringUtils.toCapitalize(agentType.agentType)} ${StringUtils.toCapitalize(agentType.agentCallType)}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* View Contract Button - Hidden by default with opacity-0 */}
          {contractLink && (
            <button
              onClick={onViewContract}
              className="flex items-center gap-1.5 rounded-xl border-2 border-[#027a48] bg-white px-10 py-4 opacity-0 transition-colors hover:bg-[#f0fdf4]"
            >
              <span className="text-lg font-semibold leading-7 text-[#027a48]">
                View Contract
              </span>
              <HiExternalLink className="h-5 w-5 text-[#027a48]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
