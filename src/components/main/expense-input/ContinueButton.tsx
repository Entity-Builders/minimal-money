import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ContinueButtonProps {
  onPress: () => void;
}

export const ContinueButton = ({ onPress }: ContinueButtonProps) => {
  return (
    <View
      style={{
        backgroundColor: '#1C1C1E',
        paddingHorizontal: 16,
        paddingVertical: 10,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#2C2C2E',
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        style={{
          backgroundColor: '#30D158',
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
