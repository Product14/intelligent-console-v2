import React from 'react';
import { TfiMenuAlt } from 'react-icons/tfi';

interface IconPillProps {
  text: string;
  icon?: React.ReactNode;
  className?: string;
}

const IconPill: React.FC<IconPillProps> = ({
  text,
  icon = <TfiMenuAlt className="size-[22px] text-[#00000099]" />,
  className = '',
}) => {
  return (
    <div
      className={`gap-2 text-lg font-normal leading-8 tracking-normal ${className}`}
    >
      <div className="flex flex-row items-center justify-center gap-x-[14.4px] rounded-[10px] border-[1.2px] border-[#0000001A] px-[14.4px] py-[7.2px] text-lg font-normal leading-8 tracking-normal">
        <div>{icon}</div>
        <div className="whitespace-nowrap font-normal leading-6 tracking-normal text-black/60">
          {text}
        </div>
      </div>
    </div>
  );
};

export default IconPill;
