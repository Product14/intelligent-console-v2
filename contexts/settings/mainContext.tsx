'use client';

// Shim for converse-ai's mainContext — supplies productLineId etc. from the bridge.
import React, { createContext, useContext } from 'react';
import { getConsoleContext } from '@/lib/settings/bridge/context-store';

interface MainContextValue {
  productLineId: string | undefined;
  enterpriseId: string | undefined;
  teamId: string | undefined;
}

const MainContext = createContext<MainContextValue | null>(null);

export const MainContextProvider = ({ children }: { children: React.ReactNode }) => {
  const ctx = getConsoleContext();
  return (
    <MainContext.Provider
      value={{
        productLineId: ctx?.productLineId,
        enterpriseId: ctx?.enterpriseId,
        teamId: ctx?.teamId,
      }}
    >
      {children}
    </MainContext.Provider>
  );
};

export const useMainContext = (): MainContextValue => {
  const fromCtx = useContext(MainContext);
  if (fromCtx) return fromCtx;
  const ctx = getConsoleContext();
  return {
    productLineId: ctx?.productLineId,
    enterpriseId: ctx?.enterpriseId,
    teamId: ctx?.teamId,
  };
};
