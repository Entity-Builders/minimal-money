import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useSplashContext } from '../context/SplashContext';

/**
 * Triggers `shouldAutoFocus = true` ONLY when:
 *   1. The app transitions from background → foreground (active)
 *   2. The current screen is focused
 *   3. The splash screen has already been dismissed
 *
 * It does NOT auto-focus on initial mount or while the splash is visible.
 */
export const useAutoFocusOnActive = () => {
  const [shouldAutoFocus, setShouldAutoFocus] = useState(false);
  const isFocused = useIsFocused();
  const { isSplashVisible } = useSplashContext();

  // Track the previous AppState so we only react to background → foreground
  const prevAppState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      const wasBackground =
        prevAppState.current === 'background' ||
        prevAppState.current === 'inactive';
      const isNowActive = nextAppState === 'active';

      if (wasBackground && isNowActive && isFocused && !isSplashVisible) {
        setShouldAutoFocus(true);
      } else {
        setShouldAutoFocus(false);
      }

      prevAppState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isFocused, isSplashVisible]);

  return { shouldAutoFocus, setShouldAutoFocus };
};
