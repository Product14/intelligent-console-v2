import React, { useEffect, useRef, useState } from 'react';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { TbIdBadge2 } from 'react-icons/tb';
import { toast } from 'react-toastify';

import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

import useUserDetails from '@/hooks/settings/useUserDetails';

import { Vehicle, VehiclePreviewCard } from './VehiclePreviewCard';

export type { Vehicle } from './VehiclePreviewCard';

interface VehicleDropdownProps {
  value: string;
  onChange: (vin: string, vehicle?: Vehicle) => void;
  disabled?: boolean;
  onVehicleSelect?: (vehicle: Vehicle) => void;
}

export const VehicleDropdown: React.FC<VehicleDropdownProps> = ({
  value,
  onChange,
  disabled = false,
  onVehicleSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { enterpriseId, teamId, userId } = useUserDetails();

  const fetchVehicleInventory = async () => {
    if (!enterpriseId || !teamId || !userId) {
      console.error('Missing user details');
      return;
    }

    setIsLoading(true);
    try {
      const data = await CentralAPIHandler.handlePostRequest(
        `${process.env.BACKEND_BASEURL}/console/v1/product-onboarding/vini/get-dummy-inventory`,
        {
          enterpriseId,
          teamId,
          userId,
        }
      );

      if (data?.data?.vehicles) {
        setVehicles(data.data.vehicles);
      }
    } catch (error) {
      toast.error('Error fetching vehicle inventory');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (
      vehicles.length === 0 &&
      !isLoading &&
      enterpriseId &&
      teamId &&
      userId
    ) {
      fetchVehicleInventory();
    }
  }, [enterpriseId, teamId, userId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedVehicle = vehicles.find((v) => v.vin === value);

  const getDisplayText = () => {
    if (value) {
      return selectedVehicle
        ? `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`
        : value;
    }
    return isLoading ? 'Loading vehicles...' : 'Select Vehicle';
  };

  if (selectedVehicle && !isOpen) {
    return (
      <div ref={dropdownRef}>
        <VehiclePreviewCard vehicle={selectedVehicle} />
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-[10.18px] border border-black/30 bg-white">
        <TbIdBadge2 className="size-6 text-black/80" />
      </div>
      <div className="relative flex-1" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="customer-input-container flex h-12 w-full items-center gap-[10.18px] rounded-[10.18px] border border-black/30 bg-white px-[18.18px] py-[10.18px] text-left transition-colors hover:bg-gray-50"
          disabled={disabled || isLoading}
        >
          <span
            className={`flex-1 text-base font-medium leading-[27.15px] ${
              value ? 'text-black' : 'text-black/20'
            }`}
          >
            {getDisplayText()}
          </span>
          <MdKeyboardArrowDown
            className={`size-5 text-black/80 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && vehicles.length > 0 && (
          <div className="absolute left-0 top-full z-50 mt-1 h-[220px] w-full min-w-[500px] overflow-y-auto rounded-xl border border-black/10 bg-white shadow-[0px_4px_14px_0px_rgba(0,0,0,0.25)]">
            {vehicles.map((vehicle) => (
              <VehiclePreviewCard
                key={vehicle.vin}
                vehicle={vehicle}
                variant="dropdown-option"
                isSelected={vehicle.vin === value}
                onClick={() => {
                  onChange(vehicle.vin, vehicle);
                  onVehicleSelect?.(vehicle);
                  setIsOpen(false);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
