import React from 'react';
import { Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LiquidGlass } from '../../LiquidGlass';

interface SkipButtonProps {
  onPress: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  style?: ViewStyle;
  bgColor?: string;
}

export const SkipButton = ({ onPress, onPrevious, onNext, style, bgColor = '#1C1C1E' }: SkipButtonProps) => {
  return (
    <LiquidGlass
      variant="default"
      intensity={10}
      style={[
        {
          backgroundColor: bgColor,
          padding: 20,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
        },
        style,
      ]}
    >
      {(onPrevious || onNext) ? (
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity 
            onPress={onPrevious}
            style={{ padding: 8, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 8, width: 44, alignItems: 'center' }}
          >
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={onNext}
            style={{ padding: 8, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 8, width: 44, alignItems: 'center' }}
          >
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : (
        <View />
      )}

      <TouchableOpacity
        onPress={onPress}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
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
