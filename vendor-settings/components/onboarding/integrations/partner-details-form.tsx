import React, { useEffect, useState } from 'react';
import {
  IoCheckmarkCircle,
  IoInformationCircleOutline,
  IoRefreshOutline,
} from 'react-icons/io5';

import Image from 'next/image';

import SelectDropdown from '@spyne-console/design-system/dropdown/select-dropdown';

import { getCommonRooftopConfigs } from '../rooftop-profile/api/get-common-rooftop-configs';
import { verifyDealer } from '../rooftop-profile/api/verify-dealer';
import { IMS_PARTNERS } from './ims-providers-data';
import PartnerIconWithFallback from './partner-icon-with-fallback';
import {
  SERVICE_SCHEDULER_REDIRECT_URLS,
  SUPPORTED_OEM_MAKES,
  ServiceSchedulerPlatformType,
  isCdkProvider,
  isDEALERFXProvider,
} from './service-scheduler-data';

// Generic partner interface for flexibility with API and static data
interface PartnerData {
  id: string;
  name: string;
  icon: string;
}

export interface ThresholdConfig {
  newChecked: boolean;
  preOwnedChecked: boolean;
  newValue: number;
  preOwnedValue: number;
}

interface PartnerDetailsFormProps {
  selectedProviderId: string;
  onBack: () => void;
  providerName: string;
  channelTypes?: string[];
  // onSubmit: (data: PartnerFormData) => void
  loading?: boolean;
  dealerId?: string;
  onDealerIdChange?: (value: string) => void;
  partners?: PartnerData[];
  showThreshold?: boolean;
  threshold?: ThresholdConfig;
  onThresholdChange?: (threshold: ThresholdConfig) => void;
  disableFields?: boolean;
  enterpriseId?: string;
  teamId?: string;
  providerType?: string;
  showVerify?: boolean;
  knowYourDealerUrl?: string;
  oemName?: string;
  setOemName?: (value: string) => void;
}

export interface PartnerFormData {
  providerId: string;
  providerName: string;
  type: string;
  dealerId: string;
}

