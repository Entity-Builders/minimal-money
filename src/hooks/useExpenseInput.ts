import { useState, useEffect } from 'react';
import { Keyboard } from 'react-native';
import { useAutoFocusOnActive } from './useAutoFocusOnActive';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Currency } from '../types';

interface UseExpenseInputProps {
  addTransaction: (
    amount: number,
    currency: Currency,
    exchangeRate: number,
    timestamp?: number,
    name?: string,
  ) => Promise<void>;
  rates: Record<string, number>;
  getRate: (currency: string) => number;
}

const STORAGE_KEY_CURRENCY = 'minimal_money_last_currency';

export const useExpenseInput = ({
  addTransaction,
  rates,
  getRate,
}: UseExpenseInputProps) => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('ARS');

  // 2-step flow state
  const [step, setStep] = useState<'amount' | 'detail'>('amount');
  const [expenseDetail, setExpenseDetail] = useState('');
  const { shouldAutoFocus, setShouldAutoFocus } = useAutoFocusOnActive();

  // Load persisted currency on mount
  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY_CURRENCY);
        if (saved === 'ARS' || saved === 'USD' || saved === 'MXN') {
          setCurrency(saved as Currency);
        }
      } catch (e) {
        // ignore error
      }
    };
    loadCurrency();
  }, []);

  const handleCurrencyToggle = () => {
    setCurrency(prev => {
      let next: Currency = 'ARS';
      if (prev === 'ARS') next = 'USD';
      else if (prev === 'USD') next = 'MXN';
      else next = 'ARS';

      // Fire and forget save
      AsyncStorage.setItem(STORAGE_KEY_CURRENCY, next).catch(() => {});
      return next;
    });
  };

  const handleAmountChange = (text: string) => {
    setAmount(text);
  };

  const handleDetailChange = (text: string) => {
    setExpenseDetail(text);
  };

  const handleBackToAmount = () => {
    setStep('amount');
  };

  const handleExpenseSubmit = async () => {
    if (step === 'amount') {
      const val = parseFloat(amount);
      if (val > 0) {
        setStep('detail');
      }
    } else {
      // Final submit from detail step
      const val = parseFloat(amount);
      const finalName = expenseDetail.trim() || 'Gasto';

      if (val > 0) {
        const rateToUse = getRate(currency);
        await addTransaction(val, currency, rateToUse, undefined, finalName);

        // Reset inputs but KEEP currency and KEEP focus behavior if desired
        setAmount('');
        setExpenseDetail('');
        setStep('amount');
        setShouldAutoFocus(false);
        Keyboard.dismiss();
      }
    }
  };

  return {
    amount,
    currency,
    step,
    expenseDetail,
    shouldAutoFocus,
    handleAmountChange,
    handleCurrencyToggle,
    handleDetailChange,
    handleBackToAmount,
    handleExpenseSubmit,
  };
};
