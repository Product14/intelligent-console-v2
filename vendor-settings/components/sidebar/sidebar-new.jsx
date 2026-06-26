'use client';

import React, { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { Chevron } from '@spyne-console/design-system/icons';

import { cn } from '@spyne-console/utils/cn';

import { menuItems } from './sidebar-config';

function SidebarNew({ showSideNavbar = true, userPermissions = [] }) {
  const router = useRouter();
  const pathname = usePathname();

  const [dropdowns, setDropdowns] = useState({});

  useEffect(() => {
    // Initialize dropdowns based on current path
    if (!pathname || typeof pathname !== 'string') {
      return;
    }
    const pathParts = pathname.split('/').filter(Boolean);
    const rootPath = pathParts[0];
    const subPath = pathParts[1];

    // Create new dropdowns state
    const newDropdowns = {};

    // Check each menu item to see if current path matches
    menuItems.forEach((item) => {
      // Check if main menu path matches
      if (
        item.slug &&
        typeof item.slug === 'string' &&
        pathname.startsWith(item.slug)
      ) {
        newDropdowns[item.id] = true;
      }

      // Check submenu paths
      if (item.subMenu) {
        const hasMatchingSubmenu = item.subMenu.some(
          (subItem) =>
            subItem.slug &&
            typeof subItem.slug === 'string' &&
            pathname.startsWith(subItem.slug)
        );
        if (hasMatchingSubmenu) {
          newDropdowns[item.id] = true;
        }
      }
    });

    setDropdowns(newDropdowns);
  }, [pathname]);

  const handleMenuTabClick = (item) => {
    // Only handle navigation
    if (item.subMenu && !item.slug) {
      const firstVisibleSubmenuItem = item.subMenu.find(
        (subItem) =>
          !subItem.hidden && hasRequiredPermissions(subItem.permissions)
      );
      if (firstVisibleSubmenuItem) {
        router.push(firstVisibleSubmenuItem.slug);
      }
    } else {
      router.push(item.slug);
    }
  };

  const handleSubMenuClick = (parentItem, subItem) => {
    router.push(subItem.slug);
  };

  const hasRequiredPermissions = (permissions) => {
    // If no permissions required (empty array), show to everyone
    if (!permissions || permissions.length === 0) {
      return true;
    }
    // Check if user has any of the required permissions
    return permissions.some((permission) =>
      userPermissions.includes(permission)
    );
  };

  const renderMenuItem = (item) => {
    // Skip rendering if item is hidden or user doesn't have required permissions
    if (
      item.hidden ||
      !hasRequiredPermissions(item.permissions) ||
      item.id === 'organization'
    ) {
      return null;
    }

    const isDropdownOpen = dropdowns[item.id];
    const hasActiveSubmenu = item.subMenu?.some((subItem) =>
      pathname.startsWith(subItem.slug)
    );
    const isActive =
      pathname.startsWith(item.slug) || (isDropdownOpen && hasActiveSubmenu);

    return (
      <div key={item.id} className="">
        <Link
          href={item.slug || '#'}
          className={[
            'menu-list mb-1 flex cursor-pointer items-center justify-between gap-2 rounded-l-[4px] rounded-r-[4px] border-l-4 p-3 text-base font-normal leading-6',
            isActive
              ? 'active border-primary bg-primary-50 text-primary font-semibold'
              : 'text-typography-200 hover:bg-primary-50 border-transparent',
          ].join(' ')}
          onClick={(e) => {
            if (item.subMenu && !item.slug) {
              e.preventDefault();
              handleMenuTabClick(item);
            }
          }}
        >
          <div className="flex items-center gap-2">
            {typeof item.icon === 'string' ? (
              <Image
                src={item.icon}
                alt={item.label}
                height={24}
                width={24}
                className="inline w-6"
              />
            ) : (
              item.icon
            )}
            {showSideNavbar && <span>{item.label}</span>}
          </div>
          {item.subMenu && showSideNavbar && (
            <Chevron
              className={cn(
                'cursor-pointer transition-all duration-300 ease-in-out',
                isDropdownOpen ? 'rotate-90' : '!rotate-0'
              )}
            />
          )}
        </Link>

        {item.subMenu && (
          <div
            className={`${isDropdownOpen ? 'max-h-full' : 'max-h-0'} overflow-hidden overflow-y-auto transition-all duration-300 ease-in-out`}
          >
            <ul className="pl-5">
              {item.subMenu.map(
                (subItem) =>
                  // Only render submenu items that aren't hidden and user has permissions for
                  !subItem.hidden &&
                  hasRequiredPermissions(subItem.permissions) && (
                    <li key={subItem.id}>
                      <Link
                        href={subItem.slug}
                        className={[
                          'menu-list mb-1 flex cursor-pointer items-center gap-2 rounded-l-[4px] rounded-r-[4px] border-l-4 p-3 text-sm font-normal leading-6',
                          pathname === subItem.slug ||
                          (pathname.includes('listing') &&
                            subItem.id === 'listing')
                            ? 'active border-primary bg-primary-50 text-primary font-semibold'
                            : 'text-typography-200 hover:bg-primary-50 border-transparent',
                        ].join(' ')}
                      >
                        {typeof subItem.icon === 'string' ? (
                          <></>
                        ) : (
                          subItem.icon
                        )}
                        {showSideNavbar && <span>{subItem.label}</span>}
                      </Link>
                    </li>
                  )
              )}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`scrollbar-hide fixed left-0 z-40 h-[calc(100vh-60px)] overflow-y-auto border-r border-black/10 bg-white px-3 py-4 ${
        showSideNavbar ? 'w-[250px]' : 'w-20'
      }`}
    >
      <div className="w-full">
        <div className={`${showSideNavbar ? '' : ''}`}>
          {menuItems.map(renderMenuItem)}
        </div>

        <div className="dividerForOrg"></div>
        {/* {menuItems.map(renderOrganizationMenuItem)} */}
      </div>
    </div>
  );
}

export default SidebarNew;