// Regex for alphanumeric validation (letters and numbers only)
const ALPHANUMERIC_REGEX = /^[a-zA-Z0-9_\-@#]*$/;
const MAX_DEALER_ID_LENGTH = 250;

const PartnerDetailsForm: React.FC<PartnerDetailsFormProps> = ({
  selectedProviderId,
  onBack,
  providerName,
  // onSubmit,
  channelTypes = ['FTP'],
  loading = false,
  dealerId: controlledDealerId,
  onDealerIdChange,
  partners,
  showThreshold = false,
  threshold,
  onThresholdChange,
  disableFields = false,
  enterpriseId,
  teamId,
  providerType,
  showVerify = false,
  knowYourDealerUrl,
  oemName = '',
  setOemName,
}) => {
  console.log('selectedProviderId details', selectedProviderId);
  // Use controlled state if provided, otherwise use local state
  const [localDealerId, setLocalDealerId] = useState('');
  const [dealerIdError, setDealerIdError] = useState('');
  const [verifyStatus, setVerifyStatus] = useState<
    'idle' | 'verifying' | 'verified' | 'failed'
  >('idle');
  const [verifyErrorMessage, setVerifyErrorMessage] = useState('');

  // Fetch vehicle types to conditionally show threshold sections
  const [vehicleTypes, setVehicleTypes] = useState<{
    new: boolean;
    preOwned: boolean;
  }>({ new: false, preOwned: false });

  useEffect(() => {
    if (!showThreshold || !enterpriseId || !teamId) return;

    const fetchVehicleTypes = async () => {
      try {
        const configData = await getCommonRooftopConfigs({
          enterpriseId,
          teamId,
        });
        if (configData?.vehicleType) {
          setVehicleTypes(configData.vehicleType);
        }
      } catch (error) {
        console.error('Failed to fetch vehicle types:', error);
      }
    };

    fetchVehicleTypes();
  }, [showThreshold, enterpriseId, teamId]);
  const dealerId =
    controlledDealerId !== undefined ? controlledDealerId : localDealerId;
  const setDealerId = onDealerIdChange || setLocalDealerId;

  // Handle dealer ID change with alphanumeric and length validation
  const handleDealerIdChange = (value: string) => {
    if (verifyStatus !== 'idle') {
      setVerifyStatus('idle');
      setVerifyErrorMessage('');
    }
    if (value.length > MAX_DEALER_ID_LENGTH) {
      setDealerIdError(
        `Dealer ID must be ${MAX_DEALER_ID_LENGTH} characters or less`
      );
      return;
    }
    if (value === '' || ALPHANUMERIC_REGEX.test(value)) {
      setDealerId(value);
      setDealerIdError('');
    } else {
      setDealerIdError(
        'Dealer ID can only contain letters, numbers, and _ - @ #'
      );
    }
  };

  const handleOemMakeChange = (value: string) => {
    setOemName?.(value);
  };

  // Find the selected provider from passed partners or fallback to static data
  const partnersData =
    partners && partners.length > 0 ? partners : IMS_PARTNERS;
  const selectedProvider = partnersData.find(
    (p) => p.id === selectedProviderId
  );
  const showOemSelector = isDEALERFXProvider(selectedProvider?.name);
  const showSubscriptionIdLabel = isCdkProvider(selectedProvider?.name);
  const redirectUrl = React.useMemo(() => {
    return selectedProvider?.name
      ? SERVICE_SCHEDULER_REDIRECT_URLS[
          selectedProvider.name.toLowerCase() as ServiceSchedulerPlatformType
        ]
      : knowYourDealerUrl;
  }, [knowYourDealerUrl, selectedProvider?.name]);

  if (!selectedProvider) {
    return null;
  }

  const handleVerify = async () => {
    if (!dealerId.trim()) return;
    setVerifyStatus('verifying');
    try {
      const response = await verifyDealer({
        enterpriseId,
        teamId,
        dealerId,
        providerName: selectedProvider.name,
        providerType,
      });

      setVerifyErrorMessage(response?.message || '');
      setVerifyStatus(response?.verified === true ? 'verified' : 'failed');
    } catch {
      setVerifyStatus('failed');
      setVerifyErrorMessage('Incorrect Dealer ID');
    }
  };

  React.useEffect(() => {
    if (!showOemSelector) {
      handleOemMakeChange('');
    }
  }, []);

  return (
    <div className="relative pt-11">
      {/* Row with back button and connection graphic on same line */}
      <div className="mb-6 flex w-full items-center">
        {/* Back button - left aligned */}
        {/* <button
          type="button"
          onClick={onBack}
          className="absolute left-10 top-8 flex h-[60px] w-[60px] flex-shrink-0 items-center justify-center rounded-xl border border-black/10 bg-white transition-colors hover:bg-gray-50"
        >
          <BiArrowBack className="h-7 w-7 text-black/80" />
        </button> */}

        {/* Connection graphic - centered in remaining space */}
        <div className="flex flex-1 justify-center">
          <div className="flex items-center gap-1">
            {/* Spyne logo with shimmer background */}
            <div className="relative flex h-[100px] w-[100px] items-center justify-center">
              <Image
                src="https://spyne-static.s3.us-east-1.amazonaws.com/spyne-shimmer.png"
                alt="Spyne"
                width={100}
                height={100}
                className="h-full w-full object-contain"
              />
            </div>

            {/* Connecting line */}
            <div className="h-px w-5 bg-gray-300" />

            {/* Secured badge */}
            <img
              src="https://spyne-static.s3.us-east-1.amazonaws.com/onboarding/Frame+2147239183.svg"
              alt="Secured"
              className="h-20 w-20 object-contain"
            />

            {/* Connecting line */}
            <div className="h-px w-5 bg-gray-300" />

            {/* Provider logo */}
            <div className="flex h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-full border">
              <PartnerIconWithFallback
                icon={selectedProvider.icon}
                name={selectedProvider.name}
                size={100}
                rounded="rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Title */}
      <h2 className="mb-6 text-center text-[28px] font-bold text-black">
        Enter your {providerName} details
      </h2>

      {/* Centered content */}
      <div className="mx-auto flex w-[80%] flex-1 flex-col items-center px-20">
        {/* Form card */}
        <div className="w-full rounded-2xl border border-black/10 px-20 py-12">
          {/* IMS Name display */}
          <div className={`mb-6 ${disableFields ? 'opacity-60' : ''}`}>
            <label className="mb-3 block text-base font-semibold text-black">
              Your {providerName} Name
            </label>
            <div className="flex items-center justify-between self-stretch rounded-xl bg-white px-3 py-2 outline outline-2 outline-offset-[-2px] outline-gray-200">
              <div className="flex items-center gap-3">
                <PartnerIconWithFallback
                  icon={selectedProvider.icon}
                  name={selectedProvider.name}
                  size={32}
                  rounded="rounded-lg"
                />
                <span className="text-base text-black/90">
                  {selectedProvider.name}
                </span>
              </div>
              {!disableFields && (
                <button
                  type="button"
                  onClick={onBack}
                  className="text-blue-light text-sm font-semibold leading-7 transition-colors hover:text-blue-700"
                >
                  Change
                </button>
              )}
            </div>
          </div>

          {/* Type badge */}
          <div className={`mb-6 ${disableFields ? 'opacity-60' : ''}`}>
            <label className="mb-3 block text-base font-semibold leading-6 text-black">
              Type
            </label>
            {/* Gradient border wrapper */}
            <div className="flex flex-wrap gap-2">
              {channelTypes.map((channelType) => (
                <div
                  className="inline-flex h-8 rounded-full p-[1.5px]"
                  style={{
                    background:
                      'linear-gradient(90deg, #8514FF 0%, #3ECEF9 33%, #C901FF 66%, #FF4894 100%)',
                  }}
                >
                  <span className="inline-flex items-center justify-center rounded-full bg-white px-5 text-sm font-medium text-black">
                    {channelType}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Dealer ID input */}
          <div>
            <label className="mb-3 block text-base font-semibold text-black">
              {showSubscriptionIdLabel ? 'Subscription ID' : 'Dealer ID'}
            </label>
            <div className="flex items-center gap-3">
              <div
                className={`flex flex-1 items-start justify-start rounded-xl bg-white py-4 pl-5 pr-2 outline outline-2 outline-offset-[-2px] ${
                  showVerify && (dealerIdError || verifyStatus === 'failed')
                    ? 'outline-red-500'
                    : 'outline-gray-200'
                }`}
              >
                <input
                  type="text"
                  value={dealerId}
                  onChange={(e) => handleDealerIdChange(e.target.value)}
                  maxLength={MAX_DEALER_ID_LENGTH}
                  placeholder={
                    showSubscriptionIdLabel
                      ? 'Enter your subscription ID'
                      : 'Enter your dealer ID'
                  }
                  disabled={disableFields}
                  className={`w-full border-none bg-transparent text-base text-black/90 outline-none placeholder:text-black/40 ${disableFields ? 'cursor-not-allowed opacity-60' : ''}`}
                />
              </div>
              {showVerify && (
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={
                    !dealerId.trim() ||
                    verifyStatus === 'verifying' ||
                    disableFields
                  }
                  className={`flex flex-shrink-0 items-center gap-2 rounded-xl px-4 py-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    verifyStatus === 'verified'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-gray-100 text-black/70 hover:bg-gray-200'
                  }`}
                >
                  {verifyStatus === 'verifying' && (
                    <IoRefreshOutline className="h-4 w-4 animate-spin" />
                  )}
                  {verifyStatus === 'verified' && (
                    <IoCheckmarkCircle className="h-4 w-4 text-green-600" />
                  )}
                  {(verifyStatus === 'idle' || verifyStatus === 'failed') && (
                    <IoRefreshOutline className="h-4 w-4" />
                  )}
                  <span>
                    {verifyStatus === 'verifying'
                      ? 'Verifying'
                      : verifyStatus === 'verified'
                        ? 'Verified'
                        : 'Verify'}
                  </span>
                </button>
              )}
            </div>
            {redirectUrl && (
              <div className="flex items-center justify-end">
                <a
                  href={redirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-light text-sm font-semibold leading-7 transition-colors hover:text-blue-700"
                >
                  {showSubscriptionIdLabel
                    ? ' How to get your subscritption ID?'
                    : 'How to get your dealer ID?'}
                </a>
              </div>
            )}

            {dealerIdError && (
              <p className="mt-2 text-sm text-red-500">{dealerIdError}</p>
            )}
            {showVerify &&
              verifyErrorMessage &&
              verifyStatus !== 'idle' &&
              verifyStatus !== 'verifying' && (
                <p className="mt-2 text-sm text-black/50">
                  {verifyErrorMessage}
                </p>
              )}
          </div>

          {showOemSelector && (
            <div className="mt-6 flex flex-col gap-1.5">
              <label className="text-base font-semibold text-black">
                Supported OEM
              </label>
              <SelectDropdown
                id="oem-make"
                placeholder="Select OEM make"
                dropdownDrawerClassName={'!w-full'}
                options={SUPPORTED_OEM_MAKES}
                selectedOption={
                  SUPPORTED_OEM_MAKES.find((make) => make.value === oemName) ??
                  null
                }
                onChange={(option: { value: string } | null) =>
                  handleOemMakeChange(option?.value ?? '')
                }
              />
              <p className="text-sm text-black/60">
                Select the OEM make supported for service appointments
              </p>
            </div>
          )}

          {/* Threshold - Vehicle type selection (only shown when vehicleTypes are enabled) */}
          {showThreshold &&
            threshold &&
            onThresholdChange &&
            (vehicleTypes.new || vehicleTypes.preOwned) && (
              <div className="mt-6">
                <h3 className="mb-3 text-base font-semibold text-black">
                  Select the vehicle type you want to process
                </h3>
                <div className="flex flex-col gap-3">
                  {/* New Vehicles - only if vehicleType.new is true */}
                  {vehicleTypes.new && (
                    <div className="flex items-center justify-between rounded-xl border border-black/10 px-5 py-4">
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={threshold.newChecked}
                          onChange={(e) =>
                            onThresholdChange({
                              ...threshold,
                              newChecked: e.target.checked,
                            })
                          }
                          className="h-5 w-5 rounded accent-[#6C2BD9]"
                        />
                        <span className="text-base font-medium text-black">
                          New Vehicles
                        </span>
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                          <IoInformationCircleOutline className="h-4 w-4" />
                          Minimum Count
                        </span>
                        <input
                          type="number"
                          min={0}
                          value={threshold.newValue || ''}
                          placeholder="0"
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            onThresholdChange({
                              ...threshold,
                              newValue: isNaN(val) ? 0 : val,
                            });
                          }}
                          disabled={!threshold.newChecked}
                          className="w-16 rounded-lg border border-gray-200 px-2 py-1 text-center text-sm text-black outline-none disabled:bg-gray-50 disabled:text-gray-400"
                        />
                      </div>
                    </div>
                  )}

                  {/* Used Vehicles - only if vehicleType.preOwned is true */}
                  {vehicleTypes.preOwned && (
                    <div className="flex items-center justify-between rounded-xl border border-black/10 px-5 py-4">
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={threshold.preOwnedChecked}
                          onChange={(e) =>
                            onThresholdChange({
                              ...threshold,
                              preOwnedChecked: e.target.checked,
                            })
                          }
                          className="h-5 w-5 rounded accent-[#6C2BD9]"
                        />
                        <span className="text-base font-medium text-black">
                          Used Vehicles
                        </span>
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                          <IoInformationCircleOutline className="h-4 w-4" />
                          Minimum Count
                        </span>
                        <input
                          type="number"
                          min={0}
                          value={threshold.preOwnedValue || ''}
                          placeholder="0"
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            onThresholdChange({
                              ...threshold,
                              preOwnedValue: isNaN(val) ? 0 : val,
                            });
                          }}
                          disabled={!threshold.preOwnedChecked}
                          className="w-16 rounded-lg border border-gray-200 px-2 py-1 text-center text-sm text-black outline-none disabled:bg-gray-50 disabled:text-gray-400"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default PartnerDetailsForm;
