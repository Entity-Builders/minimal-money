import React from 'react';
import { Text, TouchableOpacity, ViewStyle } from 'react-native';
import { LiquidGlass } from '../../LiquidGlass';

interface SkipButtonProps {
  onPress: () => void;
  style?: ViewStyle;
}

export const SkipButton = ({ onPress, style }: SkipButtonProps) => {
  return (
    <LiquidGlass
      variant="default"
      intensity={10}
      style={[
        {
          padding: 20,
          alignItems: 'flex-end',
        },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        style={{
          backgroundColor: '#000',
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
          Saltear
        </Text>
      </TouchableOpacity>
    </LiquidGlass>
  );
};
