import React from 'react';
import { Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LiquidGlass } from '../../LiquidGlass';

interface SkipButtonProps {
  onPress: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  style?: ViewStyle;
}

export const SkipButton = ({ onPress, onPrevious, onNext, style }: SkipButtonProps) => {
  return (
    <LiquidGlass
      variant="default"
      intensity={10}
      style={[
        {
          padding: 20,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        style,
      ]}
    >
      {(onPrevious || onNext) ? (
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity 
            onPress={onPrevious}
            style={{ padding: 8, backgroundColor: '#2C2C2E', borderRadius: 8, width: 44, alignItems: 'center' }}
          >
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={onNext}
            style={{ padding: 8, backgroundColor: '#2C2C2E', borderRadius: 8, width: 44, alignItems: 'center' }}
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
