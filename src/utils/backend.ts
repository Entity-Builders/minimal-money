import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const getBackendUrl = () => {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL || 'http://localhost:54321';

  console.log('🔗 Backend URL:', url);
  return url;
};
