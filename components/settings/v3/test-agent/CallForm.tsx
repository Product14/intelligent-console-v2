import { OnboardedAgent } from '@/store-settings/models/agents.model';

import React, { useEffect, useRef, useState } from 'react';
import { IoArrowBack, IoClose } from 'react-icons/io5';
import { MdEmail, MdKeyboardArrowDown } from 'react-icons/md';
import { RiUser3Fill } from 'react-icons/ri';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { toast } from 'react-toastify';

import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

import useUserDetails from '@/hooks/settings/useUserDetails';

import { StringUtils } from '@/utils-settings/StringUtils';
import { getSafeStaticAssetUrl } from '@/utils-settings/image-util';

import { Vehicle, VehicleDropdown } from './VehicleDropdown';
import './call-form-modal.css';

const USE_CASE_OPTIONS = [
  { value: 'service', label: 'Service Appointment' },
  { value: 'sales', label: 'Sales Inquiry' },
  { value: 'parts', label: 'Parts Order' },
  { value: 'general', label: 'General Inquiry' },
];

interface CallFormProps {
  agent: OnboardedAgent;
  isOpen: boolean;
  onClose: () => void;
  onCallInitiated?: () => void;
  mode?: 'phone' | 'web';
  onWebCallInitiated?: (customerDetails: Record<string, any>) => void;
}

