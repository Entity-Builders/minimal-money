import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { styles } from '../../screens/OnboardingStyles';

interface StepInitialExpensesProps {
  initialExpenses: string;
  setInitialExpenses: (value: string) => void;
}

export const StepInitialExpenses = ({
  initialExpenses,
  setInitialExpenses,
}: StepInitialExpensesProps) => {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.question}>¿Ya hiciste gastos este mes?</Text>
      <Text style={styles.helper}>
        Si hoy ya es día 10, quizás ya gastaste algo. Lo restaremos del total
        disponible.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="$0"
        placeholderTextColor="#555"
        keyboardType="numeric"
        value={initialExpenses}
        onChangeText={setInitialExpenses}
      />
    </View>
  );
};
