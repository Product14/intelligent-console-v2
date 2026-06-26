import React from 'react';
import { TbIdBadge2 } from 'react-icons/tb';

export interface Vehicle {
  vin: string;
  make: string;
  model: string;
  year: number;
  imageUrls: string[];
}

interface VehiclePreviewCardProps {
  vehicle: Vehicle;
  variant?: 'default' | 'compact' | 'dropdown-option';
  isSelected?: boolean;
  onClick?: () => void;
}

export const VehiclePreviewCard: React.FC<VehiclePreviewCardProps> = ({
  vehicle,
  variant = 'default',
  isSelected = false,
  onClick,
}) => {
  const isDropdownOption = variant === 'dropdown-option';
  const isCompact = variant === 'compact';

  const containerClasses = isDropdownOption
    ? `flex w-full gap-[10px] border-b border-black/10 p-3 text-left transition-colors last:border-b-0 ${
        isSelected ? 'bg-[#4600f2]/5' : 'hover:bg-gray-50'
      }`
    : 'flex w-full gap-[10px] rounded-xl border border-black/10 bg-white p-3';

  const content = (
    <>
      <div className="relative flex h-[70px] w-[122.706px] shrink-0 flex-col items-center justify-end overflow-hidden rounded-[4.941px] px-[12.353px] pb-[9.882px]">
        {vehicle.imageUrls && vehicle.imageUrls[0] && (
          <img
            src={vehicle.imageUrls[0]}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="relative z-10 flex items-center gap-1 rounded bg-white/90 px-1.5 py-0.5 backdrop-blur-sm">
          <TbIdBadge2 className="size-[14px] text-black/70" />
          <div className="flex flex-col leading-none">
            <span className="text-[3.829px] font-normal text-black/70">
              VIN
            </span>
            <span className="text-[5.466px] font-medium text-black">
              {vehicle.vin.slice(-8)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex flex-col">
          <span className="text-base font-semibold leading-8 text-black">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </span>
          <span className="text-base font-normal leading-5 text-black/60">
            {vehicle.vin}
          </span>
        </div>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={containerClasses}>
        {content}
      </button>
    );
  }

  return <div className={containerClasses}>{content}</div>;
};
