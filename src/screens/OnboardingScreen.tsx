import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../hooks/useOnboarding';
import { styles } from './OnboardingStyles';
import { StepIncome } from '../components/onboarding/StepIncome';
import { StepFixed } from '../components/onboarding/StepFixed';
import { StepInitialExpenses } from '../components/onboarding/StepInitialExpenses';
import { StepSavings } from '../components/onboarding/StepSavings';
import { StepPreview } from '../components/onboarding/StepPreview';

export default function OnboardingScreen() {
  const {
    step,
    setStep,
    income,
    setIncome,
    incomeType,
    setIncomeType,
    fixed,
    setFixed,
    savings,
    setSavings,
    initialExpenses,
    setInitialExpenses,
    workingDays,
    workingHours,
    currentMonth,
    getMonthlyIncome,
    handleNext,
    handleBack,
  } = useOnboarding();

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <StepIncome
            income={income}
            setIncome={setIncome}
            incomeType={incomeType}
            setIncomeType={setIncomeType}
            getMonthlyIncome={getMonthlyIncome}
            currentMonth={currentMonth}
            workingDays={workingDays}
            workingHours={workingHours}
          />
        );
      case 1:
        return <StepFixed fixed={fixed} setFixed={setFixed} />;
      case 2:
        return (
          <StepInitialExpenses
            initialExpenses={initialExpenses}
            setInitialExpenses={setInitialExpenses}
          />
        );
      case 3:
        return (
          <StepSavings
            savings={savings}
            setSavings={setSavings}
            getMonthlyIncome={getMonthlyIncome}
            fixed={fixed}
            initialExpenses={initialExpenses}
          />
        );
      case 4:
        return (
          <StepPreview
            getMonthlyIncome={getMonthlyIncome}
            fixed={fixed}
            initialExpenses={initialExpenses}
            savings={savings}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${((step + 1) / 5) * 100}%` },
              ]}
            />
          </View>

          {renderStep()}

          <View style={styles.buttonRow}>
            {step > 0 ? (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>Atrás</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.buttonPlaceholder} />
            )}

            <TouchableOpacity style={styles.button} onPress={handleNext}>
              <Text style={styles.buttonText}>
                {step === 4 ? 'Empezar' : 'Siguiente'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
