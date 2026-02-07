import React, { useState, useEffect } from 'react';
import { LayoutAnimation, Alert, Platform, UIManager } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useBudget } from '../context/useBudget';
import { calculateBudgetState } from '../domain/budget-engine';
import { RootStackParamList, FixedExpense } from '../types';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export const useSettingsScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    config,
    setConfig,
    calculateBudgetProjection,
    spentCurrentMonth,
    resetData,
    fixedExpensesList,
    addFixedExpense,
    removeFixedExpense,
    accumulatedSavings,
  } = useBudget();

  // State
  const [income, setIncome] = useState('');
  const [savingsPercent, setSavingsPercent] = useState(0);

  // Accordion State
  const [accordionOpen, setAccordionOpen] = useState(false);

  // New Expense Input State
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [isAddingExpense, setIsAddingExpense] = useState(false);

  // Load existing config
  useEffect(() => {
    if (config) {
      setIncome(config.income.toString());
      setSavingsPercent(config.savingsPercentage);
    }
  }, [config]);

  // Derived Totals with Memoization
  const totalFixedExpenses = React.useMemo(
    () => fixedExpensesList.reduce((sum, item) => sum + item.amount, 0),
    [fixedExpensesList],
  );

  const incomeNum = React.useMemo(
    () => parseFloat(income.replace(/,/g, '')) || 0,
    [income],
  );

  // Use centralized engine for consistency
  const {
    disposableIncome,
    savingsAmount,
    monthlyVariableBudget,
    calculatedDaily,
    dailySpendingPool,
  } = React.useMemo(() => {
    // Create a temporary config object
    const tempConfig = {
      income: incomeNum,
      fixedExpenses: totalFixedExpenses,
      savingsPercentage: savingsPercent,
    };

    // Calculate state based on this config, assuming no expenses (Pre-flight)
    // We use 'new Date()' but the engine's 'plan' section is robust.
    // Actually, to be safe and match 'calculatePreFlightMetrics' logic of "entire month view",
    // we can look at 'plan.plannedDailyBudget' from the engine.

    // We pass empty expenses array to simulate "Plan" view
    const state = calculateBudgetState(tempConfig, [], new Date());

    return {
      disposableIncome: Math.max(0, incomeNum - totalFixedExpenses),
      savingsAmount: Math.max(
        0,
        (incomeNum - totalFixedExpenses) * (savingsPercent / 100),
      ),
      monthlyVariableBudget: state.plan.monthlyVariableBudget,
      calculatedDaily: state.plan.plannedDailyBudget,
      dailySpendingPool: Math.max(
        0,
        state.plan.monthlyVariableBudget - spentCurrentMonth,
      ),
    };
  }, [incomeNum, totalFixedExpenses, savingsPercent, spentCurrentMonth]);

  const toggleAccordion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAccordionOpen(!accordionOpen);
  };

  const arrowRotation = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: withTiming(accordionOpen ? '180deg' : '0deg') }],
    };
  });

  const handleAddExpense = async () => {
    if (!newExpenseName || !newExpenseAmount) return;

    // Sanitize input
    const cleanAmount = newExpenseAmount.replace(/,/g, '.');
    const amount = parseFloat(cleanAmount);

    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Monto inválido');
      return;
    }

    try {
      await addFixedExpense(newExpenseName, amount);
      setNewExpenseName('');
      setNewExpenseAmount('');
      setIsAddingExpense(false);
    } catch (e) {
      Alert.alert('Error', 'No se pudo agregar el gasto');
    }
  };

  const removeExpense = (id: string) => {
    removeFixedExpense(id);
  };

  const handleSave = async () => {
    if (incomeNum < 0) {
      Alert.alert('Error', 'Ingreso inválido');
      return;
    }

    await setConfig({
      income: incomeNum,
      fixedExpenses: totalFixedExpenses,
      // fixedExpensesDetails: expensesList, // No longer stored in profile
      savingsPercentage: savingsPercent,
    });

    navigation.goBack();
  };

  const handleReset = async () => {
    navigation.popToTop();
  };

  const handleLogout = async () => {
    try {
      await resetData();
      // Navigation is likely handled by Auth state change, but keeping this for safety
      navigation.navigate('Auth');
    } catch (error: any) {
      Alert.alert('Error al cerrar sesión', error.message);
    }
  };

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  const handleAddMultipleExpenses = async (
    expenses: { name: string; amount: number }[],
  ) => {
    // Add sequentially to ensure order or just allow parallel
    // For simplicity, parallel
    await Promise.all(expenses.map(e => addFixedExpense(e.name, e.amount)));
  };

  const hasChanges = React.useMemo(() => {
    if (!config) return false;

    // Check Income
    const currentIncome = parseFloat(income.replace(/,/g, '')) || 0;
    if (currentIncome !== config.income) return true;

    // Check Savings
    if (savingsPercent !== config.savingsPercentage) return true;

    // Check Savings
    if (savingsPercent !== config.savingsPercentage) return true;

    // Fixed Expenses are now live, checks removed.

    return false;
  }, [income, savingsPercent, config]);

  return {
    income,
    setIncome,
    expensesList: fixedExpensesList,
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
    handleLogout,
    navigation, // Exposed for header back button
    // Totals
    incomeNum,
    totalFixedExpenses,
    savingsAmount,
    monthlyVariableBudget,
    spentCurrentMonth,
    dailySpendingPool,
    calculatedDaily,
    plannedDailyBudget: calculatedDaily,
    accumulatedSavings,
    // Quick Add
    isQuickAddOpen,
    setIsQuickAddOpen,
    handleAddMultipleExpenses,
    // Scan Modal
    isScanModalOpen,
    setIsScanModalOpen: (v: boolean) => setIsScanModalOpen(v),
    handleAddScannedFixedExpenses: (
      expenses: { name: string; amount: number }[],
    ) => {
      // Re-use logic for adding multiple expenses
      handleAddMultipleExpenses(expenses);
    },
    hasChanges,
  };
};
