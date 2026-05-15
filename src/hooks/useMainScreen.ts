import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useBudget } from '../context/useBudget';
import { useExchangeRate } from '../hooks/useExchangeRate';
import { useExpenseInput } from './useExpenseInput';
import { useState } from 'react';

export const useMainScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { batches, activeBatchId, setActiveBatch, addTransaction } = useBudget();
  const { rates, loading: rateLoading, getRate, refresh } = useExchangeRate();

  // Use the new hook for expense input logic
  const expenseInput = useExpenseInput({
    addTransaction: async (amt, cur, rate, time, name) => {
      if (activeBatchId) {
        await addTransaction(activeBatchId, amt, cur, rate, name, time);
      }
    },
    rates,
    getRate,
  });

  const handleSettings = () => {
    navigation.navigate('Settings');
  };


  return {
    batches,
    activeBatchId,
    setActiveBatchId: setActiveBatch,
    rates,
    getRate,
    refresh,
    ...expenseInput,
    handleSettings,

  };
};
