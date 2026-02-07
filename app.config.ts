import 'dotenv/config';
import { ExpoConfig, ConfigContext } from 'expo/config';

// Load the correct .env file based on APP_ENV
if (process.env.APP_ENV) {
  require('dotenv').config({
    path: `.env.${process.env.APP_ENV}`,
  });
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const appEnv = process.env.APP_ENV || 'development';
  const baseIdentifier = 'com.juanobrach.minimalmoney';
  const getIdentifier = () => {
    if (process.env.USE_BASE_BUNDLE_ID === 'true') return baseIdentifier;
    if (appEnv === 'production') return baseIdentifier;
    return `${baseIdentifier}.${appEnv}`;
  };

  const identifier = getIdentifier();

  return {
    ...config,
    name:
      appEnv === 'production' ? 'minimal-money' : `minimal-money (${appEnv})`,
    slug: 'minimal-money',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
    },
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true,
        },
        ITSAppUsesNonExemptEncryption: false,
      },
      bundleIdentifier: identifier,
    },
    android: {
      package: identifier,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      eas: {
        projectId: '2bbc4d0b-17d9-4396-a386-70f758a3ffcf',
      },
      ...process.env,
    },
    updates: {
      url: 'https://u.expo.dev/2bbc4d0b-17d9-4396-a386-70f758a3ffcf',
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    plugins: [
      [
        '@sentry/react-native/expo',
        {
          url: 'https://sentry.io/',
          organization: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
        },
      ],
      'expo-asset',
    ],
  };
};
