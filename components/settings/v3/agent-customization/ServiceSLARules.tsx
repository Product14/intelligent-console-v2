import React from 'react';

import CustomizationInput from './CustomizationInput';

interface ServiceSLARulesProps {
  values: {
    diagnostics?: string;
    recall?: string;
    loanerBookings?: string;
    pickupAndDropoffBookings?: string;
  };
  onChange: (field: string, value: string) => void;
  errors?: {
    diagnostics?: string;
    recall?: string;
    loanerBookings?: string;
    pickupAndDropoffBookings?: string;
  };
}

const ServiceSLARules: React.FC<ServiceSLARulesProps> = ({
  values,
  onChange,
  errors = {},
}) => {
  return (
    <div className="flex flex-col gap-6 rounded-xl border border-black/10 bg-white p-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold leading-7 text-black/80">
          Service SLA Rules
        </h3>
        <p className="text-sm font-normal leading-tight text-black/60">
          What SLA should the agent quote?
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <CustomizationInput
          label="Diagnostic/inspection Service"
          description="Timing SLA for regular service"
          value={values.diagnostics || ''}
          onChange={(value) => onChange('diagnostics', value)}
          placeholder="Example: 1 hr"
          error={errors.diagnostics}
        />

        <CustomizationInput
          label="Recall Issues"
          description="Timing SLA for recall service"
          value={values.recall || ''}
          onChange={(value) => onChange('recall', value)}
          placeholder="Example: 1 hr"
          error={errors.recall}
        />

        <CustomizationInput
          label="Loaner Bookings"
          description="How much in advance or future the agent should offer booking slots in days"
          value={values.loanerBookings || ''}
          onChange={(value) => onChange('loanerBookings', value)}
          placeholder="Example: 1 day"
          error={errors.loanerBookings}
        />

        <CustomizationInput
          label="Pickup/Dropoff Bookings"
          description="How much in advance or future the agent should offer booking slots"
          value={values.pickupAndDropoffBookings || ''}
          onChange={(value) => onChange('pickupAndDropoffBookings', value)}
          placeholder="Example: 1 day"
          error={errors.pickupAndDropoffBookings}
        />
      </div>
    </div>
  );
};

export default ServiceSLARules;
