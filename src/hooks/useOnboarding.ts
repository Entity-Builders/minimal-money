import { useState, useMemo } from 'react';
import { useBudget } from '../context/useBudget';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isWeekend,
  format,
} from 'date-fns';
import { es } from 'date-fns/locale';

// Calculate working days (Mon-Fri) in the current month
const getWorkingDaysInMonth = (date: Date = new Date()): number => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const allDays = eachDayOfInterval({ start, end });

  return allDays.filter(day => !isWeekend(day)).length;
};

// Get current month name in Spanish
const getCurrentMonthName = (): string => {
  return format(new Date(), 'MMMM', { locale: es });
};

export const useOnboarding = () => {
  const { setConfig } = useBudget();
  const [step, setStep] = useState(0);

  const [income, setIncome] = useState('');
  const [incomeType, setIncomeType] = useState<'monthly' | 'hourly'>('hourly');
  const [fixed, setFixed] = useState('');
  const [savings, setSavings] = useState(10); // Default 10%
  const [initialExpenses, setInitialExpenses] = useState('');

  // Memoize working days calculation
  const workingDays = useMemo(() => getWorkingDaysInMonth(), []);
  const workingHours = workingDays * 8; // 8 hours per working day
  const currentMonth = useMemo(() => getCurrentMonthName(), []);

  // Convert hourly to monthly based on actual working days this month
  const getMonthlyIncome = () => {
    const incomeNum = parseFloat(income) || 0;
    const monthly =
      incomeType === 'hourly' ? incomeNum * workingHours : incomeNum;
    return monthly;
  };

  const finishOnboarding = async () => {
    const monthlyIncome = getMonthlyIncome();
    const fixedNum = parseFloat(fixed) || 0;
    const initialExpensesNum = parseFloat(initialExpenses) || 0;

    await setConfig(
      {
        income: monthlyIncome,
        fixedExpenses: fixedNum,
        savingsPercentage: savings,
      },
      initialExpensesNum,
    );
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      finishOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return {
    step,
    setStep, // Exposed for direct manipulation if needed, basically for back button in UI if logic stays there, but provided helper handleBack too
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
  };
};
