import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../../screens/OnboardingStyles';

interface StepPreviewProps {
  getMonthlyIncome: () => number;
  fixed: string;
  initialExpenses: string;
  savings: number;
}

export const StepPreview = ({
  getMonthlyIncome,
  fixed,
  initialExpenses,
  savings,
}: StepPreviewProps) => {
  const monthlyIncomeForPreview = getMonthlyIncome();
  const fix = parseFloat(fixed) || 0;
  const initial = parseFloat(initialExpenses) || 0;
  const disp = Math.max(0, monthlyIncomeForPreview - fix);
  const sav = disp * (savings / 100);

  // Approximate for preview
  const daysInMonth = 30;
  const dailyPool = Math.max(0, disp - sav - initial);
  const daily = Math.floor(dailyPool / daysInMonth);

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.question}>¡Listo!</Text>
      <Text style={styles.resultText}>Tu presupuesto diario estimado es:</Text>
      <Text style={styles.bigTotal}>${daily}</Text>
      <Text style={styles.helper}>
        Esto se recalculará según los días restantes.
      </Text>
    </View>
  );
};
