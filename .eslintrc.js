module.exports = {
  extends: ['expo', 'prettier'],
  plugins: ['react-native'],
  rules: {
    // TypeScript-specific rules
    // Disable the base rule to prevent false positives and use the TS version
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

    // Prevent variable shadowing
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',

    // React / React Native best practices
    'react/react-in-jsx-scope': 'off', // Not required in React Native
    'react-native/no-inline-styles': 'warn', // Warn on inline styles to encourage stylesheet usage

    // General code quality
    'no-console': ['warn', { allow: ['warn', 'error'] }], // Allow console.warn and console.error
  },
};
