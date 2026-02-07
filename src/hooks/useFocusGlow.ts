import { useCallback } from 'react';
import {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';

export interface UseFocusGlowProps {
  activeColor?: string;
  inactiveColor?: string;
  duration?: number;
}

export const useFocusGlow = ({
  activeColor = '#FFFFFF',
  inactiveColor = '#333333',
  duration = 200,
}: UseFocusGlowProps = {}) => {
  const focusProgress = useSharedValue(0);

  const onFocus = useCallback(() => {
    focusProgress.value = withTiming(1, { duration });
  }, [duration, focusProgress]);

  const onBlur = useCallback(() => {
    focusProgress.value = withTiming(0, { duration });
  }, [duration, focusProgress]);

  const animatedInputProps = useAnimatedProps(() => {
    return {
      placeholderTextColor: interpolateColor(
        focusProgress.value,
        [0, 1],
        [inactiveColor, activeColor],
      ),
    };
  });

  return {
    focusProgress,
    onFocus,
    onBlur,
    animatedInputProps,
  };
};
