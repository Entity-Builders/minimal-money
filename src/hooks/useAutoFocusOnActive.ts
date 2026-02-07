import { useState, useEffect } from 'react';
import { AppState } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

/**
 * A hook that triggers a boolean flag when the app comes to the foreground
 * AND the screen is currently focused.
 */
export const useAutoFocusOnActive = () => {
  const [shouldAutoFocus, setShouldAutoFocus] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active' && isFocused) {
        setShouldAutoFocus(true);
      } else {
        setShouldAutoFocus(false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isFocused]);

  return { shouldAutoFocus, setShouldAutoFocus };
};