export const CallForm: React.FC<CallFormProps> = ({
  agent,
  isOpen,
  onClose,
  onCallInitiated,
  mode = 'phone',
  onWebCallInitiated,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    useCase: '',
    description: '',
    vin: '',
  });

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isUseCaseOpen, setIsUseCaseOpen] = useState(false);
  const [showEmailError, setShowEmailError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const useCaseRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);
  const { enterpriseId, teamId } = useUserDetails();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Reset email error when user types
    if (field === 'email') {
      setShowEmailError(false);
    }
  };

  const handleEmailBlur = () => {
    if (formData.email.trim() !== '' && !isValidEmail(formData.email)) {
      setShowEmailError(true);
    }
  };

  // Email validation regex
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Step 1 validation
  const isStep1Valid = (): boolean => {
    return (
      formData.name.trim() !== '' &&
      formData.email.trim() !== '' &&
      isValidEmail(formData.email) &&
      formData.phone.trim() !== ''
    );
  };

  // Step 2 validation
  const isStep2Valid = (): boolean => {
    return formData.useCase.trim() !== '' && formData.vin.trim() !== '';
  };

  // Check if current step is valid
  const isCurrentStepValid = (): boolean => {
    if (currentStep === 1) {
      return isStep1Valid();
    } else {
      return isStep2Valid();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        useCaseRef.current &&
        !useCaseRef.current.contains(event.target as Node)
      ) {
        setIsUseCaseOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset form state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        useCase: '',
        description: '',
        vin: '',
      });
      setSelectedVehicle(null);
      setCurrentStep(1);
      setIsUseCaseOpen(false);
      setShowEmailError(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const buildCustomerDetails = () => {
    const vin = typeof formData.vin === 'string' ? formData.vin.trim() : '';
    const yearRaw = selectedVehicle?.year;
    return {
      customerName: formData.name.trim(),
      customerEmail: '',
      customerPhoneNumber: `+${formData.phone}`,
      customerInterestVehicleMake: selectedVehicle?.make ?? '',
      customerInterestVehicleModel: selectedVehicle?.model ?? '',
      customerInterestVehicleYear: yearRaw != null ? String(yearRaw) : '',
      customerInterestVehicleVin: vin,
      vehicleVin: vin,
      description: formData.description,
      similarVehicles: [],
    };
  };

  const triggerOutboundPhoneCall = async () => {
    if (!enterpriseId || !teamId) {
      toast.error('Missing user details');
      return;
    }

    if (!selectedVehicle) {
      toast.error('Please select a vehicle');
      return;
    }

    if (!isMountedRef.current) return;

    setIsSubmitting(true);

    try {
      const customerDetails = buildCustomerDetails() as Record<string, unknown>;
      const customerPhone = String(
        customerDetails.customerPhoneNumber ?? ''
      ).trim();
      const sourceDevice =
        typeof navigator !== 'undefined' &&
        /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
          ? 'MOBILE'
          : 'DESKTOP';
      const requestBody = {
        customerPhone,
        teamAgentMappingId: agent.teamAgentMappingId,
        promptVariables: {
          ...customerDetails,
          ...(customerDetails.similarVehicles == null
            ? { similarVehicles: [] }
            : {}),
        },
        metadata: {
          source: 'CONSOLE',
          sourceDevice,
        },
      };

      await CentralAPIHandler.handlePostRequest(
        `${process.env.APP_BACKEND_BASEURL}/conversation/calls/outbound/trigger`,
        requestBody
      );

      if (isMountedRef.current) {
        toast.success('Outbound call initiated successfully');
        onClose();
        onCallInitiated?.();
      }
    } catch (error: any) {
      console.error('Error triggering outbound call:', error);
      if (isMountedRef.current) {
        toast.error(
          error?.message || 'Failed to initiate call. Please try again.'
        );
      }
    } finally {
      if (isMountedRef.current) {
        setIsSubmitting(false);
      }
    }
  };

  const triggerOutboundWebCall = () => {
    if (!selectedVehicle) {
      toast.error('Please select a vehicle');
      return;
    }
    onClose();
    onWebCallInitiated?.(buildCustomerDetails());
  };

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (mode === 'web') {
      triggerOutboundWebCall();
    } else {
      triggerOutboundPhoneCall();
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative flex h-[640px] w-[850px] overflow-hidden rounded-[13.58px] border border-black/10 bg-gradient-to-br from-transparent via-transparent to-white shadow-[0px_4px_14px_0px_rgba(0,0,0,0.25),-7px_4px_58px_0px_rgba(255,255,255,0.2)]">
        <div className="flex w-[450px] flex-col justify-end bg-white px-[42px] pb-8 pt-6 shadow-[-5.939px_3.394px_25.452px_1.697px_rgba(0,0,0,0.2)]">
          <div className="flex flex-1 flex-col gap-9">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="flex items-center justify-center text-black transition-colors hover:text-black/60"
              >
                <IoArrowBack className="size-[21px]" />
              </button>
              <h2 className="text-[32px] font-semibold leading-[42px] text-black">
                Enter Customer Details
              </h2>
            </div>

            <div className="flex flex-1 flex-col gap-9">
              <div className="flex gap-4">
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex size-4 items-center justify-center rounded-full bg-[#f0f0f0] text-[10px] font-medium leading-[1.4] text-black/60">
                      1
                    </div>
                    <span
                      className={`text-xs leading-[1.4] ${
                        currentStep === 1
                          ? 'font-semibold text-black/80'
                          : 'font-medium text-black/60'
                      }`}
                    >
                      Basic Details
                    </span>
                  </div>
                  <div
                    className={`h-1 rounded-[10px] ${
                      currentStep === 2
                        ? 'bg-[#6567f1]'
                        : currentStep === 1
                          ? 'bg-[#114eba]'
                          : 'bg-black/[0.08]'
                    }`}
                  />
                </div>

                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex size-4 items-center justify-center rounded-full bg-[#f0f0f0] text-[10px] font-medium leading-[1.4] text-black/60">
                      2
                    </div>
                    <span
                      className={`text-xs leading-[1.4] ${
                        currentStep === 2
                          ? 'font-semibold text-black/80'
                          : 'font-medium text-black/60'
                      }`}
                    >
                      Vehicle Details
                    </span>
                  </div>
                  <div
                    className={`h-1 rounded-[10px] ${currentStep === 2 ? 'bg-[#114eba]' : 'bg-black/[0.08]'}`}
                  />
                </div>
              </div>

              {currentStep === 1 ? (
                <div className="flex flex-col gap-4">
                  <div className="flex gap-3">
                    <div className="flex size-12 items-center justify-center rounded-[10.18px] border border-black/30 bg-white p-[10.18px]">
                      <RiUser3Fill className="size-[19.2px] text-black/80" />
                    </div>
                    <div className="customer-input-container flex flex-1 items-center gap-[10.18px] rounded-[10.18px] border border-black/30 bg-white p-[10.18px]">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange('name', e.target.value)
                        }
                        placeholder="Customer Name"
                        className="flex-1 border-0 text-base font-medium leading-5 text-black outline-none placeholder:text-black/40"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex gap-3">
                      <div className="flex size-12 items-center justify-center rounded-[10.18px] border border-black/30 bg-white p-[10.18px]">
                        <MdEmail className="size-[19.2px] text-black/80" />
                      </div>
                      <div
                        className={`customer-input-container flex flex-1 items-center gap-[10.18px] rounded-[10.18px] border bg-white p-[10.18px] ${
                          showEmailError ? 'border-red-500' : 'border-black/30'
                        }`}
                      >
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange('email', e.target.value)
                          }
                          onBlur={handleEmailBlur}
                          placeholder="Customer Email"
                          className="flex-1 border-0 text-base font-medium leading-5 text-black outline-none placeholder:text-black/40"
                        />
                      </div>
                    </div>
                    {showEmailError && (
                      <span className="ml-[60px] text-xs text-red-500">
                        Please enter a valid email address
                      </span>
                    )}
                  </div>

                  <div className="customer-phone-input flex gap-3">
                    <PhoneInput
                      country="us"
                      value={formData.phone}
                      onChange={(phone) => handleInputChange('phone', phone)}
                      enableSearch
                      disableSearchIcon
                      containerClass="customer-phone-container"
                      buttonClass="customer-phone-flag-button"
                      inputClass="customer-phone-input"
                      dropdownClass="customer-phone-dropdown"
                      searchClass="customer-phone-search"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  <div className="relative" ref={useCaseRef}>
                    <button
                      type="button"
                      onClick={() => setIsUseCaseOpen(!isUseCaseOpen)}
                      className="customer-input-container flex h-12 w-full items-center gap-[10.18px] rounded-[10.18px] border border-black/30 bg-white px-[18.18px] py-[10.18px] text-left transition-colors hover:bg-gray-50"
                    >
                      <span
                        className={`flex-1 text-base font-medium leading-[27.15px] ${
                          formData.useCase ? 'text-black' : 'text-black/20'
                        }`}
                      >
                        {formData.useCase
                          ? USE_CASE_OPTIONS.find(
                              (opt) => opt.value === formData.useCase
                            )?.label
                          : 'Select a Use Case'}
                      </span>
                      <MdKeyboardArrowDown
                        className={`size-5 text-black/80 transition-transform ${
                          isUseCaseOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isUseCaseOpen && (
                      <div className="absolute left-0 top-full z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-black/20 bg-white shadow-lg">
                        {USE_CASE_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              handleInputChange('useCase', option.value);
                              setIsUseCaseOpen(false);
                            }}
                            className={`block w-full px-[18.18px] py-3 text-left text-base font-medium transition-colors ${
                              option.value === formData.useCase
                                ? 'bg-[#4600f2]/10 text-[#4600f2]'
                                : 'text-black hover:bg-gray-50'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="customer-input-container flex h-12 items-center gap-[10.18px] rounded-[10.18px] border border-black/30 bg-white px-[18.18px] py-[10.18px]">
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange('description', e.target.value)
                      }
                      placeholder="Description"
                      className="flex-1 border-0 text-base font-medium leading-[27.15px] text-black outline-none placeholder:text-black/20"
                    />
                  </div>

                  <VehicleDropdown
                    value={formData.vin}
                    onChange={(vin, vehicle) => {
                      handleInputChange('vin', vin);
                      if (vehicle) {
                        setSelectedVehicle(vehicle);
                      }
                    }}
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleNext}
              disabled={!isCurrentStepValid() || isSubmitting}
              className={`flex h-[52px] items-center justify-center rounded-xl px-12 py-2 text-xl font-semibold leading-[1.5] text-white transition-colors ${
                isCurrentStepValid() && !isSubmitting
                  ? 'cursor-pointer bg-[#114eba] hover:bg-[#0d3a8f]'
                  : 'cursor-not-allowed bg-black/20'
              }`}
            >
              {isSubmitting
                ? 'Initiating...'
                : currentStep === 1
                  ? 'Next'
                  : 'Call'}
            </button>
          </div>
        </div>

        <div
          className="relative flex-1 overflow-hidden p-4"
          style={{
            background: `url('${getSafeStaticAssetUrl('https://spyne-static.s3.us-east-1.amazonaws.com/card-frame-bg.png')}') no-repeat`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <img
            src={getSafeStaticAssetUrl(agent.imageUrl)}
            alt={agent.name}
            className="absolute left-1/2 top-[150px] h-full w-auto -translate-x-1/2 object-cover"
          />
          <div className="flex w-fit max-w-[calc(100%-30px)] gap-[13px] rounded-xl border border-white/20 bg-black/10 p-[10px] pr-[27px] backdrop-blur-[10.18px]">
            <div
              className="relative flex h-[54px] w-[54px] min-w-[54px] items-center justify-center rounded-full"
              style={{
                background: `url('${getSafeStaticAssetUrl('https://spyne-static.s3.us-east-1.amazonaws.com/card-frame-bg.png')}') no-repeat`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute right-1 top-1 z-[2] min-h-2 min-w-2 rounded-full bg-[#26B579]" />
              <div className="flex h-[53px] w-[52px] items-center justify-center overflow-hidden rounded-full">
                <img
                  src={getSafeStaticAssetUrl(agent.imageUrl)}
                  alt={agent.name}
                  className="h-[53px] w-[52px] object-contain"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-nowrap text-[18.67px] font-semibold leading-[1.5] text-white">
                {`${StringUtils.toCapitalize(agent.agentCallType)} ${StringUtils.toCapitalize(agent.agentType)} Agent`}
              </span>
              <span className="text-nowrap text-[13.58px] font-medium leading-[1.3] text-white/60">
                {agent.name}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute right-2 top-2 flex size-[27.15px] items-center justify-center text-black/60 transition-colors hover:text-black/90"
        >
          <IoClose className="size-[27.15px]" />
        </button>
      </div>
    </div>
  );
};
