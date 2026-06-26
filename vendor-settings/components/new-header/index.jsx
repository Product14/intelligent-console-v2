import { useSelector } from '@spyne-console/store';

import React, { useEffect, useRef, useState } from 'react';

import { Logout } from '@spyne-console/utils/config';

export default function NewHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [userRole, setUserRole] = useState('');

  // Get user info from Redux store
  const auth = useSelector((state) => state.authReducer);
  const userName = auth?.userName || '';
  const emailId = auth?.emailId || '';

  useEffect(() => {
    const permissionObjectRaw = localStorage.getItem('permissionObject');
    if (permissionObjectRaw) {
      try {
        const permissionObject = JSON.parse(permissionObjectRaw);
        setUserRole(permissionObject?.user_role?.role_name || '');
      } catch {
        setUserRole('');
      }
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
      <div className="flex items-center">
        <span className="text-xl font-semibold text-gray-800">Admin Tools</span>
      </div>
      <div className="relative" ref={dropdownRef}>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full"
          onClick={() => setIsOpen((open) => !open)}
          aria-label="User menu"
        >
          <img
            src="https://spyne-static.s3.amazonaws.com/console/project/userProfileIcon.svg"
            alt="User Avatar"
            className="h-8 w-8 rounded-full object-cover"
          />
        </button>
        {isOpen && (
          <div className="absolute right-0 z-50 mt-3 w-96 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="flex items-center gap-4 border-b px-6 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full">
                <img
                  src="https://spyne-static.s3.amazonaws.com/console/project/userProfileIcon.svg"
                  alt="User Avatar"
                  className="h-10 w-10 rounded-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-lg font-semibold text-gray-900">
                  {userName}
                </div>
                <div className="truncate text-sm text-gray-500">{emailId}</div>
              </div>
              {userRole && (
                <span className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  {userRole}
                </span>
              )}
            </div>
            <div className="py-2">
              <button
                className="flex w-full items-center gap-2 px-6 py-2 text-left text-base text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  setIsOpen(false);
                  Logout(true, false);
                }}
              >
                <img
                  src="https://spyne-static.s3.amazonaws.com/console/header-icons/logoutIcon.svg"
                  alt="Logout"
                  className="h-5 w-5"
                />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
