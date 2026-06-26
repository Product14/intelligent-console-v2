import { LiaBusinessTimeSolid } from 'react-icons/lia';

// @ts-ignore
import { cn } from '@spyne-console/utils/cn';

import { StringUtils } from '@/utils-settings/StringUtils';

import {
  BUSINESS_INDUSTRIES,
  BUSINESS_TYPES,
} from '@/helpers-settings/cnam-config-builder';

import { BusinessDetailsFormData } from './BusinessDetails';

const STATUS_DISPLAY: Record<string, { label: string; className: string }> = {
  pending: {
    label: 'Pending Review',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  approved: {
    label: 'Approved',
    className: 'bg-green-50 text-green-700 border-green-200',
  },
  rejected: {
    label: 'Rejected — Please resubmit',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
};

interface BusinessDetailsReadonlyProps {
  data: BusinessDetailsFormData;
  status?: string;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-[rgba(0,0,0,0.45)]">
        {label}
      </span>
      <span className="text-sm font-medium text-[rgba(0,0,0,0.8)]">
        {value || '—'}
      </span>
    </div>
  );
}

export default function BusinessDetailsReadonly({
  data,
  status,
}: BusinessDetailsReadonlyProps) {
  const statusInfo = status ? STATUS_DISPLAY[status] : undefined;

  const businessTypeLabel =
    BUSINESS_TYPES.find((t) => t.value === data.businessType)?.label ??
    data.businessType;

  const businessIndustryLabel =
    BUSINESS_INDUSTRIES.find((i) => i.value === data.businessIndustry)?.label ??
    data.businessIndustry;

  const formatPhoneNumber = (value: string) => {
    if (!value) return '';
    const normalizedValue = value.startsWith('+') ? value : `+${value}`;
    return StringUtils.formatPhoneNumber(normalizedValue);
  };

  return (
    <div className="flex w-full flex-col gap-8 rounded-2xl border border-black/10 p-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#4600f2] bg-[#4600f2]/10">
            <LiaBusinessTimeSolid className="h-6 w-6 text-[#4600f2]" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-[#111]">
              Caller ID Registration
            </h2>
            <p className="text-sm text-[#666]">
              Register your caller ID for agent communication
            </p>
          </div>
        </div>
        {statusInfo && (
          <span
            className={cn(
              'shrink-0 rounded-full border px-3 py-1 text-xs font-semibold',
              statusInfo.className
            )}
          >
            {statusInfo.label}
          </span>
        )}
      </div>

      {/* Category 1 — Profile Details */}
      <div className="flex w-full flex-col gap-4">
        <p className="text-sm font-semibold text-[#666]">
          Category 1 - Profile Details
        </p>
        <div className="grid w-full gap-6 md:grid-cols-2">
          <Field label="Legal Business Name" value={data.legalBusinessName} />
          <Field
            label="Caller ID Display Name"
            value={data.callerIdDisplayName}
          />
        </div>
      </div>

      {/* Category 2 — Business Details */}
      <div className="flex w-full flex-col gap-4">
        <p className="text-sm font-semibold text-[#666]">
          Category 2 - Business Details
        </p>
        <div className="grid w-full gap-6 md:grid-cols-2">
          <Field label="Business Type" value={businessTypeLabel} />
          <Field label="Business Industry" value={businessIndustryLabel} />
        </div>
        <Field
          label="Employer Identification Number (EIN)"
          value={data.employerIdentificationNumber}
        />
      </div>

      {/* Category 3 — Authorized Representatives */}
      <div className="flex w-full flex-col gap-4">
        <p className="text-sm font-semibold text-[#666]">
          Category 3 - Authorized Representatives
        </p>
        <div className="flex w-full flex-col gap-6">
          {data.representatives.map((rep, index) => (
            <div key={index} className="flex w-full flex-col gap-4">
              <p className="text-sm font-semibold text-[#666]">
                {`Representative #${index + 1}`}
              </p>
              <div className="grid w-full gap-4 md:grid-cols-2">
                <Field label="First Name" value={rep.firstName} />
                <Field label="Last Name" value={rep.lastName} />
                <Field label="Email" value={rep.email} />
                <Field label="Title" value={rep.title} />
                <Field
                  label="Phone Number"
                  value={formatPhoneNumber(rep.phoneNumber)}
                />
                <Field label="Position" value={rep.position} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
