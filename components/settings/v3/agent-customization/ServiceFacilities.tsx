import React from 'react';

import CustomizationRadio from './CustomizationRadio';

export interface ServiceFacilitiesValues {
  pickupDropoff?: { hasOpted: boolean };
  loaner?: { hasOpted: boolean };
  shuttle?: { hasOpted: boolean };
}

interface ServiceFacilitiesProps {
  values: ServiceFacilitiesValues;
  onChange: (updatedFacilities: Partial<ServiceFacilitiesValues>) => void;
}

const ServiceFacilities: React.FC<ServiceFacilitiesProps> = ({
  values,
  onChange,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold leading-7 text-black/80">
          Service Facilities
        </h3>
        <p className="text-sm font-normal leading-tight text-black/60">
          Supported transportation facilities.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium leading-tight text-black/80">
            Pickup & Dropoff
          </label>
          <div className="flex gap-3">
            <CustomizationRadio
              name="pickupDropoff"
              value="take-request-and-transfer"
              label="Add a note to appointment"
              checked={values.pickupDropoff?.hasOpted === true}
              onChange={() => onChange({ pickupDropoff: { hasOpted: true } })}
            />
            <CustomizationRadio
              name="pickupDropoff"
              value="politely-decline"
              label="Arrange callback"
              checked={values.pickupDropoff?.hasOpted === false}
              onChange={() => onChange({ pickupDropoff: { hasOpted: false } })}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium leading-tight text-black/80">
            Loaner Vehicle
          </label>
          <div className="flex gap-3">
            <CustomizationRadio
              name="loanerVehicle"
              value="offer-loaner"
              label="Add a note to appointment"
              checked={values.loaner?.hasOpted === true}
              onChange={() => onChange({ loaner: { hasOpted: true } })}
            />
            <CustomizationRadio
              name="loanerVehicle"
              value="decline-callback"
              label="Arrange callback"
              checked={values.loaner?.hasOpted === false}
              onChange={() => onChange({ loaner: { hasOpted: false } })}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium leading-tight text-black/80">
            Shuttle
          </label>
          <div className="flex gap-3">
            <CustomizationRadio
              name="shuttle"
              value="direct-respond"
              label="Add a note to appointment"
              checked={values.shuttle?.hasOpted === true}
              onChange={() => onChange({ shuttle: { hasOpted: true } })}
            />
            <CustomizationRadio
              name="shuttle"
              value="inform-unavailable"
              label="Arrange callback"
              checked={values.shuttle?.hasOpted === false}
              onChange={() => onChange({ shuttle: { hasOpted: false } })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceFacilities;
