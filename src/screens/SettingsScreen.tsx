import React from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsScreen } from '../hooks/useSettingsScreen';
import { styles } from './SettingsScreenStyles';
import { SettingsHeader } from '../components/settings/SettingsHeader';
import { IncomeCard } from '../components/settings/IncomeCard';
import { FixedExpensesCard } from '../components/settings/FixedExpensesCard';
import { SavingsCard } from '../components/settings/SavingsCard';
import { ActionButtons } from '../components/settings/ActionButtons';
import { QuickAddModal } from '../components/settings/QuickAddModal';
import { ScanExpenseModal } from '../components/scan/ScanExpenseModal';
import { MonthlySummaryCard } from '../components/settings/MonthlySummaryCard';

export default function SettingsScreen() {
  const {
    income,
    setIncome,
    expensesList,
    savingsPercent,
    setSavingsPercent,
    accordionOpen,
    toggleAccordion,
    arrowRotation,
    newExpenseName,
    setNewExpenseName,
    newExpenseAmount,
    setNewExpenseAmount,
    isAddingExpense,
    setIsAddingExpense,
    handleAddExpense,
    removeExpense,
    handleSave,
    handleReset,
    incomeNum,
    totalFixedExpenses,
    savingsAmount,
    monthlyVariableBudget,
    spentCurrentMonth,
    dailySpendingPool,
    calculatedDaily,
    accumulatedSavings,
    isQuickAddOpen,
    setIsQuickAddOpen,
    handleAddMultipleExpenses,
    isScanModalOpen,
    setIsScanModalOpen,
    handleAddScannedFixedExpenses,
    hasChanges,
    handleLogout,
    plannedDailyBudget,
  } = useSettingsScreen();

  return (
    <SafeAreaView style={styles.container}>
      <SettingsHeader />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <IncomeCard income={income} setIncome={setIncome} />

          <FixedExpensesCard
            totalFixedExpenses={totalFixedExpenses}
            toggleAccordion={toggleAccordion}
            accordionOpen={accordionOpen}
            arrowRotation={arrowRotation}
            expensesList={expensesList}
            removeExpense={removeExpense}
            isAddingExpense={isAddingExpense}
            newExpenseName={newExpenseName}
            setNewExpenseName={setNewExpenseName}
            newExpenseAmount={newExpenseAmount}
            setNewExpenseAmount={setNewExpenseAmount}
            handleAddExpense={handleAddExpense}
            setIsAddingExpense={setIsAddingExpense}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            onOpenScan={() => setIsScanModalOpen(true)}
          />

          <SavingsCard
            savingsAmount={savingsAmount}
            savingsPercent={savingsPercent}
            setSavingsPercent={setSavingsPercent}
          />

          <MonthlySummaryCard
            incomeNum={incomeNum}
            totalFixedExpenses={totalFixedExpenses}
            savingsPercent={savingsPercent}
            savingsAmount={savingsAmount}
            monthlyVariableBudget={monthlyVariableBudget}
            spentCurrentMonth={spentCurrentMonth}
            dailySpendingPool={dailySpendingPool}
            calculatedDaily={calculatedDaily}
            accumulatedSavings={accumulatedSavings}
            hasIncome={!!income}
            plannedDailyBudget={plannedDailyBudget}
          />

          <ActionButtons
            handleSave={handleSave}
            handleReset={handleReset}
            hasChanges={hasChanges}
          />

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </ScrollView>

      <QuickAddModal
        visible={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAddExpenses={handleAddMultipleExpenses}
      />
      <ScanExpenseModal
        visible={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onAddExpenses={handleAddScannedFixedExpenses}
      />
    </SafeAreaView>
  );
}
