'use client';

import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

import Image from 'next/image';

function GoogleButton({
  handleCredentialResponse,
  isLoading,
  translate,
  onError,
}) {
  const login = useGoogleLogin({
    ux_mode: 'redirect',
    useOneTap: true,
    onSuccess: (response) => {
      const mockResponse = {
        credential: response.access_token,
        clientId: process.env.APP_KEY_GOOGLE_CLIENT_ID,
        select_by: 'btn',
      };
      handleCredentialResponse(mockResponse);
    },
    onError: (err) => onError(err),
    prompt_parent_id: 'google-login-button',
  });

  return (
    <div id="google-login-button">
      <button
        type="button"
        disabled={isLoading}
        onClick={() => login()}
        className={`transparent-btn !text-black-60 flex h-[52px] w-full items-center justify-center gap-3 !px-6 !py-3 !leading-5 ${isLoading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      >
        <Image
          src="https://spyne-static.s3.amazonaws.com/console/icons/googleIcon.svg"
          width={22}
          height={22}
          alt="google icon"
          className="!pb-[0.8px]"
        />
        <p className="text-black-60 text-sm font-semibold">
          {translate('console.screens.signInSignUpScreen.googleLoginBtn')}
        </p>
      </button>
    </div>
  );
}

export default function GoogleSignInButtonWrapper(props) {
  return (
    <GoogleOAuthProvider clientId={process.env.APP_KEY_GOOGLE_CLIENT_ID}>
      <GoogleButton {...props} />
    </GoogleOAuthProvider>
  );
}
