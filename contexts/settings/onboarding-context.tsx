'use client';

// Shim for converse-ai's onboarding-context. Tracks the active step + audio
// playback, and exposes goNext/goPrev the navigation shim calls.
import React, { createContext, useContext, useState } from 'react';

interface OnboardingContextValue {
  activeStep: string | null;
  setActiveStep: (step: string) => void;
  playingAudioId: string | null;
  setPlayingAudioId: (id: string | null) => void;
  goNext?: () => void;
  goPrev?: () => void;
}

const OnboardingCtx = createContext<OnboardingContextValue | null>(null);

export const OnboardingProvider = ({
  children,
  goNext,
  goPrev,
}: {
  children: React.ReactNode;
  goNext?: () => void;
  goPrev?: () => void;
}) => {
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  return (
    <OnboardingCtx.Provider
      value={{ activeStep, setActiveStep, playingAudioId, setPlayingAudioId, goNext, goPrev }}
    >
      {children}
    </OnboardingCtx.Provider>
  );
};

export const useOnboardingContext = (): OnboardingContextValue => {
  const ctx = useContext(OnboardingCtx);
  if (ctx) return ctx;
  return {
    activeStep: null,
    setActiveStep: () => {},
    playingAudioId: null,
    setPlayingAudioId: () => {},
    goNext: () => {},
    goPrev: () => {},
  };
};
