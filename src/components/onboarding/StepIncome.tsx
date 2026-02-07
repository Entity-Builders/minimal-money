import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { styles } from '../../screens/OnboardingStyles';

interface StepIncomeProps {
  income: string;
  setIncome: (value: string) => void;
  incomeType: 'monthly' | 'hourly';
  setIncomeType: (type: 'monthly' | 'hourly') => void;
  getMonthlyIncome: () => number;
  currentMonth: string;
  workingDays: number;
  workingHours: number;
}

export const StepIncome = ({
  income,
  setIncome,
  incomeType,
  setIncomeType,
  getMonthlyIncome,
  currentMonth,
  workingDays,
  workingHours,
}: StepIncomeProps) => {
  return (
    <View style={styles.stepContainer}>
      {/* Income Type Switcher */}
      <View style={styles.switcherContainer}>
        <TouchableOpacity
          style={[
            styles.switcherOption,
            incomeType === 'monthly' && styles.switcherOptionActive,
          ]}
          onPress={() => setIncomeType('monthly')}
        >
          <Text
            style={[
              styles.switcherText,
              incomeType === 'monthly' && styles.switcherTextActive,
            ]}
          >
            Mensual
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.switcherOption,
            incomeType === 'hourly' && styles.switcherOptionActive,
          ]}
          onPress={() => setIncomeType('hourly')}
        >
          <Text
            style={[
              styles.switcherText,
              incomeType === 'hourly' && styles.switcherTextActive,
            ]}
          >
            Por hora
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.question}>
        {incomeType === 'monthly'
          ? '¿Cuál es tu ingreso mensual?'
          : '¿Cuánto ganas por hora?'}
      </Text>
      <TextInput
        style={styles.input}
        placeholder="$0"
        placeholderTextColor="#555"
        keyboardType="numeric"
        value={income}
        onChangeText={setIncome}
      />
      {incomeType === 'hourly' && income && (
        <View>
          <Text style={styles.helperSmall}>
            ≈ ${getMonthlyIncome().toLocaleString()} en {currentMonth}
          </Text>
          <Text style={styles.helperTiny}>
            ({workingDays} días laborables × 8h = {workingHours}h)
          </Text>
        </View>
      )}
    </View>
  );
};
