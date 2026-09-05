const { createAppConfig } = require('@entity-builders/expo-config');

const isDev = process.env.EXPO_PUBLIC_APP_ENV === 'development';

module.exports = createAppConfig({
  name: 'minimal-money',
  slug: 'minimal-money',
  version: '1.0.0',
  projectId: '2bbc4d0b-17d9-4396-a386-70f758a3ffcf',

  // Legacy bundle IDs — kept to avoid App Store Connect mismatch
  bundleIdentifier: {
    ios: 'com.juanobrach.minimalmoney',
    android: 'com.juanobrach.minimalmoney',
  },

  icon: isDev ? './assets/icon-dev.png' : './assets/icon.png',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
  },

  ios: {
    infoPlist: {
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
      },
    },
  },

  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
  },

  web: {
    favicon: './assets/favicon.png',
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

  extra: {
    ...process.env,
  },
});
