import React from 'react';
import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { styles } from '../../screens/SettingsScreenStyles';

interface SavingsCardProps {
  savingsAmount: number;
  savingsPercent: number;
  setSavingsPercent: (value: number) => void;
}

export const SavingsCard = ({
  savingsAmount,
  savingsPercent,
  setSavingsPercent,
}: SavingsCardProps) => {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>META DE AHORRO</Text>

      {/* Savings Header Row: Amount Left, % Right */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <Text style={styles.totalValue}>
          $ {savingsAmount.toLocaleString()}
        </Text>
        <Text style={styles.totalValue}>{savingsPercent.toFixed(0)}%</Text>
      </View>

      <Slider
        style={{ width: '100%', height: 40 }}
        minimumValue={0}
        maximumValue={100}
        step={1}
        value={savingsPercent}
        onValueChange={setSavingsPercent}
        minimumTrackTintColor="#fff"
        maximumTrackTintColor="#333"
        thumbTintColor="#fff"
      />
    </View>
  );
};
