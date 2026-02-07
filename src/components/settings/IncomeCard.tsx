import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { styles } from '../../screens/SettingsScreenStyles';

interface IncomeCardProps {
  income: string;
  setIncome: (value: string) => void;
}

export const IncomeCard = ({ income, setIncome }: IncomeCardProps) => {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>INGRESO MENSUAL TOTAL</Text>
      <View style={styles.inputRow}>
        <Text style={styles.currencyPrefix}>$</Text>
        <TextInput
          style={styles.bigInput}
          value={income}
          onChangeText={setIncome}
          keyboardType="numeric"
          placeholder="2500"
          placeholderTextColor="#555"
        />
      </View>
    </View>
  );
};
