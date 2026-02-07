import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useBudget } from '../context/useBudget';
import { useExchangeRate } from '../hooks/useExchangeRate';
import { useExpenseInput } from './useExpenseInput';
import { useState } from 'react';

export const useMainScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    totalAvailable,
    addExpense,
    isRecoveryMode,
    totalDebt,
    dailyBudget,
    spentToday,
    daysToRecover,
    recoveryQuota,
    setConfig,
    config,
    remainingDays,
  } = useBudget();
  const { rates, loading: rateLoading, getRate, refresh } = useExchangeRate();
  const [scanModalVisible, setScanModalVisible] = useState(false);

  // Use the new hook for expense input logic
  const expenseInput = useExpenseInput({
    addExpense: async (amt, cur, rate, time, name) => {
      // Wrapper to match signature if needed, or check types.
      // useBudget addExpense signature: (amount: number, currency: Currency, exchangeRate: number, customTimestamp?: number, name?: string)
      await addExpense(amt, cur, rate, time, name);
    },
    rates,
    getRate,
  });

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const handleOpenScan = () => setScanModalVisible(true);
  const handleCloseScan = () => setScanModalVisible(false);

  const handleAddScannedExpenses = async (
    expenses: { amount: number; name: string }[],
  ) => {
    for (const exp of expenses) {
      // Scanned expenses are usually in local currency (ARS) for now.
      const rate = getRate('ARS');
      await addExpense(exp.amount, 'ARS', rate);
    }
  };

  return {
    totalAvailable,
    rates,
    getRate,
    refresh,
    // Destructure expense input props to pass them flatly as before, or pass the object.
    // To match MainScreen expectation, we pass them flatly.
    ...expenseInput,
    handleSettings,
    scanModalVisible,
    handleOpenScan,
    handleCloseScan,
    handleAddScannedExpenses,

    isRecoveryMode,
    totalDebt,
    dailyBudget,
    spentToday,
    daysToRecover,
    recoveryQuota,
    setConfig,
    config,
    remainingDays,
  };
};
