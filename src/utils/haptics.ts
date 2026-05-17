import * as Haptics from 'expo-haptics';

/**
 * Safe wrapper for expo-haptics.
 * Prevents unhandled promise rejections during OTA updates 
 * if the native module hasn't been built into the binary yet.
 */
export const safeHaptics = {
  impactAsync: async (style?: Haptics.ImpactFeedbackStyle) => {
    try {
      await Haptics.impactAsync(style);
    } catch (error) {
      console.log('Haptics not available (likely missing native module in OTA)', error);
    }
  },
  notificationAsync: async (type?: Haptics.NotificationFeedbackType) => {
    try {
      await Haptics.notificationAsync(type);
    } catch (error) {
      console.log('Haptics not available (likely missing native module in OTA)', error);
    }
  },
  selectionAsync: async () => {
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      console.log('Haptics not available (likely missing native module in OTA)', error);
    }
  },
  ImpactFeedbackStyle: Haptics.ImpactFeedbackStyle,
  NotificationFeedbackType: Haptics.NotificationFeedbackType
};
