/**@format */
import { GoogleLogin } from '@react-oauth/google';
import { LOGIN_DATA } from '@spyne-console/common-config/login';
import { useSelector } from '@spyne-console/store';

import React, { useContext, useEffect, useState } from 'react';
import PhoneInput from 'react-phone-input-2';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

import useCurrentRoute from '@spyne-console/hooks/useCurrentRoute';

import {
  base64Decode,
  checkCategoryAndRedirect,
  localStorageKeys,
  redirectLinks,
  redirectToAdminTools,
  skipEnterpriseSelectionPage,
} from '@spyne-console/utils/config';
import { captureEvent } from '@spyne-console/utils/config';

import HideSpyneContent from '../../../hoc/HideSpyneContent';
import Spinner from '../../common/skeleton&spinner/Spinner';
import GoogleSignInButton from '../GoogleButton';
import SignInSignUpContext from '../context';
import { ENTERPRISE_DATA } from '../enterprise-team-selection/config';

function EnterEmail(props) {
  const authReducer = useSelector((state) => state.authReducer);
  const {
    setErrorMsg,
    loginOrSignup,
    setLoginOrSignup,
    setFormErrors,
    showEmailFields,
    setShowEmailFields,
    user,
    getEmailId,
    formatInput,
    SignInSpinner,
    formErrors,
    enterpriseDetails,
    handlePhoneInput,
    handleCredentialResponse,
    errorMsg,
    emailInputRef,
    checkUserExists,
    closeLogin,
    setEnterpriseDetails,
    refreshTokenAndUpdateRedux,
    loginType,
    source = 'browser',
  } = useContext(SignInSignUpContext);
  const { ENTER_EMAIL_DATA, allowClose, translate } = props;
  const router = useRouter();

  const { mainRoute, childRoute } = useCurrentRoute();
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [googleResponse, setGoogleResponse] = useState(null);
  if (authReducer?.resellerData?.is_reseller) {
    setShowEmailFields(true);
    setLoginOrSignup('login');
  }
  useEffect(() => {
    if (showEmailFields) {
      captureEvent(
        'step1_continue_with_email',
        {
          parent_screen_name: mainRoute,
          child_screen_name: childRoute ?? mainRoute,
          event_type: 'screen_view',
        },
        true
      );
    }
  }, [showEmailFields]);

  useEffect(() => {
    //add from which screen

    captureEvent(
      'resctrictive_popup_screenview',
      {
        parent_screen_name: mainRoute,
        child_screen_name: childRoute ?? mainRoute,
        event_type: 'screen_view',
      },
      true
    );

    setEnterpriseDetails({
      enterprise_name: '',
      category: '',
      category_id: '',
      default_teamname: '',
      owner_name: '',
      owner_phone: '',
      countryCode: 'us',
      dialCode: '1',
      disable: false,
    });
  }, []);

  useEffect(() => {
    if (
      localStorage.getItem(localStorageKeys?.DEVICEID) &&
      localStorage.getItem(localStorageKeys?.AUTHKEY) &&
      localStorage.getItem(localStorageKeys.DEFAULTBEARERTOKEN)
    ) {
      try {
        let userEmail = JSON.parse(
          localStorage.getItem(localStorageKeys?.USERDETAILS)
        ).emailId;
        let defaultEnterprise = JSON.parse(
          localStorage.getItem(localStorageKeys?.defaultEnterprise)
        );

        const { skip: skipEnterpriseSelection, enterprise_id } =
          skipEnterpriseSelectionPage(
            userEmail,
            defaultEnterprise.enterpriseId
          );
        if (skipEnterpriseSelection) {
          // router.push({pathname: "/home", query: {"enterprise_id": enterprise_id}})
          checkCategoryAndRedirect(
            router,
            defaultEnterprise?.category_id,
            enterprise_id
          );
        } else {
          redirectToAdminTools(router);
        }
        refreshTokenAndUpdateRedux({ fastRefresh: false });
      } catch (error) {
        console.log(error);
      }
    }
  }, []);

  const handlePhoneNumberInput = (value, data) => {
    handlePhoneInput(value, data);
    captureEvent(
      'create_enterprise',
      {
        parent_screen_name: mainRoute,
        child_screen_name: childRoute ?? mainRoute,
        phone_number_entered: value,
      },
      true
    );
  };
  const handleGoogleResponse = async (googleResponse, e) => {
    let credential = base64Decode({ payload: googleResponse, decodeSrc: true });
    setGoogleResponse(credential);
    return credential;
  };
  return (
    <form className={`${loginType != 'home-page' ? 'max-tb:px-5' : 'hidden'}`}>
      <div
        className={`flex items-center gap-2 text-left text-3xl font-bold text-[#402387] ${authReducer?.resellerData?.is_reseller ? 'mb-8' : ''}`}
      >
        <HideSpyneContent>
          <Image
            onClick={() => {
              setShowEmailFields(false);
              if (loginOrSignup === 'login') {
                setLoginOrSignup('signup');
              }
              setErrorMsg('');
            }}
            src="https://spyne-static.s3.amazonaws.com/console/icons/leftGrayCaret.svg"
            width={18}
            height={18}
            alt="back"
            className={`h-4 cursor-pointer ${showEmailFields ? 'block' : 'hidden'}`}
          />
        </HideSpyneContent>
        {showEmailFields ? (
          loginOrSignup === 'login' ? (
            errorMsg ? (
              translate('console.screens.signInSignUpScreen.emailNotRegistered')
            ) : (
              translate(
                'console.screens.signInSignUpScreen.loginInToYourAccount'
              )
            )
          ) : (
            translate('console.screens.signInSignUpScreen.continueWithEmail')
          )
        ) : (
          <div>
            <div className="mb-2 text-base font-normal uppercase leading-tight tracking-widest text-black/40">
              {' '}
              {translate(
                'console.screens.signInSignUpScreen.loginScreenGreeting1'
              )}{' '}
            </div>
            <div className="">
              {' '}
              {translate(
                'console.screens.signInSignUpScreen.loginScreenGreeting2'
              )}{' '}
            </div>
          </div>
        )}
        {allowClose && (
          <Image
            src="https://spyne-static.s3.amazonaws.com/console/project/close_icon.svg"
            width={24}
            height={24}
            alt="close"
            className="flex cursor-pointer items-center"
            onClick={() => closeLogin()}
          />
        )}
      </div>
      <HideSpyneContent>
        <p className="lsm:mb-8 text-black-60 mb-6 mt-3 text-sm font-normal">
          {showEmailFields ? (
            loginOrSignup === 'login' ? (
              errorMsg ? (
                translate('console.screens.emailScreen.notRegisteredYet')
              ) : (
                translate('console.screens.emailScreen.emailLoginSignUpText2')
              )
            ) : (
              translate('console.screens.emailScreen.emailLoginSignUpText')
            )
          ) : (
            <div>
              {translate(
                'console.screens.signInSignUpVS.loginScreenSubGreeting'
              )}
              <span className="font-semibold text-black">
                {' '}
                {translate('console.screens.signInSignUpVS.signUp')}
              </span>{' '}
              {translate('console.screens.signInSignUpVS.now')}
            </div>
          )}
        </p>
      </HideSpyneContent>
      {showEmailFields ? (
        <>
          <div className="newinput-wrapper relative mb-8">
            <input
              onClick={() =>
                captureEvent(
                  'write_email',
                  {
                    parent_screen_name: mainRoute,
                    child_screen_name: childRoute ?? mainRoute,
                  },
                  true
                )
              }
              className={[errorMsg ? '!border-red' : '', 'w-full'].join(' ')}
              type="text"
              name="emailId"
              required
              ref={emailInputRef}
              onChange={(e) => getEmailId(e)}
              value={user?.emailId}
              onBlur={(e) => {
                formatInput(e);
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (emailPattern.test(e.target.value)) {
                  setErrorMsg('');
                } else {
                  setErrorMsg(
                    translate('console.screens.emailScreen.invalidEmailError2')
                  );
                }
              }}
            />
            <label className={errorMsg ? '!text-red' : ''}>
              {translate('console.screens.emailScreen.emailTextBox')}
            </label>
            {user?.emailId &&
              /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.emailId) &&
              !errorMsg && (
                <Image
                  src="https://spyne-static.s3.us-east-1.amazonaws.com/console/icons/create_enterprise_org_type/greentick.svg"
                  width={20}
                  height={20}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                />
              )}
            {errorMsg ? (
              <p className="text-red mb-2 mt-2 text-xs">{errorMsg}</p>
            ) : null}
          </div>
          {loginOrSignup == 'signup' && (
            <div
              className={[
                'input-login onboard-phone-input relative mb-8',
                formErrors?.owner_phone ? 'error-input' : '',
              ].join(' ')}
              onFocus={() => setPhoneFocused(true)}
              onBlur={() => setPhoneFocused(false)}
            >
              <PhoneInput
                inputClass={formErrors?.owner_phone ? '!border-red' : ''}
                name="owner_phone"
                required
                autoFocus={true}
                country={enterpriseDetails?.countryCode}
                enableSearch={true}
                value={enterpriseDetails?.owner_phone}
                onChange={handlePhoneNumberInput}
                dropdownStyle={{ width: '407px' }}
              />
              {formErrors?.owner_phone ? (
                <p className="mt-2 flex gap-1 rounded-lg bg-[#b45309]/5 px-2 py-1 pl-2 text-xs font-medium text-amber-700">
                  <Image
                    src={ENTERPRISE_DATA?.helptextredicon}
                    alt="helptexticon"
                    height={16}
                    width={16}
                    className=""
                  />
                  {formErrors?.owner_phone}
                </p>
              ) : (
                <p
                  className={`mt-2 flex gap-1 rounded-lg bg-[#EFF6FF] px-2 py-1 pl-2 text-xs font-medium text-blue-800`}
                >
                  <Image
                    src={ENTERPRISE_DATA?.helptexticon}
                    alt="helptexticon"
                    height={12}
                    width={12}
                    className=""
                  />
                  {translate(
                    'console.screens.enterprisesScreen.correctPhoneNumber'
                  )}
                </p>
              )}
            </div>
          )}
          <button
            className={[
              SignInSpinner ? '' : '',
              'secondary-btn !h-12 w-full !py-1.5',
            ].join(' ')}
            type="submit"
            disabled={SignInSpinner ? true : false}
            id="next"
            onClick={(e) => checkUserExists(e, googleResponse)}
          >
            {SignInSpinner ? (
              <Spinner
                type="LIGHT"
                style_CLASS={'justify-center items-center flex'}
              />
            ) : (
              translate(
                loginOrSignup === 'login'
                  ? 'console.screens.emailScreen.signupcontinue'
                  : 'console.screens.emailScreen.signupFree'
              )
            )}
          </button>

          <HideSpyneContent>
            <div className="mt-3">
              {loginOrSignup == 'login' ? (
                <GoogleSignInButton
                  handleCredentialResponse={handleCredentialResponse}
                  source={source}
                  handleGoogleResponse={handleGoogleResponse}
                  translate={translate}
                />
              ) : (
                <div
                  onClick={() => {
                    setShowEmailFields(
                      loginOrSignup === 'login' ? false : true
                    );
                    setLoginOrSignup('login');
                    setErrorMsg('');
                    setFormErrors({
                      ...formErrors,
                      owner_phone: '',
                    });
                  }}
                  className="w-full rounded-lg border border-black/10 bg-white px-[26px] py-3 text-center text-sm"
                >
                  {translate('console.screens.signInSignUpScreen.existingUser')}{' '}
                  {translate('console.screens.signInSignUpScreen.login')}
                </div>
              )}
            </div>
          </HideSpyneContent>
        </>
      ) : (
        ////////////////////////////////////////////////////////////////////////// entry page////////////////////////////////////////////////////////////
        <>
          <div className="flex flex-col gap-4">
            <HideSpyneContent>
              <GoogleSignInButton
                handleCredentialResponse={handleCredentialResponse}
                isLoading={SignInSpinner}
                handleGoogleResponse={handleGoogleResponse}
                translate={translate}
              />
              {errorMsg ? <p className="text-red text-xs">{errorMsg}</p> : null}
            </HideSpyneContent>

            {
              <button
                onClick={() => {
                  setShowEmailFields(true);
                  captureEvent(
                    'signup_method_selected',
                    {
                      method: 'email',
                      login_flow: 'console',
                      source: 'other',
                    },
                    false
                  );
                }}
                className={`transparent-btn !text-black-60 flex h-[52px] w-full items-center justify-center gap-3 !px-6 !py-3 !leading-5 ${SignInSpinner ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                disabled={SignInSpinner}
              >
                <Image
                  src={ENTER_EMAIL_DATA?.emailIcon || LOGIN_DATA?.emailIcon}
                  width={22}
                  height={22}
                  alt="email icon"
                  className=""
                />
                {translate('console.screens.signInSignUpScreen.emailLabel')}
              </button>
            }
          </div>
          <HideSpyneContent>
            <div className="mt-10 w-full items-center text-center">
              <div className="w-full px-8 text-center">
                <span class="font-['Inter'] text-xs font-normal leading-none text-black/40">
                  {translate(
                    `console.screens.passwordScreen.verifyingAgreeText`
                  )}
                </span>
                <Link
                  href={redirectLinks?.termsServiceUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <span class="cursor-pointer font-['Inter'] text-xs font-normal leading-none text-[#4600f2]/80">
                    {' '}
                    {translate(
                      `console.screens.passwordScreen.termsOfServiceText`
                    )}
                  </span>
                </Link>
                <span class="font-['Inter'] text-xs font-normal leading-none text-black/40">
                  ,{' '}
                </span>
                <Link
                  href={redirectLinks?.policyLinkurl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <span class="cursor-pointer font-['Inter'] text-xs font-normal leading-none text-[#4600f2]/80">
                    {translate(`console.screens.otpScreen.privacyPolicy`)}
                  </span>
                </Link>
                <span class="font-['Inter'] text-xs font-normal leading-none text-black/40">
                  {' '}
                  {translate(`console.screens.passwordScreen.andText`)}
                </span>
                <Link
                  href={redirectLinks?.cookieLikUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <span class="cursor-pointer font-['Inter'] text-xs font-normal leading-none text-[#4600f2]/80">
                    {' '}
                    {translate(`console.screens.passwordScreen.cookiePolicy`)}
                  </span>
                </Link>
                <span class="font-['Inter'] text-xs font-normal leading-none text-black/40">
                  .
                </span>
              </div>
            </div>
          </HideSpyneContent>
        </>
      )}
      <HideSpyneContent>
        {(loginOrSignup === 'login' || !showEmailFields) && (
          <div className="mt-10 text-center">
            <span class="font-['Inter'] text-sm font-normal leading-tight text-black/60">
              {loginOrSignup === 'login'
                ? translate('console.screens.signInSignUpVS.dontHaveAnAccount')
                : translate(
                    `console.screens.signInSignUpVS.haveAnAccount`
                  )}{' '}
            </span>
            <span
              onClick={() => {
                setLoginOrSignup(
                  loginOrSignup === 'login' ? 'signup' : 'login'
                );
                setShowEmailFields(loginOrSignup === 'login' ? false : true);
                setFormErrors({
                  ...formErrors,
                  owner_phone: '',
                });
                setErrorMsg('');
              }}
              class="cursor-pointer text-sm font-semibold leading-tight text-[#5925db]"
            >
              {loginOrSignup === 'login'
                ? translate('console.screens.signInSignUpVS.signUp')
                : translate('console.screens.signInSignUpScreen.login')}
            </span>
          </div>
        )}
      </HideSpyneContent>
    </form>
  );
}
export default EnterEmail;
