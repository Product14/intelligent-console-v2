import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import Image from 'next/image';

const WebsiteDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [copiedUrl, setCopiedUrl] = useState(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const websiteLink = useSelector(
    (state) => state.enterpriseTeamReducer?.selectedTeam?.website_link
  );
  const spyneWebsiteLink = useSelector(
    (state) => state.enterpriseTeamReducer?.selectedTeam?.spyne_website_link
  );

  const urlCard = (url, title, className) => {
    function normalizeUrl(url) {
      if (!/^https?:\/\//i.test(url)) {
        return `https://${url}`;
      }
      return url;
    }
    const correctedUrl = normalizeUrl(url);
    return (
      <div
        className={`relative cursor-pointer p-4 transition-all duration-200 hover:bg-gray-50 ${className}`}
      >
        <div className="flex items-start gap-3">
          <Image
            className="globe-icon mt-0.5 h-[14px] w-[14px] flex-shrink-0"
            src={`${process.env.NEXT_PUBLIC_THUMBOR_DOMAIN_URL}/unsafe/filters:format(webp)/https://spyne-static.s3.us-east-1.amazonaws.com/globe.svg`}
            height={20}
            width={20}
            alt="globe-icon"
          />
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-sm font-semibold text-gray-900">{title}</p>
            <div className="relative flex items-center gap-2">
              <a
                href={correctedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="max-w-[210px] truncate text-xs font-normal text-[#3538CD] transition-colors hover:text-blue-800"
                onClick={(e) => e.stopPropagation()}
              >
                {url}
              </a>
              <div className="relative flex items-center justify-center">
                <button
                  onClick={(e) => {
                    handleCopyUrl(correctedUrl);
                  }}
                  className="rounded p-[2px] transition-colors hover:bg-gray-100"
                  title="Copy URL"
                >
                  <Image
                    src={`${process.env.NEXT_PUBLIC_THUMBOR_DOMAIN_URL}/unsafe/filters:format(webp)/https://spyne-static.s3.us-east-1.amazonaws.com/content_copy.svg`}
                    height={16}
                    width={16}
                    alt="copy-icon"
                  />
                </button>
                {copiedUrl === correctedUrl && (
                  <span className="absolute left-1/2 top-full z-10 mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white shadow">
                    Copied!
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => {
      setCopiedUrl(null);
    }, 1200);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`header-dropdown flex h-[44px] cursor-pointer items-center overflow-hidden text-ellipsis whitespace-nowrap rounded-lg px-2 py-1 transition-all duration-300 ease-in-out hover:bg-gray-50`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Image
          className="globe-icon mr-1 h-[14px] w-[14px]"
          src="https://spyne-static.s3.us-east-1.amazonaws.com/globe.svg"
          height={20}
          width={20}
          alt="globe-icon"
        />
        <p
          className={`max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold text-[#402387]`}
        >
          Website
        </p>
        <Image
          className={`drop ml-2 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          src="https://spyne-static.s3.amazonaws.com/console/console_header/caret-down-with-bg-purple.svg"
          height={20}
          width={20}
          alt="down caret icon"
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-max max-w-[500px] rounded-xl border border-gray-200 bg-white shadow-lg">
          {spyneWebsiteLink &&
            urlCard(
              spyneWebsiteLink,
              'Your Spyne website',
              'border-b border-gray-200 rounded-t-lg'
            )}
          {websiteLink &&
            urlCard(websiteLink, 'Your Current website', 'rounded-b-lg')}
        </div>
      )}
    </div>
  );
};

export default WebsiteDropdown;
