'use client';

import { useEffect } from 'react';

import Button from '@spyne-console/design-system/button';

const isProduction = process.env.NODE_ENV === 'production';

const ErrorComponent = ({
  error,
  reset,
  title = 'Something went wrong!',
  buttonText = 'Try again',
}) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 px-6 py-12">
      <div className="mx-auto w-full max-w-4xl text-center sm:text-left">
        <h2 className="text-typography-900 mb-6 text-2xl font-semibold leading-tight sm:text-3xl">
          {title}
        </h2>

        {!isProduction && error && (
          <div className="mb-8 max-h-[50vh] w-full overflow-auto rounded-xl border border-red-500 bg-red-100 p-4 text-sm text-red-900 shadow-lg sm:p-6 sm:text-base">
            <p className="font-semibold">Error details:</p>
            <p className="mt-2">{error.message}</p>
            {error.stack && (
              <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-lg bg-red-200 p-3 text-xs text-red-700">
                {error.stack}
              </pre>
            )}
          </div>
        )}

        <Button
          onClick={() => reset()}
          label={buttonText}
          className="bg-blue-light hover:bg-blue-dark mt-6 w-full rounded-lg py-3 text-white transition-all sm:w-auto"
        />
      </div>
    </div>
  );
};

export default ErrorComponent;
