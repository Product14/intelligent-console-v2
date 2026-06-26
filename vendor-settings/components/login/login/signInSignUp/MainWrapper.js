'use client';

import { languageChangeIcons } from '@spyne-console/common-config/account/profile';
import { useSelector } from '@spyne-console/store';

import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import SignInSignUp from './SignInSignUp';

function MainWrapper({
  translate,
  i18n,
  language,
  showLangSelector,
  setShowLangSelector,
  availableLanguages,
  handleLanguageChange,
  isFetching,
}) {
  const authReducer = useSelector((state) => state.authReducer);
  const videoRef = useRef();
  const [buttonWidth, setButtonWidth] = useState(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (buttonRef.current) {
      setButtonWidth(buttonRef.current.offsetWidth);
    }
  }, [buttonRef.current]);

  return (
    <section className="enterprise-selection-area h-screen">
      <div className="container-fluid mx-auto h-full">
        <div className="relative h-full gap-0">
          <Image
            src={`https://media.spyneai.com/unsafe/filters:format(webp)/spyne-static.s3.us-east-1.amazonaws.com/console/icons/create_enterprise_org_type/Backgroundfinallast.webp`}
            loading="eager"
            width={1440}
            height={800}
            className="absolute left-0 top-0 h-full w-full object-cover blur-[1px]"
          />
          <div
            className={`max-lsm:justify-between max-lsm:px-0 max-lsm:py-0 flex h-full flex-col px-4 py-6 ${window.innerHeight < 650 && window.innerWidth > 764 ? 'tb:p-5 translate-y-[-10px] gap-0' : 'tb:p-10 gap-20'}`}
          >
            <div className="max-lsm:py-10 max-lsm:px-4 z-20 m-0 flex h-[44px] items-center justify-between">
              <img
                src={authReducer?.resellerData?.logo_url || ''}
                alt="Spyne logo"
                className="w-44"
              />
              <div className="relative">
                <button
                  ref={buttonRef}
                  className="m-0 flex h-[40px] w-[160px] items-center justify-between rounded-md border border-black/20 px-4 py-2 text-sm font-semibold sm:h-[35px] sm:w-[140px] md:h-[40px] md:w-[160px] lg:h-[45px] lg:w-[180px]"
                  onClick={() => setShowLangSelector(!showLangSelector)}
                >
                  <div className="flex items-center gap-2 text-black/60">
                    <Image
                      src={languageChangeIcons.globeblackIcon}
                      height={16}
                      width={16}
                    />
                    {language.label}
                  </div>
                  <Image
                    src={languageChangeIcons.dropdownblackIcon}
                    height={20}
                    width={20}
                  />
                </button>

                {showLangSelector && (
                  <div
                    className="absolute left-0 z-50 mt-1 w-[140px] rounded-lg border border-gray-200 bg-white shadow-md sm:w-[120px] md:w-[160px]"
                    style={{ width: buttonWidth }}
                  >
                    {availableLanguages.map((lang, index) => (
                      <div
                        key={index}
                        onClick={() => handleLanguageChange(lang)}
                        className="hover:text-blue-light flex cursor-pointer items-center justify-between px-2 py-2.5 text-sm font-medium hover:bg-gray-100"
                        style={{ width: '100%' }}
                      >
                        <span
                          className={`${language.value === lang.value ? 'text-blue-light' : ''}`}
                        >
                          {lang.label}
                        </span>
                        {language.value === lang.value && (
                          <Image
                            src={languageChangeIcons.checkIcon}
                            height={16}
                            width={16}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div
              className={`tb:w-[520px] z-20 mx-auto w-full ${window.innerHeight < 650 && window.innerWidth > 764 ? 'scale-[0.8]' : 'overflow-hidden'} h-min rounded-3xl bg-white px-4 py-4 md:px-10 md:py-10`}
            >
              <SignInSignUp translate={translate} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default MainWrapper;
