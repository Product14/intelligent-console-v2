import React from 'react';
import { IoInformationCircleOutline } from 'react-icons/io5';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface TeamMemberFieldsProps {
  phoneLabel: string;
  contactNameLabel: string;
  phoneValue: string;
  nameValue: string;
  onPhoneChange: (value: string) => void;
  onNameChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  hasPreExistingPhone?: boolean;
  hasPreExistingName?: boolean;
  phoneError?: string;
  nameError?: string;
}

const TeamMemberFields: React.FC<TeamMemberFieldsProps> = ({
  phoneLabel,
  contactNameLabel = 'Member Name',
  phoneValue,
  nameValue,
  onPhoneChange,
  onNameChange,
  required = false,
  disabled = false,
  hasPreExistingPhone = false,
  hasPreExistingName = false,
  phoneError,
  nameError,
}) => {
  // Disable phone input if there's pre-existing data
  const isPhoneDisabled = disabled || hasPreExistingPhone;
  // Disable name input if there's pre-existing data
  const isNameDisabled = disabled || hasPreExistingName;

  return (
    <div className="mx-6 mt-3 flex gap-3 border-l border-black/10 px-6 py-2">
      {/* Name Input */}
      <div className="flex w-full flex-col gap-2">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium leading-5 text-black/60">
            {contactNameLabel}
            {required && <span className="text-[#c31812]">*</span>}
          </label>
          <IoInformationCircleOutline className="h-4 w-4 text-black/40" />
        </div>
        <div className="flex flex-col gap-1.5">
          <input
            type="text"
            value={nameValue}
            onChange={(e) => {
              if (!isNameDisabled) {
                onNameChange(e.target.value);
              }
            }}
            placeholder="Enter name"
            disabled={isNameDisabled}
            className={`!placeholder:text-black/80 h-[43.5px] w-full rounded-lg border px-3.5 py-3 text-sm leading-tight text-black/80 focus:border-[#4600f2] focus:outline-none ${
              isNameDisabled
                ? 'cursor-not-allowed border-black/10 bg-black/[0.04]'
                : nameError
                  ? 'border-red-500 bg-white'
                  : 'border-black/10 bg-white'
            }`}
          />
          {nameError && (
            <span className="text-xs text-red-500">{nameError}</span>
          )}
        </div>
      </div>
      {/* Phone Input */}
      <div className="flex w-full flex-col gap-2">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium leading-5 text-black/60">
            {phoneLabel}
            {required && <span className="text-[#c31812]">*</span>}
          </label>
          <IoInformationCircleOutline className="h-4 w-4 text-black/40" />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="h-11">
            <PhoneInput
              specialLabel=""
              value={phoneValue}
              disableSearchIcon
              dropdownStyle={{ height: '150px' }}
              inputClass={`!h-[43.5px] !border !w-full !rounded-lg text-sm leading-tight text-black/80 placeholder:text-black/60 focus:outline-none ${
                isPhoneDisabled
                  ? '!bg-black/[0.04] !cursor-not-allowed !border-black/10'
                  : phoneError
                    ? '!bg-white !border-red-500'
                    : '!bg-white !border-black/10'
              }`}
              containerClass="!h-[43.5px] !w-full dealership-customization-input"
              buttonClass="!bg-transparent !border-none !rounded-lg [&>.selected-flag]:hover:!bg-transparent"
              country={'us'}
              placeholder="Enter phone number"
              disabled={isPhoneDisabled}
              onChange={(phone) => {
                if (!isPhoneDisabled) {
                  onPhoneChange(phone);
                }
              }}
            />
          </div>
          {phoneError && (
            <span className="text-xs text-red-500">{phoneError}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamMemberFields;
