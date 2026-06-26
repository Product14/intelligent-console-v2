import { OnboardedAgent } from '@/store-settings/models/agents.model';

import React, { useState } from 'react';
import ReactCountryFlag from 'react-country-flag';
import { BsCreditCard2Back } from 'react-icons/bs';
import { IoClose } from 'react-icons/io5';
import { MdCall, MdContentCopy } from 'react-icons/md';
import { TbWorld } from 'react-icons/tb';
import { toast } from 'react-toastify';

import ModalWrapper from '@spyne-console/design-system/modal/modal-wrapper';

import { StringUtils } from '@/utils-settings/StringUtils';

interface CallOptionsModalProps {
  agent: OnboardedAgent;
  isOpen: boolean;
  onClose: () => void;
  onPhoneCall: () => void;
  onInboundCall: () => void;
  onWebCall: () => void;
}

export const CallOptionsModal: React.FC<CallOptionsModalProps> = ({
  agent,
  isOpen,
  onClose,
  onPhoneCall,
  onInboundCall,
  onWebCall,
}) => {
  const isOutbound = agent.agentCallType?.toLowerCase() === 'outbound';

  const handleCopyNumber = async () => {
    try {
      await navigator.clipboard.writeText(agent.phoneNumber);
      toast.success('Phone number copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy phone number');
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[540px] bg-[#ecf1f8] p-6"
      allowClose={false}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-start gap-1">
          <div className="flex min-w-0 flex-1 gap-6">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-[28px] border-[8px] border-[rgba(70,0,242,0.04)] bg-[rgba(70,0,242,0.08)]">
              <BsCreditCard2Back className="size-6 text-[#4600f2]" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <h2 className="text-2xl font-medium leading-[31.5px] text-black/90">
                How you wish to test the agent
              </h2>
              <p className="text-[15px] font-normal leading-6 text-black/40">
                Send this to people you want to give demo.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex shrink-0 items-center justify-center text-black/60 transition-colors hover:text-black/90"
            aria-label="Close modal"
          >
            <IoClose className="size-6" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-0.5 overflow-hidden rounded-[13.2px] border border-black/20 bg-white shadow-[0px_3.3px_17.475px_7.5px_rgba(0,0,0,0.1)]">
          <button
            onClick={onWebCall}
            className="flex items-center gap-[18px] bg-white p-8 transition-colors hover:bg-gray-50"
          >
            <TbWorld className="size-[27px] shrink-0 text-black/80" />
            <span className="text-[19.5px] font-semibold leading-[30px] text-black">
              Web Call
            </span>
          </button>
          {isOutbound ? (
            <button
              onClick={onPhoneCall}
              className="flex items-center gap-[18px] border-b border-black/20 bg-white p-8 transition-colors hover:bg-gray-50"
            >
              <MdCall className="size-[27px] shrink-0 text-black/80" />
              <span className="text-[19.5px] font-semibold leading-[30px] text-black">
                Phone Call
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-3 bg-white p-8 hover:bg-gray-50">
              <button
                onClick={onInboundCall}
                className="flex flex-1 items-center gap-6 transition-opacity hover:bg-gray-50"
              >
                <span className="bg-transparent text-lg font-medium leading-[18px] text-black/80">
                  Dial-in:
                </span>
                <div className="flex items-center gap-2.5 bg-transparent">
                  <ReactCountryFlag
                    countryCode={agent.countryCode}
                    svg
                    style={{
                      width: '26px',
                      height: '18px',
                      borderRadius: '3.6px',
                    }}
                  />
                  <span className="text-lg font-normal leading-[18px] text-black/80">
                    {StringUtils.formatPhoneNumber(agent.phoneNumber)}
                  </span>
                </div>
              </button>
              <button
                onClick={handleCopyNumber}
                className="ml-auto text-black/60 transition-colors hover:text-black/90"
                aria-label="Copy phone number"
              >
                <MdContentCopy className="size-[27px]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};
