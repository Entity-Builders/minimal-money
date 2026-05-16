import React, { createContext, useContext } from 'react';

interface SplashContextValue {
  isSplashVisible: boolean;
}

export const SplashContext = createContext<SplashContextValue>({
  isSplashVisible: true, // safe default: assume splash is up
});

export const useSplashContext = () => useContext(SplashContext);
