import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { BlurView, BlurTint } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MinimalTheme } from '../theme';

interface LiquidGlassProps extends ViewProps {
  children?: React.ReactNode;
  intensity?: number;
  tint?: BlurTint;
  cornerRadius?: number;
  variant?: 'sheet' | 'modal' | 'default';
}

export const LiquidGlass: React.FC<LiquidGlassProps> = ({
  style,
  children,
  intensity = MinimalTheme.glass.intensity,
  tint = MinimalTheme.glass.tint as BlurTint,
  cornerRadius = MinimalTheme.roundness,
  variant = 'default',
  ...props
}) => {
  const getBorderRadius = () => {
    switch (variant) {
      case 'sheet':
        return {
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        };
      case 'modal':
        return {
          borderRadius: 20, // Matching RecoveryModal
        };
      default:
        return {
          borderRadius: cornerRadius,
        };
    }
  };

  const borderRadiusStyle = getBorderRadius();

  return (
    <View style={[styles.container, borderRadiusStyle, style]} {...props}>
      <BlurView
        intensity={intensity}
        tint={tint}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[
          MinimalTheme.glass.gradient.start,
          MinimalTheme.glass.gradient.end,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.3 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Subtle border */}
      <View
        style={[
          StyleSheet.absoluteFill,
          borderRadiusStyle,
          {
            borderWidth: 1,
            borderColor: MinimalTheme.glass.border,
            // Ensure border doesn't overflow if using different radii
            overflow: 'hidden',
          },
        ]}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: MinimalTheme.glass.background,
    overflow: 'hidden',
  },
});
