import React from 'react';
import { FaUserLock } from 'react-icons/fa6';
import { HiChevronLeft, HiX } from 'react-icons/hi';
import { IoMdCheckmark, IoMdClose } from 'react-icons/io';
import { PiUsersFill } from 'react-icons/pi';

import Image from 'next/image';

interface LearnMoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LearnMoreModal = ({ isOpen, onClose }: LearnMoreModalProps) => {
  if (!isOpen) return null;

  const permissions = [
    {
      action: 'Manage & update all team roles',
      member: { allowed: false, text: 'Limited to own data' },
      admin: { allowed: true, text: 'Full control' },
      owner: { allowed: true, text: 'Full control' },
    },
    {
      action: 'View and edit all enterprise data',
      member: { allowed: false, text: 'Limited to own data' },
      admin: { allowed: true, text: 'Full access' },
      owner: { allowed: true, text: 'Full access' },
    },
    {
      action: 'Create and rename projects',
      member: { allowed: true, text: '' },
      admin: { allowed: true, text: '' },
      owner: { allowed: true, text: '' },
    },
    {
      action: 'Modify project details and images',
      member: { allowed: true, text: '' },
      admin: { allowed: true, text: '' },
      owner: { allowed: true, text: '' },
    },
    {
      action: 'Delete projects or SKUs',
      member: { allowed: false, text: 'Can delete own only' },
      admin: { allowed: true, text: '' },
      owner: { allowed: true, text: '' },
    },
    {
      action: 'Access and modify CRM data',
      member: { allowed: false, text: 'Limited to own calls/logs' },
      admin: { allowed: true, text: '' },
      owner: { allowed: true, text: '' },
    },
    {
      action: 'Invite & manage users',
      member: { allowed: false, text: 'Cannot invite users' },
      admin: { allowed: true, text: '' },
      owner: { allowed: true, text: '' },
    },
    {
      action: 'API & Webhook settings',
      member: { allowed: false, text: 'Cannot invite users' },
      admin: { allowed: false, text: 'Cannot invite users' },
      owner: { allowed: true, text: '' },
    },
  ];

  const renderPermissionCell = (permission: {
    allowed: boolean;
    text: string;
  }) => (
    <div className="flex items-center justify-center gap-2">
      {permission.allowed ? (
        <IoMdCheckmark className="h-5 w-5 flex-shrink-0 text-blue-500" />
      ) : (
        <IoMdClose className="h-5 w-5 flex-shrink-0 text-red-400" />
      )}
      {permission.text && (
        <span className="text-xs text-gray-500">{permission.text}</span>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-[90vh] w-[950px] overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between p-6">
          <div className="flex items-start gap-3">
            <button
              onClick={onClose}
              className="text-black/50 transition-colors hover:text-gray-600"
            >
              <HiChevronLeft className="h-8 w-8" />
            </button>
            <div>
              <h2 className="mb-2 font-['Inter'] text-lg font-semibold leading-7 text-black/90">
                What can I do?
              </h2>
              <p className="font-['Inter'] text-sm font-normal leading-5 text-black/60">
                Invite users and assign them to their designated teams
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <HiX className="h-6 w-6" />
          </button>
        </div>

        {/* Permissions Table */}
        <div className="px-6 pb-6 pt-4">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {/* Table Header */}
            <div className="grid grid-cols-4 border-b border-gray-200">
              <div className="border-r border-gray-200 p-4" />
              {/* Member Column Header */}
              <div className="border-r border-gray-200 bg-gradient-to-b from-blue-50 to-white p-4">
                <div className="flex flex-col gap-2">
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-md border border-[#5064FF] bg-white">
                    <PiUsersFill className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="font-['Inter'] text-base font-semibold capitalize leading-6 tracking-tight text-black/80">
                    Member
                  </div>
                </div>
              </div>
              {/* Admin Column Header */}
              <div className="border-r border-gray-200 bg-gradient-to-b from-pink-50 to-white p-4">
                <div className="flex flex-col gap-2">
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-md border border-[#E76EB6] bg-white">
                    <FaUserLock className="h-5 w-5 text-pink-500" />
                  </div>
                  <div className="font-['Inter'] text-base font-semibold capitalize leading-6 tracking-tight text-black/80">
                    Admin
                  </div>
                </div>
              </div>
              {/* Enterprise Owner Column Header */}
              <div className="flex flex-col justify-center gap-2 bg-gradient-to-b from-purple-50 to-white p-4">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-md border border-[#2500D9] bg-white">
                  {/* <FaBuilding className="h-6 w-6 text-blue-400" /> */}
                  <Image
                    src="https://media.spyneai.com/unsafe/filters:format(webp)/d20uiuzezo3er4.cloudfront.net/onboarding/enterprise-icon.svg"
                    alt="Enterprise Icon"
                    width={24}
                    height={24}
                    className="h-5 w-5"
                  />
                </div>
                <div className="font-['Inter'] text-base font-semibold capitalize leading-6 tracking-tight text-black/80">
                  Enterprise Owner
                </div>
              </div>
            </div>

            {/* Table Rows */}
            {permissions.map((permission, index) => (
              <div
                key={index}
                className="grid grid-cols-4 border-b border-gray-200 last:border-b-0"
              >
                <div className="flex items-center border-r border-gray-200 bg-[#00000005] p-4">
                  <span className="font-['Inter'] text-xs font-medium leading-4 text-black/80">
                    {permission.action}
                  </span>
                </div>
                <div className="flex items-center justify-center border-r border-gray-200 p-4">
                  {renderPermissionCell(permission.member)}
                </div>
                <div className="flex items-center justify-center border-r border-gray-200 p-4">
                  {renderPermissionCell(permission.admin)}
                </div>
                <div className="flex items-center justify-center p-4">
                  {renderPermissionCell(permission.owner)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnMoreModal;
