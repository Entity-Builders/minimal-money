import React from 'react';
import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { styles } from '../../screens/OnboardingStyles';

interface StepSavingsProps {
  savings: number;
  setSavings: (value: number) => void;
  getMonthlyIncome: () => number;
  fixed: string;
  initialExpenses: string;
}

export const StepSavings = ({
  savings,
  setSavings,
  getMonthlyIncome,
  fixed,
  initialExpenses,
}: StepSavingsProps) => {
  const monthlyIncomeForSavings = getMonthlyIncome();
  const fixedExpenses = parseFloat(fixed) || 0;
  const initialExpensesForSavings = parseFloat(initialExpenses) || 0;

  // Calculate disposable base considering initial expenses
  // This gives the user a better idea of their REAL remaining capacity for the current month
  const disposableBase = Math.max(
    0,
    monthlyIncomeForSavings - fixedExpenses - initialExpensesForSavings,
  );
  const savingsAmount = (disposableBase * (savings / 100)).toFixed(0);

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.question}>¿Cuánto quieres ahorrar?</Text>
      <Text style={styles.percentage}>{savings.toFixed(0)}%</Text>
      <Text style={styles.helper}>
        Del sobrante (${disposableBase}), guardarás ${savingsAmount}/mes
      </Text>

      <Slider
        style={{ width: '100%', height: 60 }}
        minimumValue={0}
        maximumValue={100}
        step={1}
        value={savings}
        onValueChange={setSavings}
        minimumTrackTintColor="#fff"
        maximumTrackTintColor="#333"
        thumbTintColor="#fff"
      />
    </View>
  );
};
