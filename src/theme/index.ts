import { MD3DarkTheme, configureFonts } from 'react-native-paper';

// Define the base font config (can be customized with specific fonts later)
const fontConfig = {
  fontFamily: 'System',
};

export const MinimalTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    // Core background colors
    background: '#000000', // True black background
    surface: '#1A1A1A', // Dark grey for cards/bottom sheets
    surfaceVariant: '#2C2C2C', // Slightly lighter for inputs/secondary

    // Primary actions
    primary: '#FFFFFF',
    onPrimary: '#000000',
    primaryContainer: '#333333',
    onPrimaryContainer: '#FFFFFF',

    // Text colors
    onSurface: '#FFFFFF',
    onSurfaceVariant: '#888888', // Secondary text

    // Functional colors
    error: '#ff3b30',
    onError: '#FFFFFF',

    // Borders
    outline: '#333333',
    outlineVariant: '#444444',
  },
  // We can refine roundness globally here
  roundness: 12,
  // Custom glass tokens
  glass: {
    background: 'rgba(255, 255, 255, 0.0)',
    border: 'rgba(255, 255, 255, 0.1)',
    gradient: {
      start: 'rgba(255, 255, 255, 0.08)',
      end: 'rgba(255, 255, 255, 0.0)',
    },
    tint: 'systemMaterialDark', // Type assertion removed to avoid circular dep or type issues if not imported.
    // Ideally we import BlurTint but for theme object we can keep it as string literals or type it later.
    // 'systemMaterialDark' is valid for BlurTint.
    intensity: 90,
  },
};
