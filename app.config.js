const { createAppConfig } = require('@eb-packages/expo-config');

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

  icon: './assets/icon.png',
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
