import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ContinueButtonProps {
  onPress: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  bgColor?: string;
}

export const ContinueButton = ({ onPress, onPrevious, onNext, bgColor = '#1C1C1E' }: ContinueButtonProps) => {
  return (
    <View
      style={{
        backgroundColor: bgColor,
        paddingHorizontal: 16,
        paddingVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
      }}
    >
      { (onPrevious || onNext) ? (
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
          paddingHorizontal: 24,
          paddingVertical: 10,
          borderRadius: 22,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 0.3 }}>
          OK ✓
        </Text>
      </TouchableOpacity>
    </View>
  );
};
