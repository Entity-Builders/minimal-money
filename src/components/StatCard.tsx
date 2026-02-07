import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';

const GLOBAL_FONT_SIZE_LABEL = 10;

export interface StatCardProps {
  label: string;
  value: string;
  width: number;
  onPress?: () => void;
  valueColor?: string;
  labelColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  width,
  onPress,
  valueColor,
  labelColor,
}) => {
  const content = (
    <View
      style={{
        pointerEvents: 'none',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <Text
        style={[styles.value, valueColor ? { color: valueColor } : undefined]}
      >
        {value}
      </Text>
      <Text
        style={[styles.label, labelColor ? { color: labelColor } : undefined]}
      >
        {label}
      </Text>
    </View>
  );

  const containerStyle = [styles.container, { width }];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          containerStyle,
          { opacity: pressed ? 0.7 : 1 },
        ]}
        hitSlop={5}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={containerStyle}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: 4,
  },
  value: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  label: {
    color: '#444',
    fontSize: GLOBAL_FONT_SIZE_LABEL,
    letterSpacing: 1,
    marginTop: 4,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});
